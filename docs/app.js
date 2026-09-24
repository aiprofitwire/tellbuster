// Tellbuster web demo. Everything runs in this tab: no network calls except loading
// the page's own files, no storage, no tracking.
import { check, loadRules } from './vendor/tellbuster.js';

const $ = (id) => document.getElementById(id);
const ta = $('text');
const editor = $('editor');
const backdrop = $('backdrop');
const popover = $('popover');
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
const off = new Set(); // rules turned off for this visit only
let rules = [];
let findings = [];
let hideTimer = 0;
let shownMark = null;

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const topSeverity = (list) => SEVERITY_ORDER.find((s) => list.some((f) => f.severity === s));
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

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

function cardHtml(f, i, { jump }) {
  const sevLabel = f.severity[0].toUpperCase() + f.severity.slice(1);
  const head = `<p class="card-name"><span>${escapeHtml(f.name)}</span><span class="sev sev-${f.severity}">${sevLabel}</span></p>
    <p class="card-match">“${escapeHtml(f.match.trim() || f.match)}”</p>`;
  return `${jump ? `<button type="button" class="jump" data-jump="${i}">${head}</button>` : head}
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
  hidePopover();

  const hasText = text.trim() !== '';
  $('empty').hidden = hasText;
  $('results').hidden = !hasText;
  if (!hasText) return;

  $('summary').textContent = summaryText();
  const note = $('turned-off');
  note.hidden = off.size === 0;
  if (off.size) {
    note.innerHTML = `${plural(off.size, 'rule is', 'rules are')} turned off for this visit. <button type="button" class="link" id="turn-on">Turn ${off.size === 1 ? 'it' : 'them'} back on</button>`;
  }
  list.innerHTML = findings.map((f, i) => `<li class="card">${cardHtml(f, i, { jump: true })}</li>`).join('');
}

// ---- Popover: explains a highlight on hover, tap, or when the caret sits inside one ----

function showPopover(mark) {
  clearTimeout(hideTimer);
  if (mark === shownMark && !popover.hidden) return;
  shownMark = mark;
  const ids = mark.dataset.f.split(' ').map(Number);
  popover.innerHTML = ids.map((i) => `<div class="card">${cardHtml(findings[i], i, { jump: false })}</div>`).join('');
  popover.hidden = false;
  const box = editor.getBoundingClientRect();
  const r = mark.getClientRects()[0] || mark.getBoundingClientRect();
  const maxLeft = Math.max(0, box.width - popover.offsetWidth);
  popover.style.left = `${Math.min(Math.max(0, r.left - box.left), maxLeft)}px`;
  popover.style.top = `${r.bottom - box.top + 8}px`;
}

function hidePopover() {
  clearTimeout(hideTimer);
  popover.hidden = true;
  shownMark = null;
}

function hideSoon() {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(hidePopover, 300);
}

// The textarea sits on top of the highlights, so look underneath the pointer for a mark.
function markAt(x, y) {
  return document.elementsFromPoint(x, y).find((el) => el.tagName === 'MARK' && backdrop.contains(el)) || null;
}

function markForFinding(i) {
  return backdrop.querySelector(`mark[data-f~="${i}"]`);
}

function showAtCaret() {
  const pos = ta.selectionStart;
  if (ta.selectionEnd !== pos) return;
  const i = findings.findIndex((f) => f.start <= pos && pos < f.end);
  const mark = i >= 0 && markForFinding(i);
  if (mark) showPopover(mark); else hidePopover();
}

function jumpTo(i) {
  const f = findings[i];
  const marks = backdrop.querySelectorAll(`mark[data-f~="${i}"]`);
  if (!f || !marks.length) return;
  marks[0].scrollIntoView({ block: 'center', behavior: reduceMotion() ? 'auto' : 'smooth' });
  marks.forEach((m) => m.classList.add('flash'));
  setTimeout(() => marks.forEach((m) => m.classList.remove('flash')), 1200);
  // On a computer, also select the phrase. On phones, skip it so the keyboard does not pop up.
  if (matchMedia('(pointer: fine)').matches) {
    ta.focus({ preventScroll: true });
    ta.setSelectionRange(f.start, f.end);
  }
}

function turnOff(ruleId) {
  off.add(ruleId);
  render();
}

// ---- Events ----

ta.addEventListener('input', render);
ta.addEventListener('mousemove', (e) => {
  const mark = markAt(e.clientX, e.clientY);
  if (mark) showPopover(mark); else if (!popover.hidden) hideSoon();
});
ta.addEventListener('mouseleave', () => { if (!popover.hidden) hideSoon(); });
ta.addEventListener('click', (e) => {
  const mark = markAt(e.clientX, e.clientY);
  if (mark) showPopover(mark); else hidePopover();
});
ta.addEventListener('keyup', (e) => {
  if (e.key.startsWith('Arrow') || e.key === 'Home' || e.key === 'End') showAtCaret();
});
ta.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !popover.hidden) { e.preventDefault(); hidePopover(); }
});

popover.addEventListener('mouseenter', () => clearTimeout(hideTimer));
popover.addEventListener('mouseleave', hideSoon);
popover.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { hidePopover(); ta.focus(); }
});

document.addEventListener('click', (e) => {
  const offBtn = e.target.closest('[data-off]');
  if (offBtn) { turnOff(offBtn.dataset.off); return; }
  const jump = e.target.closest('[data-jump]');
  if (jump) { jumpTo(Number(jump.dataset.jump)); return; }
  if (e.target.id === 'turn-on') { off.clear(); render(); return; }
  if (!popover.hidden && !popover.contains(e.target) && e.target !== ta) hidePopover();
});

$('example').addEventListener('click', () => {
  ta.value = EXAMPLE;
  render();
});

$('clear').addEventListener('click', () => {
  ta.value = '';
  render();
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

// Phones fire resize when the address bar hides, so only react when the width changes.
let lastWidth = innerWidth;
addEventListener('resize', () => {
  if (innerWidth === lastWidth) return;
  lastWidth = innerWidth;
  grow();
  hidePopover();
});

// ---- Start ----

try {
  const res = await fetch('./vendor/en.json');
  rules = loadRules(await res.json());
  render();
} catch (err) {
  const status = $('status');
  status.hidden = false;
  status.textContent = 'The checker could not load its rules. Please reload the page.';
  console.error(err);
}
