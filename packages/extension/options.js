// The settings page. Every change saves right away to chrome.storage.sync.
import { LANGUAGES, DEFAULTS, readSettings, allRules, siteFromInput } from './settings.js';

const $ = (id) => document.getElementById(id);
const CATEGORY_NAMES = {
  phrase: 'Stock phrases',
  filler: 'Filler and hedges',
  structure: 'Sentence patterns',
  'word-choice': 'Word choice',
  punctuation: 'Punctuation',
};
const categoryName = (c) => CATEGORY_NAMES[c] || c[0].toUpperCase() + c.slice(1).replace(/-/g, ' ');

let settings = { ...DEFAULTS };
let savedTimer = 0;

function say(note) {
  const saved = $('saved');
  saved.textContent = note;
  clearTimeout(savedTimer);
  savedTimer = setTimeout(() => { saved.textContent = ''; }, 2500);
}

async function save(changes, note = 'Saved.') {
  Object.assign(settings, changes);
  await chrome.storage.sync.set(changes);
  say(note);
}

const toggle = (list, item, keep) => (keep ? [...new Set([...list, item])] : list.filter((x) => x !== item));

function make(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') el.className = v;
    else if (k.startsWith('data-') || k.startsWith('aria-')) el.setAttribute(k, v);
    else el[k] = v;
  }
  el.append(...kids.filter((k) => k !== null && k !== undefined && k !== false));
  return el;
}

function checkRow(input, ...label) {
  return make('label', { class: 'row' }, input, make('span', {}, ...label));
}

// ---- Languages ----

function drawLanguages() {
  $('languages').replaceChildren(...LANGUAGES.map((l) => {
    const box = make('input', { type: 'checkbox', checked: settings.languages.includes(l.code) });
    box.addEventListener('change', async () => {
      await save({ languages: toggle(settings.languages, l.code, box.checked) });
      $('no-lang').hidden = settings.languages.length > 0;
    });
    return checkRow(box, l.name);
  }));
  $('no-lang').hidden = settings.languages.length > 0;
  const choices = [['auto', 'Guess from the text (recommended)'], ...LANGUAGES.map((l) => [l.code, `Always ${l.name}`])];
  $('language-mode').replaceChildren(...choices.map(([code, label]) => {
    const radio = make('input', { type: 'radio', name: 'language-mode', value: code, checked: settings.language === code });
    radio.addEventListener('change', () => save({ language: code }));
    return checkRow(radio, label);
  }));
}

// ---- Rules ----

function drawRules(rules) {
  const groups = new Map();
  for (const r of rules) {
    if (!groups.has(r.category)) groups.set(r.category, []);
    groups.get(r.category).push(r);
  }
  const order = Object.keys(CATEGORY_NAMES);
  const cats = [...groups.keys()].sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));

  $('rules').replaceChildren(...cats.map((cat) => {
    const list = groups.get(cat).sort((a, b) => a.name.localeCompare(b.name));
    const catOn = () => !settings.disabledCategories.includes(cat);

    const ruleBoxes = list.map((r) => {
      const box = make('input', { type: 'checkbox', checked: !settings.disabledRules.includes(r.id), disabled: !catOn() });
      box.dataset.rule = r.id;
      box.addEventListener('change', () => save({ disabledRules: toggle(settings.disabledRules, r.id, !box.checked) }));
      return checkRow(box, r.name, r.strict && make('span', { class: 'tag', textContent: 'Strict mode' }),
        make('span', { class: 'rule-why', textContent: r.message }));
    });

    const catBox = make('input', { type: 'checkbox', checked: catOn() });
    catBox.dataset.category = cat;
    catBox.addEventListener('change', async () => {
      await save({ disabledCategories: toggle(settings.disabledCategories, cat, !catBox.checked) });
      for (const row of ruleBoxes) row.querySelector('input').disabled = !catBox.checked;
    });

    return make('div', { class: 'group' },
      make('div', { class: 'group-head' },
        checkRow(catBox, make('strong', { textContent: categoryName(cat) }), ' ', make('span', { class: 'count', textContent: `(${list.length} rules)` }))),
      make('details', {},
        make('summary', { textContent: `Show the ${categoryName(cat).toLowerCase()} rules` }),
        ...ruleBoxes));
  }));
}

// ---- Sites ----

function drawSites() {
  $('no-sites').hidden = settings.offSites.length > 0;
  $('sites').replaceChildren(...settings.offSites.map((site) => {
    const btn = make('button', { type: 'button', class: 'link', textContent: 'Turn the badge back on', 'aria-label': `Turn the badge back on for ${site}` });
    btn.addEventListener('click', async () => {
      await save({ offSites: settings.offSites.filter((s) => s !== site) }, `The badge is back on for ${site}.`);
      drawSites();
      $('site').focus();
    });
    return make('li', {}, make('span', { textContent: site }), btn);
  }));
}

$('add-site').addEventListener('submit', async (e) => {
  e.preventDefault();
  const site = siteFromInput($('site').value);
  $('site-error').hidden = site !== '';
  if (!site) return;
  $('site').value = '';
  if (!settings.offSites.includes(site)) {
    await save({ offSites: [...settings.offSites, site].sort() }, `The badge is off on ${site}.`);
  }
  drawSites();
});

// ---- Check as I type ----
// This is only on while Chrome allows Tellbuster to read pages. Nothing else keeps track of it,
// so taking the access back in Chrome's own menus turns it off here too.
const ALL_SITES = { origins: chrome.runtime.getManifest().optional_host_permissions };

async function drawAsYouType() {
  const on = await chrome.permissions.contains(ALL_SITES);
  $('as-you-type').checked = on;
  $('site-settings').hidden = !on;
}

$('as-you-type').addEventListener('change', async () => {
  const box = $('as-you-type');
  $('type-denied').hidden = true;
  if (box.checked) {
    // Chrome only shows its question during a click, so ask before anything else.
    const allowed = await chrome.permissions.request(ALL_SITES).catch(() => false);
    $('type-denied').hidden = allowed;
    if (allowed) say('Check as I type is on.');
  } else {
    await chrome.permissions.remove(ALL_SITES).catch(() => false);
    say('Check as I type is off.');
  }
  await drawAsYouType();
});

chrome.permissions.onAdded.addListener(drawAsYouType);
chrome.permissions.onRemoved.addListener(drawAsYouType);

// ---- Strict mode and reset ----

$('strict').addEventListener('change', () => save({ strictStyle: $('strict').checked }));

$('reset').addEventListener('click', async () => {
  await chrome.storage.sync.clear();
  await save({ ...DEFAULTS }, 'All settings are back to how they started.');
  await start();
});

// ---- Start ----

async function start() {
  settings = await readSettings();
  $('strict').checked = settings.strictStyle;
  await drawAsYouType();
  drawLanguages();
  drawSites();
  try {
    drawRules(await allRules());
  } catch (err) {
    $('rules').replaceChildren(make('p', { class: 'hint', textContent: 'The rules could not load. Please reload this page.' }));
    console.error(err);
  }
}

start();
