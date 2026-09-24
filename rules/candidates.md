# Rule candidates (to review, not rules yet)

Phrases collected from common "words AI overuses" lists and from the stop-slop style guide (MIT, credited in README). They are sorted by how safe they are to flag. Write every rule in our own words, with flag and pass examples, following `rules/schema.md`. Skip anything already covered by `rules/en.json`.

The golden rule: a false flag costs more trust than a missed tell. When a word has normal everyday uses, it only belongs in the strict pack, or not at all.

## Tier A: add to `rules/en.json` (distinctive phrases, safe by default)

- Throat-clearing openers: "The uncomfortable truth is", "The truth is,", "Let me be clear", "It turns out", "Can we talk about", "Make no mistake", "Think about it:", "What if I told you", "Picture this", "Here's what I mean:"
- Emphasis crutches: "Full stop.", "Period." used as a one-word sentence for emphasis, "This matters because"
- Permission lines: "And that's okay.", "And that's perfectly fine."
- Vague stakes: "The stakes are high", "The implications are significant", "The reasons are structural"
- Stock phrases: "a feature, not a bug", "unlock the secrets", "unveil the secrets", "in the quest for", "in the world of", "when it comes to", "as previously mentioned", "it is advisable to", "it's essential to", "it's important to note" (check the existing rule catches it without "that"), "to put it simply", "to summarize", "changing the game", "designed to enhance", "take a dive into", "deep dive", "nestled in", "bustling city", "vibrant community"
- Metaphor slop: "a labyrinth of", "an indelible mark", "a seismic shift", "sights unseen", "sounds unheard", "reverberate through"
- Business jargon phrases: "lean into", "double down on", "circle back", "on the same page", "moving forward," as a sentence opener
- Negative listing: "Not a X. Not a Y. A Z." (three short fragments)
- "Not because X, but because Y" and "The question isn't X, it's Y" (extend the existing not-X-it's-Y family if needed)

## Tier B: add only with context (the word alone is normal)

- "harness" only in "harness the power / potential of" (check existing rule)
- "navigate" only with "complexities", "landscape", "challenges", "uncertainty"
- "landscape" only in "the [adjective] landscape of" or "digital / business / competitive landscape"
- "realm" only in "in the realm of" / "the realm of possibility"
- "testament" (existing rule), "tapestry" (existing rule)
- "underscore(s) the importance", "plays a vital role" (extend the crucial-role rule to vital and paramount)
- "meticulously crafted", "tailored to your needs", "cutting-edge technology", "groundbreaking innovation", "unprecedented times", "transformative power"
- "embark on" (any object, not just journey)
- "elevate your [noun]", "unleash your [noun]" (check existing rules)
- "Imagine a world where"
- "my friend" at the end of a sentence

## Tier C: strict pack only (`rules/en-strict.json`, OFF by default)

For people who follow a strict house style (like the stop-slop standard). The settings page gets a switch: "Strict mode: also flag common filler words". Severity `low` for all of these.

- Single words: additionally, alternatively, amongst, arguably, compelling, consequently, crucial, daunting, dilemma, essentially, essential, excels, foster, immense, importantly, indeed, keen, meticulous, notably, orchestrate, paramount, profoundly, pursuit, relentless, reshape, robust, subsequently, thrilled, transformative, ultimately, underpins, unprecedented, vibrant, vital, thus, shall
- Softeners and intensifiers: really, just, literally, genuinely, honestly, simply, actually, deeply, truly, fundamentally, inherently, inevitably, crucially
- Jargon verbs: unpack, navigate, leverage (already partly covered)
- "In order to" (suggest "to")
- Sentences that start with "So," at the start of a paragraph

## Tier D: do not add (too common, would flag normal writing)

because, due to, as well as, even though, given that, ensure, expand, evolving, fast, power, pressure, world, understanding, specifically, generally, promptly, rapidly, struggled, towards, journey (alone), quest (alone), fancy, intense, hey, alright, let's (alone), imagine (alone), dive (alone), foundations, bridging, mastering, metropolis, remnant, whispering, gossamer

Also skip structural checks that need real grammar parsing and would misfire often: passive voice, sentences starting with Wh- words, the rule of three in general, sentence length rhythm, adverbs ending in -ly as a blanket rule.
