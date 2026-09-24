## What this changes

<!-- One or two sentences. For a new rule: the phrase and why it reads as AI. -->

## Checklist for rule changes

- [ ] The rule id starts with the language code (for example `en-`) and is new. Existing ids are never changed.
- [ ] `message` says the phrase "reads as AI", never that the text "is AI".
- [ ] It has at least one `flag` example and one `pass` example (a near miss that must not be caught).
- [ ] Apostrophes are written as `['’]` so both straight and curly ones match.
- [ ] Words with normal everyday uses go in `rules/en-strict.json`, not `rules/en.json`.
- [ ] `severity` is honest: `high` only for strong tells.
- [ ] Written in my own words. No em dashes in the text.
- [ ] `node --test` passes (or I let the automatic check run on this pull request).

## How to test this

1.
