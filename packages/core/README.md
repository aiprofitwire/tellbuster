# tellbuster

Find the phrases that make writing read like AI. Each finding says why the phrase stands out and how to fix it. Zero dependencies. Nothing leaves your device.

Tellbuster is a linter, not a detector. It never says text was written by a machine. People use these phrases too.

## Install

```sh
npm install tellbuster
```

## Use

```js
import { readFileSync } from 'node:fs';
import { check, summarize, loadRules } from 'tellbuster';

const rules = loadRules(JSON.parse(readFileSync('rules/en.json', 'utf8')));
const text = "Let's delve into the numbers.";

const findings = check(text, { rules, disabled: ['en-em-dash'] });
for (const f of findings) console.log(`${f.start}-${f.end} ${f.name}: ${f.message} ${f.fix}`);

console.log(summarize(findings, text)); // { total, bySeverity: { low, medium, high }, perHundredWords }
```

The rule files live in the `rules/` folder of the [Tellbuster repo](https://github.com/aiprofitwire/tellbuster).

## API

- `loadRules(json)`: checks a parsed rules file and returns its rules. Rules from a file with `"strict": true` come back marked strict. Throws an error naming the rule and the problem if something is wrong, including a bad pattern.
- `check(text, { rules, disabled, strictStyle, language })`: returns findings sorted by position. With `language: 'auto'`, it guesses the language of the text and uses only that language's rules (a rule's language is the start of its id, like `fr-`). With a code like `language: 'fr'`, it always uses that language. Left out, every rule runs. Rules marked strict (from `rules/en-strict.json`) only run when `strictStyle` is `true`. It is `false` by default. Each finding has `ruleId`, `name`, `category`, `severity`, `start`, `end`, `match`, `message`, `why` and `fix`.
- `guessLanguage(text, candidates)`: guesses the language by counting common words. Returns one of the candidate codes (`['en', 'fr']` by default), or the first one when it cannot tell.
- `summarize(findings, text)`: returns `{ total, bySeverity, perHundredWords }`.

## License

MIT
