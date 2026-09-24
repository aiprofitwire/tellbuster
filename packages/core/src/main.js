// The npm entry point: the engine plus the bundled rule packs.
// The web demo and the extension use src/index.js directly, with their own copies of the rules.
import { check, loadRules } from './index.js';
import { packs } from './rules.js';

export { check, summarize, loadRules, guessLanguage } from './index.js';
export { packs };

let cached = null;

/** Every bundled rule (English, French and the English strict pack), validated once. */
export function defaultRules() {
  if (!cached) cached = Object.values(packs).flatMap((pack) => loadRules(pack));
  return cached;
}

/**
 * Checks text with the bundled rules. The language is guessed unless you pass one.
 * Options: disabled, strictStyle, language ('auto', 'en', 'fr'), rules (to use your own).
 */
export function lint(text, options = {}) {
  return check(text, { rules: defaultRules(), language: 'auto', ...options });
}
