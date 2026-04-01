---
type: note
updated: 2026-03-11
area: servers
project: gemini-mcp
---
# First Steps

Once installed, here's how to get started with Gemini MCP Tool.

## Test Connection

```
use gemini ping
```

## Basic File Analysis

Analyze a single file:
```
use gemini to summarize @README.md
```

## Natural Language Usage

Just ask naturally:
- "Use gemini to explain this codebase"
- "Ask gemini to analyze the architecture"
- "Have gemini review this function"

## ChangeMode for Code Edits

Get structured code edit suggestions:
```
use gemini changemode to refactor @src/utils.ts
```

## Next Steps

- Learn about [@file syntax](/concepts/file-analysis)
- Explore [model selection](/concepts/models)
- See [real examples](/usage/examples)
