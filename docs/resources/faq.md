---
type: note
updated: 2026-03-11
area: servers
project: gemini-mcp
---
# Frequently Asked Questions

## General

### What is Gemini MCP Tool?
A bridge between Claude (Desktop or Code) and Google's Gemini AI, enabling you to use Gemini's powerful capabilities directly within Claude. Uses the `@google/genai` SDK for direct API access.

### Does it support Windows?
Yes. Tested on Windows 11 with Claude Code and Claude Desktop.

### Why use this instead of Gemini directly?
- Integrated into your existing AI workflow
- File analysis with @ syntax
- Reduced context switching
- Best of both: Leverages both AIs' strengths

### Is it free?
The tool is open source and free. You need:
- Gemini API key (has free tier) from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Claude Desktop or Claude Code or any MCP client

## Setup

### Do I need to install anything besides the MCP tool?
No. The tool uses the `@google/genai` SDK directly — no separate CLI installation required. Just set your `GEMINI_API_KEY` in the MCP configuration.

### Can I use this with Claude Code?
Yes! It works with both Claude Desktop and Claude Code:
```bash
claude mcp add gemini-mcp -- npx -y gemini-mcp-tool
```

### What Node.js version do I need?
Node.js v18.0.0 or higher.

## Usage

### What's the @ syntax?
It's how you reference files for analysis:
- `@file.js` - Single file
- `@src/utils.js @src/helpers.js` - Multiple files
- *new:* `file:index.html` also works as an alternative syntax

**Important:** @filepath works with single files only. Directory references are not expanded.

### Can I analyze multiple files?
Yes! Reference multiple files with `@` in your prompt. Gemini's large context window allows analyzing substantial codebases.

### Which model should I use?
- **Daily work**: Gemini Flash (fast, stable)
- **Large analysis**: Gemini Pro (2M context)
- **Quick tasks**: Gemini Flash

### How do I select a model?
Specify the model naturally in your prompt:
```
use gemini flash to review @file.js
use gemini pro to analyze the full codebase
```

## Features

### What languages are supported?
Any language — code or human.

### Does it work offline?
No, it requires internet to connect to the Gemini API.

### What is changeMode?
A feature that returns structured code edit suggestions in OLD/NEW format, making it easy to apply Gemini's recommended changes.

## Troubleshooting

### Why is it slow?
- Large files take time to process
- Try using Flash model for speed
- Check your internet connection

### Can I use my own models?
Currently supports official Gemini models only.

### Can I add new features?
Yes! Check issues or propose your own ideas.

## Privacy & Security

### Is my code sent to Google?
Only when you explicitly use Gemini tools. Code is processed according to Google's privacy policy.

### Are credentials secure?
- The tool never stores or logs your API key
- Keys are passed via environment variables in MCP config

### Can I use this for proprietary code?
Check your organization's policies and Google's Gemini API terms of service.

## Advanced

### Can I use this in CI/CD?
Not recommended - designed for interactive development.

<div style="text-align: center;">

## Why Gemini MCP?

</div>

By bridging Claude Desktop with Google's powerful models, Gemini MCP Tool lets you leverage the following advanced capabilities right in your existing workflow:

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin: 24px 0;">
  <div style="background: var(--vp-c-bg-soft); padding: 16px; border-radius: 8px; border: 1px solid var(--vp-c-divider);">
    <h4 style="margin: 0 0 8px 0; color: var(--vp-c-brand);">Cost-Effective</h4>
    <p style="margin: 0; font-size: 14px; line-height: 1.5;">Delegate tasks to a more cost-effective model to reduce expensive token usage.</p>
  </div>

  <div style="background: var(--vp-c-bg-soft); padding: 16px; border-radius: 8px; border: 1px solid var(--vp-c-divider);">
    <h4 style="margin: 0 0 8px 0; color: var(--vp-c-brand);">Multimodal Native</h4>
    <p style="margin: 0; font-size: 14px; line-height: 1.5;">Process text, images, audio, video, and code seamlessly within your workflow.</p>
  </div>

  <div style="background: var(--vp-c-bg-soft); padding: 16px; border-radius: 8px; border: 1px solid var(--vp-c-divider);">
    <h4 style="margin: 0 0 8px 0; color: var(--vp-c-brand);">High Performance</h4>
    <p style="margin: 0; font-size: 14px; line-height: 1.5;">Leverage a large context window and powerful built-in tools, including web search.</p>
  </div>

  <div style="background: var(--vp-c-bg-soft); padding: 16px; border-radius: 8px; border: 1px solid var(--vp-c-divider);">
    <h4 style="margin: 0 0 8px 0; color: var(--vp-c-brand);">Advanced Reasoning</h4>
    <p style="margin: 0; font-size: 14px; line-height: 1.5;">Gain a different analytical perspective for sophisticated analysis of complex information.</p>
  </div>

  <div style="background: var(--vp-c-bg-soft); padding: 16px; border-radius: 8px; border: 1px solid var(--vp-c-divider);">
    <h4 style="margin: 0 0 8px 0; color: var(--vp-c-brand);">Privacy First</h4>
    <p style="margin: 0; font-size: 14px; line-height: 1.5;">Open-source and telemetry-free. Committed to transparency and responsible AI.</p>
  </div>
</div>

## More Questions?

- Check [Documentation](/)
- Browse [GitHub Issues](https://github.com/jamubc/gemini-mcp-tool/issues)
- Ask in [Discussions](https://github.com/jamubc/gemini-mcp-tool/discussions)
