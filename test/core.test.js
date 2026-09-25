// Tests for the core engine in packages/core.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { check, summarize, loadRules, guessLanguage } from '../packages/core/src/index.js';

const en = JSON.parse(readFileSync(new URL('../rules/en.json', import.meta.url), 'utf8'));
const rules = loadRules(en);

const goodRule = () => ({
  id: 'en-test', name: 'Test', category: 'phrase', severity: 'low',
  pattern: 'foo', flags: 'i', message: 'm', why: 'w', fix: 'f',
  examples: { flag: ['foo'], pass: ['bar'] },
});

test('loadRules accepts the English rules', () => {
  assert.equal(rules.length, en.rules.length);
});

test('finds known tells', () => {
  const ids = check("Let's delve into it. The plan worked — mostly.", { rules }).map((f) => f.ruleId);
  assert.ok(ids.includes('en-delve'));
  assert.ok(ids.includes('en-em-dash'));
});

test('every rule finds its own flag examples', () => {
  for (const rule of rules) {
    for (const s of rule.examples.flag) {
      assert.ok(check(s, { rules: [rule], strictStyle: true }).length > 0, `${rule.id} should flag: ${s}`);
    }
  }
});

test('respects disabled', () => {
  const text = "Let's delve into it — now.";
  const ids = check(text, { rules, disabled: ['en-delve'] }).map((f) => f.ruleId);
  assert.ok(!ids.includes('en-delve'));
  assert.ok(ids.includes('en-em-dash'));
});

test('positions are correct and sorted', () => {
  const text = 'We delve here — and delved there.';
  const found = check(text, { rules });
  for (const f of found) assert.equal(text.slice(f.start, f.end), f.match);
  const delves = found.filter((f) => f.ruleId === 'en-delve');
  assert.deepEqual(delves.map((f) => [f.start, f.end]), [[3, 8], [20, 26]]);
  for (let i = 1; i < found.length; i++) assert.ok(found[i - 1].start <= found[i].start);
  const f = delves[0];
  for (const key of ['ruleId', 'name', 'category', 'severity', 'start', 'end', 'match', 'message', 'why', 'fix']) {
    assert.ok(key in f, `finding missing ${key}`);
  }
});

test('handles empty text', () => {
  assert.deepEqual(check('', { rules }), []);
  assert.deepEqual(summarize([], ''), { total: 0, bySeverity: { low: 0, medium: 0, high: 0 }, perHundredWords: 0 });
});

test('handles straight and curly apostrophes', () => {
  const straight = check("In today's fast-paced world, we ship.", { rules }).map((f) => f.ruleId);
  const curly = check('In today’s fast-paced world, we ship.', { rules }).map((f) => f.ruleId);
  assert.ok(straight.includes('en-fast-paced-world'));
  assert.ok(curly.includes('en-fast-paced-world'));
});

test('keeps overlapping matches from different rules', () => {
  const a = { ...goodRule(), id: 'en-a', pattern: 'big cat' };
  const b = { ...goodRule(), id: 'en-b', pattern: 'cat nap' };
  assert.deepEqual(check('a big cat nap', { rules: [a, b] }).map((f) => f.ruleId), ['en-a', 'en-b']);
});

test('ignores zero-length matches', () => {
  const r = { ...goodRule(), pattern: 'x*' };
  assert.deepEqual(check('abc x', { rules: [r] }).map((f) => f.match), ['x']);
});

test('summarize counts by severity and per hundred words', () => {
  const text = 'We delve here — and delved there.';
  const found = check(text, { rules });
  const s = summarize(found, text);
  assert.equal(s.total, found.length);
  assert.equal(s.bySeverity.low + s.bySeverity.medium + s.bySeverity.high, found.length);
  assert.equal(s.perHundredWords, Math.round((found.length / 7) * 1000) / 10);
});

test('loadRules rejects a malformed rule and names it', () => {
  const missing = goodRule();
  delete missing.fix;
  assert.throws(() => loadRules({ rules: [missing] }), /en-test.*missing "fix"/);
  assert.throws(() => loadRules({ rules: [{ ...goodRule(), severity: 'huge' }] }), /en-test.*severity/);
  assert.throws(() => loadRules({ rules: [{ ...goodRule(), examples: { flag: ['foo'], pass: [] } }] }), /en-test.*pass/);
  assert.throws(() => loadRules({ rules: [goodRule(), goodRule()] }), /en-test.*duplicate/);
  assert.throws(() => loadRules({}), /rules/);
});

test('loadRules rejects an invalid regex', () => {
  assert.throws(() => loadRules({ rules: [{ ...goodRule(), pattern: '(unclosed' }] }), /en-test.*invalid pattern/);
});

test('strict rules stay off unless strictStyle is on', () => {
  const strictFile = JSON.parse(readFileSync(new URL('../rules/en-strict.json', import.meta.url), 'utf8'));
  const strict = loadRules(strictFile);
  assert.ok(strict.every((r) => r.strict === true), 'rules from a strict file are marked strict');
  const all = rules.concat(strict);
  const text = 'This is really important.';
  assert.ok(!check(text, { rules: all }).some((f) => f.ruleId === 'en-strict-softeners'));
  assert.ok(check(text, { rules: all, strictStyle: true }).some((f) => f.ruleId === 'en-strict-softeners'));
  assert.throws(() => loadRules({ rules: [{ ...goodRule(), strict: 'yes' }] }), /en-test.*strict/);
});

const fr = loadRules(JSON.parse(readFileSync(new URL('../rules/fr.json', import.meta.url), 'utf8')));

test('guessLanguage tells English from French', () => {
  assert.equal(guessLanguage("Dans le monde d'aujourd'hui, il est important de noter que les prix montent."), 'fr');
  assert.equal(guessLanguage('It is important to note that the prices are going up.'), 'en');
  assert.equal(guessLanguage('', ['en', 'fr']), 'en');
  assert.equal(guessLanguage('', ['fr', 'en']), 'fr');
});

test('guessLanguage tells Spanish, German and Portuguese apart', () => {
  assert.equal(guessLanguage('¡Por supuesto! Aquí tienes un resumen de la reunión.'), 'es');
  assert.equal(guessLanguage('Zusammenfassend lässt sich sagen, dass der Plan gut ist und funktioniert.'), 'de');
  assert.equal(guessLanguage('É importante destacar que você não precisa de mais nada.'), 'pt');
  assert.equal(guessLanguage('En el mundo actual, la tecnología está en todas partes y es muy útil.'), 'es');
  assert.equal(guessLanguage('No mundo atual, a tecnologia está em toda parte e é muito útil.'), 'pt');
});

test('language "auto" uses the rules of the guessed language only', () => {
  const both = [...rules, ...fr];
  const frText = "Dans le monde d'aujourd'hui, il est important de noter que tout change \u2014 vite.";
  const frIds = check(frText, { rules: both, language: 'auto' }).map((f) => f.ruleId);
  assert.ok(frIds.includes('fr-monde-aujourdhui'));
  assert.ok(frIds.includes('fr-important-de-noter'));
  assert.ok(frIds.includes('fr-em-dash'));
  assert.ok(frIds.every((id) => id.startsWith('fr-')));
  const enIds = check("Let's delve into it \u2014 now.", { rules: both, language: 'auto' }).map((f) => f.ruleId);
  assert.ok(enIds.includes('en-delve') && enIds.includes('en-em-dash'));
  assert.ok(enIds.every((id) => id.startsWith('en-')));
});

test('a manual language wins over the guess, and no language means every rule', () => {
  const both = [...rules, ...fr];
  const text = 'Le plan a fonctionné \u2014 en partie.';
  assert.deepEqual(check(text, { rules: both, language: 'en' }).map((f) => f.ruleId), ['en-em-dash']);
  assert.deepEqual(check(text, { rules: both }).map((f) => f.ruleId), ['en-em-dash', 'fr-em-dash']);
});

test('language guess: short texts are placed by their letters and marks', () => {
  const all = ['en', 'fr', 'es', 'de', 'pt'];
  assert.equal(guessLanguage('Bien sûr ! Voici trois idées.', all), 'fr');
  assert.equal(guessLanguage('Très bonne question !', all), 'fr');
  assert.equal(guessLanguage('¿Qué opinas?', all), 'es');
  assert.equal(guessLanguage('Schöne Grüße aus Köln.', all), 'de');
  assert.equal(guessLanguage('Não sei.', all), 'pt');
  // English with a loanword stays English.
  assert.equal(guessLanguage('The café was naïve about it.', all), 'en');
  assert.equal(guessLanguage('Delve!', all), 'en');
});
