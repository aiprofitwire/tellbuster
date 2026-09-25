// Checks the interface text in docs/i18n.js: every language has the same keys as English,
// the words follow the project's own rules, and the French example really shows French tells.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { check, loadRules } from '../packages/core/src/index.js';

const root = new URL('../', import.meta.url);
await import('../docs/i18n.js');
const { STRINGS, strings, pick } = globalThis.tellbusterI18n;
const EM_DASH = String.fromCharCode(0x2014);

// Every string, including the ones made by (n) => ... lines, tried with a few numbers.
function allText(value) {
  if (typeof value === 'string') return [value];
  if (typeof value === 'function') {
    // Some take a number (and a count list), others a name like "French" or "linkedin.com".
    const args = [0, 1, 2].map((n) => [n, [['high', n], ['low', 1]]]).concat([['Stock phrases']]);
    return args.map((a) => { try { return String(value(...a)); } catch { return ''; } });
  }
  return Object.values(value).flatMap(allText);
}

test('i18n: every language has the same keys as English, of the same kind', () => {
  for (const [code, block] of Object.entries(STRINGS)) {
    if (code === 'en') continue;
    for (const [key, value] of Object.entries(STRINGS.en)) {
      assert.ok(key in block, `${code} is missing "${key}"`);
      assert.equal(typeof block[key], typeof value, `${code}.${key} should be a ${typeof value}`);
    }
    for (const key of Object.keys(block)) assert.ok(key in STRINGS.en, `${code} has "${key}", which English does not have`);
  }
});

test('i18n: interface text never says text "is AI" and has no long dash (except the English example)', () => {
  for (const [code, block] of Object.entries(STRINGS)) {
    for (const [key, value] of Object.entries(block)) {
      for (const text of allText(value)) {
        assert.ok(!/is AI|written by AI|AI detected|est une IA|écrit par une IA/i.test(text), `${code}.${key}: "${text}"`);
        if (!(code === 'en' && key === 'example')) assert.ok(!text.includes(EM_DASH), `${code}.${key} has a long dash`);
      }
    }
  }
});

test('i18n: the language comes from ?lang=, then the browser for the extension, then English', () => {
  assert.equal(pick(), 'en');
  assert.equal(strings('xx').code, 'en', 'an unknown language falls back to English');
  assert.equal(strings('fr').tryThis, STRINGS.fr.tryThis);
});

test('i18n: the French example shows French tells', () => {
  const fr = loadRules(JSON.parse(readFileSync(new URL('rules/fr.json', root), 'utf8')));
  assert.ok(check(STRINGS.fr.example, { rules: fr }).length >= 8);
});

test('i18n: the French rules explain themselves in French', () => {
  const fr = JSON.parse(readFileSync(new URL('rules/fr.json', root), 'utf8'));
  for (const r of fr.rules) {
    assert.match(r.message, /(fait|faire|font) penser à une IA/, `${r.id}: message should say it "fait penser à une IA"`);
  }
});
