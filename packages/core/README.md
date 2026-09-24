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

- `loadRules(json)`: checks a parsed rules file and returns its rules. Throws an error naming the rule and the problem if something is wrong, including a bad pattern.
- `check(text, { rules, disabled })`: returns findings sorted by position. Each finding has `ruleId`, `name`, `category`, `severity`, `start`, `end`, `match`, `message`, `why` and `fix`.
- `summarize(findings, text)`: returns `{ total, bySeverity, perHundredWords }`.

## License

MIT
