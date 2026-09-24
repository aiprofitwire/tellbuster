// Packs packages/extension/ into tellbuster-extension.zip for the Chrome Web Store and Edge Add-ons.
// Run from the repo root: node scripts/zip-extension.js
// It runs sync-extension.js first, so the zip always has the latest engine and rules.
// Uses only Node's built-in zlib (no packages). Pass a path to write the zip somewhere else.
import { join, resolve } from 'node:path';
import { root, extensionFiles, writeZip, report } from './zip-tools.js';

const out = resolve(process.argv[2] || join(root, 'tellbuster-extension.zip'));
const files = extensionFiles();
writeZip(files, out);
report(out, files);
