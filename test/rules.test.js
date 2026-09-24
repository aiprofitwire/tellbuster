// Validates every rules file: required fields, valid regex, and examples.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const dir = new URL('../rules/', import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
const REQUIRED = ['id', 'name', 'category', 'severity', 'pattern', 'message', 'why', 'fix', 'examples'];
const CATEGORIES = ['word-choice', 'phrase', 'structure', 'punctuation', 'filler'];
const SEVERITIES = ['low', 'medium', 'high'];

for (const file of files) {
  const data = JSON.parse(readFileSync(new URL(file, dir), 'utf8'));
  const ids = new Set();

  test(`${file}: has a language and rules`, () => {
    assert.ok(data.language, 'missing "language"');
    assert.ok(Array.isArray(data.rules) && data.rules.length > 0, 'missing "rules"');
  });

  for (const rule of data.rules) {
    test(`${file}: ${rule.id}`, () => {
      for (const key of REQUIRED) assert.ok(rule[key] !== undefined, `missing "${key}"`);
      assert.ok(!ids.has(rule.id), 'duplicate id');
      ids.add(rule.id);
      assert.ok(rule.id.startsWith(`${data.language}-`), 'id must start with the language code');
      assert.ok(CATEGORIES.includes(rule.category), `bad category "${rule.category}"`);
      assert.ok(SEVERITIES.includes(rule.severity), `bad severity "${rule.severity}"`);
      assert.ok(!/is AI|written by AI/i.test(rule.message), 'message must say "reads as AI", not "is AI"');
      assert.ok(!/—/.test(rule.message + rule.why + rule.fix), 'no em dashes in rule text');
      const re = new RegExp(rule.pattern, `${rule.flags || ''}g`);
      assert.ok(rule.examples.flag?.length > 0, 'needs at least one "flag" example');
      assert.ok(rule.examples.pass?.length > 0, 'needs at least one "pass" example');
      for (const s of rule.examples.flag) { re.lastIndex = 0; assert.ok(re.test(s), `should flag: ${s}`); }
      for (const s of rule.examples.pass) { re.lastIndex = 0; assert.ok(!re.test(s), `should not flag: ${s}`); }
    });
  }
}

test('en-strict.json: a strict pack, all low severity, no ids shared with en.json', () => {
  const read = (f) => JSON.parse(readFileSync(new URL(f, dir), 'utf8'));
  const strict = read('en-strict.json');
  const base = new Set(read('en.json').rules.map((r) => r.id));
  assert.equal(strict.strict, true, 'en-strict.json must have "strict": true so it stays off by default');
  for (const rule of strict.rules) {
    assert.equal(rule.severity, 'low', `${rule.id} must be low severity`);
    assert.ok(!base.has(rule.id), `${rule.id} is also in en.json`);
  }
});
