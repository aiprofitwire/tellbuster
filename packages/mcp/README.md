# tellbuster-mcp

Let an AI agent check its own writing before it shows it to you. This is an [MCP](https://modelcontextprotocol.io) server with one tool, `check_writing`. The agent sends it a draft and gets back each phrase that might read as AI, with why it stands out and how to fix it.

Tellbuster is a linter, not a detector. It never says text was written by a machine. People use these phrases too.

Private by design: the server runs on your computer and talks to the agent over standard input and output. It makes no network calls. The text is checked on your device and forgotten.

## What you need

**Node.js** 20 or newer. To check, open a terminal and type `node -v`.

## Set it up in Claude Code

In a terminal, run:

```sh
claude mcp add tellbuster -- npx -y tellbuster-mcp
```

Start Claude Code, type `/mcp` and check that `tellbuster` shows as connected.

## Set it up in Claude Desktop

1. Open Claude Desktop, then **Settings**, then **Developer**, then **Edit Config**. This opens `claude_desktop_config.json`.
2. Add Tellbuster under `mcpServers` (keep any servers already there):

```json
{
  "mcpServers": {
    "tellbuster": {
      "command": "npx",
      "args": ["-y", "tellbuster-mcp"]
    }
  }
}
```

3. Save the file and restart Claude Desktop. The tools menu in the chat box should list `check_writing`.

## Set it up in Cursor

1. Open (or create) `.cursor/mcp.json` in your project, or `~/.cursor/mcp.json` to use it in every project.
2. Add the same block as for Claude Desktop:

```json
{
  "mcpServers": {
    "tellbuster": {
      "command": "npx",
      "args": ["-y", "tellbuster-mcp"]
    }
  }
}
```

3. Open **Cursor Settings**, find the MCP section (called **Tools & MCP** in recent versions), and check that `tellbuster` is on.

## Use it

Ask the agent to check its draft, for example: "Write a LinkedIn post about our launch, then check it with Tellbuster and fix what it finds."

## The tool

`check_writing` takes:

- `text` (required): the draft to check.
- `strict` (optional, default `false`): also use the strict style rules.
- `lang` (optional, default `auto`): `auto`, `en`, `fr`, `es`, `de` or `pt`.

It returns a short text list for the agent to read, plus the same findings as data:

```json
{
  "count": 1,
  "findings": [
    {
      "ruleId": "en-delve",
      "name": "Delve",
      "severity": "medium",
      "match": "delve",
      "line": 1,
      "column": 7,
      "start": 6,
      "end": 11,
      "message": "...",
      "why": "...",
      "fix": "..."
    }
  ]
}
```

## Claude Code skill

The repo also has a Claude Code skill in [`skills/tellbuster`](https://github.com/aiprofitwire/tellbuster/tree/main/skills/tellbuster). It tells the agent to check every draft it writes for publishing and to rewrite what gets flagged. To use it, copy that folder into `.claude/skills/` in your project (or `~/.claude/skills/` for all projects).

## License

MIT
