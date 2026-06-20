import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { executeGemini, processChangeModeOutput } from '../utils/geminiExecutor.js';
import {
  ERROR_MESSAGES,
  STATUS_MESSAGES
} from '../constants.js';
import type { ThinkingLevel } from '../utils/geminiExecutor.js';

const askGeminiArgsSchema = z.object({
  prompt: z.string().min(1).describe("Analysis request. Use @ syntax to include files (e.g., '@largefile.js explain what this does') or ask general questions"),
  changeMode: z.boolean().default(false).describe("Enable structured change mode - formats prompts to prevent tool errors and returns structured edit suggestions that Claude can apply directly"),
  thinkingLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().describe("Thinking/reasoning depth. Default: MEDIUM (balanced). Use HIGH for complex tasks (code review, multi-step planning, debugging, math, architecture decisions). Use LOW for simple Q&A or formatting where speed matters"),
  chunkIndex: z.union([z.number(), z.string()]).optional().describe("Which chunk to return (1-based)"),
  chunkCacheKey: z.string().optional().describe("Optional cache key for continuation"),
});

export const askGeminiTool: UnifiedTool = {
  name: "ask-gemini",
  description: "Query Gemini (gemini-3.1-pro-preview, thinking: MEDIUM default, HIGH for complex tasks). Fail-closed: no silent fallback.",
  zodSchema: askGeminiArgsSchema,
  prompt: {
    description: "Query Gemini for analysis, code review, or general questions. Supports changeMode for structured edit suggestions.",
  },
  category: 'gemini',
  execute: async (args, onProgress) => {
    const { prompt, changeMode, thinkingLevel, chunkIndex, chunkCacheKey } = args;

    if (!prompt?.trim()) { throw new Error(ERROR_MESSAGES.NO_PROMPT_PROVIDED); }

    if (changeMode && chunkIndex && chunkCacheKey) {
      return processChangeModeOutput(
        '', // empty for cache lookup
        chunkIndex as number,
        chunkCacheKey as string,
        prompt as string
      );
    }

    const result = await executeGemini(
      prompt as string,
      {
        changeMode: !!changeMode,
        onProgress,
        thinkingLevel: thinkingLevel as ThinkingLevel | undefined,
      }
    );

    if (changeMode) {
      return processChangeModeOutput(
        result,
        args.chunkIndex as number | undefined,
        undefined,
        prompt as string
      );
    }
    return `${STATUS_MESSAGES.GEMINI_RESPONSE}\n${result}`;
  }
};
