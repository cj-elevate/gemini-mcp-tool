---
type: doc
doc: troubleshooting
updated: 2026-01-25
project: gemini-mcp
area: servers
---
# Troubleshooting Log - gemini-mcp

Gemini CLI wrapper for code review and brainstorming

## Quick Reference

| Date | Issue | Status |
|------|-------|--------|
| 2026-01-25 | Flag injection: prompts with "-J" text interpreted as CLI flags | Fixed |
| 2025-12-27 | -m flag causes silent fallback to Flash models | Fixed |
| 2025-12-15 | Gemini CLI Freezing on Complex Queries | Fixed |


---

## 2026-01-25: Flag Injection - Prompts with "-J" Text Interpreted as CLI Flags

**Status:** Fixed

**Symptoms:**
Error: `Command failed with exit code 1: Unknown argument: J` when prompts contain text like "ProxyJump" or any dash-prefixed words. The Gemini CLI interprets "-J" as a command-line flag instead of prompt content.

**Root Cause:**
When `shell: true` is used in `spawn()`, command-line arguments are parsed by the shell. Single-line prompts were passed as positional arguments, so any dash-prefixed words in the prompt (like "-J" in "ProxyJump", "--help", etc.) were interpreted as CLI flags rather than prompt content.

**Fix:**
Changed from conditional stdin (multiline prompts only) to **always-stdin** approach. All prompts are now written to stdin, preventing any prompt content from being parsed as command-line arguments.

**Files Changed:**
- `src/utils/geminiExecutor.ts` - Removed `hasNewlines` check, always set `stdinInput`
- `tsconfig.json` - Updated exclude patterns to use glob syntax (`node_modules/**`, `dist/**`)

**Verification:**
Test with prompt containing "ProxyJump" or "-J" - no longer throws "Unknown argument" error.

**Technical Note:**
The build issue was caused by `npx tsc` not working properly on Git Bash. Solution: use `./node_modules/.bin/tsc.cmd` directly on Windows.

---

## 2025-12-27: -m Model Flag Causes Silent Fallback to Flash

**Status:** Fixed

**Symptoms:**
Model self-reports as `gemini-2.0-flash-exp` even though settings.json specifies `gemini-3-pro-preview`. User thought they were using Gemini 3 Pro but was actually getting Flash responses.

**Root Cause:**
The Gemini CLI has a bug where passing `-m gemini-3-pro-preview` explicitly via command line causes silent fallback to Flash models. However, if NO `-m` flag is passed, the CLI correctly uses the model from `~/.gemini/settings.json`.

geminiExecutor.ts was always passing `-m` flag, overriding the working settings.json configuration.

**Fix:**
Removed automatic `-m` flag injection from geminiExecutor.ts. Now the CLI uses settings.json model selection (which works correctly). The `-m` flag is only passed if explicitly requested.

**Files Changed:**
- `src/utils/geminiExecutor.ts` - Removed automatic model flag
- `~/.gemini/settings.json` - Ensure `previewFeatures: true` is set

**Verification:**
Ask model "What model are you?" - Gemini 3 Pro responds "I am Gemini, a large language model built by Google. I don't have a specific version number." Flash models report their exact identifier.

**Key Settings Required:**
```json
{
  "general": { "previewFeatures": true },
  "model": { "name": "gemini-3-pro-preview" }
}
```

---

## 2025-12-15: Gemini CLI Freezing on Complex Queries

**Status:** Fixed

**Symptoms:**
Multi-file code reviews hang indefinitely. No timeout, no error.

**Root Cause:**
commandExecutor.ts had no timeout mechanism - child processes could hang forever.

**Fix:**
Added timeout mechanism: SIGTERM after timeout, SIGKILL after 5s if not terminated. Set GEMINI_CLI timeout to 5 minutes.

**Files Changed:**
- `src/utils/commandExecutor.ts`
- `src/constants.ts`

**Verification:**
Complex queries complete successfully with proper timeout handling.

---

## How to Add New Issues

When troubleshooting this server, add entries in this format:

```markdown
## YYYY-MM-DD: Brief Issue Title

**Status:** Fixed | In Progress | Waiting for X

**Symptoms:**
What the user sees/experiences

**Root Cause:**
Why it happens

**Fix:**
What was done (or needs to be done)

**Files Changed:**
- `path/to/file.ts`

**Verification:**
How we confirmed it works
```
