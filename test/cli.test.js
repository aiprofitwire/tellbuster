// The tellbuster command: files, standard input, every option and the exit code.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path, { join } from 'node:path';
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

// Writes one file to a temp folder, checks it with --json, and returns the rule ids and lines found.
function checkFile(name, text, args = []) {
  const dir = mkdtempSync(join(tmpdir(), 'tellbuster-skip-'));
  try {
    const file = join(dir, name);
    writeFileSync(file, text);
    return JSON.parse(run(['--json', ...args, file]).stdout).map((f) => `${f.ruleId}@${f.line}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('cli: Markdown code blocks are skipped, text after them is still checked', () => {
  const md = 'Intro.\n\n```\nWe delve in.\n```\n\n~~~~\nWe delve in.\n~~~~\n\nWe delve in.\n';
  assert.deepEqual(checkFile('a.md', md), ['en-delve@11']);
  // Outside Markdown, the same text is checked in full.
  assert.equal(checkFile('a.txt', md).filter((f) => f.startsWith('en-delve')).length, 3);
});

test('cli: Markdown inline code is skipped', () => {
  assert.deepEqual(checkFile('a.md', 'The rule catches `delve` and ``delve``.\nWe delve in.\n'), ['en-delve@2']);
});

test('cli: disable and enable comments skip the text between them', () => {
  const text = 'We delve in.\n<!-- tellbuster-disable -->\nWe delve in.\n<!-- tellbuster-enable -->\nWe delve in.\n';
  assert.deepEqual(checkFile('a.md', text), ['en-delve@1', 'en-delve@5']);
  assert.deepEqual(checkFile('a.txt', text), ['en-delve@1', 'en-delve@5']);
  // No enable comment: skipped to the end of the file.
  assert.deepEqual(checkFile('a.md', 'We delve in.\n<!-- tellbuster-disable -->\nWe delve in.\n'), ['en-delve@1']);
});

test('cli: the disable-next-line comment skips only the next line', () => {
  const text = '<!-- tellbuster-disable-next-line -->\nWe delve in.\nWe delve in.\n';
  assert.deepEqual(checkFile('a.md', text), ['en-delve@3']);
});

test('cli: --github prints annotations, errors at or above the level', () => {
  const r = run(['--github', '--fail-on', 'high'], "Let's delve into this.\nIn today's fast-paced world, we ship.");
  assert.match(r.stdout, /^::warning file=<stdin>,line=1,col=7,title=Tellbuster%3A "Delve"::"Delve" reads as AI\. Why: .+ Fix: /m);
  assert.match(r.stdout, /^::error file=<stdin>,line=2,col=1,/m);
  assert.equal(r.status, 1);
  assert.equal(run(['--github', '--fail-on', 'high'], "Let's delve into this.").status, 0);
});

test('cli: the GitHub Action runs the bundled tool with its inputs', () => {
  const action = readFileSync(new URL('../action.yml', import.meta.url), 'utf8');
  assert.match(action, /using: composite/);
  assert.ok(action.includes('node "$GITHUB_ACTION_PATH/packages/core/bin/tellbuster.js"'));
  assert.ok(!action.includes('npx'), 'the Action must not download the tool from npm');
  for (const input of ['files', 'exclude', 'strict', 'lang', 'disable', 'fail-on']) assert.match(action, new RegExp(`^  ${input}:`, 'm'));
  assert.match(action, /git ls-files '\*\.md'/);
});

test('cli: the files this repo checks with its own Action pass at fail-on high', () => {
  const workflow = readFileSync(new URL('../.github/workflows/tellbuster.yml', import.meta.url), 'utf8');
  const root = fileURLToPath(new URL('..', import.meta.url));
  const list = (key) => (workflow.match(new RegExp(`${key}: (.+)`)) || [, ''])[1].trim().split(/\s+/).filter(Boolean);
  // Expand simple patterns like docs/*.md the way the shell does in the Action, then drop the excluded files.
  const toRegExp = (glob) => new RegExp(`^${glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*')}$`);
  const expand = (glob) => {
    if (!glob.includes('*')) return [glob];
    const dir = path.posix.dirname(glob);
    return readdirSync(path.join(root, dir)).map((name) => path.posix.join(dir, name)).filter((f) => toRegExp(glob).test(f));
  };
  const skip = list('exclude').map(toRegExp);
  const files = list('files').flatMap(expand).filter((f) => !skip.some((re) => re.test(f)));
  assert.ok(files.includes('README.md') && files.length > 1);
  assert.ok(!files.includes('docs/first-issues.md'));
  const r = spawnSync(process.execPath, [bin, '--fail-on', 'high', ...files], { cwd: root, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout);
});
