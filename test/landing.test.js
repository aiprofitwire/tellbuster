// Checks the landing page (docs/index.html) keeps its promises: real numbers, no outside files, a link preview.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const html = read('docs/index.html');

test('the rule count on the page matches the rules of every language', () => {
  const count = ['en', 'fr', 'es', 'de', 'pt'].reduce((n, f) => n + JSON.parse(read(`rules/${f}.json`)).rules.length, 0);
  const shown = html.match(/id="rule-count">(\d+)</)?.[1];
  assert.equal(Number(shown), count, `docs/index.html says ${shown}, the rules have ${count}: run node scripts/sync-docs.js`);
});

test('the page loads no scripts, styles or fonts from other sites', () => {
  for (const [, url] of html.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"]+)"/g)) {
    assert.ok(!/^(https?:)?\/\//.test(url), `outside file: ${url}`);
  }
  assert.ok(!/fonts\.googleapis|fonts\.gstatic/.test(html + read('docs/landing.css')));
});

test('the self-hosted fonts and their licenses are there', () => {
  for (const f of ['fraunces.woff2', 'hanken-grotesk.woff2', 'jetbrains-mono.woff2', 'OFL-Fraunces.txt', 'OFL-HankenGrotesk.txt', 'OFL-JetBrainsMono.txt']) {
    assert.ok(existsSync(new URL(`docs/fonts/${f}`, root)), `missing docs/fonts/${f}`);
  }
});

test('the link preview image is 1200 by 630 and the meta tags point to it', () => {
  const png = readFileSync(new URL('docs/og.png', root));
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
  assert.match(html, /property="og:image" content="https:\/\/aiprofitwire\.github\.io\/tellbuster\/og\.png"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
});

test('the landing page script makes no network calls', () => {
  assert.doesNotMatch(read('docs/landing.js'), /\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket/);
});

test('the page keeps the linter wording, never a verdict', () => {
  const text = html.replace(/<[^>]+>/g, ' ');
  assert.doesNotMatch(text, /AI detected|written by AI/i);
});
