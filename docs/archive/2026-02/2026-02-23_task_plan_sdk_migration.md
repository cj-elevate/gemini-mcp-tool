---
type: task_plan
status: archived
project: gemini-mcp
created: 2026-02-22
updated: 2026-02-23
archived: 2026-02-23
archived_from: docs/task_plan_sdk_migration.md
---

# Gemini MCP: SDK Migration (CLI spawn → @google/genai)

## Context

The gemini-mcp server currently shells out to `gemini` CLI via `child_process.spawn()` for every request. This causes:
- Windows pty crashes (upstream bug google-gemini/gemini-cli#12045)
- Process-spawn overhead (~2-3s per call)
- No programmatic quota/error visibility
- Fragile stdin piping for multiline prompts

Previous session's /team #deep consultation (Perplexity, Codex, Gemini) unanimously recommended replacing the CLI dependency with the `@google/genai` Node SDK - a direct HTTP API client with TypeScript types, streaming support, and proper error objects.

**Scope**: Only the transport layer changes. MCP server, tool schemas, changeMode prompt engineering, and chunk caching all stay intact.

## Files to Modify

| File | Action | Why |
|------|--------|-----|
| `src/utils/geminiExecutor.ts` | **REWRITE** | Replace CLI spawn with SDK `generateContentStream` |
| `src/constants.ts` | **UPDATE** | Update model names, remove CLI constants, add SDK config |
| `src/tools/ask-gemini.tool.ts` | **UPDATE** | Remove `sandbox`/`workingDirectory` params, rename executor call |
| `src/tools/brainstorm.tool.ts` | **UPDATE** | Remove `model` param passthrough, rename executor call |
| `src/tools/simple-tools.ts` | **UPDATE** | Remove CLI dependency - ping returns string, help returns static text |
| `src/utils/commandExecutor.ts` | **DELETE** | No longer needed (was only used by geminiExecutor + simple-tools) |
| `package.json` | **UPDATE** | Add `@google/genai`, remove unused deps |
| `CLAUDE.md` | **UPDATE** | Reflect SDK architecture, remove CLI gotchas |
| `CHANGELOG.md` | **UPDATE** | Document migration |

## Implementation Phases

### Phase 1: Install SDK & update constants
- [x] `npm install @google/genai` (used --legacy-peer-deps for optional MCP SDK peer dep)
- [x] Update `constants.ts`: add `GEMINI_API_KEY` env var name, update `MODELS` to SDK names (`gemini-3-pro-preview`, `gemini-2.5-flash`), remove `CLI.COMMANDS`/`CLI.FLAGS`

### Phase 2: Rewrite geminiExecutor.ts
- [x] Replace `executeGeminiCLI` with `executeGemini` (new name, options object pattern)
- [x] Initialize `GoogleGenAI` client with API key from env (lazy singleton)
- [x] Use `ai.models.generateContentStream()` for streaming progress callbacks
- [x] Keep changeMode prompt engineering as-is (extracted to `buildChangeModePrompt`)
- [x] Keep quota fallback logic: catch 429/RESOURCE_EXHAUSTED → retry with FLASH model
- [x] Add `@filepath` preprocessor: regex-match `@path` references, read files with `fs`, inline content
- [x] Remove `sandbox` parameter (was CLI-specific `-s` flag, no SDK equivalent)
- [x] Remove `cwd` parameter (was for CLI process working directory)
- [x] Keep `processChangeModeOutput` unchanged (transport-agnostic)

### Phase 3: Update tool files
- [x] `ask-gemini.tool.ts`: call `executeGemini`, removed `sandbox` and `workingDirectory` from schema
- [x] `brainstorm.tool.ts`: call `executeGemini`, removed unused `model` param
- [x] `simple-tools.ts`: `pingTool` returns message directly, `helpTool` returns static help string
- [x] Removed `sandbox` from `ToolArguments` interface in constants.ts

### Phase 4: Cleanup
- [x] Delete `commandExecutor.ts`
- [x] Remove unused deps: `inquirer`, `chalk`, `prismjs`, `d3-shape`, `ai`, `@types/inquirer` (50+ packages removed)
- [x] Clean up dead imports and unused constants (`TIMEOUTS.SIMPLE_COMMAND`)

### Phase 5: Build & verify
- [x] `npm run build` - compiled clean (zero errors)
- [x] `restart_backend("gemini-cli")` - reloaded successfully
- [x] Test: `search_tools("gemini")` - all 6 tools visible with correct schemas
- [x] Test: `execute_indexed_tool("gemini-cli.ping", {})` - returns "Pong!" (no spawn)
- [x] Test: `execute_indexed_tool("gemini-cli.ask-gemini", { prompt: "say hello" })` - SDK response received
- [x] Test: `execute_indexed_tool("gemini-cli.brainstorm", { prompt: "test", ideaCount: 3 })` - brainstorm works via SDK
- [x] Test: `execute_indexed_tool("gemini-cli.Help", {})` - static help text returned

## Key Design Decisions

**API key source**: `process.env.GEMINI_API_KEY` (already configured in master-mcp-server config as env passthrough). The key `AIzaSyDIBr_...` has access to 43 models including gemini-3-pro-preview.

**Streaming**: `generateContentStream` returns an async iterable. Each chunk's `.text` feeds to `onProgress` callback - same UX as before but without process spawn overhead.

**@ file references**: Simple preprocessor reads `@path` with `fs.readFileSync`, replaces with `--- FILE: path ---\n<content>\n---`. More reliable than CLI's built-in @ handling since we control error messages for missing files.

**Sandbox removal**: The `-s` CLI flag ran Gemini's internal code sandbox. The SDK is a text generation API - it doesn't execute code. Removing this parameter is the honest choice vs. keeping a no-op.

**Error mapping**: SDK throws typed errors. Map `429`/`RESOURCE_EXHAUSTED` to the existing fallback flow (PRO → FLASH). All other errors propagate as-is.

## Risks

- **@ syntax differences**: CLI may have handled `@` in ways we don't replicate exactly. Mitigated by testing with real file references.
- **Model name format**: SDK may want different model strings than CLI. Perplexity research confirmed `gemini-3-pro-preview` works with SDK.
- **Streaming chunk boundaries**: SDK chunks may differ from CLI stdout chunks. Progress callback behavior may feel different but functionally equivalent.
