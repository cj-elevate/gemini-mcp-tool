---
type: doc
doc: changelog
updated: 2026-02-23
project: gemini-mcp
area: servers
---
# Changelog - gemini-mcp

Gemini CLI wrapper for code review and brainstorming

All notable changes to this server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [2026-02-23] - SDK Migration

### Changed
- **BREAKING:** Replaced CLI `child_process.spawn` with `@google/genai` Node SDK (v1.42+)
- `executeGeminiCLI` renamed to `executeGemini` with options object pattern
- Model default is now `gemini-3-pro-preview` (configured in constants.ts, not settings.json)
- Streaming via `ai.models.generateContentStream()` instead of stdout parsing
- `@filepath` references now preprocessed inline (SDK is text-only, no CLI @ handling)
- Node engine requirement bumped from >=16 to >=18

### Added
- `@google/genai` SDK dependency for direct Gemini API access
- Dual timeout: `httpOptions.timeout` (connection) + `AbortController` (total duration)
- `@filepath` security: path validation, traversal prevention, 1MB size cap
- SDK error codes in constants: RESOURCE_EXHAUSTED, RATE_LIMITED, UNAUTHENTICATED, PERMISSION_DENIED, UNAVAILABLE
- Static help text in help tool (no longer spawns CLI)

### Removed
- `commandExecutor.ts` (CLI process spawner) - deleted entirely
- `sandbox` parameter from ask-gemini tool (was CLI `-s` flag, no SDK equivalent)
- `workingDirectory` parameter from ask-gemini tool (was CLI cwd)
- `model` parameter from brainstorm tool (always uses PRO with auto-fallback)
- Unused dependencies: `inquirer`, `chalk`, `prismjs`, `d3-shape`, `ai`, `@types/inquirer`
- CLI constants (COMMANDS, FLAGS, DEFAULTS)

### Security
- `@filepath` preprocessor validates paths look like real files, uses `realpathSync` for traversal prevention, caps at 1MB

## [2026-01-25]

### Fixed
- **Security:** Flag injection vulnerability - prompts containing text like "-J" (e.g., "ProxyJump") were interpreted as CLI flags
- All prompts now use stdin exclusively, preventing any prompt content from being parsed as command-line arguments
- Updated `tsconfig.json` exclude patterns with glob syntax (`node_modules/**`, `dist/**`) for proper file resolution

### Security
- **Flag Injection Prevention:** Changed from conditional stdin (multiline only) to always-stdin approach
- This prevents shell parsing of prompt content that could be mistaken for CLI flags

## [2025-12-27]

### Fixed
- **Critical:** Removed automatic `-m` model flag that caused silent fallback to Flash models
- Gemini 3 Pro Preview now works correctly through MCP (uses settings.json)

### Changed
- Model selection now relies on `~/.gemini/settings.json` instead of CLI flags
- Added conditional model flag (only passed if explicitly requested)

## [2025-12-15]

### Added
- Process timeout mechanism with SIGTERM/SIGKILL

### Added
- TIMEOUTS constants (GEMINI_CLI: 5min, SIMPLE_COMMAND: 30s)


---

## How to Add Entries

When making changes to this server, add entries under today's date:

```markdown
## [YYYY-MM-DD]

### Added
- New feature description

### Changed
- What was modified

### Fixed
- Bug that was fixed

### Removed
- What was removed

### Security
- Security-related changes
```
