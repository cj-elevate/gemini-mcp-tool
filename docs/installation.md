---
type: note
updated: 2026-03-10
area: servers
project: gemini-mcp
---
# Installation

Multiple ways to install Gemini MCP Tool, depending on your needs.

## Prerequisites

- **[Node.js](https://nodejs.org/)** v18.0.0 or higher
- **[Google AI API Key](https://aistudio.google.com/app/apikey)** — Free tier available
- Claude Desktop or Claude Code with MCP support

> **No CLI required** — This implementation uses the `@google/genai` SDK directly.

## Method 1: NPX (Recommended)

No installation needed - runs directly:

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

## Method 2: Global Installation

```bash
npm install -g gemini-mcp-tool
```

Then configure:
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

## Method 3: Local Project

```bash
npm install gemini-mcp-tool
```

See [Getting Started](/getting-started) for full setup instructions.
