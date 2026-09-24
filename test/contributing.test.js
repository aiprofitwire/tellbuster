// Keeps the "your first rule" example in CONTRIBUTING.md valid, so newcomers copy a rule that works.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadRules } from '../packages/core/src/index.js';

const doc = readFileSync(new URL('../CONTRIBUTING.md', import.meta.url), 'utf8');
const en = JSON.parse(readFileSync(new URL('../rules/en.json', import.meta.url), 'utf8'));

test('CONTRIBUTING.md: the example rule is valid and its examples work', () => {
  const block = doc.match(/```json\n([\s\S]*?)```/);
  assert.ok(block, 'no json example found');
  const rule = JSON.parse(block[1]);
  loadRules({ language: 'en', rules: [rule] });
  assert.ok(!en.rules.some((r) => r.id === rule.id), 'example id is already used in en.json');
  const re = new RegExp(rule.pattern, `${rule.flags || ''}g`);
  for (const s of rule.examples.flag) { re.lastIndex = 0; assert.ok(re.test(s), `should flag: ${s}`); }
  for (const s of rule.examples.pass) { re.lastIndex = 0; assert.ok(!re.test(s), `should not flag: ${s}`); }
});
