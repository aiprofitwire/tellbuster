// The copy scripts run while other tests read the copies, so their writes must be safe.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeIfChanged, copyIfChanged } from '../scripts/write-if-changed.js';

test('scripts: a file with the same contents is not rewritten', () => {
  const dir = mkdtempSync(join(tmpdir(), 'tellbuster-'));
  try {
    const file = join(dir, 'a.json');
    writeFileSync(file, '{"a":1}');
    const before = statSync(file).mtimeMs;
    assert.equal(writeIfChanged(file, '{"a":1}'), false);
    assert.equal(statSync(file).mtimeMs, before);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('scripts: a changed file is replaced whole, with no temporary file left behind', () => {
  const dir = mkdtempSync(join(tmpdir(), 'tellbuster-'));
  try {
    const from = join(dir, 'from.json');
    const to = join(dir, 'to.json');
    writeFileSync(from, '{"b":2}');
    writeFileSync(to, '{"old":true}');
    assert.equal(copyIfChanged(from, to), true);
    assert.equal(readFileSync(to, 'utf8'), '{"b":2}');
    assert.deepEqual(readdirSync(dir).sort(), ['from.json', 'to.json']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
