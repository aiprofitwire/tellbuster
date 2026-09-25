// The test set in test/corpus/: human texts from before 2022 and AI texts written for this test.
// A rule that is too eager on normal human writing fails here before it ships.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { measure, report, readText } from '../scripts/accuracy.js';

const corpus = new URL('./corpus/', import.meta.url);

test('accuracy: every corpus file names its source and license, and is 100 to 400 words', () => {
  for (const side of ['human', 'ai']) {
    const dir = new URL(`${side}/`, corpus);
    for (const file of readdirSync(dir)) {
      assert.ok(file.endsWith('.txt'), `${side}/${file} should be a .txt file`);
      const first = readFileSync(new URL(file, dir), 'utf8').split('\n')[0];
      assert.match(first, /^# Source: .+ License: .+/, `${side}/${file} should start with "# Source: ... License: ..."`);
      const words = readText(new URL(file, dir)).split(/\s+/).length;
      assert.ok(words >= 100 && words <= 400, `${side}/${file} has ${words} words`);
    }
  }
});

test('accuracy: no more than 10 percent of human texts get a high severity note', (t) => {
  const result = measure();
  for (const line of report(result).split('\n')) t.diagnostic(line);
  assert.ok(result.human.total >= 40, 'the human set should have about 50 texts');
  assert.ok(result.ai.total >= 40, 'the AI set should have about 50 texts');
  const flagged = result.human.results.filter((r) => r.findings.some((f) => f.severity === 'high'));
  assert.ok(
    flagged.length <= result.human.total * 0.1,
    `${flagged.length} of ${result.human.total} human texts got a high severity note: ` +
      flagged.map((r) => `${r.file} (${r.findings.filter((f) => f.severity === 'high').map((f) => f.ruleId).join(', ')})`).join('; '),
  );
});
