// The findings come from the real engine and the real English rules, so the video never shows a made-up tell.
import { check, loadRules } from '../../packages/core/src/index.js';
import en from '../../rules/en.json';
import { BEFORE, AFTER } from './script.js';

const rules = loadRules(en);

export const beforeFindings = check(BEFORE, { rules });
export const afterFindings = check(AFTER, { rules });

// For underlines, skip a finding that sits inside another one ("delve" inside "Let's delve into").
export const beforeMarks = beforeFindings.filter(
  (f) => !beforeFindings.some((o) => o !== f && o.start <= f.start && o.end >= f.end && o.end - o.start > f.end - f.start)
);
