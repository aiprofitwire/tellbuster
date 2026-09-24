// Renders the launch video: two MP4 files in out/ (never committed) and the README GIF in docs/media/.
// Run from this folder: npm install, then npm run render.
import { spawnSync } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';

const jobs = [
  ['Square', 'out/tellbuster-1080x1080.mp4'],
  ['Tall', 'out/tellbuster-1080x1920.mp4'],
  // Half size and 10 frames a second keeps the GIF under 3 MB.
  ['Square', '../docs/media/demo.gif', '--codec=gif', '--scale=0.5', '--every-nth-frame=3']
];

mkdirSync('out', { recursive: true });
mkdirSync('../docs/media', { recursive: true });
for (const [id, file, ...flags] of jobs) {
  const run = spawnSync('npx', ['remotion', 'render', id, file, ...flags], { stdio: 'inherit', shell: process.platform === 'win32' });
  if (run.status !== 0) process.exit(run.status ?? 1);
  console.log(`${file}: ${(statSync(file).size / 1e6).toFixed(1)} MB`);
}
