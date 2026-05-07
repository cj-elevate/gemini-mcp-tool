import { GoogleGenAI, ThinkingLevel as SDKThinkingLevel } from '@google/genai';
import { readFileSync, existsSync, realpathSync, statSync } from 'fs';
import { resolve, extname } from 'path';
import { Logger } from './logger.js';
import {
  ERROR_MESSAGES,
  ERROR_CODES,
  STATUS_MESSAGES,
  MODELS,
  SDK,
  TIMEOUTS,
} from '../constants.js';

import { parseChangeModeOutput, validateChangeModeEdits } from './changeModeParser.js';
import { formatChangeModeResponse, summarizeChangeModeEdits } from './changeModeTranslator.js';
import { chunkChangeModeEdits } from './changeModeChunker.js';
import { cacheChunks, getChunks } from './chunkCache.js';

// ---------------------------------------------------------------------------
// SDK Client (lazy singleton)
// ---------------------------------------------------------------------------

let _client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!_client) {
    const apiKey = process.env[SDK.API_KEY_ENV];
    if (!apiKey) {
      throw new Error(
        `Missing ${SDK.API_KEY_ENV} environment variable. Set it in your MCP server config.`
      );
    }
    _client = new GoogleGenAI({ apiKey });
    Logger.debug('GoogleGenAI SDK client initialized');
  }
  return _client;
}

// ---------------------------------------------------------------------------
// @filepath preprocessor
// ---------------------------------------------------------------------------

// Max file size for @filepath inlining (1 MB)
const MAX_INLINE_FILE_SIZE = 1_048_576;

/**
 * Resolve @filepath references by reading files and inlining their content.
 * The CLI handled this internally; the SDK is a text API so we do it here.
 *
 * Security: validates paths look like real files, prevents directory traversal,
 * and caps file size to prevent memory exhaustion.
 */
function preprocessFileReferences(prompt: string): string {
  return prompt.replace(/@(\S+)/g, (match, filePath: string) => {
    // Skip non-file @ patterns
    if (
      filePath.startsWith('{') ||   // JSON-like
      filePath.startsWith('(') ||   // grouped
      filePath.includes('@') ||     // email-like (user@domain)
      filePath.startsWith('/') && filePath.includes(':') || // URL-like
      filePath.length < 3 ||        // too short to be a file
      !looksLikeFilePath(filePath)  // must have extension or path separator
    ) {
      return match;
    }

    try {
      const resolved = resolve(filePath);
      // Prevent directory traversal: resolved path must not escape via ..
      const real = realpathSync(resolved);
      if (real !== resolved && real.includes('..')) {
        Logger.debug(`Rejected traversal attempt: ${filePath}`);
        return match;
      }

      if (!existsSync(real)) return match;

      // Cap file size
      const stats = statSync(real);
      if (!stats.isFile() || stats.size > MAX_INLINE_FILE_SIZE) {
        Logger.debug(`Skipping @ref: ${filePath} (${stats.isFile() ? `${stats.size} bytes` : 'not a file'})`);
        return match;
      }

      const content = readFileSync(real, 'utf-8');
      Logger.debug(`Inlined file reference: ${filePath} (${content.length} chars)`);
      return `--- FILE: ${filePath} ---\n${content}\n---`;
    } catch {
      Logger.debug(`Could not read file reference: ${filePath}`);
    }
    return match;
  });
}

/**
 * Heuristic: does the string look like a file path?
 * Must have a file extension OR contain a path separator.
 */
function looksLikeFilePath(s: string): boolean {
  // Has a recognized extension
  const ext = extname(s);
  if (ext && ext.length > 1 && ext.length < 8) return true;
  // Has path separators (forward or back slash)
  if (s.includes('/') || s.includes('\\')) return true;
  return false;
}

// ---------------------------------------------------------------------------
// ChangeMode prompt builder
// ---------------------------------------------------------------------------

function buildChangeModePrompt(userPrompt: string): string {
  return `
[CHANGEMODE INSTRUCTIONS]
You are generating code modifications that will be processed by an automated system. The output format is critical because it enables programmatic application of changes without human intervention.

INSTRUCTIONS:
1. Analyze each provided file thoroughly
2. Identify locations requiring changes based on the user request
3. For each change, output in the exact format specified
4. The OLD section must be EXACTLY what appears in the file (copy-paste exact match)
5. Provide complete, directly replacing code blocks
6. Verify line numbers are accurate

CRITICAL REQUIREMENTS:
1. Output edits in the EXACT format specified below - no deviations
2. The OLD string MUST be findable with Ctrl+F - it must be a unique, exact match
3. Include enough surrounding lines to make the OLD string unique
4. If a string appears multiple times (like </div>), include enough context lines above and below to make it unique
5. Copy the OLD content EXACTLY as it appears - including all whitespace, indentation, line breaks
6. Never use partial lines - always include complete lines from start to finish

OUTPUT FORMAT (follow exactly):
**FILE: [filename]:[line_number]**
\`\`\`
OLD:
[exact code to be replaced - must match file content precisely]
NEW:
[new code to insert - complete and functional]
\`\`\`

EXAMPLE 1 - Simple unique match:
**FILE: src/utils/helper.js:100**
\`\`\`
OLD:
function getMessage() {
  return "Hello World";
}
NEW:
function getMessage() {
  return "Hello Universe!";
}
\`\`\`

EXAMPLE 2 - Common tag needing context:
**FILE: index.html:245**
\`\`\`
OLD:
        </div>
      </div>
    </section>
NEW:
        </div>
      </footer>
    </section>
\`\`\`

IMPORTANT: The OLD section must be an EXACT copy from the file that can be found with Ctrl+F!

USER REQUEST:
${userPrompt}
`;
}

// ---------------------------------------------------------------------------
// Error classification — fail-closed, no silent fallback
// ---------------------------------------------------------------------------

export type ThinkingLevel = 'MINIMAL' | 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * Classify a Gemini API error into a stable error code for machine detection.
 * Returns [code, retryable, actionMessage].
 */
export function classifyError(error: unknown): {
  code: string;
  retryable: boolean;
  message: string;
} {
  const msg = error instanceof Error ? error.message : String(error);
  const status = (typeof error === 'object' && error !== null && 'status' in error)
    ? (error as { status: number }).status
    : undefined;

  // Check rateLimitExceeded BEFORE generic 429 to distinguish rate limiting from quota exhaustion
  if (msg.includes(ERROR_MESSAGES.RATE_LIMITED)) {
    return {
      code: ERROR_CODES.RATE_LIMITED,
      retryable: true,
      message: `[${ERROR_CODES.RATE_LIMITED}] Gemini rate limit hit for ${MODELS.PRO}. Retry after a brief pause.`,
    };
  }
  if (msg.includes(ERROR_MESSAGES.RESOURCE_EXHAUSTED) || msg.includes('429') || status === 429) {
    return {
      code: ERROR_CODES.QUOTA_EXHAUSTED,
      retryable: true,
      message: `[${ERROR_CODES.QUOTA_EXHAUSTED}] Gemini quota exceeded for ${MODELS.PRO}. No fallback attempted. Wait and retry, or check Google AI quota limits.`,
    };
  }
  if (msg.includes(ERROR_MESSAGES.UNAVAILABLE) || msg.includes('503') || msg.includes('500') || status === 503 || status === 500) {
    return {
      code: ERROR_CODES.OVERLOADED,
      retryable: true,
      message: `[${ERROR_CODES.OVERLOADED}] Gemini API is currently overloaded or unavailable. Retry later.`,
    };
  }
  if (msg.includes(ERROR_MESSAGES.UNAUTHENTICATED) || msg.includes(ERROR_MESSAGES.PERMISSION_DENIED) ||
      msg.includes('401') || msg.includes('403') || status === 401 || status === 403) {
    return {
      code: ERROR_CODES.AUTH_FAILED,
      retryable: false,
      message: `[${ERROR_CODES.AUTH_FAILED}] Gemini authentication or permission failed. Check API key configuration.`,
    };
  }
  if (msg.includes('timed out') || msg.includes('abort')) {
    return {
      code: ERROR_CODES.TIMEOUT,
      retryable: true,
      message: `[${ERROR_CODES.TIMEOUT}] Gemini request timed out. The model may be under heavy load.`,
    };
  }
  return {
    code: ERROR_CODES.UNKNOWN,
    retryable: false,
    message: `[${ERROR_CODES.UNKNOWN}] Gemini request failed: ${msg}`,
  };
}

// ---------------------------------------------------------------------------
// Thinking config — Gemini 3+ only, thinkingLevel API
// ---------------------------------------------------------------------------

/**
 * Build thinkingConfig for Gemini 3+ models.
 * Default: MEDIUM for balanced speed/quality. Callers should override to HIGH
 * for complex tasks (code review, multi-step planning, debugging, math).
 * HIGH adds 90-180s latency and higher cost — reserve for tasks that need it.
 */
export function buildThinkingConfig(
  thinkingLevel?: ThinkingLevel,
): { thinkingLevel: SDKThinkingLevel } {
  // Map our string literals to SDK enum values (they match by string)
  return { thinkingLevel: (thinkingLevel ?? 'MEDIUM') as SDKThinkingLevel };
}

// ---------------------------------------------------------------------------
// Core execution
// ---------------------------------------------------------------------------

/**
 * Stream-generate content from Gemini SDK and collect response text.
 * Reports progress via callback as chunks arrive.
 * Fail-closed: errors propagate with stable error codes, no silent fallback.
 */
async function streamGenerate(
  ai: GoogleGenAI,
  model: string,
  prompt: string,
  onProgress?: (newOutput: string) => void,
  thinkingLevel?: ThinkingLevel,
): Promise<string> {
  const thinkingConfig = buildThinkingConfig(thinkingLevel);

  const startTime = Date.now();
  Logger.debug(`SDK request: model=${model}, prompt=${prompt.length} chars, thinking=${JSON.stringify(thinkingConfig)}, timeout=${TIMEOUTS.GEMINI_REQUEST}ms`);

  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), TIMEOUTS.GEMINI_REQUEST);

  try {
    const stream = await ai.models.generateContentStream({
      model,
      contents: prompt,
      config: {
        abortSignal: controller.signal,
        httpOptions: { timeout: TIMEOUTS.GEMINI_REQUEST },
        thinkingConfig,
      },
    });

    let fullText = '';
    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        onProgress?.(text);
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    Logger.debug(`SDK response: ${fullText.length} chars in ${elapsed}s`);

    if (!fullText) {
      throw new Error('Gemini returned empty response');
    }

    return fullText;
  } catch (error) {
    if (controller.signal.aborted) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      throw new Error(
        `Gemini request timed out after ${elapsed}s (limit: ${TIMEOUTS.GEMINI_REQUEST / 1000}s)`
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutHandle);
  }
}

/**
 * Execute a prompt against the Gemini API via the @google/genai SDK.
 *
 * FAIL-CLOSED: No silent model fallback. If the request fails, it throws
 * a classified error with a stable error code prefix for machine detection.
 *
 * Handles:
 * - @filepath preprocessing (reads files inline)
 * - changeMode prompt wrapping
 * - Streaming with onProgress callbacks
 * - Thinking config (thinkingLevel, default MEDIUM)
 */
export async function executeGemini(
  prompt: string,
  options?: {
    model?: string;
    changeMode?: boolean;
    onProgress?: (newOutput: string) => void;
    thinkingLevel?: ThinkingLevel;
  }
): Promise<string> {
  const { model, changeMode, onProgress, thinkingLevel } = options ?? {};
  const ai = getClient();

  let processedPrompt = prompt;

  // Convert file: references to @path (changeMode convention)
  if (changeMode) {
    processedPrompt = processedPrompt.replace(/file:(\S+)/g, '@$1');
  }

  // Resolve @filepath references by reading files inline
  processedPrompt = preprocessFileReferences(processedPrompt);

  // Wrap in changeMode instructions if needed
  if (changeMode) {
    processedPrompt = buildChangeModePrompt(processedPrompt);
  }

  const targetModel = model || MODELS.PRO;

  Logger.debug('Executing Gemini SDK request', {
    model: targetModel,
    promptLength: processedPrompt.length,
    changeMode: !!changeMode,
    thinkingLevel: thinkingLevel ?? 'MEDIUM',
  });

  const MAX_RETRIES = 2;
  const BASE_DELAY_MS = 1000;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await streamGenerate(ai, targetModel, processedPrompt, onProgress, thinkingLevel);
    } catch (error) {
      const classified = classifyError(error);

      if (classified.retryable && attempt < MAX_RETRIES) {
        const delayMs = BASE_DELAY_MS * Math.pow(2, attempt);
        Logger.warn(`Gemini request failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying in ${delayMs}ms`, {
          model: targetModel, code: classified.code,
        });
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }

      Logger.error(`Gemini request failed: ${classified.code}`, {
        model: targetModel, retryable: classified.retryable, attempts: attempt + 1,
      });
      throw new Error(classified.message);
    }
  }

  throw new Error('Unreachable');
}

// ---------------------------------------------------------------------------
// ChangeMode output processing (unchanged - transport-agnostic)
// ---------------------------------------------------------------------------

export async function processChangeModeOutput(
  rawResult: string,
  chunkIndex?: number,
  chunkCacheKey?: string,
  prompt?: string
): Promise<string> {
  // Check for cached chunks first
  if (chunkIndex && chunkCacheKey) {
    const cachedChunks = getChunks(chunkCacheKey);
    if (cachedChunks && chunkIndex > 0 && chunkIndex <= cachedChunks.length) {
      Logger.debug(`Using cached chunk ${chunkIndex} of ${cachedChunks.length}`);
      const chunk = cachedChunks[chunkIndex - 1];
      let result = formatChangeModeResponse(
        chunk.edits,
        { current: chunkIndex, total: cachedChunks.length, cacheKey: chunkCacheKey }
      );

      // Add summary for first chunk only
      if (chunkIndex === 1 && chunk.edits.length > 5) {
        const allEdits = cachedChunks.flatMap(c => c.edits);
        result = summarizeChangeModeEdits(allEdits) + '\n\n' + result;
      }

      return result;
    }
    Logger.debug(`Cache miss or invalid chunk index, processing new result`);
  }

  // Parse OLD/NEW format
  const edits = parseChangeModeOutput(rawResult);

  if (edits.length === 0) {
    return `No edits found in Gemini's response. Please ensure Gemini uses the OLD/NEW format. \n\n+ ${rawResult}`;
  }

  // Validate edits
  const validation = validateChangeModeEdits(edits);
  if (!validation.valid) {
    return `Edit validation failed:\n${validation.errors.join('\n')}`;
  }

  const chunks = chunkChangeModeEdits(edits);

  // Cache if multiple chunks and we have the original prompt
  let cacheKey: string | undefined;
  if (chunks.length > 1 && prompt) {
    cacheKey = cacheChunks(prompt, chunks);
    Logger.debug(`Cached ${chunks.length} chunks with key: ${cacheKey}`);
  }

  // Return requested chunk or first chunk
  const returnChunkIndex = (chunkIndex && chunkIndex > 0 && chunkIndex <= chunks.length) ? chunkIndex : 1;
  const returnChunk = chunks[returnChunkIndex - 1];

  // Format the response
  let result = formatChangeModeResponse(
    returnChunk.edits,
    chunks.length > 1 ? { current: returnChunkIndex, total: chunks.length, cacheKey } : undefined
  );

  // Add summary if helpful (only for first chunk)
  if (returnChunkIndex === 1 && edits.length > 5) {
    result = summarizeChangeModeEdits(edits, chunks.length > 1) + '\n\n' + result;
  }

  Logger.debug(`ChangeMode: Parsed ${edits.length} edits, ${chunks.length} chunks, returning chunk ${returnChunkIndex}`);
  return result;
}
