// SPDX-License-Identifier: MIT
// Tiny static server for local play: `node serve.ts [--port 8080]`.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./game', import.meta.url)));
const args = process.argv.slice(2);
const flagIndex = args.indexOf('--port');
const port = flagIndex === -1 ? 8080 : Number(args[flagIndex + 1]);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
};

createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { response.writeHead(400).end(); return; }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = resolve(join(root, normalize(pathname)));
  if (file !== root && !file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
  let stats;
  try { stats = statSync(file); if (!stats.isFile()) throw new Error(); } catch { response.writeHead(404).end(); return; }
  response.writeHead(200, {
    'content-type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'content-length': stats.size,
    'cache-control': 'no-store',
  });
  createReadStream(file).pipe(response);
}).listen(Number.isInteger(port) ? port : 8080, '127.0.0.1', () => {
  console.log(`Ember Night Kitchen: http://localhost:${Number.isInteger(port) ? port : 8080}`);
});
