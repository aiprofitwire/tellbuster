# Tellbuster

**Find the phrases that make your writing sound like AI.** Free, open source, and nothing leaves your device.

Tellbuster points out "AI tells": phrases like "Let's delve into", "It's not X, it's Y" or "In today's fast-paced world" that readers now link to machine writing. For each one it explains why it stands out and suggests a plainer way to say it.

> Tellbuster is a linter, not a detector. It never claims your text "is AI". People use these phrases too. It shows you what readers notice, so you can decide.

<!-- Screenshot: the web demo after clicking "Try an example" (underlines and the list of notes). Save as docs/img/demo.png and replace this line with: ![Tellbuster underlining phrases in a sample paragraph](docs/img/demo.png) -->

## Get it

| Piece | What it does | Get it |
|---|---|---|
| Web demo | Paste text, see the tells. Nothing to install. | [Open the demo](https://aiprofitwire.github.io/tellbuster/) |
| Chrome extension | Check text in a popup, from the right-click menu, or as you type on LinkedIn, X, Gmail and most sites | Coming soon to the Chrome Web Store. [Try it now from this repo](packages/extension/README.md#try-it-without-the-chrome-web-store) |
| `tellbuster` on npm | The rule engine, for developers to use in their own tools | Coming soon: `npm install tellbuster`. [How to use it](packages/core/README.md) |

<!-- Screenshot: the extension badge and its panel open on a post box. Save as docs/img/badge.png and replace this line with: ![The Tellbuster badge showing 3 tells in a post box](docs/img/badge.png) -->

It checks English and French, with more than 90 rules. You can turn off any rule, and add a strict mode for common filler words.

## Private by design

- No servers, no accounts, no tracking. Read the [privacy policy](https://aiprofitwire.github.io/tellbuster/privacy.html).
- Your text is checked on your own device and never sent anywhere.
- The Chrome extension asks for no website access when you install it. Only if you turn on **Check as I type** does it ask to read the sites you visit, so it can check what you type in text boxes. It never sends or saves that text. See [the extension's README](packages/extension/README.md#permissions).
- The rules are plain, readable data in [`rules/`](rules/). No hidden AI model making guesses.

## Publishing

The steps to put Tellbuster on npm and the Chrome Web Store are in [docs/PUBLISHING.md](docs/PUBLISHING.md).

## Help build the list

Spotted a tell we miss? Adding one takes a few minutes and no real coding. See [CONTRIBUTING.md](CONTRIBUTING.md). French and other languages are very welcome.

## Credits

Rule ideas were inspired by these MIT-licensed projects, which help AI agents write with fewer tells. Tellbuster brings the same idea to people, in the browser. Rules are written in our own words.

- [stop-slop](https://github.com/hardikpandya/stop-slop) by Hardik Pandya
- [no-ai-slop](https://github.com/petergyang/no-ai-slop) by Peter Yang

## License

MIT. See [LICENSE](LICENSE).

Built by [The AI Profit Wire](https://metadatamarketer.com).
