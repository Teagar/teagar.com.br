import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.env.PORT) || 4321;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};

async function resolve(urlPath) {
  let p = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  if (p.endsWith('/')) p += 'index.html';
  const file = join(dist, p);
  if (!file.startsWith(dist)) return null;
  try {
    const s = await stat(file);
    if (s.isDirectory()) return join(file, 'index.html');
    return file;
  } catch { return null; }
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const file = await resolve(url.pathname);
  try {
    if (!file) throw new Error('nf');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    const body = await readFile(join(dist, '404.html')).catch(() => 'Not found');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(body);
  }
}).listen(port, () => console.log(`http://localhost:${port}`));
