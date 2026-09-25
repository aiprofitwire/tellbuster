# More first issues

Fifteen more starter issues, each proposing one missing English rule. They follow the same shape as [first-issues.md](first-issues.md), which is now mostly posted.

Every idea here was checked against the shipped rules with the real engine: none of them is already caught, each pattern compiles, each one catches its flag example, and each one skips its pass example.

**To post them:** on GitHub go to **Issues > New issue > Open a blank issue**. Copy the title and the body of one issue below, add the labels `good first issue`, `new rule` and `hacktoberfest`, and click **Submit new issue**. Repeat for each one.

**Leave these to newcomers.** Like the first set, these rules are reserved for outside contributors. Do not add them yourself.

## 1. Add a rule for "Gone are the days"

**Title:** New rule: "Gone are the days"

**Body:**

```markdown
Add a rule to `rules/en.json` for "Gone are the days".

**Why it reads as AI:** A stock opener that sets up a before-and-after with no evidence. AI drafts reach for it constantly to start a paragraph about change.

**Suggested fix text:** Say what changed and when: "Since 2023, most teams ship weekly."

- Category: `phrase`
- Severity: `medium`
- A starting pattern: `\\bgone\\s+are\\s+the\\s+days\\b` with flags `i`
- Must flag: "Gone are the days of waiting weeks for a build."
- Must not flag: "Those days are gone and nobody misses them."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 2. Add a rule for "Say goodbye to"

**Title:** New rule: "Say goodbye to"

**Body:**

```markdown
Add a rule to `rules/en.json` for "Say goodbye to".

**Why it reads as AI:** A sales-page formula for introducing a fix. AI writing borrows it from marketing copy and uses it on anything.

**Suggested fix text:** Name the problem it removes: "No more retyping the same address."

- Category: `phrase`
- Severity: `medium`
- A starting pattern: `(?<=^|[.!?]\\s+|\\n\\s*)Say\\s+goodbye\\s+to\\b` with flags `i`
- Must flag: "Say goodbye to messy spreadsheets."
- Must not flag: "We had to say goodbye to our old office."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 3. Add a rule for "Boasts" for features

**Title:** New rule: "Boasts" for features

**Body:**

```markdown
Add a rule to `rules/en.json` for "Boasts" for features.

**Why it reads as AI:** Brochure writing gives objects the ability to brag. People say a thing "has" a feature. AI product copy says it "boasts" one.

**Suggested fix text:** Use "has" or just name it: "The app has a dark mode."

- Category: `word-choice`
- Severity: `medium`
- A starting pattern: `\\bboast(s|ed|ing)\\s+(an?|the|its|their|over|more\\s+than|\\d)\\b` with flags `i`
- Must flag: "The app boasts a sleek interface."
- Must not flag: "He boasted about his score all night."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 4. Add a rule for "Rest assured"

**Title:** New rule: "Rest assured"

**Body:**

```markdown
Add a rule to `rules/en.json` for "Rest assured".

**Why it reads as AI:** A reassurance phrase that adds no information. AI assistants use it to soften a claim the reader did not question.

**Suggested fix text:** Cut it, or give the reason: "Your text never leaves your device."

- Category: `filler`
- Severity: `medium`
- A starting pattern: `\\brest\\s+assured\\b` with flags `i`
- Must flag: "Rest assured, your data is safe."
- Must not flag: "The crew could finally rest after the crossing."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 5. Add a rule for "Needless to say"

**Title:** New rule: "Needless to say"

**Body:**

```markdown
Add a rule to `rules/en.json` for "Needless to say".

**Why it reads as AI:** Announces that something does not need saying, then says it. Filler that pads a sentence without adding anything.

**Suggested fix text:** Cut the phrase and keep the sentence.

- Category: `filler`
- Severity: `low`
- A starting pattern: `\\b(needless\\s+to\\s+say|it\\s+goes\\s+without\\s+saying)\\b` with flags `i`
- Must flag: "Needless to say, we were surprised."
- Must flag: "It goes without saying that testing matters."
- Must not flag: "There was no need to say anything at all."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 6. Add a rule for "Take it to the next level"

**Title:** New rule: "Take it to the next level"

**Body:**

```markdown
Add a rule to `rules/en.json` for "Take it to the next level".

**Why it reads as AI:** A vague promise of improvement with no measure attached. Common in AI-written marketing and coaching copy.

**Suggested fix text:** Say what actually improves: "cuts editing time in half".

- Category: `phrase`
- Severity: `medium`
- A starting pattern: `\\btak(e|es|ing)\\s+(your|their|our|his|her|it|things|this)\\s+\\w*\\s*to\\s+the\\s+next\\s+level\\b` with flags `i`
- Must flag: "Take your writing to the next level."
- Must not flag: "We took the lift to the next level of the car park."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 7. Add a rule for "Buckle up"

**Title:** New rule: "Buckle up"

**Body:**

```markdown
Add a rule to `rules/en.json` for "Buckle up".

**Why it reads as AI:** A hype opener that promises excitement before delivering anything. Very common at the top of AI-written listicles and threads.

**Suggested fix text:** Cut it and start with the first real point.

- Category: `filler`
- Severity: `medium`
- A starting pattern: `(?<=^|[.!?]\\s+|\\n\\s*)Buckle\\s+up\\s*[,.!:]` with flags `i`
- Must flag: "Buckle up. This gets strange."
- Must not flag: "Buckle up before the driver pulls away."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 8. Add a rule for "Think again"

**Title:** New rule: "Think again"

**Body:**

```markdown
Add a rule to `rules/en.json` for "Think again".

**Why it reads as AI:** Half of a setup that tells the reader they were wrong about something they never said. AI text pairs it with a rhetorical question.

**Suggested fix text:** State the surprising fact directly.

- Category: `structure`
- Severity: `medium`
- A starting pattern: `\\bthink\\s+again\\b\\s*[.!]` with flags `i`
- Must flag: "Think email is dead? Think again."
- Must not flag: "I asked her to think again about the offer."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 9. Add a rule for "Fear not"

**Title:** New rule: "Fear not"

**Body:**

```markdown
Add a rule to `rules/en.json` for "Fear not".

**Why it reads as AI:** A mock-reassuring opener in an old-fashioned register that few people use in their own writing.

**Suggested fix text:** Cut it and give the answer: "There is a shortcut."

- Category: `filler`
- Severity: `low`
- A starting pattern: `(?<=^|[.!?]\\s+|\\n\\s*)(Fear\\s+not|Worry\\s+not)\\s*[,.!:]` with flags `i`
- Must flag: "Fear not, there is an easier way."
- Must not flag: "They had nothing left to fear, not even the winter."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 10. Add a rule for "Sound familiar?"

**Title:** New rule: "Sound familiar?"

**Body:**

```markdown
Add a rule to `rules/en.json` for "Sound familiar?".

**Why it reads as AI:** A one-line rhetorical question used to fake a shared experience with the reader. A stock move in AI-written intros.

**Suggested fix text:** Cut it, or say who this actually happens to.

- Category: `structure`
- Severity: `medium`
- A starting pattern: `\\bsound(s)?\\s+familiar\\s*\\?` with flags `i`
- Must flag: "You open the doc and freeze. Sound familiar?"
- Must not flag: "The melody sounds familiar to anyone who grew up there."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 11. Add a rule for "You're not alone"

**Title:** New rule: "You're not alone"

**Body:**

```markdown
Add a rule to `rules/en.json` for "You're not alone".

**Why it reads as AI:** Stock empathy that AI assistants add after describing a problem. It comforts without telling the reader anything.

**Suggested fix text:** Give the number if you have one, or cut it.

- Category: `phrase`
- Severity: `medium`
- A starting pattern: `\\byou(['’]re|\\s+are)\\s+not\\s+alone\\b` with flags `i`
- Must flag: "Struggling to keep up? You're not alone."
- Must not flag: "She realised she was not alone in the house."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 12. Add a rule for "The good news is"

**Title:** New rule: "The good news is"

**Body:**

```markdown
Add a rule to `rules/en.json` for "The good news is".

**Why it reads as AI:** A pivot phrase that labels the next sentence before the reader gets to judge it. AI drafts use it to turn a paragraph around.

**Suggested fix text:** Cut it and state the good thing.

- Category: `filler`
- Severity: `low`
- A starting pattern: `\\bthe\\s+good\\s+news\\s+is\\b` with flags `i`
- Must flag: "The good news is you can fix it in one click."
- Must not flag: "We finally had some good news from the hospital."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 13. Add a rule for "Pro tip:"

**Title:** New rule: "Pro tip:"

**Body:**

```markdown
Add a rule to `rules/en.json` for "Pro tip:".

**Why it reads as AI:** A blog-post label that dresses an ordinary suggestion as insider knowledge. Heavily used in AI-written how-to content.

**Suggested fix text:** Give the tip without the label.

- Category: `filler`
- Severity: `low`
- A starting pattern: `(?<=^|[.!?]\\s+|\\n\\s*)Pro\\s+tip\\s*:` with flags `i`
- Must flag: "Pro tip: save the file before you close it."
- Must not flag: "She turned pro two years ago."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 14. Add a rule for "At its core"

**Title:** New rule: "At its core"

**Body:**

```markdown
Add a rule to `rules/en.json` for "At its core".

**Why it reads as AI:** A signpost that promises the essence of something and usually restates what was already said.

**Suggested fix text:** Cut it and state the thing plainly.

- Category: `filler`
- Severity: `low`
- A starting pattern: `\\bat\\s+(its|their|her|his|the)\\s+core\\s*,` with flags `i`
- Must flag: "At its core, the problem is trust."
- Must not flag: "The reactor is unstable at its core temperature."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```

## 15. Add a rule for "More than just"

**Title:** New rule: "More than just"

**Body:**

```markdown
Add a rule to `rules/en.json` for "More than just".

**Why it reads as AI:** A formula that defines something by what it supposedly exceeds instead of what it does. Standard in AI product and brand copy.

**Suggested fix text:** Say what it does: "It checks your writing and explains each note."

- Category: `phrase`
- Severity: `medium`
- A starting pattern: `\\b(is|are|was|were|it['’]s|they['’]re)\\s+more\\s+than\\s+just\\s+an?\\b` with flags `i`
- Must flag: "Tellbuster is more than just a spell checker."
- Must not flag: "The repair cost more than just the parts."

New here? Follow "Your first rule in 5 minutes" in CONTRIBUTING.md. You can do it all on the GitHub website.
```
