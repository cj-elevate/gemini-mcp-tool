

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
  // User-facing messages
  QUOTA_EXCEEDED_SHORT: "Gemini Pro quota exceeded. Falling back to Flash model.",
  TOOL_NOT_FOUND: "not found in registry",
  NO_PROMPT_PROVIDED: "Please provide a prompt for analysis. Use @ syntax to include files (e.g., '@largefile.js explain what this does') or ask general questions",
} as const;

// Status messages
export const STATUS_MESSAGES = {
  QUOTA_SWITCHING: "Gemini Pro quota exceeded, switching to Flash model...",
  FLASH_RETRY: "Retrying with Gemini Flash...",
  FLASH_SUCCESS: "✅ Flash model completed successfully",
  GEMINI_RESPONSE: "Gemini response:",
  // Timeout prevention messages
  PROCESSING_START: "🔍 Starting analysis (may take 5-15 minutes for large codebases)",
  PROCESSING_CONTINUE: "⏳ Still processing... Gemini is working on your request",
  PROCESSING_COMPLETE: "✅ Analysis completed successfully",
} as const;

// Models (SDK-compatible names)
export const MODELS = {
  PRO: "gemini-3-pro-preview",
  FLASH: "gemini-2.5-flash",
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


// Timeout Constants
export const TIMEOUTS = {
  GEMINI_REQUEST: 110000, // 110s — must be < proxy's 120s BACKEND_TIMEOUT to fail gracefully before proxy kills it
} as const;


// (merged PromptArguments and ToolArguments)
export interface ToolArguments {
  prompt?: string;
  model?: string;
  changeMode?: boolean | string;
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