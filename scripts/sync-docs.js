// Copies the core engine and the rules into docs/vendor/ so GitHub Pages can serve them.
// Run from the repo root after changing packages/core or rules/: node scripts/sync-docs.js
import { copyFileSync, mkdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const COPIES = [
  ['packages/core/src/index.js', 'docs/vendor/tellbuster.js'],
  ['rules/en.json', 'docs/vendor/en.json'],
  ['rules/en-strict.json', 'docs/vendor/en-strict.json'],
];

mkdirSync(new URL('docs/vendor/', root), { recursive: true });
for (const [from, to] of COPIES) {
  copyFileSync(new URL(from, root), new URL(to, root));
  console.log(`Copied ${from} to ${to}`);
}
