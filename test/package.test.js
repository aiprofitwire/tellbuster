// The npm package must work on its own: bundled rules present, in sync, and usable with lint().
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { lint, defaultRules, packs } from '../packages/core/src/main.js';

test('package: bundled rule packs match the rules folder (run node scripts/sync-core-rules.js if not)', () => {
  const dir = new URL('../rules/', import.meta.url);
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  assert.deepEqual(Object.keys(packs).sort(), files.map((f) => f.replace(/\.json$/, '')).sort());
  for (const f of files) assert.deepEqual(packs[f.replace(/\.json$/, '')], JSON.parse(readFileSync(new URL(f, dir), 'utf8')));
});

test('package: lint works with no setup, in English and French', () => {
  assert.ok(lint("Let's delve into the numbers.").some((f) => f.ruleId === 'en-delve'));
  assert.ok(lint("Dans le monde d'aujourd'hui, il est important de noter que le travail change.").some((f) => f.ruleId.startsWith('fr-')));
  assert.equal(lint('We paid the invoice this morning.').length, 0);
});

test('package: lint checks the Spanish, German and Portuguese starter rules', () => {
  const ids = (text) => lint(text).map((f) => f.ruleId);
  assert.deepEqual(ids('¡Por supuesto! Aquí tienes un resumen.'), ['es-por-supuesto', 'es-aqui-tienes']);
  assert.ok(ids('In der heutigen digitalen Welt ist Technik überall.').includes('de-heutige-welt'));
  assert.ok(ids('Espero que isso te ajude com o projeto.').includes('pt-espero-ter-ajudado'));
  // Text with no clue about its language is checked as English.
  assert.deepEqual(ids('Delve!'), ['en-delve']);
});

test('package: strict rules stay off unless asked', () => {
  const strictIds = new Set(defaultRules().filter((r) => r.strict).map((r) => r.id));
  assert.ok(strictIds.size > 0);
  assert.ok(!lint('This is a really robust plan.').some((f) => strictIds.has(f.ruleId)));
  assert.ok(lint('This is a really robust plan.', { strictStyle: true }).some((f) => strictIds.has(f.ruleId)));
});
