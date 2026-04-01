import { z } from 'zod';
import { UnifiedTool } from './registry.js';

const pingArgsSchema = z.object({
  prompt: z.string().default('').describe("Message to echo"),
});

export const pingTool: UnifiedTool = {
  name: "ping",
  description: "Echo",
  zodSchema: pingArgsSchema,
  prompt: {
    description: "Echo test message with structured response.",
  },
  category: 'simple',
  execute: async (args) => {
    const message = args.prompt || args.message || "Pong!";
    return String(message);
  }
};

const helpArgsSchema = z.object({});

export const helpTool: UnifiedTool = {
  name: "Help",
  description: "receive help information",
  zodSchema: helpArgsSchema,
  prompt: {
    description: "receive help information",
  },
  category: 'simple',
  execute: async () => {
    return `Gemini MCP Tools:
- ask-gemini: Query Gemini for analysis, code review, or general questions. Supports @filepath for single-file inclusion and changeMode for structured edits.
- fetch-chunk: Retrieve cached chunks from a previous changeMode response. Use cacheKey and chunkIndex parameters.
- brainstorm: Generate creative ideas using structured methodologies (SCAMPER, Design Thinking, Divergent, etc.).
- ping: Echo test (health check).
- Help: This help text.`;
  }
};
