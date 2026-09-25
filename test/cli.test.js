// The tellbuster command: files, standard input, every option and the exit code.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const bin = fileURLToPath(new URL('../packages/core/bin/tellbuster.js', import.meta.url));
const run = (args, input = '') => spawnSync(process.execPath, [bin, ...args], { input, encoding: 'utf8' });

test('cli: the npm package lists the command and ships the bin folder', () => {
  const pkg = JSON.parse(readFileSync(new URL('../packages/core/package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.bin.tellbuster, './bin/tellbuster.js');
  assert.ok(pkg.files.includes('bin'));
  assert.ok(readFileSync(bin, 'utf8').startsWith('#!/usr/bin/env node'));
});

test('cli: checks standard input and exits 1 on a finding', () => {
  const r = run([], "Let's delve into this.");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /^<stdin>:1:7 {2}medium {2}"Delve": /m);
  assert.match(r.stdout, /phrases might read as AI/);
});

test('cli: clean text exits 0 with a friendly line', () => {
  const r = run([], 'We paid the invoice this morning.');
  assert.equal(r.status, 0);
  assert.match(r.stdout, /No tells found\. Nice work\./);
});

test('cli: checks files and reports file, line and column', () => {
  const dir = mkdtempSync(join(tmpdir(), 'tellbuster-cli-'));
  try {
    const a = join(dir, 'a.md');
    const b = join(dir, 'b.md');
    writeFileSync(a, 'First line is fine.\nWe will delve in.\n');
    writeFileSync(b, 'Nothing to see here.\n');
    const r = run([a, b]);
    assert.equal(r.status, 1);
    assert.ok(r.stdout.includes(`${a}:2:9  medium  "Delve"`));
    assert.ok(!r.stdout.includes(b));
    assert.equal(run([join(dir, 'missing.md')]).status, 2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('cli: --json prints findings with file, line and column', () => {
  const r = run(['--json'], "Let's delve into this.");
  const findings = JSON.parse(r.stdout);
  const delve = findings.find((f) => f.ruleId === 'en-delve');
  assert.deepEqual([delve.file, delve.line, delve.column, delve.severity], ['<stdin>', 1, 7, 'medium']);
  for (const key of ['why', 'fix', 'message', 'start', 'end']) assert.ok(key in delve, `missing ${key}`);
  assert.equal(r.status, 1);
});

test('cli: --disable skips the listed rules', () => {
  const r = run(['--json', '--disable', 'en-delve,en-dive-in'], "Let's delve into this.");
  assert.deepEqual(JSON.parse(r.stdout), []);
  assert.equal(r.status, 0);
});

test('cli: --strict turns on the strict style rules', () => {
  const text = 'This is a really robust plan.';
  const ids = (args) => JSON.parse(run(['--json', ...args], text).stdout).map((f) => f.ruleId);
  assert.ok(!ids([]).some((id) => id.startsWith('en-strict-')));
  assert.ok(ids(['--strict']).some((id) => id.startsWith('en-strict-')));
});

test('cli: --lang picks the rules', () => {
  const text = '¡Por supuesto! Aquí tienes un resumen.';
  const ids = (args) => JSON.parse(run(['--json', ...args], text).stdout).map((f) => f.ruleId);
  assert.deepEqual(ids([]), ['es-por-supuesto', 'es-aqui-tienes']);
  assert.deepEqual(ids(['--lang', 'en']), []);
  assert.deepEqual(ids(['--lang', 'es']), ['es-por-supuesto', 'es-aqui-tienes']);
  assert.equal(run(['--lang', 'xx'], text).status, 2);
});

test('cli: --max-severity sets which findings fail the run', () => {
  const medium = "Let's delve into this.";
  const high = 'Great question! The short answer is yes.';
  assert.equal(run(['--max-severity', 'high'], medium).status, 0);
  assert.equal(run(['--max-severity', 'medium'], medium).status, 1);
  assert.equal(run(['--max-severity', 'high'], high).status, 1);
  assert.equal(run(['--fail-on', 'high'], medium).status, 0);
  assert.equal(run(['--max-severity', 'huge'], medium).status, 2);
});

test('cli: unknown options are a usage error, --help and --version work', () => {
  assert.equal(run(['--nope'], 'text').status, 2);
  const help = run(['--help']);
  assert.equal(help.status, 0);
  assert.match(help.stdout, /Usage: tellbuster/);
  assert.match(run(['--version']).stdout, /^\d+\.\d+\.\d+/);
});
