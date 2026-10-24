#!/usr/bin/env node
/* BizOn – chạy MỌI bộ test/*.test.js (npm test, và workflow .github/workflows/tests.yml).
 * Mỗi tệp chạy trong tiến trình riêng, tuần tự, có giới hạn thời gian. Các bộ test trình duyệt
 * (Hộ Chiếu, IE Lab) cần trang chạy qua HTTP: nếu chưa đặt BIZON_URL thì tự bật một máy chủ tĩnh
 * nhỏ cho thư mục gốc kho ở 127.0.0.1:8899 – đúng địa chỉ mặc định các bộ đó dùng – rồi tắt khi xong.
 * Dùng: node scripts/run-tests.mjs [tên tệp hoặc một phần tên …] */
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readdirSync, createReadStream, statSync } from 'node:fs';
import { join, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const TIMEOUT_MS = 10 * 60 * 1000;
const only = process.argv.slice(2);
const files = readdirSync(join(ROOT, 'test')).filter(f => f.endsWith('.test.js') && (!only.length || only.some(o => f.includes(o)))).sort();

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.glb': 'model/gltf-binary', '.pdf': 'application/pdf' };
function staticServer() {
  return new Promise((ok, fail) => {
    const srv = createServer((req, res) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let file = resolve(join(ROOT, p));
      if (file !== ROOT && !file.startsWith(ROOT + sep)) { res.writeHead(403).end(); return; }
      try { if (statSync(file).isDirectory()) file = join(file, 'index.html'); statSync(file); }
      catch { res.writeHead(404).end('not found'); return; }
      res.writeHead(200, { 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream' });
      createReadStream(file).pipe(res);
    });
    srv.once('error', fail);
    srv.listen(8899, '127.0.0.1', () => ok(srv));
  });
}

let server = null;
const env = { ...process.env };
if (!env.BIZON_URL) {
  try { server = await staticServer(); env.BIZON_URL = 'http://127.0.0.1:8899'; }
  catch (e) { console.warn('⚠️  Không bật được máy chủ tĩnh ở 8899 (' + e.code + '); các bộ test trình duyệt dùng máy chủ đang chạy sẵn ở đó, nếu có.'); }
}

function run(f) {
  return new Promise(done => {
    const t0 = Date.now(), out = [];
    const child = spawn(process.execPath, [join('test', f)], { cwd: ROOT, env });
    child.stdout.on('data', d => out.push(d)); child.stderr.on('data', d => out.push(d));
    const timer = setTimeout(() => { out.push(Buffer.from(`\n⏱  Quá ${TIMEOUT_MS / 60000} phút, dừng.\n`)); child.kill('SIGKILL'); }, TIMEOUT_MS);
    child.on('close', code => { clearTimeout(timer); done({ f, code, ms: Date.now() - t0, log: Buffer.concat(out).toString() }); });
  });
}

const results = [];
for (const f of files) {
  const r = await run(f);
  results.push(r);
  console.log(`${r.code === 0 ? '✅' : '❌'} ${f}  (${(r.ms / 1000).toFixed(1)} s)`);
  if (r.code !== 0) console.log(r.log.split('\n').map(l => '    ' + l).join('\n'));
}
if (server) server.close();
const bad = results.filter(r => r.code !== 0);
console.log(`\n${results.length - bad.length}/${results.length} bộ test đạt.${bad.length ? ' Lỗi: ' + bad.map(r => r.f).join(', ') : ''}`);
process.exit(bad.length ? 1 : 0);
