// Tellbuster settings, kept in chrome.storage.sync so they follow you to your other computers.
// Only these choices are stored. Never your text.
import { loadRules } from './vendor/tellbuster.js';

// One entry per rules file in vendor/.
export const LANGUAGES = [
  { code: 'en', name: 'English', file: 'en.json', strictFile: 'en-strict.json' },
  { code: 'fr', name: 'French', file: 'fr.json' },
  { code: 'es', name: 'Spanish', file: 'es.json' },
  { code: 'de', name: 'German', file: 'de.json' },
  { code: 'pt', name: 'Portuguese', file: 'pt.json' },
];

export const DEFAULTS = {
  languages: ['en', 'fr', 'es', 'de', 'pt'],
  language: 'auto', // "auto" guesses the language of each text; a code like "fr" always uses that language
  strictStyle: false,
  disabledRules: [],
  disabledCategories: [],
  offSites: [],
};

// Reads the settings and fixes anything odd, so callers can trust the shape.
export async function readSettings() {
  const s = await chrome.storage.sync.get(DEFAULTS);
  const list = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);
  return {
    languages: list(s.languages),
    language: LANGUAGES.some((l) => l.code === s.language) ? s.language : 'auto',
    strictStyle: s.strictStyle === true,
    disabledRules: list(s.disabledRules),
    disabledCategories: list(s.disabledCategories),
    offSites: list(s.offSites),
  };
}

const cache = {};
function loadFile(name) {
  // The rules ship inside the extension, so this reads local files, not the internet.
  cache[name] ??= fetch(chrome.runtime.getURL(`vendor/${name}`))
    .then((res) => res.json())
    .then(loadRules)
    .catch((err) => { delete cache[name]; throw err; });
  return cache[name];
}

// Every rule the extension knows, strict ones included. Used by the settings page.
export async function allRules() {
  const files = LANGUAGES.flatMap((l) => [l.file, l.strictFile].filter(Boolean));
  return (await Promise.all(files.map(loadFile))).flat();
}

// The rules to check with: picked languages, the strict pack only when strict mode is on,
// and no rules from turned off categories. Single rules turned off go in check()'s "disabled".
export async function activeRules(settings) {
  const langs = LANGUAGES.filter((l) => settings.languages.includes(l.code));
  const files = langs.flatMap((l) => [l.file, settings.strictStyle && l.strictFile].filter(Boolean));
  const rules = (await Promise.all(files.map(loadFile))).flat();
  return rules.filter((r) => !settings.disabledCategories.includes(r.category));
}

// Turns "https://www.linkedin.com/feed/" or "LinkedIn.com" into "linkedin.com". Empty if it is not a site.
export function siteFromInput(input) {
  const raw = String(input).trim().toLowerCase();
  if (!raw) return '';
  try {
    const host = new URL(raw.includes('://') ? raw : `https://${raw}`).hostname.replace(/^www\./, '');
    return /^[a-z0-9-]+(\.[a-z0-9-]+)+$|^localhost$/.test(host) ? host : '';
  } catch {
    return '';
  }
}

// True if the host is the site or one of its subdomains (mail.google.com matches google.com).
export function siteMatches(host, site) {
  return host === site || host.endsWith(`.${site}`);
}
