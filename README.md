---
type: doc
doc: readme
updated: 2026-03-10
project: gemini-mcp
area: servers
---

# Gemini MCP Tool (Enhanced Fork)

<div align="center">

[![GitHub Release](https://img.shields.io/github/v/release/jamubc/gemini-mcp-tool?logo=github&label=GitHub)](https://github.com/jamubc/gemini-mcp-tool/releases)
[![npm version](https://img.shields.io/npm/v/gemini-mcp-tool)](https://www.npmjs.org/package/gemini-mcp-tool)
[![npm downloads](https://img.shields.io/npm/dt/gemini-mcp-tool)](https://www.npmjs.org/package/gemini-mcp-tool)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-red.svg)](https://github.com/cj-elevate/gemini-mcp-tool)
[![Windows](https://img.shields.io/badge/Windows-Multi--Drive%20Support-0078D6?logo=windows)](https://github.com/cj-elevate/gemini-mcp-tool)

</div>

> **Direct @google/genai SDK integration** - Native streaming, no CLI dependency, Windows multi-drive support via `@filepath` preprocessor.

An MCP server that provides AI assistants with direct access to [Google's Gemini API](https://github.com/google/generative-ai-js) via the `@google/genai` SDK. Leverage Gemini's massive context window for large file analysis and multi-agent collaboration.

## What This Fork Adds

| Feature | Description |
|---------|-------------|
| **SDK-Native Architecture** | Uses `@google/genai` directly — no CLI subprocess, streaming via `generateContentStream()` |
| **@filepath Preprocessor** | Inline file contents into prompts using `@path/to/file.js` syntax (single files only) |
| **Quota Fallback** | Auto-downgrades from Pro to Flash on rate limit (429) |
| **ChangeMode Support** | Structured code edits with chunked responses for large changesets |
| **Progress Notifications** | MCP progress tokens provide periodic streaming updates (25s interval) |

### Quick Example
```javascript
// Inline a single file
ask-gemini({ prompt: "Analyze @C:/Users/Me/project/README.md" })

// Multi-drive support works seamlessly
ask-gemini({ prompt: "Review @D:/code/main.ts" })

// ChangeMode for code edits
ask-gemini({ prompt: "Refactor @src/utils.ts to use TypeScript 5 patterns", changeMode: true })
```

<a href="https://glama.ai/mcp/servers/@jamubc/gemini-mcp-tool">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@jamubc/gemini-mcp-tool/badge" alt="Gemini Tool MCP server" />
</a>

## TLDR: [![Claude](https://img.shields.io/badge/Claude-D97757?logo=claude&logoColor=fff)](https://claude.ai) + [![Google Gemini](https://img.shields.io/badge/Google%20Gemini-886FBF?logo=googlegemini&logoColor=fff)](https://ai.google.dev)

**Goal**: Use Gemini's 1M+ token context window directly in Claude Code for large file analysis and multi-agent workflows.

## Prerequisites

Before using this tool, ensure you have:

1. **[Node.js](https://nodejs.org/)** (v18.0.0 or higher)
2. **[Google AI API Key](https://aistudio.google.com/app/apikey)** — Free tier available

> **No CLI required** — This implementation uses the `@google/genai` SDK directly. The `gemini-cli` tool is not needed.

### One-Line Setup

```bash
claude mcp add gemini-mcp -- npx -y gemini-mcp-tool
```

### Verify Installation

Type `/mcp` inside Claude Code to verify the gemini-mcp MCP is active, then use natural language to invoke tools.

---

### Alternative: Import from Claude Desktop

If you already have it configured in Claude Desktop:

1. Add to your Claude Desktop config:
```json
"gemini-mcp": {
  "command": "npx",
  "args": ["-y", "gemini-mcp-tool"],
  "env": {
    "GEMINI_API_KEY": "your-api-key-here"
  }
}
```

2. Import to Claude Code:
```bash
claude mcp add-from-claude-desktop
```

## Configuration

Register the MCP server with your MCP client:

### For NPX Usage (Recommended)

Add this configuration to your Claude Desktop config file:

```json
{
  "mcpServers": {
    "gemini-mcp": {
      "command": "npx",
      "args": ["-y", "gemini-mcp-tool"],
      "env": {
        "GEMINI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### For Global Installation

If you installed globally, use this configuration instead:

```json
{
  "mcpServers": {
    "gemini-mcp": {
      "command": "gemini-mcp-tool",
      "env": {
        "GEMINI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Configuration File Locations:**

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google AI API key from [AI Studio](https://aistudio.google.com/app/apikey) |

Get your key at: https://aistudio.google.com/app/apikey

## Example Workflow

Use natural language to invoke tools:
- "use gemini to explain index.html"
- "understand the massive project using gemini"
- "ask gemini to compare REST vs GraphQL architectures"

## Usage Examples

### With File References (using @ syntax)

- `ask gemini to analyze @src/main.js and explain what it does`
- `use gemini to read @package.json and tell me about dependencies`
- `analyze @D:/projects/other/code.ts and summarize`

**Note:** `@filepath` works with single files only. Directory references (e.g., `@src/`) are not expanded.

### General Questions (without files)

- `ask gemini to search for the latest tech news`
- `use gemini to explain div centering`
- `ask gemini about best practices for React development`

### ChangeMode (Code Edits)

The ChangeMode flag generates structured code edits in OLD/NEW format:

- `use gemini changemode to refactor @src/utils.ts`
- `ask gemini to add error handling to @api/routes.js`

Output format (per file):

**FILE: path/to/file.ts:42**
OLD:
exact code to replace
NEW:
new code to insert

## Tools (for the AI)

These tools are designed to be used by the AI assistant.

- **`ask-gemini`**: Asks Google Gemini for its perspective. Can be used for general questions or complex analysis of files.
  - **`prompt`** (required): The analysis request. Use the `@` syntax to include single file references (e.g., `@src/main.js explain this code`) or ask general questions.
  - **`changeMode`** (optional, default: false): Enable structured change mode for code edits. Returns OLD/NEW formatted edits.
  - **`chunkIndex`** (optional): For large changesets, request a specific chunk (1-based).
  - **`chunkCacheKey`** (optional): Cache key for retrieving subsequent chunks.

- **`fetch-chunk`**: Retrieves a specific chunk from a previously cached ChangeMode response.
  - **`cacheKey`** (required): Cache key from the original ChangeMode response.
  - **`chunkIndex`** (required): Which chunk to retrieve (1-based).

- **`brainstorm`**: Brainstorm new ideas with Gemini as a third party in a "party of 3".
  - **`prompt`** (required): The brainstorming topic or challenge to explore.

- **`ping`**: Tests the connection to the server.
- **`Help`**: Shows help information.

## @filepath Preprocessor

The `@filepath` syntax allows Gemini to access file contents directly:

```javascript
// Single file (supported)
ask-gemini({ prompt: "Explain @README.md" })

// Absolute path (Windows multi-drive)
ask-gemini({ prompt: "Analyze @D:/projects/other/code.ts" })

// Relative path (resolved from MCP server process cwd)
ask-gemini({ prompt: "Review @src/main.js" })

// Multiple files
ask-gemini({ prompt: "Compare @app.tsx vs @app.old.tsx" })
```

**Current Limitations:**
- Single files only — directory references (e.g., `@src/`) are NOT expanded
- File size cap: 1 MB per file (no cumulative limit)
- Must have file extension or path separator
- Skips files exceeding size limit

**Planned Features:**
- Directory expansion (recursive file reading)
- Binary file detection
- Enhanced path traversal protection

## Troubleshooting

### Missing GEMINI_API_KEY

**Error:** `Missing GEMINI_API_KEY environment variable`

**Fix:** Add to your MCP server config:
```json
"env": {
  "GEMINI_API_KEY": "your-api-key-here"
}
```

Get your key at: https://aistudio.google.com/app/apikey

### Quota Exceeded (Auto-Fallback)

**Error:** `Resource exhausted` or `429` status

**Behavior:** Server automatically retries with `gemini-2.5-flash` model.

**Mitigation:** Reduce request frequency or upgrade your Google AI quota.

### @filepath Not Working

**Symptom:** `@path/to/file` shows as literal text instead of file contents.

**Cause:** File doesn't exist, path is invalid, or file exceeds 1 MB limit.

**Fix:**
- Verify the file path is correct
- Use absolute paths for files outside the working directory
- Check file size is under 1 MB

### File Too Large

**Symptom:** `Skipping @ref: ... (X bytes)`

**Cause:** File exceeds 1 MB inline limit.

**Workaround:** Reference specific files instead of directories, or break large files into smaller parts.

## How It Works

### Streaming

The SDK uses `generateContentStream()` internally for efficient responses. When the client provides a progress token, the MCP layer sends periodic progress notifications every 25 seconds to keep the client informed. The full response is returned at completion.

### Quota Fallback

When a rate limit (429) is hit, the server automatically retries the request with the `gemini-2.5-flash` model. This provides a graceful degradation without manual intervention.

### ChangeMode

ChangeMode wraps prompts with special instructions that cause Gemini to output structured OLD/NEW edits. These are parsed and formatted for easy application by Claude Code. Large changesets are chunked, and each chunk can be retrieved via `chunkIndex`.

## Contributing

Contributions are welcome! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

**Disclaimer:** This is an unofficial, third-party tool and is not affiliated with, endorsed, or sponsored by Google.
