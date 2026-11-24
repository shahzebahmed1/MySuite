import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 5174);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf'
};

const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/' || pathname === '/resident') {
      res.writeHead(302, { Location: '/resident/' });
      return res.end();
    }
    if (pathname === '/favicon.ico') { res.writeHead(204); return res.end(); }
    // Other portal pages are deliberately excluded from this standalone copy.
    if (pathname.endsWith('.html') && pathname !== '/resident/index.html') {
      res.writeHead(302, { Location: '/resident/' });
      return res.end();
    }
    const relative = pathname === '/resident/' ? 'resident/index.html' : pathname.slice(1);
    const file = path.resolve(root, relative);
    const inside = path.relative(root, file);
    if (inside.startsWith('..') || path.isAbsolute(inside) ||
        !['resident', 'shared', 'assets'].includes(inside.split(path.sep)[0])) {
      res.writeHead(404); return res.end('Not found');
    }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
});

server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? `Port ${port} is busy. Set PORT to another number and run npm start again.`
    : error.message);
  process.exitCode = 1;
});

server.listen(port, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${server.address().port}/resident/`;
  console.log(`Resident home dashboard: ${url}\nPress Ctrl+C to stop.`);
  if (process.argv.includes('--no-open')) return;
  const command = process.platform === 'win32' ? 'explorer.exe'
    : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const browser = spawn(command, [url], { detached: true, stdio: 'ignore', windowsHide: true });
  browser.on('error', () => console.log(`Open ${url} in your browser.`));
  browser.unref();
});
