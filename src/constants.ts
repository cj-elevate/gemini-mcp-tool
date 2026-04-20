

// Logging
export const LOG_PREFIX = "[GMCPT]";

// Error messages
export const ERROR_MESSAGES = {
  // SDK error codes (match against error.message or error.status)
  RESOURCE_EXHAUSTED: "RESOURCE_EXHAUSTED",   // Quota exceeded (429)
  RATE_LIMITED: "rateLimitExceeded",           // Rate limit hit
  UNAUTHENTICATED: "UNAUTHENTICATED",         // Bad or missing API key
  PERMISSION_DENIED: "PERMISSION_DENIED",      // Model access denied
  UNAVAILABLE: "UNAVAILABLE",                  // Service temporarily down
  // User-facing messages (fail-closed — no silent fallback)
  TOOL_NOT_FOUND: "not found in registry",
  NO_PROMPT_PROVIDED: "Please provide a prompt for analysis. Use @ syntax to include files (e.g., '@largefile.js explain what this does') or ask general questions",
} as const;

// Stable error codes for machine detection (proxy, hooks, /team synthesis)
export const ERROR_CODES = {
  QUOTA_EXHAUSTED: "GEMINI_QUOTA_EXHAUSTED",
  RATE_LIMITED: "GEMINI_RATE_LIMITED",
  OVERLOADED: "GEMINI_OVERLOADED",
  AUTH_FAILED: "GEMINI_AUTH_FAILED",
  TIMEOUT: "GEMINI_TIMEOUT",
  UNKNOWN: "GEMINI_ERROR",
} as const;

// Status messages
export const STATUS_MESSAGES = {
  GEMINI_RESPONSE: "Gemini response:",
  // Timeout prevention messages
  PROCESSING_START: "Starting analysis (may take 1-5 minutes with deep reasoning)",
  PROCESSING_CONTINUE: "Still processing... Gemini is working on your request",
  PROCESSING_COMPLETE: "Analysis completed successfully",
} as const;

// Models — Gemini 3+ only. No automatic fallback. Fail-closed.
export const MODELS = {
  PRO: "gemini-3.1-pro-preview",
} as const;

// SDK Configuration
export const SDK = {
  API_KEY_ENV: "GEMINI_API_KEY",
} as const;

// MCP Protocol Constants
export const PROTOCOL = {
  // Message roles
  ROLES: {
    USER: "user",
    ASSISTANT: "assistant",
  },
  // Content types
  CONTENT_TYPES: {
    TEXT: "text",
  },
  // Status codes
  STATUS: {
    SUCCESS: "success",
    ERROR: "error",
    FAILED: "failed",
    REPORT: "report",
  },
  // Notification methods
  NOTIFICATIONS: {
    PROGRESS: "notifications/progress",
  },
  // Timeout prevention
  KEEPALIVE_INTERVAL: 25000, // 25 seconds
} as const;


// Timeout Constants — Gemini 3 with thinking enabled needs longer timeouts
export const TIMEOUTS = {
  GEMINI_REQUEST: 300000, // 300s — Gemini 3 with HIGH thinking can take 60-120s, 300s covers tail latency
} as const;


// (merged PromptArguments and ToolArguments)
export interface ToolArguments {
  prompt?: string;
  model?: string;
  changeMode?: boolean | string;
  thinkingLevel?: string; // MINIMAL | LOW | MEDIUM | HIGH
  chunkIndex?: number | string; // Which chunk to return (1-based)
  chunkCacheKey?: string; // Optional cache key for continuation
  message?: string; // For Ping tool -- Un-used.
  
  // --> new tool
  methodology?: string; // Brainstorming framework to use
  domain?: string; // Domain context for specialized brainstorming
  constraints?: string; // Known limitations or requirements
  existingContext?: string; // Background information to build upon
  ideaCount?: number; // Target number of ideas to generate
  includeAnalysis?: boolean; // Include feasibility and impact analysis
  
  [key: string]: string | boolean | number | undefined; // Allow additional properties
}