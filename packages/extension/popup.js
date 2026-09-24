// Tellbuster popup. Checks the text in the box on this device. No network calls.
// Storage: the draft is kept in session storage (memory only, wiped when the browser
// closes) so it survives the popup closing. Turned-off rules are kept in sync storage.
import { check, loadRules } from './vendor/tellbuster.js';

const $ = (id) => document.getElementById(id);
const ta = $('text');
const backdrop = $('backdrop');
const list = $('list');

// Built from escapes so this file never contains the long dash itself.
const EXAMPLE = [
  "Certainly! In today's fast-paced world, small business owners must navigate the complex landscape of social media.",
  " It's not just a trend, it's a movement.",
  " Let's dive into how you can harness the power of storytelling to unleash your full potential.",
  ' This approach is a game-changer: it plays a crucial role in helping you foster a sense of community \u2014 and it stands as a testament to what is possible.',
  ' Moreover, it brings clarity, alignment, and resilience to your brand.',
  ' Let that sink in.',
  '\n\nI hope this helps!',
].join('');

const SEVERITY_ORDER = ['high', 'medium', 'low'];
let off = new Set();
let rules = [];
let findings = [];

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const topSeverity = (items) => SEVERITY_ORDER.find((s) => items.some((f) => f.severity === s));
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Splits the text at every finding edge so overlapping findings still get one clean underline each.
function highlightHtml(text) {
  const cuts = new Set([0, text.length]);
  for (const f of findings) { cuts.add(f.start); cuts.add(f.end); }
  const points = [...cuts].sort((a, b) => a - b);
  let html = '';
  for (let k = 0; k < points.length - 1; k++) {
    const a = points[k];
    const b = points[k + 1];
    const piece = escapeHtml(text.slice(a, b));
    const ids = [];
    findings.forEach((f, i) => { if (f.start <= a && f.end >= b) ids.push(i); });
    if (!ids.length) { html += piece; continue; }
    const sev = topSeverity(ids.map((i) => findings[i]));
    html += `<mark class="sev-${sev}" data-f="${ids.join(' ')}">${piece}</mark>`;
  }
  // A trailing newline needs a character after it, or the last empty line collapses.
  return text.endsWith('\n') ? html + ' ' : html;
}

function cardHtml(f, i) {
  const sevLabel = f.severity[0].toUpperCase() + f.severity.slice(1);
  // Show the exact words only when the rule name does not already say them.
  const norm = (t) => t.toLowerCase().replace(/[^a-z0-9À-ſ]+/g, ' ').trim();
  const match = f.match.trim() || f.match;
  const showMatch = !norm(f.name).includes(norm(match));
  return `<button type="button" class="jump" data-jump="${i}"><p class="card-name"><span>${escapeHtml(f.name)}</span><span class="sev sev-${f.severity}">${sevLabel}</span></p>${
    showMatch ? `<p class="card-match">“${escapeHtml(match)}”</p>` : ''}</button>
    <p>${escapeHtml(f.message)}</p>
    <p class="card-why">${escapeHtml(f.why)}</p>
    <p class="card-fix"><strong>Try this:</strong> ${escapeHtml(f.fix)}</p>
    <button type="button" class="link" data-off="${escapeHtml(f.ruleId)}">Turn off this rule</button>`;
}

function summaryText() {
  if (!findings.length) return 'No tells found. Nice work.';
  const counts = SEVERITY_ORDER
    .map((s) => [s, findings.filter((f) => f.severity === s).length])
    .filter(([, n]) => n)
    .map(([s, n]) => `${n} ${s}`);
  return `${plural(findings.length, 'phrase might', 'phrases might')} read as AI (${counts.join(', ')})`;
}

function grow() {
  ta.style.height = 'auto';
  ta.style.height = `${ta.scrollHeight}px`;
}

function render() {
  const text = ta.value;
  findings = check(text, { rules, disabled: [...off] });
  backdrop.innerHTML = highlightHtml(text);
  grow();

  const hasText = text.trim() !== '';
  $('empty').hidden = hasText;
  $('results').hidden = !hasText;
  if (!hasText) return;

  $('summary').textContent = summaryText();
  const note = $('turned-off');
  note.hidden = off.size === 0;
  if (off.size) {
    note.innerHTML = `${plural(off.size, 'rule is', 'rules are')} turned off. <button type="button" class="link" id="turn-on">Turn ${off.size === 1 ? 'it' : 'them'} back on</button>`;
  }
  list.innerHTML = findings.map((f, i) => `<li class="card">${cardHtml(f, i)}</li>`).join('');
}

function saveDraft() {
  chrome.storage.session.set({ draft: ta.value });
}

function saveOff() {
  chrome.storage.sync.set({ disabledRules: [...off] });
}

// Scrolls to the phrase and selects it in the text box.
function jumpTo(i) {
  const f = findings[i];
  const mark = backdrop.querySelector(`mark[data-f~="${i}"]`);
  if (!f || !mark) return;
  mark.scrollIntoView({ block: 'center' });
  ta.focus({ preventScroll: true });
  ta.setSelectionRange(f.start, f.end);
}

ta.addEventListener('input', () => { render(); saveDraft(); });

document.addEventListener('click', (e) => {
  const offBtn = e.target.closest('[data-off]');
  if (offBtn) { off.add(offBtn.dataset.off); saveOff(); render(); return; }
  const jump = e.target.closest('[data-jump]');
  if (jump) { jumpTo(Number(jump.dataset.jump)); return; }
  if (e.target.id === 'turn-on') { off.clear(); saveOff(); render(); }
});

$('example').addEventListener('click', () => {
  ta.value = EXAMPLE;
  render();
  saveDraft();
});

$('clear').addEventListener('click', () => {
  ta.value = '';
  render();
  saveDraft();
  ta.focus();
});

$('copy').addEventListener('click', async () => {
  const btn = $('copy');
  try {
    await navigator.clipboard.writeText(ta.value);
  } catch {
    ta.select();
    document.execCommand('copy');
  }
  btn.textContent = 'Copied';
  setTimeout(() => { btn.textContent = 'Copy text'; }, 1500);
});

// ---- Start ----

try {
  const [res, session, synced] = await Promise.all([
    fetch('./vendor/en.json'),
    chrome.storage.session.get('draft'),
    chrome.storage.sync.get('disabledRules'),
  ]);
  rules = loadRules(await res.json());
  off = new Set(synced.disabledRules || []);
  ta.value = session.draft || '';
  render();
  ta.focus();
} catch (err) {
  const status = $('status');
  status.hidden = false;
  status.textContent = 'The checker could not load its rules. Please close and reopen Tellbuster.';
  console.error(err);
}
