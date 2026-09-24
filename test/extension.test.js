// Keeps the extension small and private: only the permissions the plan allows, and no missing files.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const dir = new URL('../packages/extension/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('manifest.json', dir), 'utf8'));

test('extension: Manifest V3 named Tellbuster', () => {
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.name, 'Tellbuster');
});

test('extension: only the allowed permissions', () => {
  assert.deepEqual([...manifest.permissions].sort(), ['activeTab', 'contextMenus', 'storage']);
  assert.equal(manifest.host_permissions, undefined, 'site access comes only from the content script');
});

test('extension: one content script, on web pages only', () => {
  assert.equal(manifest.content_scripts.length, 1);
  const [cs] = manifest.content_scripts;
  assert.deepEqual([...cs.matches].sort(), ['http://*/*', 'https://*/*']);
  assert.deepEqual(cs.js, ['content.js']);
  assert.equal(cs.css, undefined, 'styles live inside the badge, so they never touch the page');
  assert.equal(manifest.web_accessible_resources, undefined, 'pages cannot see extension files');
});

test('extension: the as-you-type checker makes no network calls and never writes HTML into pages', () => {
  const src = readFileSync(new URL('content.js', dir), 'utf8');
  for (const bad of ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket', 'EventSource', 'innerHTML', 'outerHTML', 'insertAdjacentHTML', 'eval(']) {
    assert.ok(!src.includes(bad), `content.js must not use ${bad}`);
  }
});

test('extension: every file the manifest and popup point to exists', () => {
  const files = [
    manifest.action.default_popup,
    manifest.background.service_worker,
    ...manifest.content_scripts.flatMap((cs) => cs.js),
    ...Object.values(manifest.icons),
    ...Object.values(manifest.action.default_icon),
    'popup.js', 'popup.css', 'app.js', 'style.css', 'vendor/tellbuster.js', 'vendor/en.json',
  ];
  for (const f of files) assert.ok(existsSync(new URL(f, dir)), `missing ${f}`);
});
