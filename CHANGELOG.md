---
type: doc
doc: changelog
updated: 2026-01-25
project: gemini-mcp
area: servers
---
# Changelog - gemini-mcp

Gemini CLI wrapper for code review and brainstorming

All notable changes to this server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
