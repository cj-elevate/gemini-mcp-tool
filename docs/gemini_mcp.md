---
type: note
updated: 2026-03-11
area: servers
project: gemini-mcp
---
# Gemini MCP Server

Enhanced fork of `jamubc/gemini-mcp-tool` — uses the `@google/genai` SDK for direct API calls.

## Architecture

This MCP server connects to Google's Gemini API using the `@google/genai` SDK. No CLI binary is needed — just an API key.

## Repository

| Repo | URL |
|------|-----|
| Upstream | https://github.com/jamubc/gemini-mcp-tool |
| Fork | https://github.com/cj-elevate/gemini-mcp-tool |
| Local | `D:\servers\gemini-mcp-tool` |
| PR | https://github.com/jamubc/gemini-mcp-tool/pull/43 |

## Available Tools

| Tool | Purpose |
|------|---------|
| `ask-gemini` | Main query tool — analysis, code review, general questions |
| `brainstorm` | Creative idea generation with structured methodologies |
| `ping` | Connection test |
| `Help` | Show available tools and usage |
| `fetch-chunk` | Get cached response chunks from changeMode |

## ask-gemini Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | string | Yes | Query text. Use `@file` for file references |
| `changeMode` | boolean | No | Get structured edit suggestions (OLD/NEW format) |
| `chunkIndex` | number | No | Retrieve specific chunk from large changeMode response |
| `chunkCacheKey` | string | No | Cache key for retrieving subsequent chunks |

## Usage Examples

### File Analysis
```
use gemini to analyze @src/main.ts and @package.json
```

### Code Review with ChangeMode
```
use gemini changemode to refactor @src/utils.ts
```

### Model Selection
```
use gemini flash to quickly review @README.md
```

### Brainstorming
```
use brainstorm to explore API design patterns
```

## Configuration

Requires a `GEMINI_API_KEY` in the MCP server `env` block:

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

For local development, point to the built output:
```json
"gemini-mcp": {
  "type": "stdio",
  "command": "node",
  "args": ["D:\\servers\\gemini-mcp-tool\\dist\\index.js"],
  "env": {
    "GEMINI_API_KEY": "your-api-key-here"
  }
}
```

## Building

```bash
cd D:/servers/gemini-mcp-tool
npm install
npm run build
```

Output goes to `dist/index.js`.

## Testing

```
# 1. Ping test
use gemini ping

# 2. Basic query
ask gemini what is 2+2

# 3. File analysis
use gemini to summarize @CLAUDE.md
```

## Related

- **Skill:** `gemini-agent` (v5.0.0)
- **Settings:** `~/.gemini/settings.json`

---

**Created:** 2025-11-30
**Status:** Production
