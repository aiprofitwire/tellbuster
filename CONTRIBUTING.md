# Contributing to Tellbuster

Thank you for helping. The easiest and most valuable contribution is a new rule: a phrase that makes writing read like AI.

## Suggest a tell (no coding)

Go to **Issues > New issue** and pick **Suggest a new tell**. Fill in the phrase, why it reads as AI, and one example sentence. We will turn it into a rule.

If Tellbuster flagged something that reads fine, pick **Report a wrong flag** instead.

## Your first rule in 5 minutes

You can do all of this on the GitHub website. No install needed.

1. Pick an idea. The issues labeled `good first issue` each describe one missing rule. Or use your own.
2. Open [`rules/en.json`](rules/en.json) on GitHub and click the pencil icon (**Edit this file**). GitHub makes a copy for you if needed.
3. Find the last rule in the file. It ends with `}` just before the closing `]`. Type a comma after that `}`, then paste this under it:

   ```json
   {
     "id": "en-shed-light",
     "name": "\"Shed light on\"",
     "category": "phrase",
     "severity": "medium",
     "pattern": "\\bsh(ed|eds|edding)\\s+(some\\s+)?light\\s+on\\b",
     "flags": "i",
     "message": "\"Shed light on\" reads as AI.",
     "why": "AI models reach for this phrase to mean \"explain\", so it shows up in a lot of generated reports.",
     "fix": "Say what it does: \"explains\", \"shows\" or \"answers\".",
     "examples": {
       "flag": ["This study sheds light on the problem."],
       "pass": ["The lamp sheds a soft glow on the desk."]
     }
   }
   ```

4. Change each part for your phrase:
   - `id`: `en-` plus a short name in lowercase with dashes. It must be new.
   - `name`: what users see on the card.
   - `pattern`: the words to find. `\\b` means "start or end of a word", `\\s+` means "a space", and `(ed|eds)` means "either ending". If this part is hard, keep it simple and say so in your pull request. We will help.
   - `message`, `why`, `fix`: short and friendly. Say the phrase "reads as AI", never that the text "is AI".
   - `examples.flag`: a sentence that must be caught. `examples.pass`: a close sentence that must not be.
5. Click **Commit changes**, then **Propose changes**, then **Create pull request**. The form has a short checklist.
6. Wait about a minute. A check called **Tests** runs on your pull request. A green tick means your rule works. A red cross means an example did not match: click **Details** to see which one, edit the file again, and it runs again.

That is it. A maintainer reviews it and merges it.

## Add a rule yourself

1. Open the rules file for your language, for example [`rules/en.json`](rules/en.json).
2. Copy an existing rule and change it. The format is explained in [`rules/schema.md`](rules/schema.md).
   If the word has normal everyday uses (like "really" or "robust"), it goes in [`rules/en-strict.json`](rules/en-strict.json) instead. That pack is off unless the user turns on strict mode.
3. Include at least one `flag` example (must be caught) and one `pass` example (a near miss that must not be caught).
4. Run `node --test` if you can. If not, the **Tests** check runs on your pull request by itself.
5. Open a pull request.

## Add a language

Create `rules/<code>.json` (for example `rules/es.json`) with the same format. Start small: 10 good rules beat 50 noisy ones.

To let Tellbuster guess your language, add a line of short common words for it to `COMMON_WORDS` in `packages/core/src/index.js`. Pick words that are frequent in your language and rare in the others. Then add the file to `LANGUAGES` in `packages/extension/settings.js` and to the web demo in `docs/app.js`, and run `node scripts/sync-docs.js` and `node scripts/sync-extension.js` if you work on your own computer. If you edit on the GitHub website, skip that: the copies update themselves after your change is merged.

## House style

- Messages say a phrase "reads as AI". Never that text "is AI".
- Plain, friendly language. No em dashes (the tool flags them).
- Write rules in your own words. Do not copy text from other projects unless their license allows it and you credit them.
