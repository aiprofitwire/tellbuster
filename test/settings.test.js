// Tests the extension's settings helper with a fake chrome.storage, so no browser is needed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { check } from '../packages/core/src/index.js';

const dir = new URL('../packages/extension/', import.meta.url);
let stored = {};
globalThis.chrome = {
  storage: { sync: { get: async (defaults) => ({ ...defaults, ...stored }) } },
  runtime: { getURL: (p) => new URL(p, dir).href },
};
// settings.js reads the bundled rule files with fetch. Here that means reading them from disk.
globalThis.fetch = async (url) => ({ json: async () => JSON.parse(readFileSync(new URL(url), 'utf8')) });

const { readSettings, activeRules, allRules, siteFromInput, siteMatches, DEFAULTS } = await import('../packages/extension/settings.js');

test('settings: defaults are English, strict mode off, nothing turned off', async () => {
  stored = {};
  assert.deepEqual(await readSettings(), DEFAULTS);
});

test('settings: odd stored values are cleaned up', async () => {
  stored = { strictStyle: 'yes', disabledRules: ['en-em-dash', 7], offSites: 'x.com' };
  const s = await readSettings();
  assert.equal(s.strictStyle, false);
  assert.deepEqual(s.disabledRules, ['en-em-dash']);
  assert.deepEqual(s.offSites, []);
});

test('settings: the strict pack loads only in strict mode', async () => {
  const all = await allRules();
  const pack = JSON.parse(readFileSync(new URL('vendor/en-strict.json', dir), 'utf8')).rules.map((r) => r.id);
  const normal = (await activeRules({ ...DEFAULTS })).map((r) => r.id);
  const strict = (await activeRules({ ...DEFAULTS, strictStyle: true })).map((r) => r.id);
  assert.ok(normal.length > 0 && pack.every((id) => !normal.includes(id)));
  assert.ok(pack.every((id) => strict.includes(id)));
  assert.equal(strict.length, all.length);
});

test('settings: a turned off category removes its rules', async () => {
  const rules = await activeRules({ ...DEFAULTS, disabledCategories: ['punctuation'] });
  assert.ok(rules.length > 0);
  assert.ok(rules.every((r) => r.category !== 'punctuation'));
  assert.equal(check('Fast \u2014 and cheap.', { rules }).filter((f) => f.ruleId === 'en-em-dash').length, 0);
});

test('settings: no language picked means no rules', async () => {
  assert.deepEqual(await activeRules({ ...DEFAULTS, languages: [] }), []);
});

test('settings: a turned off rule is skipped', async () => {
  const rules = await activeRules({ ...DEFAULTS });
  const text = 'Fast \u2014 and cheap.';
  assert.equal(check(text, { rules }).filter((f) => f.ruleId === 'en-em-dash').length, 1);
  assert.equal(check(text, { rules, disabled: ['en-em-dash'] }).length, 0);
});

test('settings: website names are cleaned up', () => {
  assert.equal(siteFromInput('https://www.LinkedIn.com/feed/'), 'linkedin.com');
  assert.equal(siteFromInput('  mail.google.com '), 'mail.google.com');
  assert.equal(siteFromInput('x.com'), 'x.com');
  assert.equal(siteFromInput('localhost:8080'), 'localhost');
  assert.equal(siteFromInput('not a site'), '');
  assert.equal(siteFromInput('hello'), '');
  assert.equal(siteFromInput(''), '');
});

test('settings: a site also covers its subdomains', () => {
  assert.ok(siteMatches('mail.google.com', 'google.com'));
  assert.ok(siteMatches('google.com', 'google.com'));
  assert.ok(!siteMatches('notgoogle.com', 'google.com'));
  assert.ok(!siteMatches('google.com', 'mail.google.com'));
});
