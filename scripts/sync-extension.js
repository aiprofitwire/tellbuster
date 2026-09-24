// Copies the engine, the rules and the web demo's page code into packages/extension/
// so the extension works when loaded directly, with no build step.
// Run from the repo root after changing packages/core, rules/ or docs/: node scripts/sync-extension.js
import { mkdirSync } from 'node:fs';
import { copyIfChanged } from './write-if-changed.js';

const root = new URL('../', import.meta.url);
const COPIES = [
  ['packages/core/src/index.js', 'packages/extension/vendor/tellbuster.js'],
  ['rules/en.json', 'packages/extension/vendor/en.json'],
  ['rules/en-strict.json', 'packages/extension/vendor/en-strict.json'],
  ['rules/fr.json', 'packages/extension/vendor/fr.json'],
  ['docs/app.js', 'packages/extension/app.js'],
  ['docs/style.css', 'packages/extension/style.css'],
];

mkdirSync(new URL('packages/extension/vendor/', root), { recursive: true });
for (const [from, to] of COPIES) {
  const changed = copyIfChanged(new URL(from, root), new URL(to, root));
  console.log(changed ? `Copied ${from} to ${to}` : `${to} is up to date`);
}
