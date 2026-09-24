// Checks the pieces needed to publish: npm fields, the store zip, the privacy page and the store listing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (f) => readFileSync(join(root, f), 'utf8');

test('publish: npm package has the fields npm shows', () => {
  const pkg = JSON.parse(read('packages/core/package.json'));
  assert.equal(pkg.name, 'tellbuster');
  assert.equal(pkg.license, 'MIT');
  for (const field of ['description', 'homepage', 'repository', 'bugs']) assert.ok(pkg[field], `missing ${field}`);
  assert.ok(pkg.keywords.length >= 3, 'needs keywords');
  assert.equal(pkg.repository.directory, 'packages/core');
  assert.equal(pkg.dependencies, undefined, 'the engine has no dependencies');
});

// Reads every file back out of the zip and compares it with the extension folder.
test('publish: the store zip holds the extension files, byte for byte', () => {
  const dir = mkdtempSync(join(tmpdir(), 'tellbuster-'));
  try {
    const out = join(dir, 'ext.zip');
    execFileSync(process.execPath, [join(root, 'scripts/zip-extension.js'), out]);
    const zip = readFileSync(out);
    const endAt = zip.length - 22;
    assert.equal(zip.readUInt32LE(endAt), 0x06054b50, 'zip must end with an end record');
    const count = zip.readUInt16LE(endAt + 10);
    let at = zip.readUInt32LE(endAt + 16);
    const names = [];
    for (let i = 0; i < count; i++) {
      assert.equal(zip.readUInt32LE(at), 0x02014b50);
      const size = zip.readUInt32LE(at + 20);
      const nameLen = zip.readUInt16LE(at + 28);
      const localAt = zip.readUInt32LE(at + 42);
      const name = zip.toString('utf8', at + 46, at + 46 + nameLen);
      const dataAt = localAt + 30 + zip.readUInt16LE(localAt + 26);
      const data = inflateRawSync(zip.subarray(dataAt, dataAt + size));
      assert.ok(data.equals(readFileSync(join(root, 'packages/extension', name))), `${name} differs`);
      names.push(name);
      at += 46 + nameLen;
    }
    for (const f of ['manifest.json', 'popup.html', 'background.js', 'content.js', 'options.html', 'vendor/tellbuster.js', 'vendor/en.json', 'vendor/fr.json', 'icons/icon128.png']) {
      assert.ok(names.includes(f), `zip is missing ${f}`);
    }
    assert.ok(!names.includes('README.md'), 'README.md stays out of the store package');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('publish: privacy page loads nothing from elsewhere and keeps the linter wording', () => {
  const html = read('docs/privacy.html');
  assert.ok(!/<script/i.test(html), 'no scripts');
  assert.ok(!/(src|href)="https?:\/\/(?!github\.com\/aiprofitwire\/tellbuster)/.test(html), 'only links to the repo');
  assert.match(html, /collects nothing/);
  assert.match(html, /never sent anywhere/);
});

test('publish: store short description fits in 132 characters and matches the manifest', () => {
  const md = read('docs/store-listing.md');
  const short = md.split('## Short description')[1].match(/```\n(.+)\n```/)[1];
  assert.ok([...short].length <= 132, `short description is ${[...short].length} characters`);
  const manifest = JSON.parse(read('packages/extension/manifest.json'));
  assert.equal(short, manifest.description, 'the store takes the short description from the manifest');
});
