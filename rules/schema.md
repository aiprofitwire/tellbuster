# Rule format

Each file in `rules/` holds the rules for one language, named with its language code (`en.json`, `fr.json`). The engine picks rules by the start of their id, so every id must begin with the file's language code. The file is a JSON object:

```json
{
  "language": "en",
  "version": 1,
  "rules": [ ... ]
}
```

## One rule

```json
{
  "id": "en-delve",
  "name": "\"Delve\"",
  "category": "word-choice",
  "severity": "medium",
  "pattern": "\\bdelv(e|es|ed|ing)\\b",
  "flags": "i",
  "message": "\"Delve\" reads as AI.",
  "why": "AI models use \"delve\" far more often than people do, so readers now link it to machine writing.",
  "fix": "Try \"look at\", \"dig into\" or \"explore\".",
  "examples": {
    "flag": ["Let's delve into the numbers."],
    "pass": ["The report looks at the numbers."]
  }
}
```

| Field | Required | What it means |
|---|---|---|
| `id` | yes | Unique, lowercase, starts with the language code. Example: `en-delve`. Never change an id once published. |
| `name` | yes | Short label shown in the UI. |
| `category` | yes | One of: `word-choice`, `phrase`, `structure`, `punctuation`, `filler`. |
| `severity` | yes | `low` (style note), `medium` (common tell), `high` (strong tell). |
| `pattern` | yes | A JavaScript regular expression, written as a string. Escape backslashes (`\\b`). |
| `flags` | no | Regex flags. Use `i` for case-insensitive. The engine always adds `g` itself. |
| `message` | yes | One short sentence. Says the phrase "reads as AI". Never says the text "is AI". |
| `why` | yes | One or two sentences, plain language, explaining why readers notice it. |
| `fix` | yes | A concrete suggestion. |
| `examples.flag` | yes | At least one sentence the pattern MUST match. |
| `examples.pass` | yes | At least one sentence the pattern must NOT match. Pick a near miss. |

## The strict pack

`rules/en-strict.json` has the same format plus `"strict": true` at the top. Its rules flag common filler words (like "really" or "robust") that strict house styles avoid. They are all `low` severity and stay off unless the `strictStyle` option is on. Words with normal everyday uses belong here, not in `en.json`.

A single rule can also carry `"strict": true` to join the strict pack.

## Writing a good rule

- Match the tell, not ordinary language. "Robust" alone is fine in engineering. Prefer phrases over single words when a word has normal uses.
- Your `pass` example should be a near miss that a sloppy pattern would wrongly catch.
- Handle both straight and curly apostrophes: write `['’]` instead of `'`.
- Keep messages friendly. People using this tool want to write better, not be scolded.
