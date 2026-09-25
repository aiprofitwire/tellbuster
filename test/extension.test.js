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
  assert.deepEqual([...manifest.permissions].sort(), ['contextMenus', 'scripting', 'storage']);
  assert.equal(manifest.host_permissions, undefined, 'installing must not ask for access to any site');
  assert.deepEqual([...manifest.optional_host_permissions].sort(), ['http://*/*', 'https://*/*'],
    'site access is only asked for when the user turns on "Check as I type"');
  assert.equal(manifest.optional_permissions, undefined);
});

test('extension: check as you type is opt in, with no content script until the user allows it', () => {
  assert.equal(manifest.content_scripts, undefined, 'content.js must not run on pages at install');
  assert.equal(manifest.web_accessible_resources, undefined, 'pages cannot see extension files');
  const bg = readFileSync(new URL('background.js', dir), 'utf8');
  assert.match(bg, /registerContentScripts\(\[\s*\{ id: SCRIPT_ID, js: \['i18n\.js', 'content\.js'\], matches,/, 'only content.js (and its words) is registered, on the granted sites');
  assert.match(bg, /chrome\.permissions\.getAll\(\)/, 'the sites come from what the user allowed');
  assert.match(bg, /chrome\.permissions\.onRemoved\.addListener/, 'taking access back removes the script');
  const opts = readFileSync(new URL('options.js', dir), 'utf8');
  assert.match(opts, /chrome\.permissions\.request\(ALL_SITES\)/, 'the settings switch asks Chrome for access');
  const html = readFileSync(new URL('options.html', dir), 'utf8');
  assert.match(html, /id="as-you-type"/);
  assert.match(html, /never leaves this device/);
});

test('extension: the popup and right-click menu do not need site access', () => {
  for (const f of ['popup.js', 'popup.html']) {
    const src = readFileSync(new URL(f, dir), 'utf8');
    assert.ok(!/permissions|scripting|content\.js/.test(src), `${f} must work without site access`);
  }
});

test('extension: the as-you-type checker makes no network calls and never writes HTML into pages', () => {
  for (const f of ['content.js', 'i18n.js']) {
    const src = readFileSync(new URL(f, dir), 'utf8');
    for (const bad of ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket', 'EventSource', 'innerHTML', 'outerHTML', 'insertAdjacentHTML', 'eval(']) {
      assert.ok(!src.includes(bad), `${f} must not use ${bad}`);
    }
  }
});

test('extension: every file the manifest and popup point to exists', () => {
  const files = [
    manifest.action.default_popup,
    manifest.options_ui.page,
    manifest.background.service_worker,
    'content.js',
    'i18n.js',
    ...Object.values(manifest.icons),
    ...Object.values(manifest.action.default_icon),
    'popup.js', 'popup.css', 'options.js', 'options.css', 'settings.js', 'app.js', 'style.css', 'vendor/tellbuster.js', 'vendor/en.json', 'vendor/en-strict.json',
  ];
  for (const f of files) assert.ok(existsSync(new URL(f, dir)), `missing ${f}`);
});

test('extension: the as-you-type checker only logs through the debug switch, which is off by default', () => {
  const src = readFileSync(new URL('content.js', dir), 'utf8');
  assert.equal(src.match(/console\./g)?.length, 1, 'content.js must have one console call, inside log()');
  assert.match(src, /const log = \(\.\.\.args\) => \{ if \(debug\) console\.log\('TB-DEBUG'/);
  assert.match(src, /let debug = false;/);
  assert.match(src, /localStorage\.getItem\('tellbusterDebug'\) === '1'/);
});

test('extension: test pages for the badge exist', () => {
  for (const f of ['x-style.html', 'linkedin-style.html', 'gmail-style.html']) {
    assert.ok(existsSync(new URL(`../test/pages/${f}`, import.meta.url)), `missing test/pages/${f}`);
  }
});

test('extension: the settings page and settings helper make no network calls except reading the bundled rules', () => {
  for (const f of ['options.js', 'settings.js', 'popup.js']) {
    const src = readFileSync(new URL(f, dir), 'utf8');
    for (const bad of ['XMLHttpRequest', 'sendBeacon', 'WebSocket', 'EventSource', 'eval(', 'innerHTML']) {
      assert.ok(!src.includes(bad), `${f} must not use ${bad}`);
    }
    const fetches = src.match(/fetch\(/g) || [];
    if (f === 'settings.js') assert.match(src, /fetch\(chrome\.runtime\.getURL\(`vendor\//, 'settings.js only reads files inside the extension');
    else assert.equal(fetches.length, 0, `${f} must not fetch anything`);
  }
});

test('extension: the strict mode switch has the wording from the plan', () => {
  const html = readFileSync(new URL('options.html', dir), 'utf8');
  assert.match(html, /Strict mode: also flag common filler words/);
  assert.match(html, /id="strict"/);
});
