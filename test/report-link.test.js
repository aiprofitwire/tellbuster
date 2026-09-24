// The "Report a wrong flag" link on every card opens the GitHub form with the rule id, and nothing else.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const FILES = ['docs/app.js', 'packages/extension/content.js'];

// Pull reportUrl out of each file and run it, so the test checks the real link.
function reportUrlFrom(src) {
  const body = src.match(/function reportUrl\(ruleId\) \{([\s\S]*?)\n\s*\}/)[1];
  return new Function('ruleId', body);
}

for (const file of FILES) {
  test(`report link: ${file} opens the wrong flag form with only the rule id`, () => {
    const src = read(file);
    assert.match(src, /Report a wrong flag/, 'every card shows the link');
    const url = new URL(reportUrlFrom(src)('en-foster'));
    assert.equal(url.origin + url.pathname, 'https://github.com/aiprofitwire/tellbuster/issues/new');
    assert.deepEqual([...url.searchParams.keys()].sort(), ['rule', 'template', 'title']);
    assert.equal(url.searchParams.get('template'), 'false-positive.yml');
    assert.equal(url.searchParams.get('rule'), 'en-foster');
    assert.equal(url.searchParams.get('title'), 'Wrong flag: en-foster');
    // The function only takes the rule id, so the user's text cannot end up in the link.
    assert.doesNotMatch(src.match(/function reportUrl[\s\S]*?\n\s*\}/)[0], /match|text|value/);
  });
}

test('report link: the form it opens has a "rule" field and exists', () => {
  const form = read('.github/ISSUE_TEMPLATE/false-positive.yml');
  assert.match(form, /^\s+id: rule$/m);
});
