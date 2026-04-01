---
type: note
updated: 2026-03-10
area: servers
project: gemini-mcp
---
# Tool Reference

Complete list of available tools and their usage.

## Available Tools

### `ask-gemini`
Query Gemini for analysis, code review, or general questions.

**Parameters:**
- `prompt` (required): Your question or analysis request
- `changeMode` (optional): Enable structured code edits (OLD/NEW format)
- `chunkIndex` (optional): Retrieve specific chunk from large changeMode response
- `chunkCacheKey` (optional): Cache key for retrieving subsequent chunks

**Examples:**
```
use gemini to explain @index.js
ask gemini to analyze @package.json and list dependencies
use gemini changemode to refactor @src/utils.ts
```

### `fetch-chunk`
Retrieve cached chunks from a previous changeMode response.

**Parameters:**
- `cacheKey` (required): Cache key from original changeMode response
- `chunkIndex` (required): Which chunk to retrieve (1-based)

**When to use:** After receiving a changeMode response with multiple chunks, use this to get subsequent chunks.

### `brainstorm`
Generate creative ideas using structured methodologies.

**Parameters:**
- `prompt` (required): Topic or challenge to explore

**Examples:**
```
brainstorm alternative approaches to user authentication
use brainstorm to explore API design patterns
```

### `ping`
Test connectivity with the MCP server.

**Parameters:**
- `prompt` (optional): Message to echo back

### `Help`
Show help information about available tools.

## Natural Language Invocation

Instead of special syntax, use natural language:

- "Use gemini to analyze index.js"
- "Ask gemini to compare REST vs GraphQL"
- "Have gemini explain this error"
- "Use gemini changemode to add error handling"

## File References with @ Syntax

### Single File
```
@README.md
@src/index.js
@test/unit.test.ts
```

### Multiple Files
```
@file1.js @file2.js @file3.js
```

### Absolute Paths (Windows Multi-Drive)
```
@D:/projects/other/code.ts
@C:/Users/Me/config.json
```

**Important:** @filepath works with single files only. Directory references (e.g., `@src/`) are not expanded.

## ChangeMode Workflow

For structured code edits, enable changeMode:

1. **Request with changeMode:**
   ```
   use gemini changemode to refactor @src/utils.ts to use async/await
   ```

2. **Receive chunked response** (if many edits):
   ```
   **Chunk 1 of 3** - Use cacheKey: abc123 for remaining chunks
   ```

3. **Fetch subsequent chunks:**
   ```
   use fetch-chunk with cacheKey: abc123 chunkIndex: 2
   ```

## Advanced Usage

### Combining Files and Analysis
```
use gemini to analyze @package.json @src/index.js and check if the entry point is configured correctly
```

### Code Review with ChangeMode
```
use gemini changemode to review @src/api/routes.ts and add proper error handling
```

### Comparing Files
```
ask gemini to compare @app.tsx vs @app.old.tsx and summarize the differences
```

## Tips

1. **Be Specific**: Clear questions get better answers
2. **Use @filepath**: Reference actual files for better context
3. **Enable ChangeMode**: For code edits to get structured OLD/NEW format
4. **Single Files Only**: @filepath doesn't expand directories
5. **Absolute Paths**: Use full paths for files outside working directory
