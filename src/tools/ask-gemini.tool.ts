import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { executeGeminiCLI, processChangeModeOutput } from '../utils/geminiExecutor.js';
import {
  ERROR_MESSAGES,
  STATUS_MESSAGES
} from '../constants.js';

const askGeminiArgsSchema = z.object({
  prompt: z.string().min(1).describe("Analysis request. Use @ syntax to include files (e.g., '@largefile.js explain what this does') or ask general questions"),
  // MODEL PARAMETER REMOVED - Always uses gemini-3-pro-preview (hardcoded default)
  // Auto-fallback to gemini-2.5-flash on quota errors is handled internally
  sandbox: z.boolean().default(false).describe("Use sandbox mode (-s flag) to safely test code changes, execute scripts, or run potentially risky operations in an isolated environment"),
  changeMode: z.boolean().default(false).describe("Enable structured change mode - formats prompts to prevent tool errors and returns structured edit suggestions that Claude can apply directly"),
  chunkIndex: z.union([z.number(), z.string()]).optional().describe("Which chunk to return (1-based)"),
  chunkCacheKey: z.string().optional().describe("Optional cache key for continuation"),
  workingDirectory: z.string().optional().describe("Working directory to run Gemini from. Use drive root (e.g., 'C:/' or 'D:/') to access files on that drive."),
});

export const askGeminiTool: UnifiedTool = {
  name: "ask-gemini",
  description: "Query Gemini (gemini-3-pro-preview). Supports sandbox [-s] and changeMode for structured edits.",
  zodSchema: askGeminiArgsSchema,
  prompt: {
    description: "Execute 'gemini -p <prompt>' to get Gemini AI's response. Supports enhanced change mode for structured edit suggestions.",
  },
  category: 'gemini',
  execute: async (args, onProgress) => {
    const { prompt, sandbox, changeMode, chunkIndex, chunkCacheKey, workingDirectory } = args;

    // MODEL PARAMETER IGNORED - Always use default gemini-3-pro-preview
    // If caller somehow passes model, we ignore it and log warning
    if (args.model) {
      console.warn(`[GEMINI-MCP] WARNING: model parameter "${args.model}" ignored. Always using gemini-3-pro-preview. Remove model parameter from your call.`);
    }

    if (!prompt?.trim()) { throw new Error(ERROR_MESSAGES.NO_PROMPT_PROVIDED); }

    if (changeMode && chunkIndex && chunkCacheKey) {
      return processChangeModeOutput(
        '', // empty for cache...
        chunkIndex as number,
        chunkCacheKey as string,
        prompt as string
      );
    }

    // Always pass undefined for model - executor uses hardcoded default
    const result = await executeGeminiCLI(
      prompt as string,
      undefined, // ALWAYS use default model
      !!sandbox,
      !!changeMode,
      onProgress,
      workingDirectory as string | undefined
    );

    if (changeMode) {
      return processChangeModeOutput(
        result,
        args.chunkIndex as number | undefined,
        undefined,
        prompt as string
      );
    }
    return `${STATUS_MESSAGES.GEMINI_RESPONSE}\n${result}`; // changeMode false
  }
};
