---
type: note
updated: 2026-03-11
area: servers
project: gemini-mcp
---
# File Analysis with @ Syntax

One of the most powerful features of Gemini MCP Tool is the ability to analyze files using the `@` syntax.

## Basic Usage

```
use gemini to explain @index.js
```
```
ask gemini to analyze @src/main.ts and summarize it
```
```
ask gemini what the weather is like in new york
```

## Multiple Files

Analyze multiple files in one request:
```
use gemini to compare @src/server.js and @src/client.js
```
```
ask gemini to analyze @src/server.js @src/client.js and provide bug fixes
```

## Important Limitation

**@filepath works  single files only.** Directory references (e.g., `@src/`) are not expanded by tol. Reference specific files instead.

## Why @ Syntax?

- **Familiar**: Both Claude and Gemini natively support it
- **Explicit**: Clear which files are being analyzed
- **Flexible**: Works with single files or multiple file references

## Best Practices

### 1. Be Specific
```
# Good
use gemini to explain the authentication flow in @src/auth/login.js

# Too vague
use gemini to explain everything in @src
```

### 2. Combine with Questions
```
ask gemini if @package.json and @src/index.js are properly configured
```

### 3. Speak Naturally
```
what does gemini think about @utils.ts?
ask gemini to get a second opinion on @api/routes.ts
```

### 4. Use Absolute Paths for Cross-Drive (Windows)
```
use gemini to analyze @D:/projects/other/code.ts
```

## Token Optimization

Gemini's massive context window allows analyzing large files, saving Claude tokens for other work.

## Examples

### Code Review
```
use gemini to review @feature/new-api.js
```

### Documentation
```
ask gemini to generate JSDoc comments for @src/utils/*.js
```

### Debugging
```
use gemini to explain why @error.log shows errors in @src/handler.js
```
