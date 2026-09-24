# CLAUDE.md: Tellbuster

Read this file and `PLAN.md` at the start of every session. They are your only memory of this project.

## What Tellbuster is

A free, open source tool that points out the phrases that make writing read like it came from an AI ("AI tells"), explains why each one reads that way, and suggests a fix. It runs 100% on the user's device.

It ships in three pieces, all in this one repo:

1. `packages/core`: the rule engine, published to npm as `tellbuster`. Zero dependencies. Other projects import it.
2. `packages/extension`: a Chrome extension (Manifest V3) that checks what you type on any site.
3. `docs/`: a one-page web demo (paste text, see the tells), hosted free on GitHub Pages.

The rules live in `rules/*.json` as plain data, one file per language, so non-coders can contribute a new tell in a two-line pull request.

## Who you are working for

The owner is Moe (GitHub: aiprofitwire). He has a web development diploma but has never used Claude Code, runs four businesses, and has limited time. He follows instructions exactly. Everything you tell him must be step by step, in plain language, with no guessing required.

## The non-negotiable rules

1. **Linter, not detector.** Tellbuster never says text "is AI" or "was written by AI". It says a phrase "reads as AI" and explains why. Humans use these phrases too. Every user-facing message must respect this.
2. **Private by design.** No network calls, no analytics, no tracking, no accounts, no remote code. Text never leaves the device. The extension requests the fewest permissions possible.
3. **Zero runtime dependencies in `packages/core`.** Plain modern JavaScript (ES modules). Dev tooling is allowed only if a step in PLAN.md says so.
4. **Every rule has examples.** Each rule in `rules/*.json` must include `examples.flag` (text that must match) and `examples.pass` (text that must not match). Tests enforce this.
5. **No em dashes (the long dash) anywhere in this repo's prose**: docs, UI text, messages, commit messages. The tool flags them, so the project cannot use them. Use commas, colons or parentheses. The only exception is the `en-em-dash` rule itself, which needs the character in its pattern and example.
6. **Plain language everywhere.** Short sentences. No hype words ("revolutionary", "seamless", "game-changer"). If our own docs would trip our own rules, rewrite them.
7. **Credit sources.** Rule ideas are inspired by the MIT-licensed projects listed in `README.md` under Credits. Write rules in your own words. Never copy text from a source without a license that allows it.

## How to run a session

1. Open `PLAN.md`. Find the **first unchecked step** (`- [ ]`). Do only that step. Do not start the next one.
2. Before writing code, read the files the step touches. Do not explore unrelated parts of the repo.
3. Keep the change small and focused. If the step is bigger than expected, finish a clean subset, note what is left in PLAN.md under that step, and stop.
4. Run the tests: `node --test` from the repo root. They must pass before you finish.
5. Tick the step's box in `PLAN.md` (`- [x]`) and add a one-line note under it with the date and what was done.
6. Commit with a short, clear message and open a pull request.
7. The pull request description must end with a section called **How Moe tests this**: numbered steps a non-developer can follow in under 5 minutes (what to click, what he should see). No jargon.

## Budget rules (this project runs on a limited credit)

- Default to the smallest working solution. No frameworks. No build tools unless the step asks for one.
- Do not install packages to explore. Do not run long searches across the repo.
- If a step starts to sprawl, stop at a clean point and write down what is left. A half-done step with good notes is better than a burned budget.

## Repo layout

```
CLAUDE.md            this file
PLAN.md              the build plan with checkboxes
README.md            public project page
CONTRIBUTING.md      how to add a rule or a language
LICENSE              MIT
rules/
  en.json            English rules
  fr.json            French rules (added in a later step)
  schema.md          the rule format, explained
packages/
  core/              the engine (npm package "tellbuster")
  extension/         the Chrome extension
docs/                the web demo (GitHub Pages)
test/                tests, run with `node --test`
```

## Rule format

See `rules/schema.md`. Each rule is an object with `id`, `name`, `category`, `severity`, `pattern`, `flags`, `message`, `why`, `fix`, and `examples` (`flag` and `pass` arrays).

## Design rules (web demo, extension popup, panel, settings)

Tellbuster must look calm, trustworthy and simple enough for someone who has never installed an extension. Every screen follows these rules.

- **Calm and clean.** Lots of white space, one accent color, no gradients, no clutter. It should feel like a good writing tool, not a security scanner.
- **Light and dark mode**, following the user's system setting. Define colors once as CSS variables.
- **Readable text.** System font stack only (no external fonts). Body text 17px on desktop, 16px minimum on phones. Line height about 1.6. Writing area no wider than about 720px.
- **Highlights by severity, never alarming.** High: soft red underline. Medium: amber underline. Low: gray dotted underline. Show a small legend. No red backgrounds, no warning icons.
- **Explain on the spot.** Hovering or tapping a highlight shows a small card: the rule name, the why, and the fix. The side list shows the same cards.
- **Friendly words.** The count reads "3 phrases might read as AI", never "AI detected" or a percentage score. Zero findings reads "No tells found. Nice work."
- **Helpful empty state.** Before anything is typed, show a one-line hint and a "Try an example" button.
- **Small useful actions:** Clear, Copy text, and a "Turn off this rule" link on each card (the web demo can hide the rule for the session).
- **Works on phones.** Test at 375px wide. Tap targets at least 44px. Panels stack under the text on small screens.
- **Accessible.** Color contrast meets WCAG AA. Everything works with the keyboard. Highlights are not shown by color alone (use underline style too).
- **Same look everywhere.** The extension popup, badge panel and settings page reuse the web demo's colors and card style.
