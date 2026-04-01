---
type: note
updated: 2026-03-11
area: servers
project: gemini-mcp
---
# Real-World Examples

Practical examples of using Gemini MCP Tool in development workflows.

## Code Review

### Reviewing a Pull Request
```
use gemini to review @feature/new-api/*.js for:
- Security issues
- Performance concerns
- Code style consistency
- Missing error handling
```

### Pre-commit Check
```
ask gemini to check my staged changes before I commit
```

## Debugging

### Analyzing Error Logs
```
use gemini to analyze @logs/error.log and @src/api/handler.js
why am I getting "undefined is not a function" errors?
```

### Stack Trace Analysis
```
ask gemini what caused this crash in @crash-report.txt and how to fix it
```

## Architecture Analysis

### Understanding a New Codebase
```
use gemini to analyze @package.json @src/**/*.js @README.md
give me an overview of this project's architecture
```

### Dependency Analysis
```
ask gemini to check @package.json for security vulnerabilities or outdated packages
```

## Documentation

### Generating API Docs
```
use gemini to generate OpenAPI documentation for @routes/api/*.js
```

### README Creation
```
ask gemini to create a comprehensive README based on @src/**/*.js and @package.json
```

## Testing

### Writing Tests
```
use gemini to write comprehensive Jest tests for @src/utils/validator.js
```

### Test Coverage Analysis
```
ask gemini what's not being tested across @src/**/*.js and @test/**/*.test.js
```

## Refactoring

### Code Optimization
```
use gemini to optimize the performance of @src/data-processor.js
```

### Pattern Implementation
```
ask gemini to refactor @src/services/*.js to use the Repository pattern
```

## Learning

### Understanding Concepts
```
ask gemini to show me how OAuth 2.0 works with a working example
```

### Best Practices
```
use gemini to check if @src/auth/*.js follows security best practices
```

## Migration

### Framework Upgrade
```
use gemini to analyze @package.json and @src/**/*.js
what changes are needed to upgrade from Express 4 to Express 5?
```

### Language Migration
```
ask gemini to convert @legacy/script.js to TypeScript with proper types
```

## Security Audit

### Vulnerability Scan
```
use gemini to perform a security audit on @src/**/*.js and @package.json
identify potential vulnerabilities
```

### OWASP Check
```
ask gemini to check @src/api/**/*.js for OWASP Top 10 vulnerabilities
```

## Performance Analysis

### Bottleneck Detection
```
use gemini to identify performance bottlenecks in @src/routes/*.js and @src/middleware/*.js
```

### Memory Leaks
```
ask gemini to look for potential memory leaks in @src/**/*.js
```

## Real Project Example

### Full Stack Review
```
# 1. Architecture overview
use gemini to explain how the frontend and backend connect
based on @package.json @src/index.js @client/App.jsx

# 2. API Security
ask gemini to review API security in @routes/api/*.js @middleware/auth.js

# 3. Database optimization
use gemini to suggest database optimizations for @models/*.js @db/queries/*.sql

# 4. Frontend performance
ask gemini how to improve frontend performance in @client/**/*.jsx

# 5. Test coverage
use gemini to find critical paths lacking test coverage in @src/**/*.js @test/**/*.test.js
```

## Tips for Effective Usage

1. **Start Broad, Then Narrow**: Begin with overview, then dive into specifics
2. **Combine Related Files**: Include configs with source code
3. **Ask Follow-up Questions**: Build on previous responses
4. **Use Specific Criteria**: Tell Gemini what to look for
5. **Iterate on Solutions**: Refine based on suggestions
