#!/usr/bin/env node
// The tellbuster command: checks files or standard input and prints each finding.
// No dependencies. Exit code 1 when a finding is at or above --max-severity, 2 on a usage error.
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { lint, summarize } from '../src/main.js';

const SEVERITIES = ['low', 'medium', 'high'];
const LANGUAGES = ['auto', 'en', 'fr', 'es', 'de', 'pt'];

const HELP = `Usage: tellbuster [options] [files...]
       echo "some text" | tellbuster [options]

Points out phrases that might read as AI, with a reason and a fix for each.

Options:
  --strict                  also use the strict style rules
  --lang <code>             auto (default), en, fr, es, de or pt
  --disable <id1,id2>       skip these rule ids
  --json                    print the findings as JSON
  --github                  print the findings as GitHub annotations
  --max-severity <level>    fail only at or above this level: low (default), medium or high
  --fail-on <level>         same as --max-severity
  -h, --help                show this help
  -v, --version             show the version

In Markdown files, code blocks and inline code are skipped.
In any file, text between <!-- tellbuster-disable --> and <!-- tellbuster-enable -->
is skipped, and so is the line after <!-- tellbuster-disable-next-line -->.

Exit code: 1 when a finding is at or above the level, 0 otherwise, 2 on a usage error.`;

function usageError(message) {
  process.stderr.write(`tellbuster: ${message}\nRun "tellbuster --help" to see the options.\n`);
  process.exit(2);
}

let parsed;
try {
  parsed = parseArgs({
    allowPositionals: true,
    options: {
      strict: { type: 'boolean' },
      lang: { type: 'string', default: 'auto' },
      disable: { type: 'string', multiple: true, default: [] },
      json: { type: 'boolean' },
      github: { type: 'boolean' },
      'max-severity': { type: 'string' },
      'fail-on': { type: 'string' },
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
    },
  });
} catch (err) {
  usageError(err.message);
}
const { values: opts, positionals: files } = parsed;

if (opts.help) {
  console.log(HELP);
  process.exit(0);
}
if (opts.version) {
  console.log(JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version);
  process.exit(0);
}

const level = opts['max-severity'] ?? opts['fail-on'] ?? 'low';
if (!SEVERITIES.includes(level)) usageError(`--max-severity must be low, medium or high (got "${level}")`);
if (!LANGUAGES.includes(opts.lang)) usageError(`--lang must be one of ${LANGUAGES.join(', ')} (got "${opts.lang}")`);
const disabled = opts.disable.flatMap((d) => d.split(',')).map((d) => d.trim()).filter(Boolean);

// Each input is { name, text }. No files and nothing piped in: show the help.
const inputs = [];
if (files.length === 0) {
  if (process.stdin.isTTY) {
    console.log(HELP);
    process.exit(0);
  }
  inputs.push({ name: '<stdin>', text: readFileSync(0, 'utf8') });
}
for (const name of files) {
  try {
    inputs.push({ name, text: name === '-' ? readFileSync(0, 'utf8') : readFileSync(name, 'utf8') });
  } catch (err) {
    usageError(`cannot read "${name}" (${err.code || err.message})`);
  }
}

// Turns a character offset into a 1-based line and column.
function position(lineStarts, offset) {
  let lo = 0;
  let hi = lineStarts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (lineStarts[mid] <= offset) lo = mid;
    else hi = mid - 1;
  }
  return { line: lo + 1, column: offset - lineStarts[lo] + 1 };
}

// The [start, end) ranges to skip: the disable comments in any file,
// plus fenced code blocks and inline code in Markdown files, where examples usually live.
function skippedRanges(text, lineStarts, markdown) {
  const ranges = [];
  const lineEnd = (line) => (line + 1 < lineStarts.length ? lineStarts[line + 1] : text.length);
  const lineOf = (offset) => position(lineStarts, offset).line - 1;

  for (const m of text.matchAll(/<!--\s*tellbuster-disable\s*-->/g)) {
    const after = text.slice(m.index);
    const enable = after.search(/<!--\s*tellbuster-enable\s*-->/);
    ranges.push([m.index, enable === -1 ? text.length : m.index + enable]);
  }
  for (const m of text.matchAll(/<!--\s*tellbuster-disable-next-line\s*-->/g)) {
    const next = lineOf(m.index) + 1;
    if (next < lineStarts.length) ranges.push([lineStarts[next], lineEnd(next)]);
  }
  if (!markdown) return ranges;

  // Fenced code blocks: a line starting with ``` or ~~~ (up to 3 spaces in) until a closing fence of
  // the same character and at least the same length, or the end of the file.
  let open = null;
  for (let line = 0; line < lineStarts.length; line++) {
    const fence = text.slice(lineStarts[line], lineEnd(line)).match(/^ {0,3}(`{3,}|~{3,})/);
    if (!fence) continue;
    if (!open) open = { start: lineStarts[line], mark: fence[1] };
    else if (fence[1][0] === open.mark[0] && fence[1].length >= open.mark.length) {
      ranges.push([open.start, lineEnd(line)]);
      open = null;
    }
  }
  if (open) ranges.push([open.start, text.length]);

  // Inline code: a run of backticks up to the next run of the same length, within one paragraph.
  for (const m of text.matchAll(/(`+)(?!`)(?:(?!\n[ \t]*\n)[\s\S])*?(?<!`)\1(?!`)/g)) {
    ranges.push([m.index, m.index + m[0].length]);
  }
  return ranges;
}

const results = [];
for (const { name, text } of inputs) {
  const lineStarts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') lineStarts.push(i + 1);
  const skipped = skippedRanges(text, lineStarts, /\.(md|markdown)$/i.test(name));
  const findings = lint(text, { strictStyle: Boolean(opts.strict), language: opts.lang, disabled }).filter(
    (f) => !skipped.some(([start, end]) => f.start < end && f.end > start),
  );
  for (const f of findings) results.push({ file: name, ...position(lineStarts, f.start), ...f });
}

const threshold = SEVERITIES.indexOf(level);
const failing = results.some((f) => SEVERITIES.indexOf(f.severity) >= threshold);

// GitHub reads lines like "::warning file=a.md,line=2,col=9,title=Name::message" as annotations.
const escapeData = (s) => String(s).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
const escapeProperty = (s) => escapeData(s).replace(/:/g, '%3A').replace(/,/g, '%2C');

if (opts.json) {
  console.log(JSON.stringify(results, null, 2));
} else if (opts.github) {
  for (const f of results) {
    const kind = SEVERITIES.indexOf(f.severity) >= threshold ? 'error' : 'warning';
    const props = `file=${escapeProperty(f.file)},line=${f.line},col=${f.column},title=${escapeProperty(`Tellbuster: ${f.name}`)}`;
    console.log(`::${kind} ${props}::${escapeData(`${f.message} Why: ${f.why} Fix: ${f.fix}`)}`);
  }
  const total = summarize(results).total;
  console.log(total === 0 ? 'No tells found. Nice work.' : `${total} ${total === 1 ? 'phrase might' : 'phrases might'} read as AI. Humans use these too: read each one and decide.`);
} else {
  for (const f of results) console.log(`${f.file}:${f.line}:${f.column}  ${f.severity}  ${f.name}: ${f.message}`);
  const total = summarize(results).total;
  if (total === 0) console.log('No tells found. Nice work.');
  else console.log(`\n${total} ${total === 1 ? 'phrase might' : 'phrases might'} read as AI. Humans use these too: read each one and decide.`);
}
process.exitCode = failing ? 1 : 0;
