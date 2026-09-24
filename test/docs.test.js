// Makes sure the web demo's copies of the engine and rules match the originals.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const pairs = [
  ['packages/core/src/index.js', 'docs/vendor/tellbuster.js'],
  ['rules/en.json', 'docs/vendor/en.json'],
];

for (const [from, to] of pairs) {
  test(`${to} matches ${from}`, () => {
    const a = readFileSync(new URL(from, root), 'utf8');
    const b = readFileSync(new URL(to, root), 'utf8');
    assert.equal(b, a, `out of date: run "node scripts/sync-docs.js" from the repo root`);
  });
}
