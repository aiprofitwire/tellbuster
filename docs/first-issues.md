# First issues

Ten starter issues, each proposing one missing English rule, plus three issues asking native speakers for Spanish, German and Portuguese rules (at the end). Every idea was checked: none of them is caught by the current rules, and each suggested pattern catches its flag example and skips its pass example.

**To post them:** on GitHub go to **Issues > New issue > Open a blank issue**. Copy the title and the body of one issue below, add the labels `good first issue` and `new rule` (issues 11 to 13 also get `hacktoberfest`), and click **Submit new issue**. Repeat for each one.

## 1. Add a rule for "Pave the way for"

**Title:** New rule: "Pave the way for"

**Body:**

```markdown
Add a rule to `rules/en.json` for "Pave the way for".

**Why it reads as AI:** AI text uses "paves the way for" to announce that one thing leads to another, often with no detail about how.

**Suggested fix text:** Say what it makes possible: "lets us ship faster".

- Category: `phrase`
- Severity: `medium`
- A starting pattern: `\\bpav(e|es|ed|ing)\\s+the\\s+way\\s+for\\b` with flags `i`
- Must flag: "This update paves the way for faster releases."
- Must not flag: "The city will pave the road next spring."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 2. Add a rule for "It's no secret that"

**Title:** New rule: "It's no secret that"

**Body:**

```markdown
Add a rule to `rules/en.json` for "It's no secret that".

**Why it reads as AI:** A stock opener that pretends to reveal something while stating the obvious. AI drafts use it to start paragraphs.

**Suggested fix text:** Cut it and start with the point: "Sleep matters."

- Category: `phrase`
- Severity: `medium`
- A starting pattern: `\\bit['’]?s\\s+no\\s+secret\\s+that\\b` with flags `i`
- Must flag: "It's no secret that sleep matters."
- Must not flag: "The recipe is a family secret."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 3. Add a rule for "At the end of the day," as an opener

**Title:** New rule: "At the end of the day," as an opener

**Body:**

```markdown
Add a rule to `rules/en.json` for "At the end of the day," as an opener.

**Why it reads as AI:** Used as a sentence opener, it wraps up an argument with a cliché. Keep it low: people say it a lot too. Only flag it at the start of a sentence, followed by a comma, so "I read at the end of the day" is fine.

**Suggested fix text:** Cut it, or say "In the end" or "What matters is".

- Category: `filler`
- Severity: `low`
- A starting pattern: `(^|[.!?]\\s+)at\\s+the\\s+end\\s+of\\s+the\\s+day,` with flags `im`
- Must flag: "At the end of the day, it works."
- Must not flag: "I read a book at the end of the day."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 4. Add a rule for "A holistic approach"

**Title:** New rule: "A holistic approach"

**Body:**

```markdown
Add a rule to `rules/en.json` for "A holistic approach".

**Why it reads as AI:** "Holistic approach" and "holistic view" sound thorough without saying what is covered. Common in AI business and health copy.

**Suggested fix text:** Name the parts: "We look at pricing, hiring and support together."

- Category: `phrase`
- Severity: `medium`
- A starting pattern: `\\bholistic\\s+(approach|view|perspective|understanding)\\b` with flags `i`
- Must flag: "We take a holistic approach to growth."
- Must not flag: "She trained in holistic medicine."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 5. Add a rule for "Ahead of the curve"

**Title:** New rule: "Ahead of the curve"

**Body:**

```markdown
Add a rule to `rules/en.json` for "Ahead of the curve".

**Why it reads as AI:** A marketing cliché AI uses to promise an edge. It rarely says what the reader will know or do first.

**Suggested fix text:** Say the real benefit: "Learn the new rules before they start in May."

- Category: `phrase`
- Severity: `medium`
- A starting pattern: `\\bahead\\s+of\\s+the\\s+curve\\b` with flags `i`
- Must flag: "Stay ahead of the curve with these tips."
- Must not flag: "The runner pulled ahead on the last curve."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 6. Add a rule for "Look no further"

**Title:** New rule: "Look no further"

**Body:**

```markdown
Add a rule to `rules/en.json` for "Look no further".

**Why it reads as AI:** A sales line that AI puts right after a question like "Looking for X?". Readers skim past it.

**Suggested fix text:** Cut it and describe the thing: "This planner fits in a pocket."

- Category: `phrase`
- Severity: `medium`
- A starting pattern: `\\blook\\s+no\\s+further\\b` with flags `i`
- Must flag: "Looking for a planner? Look no further."
- Must not flag: "Look further down the page for the map."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 7. Add a rule for "A treasure trove of"

**Title:** New rule: "A treasure trove of"

**Body:**

```markdown
Add a rule to `rules/en.json` for "A treasure trove of".

**Why it reads as AI:** AI uses "treasure trove" to make any collection sound exciting, from data to recipes.

**Suggested fix text:** Say what is in it: "The archive has 400 letters from the 1920s."

- Category: `phrase`
- Severity: `medium`
- A starting pattern: `\\btreasure\\s+trove\\s+of\\b` with flags `i`
- Must flag: "The archive is a treasure trove of insights."
- Must not flag: "The kids found a toy treasure chest."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 8. Add a rule for "Without further ado"

**Title:** New rule: "Without further ado"

**Body:**

```markdown
Add a rule to `rules/en.json` for "Without further ado".

**Why it reads as AI:** A throat-clearing line before a list or reveal. AI drafts use it to fill space.

**Suggested fix text:** Cut it. Start the list.

- Category: `filler`
- Severity: `medium`
- A starting pattern: `\\bwithout\\s+further\\s+ado\\b` with flags `i`
- Must flag: "Without further ado, here is the list."
- Must not flag: "We started without further delay."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 9. Add a rule for "A delicate balance" and "strike a balance"

**Title:** New rule: "A delicate balance" and "strike a balance"

**Body:**

```markdown
Add a rule to `rules/en.json` for "A delicate balance" and "strike a balance".

**Why it reads as AI:** AI leans on balance language to sound wise about any trade-off. Keep it low: it has honest uses.

**Suggested fix text:** Name the trade-off: "Faster means more expensive. We picked speed."

- Category: `phrase`
- Severity: `low`
- A starting pattern: `\\b(a\\s+delicate\\s+balance|strik(e|es|ing)\\s+(a|the\\s+right)\\s+balance)\\b` with flags `i`
- Must flag: "Finding a delicate balance between cost and speed is key."
- Must not flag: "She kept her balance on the beam."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 10. Add a rule for "A double-edged sword"

**Title:** New rule: "A double-edged sword"

**Body:**

```markdown
Add a rule to `rules/en.json` for "A double-edged sword".

**Why it reads as AI:** A worn metaphor AI uses to say something has pros and cons, without saying which.

**Suggested fix text:** Say the good and the bad: "Social media finds you readers, but it eats your mornings."

- Category: `phrase`
- Severity: `low`
- A starting pattern: `\\bdouble[- ]edged\\s+sword\\b` with flags `i`
- Must flag: "Social media is a double-edged sword."
- Must not flag: "The knife has a double edge."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 11. Add 5 Spanish rules (native speakers wanted)

**Title:** Add 5 Spanish rules (native speakers wanted)

**Labels:** `good first issue`, `new rule`, `hacktoberfest`

**Body:**

```markdown
Tellbuster has a small starter set of Spanish rules in `rules/es.json` (4 rules). We need a native speaker to add about 5 more.

**What makes a good Spanish tell:** a phrase that chatbots write in Spanish far more often than people do. Good places to look: stock openers and closers of chatbot replies, filler that announces a point instead of making it, and vague intros. A tell is not a translated English tell: if people use the phrase every day, it does not belong here.

**Already covered, so pick something else:** "¡Por supuesto!" and "¡Claro que sí!" as openers, "Aquí tienes un resumen", "Es importante destacar que", "En el mundo actual".

**Ideas to start from (check them, you know the language better than we do):** "desempeña un papel fundamental / crucial / clave", "navegar por el complejo panorama de", "es un recordatorio de que".

**For each rule, please include:**

- At least one `flag` sentence: normal Spanish that the rule must catch.
- At least one `pass` sentence: a close, normal sentence that the rule must not catch.
- The `name`, `message`, `why` and `fix` written in Spanish. The message says the phrase reads as AI, never that the text is AI.
- An id that starts with `es-`.

You do not need to write a perfect pattern. Start simple and say so in your pull request: we will help. A pull request with 1 or 2 rules is welcome too.

New here? Follow "Your first rule in 5 minutes" and "Spanish, German and Portuguese" in [CONTRIBUTING.md](https://github.com/aiprofitwire/tellbuster/blob/main/CONTRIBUTING.md). You can do it all on the GitHub website.
```

## 12. Add 5 German rules (native speakers wanted)

**Title:** Add 5 German rules (native speakers wanted)

**Labels:** `good first issue`, `new rule`, `hacktoberfest`

**Body:**

```markdown
Tellbuster has a small starter set of German rules in `rules/de.json` (4 rules). We need a native speaker to add about 5 more.

**What makes a good German tell:** a phrase that chatbots write in German far more often than people do. Good places to look: stock openers and closers of chatbot replies, filler that announces a point instead of making it, vague intros, and English phrases translated word for word. A tell is not a translated English tell: if people use the phrase every day, it does not belong here.

**Already covered, so pick something else:** "Zusammenfassend lässt sich sagen", "In der heutigen Welt", "Es ist wichtig zu beachten", "Tauchen wir ein".

**Ideas to start from (check them, you know the language better than we do):** "spielt eine entscheidende / zentrale / wesentliche Rolle", "Landschaft" used for business ("die digitale Landschaft", "durch die Landschaft navigieren"), "Es liegt an uns, sicherzustellen, dass".

**For each rule, please include:**

- At least one `flag` sentence: normal German that the rule must catch.
- At least one `pass` sentence: a close, normal sentence that the rule must not catch.
- The `name`, `message`, `why` and `fix` written in German. The message says the phrase reads as AI, never that the text is AI.
- An id that starts with `de-`.

You do not need to write a perfect pattern. Start simple and say so in your pull request: we will help. A pull request with 1 or 2 rules is welcome too.

New here? Follow "Your first rule in 5 minutes" and "Spanish, German and Portuguese" in [CONTRIBUTING.md](https://github.com/aiprofitwire/tellbuster/blob/main/CONTRIBUTING.md). You can do it all on the GitHub website.
```

## 13. Add 5 Portuguese rules (native speakers wanted)

**Title:** Add 5 Portuguese rules (native speakers wanted)

**Labels:** `good first issue`, `new rule`, `hacktoberfest`

**Body:**

```markdown
Tellbuster has a small starter set of Portuguese rules in `rules/pt.json` (4 rules). We need a native speaker to add about 5 more.

**What makes a good Portuguese tell:** a phrase that chatbots write in Portuguese far more often than people do. Good places to look: stock openers and closers of chatbot replies, filler that announces a point instead of making it, and vague intros. Rules should work for both Brazilian and European Portuguese, or say which one they target. A tell is not a translated English tell: if people use the phrase every day, it does not belong here.

**Already covered, so pick something else:** "Aqui está um resumo", "É importante destacar que", "No mundo atual", "Espero ter ajudado".

**Ideas to start from (check them, you know the language better than we do):** "desempenha um papel fundamental / crucial", "serve como um lembrete de que", "vamos mergulhar em" (for a topic).

**For each rule, please include:**

- At least one `flag` sentence: normal Portuguese that the rule must catch.
- At least one `pass` sentence: a close, normal sentence that the rule must not catch.
- The `name`, `message`, `why` and `fix` written in Portuguese. The message says the phrase reads as AI, never that the text is AI.
- An id that starts with `pt-`.

You do not need to write a perfect pattern. Start simple and say so in your pull request: we will help. A pull request with 1 or 2 rules is welcome too.

New here? Follow "Your first rule in 5 minutes" and "Spanish, German and Portuguese" in [CONTRIBUTING.md](https://github.com/aiprofitwire/tellbuster/blob/main/CONTRIBUTING.md). You can do it all on the GitHub website.
```
