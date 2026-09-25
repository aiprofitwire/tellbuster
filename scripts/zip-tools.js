// Shared by zip-extension.js (Chrome and Edge) and zip-firefox.js.
// Uses only Node's built-in zlib (no packages).
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { deflateRawSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, relative, sep } from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const extDir = join(root, 'packages', 'extension');

// Not needed inside the store package.
const SKIP = new Set(['README.md']);

// Runs sync-extension.js, then returns every file of the extension as { name, data }.
export function extensionFiles() {
  execFileSync(process.execPath, [join(root, 'scripts', 'sync-extension.js')], { stdio: 'ignore' });
  const list = (dir) => readdirSync(dir).sort().flatMap((name) => {
    if (name.startsWith('.') || SKIP.has(name)) return [];
    const full = join(dir, name);
    return statSync(full).isDirectory() ? list(full) : [full];
  });
  return list(extDir).map((file) => ({ name: relative(extDir, file).split(sep).join('/'), data: readFileSync(file) }));
}

// The Firefox id. Firefox needs one to keep settings between updates. Never change it after the
// first upload to addons.mozilla.org.
export const FIREFOX_ID = 'tellbuster@aiprofitwire.github.io';

// Firefox runs the same code, but its manifest differs in two places:
// 1. Firefox has no background service worker. It runs the same file as a background script.
// 2. Firefox needs an id, and asks every new add-on to say what data it collects (none).
export function firefoxManifest(manifest) {
  const { service_worker: file, ...background } = manifest.background;
  return {
    ...manifest,
    background: { ...background, scripts: [file] },
    browser_specific_settings: {
      gecko: {
        id: FIREFOX_ID,
        strict_min_version: '140.0',
        data_collection_permissions: { required: ['none'] },
      },
      // Firefox for Android reads data_collection_permissions from version 142.
      gecko_android: { strict_min_version: '142.0' },
    },
  };
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// A fixed date (2026-01-01 00:00) so the same files always give the same zip.
const DOS_TIME = 0;
const DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1;

// Writes files ({ name, data }) into a zip at `out`.
export function writeZip(files, out) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.name);
    const data = file.data;
    const packed = deflateRawSync(data, { level: 9 });
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0x0800, 6); // names are UTF-8
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt16LE(DOS_TIME, 10);
    local.writeUInt16LE(DOS_DATE, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(packed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    locals.push(local, name, packed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4); // made by
    central.writeUInt16LE(20, 6); // version needed
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(DOS_TIME, 12);
    central.writeUInt16LE(DOS_DATE, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(packed.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, name);

    offset += local.length + name.length + packed.length;
  }

  const centralDir = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDir.length, 12);
  end.writeUInt32LE(offset, 16);
  writeFileSync(out, Buffer.concat([...locals, centralDir, end]));
}

// "Made tellbuster-extension.zip (version 0.1.0, 19 files)."
export function report(out, files) {
  const version = JSON.parse(files.find((f) => f.name === 'manifest.json').data).version;
  const shown = relative(process.cwd(), out);
  console.log(`Made ${shown.startsWith('..') ? out : shown} (version ${version}, ${files.length} files).`);
}
