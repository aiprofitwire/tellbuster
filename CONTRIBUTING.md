# Contributing to Tellbuster

Thank you for helping. The easiest and most valuable contribution is a new rule: a phrase that makes writing read like AI.

## Suggest a tell (no coding)

Open an issue with the phrase, why it reads as AI, and one example sentence. We will turn it into a rule.

## Add a rule yourself

1. Open the rules file for your language, for example [`rules/en.json`](rules/en.json).
2. Copy an existing rule and change it. The format is explained in [`rules/schema.md`](rules/schema.md).
   If the word has normal everyday uses (like "really" or "robust"), it goes in [`rules/en-strict.json`](rules/en-strict.json) instead. That pack is off unless the user turns on strict mode.
3. Include at least one `flag` example (must be caught) and one `pass` example (a near miss that must not be caught).
4. Run `node --test` if you can. If not, the automatic checks will run on your pull request.
5. Open a pull request.

## Add a language

Create `rules/<code>.json` (for example `rules/es.json`) with the same format. Start small: 10 good rules beat 50 noisy ones.

## House style

- Messages say a phrase "reads as AI". Never that text "is AI".
- Plain, friendly language. No em dashes (the tool flags them).
- Write rules in your own words. Do not copy text from other projects unless their license allows it and you credit them.
