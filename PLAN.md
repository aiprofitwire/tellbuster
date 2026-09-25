# PLAN.md: the Tellbuster build plan

**How this file works:** each session, Claude Code does the first unchecked step, ticks it, adds a dated note, and opens a pull request. One step per session. The maintainer picks the model in the session settings using the **Model** column below.

**Deadline:** the $100 cloud credit expires **November 5, 2026 at 2:59 AM Eastern**. All build steps must be merged before then.

**Budget guide:** estimates are rough. After each session, the maintainer checks the credit balance on claude.ai. If less than $15 is left, skip to Step 9 (publish prep) so what exists ships.

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

How to test: open the pull request, click **Checks** or read the test output Claude Code posts. It must say all tests pass. Nothing to install.

## Step 2: English rules to 40
- [x] Grow `rules/en.json` from 15 to about 40 rules.
  - Done 2026-09-24. Added 26 rules (41 total) covering chatbot openers and sign-offs, hedges, hype lines, stock metaphors, emoji bullets and abstract lists of three. All 54 tests pass.

- Cover the common AI tells: stock openers and closers, hedging filler ("It's important to remember"), "Not only X but also Y", rule-of-three lists with abstract nouns, "In the realm of", "embark on a journey", "ever-evolving", "a myriad of", "foster", "resonate", "unleash", "harness the power", "Certainly!", "Great question", "As an AI", overuse of "Imagine...", emoji bullet headers, "Let that sink in", "Read that again", "This changes everything".
- Each rule written in our own words, with flag and pass examples, following `rules/schema.md`.
- Prefer phrases over single words when a word has normal uses. Keep `severity` honest.
- All tests must pass.

How to test: open `rules/en.json` on GitHub and skim 5 random rules. Each should read like a friendly note, not a scolding.

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

How to test (after merge): on GitHub, go to **Settings > Pages**, under **Source** pick **Deploy from a branch**, branch `main`, folder `/docs`, click **Save**. Wait 2 minutes, then open `https://aiprofitwire.github.io/tellbuster/`. Click **Try an example**. Tells should light up with explanations.

## Step 4: Chrome extension, popup checker
- [x] Build `packages/extension` with a popup checker.
  - Done 2026-09-24. Added packages/extension (manifest, popup reusing the web demo's app.js and style.css, right-click "Check with Tellbuster", icons), scripts/sync-extension.js, and tests for the copies and the permissions. Loaded and checked in Chromium.

- Manifest V3. Name "Tellbuster". Permissions: only `storage` for now. No host permissions yet. (`activeTab` was later removed as unused, 2026-09-24.)
- Clicking the toolbar icon opens a popup with a text box: paste text, see findings (same look as the web demo, compact).
- A right-click menu item "Check with Tellbuster" on selected text opens the popup pre-filled with the selection (add `contextMenus` permission for this).
- The extension folder must work when loaded directly (no build step for the maintainer). If core and rules must be copied in, add `scripts/sync-extension.js`, run it, and commit the copied files in `packages/extension/vendor/`.
- Simple icon set (16, 48, 128 px). A plain magnifying glass over a speech bubble is fine.

How to test: on the repo page click **Code > Download ZIP**, unzip it. In Chrome go to `chrome://extensions`, turn on **Developer mode** (top right), click **Load unpacked**, pick the `packages/extension` folder. Click the Tellbuster icon, paste a sloppy paragraph, see the findings.

## Step 5: Chrome extension, check as you type
- [x] Check text boxes on any site while the user writes.
  - Done 2026-09-24. Added packages/extension/content.js (badge and panel in a closed shadow root, checks after a 500 ms pause, Alt+Shift+T and Esc for keyboard users), background.js now does the checking, site access explained in both READMEs, new tests for the permissions and for no network calls in content.js. Checked in Chromium on a textarea, a contenteditable, an editor inside a shadow root, and a page with a strict security policy. Not tried on the real LinkedIn or Gmail (no login in the test browser).
  - Fix 2026-09-24 after real-site testing: LinkedIn's post box is in a modal dialog, so the badge now moves inside it (with a fix for dialogs that use a transform). X's editor redraws text without an "input" event, so the badge now also watches the text itself and notices focus through selectionchange. Added a debug log (localStorage tellbusterDebug = 1), test pages in test/pages/ and scripts/serve-test-pages.js.

- A content script watches the focused text box (textarea and contenteditable, which covers LinkedIn, X, Gmail and most sites).
- A small floating badge near the box shows the count ("3 tells"). Clicking it opens a panel listing findings with the why and the fix.
- Underlining inside other sites' editors is fragile. Do not attempt it in this step. The badge and panel are enough for v1.
- Checks run after the user pauses typing (debounce about 500 ms). Must never slow down typing or change the user's text.
- Needs host permission for all sites. Explain this in the README: it is required to read what you type, and the text never leaves your device.

How to test: reload the extension on `chrome://extensions` (circular arrow on the Tellbuster card). Open LinkedIn, start a post, type "Let's delve into this game-changer." The badge should show tells.

## Rules expansion (before Step 6)
- [x] Add the sorted candidates from `rules/candidates.md`.
  - Done 2026-09-24. Tiers A and B: 28 new rules in rules/en.json (69 total) and 9 existing rules widened (for example "harness the potential of", "navigate uncertainty", "plays a paramount role"). Tier C: new rules/en-strict.json with 8 low-severity rules, off by default. The engine skips strict rules unless `strictStyle` is on; the extension reads `strictStyle` from chrome.storage.sync (default off) and only loads the strict file then. Tier D skipped. Step 6 still needs the switch: "Strict mode: also flag common filler words". All 108 tests pass.

## Step 6: Settings
- [x] Add an options page.
  - Done 2026-09-24. Added packages/extension/options.html, options.js, options.css and settings.js (languages, strict mode switch, rule groups and single rules, sites where the badge is off, reset). Saved in chrome.storage.sync. The popup, the badge and background.js all read it, and the badge checks again when a setting changes. The badge panel gained "Turn off the badge on this site" and the popup a Settings link. New test/settings.test.js. Checked in Chromium: Em dash turned off stops being flagged in the popup and the badge. Also, at the maintainer's request, check as you type is now opt in: installing asks for no site access. Site access moved to optional_host_permissions, and content.js is only registered (with the new `scripting` permission) after the user ticks "Check as I type" and Chrome allows it. The popup and right-click menu work without it. Checked in Chromium. All 120 tests pass.

- Turn individual rules on and off. Turn whole categories on and off. Pick languages (English now, French after Step 7).
- Turn the as-you-type badge off for specific sites.
- A switch "Strict mode: also flag common filler words" that saves `strictStyle: true` in `chrome.storage.sync`. The engine and extension already read it (see the rules expansion note above).
- Saved with `chrome.storage.sync`. Nothing else stored.

How to test: right-click the Tellbuster icon > **Options**. Turn off "Em dash". Type an em dash in a text box. It should no longer be flagged.

## Step 7: French rules
- [x] Create `rules/fr.json` with about 20 French rules.
  - Done 2026-09-24. Added rules/fr.json (24 rules, including the long dash, English curly quotes and emoji bullets; Quebec and France notes in the why text where they differ). The engine has `guessLanguage` and a `language` option on `check` ("auto" or a code). The web demo loads English and French and says which one it checked as. Settings: French is on by default, plus "Which language is my text in?" (guess, always English, always French). Checked in Chromium. All 153 tests pass. Limit: a text with both languages is checked as one language.

- Cover common AI tells in French: "Dans le monde d'aujourd'hui", "Il est important de noter que", "Plongeons dans", "En conclusion", "Il ne s'agit pas seulement de X, mais de Y", "un véritable levier", "incontournable", "force est de constater", "à l'ère du numérique", "n'hésitez pas à", plus French typographic tells used in AI output.
- Where Quebec French and France French differ, note it in the `why` text.
- The engine picks rules by language: add a simple language guess (share of common French words) with a manual override in settings.
- All tests pass.

How to test: in the web demo or popup, paste "Dans le monde d'aujourd'hui, il est important de noter que..." The French tells should show.

## Step 8: Contributor setup and automatic tests
- [x] Make contributing easy and safe.
  - Done 2026-09-24. The test workflow already existed, so kept it. Added the "Suggest a new tell" and "Report a wrong flag" issue forms, a pull request checklist, a "Your first rule in 5 minutes" walkthrough in CONTRIBUTING.md (with a test that keeps its example rule valid), and docs/first-issues.md with 10 checked rule ideas to paste as `good first issue` issues. Issues were not created on GitHub: the maintainer posts them after merge. All 154 tests pass.

- `.github/workflows/test.yml`: run `node --test` on every pull request.
- `.github/ISSUE_TEMPLATE/new-rule.yml`: a form to suggest a new tell (phrase, why, example) for people who do not code.
- `.github/ISSUE_TEMPLATE/false-positive.yml`: report a phrase flagged by mistake.
- `.github/pull_request_template.md`: checklist for rule PRs.
- Update `CONTRIBUTING.md` with a "your first rule in 5 minutes" walkthrough.
- Create 10 issues labeled `good first issue`, each proposing one specific missing rule (write them as a markdown list in `docs/first-issues.md` so the maintainer can paste them into GitHub if Claude Code cannot create issues directly).

How to test: open the repo's **Issues > New issue**. The "Suggest a new tell" form should appear.

## Step 9: Publish prep
- [x] Get everything ready to go public.
  - Done 2026-09-24. packages/core/package.json gained keywords, homepage, repository and bugs. Added docs/PUBLISHING.md (Pages, npm, Chrome Web Store, later releases), scripts/zip-extension.js (no packages, runs the sync first), docs/privacy.html, docs/store-listing.md (short description is the manifest one, 115 characters, plus permission answers for the store form) and test/publish.test.js. README now has a Get it table, screenshot placeholders and a privacy link. The name tellbuster was free on npm today. Open question for the maintainer: the npm package has no rule files in it (see PUBLISHING.md, Part 2). All 158 tests pass.

- `packages/core`: confirm package.json fields (description, keywords, repository, homepage). Write the exact commands the maintainer runs to publish to npm in `docs/PUBLISHING.md`.
- `scripts/zip-extension.js`: creates `tellbuster-extension.zip` for the Chrome Web Store.
- `docs/privacy.html`: plain privacy policy (no data collected, nothing leaves the device). The Chrome Web Store requires one.
- `docs/store-listing.md`: Chrome Web Store title, short description (132 characters max, count it), long description, and a list of 5 screenshots to take.
- Final README pass: screenshots placeholders, install links, credits.

How to test: read `docs/PUBLISHING.md` top to bottom. Every step should be clear enough to follow without asking anyone.

---

## Step 9b: Landing page from the approved design
- [x] Rebuild `docs/index.html` to match `design/landing/` exactly (see its README).
  - Done 2026-09-24. New docs/index.html, landing.css and landing.js. The hero's post box is the real checker (Before and After load the design's two texts, Clear then Try an example still works, the badge opens a list of all notes). Fonts self-hosted in docs/fonts/ with their licenses. docs/og.png rendered from the social card, with og: and twitter: tags. Rule count is 94 (English plus French), updated from the rules at load. app.js now tells the page after each check; extension copies synced. Dark mode added. Checked in Chromium at 1440, 900 and 390 px, no outside requests. New test/landing.test.js. All 167 tests pass.

- Keep the working checker: the hero's Before / After demo becomes the real editor with live underlines, and "Try an example" still works.
- Self-host the fonts in `docs/fonts/` (no Google Fonts link). Add the social card as `docs/og.png` (render `design/landing/social-card.html` at 1200x630) with `og:` and `twitter:` meta tags.
- Match desktop (1440px) and phone (390px, left-aligned). Replace `[RULE COUNT]` with the real default rule count, read from the rules file at load time.
- Keep all existing tests passing and the demo's copy tests in sync.

How to test: open the GitHub Pages site on a computer and a phone. It should look like the approved design, the demo should work, and pasting the link into a LinkedIn post draft should show the preview card.

## Step 10: Launch video
- [x] A 30 to 45 second launch video built with Remotion in `video/` (kept out of the extension and the npm package).
  - Done 2026-09-24. Added video/ (Remotion, 36 seconds, square 1080x1080 and tall 1080x1920) with `npm run render`, video/out/ in .gitignore, docs/media/demo.gif (1.4 MB) at the top of README.md, and test/video.test.js (captions have no tells, the underlines come from the real engine, nothing in packages/ or docs/ uses video/). The MP4 files are not committed: they were sent to the maintainer in the session, and video/README.md explains how to render them. All 177 tests pass.

- Scene: a sloppy AI-style paragraph gets underlined live, a card opens with the why and the fix, the text gets rewritten plainly, then the end card: "Tellbuster. Free, open source, nothing leaves your browser." plus the landing page address `aiprofitwire.github.io/tellbuster` (never the store link, which can change).
- Captions only, no voiceover. Uses the demo's real colors and logo. Exports 1080x1080 (LinkedIn, X) and 1080x1920 (Shorts), plus a short GIF for the README.
- Keep the repo small: add `video/out/` to `.gitignore` so the MP4 files are never committed. Commit only the README GIF, at `docs/media/demo.gif`, under 3 MB (lower the frame rate or size if needed), and show it near the top of `README.md`.
- The MP4 files are handed to the maintainer, not committed. The pull request says where to find them (for example, attached to a draft GitHub Release named "Launch video"), or explains how to render them locally with one command.
- Remotion is not MIT licensed: it is free for individuals and companies of up to 3 people, and bigger companies need a paid license. Say this in one line in `video/README.md`. The `video/` folder must stay separate: nothing in `packages/` or `docs/` may depend on it.

How to test: open `README.md` on GitHub and check that the GIF plays and reads clearly. Then watch both MP4 files with the sound off: they should play smoothly and every caption should be readable.

## Step 11: Feedback link
- [x] Add a "Report a wrong flag" link on every card (web demo and extension) that opens the false-positive issue form on GitHub, pre-filled with the rule id. Only the rule id goes in the link, never the user's text.
  - Done 2026-09-24. Every card in the web demo, the popup and the badge panel now has "Report a wrong flag" next to "Turn off this rule". It opens the wrong flag form with the rule id in the title and the "Which rule?" field, and nothing else. New test/report-link.test.js. Checked the link in Chromium on the web demo at 1280px and 375px. All 182 tests pass.

How to test: click the link on any card. A GitHub issue form opens with the rule name filled in.

## Step 12: More browsers
- [x] Make the extension work in Firefox and Edge.
  - Done 2026-09-24. Added scripts/zip-firefox.js (same files, Firefox manifest: background script instead of service worker, gecko id, data_collection_permissions none, Firefox 140+) with the zip code shared in scripts/zip-tools.js, and a test. docs/PUBLISHING.md gained Edge (Part 4), Firefox (Part 5) and Safari as a later option (Part 6). READMEs list Chrome, Edge, Firefox, Brave, Opera, Vivaldi and Arc. Mozilla's addons-linter passes with 0 errors (4 innerHTML warnings in app.js, all escaped, explained in the reviewer note). Not run in a real Firefox: Firefox could not be downloaded in the cloud session, so the maintainer's Firefox test in Part 5b is the first real run. All 183 tests pass.

- Edge runs Chrome extensions as they are: write the Edge Add-ons publishing steps in `docs/PUBLISHING.md`.
- Firefox: add what Manifest V3 on Firefox needs (for example `browser_specific_settings`), test in Firefox, add a zip script for addons.mozilla.org.
- Brave, Opera, Arc and Vivaldi run Chrome extensions from the Chrome Web Store: confirm in the README that they are supported.
- Safari needs Apple's Xcode converter and a paid Apple developer account: write the steps in `docs/PUBLISHING.md` as a later option, do not build it now.

How to test: follow the Firefox steps in `docs/PUBLISHING.md` to load it temporarily in Firefox and check a LinkedIn post.

## Step 13: French interface, and room for more languages
- [x] Make Tellbuster fully French for French speakers, and open the door for native speakers to add Spanish, German and Portuguese.
  - Part A done 2026-09-25. The message, why and fix of all 24 rules in rules/fr.json are now in French (ids, patterns and examples unchanged). New docs/i18n.js holds every interface word, English and French, one block per language (copied to the extension by sync-extension.js). The popup, the settings page, the badge panel and the right-click menu follow the browser's language. The landing page stays English, but `?lang=fr` switches its checker to French, with a French "Try an example". New test/i18n.test.js. Checked in Chromium with a French browser. All 189 tests pass.
  - Left for the next session (Part B, not started): rules/es.json, de.json and pt.json with 3 to 5 starter rules each, their common words in guessLanguage, the three languages in settings.js LANGUAGES, the web demo's rule list in app.js and both sync scripts, their language names are already in docs/i18n.js, tests, and the 3 issue drafts in docs/first-issues.md. Tick this box when Part B is done.
  - Part B done 2026-09-25. New rules/es.json, de.json and pt.json with 4 starter rules each (openers, filler, vague intros, chatbot closers), text written in each language. Their common words are in guessLanguage, and the npm bundle now lists English, then French, then the rest, so text with no clue is still checked as English. The three languages are in the extension settings (on by default), the web demo, both sync scripts and the tests. The landing page count is now 109 (every language, not the strict pack). CONTRIBUTING.md and rules/schema.md mark them as starter sets. Three issue drafts added to docs/first-issues.md (11 to 13). All 212 tests pass.

Why this shape: a tell in Spanish is not a translated English tell. Rules written by someone who does not speak the language will flag normal writing. Native speakers write better rules, and every one of them is a new outside contributor. So this step builds the French side fully, and for the other languages only the setup plus a few careful starter rules.

Part A, French (do this first):
- Rewrite the `message`, `why` and `fix` of every rule in `rules/fr.json` in French (most are in English today). Plain, Quebec-friendly French. Keep ids, patterns and examples as they are.
- Show the interface in French when the browser language is French: web demo, popup, badge panel and settings page. Keep all interface strings in one small file per language (for example `docs/i18n.js`, copied to the extension by the sync script), so a contributor can add a language by copying one file. English stays the default.
- The landing page (`docs/index.html`) stays English for now.

Part B, setup for Spanish, German and Portuguese:
- Create `rules/es.json`, `rules/de.json` and `rules/pt.json` with 3 to 5 rules each. Pick only tells that are well known in that language (for example direct translations of chatbot openers like "¡Por supuesto!" or "Zusammenfassend lässt sich sagen"), with conservative patterns and full examples. Mark each file's intro in `rules/schema.md` or CONTRIBUTING.md as "starter set, native speakers welcome".
- Add the common words for es, de and pt to the language guess, and add the three languages to the extension settings and the web demo, like French.
- Update the sync scripts, the npm bundle and the tests so the new files are covered the same way as en and fr.
- Write 3 issue drafts in `docs/first-issues.md`, one per language, titled like "Add 5 Spanish rules (native speakers wanted)". Each explains what makes a good tell in that language, links CONTRIBUTING.md, and asks for a flag and a pass example per rule. Do not add those rules yourself. Open the 3 issues on GitHub with the labels `good first issue`, `new rule` and `hacktoberfest` if you can, otherwise leave the drafts for the maintainer to post.

If the step starts to sprawl, finish Part A, write down what is left of Part B, and stop.

How to test: set the browser language to French (or open the demo with `?lang=fr`) and check that the demo, popup, badge panel and settings are in French, and that French findings show French text. Then paste "¡Por supuesto! Aquí tienes un resumen." into the demo: at least one Spanish tell should show.

## Step 14: Command-line tool
- [ ] Add a `tellbuster` command to the npm package (a `bin` entry in `packages/core/package.json`, no dependencies).

- `npx tellbuster README.md docs/*.md` checks files and prints each finding as `file:line:column  severity  name: message`.
- `echo "text" | npx tellbuster` checks text from standard input.
- Options: `--strict`, `--lang en|fr|auto`, `--disable id1,id2`, `--json` (machine-readable output), `--max-severity low|medium|high` (fail only at or above this level).
- Exit code 1 when a finding at or above the threshold is found (for scripts and CI), 0 otherwise.
- Tests for each option. Document it in `packages/core/README.md`.

How to test: in the repo folder, run `echo "Let's delve into this." | node packages/core/bin/tellbuster.js`. It should list the tell.

## Step 15: GitHub Action
- [ ] Publish a reusable GitHub Action from this repo (`action.yml` at the root, a composite action that runs the command-line tool with `npx tellbuster@latest`).

- Inputs: `files` (glob, default `**/*.md`), `strict`, `lang`, `disable`, `fail-on` (severity, default `high`).
- Posts findings as GitHub annotations (`::warning file=...,line=...::message`) so they show on the pull request's changed lines.
- An example workflow in `docs/github-action.md` that anyone can copy. Use it on this repo's own docs as the first user.
- Check that it runs green on this repo.

How to test: open a pull request that adds "Let's delve into this" to a markdown file. The Action should add a warning on that line.

## Step 16: Tellbuster for AI agents (MCP server and Claude Code skill)
- [ ] Let AI agents check their own writing before showing it.

- `packages/mcp`: a small MCP server (npm name `tellbuster-mcp`, stdio transport) with one tool, `check_writing(text, strict?, lang?)`, returning findings with the why and the fix. Keep dependencies to the official MCP SDK only.
- `skills/tellbuster/SKILL.md`: a Claude Code skill that tells the agent to run `npx tellbuster` on any draft it writes for publishing and to rewrite flagged phrases.
- Setup instructions for Claude Code, Claude Desktop and Cursor in `packages/mcp/README.md`.
- Tests for the tool's output shape.

How to test: follow the Claude Code setup in `packages/mcp/README.md`, ask Claude to write a LinkedIn post, and ask it to check the post with Tellbuster.

---

## After the build (done by the maintainer outside Claude Code)

Launch kit: Show HN post, LinkedIn post with a demo GIF, X thread, AI Profit Wire newsletter feature, and a submission to relevant awesome lists. Prepared in chat, not with cloud credit.
