// Tellbuster core: finds AI tells in text using plain-data rules.
// No dependencies, no network. Works in Node and in the browser.

const REQUIRED = ['id', 'name', 'category', 'severity', 'pattern', 'message', 'why', 'fix', 'examples'];
const CATEGORIES = ['word-choice', 'phrase', 'structure', 'punctuation', 'filler'];
const SEVERITIES = ['low', 'medium', 'high'];

function fail(id, problem) {
  throw new Error(`Tellbuster rule "${id}": ${problem}`);
}

// Builds the regex for a rule. Always global; "g" and "y" in the rule are ignored.
function compile(rule) {
  const flags = [...new Set(String(rule.flags || '').replace(/[gy]/g, ''))].join('') + 'g';
  try {
    return new RegExp(rule.pattern, flags);
  } catch (err) {
    fail(rule.id, `invalid pattern or flags (${err.message})`);
  }
}

function validate(rule, index) {
  if (!rule || typeof rule !== 'object') fail(`#${index}`, 'is not an object');
  const id = typeof rule.id === 'string' && rule.id ? rule.id : `#${index}`;
  for (const key of REQUIRED) {
    if (rule[key] === undefined || rule[key] === null || rule[key] === '') fail(id, `missing "${key}"`);
  }
  for (const key of ['id', 'name', 'pattern', 'message', 'why', 'fix']) {
    if (typeof rule[key] !== 'string') fail(id, `"${key}" must be text`);
  }
  if (!CATEGORIES.includes(rule.category)) fail(id, `unknown category "${rule.category}"`);
  if (!SEVERITIES.includes(rule.severity)) fail(id, `unknown severity "${rule.severity}"`);
  if (rule.flags !== undefined && typeof rule.flags !== 'string') fail(id, '"flags" must be text');
  if (rule.strict !== undefined && typeof rule.strict !== 'boolean') fail(id, '"strict" must be true or false');
  const ex = rule.examples;
  if (!Array.isArray(ex.flag) || ex.flag.length === 0) fail(id, 'needs at least one "examples.flag" sentence');
  if (!Array.isArray(ex.pass) || ex.pass.length === 0) fail(id, 'needs at least one "examples.pass" sentence');
  compile(rule);
}

/**
 * Validates a parsed rules file ({ language, rules: [...] }) and returns its rules.
 * If the file has "strict": true (a strict style pack), every rule it returns is marked strict.
 * Throws an error naming the rule and the problem if anything is wrong.
 */
export function loadRules(json) {
  if (!json || typeof json !== 'object') throw new Error('Tellbuster rules file: expected an object');
  if (!Array.isArray(json.rules)) throw new Error('Tellbuster rules file: missing "rules" array');
  const seen = new Set();
  json.rules.forEach((rule, i) => {
    validate(rule, i);
    if (seen.has(rule.id)) fail(rule.id, 'duplicate id');
    seen.add(rule.id);
  });
  if (json.strict !== undefined && typeof json.strict !== 'boolean') throw new Error('Tellbuster rules file: "strict" must be true or false');
  return json.strict ? json.rules.map((rule) => ({ ...rule, strict: true })) : json.rules;
}

/**
 * Checks text and returns findings sorted by position.
 * options.rules: array of rule objects (required).
 * options.disabled: array of rule ids to skip.
 * options.strictStyle: also use strict rules (off by default).
 */
export function check(text, options = {}) {
  const { rules, disabled = [], strictStyle = false } = options;
  if (!Array.isArray(rules)) throw new Error('Tellbuster check: options.rules must be an array');
  if (typeof text !== 'string' || text === '') return [];
  const skip = new Set(disabled);
  const findings = [];
  for (const rule of rules) {
    if (skip.has(rule.id) || (rule.strict && !strictStyle)) continue;
    for (const m of text.matchAll(compile(rule))) {
      if (m[0].length === 0) continue;
      findings.push({
        ruleId: rule.id,
        name: rule.name,
        category: rule.category,
        severity: rule.severity,
        start: m.index,
        end: m.index + m[0].length,
        match: m[0],
        message: rule.message,
        why: rule.why,
        fix: rule.fix,
      });
    }
  }
  return findings.sort((a, b) => a.start - b.start || a.end - b.end || a.ruleId.localeCompare(b.ruleId));
}

/**
 * Counts findings. perHundredWords is rounded to one decimal (0 for empty text).
 */
export function summarize(findings, text = '') {
  const bySeverity = { low: 0, medium: 0, high: 0 };
  for (const f of findings) if (f.severity in bySeverity) bySeverity[f.severity]++;
  const words = (String(text).match(/\S+/g) || []).length;
  const perHundredWords = words ? Math.round((findings.length / words) * 1000) / 10 : 0;
  return { total: findings.length, bySeverity, perHundredWords };
}
