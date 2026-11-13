/* Chị chốt 13/11/2026: tên nhân vật cố vấn viết «Tu Phan» (không dấu, tên thật vẫn là Phan Anh Tú);
 * bài hát Bến Phù Sa ghi lời và nhạc của cả hai tác giả. Tệp game đang khóa chờ giấy chứng nhận được bỏ qua. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..');
const KHOA = new Set(['ben-phu-sa-v8.html', 'bizon-characters.js', 'Ho Chieu Thuong Hieu 3D.html', 'js/bps3d-v3.js']);
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) {
    const p = d ? d + '/' + e.name : e.name;
    if (e.isDirectory()) { if (!/^(node_modules|\.git|docs|specs|kt330h|assets)$/.test(e.name)) walk(p); }
    else if (/\.(html|js|jsx)$/.test(e.name) && !/\.dc\.html$/.test(e.name) && !KHOA.has(p) && !p.startsWith('test/')) files.push(p);
  }
})('');
const sai = files.filter(f => fs.readFileSync(path.join(ROOT, f), 'utf8').includes('Tú Phan'));
assert.deepEqual(sai, [], 'còn «Tú Phan» (cần viết «Tu Phan»): ' + sai.join(', '));
const bh = fs.readFileSync(path.join(ROOT, 'nhac-ben-phu-sa.html'), 'utf8');
assert.ok(bh.includes('>Lời và nhạc: Đỗ Thùy Hương &amp; Phan Anh Tú ·') && bh.includes('Words &amp; music: Đỗ Thùy Hương &amp; Phan Anh Tú ·'));
console.log('tu-phan-ten-goi: ok');
