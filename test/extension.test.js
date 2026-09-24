// Checks the Chrome extension: its copies of the engine, rules and styles are up to date,
// and the manifest asks only for the permissions we promise.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const ext = new URL('packages/extension/', root);
const read = (path, base = root) => readFileSync(new URL(path, base), 'utf8');

const pairs = [
  ['packages/core/src/index.js', 'packages/extension/vendor/tellbuster.js'],
  ['rules/en.json', 'packages/extension/vendor/en.json'],
  ['docs/style.css', 'packages/extension/vendor/style.css'],
];

for (const [from, to] of pairs) {
  test(`${to} matches ${from}`, () => {
    assert.equal(read(to), read(from), `out of date: run "node scripts/sync-extension.js" from the repo root`);
  });
}

const manifest = JSON.parse(read('manifest.json', ext));

test('manifest asks only for storage, activeTab and contextMenus', () => {
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.name, 'Tellbuster');
  assert.deepEqual([...manifest.permissions].sort(), ['activeTab', 'contextMenus', 'storage']);
  assert.equal(manifest.host_permissions, undefined, 'no host permissions yet');
  assert.equal(manifest.content_scripts, undefined, 'no content scripts yet');
});

test('every file the manifest points to exists', () => {
  const files = [
    manifest.background.service_worker,
    manifest.action.default_popup,
    ...Object.values(manifest.icons),
    ...Object.values(manifest.action.default_icon),
  ];
  for (const file of files) assert.ok(existsSync(new URL(file, ext)), `missing ${file}`);
});

test('extension code makes no network calls to other sites', () => {
  for (const file of ['background.js', 'popup.js', 'popup.html']) {
    const src = read(file, ext);
    assert.doesNotMatch(src, /https?:\/\//, `${file} links to a web address`);
    assert.doesNotMatch(src, /XMLHttpRequest|sendBeacon|WebSocket/, `${file} opens a connection`);
  }
});

test('extension text has no em dashes', () => {
  for (const file of ['background.js', 'popup.js', 'popup.html', 'popup.css', 'manifest.json']) {
    assert.ok(!read(file, ext).includes('\u2014'), `${file} contains an em dash`);
  }
});
