// Serves test/pages/ at http://localhost:8080 so the extension can run on them.
// Only this computer can reach it. Stop it with Ctrl+C. Run from the repo root: node scripts/serve-test-pages.js
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const dir = new URL('../test/pages/', import.meta.url);
const port = Number(process.env.PORT) || 8080;

createServer(async (req, res) => {
  const name = decodeURIComponent(new URL(req.url, 'http://x').pathname).slice(1) || 'x-style.html';
  if (!/^[\w.-]+\.html$/.test(name)) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const body = await readFile(new URL(name, dir));
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`Test pages at http://localhost:${port}/ (x-style.html, linkedin-style.html, gmail-style.html)`));
