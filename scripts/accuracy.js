// Checks the test set in test/corpus/ with the default rules and prints how often each side gets flagged.
// Run from the repo root: npm run accuracy
// These are phrase-level style notes. The numbers say how often a text has at least one note, not whether it is AI.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { check, loadRules } from '../packages/core/src/index.js';

const root = new URL('../', import.meta.url);

// Every rules file, read fresh from rules/ so a new rule counts before the bundle is synced.
// English, then French, then the rest, like scripts/sync-core-rules.js. The strict pack stays off, as by default.
function defaultRules() {
  const rank = (file) => ({ en: 0, fr: 1 })[file.split(/[-.]/)[0]] ?? 2;
  return readdirSync(new URL('rules/', root)).filter((f) => f.endsWith('.json'))
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
    .flatMap((f) => loadRules(JSON.parse(readFileSync(new URL(`rules/${f}`, root), 'utf8'))));
}

// Each file starts with "# Source: ..." lines. They say where the text comes from and are not checked.
export function readText(file) {
  return readFileSync(file, 'utf8').replace(/^(#[^\n]*\n)+/, '').trim();
}

function measureFolder(name, rules) {
  const dir = new URL(`test/corpus/${name}/`, root);
  const files = readdirSync(dir).filter((f) => f.endsWith('.txt')).sort();
  const results = files.map((file) => {
    const url = new URL(file, dir);
    const style = (readFileSync(url, 'utf8').match(/^# Source:.*\(style: ([^)]+)\)/) || [])[1];
    return { file, style, findings: check(readText(url), { rules, language: 'auto' }) };
  });
  const withAny = results.filter((r) => r.findings.length > 0);
  const withHigh = results.filter((r) => r.findings.some((f) => f.severity === 'high'));
  return { total: files.length, withAny: withAny.length, withHigh: withHigh.length, results };
}

/** Checks both folders and returns the counts, plus the rules that fire most on human text. */
export function measure() {
  const rules = defaultRules();
  const ai = measureFolder('ai', rules);
  const human = measureFolder('human', rules);
  const counts = {};
  for (const { file, findings } of human.results) {
    for (const f of findings) {
      counts[f.ruleId] ??= { ruleId: f.ruleId, name: f.name, severity: f.severity, findings: 0, texts: new Set() };
      counts[f.ruleId].findings++;
      counts[f.ruleId].texts.add(file);
    }
  }
  const humanRules = Object.values(counts)
    .map((c) => ({ ...c, texts: c.texts.size }))
    .sort((a, b) => b.texts - a.texts || b.findings - a.findings);
  return { ai, human, humanRules };
}

const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0) + '%';

function byStyle(results) {
  const styles = {};
  for (const r of results) {
    styles[r.style] ??= [r.style, 0, 0];
    styles[r.style][2]++;
    if (r.findings.length) styles[r.style][1]++;
  }
  return Object.values(styles);
}

export function report({ ai, human, humanRules }) {
  const lines = [
    'Tellbuster accuracy report',
    'Phrase-level style notes, not AI detection. Humans use these phrases too.',
    '',
    `AI texts with at least one note:           ${ai.withAny} of ${ai.total} (${pct(ai.withAny, ai.total)})`,
    `Human texts with at least one note:        ${human.withAny} of ${human.total} (${pct(human.withAny, human.total)})`,
    `AI texts with a high severity note:        ${ai.withHigh} of ${ai.total} (${pct(ai.withHigh, ai.total)})`,
    `Human texts with a high severity note:     ${human.withHigh} of ${human.total} (${pct(human.withHigh, human.total)})`,
    '',
    'AI texts with at least one note, by style:',
    ...byStyle(ai.results).map(([style, n, total]) => `  ${style}: ${n} of ${total}`),
    '',
    'Rules that fire most on human text:',
  ];
  if (humanRules.length === 0) lines.push('  (none)');
  for (const r of humanRules.slice(0, 10)) {
    lines.push(`  ${r.ruleId} (${r.severity}): ${r.texts} ${r.texts === 1 ? 'text' : 'texts'}, ${r.findings} ${r.findings === 1 ? 'note' : 'notes'}`);
  }
  return lines.join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(report(measure()));
}
