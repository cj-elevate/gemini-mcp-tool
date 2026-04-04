---
type: handoff
project: gemini-mcp
session_id: 20260404-0303-7fd8de14
created: 2026-04-04T03:03:00Z
status: in_progress
lifecycle_state: active
workstream: main
phase: maintenance
updated: 2026-04-03 23:03 ET
next_action: Monitor MCP-006 — verify crash handlers capture next Gemini failure with full stack trace
blocker: none
routing:
  method: explicit
  confidence: high
  score: 1.00
  signals:
    recency: 1.0
    git_dirty: 1.0
    conversation: 1.0
    active_plan: 0.0
    has_handoff_dir: 1.0
  runner_up: none
hot_files:
  - D:/servers/gemini-mcp/src/index.ts
  - D:/servers/gemini-mcp/src/index.test.ts
  - D:/servers/gemini-mcp/src/utils/geminiExecutor.ts
  - D:/servers/gemini-mcp/src/constants.ts
  - D:/servers/master-mcp-server/src/types/config.ts
context_summary: "Fixed intermittent gemini-cli STDIO crashes during /team consult. Two fixes: bumped proxy inactivityTimeoutMs 90s->180s, added process-level crash handlers (unhandledRejection + uncaughtException) to gemini-mcp. Debug session MCP-006 filed."
review:
  score: 0
  tier: info
  action: reviewed
  reviewed_by: codex,gemini
schema_version: 1
---

# You Are Here
Investigating and fixing intermittent gemini-cli STDIO backend crashes during /team consult calls. Two root causes identified and fixed. Monitoring for recurrence via MCP-006 debug session.

# This Session
- Diagnosed 3 auto-incident files from tonight showing "STDIO server gemini-cli process closed"
- Root cause 1: Stall watchdog inactivityTimeoutMs (90s) shorter than Gemini 3.1 Pro silent thinking window (90-120s on large prompts)
- Root cause 2: No crash handlers in gemini-mcp — unhandled SDK rejections killed the process silently
- Team consulted twice (Codex + Gemini): confirmed 180s timeout, confirmed known @google/genai SDK crash modes
- Gemini crashed during its own review consult (ironic), proving the issue is real and intermittent

# State Changes
* **inactivityTimeoutMs (gemini-cli)**: 90s -> 180s
* **crash handlers**: none -> unhandledRejection + uncaughtException with [GMCPT] [FATAL] JSON logging
* **test coverage**: 16 tests -> 19 tests (3 crash handler tests added)
* **debug session**: none -> MCP-006 (investigating)

# Hot Files
- D:/servers/gemini-mcp/src/index.ts
- D:/servers/gemini-mcp/src/index.test.ts
- D:/servers/master-mcp-server/src/types/config.ts

# Resume
- Monitor proxy logs for [GMCPT] [FATAL] entries — next crash will have full stack trace
- Debug session: D:/workspace/docs/debug/sessions/MCP-006-gemini-stdio-crash/session.md
- Future improvements: stderr ring buffer in proxy, startup vs stream timeout split, request correlation IDs
