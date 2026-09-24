# Tellbuster

**Find the phrases that make your writing sound like AI.** Free, open source, and nothing leaves your device.

Tellbuster points out "AI tells": phrases like "Let's delve into", "It's not X, it's Y" or "In today's fast-paced world" that readers now link to machine writing. For each one it explains why it stands out and suggests a plainer way to say it.

> Tellbuster is a linter, not a detector. It never claims your text "is AI". People use these phrases too. It shows you what readers notice, so you can decide.

## Status

Early build. See [PLAN.md](PLAN.md) for progress.

| Piece | What it does | Status |
|---|---|---|
| Web demo | Paste text, see the tells | Coming soon |
| Chrome extension | Checks what you type on LinkedIn, X, Gmail and any site | Coming soon |
| `tellbuster` on npm | The rule engine, for developers to use in their own tools | Coming soon |

## Private by design

- No servers, no accounts, no tracking.
- Your text is checked on your own device and never sent anywhere.
- The rules are plain, readable data in [`rules/`](rules/). No hidden AI model making guesses.

## Help build the list

Spotted a tell we miss? Adding one takes a few minutes and no real coding. See [CONTRIBUTING.md](CONTRIBUTING.md). French and other languages are very welcome.

## Credits

Rule ideas were inspired by these MIT-licensed projects, which help AI agents write with fewer tells. Tellbuster brings the same idea to people, in the browser. Rules are written in our own words.

- [stop-slop](https://github.com/hardikpandya/stop-slop) by Hardik Pandya
- [no-ai-slop](https://github.com/petergyang/no-ai-slop) by Peter Yang

## License

MIT. See [LICENSE](LICENSE).

Built by [The AI Profit Wire](https://metadatamarketer.com).
