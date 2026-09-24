// Makes sure the copies used by the web demo and the extension match the originals.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const pairs = [
  ['packages/core/src/index.js', 'docs/vendor/tellbuster.js', 'sync-docs'],
  ['rules/en.json', 'docs/vendor/en.json', 'sync-docs'],
  ['rules/en-strict.json', 'docs/vendor/en-strict.json', 'sync-docs'],
  ['packages/core/src/index.js', 'packages/extension/vendor/tellbuster.js', 'sync-extension'],
  ['rules/en.json', 'packages/extension/vendor/en.json', 'sync-extension'],
  ['rules/en-strict.json', 'packages/extension/vendor/en-strict.json', 'sync-extension'],
  ['docs/app.js', 'packages/extension/app.js', 'sync-extension'],
  ['docs/style.css', 'packages/extension/style.css', 'sync-extension'],
];

for (const [from, to, script] of pairs) {
  test(`${to} matches ${from}`, () => {
    const a = readFileSync(new URL(from, root), 'utf8');
    const b = readFileSync(new URL(to, root), 'utf8');
    assert.equal(b, a, `out of date: run "node scripts/${script}.js" from the repo root`);
  });
}
