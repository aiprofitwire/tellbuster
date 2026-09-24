// Copies the core engine, the rules and the demo styles into packages/extension/vendor/
// so the extension folder works when loaded directly, with no build step.
// Run from the repo root after changing packages/core, rules/ or docs/style.css:
// node scripts/sync-extension.js
import { copyFileSync, mkdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const COPIES = [
  ['packages/core/src/index.js', 'packages/extension/vendor/tellbuster.js'],
  ['rules/en.json', 'packages/extension/vendor/en.json'],
  ['docs/style.css', 'packages/extension/vendor/style.css'],
];

mkdirSync(new URL('packages/extension/vendor/', root), { recursive: true });
for (const [from, to] of COPIES) {
  copyFileSync(new URL(from, root), new URL(to, root));
  console.log(`Copied ${from} to ${to}`);
}
