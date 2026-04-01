---
type: note
updated: 2026-03-11
area: servers
project: gemini-mcp
---
# Best Practices

Get the most out of Gemini MCP Tool with these proven practices.

## File Selection

### Start Specific
Begin with individual files before expanding scope:
```
@auth.js                    # Start here
@auth.js @user.model.js     # Add related files
@src/auth/*.js              # Expand to module
@src/**/*.js                # Full codebase analysis
```

### Group Related Files
Include configuration with implementation:
```
@webpack.config.js @src/index.js  # Config + entry point
@.env @config/*.js                # Environment + config
@schema.sql @models/*.js          # Database + models
```

## Query Optimization

### Be Specific About Intent
```
# Vague
"analyze this code"

# Specific
"identify performance bottlenecks and suggest optimizations"
"check for SQL injection vulnerabilities"
"explain the authentication flow step by step"
```

### Provide Success Criteria
```
"refactor this to be more testable, following SOLID principles"
"optimize for readability, targeting junior developers"
"make this TypeScript-strict compliant"
```

## Token Management

### Gemini Model Selection
- **Quick tasks**: Use Flash (1M tokens)
- **Full analysis**: Use Pro (2M tokens)

### Efficient File Inclusion
```
# Inefficient
@node_modules/**/*.js  # Don't include dependencies

# Efficient
@src/**/*.js @package.json  # Source + manifest
```

## Iterative Development

### Build on Previous Responses
```
1. "use gemini to analyze the architecture"
2. "focus on the authentication module you mentioned"
3. "show me how to implement the improvements"
4. "write tests for the new implementation"
```

## Error Handling

### Include Error Context
```
# Good
use gemini to analyze @error.log and @src/api.js
"getting 500 errors when calling /user endpoint"

# Better
use gemini to analyze @error.log @src/api.js @models/user.js
"500 errors on /user endpoint after deployment"
```

### Provide Stack Traces
Always include full error messages and stack traces when debugging.

## Code Generation

### Specify Requirements Clearly
```
# Vague
"create a user service"

# Clear
"create a user service with:
- CRUD operations
- input validation
- error handling
- TypeScript types
- Jest tests"
```

### Include Examples
```
ask gemini to create a similar service for products based on @existing-service.js
```

## Security Reviews

### Comprehensive Security Checks
```
use gemini to analyze @src/**/*.js @package.json
- Check for hardcoded secrets
- Review authentication logic
- Identify OWASP vulnerabilities
- Check dependency vulnerabilities
- Review input validation
```

## Performance Optimization

### Measure Before Optimizing
```
use gemini to optimize @src/slow-endpoint.js based on @performance-profile.json
```

### Consider Trade-offs
```
"optimize for speed, but maintain readability"
"reduce memory usage without sacrificing features"
```

## Documentation

### Context-Aware Documentation
```
use gemini to update @README.md with accurate API documentation based on @src/api/*.js
```

### Maintain Consistency
```
ask gemini to document @src/new-feature.js following conventions in @docs/style-guide.md
```

## Common Pitfalls to Avoid

### 1. Over-broad Queries
- Bad: `@**/* "fix all issues"`
- Good: `use gemini to fix security issues in @src/auth/*.js`

### 2. Missing Context
- Bad: `"why doesn't this work?"`
- Good: `use gemini to analyze @error.log @config.js "why doesn't database connection work?"`

### 3. Ignoring Model Limits
- Bad: Trying to analyze 5M tokens with Flash model
- Good: Using Pro for large codebases, Flash for single files

### 4. Vague Success Criteria
- Bad: "make it better"
- Good: "improve performance to handle 1000 requests/second"

## Advanced Tips

### 1. Create Analysis Templates
Save common queries for reuse:
```
# security-check.txt
Check for:
- SQL injection
- XSS vulnerabilities
- Authentication bypasses
- Rate limiting
- Input validation
```

### 2. Chain Operations
```
"First analyze the bug" ->
"Now write a fix" ->
"Create tests for the fix" ->
"Update documentation"
```

### 3. Learn from Patterns
When Gemini suggests improvements, ask:
```
"explain why this approach is better"
"show me more examples of this pattern"
```
