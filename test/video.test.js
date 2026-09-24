// Checks the launch video in video/: its words pass our own rules, and it stays separate from the product.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { check, loadRules } from '../packages/core/src/index.js';
import * as script from '../video/src/script.js';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const rules = loadRules(JSON.parse(read('rules/en.json')));

test('the captions and end card have no tells', () => {
  const lines = [...script.CAPTIONS.map((c) => c.text), script.END_TITLE, script.END_LINE];
  for (const line of lines) {
    assert.deepEqual(check(line, { rules }).map((f) => f.ruleId), [], `caption trips a rule: ${line}`);
  }
});

test('the sample has tells before the rewrite and none after', () => {
  const before = check(script.BEFORE, { rules });
  assert.ok(before.length >= 5);
  assert.ok(before.some((f) => f.match === script.CARD_PHRASE), `no finding for "${script.CARD_PHRASE}"`);
  assert.deepEqual(check(script.AFTER, { rules }), []);
});

test('the video uses the same sample texts as the landing page', () => {
  assert.ok(read('docs/index.html').includes(script.BEFORE));
  assert.ok(read('docs/landing.js').includes(script.AFTER));
});

test('the end card shows the landing page address, not a store link', () => {
  assert.equal(script.END_URL, 'aiprofitwire.github.io/tellbuster');
});

test('the rendered video files are never committed', () => {
  assert.match(read('.gitignore'), /^video\/out\/$/m);
});

test('the README GIF exists and is under 3 MB', () => {
  const gif = new URL('docs/media/demo.gif', root);
  assert.ok(existsSync(gif));
  assert.ok(statSync(gif).size < 3 * 1024 * 1024);
  assert.ok(read('README.md').includes('docs/media/demo.gif'));
});

test('nothing in packages/ or docs/ depends on video/', () => {
  const walk = (dir) =>
    readdirSync(new URL(dir, root), { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? (e.name === 'node_modules' ? [] : walk(`${dir}${e.name}/`)) : [`${dir}${e.name}`]
    );
  for (const file of [...walk('packages/'), ...walk('docs/')].filter((f) => /\.(js|html|css|json)$/.test(f))) {
    assert.ok(!/\bvideo\//.test(read(file)), `${file} mentions video/`);
  }
});
