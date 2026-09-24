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
  assert.equal(manifest.host_permissions, undefined, 'no host permissions yet');
  assert.equal(manifest.content_scripts, undefined, 'no content scripts yet');
});

test('extension: every file the manifest and popup point to exists', () => {
  const files = [
    manifest.action.default_popup,
    manifest.background.service_worker,
    ...Object.values(manifest.icons),
    ...Object.values(manifest.action.default_icon),
    'popup.js', 'popup.css', 'app.js', 'style.css', 'vendor/tellbuster.js', 'vendor/en.json',
  ];
  for (const f of files) assert.ok(existsSync(new URL(f, dir)), `missing ${f}`);
});
