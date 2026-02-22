---
type: note
updated: 2026-01-03
area: servers
project: gemini-mcp
---
# Gemini MCP Server

Enhanced fork of `jamubc/gemini-mcp-tool` with Windows multi-drive support.

## Problem

Gemini CLI is intentionally locked to the current working directory's drive (security decision by Google, GitHub #1751). This means:

- Running from `D:\` cannot access `C:\` files
- `--include-directories` flag is broken for cross-drive (GitHub #5512)
- `settings.json` `includeDirectories` is ignored
- Symlinks/junctions are resolved and blocked

## Solution

Added `workingDirectory` parameter to the MCP that sets the `cwd` for the spawned Gemini process. This allows accessing any drive by spawning Gemini from that drive's root.

## Repository

| Repo | URL |
|------|-----|
| Upstream | https://github.com/jamubc/gemini-mcp-tool |
| Fork | https://github.com/cj-elevate/gemini-mcp-tool |
| Local | `D:\servers\gemini-mcp-tool` |
| PR | https://github.com/jamubc/gemini-mcp-tool/pull/43 |

## Fixes Applied

### 1. Windows .cmd Execution
**File:** `src/utils/commandExecutor.ts`

Changed `shell: false` to `shell: true` to allow Node.js to find and execute `gemini.cmd` on Windows.

```typescript
const childProcess = spawn(command, args, {
  env: process.env,
  shell: true,  // Required for Windows .cmd files
  stdio: ["ignore", "pipe", "pipe"],
  cwd: cwd,     // Added for workingDirectory support
});
```

### 2. Deprecated -p Flag
**File:** `src/utils/geminiExecutor.ts`

Gemini CLI deprecated the `-p` flag. Changed to positional prompts with `-y` (YOLO mode) for non-interactive execution.

```typescript
// Before (broken)
const args = [CLI.FLAGS.PROMPT, prompt];

// After (working)
const args = ['-y'];
if (model) { args.push(CLI.FLAGS.MODEL, model); }
if (sandbox) { args.push(CLI.FLAGS.SANDBOX); }
args.push(prompt_processed);  // Positional prompt
```

### 3. workingDirectory Parameter
**File:** `src/tools/ask-gemini.tool.ts`

Added `workingDirectory` to the tool schema:

```typescript
workingDirectory: z.string().optional().describe(
  "Working directory to run Gemini from. Use drive root (e.g., 'C:/' or 'D:/') to access files on that drive."
)
```

## Configuration

**File:** `C:\Users\CJ\.claude.json`

```json
"gemini-cli": {
  "type": "stdio",
  "command": "node",
  "args": ["D:\servers\gemini-mcp-tool\dist\index.js"]
}
```

Uses local build instead of npx to ensure our fixes are applied.

## Available Tools

| Tool | Purpose |
|------|---------|
| `mcp__gemini-cli__ask-gemini` | Main query tool |
| `mcp__gemini-cli__brainstorm` | Creative idea generation |
| `mcp__gemini-cli__ping` | Connection test |
| `mcp__gemini-cli__Help` | CLI help |
| `mcp__gemini-cli__fetch-chunk` | Get cached response chunks |

## ask-gemini Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | string | Yes | Query text. Use `@file` for file references |
| `model` | string | No | Model (default: gemini-2.5-pro) |
| `workingDirectory` | string | No | Drive/directory for file access |
| `sandbox` | boolean | No | Run in isolated sandbox |
| `changeMode` | boolean | No | Get structured edit suggestions |

## Usage Examples

### Cross-Drive Access
```javascript
// Access D: drive
mcp__gemini-cli__ask-gemini({
  prompt: "@CLAUDE.md Summarize this",
  workingDirectory: "D:/workspace"
})

// Access C: drive
mcp__gemini-cli__ask-gemini({
  prompt: "List user config files",
  workingDirectory: "C:/Users/CJ"
})
```

### Model Selection
```javascript
// Fast model
mcp__gemini-cli__ask-gemini({
  prompt: "Quick question",
  model: "gemini-2.5-flash"
})
```

### File Analysis
```javascript
mcp__gemini-cli__ask-gemini({
  prompt: "@src/main.ts @package.json Review these files",
  workingDirectory: "D:/projects/myapp"
})
```

## Building

```bash
cd D:/servers/gemini-mcp-tool
npm install
npm run build
```

Output goes to `dist/index.js`.

## Testing

```javascript
// 1. Ping test
mcp__gemini-cli__ping({ prompt: "test" })

// 2. Basic query
mcp__gemini-cli__ask-gemini({ prompt: "What is 2+2?" })

// 3. D: drive access
mcp__gemini-cli__ask-gemini({
  prompt: "List folders",
  workingDirectory: "D:/"
})

// 4. C: drive access
mcp__gemini-cli__ask-gemini({
  prompt: "List folders",
  workingDirectory: "C:/"
})

// 5. File read with @
mcp__gemini-cli__ask-gemini({
  prompt: "@CLAUDE.md How many lines?",
  workingDirectory: "D:/workspace"
})
```

## Related

- **Skill:** `gemini-agent` (v5.0.0)
- **Fallback:** Wrapper scripts in `D:\workspace\bin\` (gemini_c.bat, gemini_d.bat, gemini_e.bat)
- **Settings:** `~/.gemini/settings.json` (write tools disabled)

---

**Created:** 2025-11-30
**Status:** Production
