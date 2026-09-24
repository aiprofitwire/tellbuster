// Copies the core engine and the rules into docs/vendor/ so GitHub Pages can serve them.
// It also updates the rule count shown on the landing page, so new rules never need a manual edit.
// Run from the repo root after changing packages/core or rules/: node scripts/sync-docs.js
import { mkdirSync, readFileSync } from 'node:fs';
import { copyIfChanged, writeIfChanged } from './write-if-changed.js';

const root = new URL('../', import.meta.url);
const COPIES = [
  ['packages/core/src/index.js', 'docs/vendor/tellbuster.js'],
  ['rules/en.json', 'docs/vendor/en.json'],
  ['rules/en-strict.json', 'docs/vendor/en-strict.json'],
  ['rules/fr.json', 'docs/vendor/fr.json'],
];

mkdirSync(new URL('docs/vendor/', root), { recursive: true });
for (const [from, to] of COPIES) {
  const changed = copyIfChanged(new URL(from, root), new URL(to, root));
  console.log(changed ? `Copied ${from} to ${to}` : `${to} is up to date`);
}

// Keep the number on the landing page in step with the English and French rules.
const count = ['en', 'fr'].reduce((n, f) => n + JSON.parse(readFileSync(new URL(`rules/${f}.json`, root), 'utf8')).rules.length, 0);
const page = new URL('docs/index.html', root);
const html = readFileSync(page, 'utf8');
const updated = html.replace(/(id="rule-count">)\d+(<)/, `$1${count}$2`);
if (updated !== html) {
  writeIfChanged(page, updated);
  console.log(`Updated the rule count on docs/index.html to ${count}`);
}
