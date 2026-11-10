// Lọc gói deploy (10/11/2026, issue #1025): các tệp trong scripts/release/khong-deploy.txt bị xóa khỏi gói
// Pages trước khi tải lên. Test bảo đảm: tệp có trong kho, không trang/script/dữ liệu nào tải nó, sw.js không
// nạp sẵn nó, và workflow deploy có đọc danh sách này. Bản 1080p gốc chỉ được loại khi có bản -720p thay thế.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..');
const R = f => path.join(ROOT, f);

const list = fs.readFileSync(R('scripts/release/khong-deploy.txt'), 'utf8').split('\n')
  .map(l => l.trim()).filter(l => l && !l.startsWith('#'));
assert.ok(list.length >= 10, 'danh sách loại khỏi deploy phải có tệp');

// Mọi tệp văn bản của trang (ngoài các thư mục không deploy) – nơi có thể nhắc tên tệp.
const SKIP = new Set(['.git', '.github', '.claude', 'docs', 'test', 'scripts', 'supabase', 'android', 'play-store', 'config', 'release', 'design', 'node_modules']);
const TEXT = /\.(html|js|mjs|jsx|css|json|webmanifest|xml|txt|vtt|svg)$/i;
let corpus = '';
(function walk(d) {
  for (const n of fs.readdirSync(d)) {
    const p = path.join(d, n), rel = path.relative(ROOT, p);
    if (SKIP.has(rel.split(path.sep)[0])) continue;
    if (fs.statSync(p).isDirectory()) walk(p); else if (TEXT.test(n)) corpus += fs.readFileSync(p, 'utf8') + '\n';
  }
})(ROOT);

for (const f of list) {
  assert.ok(fs.existsSync(R(f)), 'tệp phải còn trong kho: ' + f);
  assert.ok(f.startsWith('assets/video/') && f.endsWith('.mp4'), 'chỉ lọc video trong assets/video: ' + f);
  const base = path.basename(f);
  assert.ok(!corpus.includes(base), 'có trang/script/dữ liệu còn tải tệp này, không được loại: ' + f);
  if (!/-720p\.mp4$/.test(base)) {
    const small = f.replace(/\.mp4$/, '-720p.mp4');
    if (fs.existsSync(R(small))) assert.ok(fs.statSync(R(small)).size < fs.statSync(R(f)).size, 'bản 720p phải nhẹ hơn bản gốc: ' + f);
  }
}

// Workflow deploy đọc danh sách này trước khi xóa scripts/ và tải gói lên.
const wf = fs.readFileSync(R('.github/workflows/deploy-pages.yml'), 'utf8');
assert.ok(wf.includes('scripts/release/khong-deploy.txt'), 'deploy-pages.yml phải đọc khong-deploy.txt');
assert.ok(wf.indexOf('khong-deploy.txt') < wf.indexOf('rm -rf .github .claude docs test scripts'), 'phải lọc trước khi xóa scripts/');
assert.ok(wf.indexOf('khong-deploy.txt') < wf.indexOf('upload-pages-artifact'), 'phải lọc trước khi tải gói lên');

// sw.js không nạp sẵn video (SHELL) – tệp bị loại không làm hỏng bước cài service worker.
const sw = fs.readFileSync(R('sw.js'), 'utf8');
const shell = (sw.match(/const SHELL = \[([\s\S]*?)\];/) || [])[1] || '';
assert.ok(!/\.mp4/.test(shell), 'SHELL của sw.js không được chứa video');
assert.ok(+(sw.match(/bizon-v(\d+)/) || [])[1] >= 824);
console.log('khong-deploy: ' + list.length + ' tệp loại khỏi gói deploy, không trang nào tải – ok');
