---
name: tellbuster
description: Check a draft for phrases that might read as AI, then rewrite them. Use on any text written for someone to publish or send, such as a post, an email, a newsletter, a README or product copy.
---

# Tellbuster

Before you show the user a draft meant for publishing or sending, check it with Tellbuster and fix what it finds.

Tellbuster is a linter, not a detector. It points out phrases that might read as AI and says why. People use these phrases too, so never tell the user their text "is AI".

## Steps

1. Save the draft to a file, for example `draft.md`.
2. Run:

   ```sh
   npx -y tellbuster draft.md
   ```

   Each finding prints as `file:line:column  severity  name: message`. Add `--json` to get the why and the fix for each one. The exit code is 1 when something was found and 0 when the draft is clean.
3. Rewrite each flagged phrase in plain words. Follow the fix. Do not swap one stock phrase for another.
4. Run the check again. Repeat until it finds nothing, or until what is left is a phrase you kept on purpose.
5. Tell the user in one line what you changed. If you kept a flagged phrase, say which and why.

If the `tellbuster-mcp` server is connected, you can call its `check_writing` tool with the draft instead of running the command.

## Options

- `--lang fr` (or `en`, `es`, `de`, `pt`): set the language. The default guesses it.
- `--strict`: also use the strict style rules.
- `--disable id1,id2`: skip rules the user asked you to ignore.

The text never leaves the device. Tellbuster makes no network calls after it is installed.
