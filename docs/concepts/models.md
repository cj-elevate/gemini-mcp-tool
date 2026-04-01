---
type: note
updated: 2026-03-11
area: servers
project: gemini-mcp
---
# Model Selection

Choose the right Gemini model for your task.

## Available Models

### Gemini-2.5-pro
- **Best for**: Complex analysis, large codebases
- **Context**: 2M tokens
- **Use when**: Analyzing entire projects, architectural reviews, stronger reasoning

### Gemini-2.5-flash
- **Best for**: Quick responses, routine tasks
- **Context**: 1M tokens
- **Use when**: Fast code reviews, analyzing entire projects, simple explanations

## Setting Models

### Per Request (Natural Language)
Specify the model in your prompt:
```
use gemini flash to quickly review @file.js
use gemini pro to analyze the full architecture
```

### In MCP Configuration
Set a default model via environment variable:
```json
{
  "mcpServers": {
    "gemini-mcp": {
      "command": "npx",
      "args": ["-y", "gemini-mcp-tool"],
      "env": {
        "GEMINI_API_KEY": "your-api-key-here",
        "GEMINI_MODEL": "gemini-2.5-flash"
      }
    }
  }
}
```

## Model Comparison

| Model | Speed | Context | Best Use Case |
|-------|-------|---------|---------------|
| Pro | Slower | 2M tokens | Complex analysis, big ideas |
| Flash | Fast | 1M tokens | Quick, specific changes |

## Cost Optimization

1. **Start with Flash** for most tasks
2. **Use Pro** only when you need the full context or stronger reasoning

## Token Limits

- **Pro**: ~2 million tokens (~500k lines of code)
- **Flash**: ~1 million tokens (~250k lines of code)

## Recommendations

- **Code Review**: Flash
- **Architecture Analysis**: Pro
- **Quick Fixes**: Flash
- **Documentation**: Flash
- **Security Audit**: Pro
