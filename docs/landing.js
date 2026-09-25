// Landing page extras around the shared checker in app.js: the Before / After switch,
// the badge, the list of all notes and the rule count. Like app.js, it makes no network calls.
const $ = (id) => document.getElementById(id);
const ta = $('text');
const beforeBtn = $('show-before');
const afterBtn = $('show-after');
const all = $('all');
// The checker's words follow ?lang= like app.js does. The rest of the landing page stays English.
const T = globalThis.tellbusterI18n.strings(globalThis.tellbusterI18n.pick());

// The "Before" text is the one written in the page, so it shows even before the rules load.
const BEFORE = ta.defaultValue;
const AFTER = 'Post less, and make each post count. Tell one real story from your week, and post it on the same day each week so people know when to look for it.';

let openedOnce = false;

function load(text) {
  ta.value = text;
  ta.dispatchEvent(new Event('input'));
}

// On a computer, open the card for "Let's delve into" once, like the approved design shows.
function openSampleCard() {
  if (openedOnce || ta.value !== BEFORE) return;
  if (!matchMedia('(min-width: 1100px) and (pointer: fine)').matches) return;
  const mark = [...$('backdrop').querySelectorAll('mark')].find((m) => m.textContent.startsWith("Let's"));
  const r = mark?.getBoundingClientRect();
  if (!r || r.bottom > innerHeight) return;
  openedOnce = true;
  ta.dispatchEvent(new MouseEvent('mousemove', { clientX: r.left + 4, clientY: r.top + r.height / 2, bubbles: true }));
}

document.addEventListener('tellbuster:checked', ({ detail }) => {
  const { count, hasText, ruleCount } = detail;
  if (ruleCount) $('rule-count').textContent = String(ruleCount);
  $('badge-text').textContent = T.tells(count);
  $('all-label').textContent = T.seeAll(count);
  all.hidden = !hasText || !count;
  beforeBtn.setAttribute('aria-pressed', String(ta.value === BEFORE));
  afterBtn.setAttribute('aria-pressed', String(ta.value === AFTER));
  if (ruleCount && count) requestAnimationFrame(openSampleCard);
});

beforeBtn.addEventListener('click', () => load(BEFORE));
afterBtn.addEventListener('click', () => load(AFTER));

$('badge').addEventListener('click', () => {
  all.open = true;
  all.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
});

// "Try it without installing" scrolls to the checker and puts the cursor in it.
for (const link of document.querySelectorAll('[data-focus-editor]')) {
  link.addEventListener('click', () => setTimeout(() => ta.focus({ preventScroll: true }), 0));
}
