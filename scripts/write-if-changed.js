// Writes a file only when its contents change, and never leaves it half-written.
// The tests run in parallel, and one of them runs the copy scripts while others read the copies.
// A plain copy empties the file first, so a reader could catch it empty. Writing to a temporary
// file and renaming it over the old one swaps the whole file in one step.
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export function writeIfChanged(target, data) {
  const path = target instanceof URL ? fileURLToPath(target) : target;
  const next = Buffer.isBuffer(data) ? data : Buffer.from(data);
  let current = null;
  try { current = readFileSync(path); } catch { /* the file does not exist yet */ }
  if (current && current.equals(next)) return false;
  const temp = `${path}.${process.pid}.tmp`;
  writeFileSync(temp, next);
  renameSync(temp, path);
  return true;
}

export function copyIfChanged(from, to) {
  return writeIfChanged(to, readFileSync(from));
}
