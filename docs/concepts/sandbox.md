---
type: note
updated: 2026-03-10
area: servers
project: gemini-mcp
---
# Sandbox Mode

> **Note:** Sandbox mode was removed in v1.1.4 (2026-02-23 SDK migration). The `@google/genai` SDK does not provide an equivalent safe code execution feature.

## What Was Sandbox Mode?

Sandbox mode previously allowed Gemini to write and test code in a secure, isolated environment. This feature relied on the Gemini CLI's `-s` flag for safe code execution.

## Why Was It Removed?

During the migration from CLI subprocess to `@google/genai` SDK:
- The SDK is a text-only API and does not expose code execution capabilities
- No SDK equivalent exists for the CLI's sandbox mode
- Removing this inconsistency allows the SDK integration to work reliably

## Alternatives for Code Testing

### Local Execution
Run code examples locally in your development environment:
```bash
python example.py
node script.js
```

### IDE Integration
Use your IDE's built-in code runner or debugger.

### Online Environments
- [Google Colab](https://colab.research.google.com/) for Python
- [CodeSandbox](https://codesandbox.io/) for JavaScript
- [Replit](https://replit.com/) for multiple languages

## For Code Analysis (Without Execution)

The `ask-gemini` tool can still analyze and explain code without running it:

```
use gemini to explain what this code does: @script.js
ask gemini to find potential bugs in @api/routes.ts
use gemini to review @utils/helpers.ts for best practices
```

## Migration Notes

If you were using sandbox mode:

1. **Code Review**: Use `ask-gemini` to analyze code without execution
2. **Testing**: Run tests in your local environment or CI/CD pipeline
3. **Prototyping**: Use online code playgrounds for quick experiments

For more information about the SDK migration, see the [CHANGELOG](/CHANGELOG.md).
