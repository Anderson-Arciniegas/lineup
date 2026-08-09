#!/usr/bin/env node
/**
 * Static SPA server for Playwright e2e (no nx serve hang).
 * Usage: node scripts/e2e-static-server.mjs <dir> <port>
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const dir = process.argv[2];
const port = Number(process.argv[3] || 4200);

if (!dir) {
  console.error('Usage: node scripts/e2e-static-server.mjs <dir> <port>');
  process.exit(1);
}

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

async function resolveIndex() {
  for (const name of ['index.html', 'index.csr.html']) {
    const candidate = join(dir, name);
    try {
      await stat(candidate);
      return candidate;
    } catch {
      // try next
    }
  }
  throw new Error(`No index.html / index.csr.html in ${dir}`);
}

const indexFilePromise = resolveIndex();

const server = createServer(async (req, res) => {
  try {
    const indexFile = await indexFilePromise;
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    let filePath = join(dir, normalize(urlPath).replace(/^(\.\.[/\\])+/, ''));
    let fileStat;
    try {
      fileStat = await stat(filePath);
    } catch {
      fileStat = null;
    }
    if (!fileStat || fileStat.isDirectory()) {
      filePath = indexFile;
    }
    const data = await readFile(filePath);
    const type =
      filePath === indexFile
        ? 'text/html; charset=utf-8'
        : mime[extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': 'no-store',
    });
    res.end(data);
  } catch (err) {
    res.writeHead(404);
    res.end(String(err?.message ?? 'Not found'));
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`e2e-static-server listening on http://127.0.0.1:${port} -> ${dir}`);
});
