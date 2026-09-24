# PLAN.md: the Tellbuster build plan

**How this file works:** each session, Claude Code does the first unchecked step, ticks it, adds a dated note, and opens a pull request. One step per session. Moe picks the model in the session settings using the **Model** column below.

**Deadline:** the $100 cloud credit expires **November 5, 2026 at 2:59 AM Eastern**. All build steps must be merged before then.

**Budget guide:** estimates are rough. After each session, Moe checks the credit balance on claude.ai. If less than $15 is left, skip to Step 9 (publish prep) so what exists ships.

| Step | What | Model | Est. credit |
|---|---|---|---|
| 0 | Starter files | none | done (free) |
| 1 | Core engine and tests | Opus 5.5, medium effort | $8 to $14 |
| 2 | English rules to 40 | Sonnet 5 | $6 to $10 |
| 3 | Web demo page | Opus 5.5, medium effort | $10 to $16 |
| 4 | Chrome extension: popup checker | Sonnet 5 | $8 to $12 |
| 5 | Chrome extension: check as you type | Opus 5.5, medium effort | $12 to $20 |
| 6 | Settings: turn rules on and off | Sonnet 5 | $5 to $8 |
| 7 | French rules | Sonnet 5 | $6 to $10 |
| 8 | Contributor setup and automatic tests | Sonnet 5 | $4 to $6 |
| 9 | Publish prep | Sonnet 5 | $5 to $8 |
| | **Total** | | **about $64 to $104** |

Opus goes on the three steps where mistakes are expensive: the engine everything else depends on, in-place highlighting in the demo, and reading other sites' editors (LinkedIn, Gmail). The other steps are mostly data and forms, where Sonnet is plenty. If Step 1 costs more than $14, switch Steps 3 and 5 to Sonnet 5.

---

## Step 0: Starter files
- [x] Done 2026-09-24. Added CLAUDE.md, PLAN.md, README.md, CONTRIBUTING.md, LICENSE, rules/schema.md, rules/en.json (15 rules, all examples verified), and test/rules.test.js.

## Step 1: Core engine and tests
- [x] Build `packages/core`.
  - Done 2026-09-24. Added packages/core (package.json, src/index.js with check, summarize, loadRules, README) and test/core.test.js. All 28 tests pass.

What to build:
- `packages/core/package.json`: name `tellbuster`, version `0.1.0`, `"type": "module"`, MIT license, no dependencies, `exports` pointing to `src/index.js`.
- `packages/core/src/index.js` exporting:
  - `check(text, options)` returns an array of findings, sorted by position. Each finding: `{ ruleId, name, category, severity, start, end, match, message, why, fix }`. Options: `rules` (array of rule objects, required), `disabled` (array of rule ids to skip).
  - `summarize(findings, text)` returns `{ total, bySeverity: {low, medium, high}, perHundredWords }`.
  - `loadRules(json)` validates a rules file object and returns its rules. Throws a clear error naming the rule id and the problem if a rule is malformed.
- Overlapping matches from different rules are all kept. Matches of zero length are ignored. Invalid regex patterns throw a clear error at load time.
- `packages/core/README.md`: install and a 10-line usage example.
- Tests in `test/core.test.js` using `node:test`: finds known tells, respects `disabled`, positions are correct, handles empty text, handles curly apostrophes, `loadRules` rejects a malformed rule.

How Moe tests: open the pull request, click **Checks** or read the test output Claude Code posts. It must say all tests pass. Nothing to install.

## Step 2: English rules to 40
- [x] Grow `rules/en.json` from 15 to about 40 rules.
  - Done 2026-09-24. Added 26 rules (41 total) covering chatbot openers and sign-offs, hedges, hype lines, stock metaphors, emoji bullets and abstract lists of three. All 54 tests pass.

- Cover the common AI tells: stock openers and closers, hedging filler ("It's important to remember"), "Not only X but also Y", rule-of-three lists with abstract nouns, "In the realm of", "embark on a journey", "ever-evolving", "a myriad of", "foster", "resonate", "unleash", "harness the power", "Certainly!", "Great question", "As an AI", overuse of "Imagine...", emoji bullet headers, "Let that sink in", "Read that again", "This changes everything".
- Each rule written in our own words, with flag and pass examples, following `rules/schema.md`.
- Prefer phrases over single words when a word has normal uses. Keep `severity` honest.
- All tests must pass.

How Moe tests: open `rules/en.json` on GitHub and skim 5 random rules. Each should read like a friendly note, not a scolding.

## Step 3: Web demo page
- [x] Build `docs/index.html`, a one-page demo anyone can use without installing anything.
  - Done 2026-09-24. Added docs/index.html, app.js and style.css (underlines behind a see-through text box, hover or tap cards, side list, turn off a rule for the visit, light and dark mode), scripts/sync-docs.js with copies in docs/vendor/, and a test that keeps the copies in sync. Count line follows the CLAUDE.md design rules ("3 phrases might read as AI"). Checked in Chromium at 1280px and 375px.

- A big text box. As the user types or pastes, tells are underlined in place (use a highlight layer behind a transparent textarea, or a contenteditable div; pick the simpler reliable option).
- A side panel lists each finding: name, the message, the why, the fix. Clicking a finding scrolls to it.
- A simple score line: "5 tells found (2 high, 3 medium)". Never a verdict like "AI detected".
- A "Try an example" button that loads a deliberately sloppy sample paragraph.
- Loads `packages/core/src/index.js` and `rules/en.json` directly (no build step). If GitHub Pages cannot reach files outside `docs/`, add a tiny copy script `scripts/sync-docs.js` that copies them into `docs/vendor/`, run it, and commit the copies.
- Clean, readable design. Works on phones. Header says: "Tellbuster: find the phrases that make your writing sound like AI. Free, open source, and nothing leaves your browser." Footer links to the GitHub repo.
- No external scripts, fonts or trackers.

How Moe tests (after merge): on GitHub, go to **Settings > Pages**, under **Source** pick **Deploy from a branch**, branch `main`, folder `/docs`, click **Save**. Wait 2 minutes, then open `https://aiprofitwire.github.io/tellbuster/`. Click **Try an example**. Tells should light up with explanations.

## Step 4: Chrome extension, popup checker
- [ ] Build `packages/extension` with a popup checker.

- Manifest V3. Name "Tellbuster". Permissions: only `storage` and `activeTab` for now. No host permissions yet.
- Clicking the toolbar icon opens a popup with a text box: paste text, see findings (same look as the web demo, compact).
- A right-click menu item "Check with Tellbuster" on selected text opens the popup pre-filled with the selection (add `contextMenus` permission for this).
- The extension folder must work when loaded directly (no build step for Moe). If core and rules must be copied in, add `scripts/sync-extension.js`, run it, and commit the copied files in `packages/extension/vendor/`.
- Simple icon set (16, 48, 128 px). A plain magnifying glass over a speech bubble is fine.

How Moe tests: on the repo page click **Code > Download ZIP**, unzip it. In Chrome go to `chrome://extensions`, turn on **Developer mode** (top right), click **Load unpacked**, pick the `packages/extension` folder. Click the Tellbuster icon, paste a sloppy paragraph, see the findings.

## Step 5: Chrome extension, check as you type
- [ ] Check text boxes on any site while the user writes.

- A content script watches the focused text box (textarea and contenteditable, which covers LinkedIn, X, Gmail and most sites).
- A small floating badge near the box shows the count ("3 tells"). Clicking it opens a panel listing findings with the why and the fix.
- Underlining inside other sites' editors is fragile. Do not attempt it in this step. The badge and panel are enough for v1.
- Checks run after the user pauses typing (debounce about 500 ms). Must never slow down typing or change the user's text.
- Needs host permission for all sites. Explain this in the README: it is required to read what you type, and the text never leaves your device.

How Moe tests: reload the extension on `chrome://extensions` (circular arrow on the Tellbuster card). Open LinkedIn, start a post, type "Let's delve into this game-changer." The badge should show tells.

## Step 6: Settings
- [ ] Add an options page.

- Turn individual rules on and off. Turn whole categories on and off. Pick languages (English now, French after Step 7).
- Turn the as-you-type badge off for specific sites.
- Saved with `chrome.storage.sync`. Nothing else stored.

How Moe tests: right-click the Tellbuster icon > **Options**. Turn off "Em dash". Type an em dash in a text box. It should no longer be flagged.

## Step 7: French rules
- [ ] Create `rules/fr.json` with about 20 French rules.

- Cover common AI tells in French: "Dans le monde d'aujourd'hui", "Il est important de noter que", "Plongeons dans", "En conclusion", "Il ne s'agit pas seulement de X, mais de Y", "un véritable levier", "incontournable", "force est de constater", "à l'ère du numérique", "n'hésitez pas à", plus French typographic tells used in AI output.
- Where Quebec French and France French differ, note it in the `why` text.
- The engine picks rules by language: add a simple language guess (share of common French words) with a manual override in settings.
- All tests pass.

How Moe tests: in the web demo or popup, paste "Dans le monde d'aujourd'hui, il est important de noter que..." The French tells should show.

## Step 8: Contributor setup and automatic tests
- [ ] Make contributing easy and safe.

- `.github/workflows/test.yml`: run `node --test` on every pull request.
- `.github/ISSUE_TEMPLATE/new-rule.yml`: a form to suggest a new tell (phrase, why, example) for people who do not code.
- `.github/ISSUE_TEMPLATE/false-positive.yml`: report a phrase flagged by mistake.
- `.github/pull_request_template.md`: checklist for rule PRs.
- Update `CONTRIBUTING.md` with a "your first rule in 5 minutes" walkthrough.
- Create 10 issues labeled `good first issue`, each proposing one specific missing rule (write them as a markdown list in `docs/first-issues.md` so Moe can paste them into GitHub if Claude Code cannot create issues directly).

How Moe tests: open the repo's **Issues > New issue**. The "Suggest a new tell" form should appear.

## Step 9: Publish prep
- [ ] Get everything ready to go public.

- `packages/core`: confirm package.json fields (description, keywords, repository, homepage). Write the exact commands Moe runs to publish to npm in `docs/PUBLISHING.md`.
- `scripts/zip-extension.js`: creates `tellbuster-extension.zip` for the Chrome Web Store.
- `docs/privacy.html`: plain privacy policy (no data collected, nothing leaves the device). The Chrome Web Store requires one.
- `docs/store-listing.md`: Chrome Web Store title, short description (132 characters max, count it), long description, and a list of 5 screenshots to take.
- Final README pass: screenshots placeholders, install links, credits.

How Moe tests: read `docs/PUBLISHING.md` top to bottom. Every step should be clear enough to follow without asking anyone.

---

## After the build (done with Moe outside Claude Code)

Launch kit: Show HN post, LinkedIn post with a demo GIF, X thread, AI Profit Wire newsletter feature, and a submission to relevant awesome lists. Prepared in chat, not with cloud credit.
