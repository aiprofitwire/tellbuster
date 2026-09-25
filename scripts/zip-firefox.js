// Packs packages/extension/ into tellbuster-firefox.zip for addons.mozilla.org.
// Run from the repo root: node scripts/zip-firefox.js
// Same files as the Chrome zip, with the Firefox manifest (see firefoxManifest in zip-tools.js).
// Firefox can also load this zip directly for a test: about:debugging > This Firefox > Load Temporary Add-on.
// Pass a path to write the zip somewhere else.
import { join, resolve } from 'node:path';
import { root, extensionFiles, firefoxManifest, writeZip, report } from './zip-tools.js';

const out = resolve(process.argv[2] || join(root, 'tellbuster-firefox.zip'));
const files = extensionFiles().map((f) => f.name === 'manifest.json'
  ? { name: f.name, data: Buffer.from(`${JSON.stringify(firefoxManifest(JSON.parse(f.data)), null, 2)}\n`) }
  : f);
writeZip(files, out);
report(out, files);
