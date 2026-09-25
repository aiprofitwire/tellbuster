// Tellbuster web demo. Everything runs in this tab: no network calls except loading
// the page's own files, no storage, no tracking.
import { check, loadRules, guessLanguage } from './vendor/tellbuster.js';
// i18n.js is a plain script loaded before this one. It holds every word the interface shows.
const I18N = globalThis.tellbusterI18n;
// The extension's pages follow the browser's language. The landing page stays English unless the address has ?lang=fr.
const T = I18N.strings(I18N.pick({ followBrowser: document.documentElement.hasAttribute('data-follow-browser') }));
I18N.translatePage(T);

const $ = (id) => document.getElementById(id);
const ta = $('text');
const editor = $('editor');
const backdrop = $('backdrop');
const popover = $('popover');
const list = $('list');

const SEVERITY_ORDER = ['high', 'medium', 'low'];
const off = new Set(); // rules turned off for this visit only
let rules = [];
let strictStyle = false; // the strict pack of common filler words, off unless a host page turns it on
let savedOff = []; // rules turned off in the extension's settings (the web demo has none)
let language = 'auto'; // guess the language of the text, unless the extension's settings pick one
let findings = [];
let hideTimer = 0;
let shownMark = null;

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const topSeverity = (list) => SEVERITY_ORDER.find((s) => list.some((f) => f.severity === s));
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

// Opens the "Report a wrong flag" form on GitHub. Only the rule id goes in the link, never the user's text.
function reportUrl(ruleId) {
  const id = encodeURIComponent(ruleId);
  return `https://github.com/aiprofitwire/tellbuster/issues/new?template=false-positive.yml&title=Wrong+flag%3A+${id}&rule=${id}`;
}

function cardHtml(f, i, { jump }) {
  const sevLabel = T.severity[f.severity];
  // Show the exact words only when the rule name does not already say them.
  const norm = (t) => t.toLowerCase().replace(/[^a-z0-9\u00c0-\u017f]+/g, ' ').trim();
  const match = f.match.trim() || f.match;
  const showMatch = !norm(f.name).includes(norm(match));
  const head = `<p class="card-name"><span>${escapeHtml(f.name)}</span><span class="sev sev-${f.severity}">${sevLabel}</span></p>${
    showMatch ? `\n    <p class="card-match">“${escapeHtml(match)}”</p>` : ''}`;
  return `${jump ? `<button type="button" class="jump" data-jump="${i}">${head}</button>` : head}
    <p>${escapeHtml(f.message)}</p>
    <p class="card-why">${escapeHtml(f.why)}</p>
    <p class="card-fix"><strong>${escapeHtml(T.tryThis)}</strong> ${escapeHtml(f.fix)}</p>${
    f.alsoMatched?.length ? `\n    <p class="card-also">${escapeHtml(T.also)} ${escapeHtml(f.alsoMatched.map((o) => o.name).join(', '))}</p>` : ''}
    <button type="button" class="link" data-off="${escapeHtml(f.ruleId)}">${escapeHtml(T.turnOffRule)}</button>
    <a class="link" href="${escapeHtml(reportUrl(f.ruleId))}" target="_blank" rel="noopener">${escapeHtml(T.report)}</a>`;
}

// With rules in more than one language and no language picked, say which one the text was checked as.
function languageNote(text) {
  const codes = [...new Set(rules.map((r) => r.id.split('-')[0]))];
  if (language !== 'auto' || codes.length < 2) return '';
  const code = guessLanguage(text, codes);
  return ` ${T.checkedAs(T.languageNames[code] || code)}`;
}

function summaryText() {
  if (!findings.length) return T.summaryNone;
  const counts = SEVERITY_ORDER
    .map((s) => [s, findings.filter((f) => f.severity === s).length])
    .filter(([, n]) => n);
  return T.summary(findings.length, counts);
}

function grow() {
  ta.style.height = 'auto';
  ta.style.height = `${ta.scrollHeight}px`;
}

function render() {
  const text = ta.value;
  findings = check(text, { rules, disabled: [...savedOff, ...off], strictStyle, language });
  backdrop.innerHTML = highlightHtml(text);
  grow();
  hidePopover();

  const hasText = text.trim() !== '';
  // Lets a host page (like the landing page) update its own badge and counts.
  document.dispatchEvent(new CustomEvent('tellbuster:checked', {
    detail: { count: findings.length, hasText, ruleCount: rules.length },
  }));
  $('empty').hidden = hasText;
  $('results').hidden = !hasText;
  if (!hasText) return;

  const summary = summaryText();
  $('summary').textContent = (languageNote(text) && !summary.endsWith('.') ? `${summary}.` : summary) + languageNote(text);
  const note = $('turned-off');
  note.hidden = off.size === 0;
  if (off.size) {
    note.innerHTML = `${escapeHtml(T.turnedOffVisit(off.size))} <button type="button" class="link" id="turn-on">${escapeHtml(T.turnBackOn(off.size))}</button>`;
  }
  list.innerHTML = findings.map((f, i) => `<li class="card">${cardHtml(f, i, { jump: true })}</li>`).join('');
}

// ---- Popover: explains a highlight on hover, tap, or when the caret sits inside one ----

function showPopover(mark) {
  clearTimeout(hideTimer);
  if (mark === shownMark && !popover.hidden) return;
  shownMark?.classList.remove('is-open');
  shownMark = mark;
  mark.classList.add('is-open');
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
  shownMark?.classList.remove('is-open');
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
  ta.value = T.example;
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
  btn.textContent = T.copied;
  setTimeout(() => { btn.textContent = T.copy; }, 1500);
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
  // The extension popup hands over the rules picked in its settings.
  // The web demo uses every language, and guesses which one the text is in.
  const picked = await globalThis.tellbusterRules?.();
  if (picked) {
    ({ rules, strictStyle } = picked);
    savedOff = picked.disabled;
    language = picked.language || 'auto';
  } else {
    const files = await Promise.all(['en.json', 'fr.json', 'es.json', 'de.json', 'pt.json'].map(async (f) => (await fetch(`./vendor/${f}`)).json()));
    rules = files.flatMap(loadRules);
  }
  // The extension popup can hand over starting text (from the right-click menu).
  const start = await globalThis.tellbusterStartText?.();
  if (start) ta.value = start;
  render();
} catch (err) {
  const status = $('status');
  status.hidden = false;
  status.textContent = T.loadError;
  console.error(err);
}
