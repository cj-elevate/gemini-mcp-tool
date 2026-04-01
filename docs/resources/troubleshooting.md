---
type: doc
doc: troubleshooting
updated: 2026-03-11
project: gemini-mcp
area: servers
---
# Troubleshooting

Common issues and their solutions. Click any issue below to see the detailed solution.

<script setup>
import TroubleshootingModal from '../.vitepress/components/TroubleshootingModal.vue'
</script>

## Installation Issues

<TroubleshootingModal
  title="Windows NPX Installation Issues"
  preview='Error: unknown option "-y" when using Claude Code on Windows'
>

**Problem**: `error: unknown option '-y'` when using Claude Code on Windows

**Solution**: Use one of these alternative installation methods:

```bash
# Method 1: Install globally first
npm install -g gemini-mcp-tool
claude mcp add gemini-mcp -- gemini-mcp-tool

# Method 2: Use --yes instead of -y
claude mcp add gemini-mcp -- npx --yes gemini-mcp-tool

# Method 3: Remove the -y flag entirely
claude mcp add gemini-mcp -- npx gemini-mcp-tool
```

</TroubleshootingModal>

<TroubleshootingModal
  title='"MCP server not responding"'
  preview="Claude Desktop can't connect to the MCP server"
>

**Step-by-step solution**:

1. **Check your Claude Desktop config file location**
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Verify JSON syntax is correct**
   - Use a JSON validator online
   - Check for missing commas, brackets, or quotes

3. **Verify your API key** is set in the `env` block of your MCP config:
   ```json
   "env": {
     "GEMINI_API_KEY": "your-api-key-here"
   }
   ```

4. **Restart Claude Desktop completely**
   - Quit completely (Cmd+Q on Mac)
   - Wait 5 seconds
   - Restart Claude Desktop

5. **Check logs for detailed errors**
   - macOS: `~/Library/Logs/Claude/`
   - Windows: `%APPDATA%\Claude\logs\`

</TroubleshootingModal>

## Connection Issues

<TroubleshootingModal
  title='"Failed to connect to Gemini"'
  preview="API connection issues or authentication problems"
>

**Step-by-step solution**:

1. **Verify your API key is configured** in the MCP server `env` block:
   ```json
   "env": {
     "GEMINI_API_KEY": "your-api-key-here"
   }
   ```

2. **Check your internet connection**
   - Try accessing google.com in your browser

3. **Verify firewall settings**
   - Ensure your firewall isn't blocking requests to Google APIs
   - Check corporate proxy settings if applicable

4. **Test basic connectivity** using the ping tool:
   ```
   use gemini ping
   ```

5. **If still failing, regenerate your API key**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Update your MCP config `env` block with the new key

</TroubleshootingModal>

<TroubleshootingModal
  title='"Timeout errors"'
  preview="Requests taking too long or timing out"
>

**Common causes and solutions**:

1. **Large files naturally take time** - Be patient with large file analysis

2. **Use Gemini Flash for faster responses** by specifying the model in your prompt:
   ```
   use gemini flash to analyze @large-file.js
   ```

3. **Break up large requests into smaller chunks**:
   ```
   use gemini to explain the main function in @large-file.js
   ```

4. **For very large codebases, the tool prevents timeouts automatically**:
   - Progress updates keep the connection alive
   - Clear status messages show processing is active
   - No manual configuration needed

</TroubleshootingModal>

<TroubleshootingModal
  title='"MCP error -32000: Connection closed"'
  preview="Server fails to start and connection closes immediately (Claude Code)"
>

**Common causes**:

1. **Node.js version compatibility** - Ensure Node.js v18.0.0 or higher
2. **Missing API key** - Ensure `GEMINI_API_KEY` is set in your MCP config `env` block
3. **PATH issues** - Restart terminal after installing Node.js/npm

**Debug steps**:

```bash
# 1. Check Node.js version (must be v18+)
node --version

# 2. Reinstall if needed
npm uninstall -g gemini-mcp-tool
npm install -g gemini-mcp-tool

# 3. Verify Claude Code can find the command
claude mcp list
```

**Still not working?** Check the Claude Desktop logs for detailed error messages:
- macOS: `~/Library/Logs/Claude/`
- Windows: `%APPDATA%\Claude\logs\`

</TroubleshootingModal>

### "Gemini gets cut off" / Early Termination
**Problem**: Responses appear truncated or Claude reports "Gemini was thinking but got cut off"

**Causes**:
- Large codebase analysis taking longer than expected
- Complex operations requiring extended processing time
- Client connection management issues

**Solutions**:
```
# The tool automatically prevents timeouts with progress updates

# Use faster Flash model for large requests
use gemini flash to analyze @large-file.js

# Break up large analysis into smaller chunks
use gemini to explain the handler function in @specific-file.js
```

## File Analysis Issues

### "File not found"
- Use absolute paths when possible
- Check file permissions
- Verify working directory

### "Token limit exceeded" / "Response exceeds maximum allowed tokens (25000)"
**Problem**: Error shows response of 45,735 tokens even for small prompts

**Root cause**: Model-specific bug in `gemini-2.5-pro` (default model)

**Working models**:
- gemini-2.5-flash - Works perfectly
- gemini-2.5-pro - Always returns 45k+ tokens

**Solutions**:
```
# Use Flash model (recommended)
use gemini flash to analyze @file.js

# For large contexts, break into smaller chunks
use gemini flash to analyze @file1.js and @file2.js
```

## Configuration Issues

### Changes not taking effect
1. Save config file
2. Completely quit Claude Desktop
3. Restart Claude Desktop
4. Verify with the Help tool: `use gemini help`

### Environment variables not working
Ensure your MCP config has the `env` block:
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

### Configurable Timeout for Large Codebases
**Problem**: Default MCP client timeout too short for large analysis

**Root Cause**: Claude Desktop/Claude Code has a hard-coded timeout that cannot be overridden by environment variables.

**Solution**: The tool automatically sends progress updates to prevent timeouts. You will see status messages showing the tool is working during long operations.

**For very large codebases** (10,000+ files):
- Consider breaking analysis into smaller chunks
- Use more specific file patterns with `@` syntax
- Use Gemini Flash for faster processing

## Debug Mode

Enable debug logging:
```json
{
  "mcpServers": {
    "gemini-mcp": {
      "command": "npx",
      "args": ["-y", "gemini-mcp-tool"],
      "env": {
        "GEMINI_API_KEY": "your-api-key-here",
        "DEBUG": "true"
      }
    }
  }
}
```

## Getting Help

1. Check [GitHub Issues](https://github.com/jamubc/gemini-mcp-tool/issues)
2. Enable debug mode
3. Collect error logs
4. Open a new issue with details

## Model-Specific Issues

### Gemini-2.5-Pro Issues
**Known problems**:
- Always returns 45,735 token responses (bug)
- May cause "response exceeds limit" errors
- Not recommended for file analysis

**Workaround**: Use Gemini Flash instead:
```
use gemini flash to analyze @file.js
```

### Model Recommendations
| **Use Case** | **Recommended Model** | **Reason** |
|--------------|----------------------|------------|
| File analysis | `gemini-2.5-flash` | Faster, stable responses |
| Code review | `gemini-2.5-flash` | Good balance of speed/quality |
| Large codebase | `gemini-2.5-flash` | Better timeout handling |
| Quick questions | `gemini-2.5-flash` | Fast responses |

## Quick Fixes

### Reset Everything
```bash
# Remove and reinstall
npm uninstall -g gemini-mcp-tool
npm install -g gemini-mcp-tool
```

### Test Basic Functionality
```
# Test MCP Tool
use gemini ping

# Test file analysis with working model
use gemini flash to summarize @README.md
```

## Platform-Specific Issues

### Windows 11
- **NPX flag issues**: Use `--yes` instead of `-y`
- **Path problems**: Restart terminal after Node.js installation
- **Connection issues**: Ensure Windows Defender isn't blocking Node.js

### macOS
- **Permission issues**: Use `sudo` if npm install fails
- **Terminal restart**: Required after installing dependencies

### Linux
- **Node.js version**: Install via NodeSource for latest version
- **npm permissions**: Configure npm to avoid sudo usage
