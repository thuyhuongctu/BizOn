/* Tên trường hiện nay là «Đại học Cần Thơ» (chị yêu cầu 17/11/2026). Các trang công khai, Trang Giảng viên và mẫu chứng nhận
 * không còn ghi «Trường Đại học Cần Thơ». Giữ nguyên tên cũ ở trích dẫn bài đã công bố (ICoISSEE-5, 2025), tài liệu pháp lý
 * đã ký trong docs/ip và migration Supabase đã áp. Tên tiếng Anh vẫn là «Can Tho University». */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const bad = [];
for (const f of fs.readdirSync(ROOT).filter(n => /\.(html|md)$/.test(n))) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  for (const m of s.matchAll(/.{0,80}Trường (?:Đại học|ĐH) Cần Thơ.{0,10}/g)) {
    if (/ICoISSEE/.test(m[0])) continue; // trích dẫn bài hội thảo năm 2025, giữ đúng tên lúc công bố
    bad.push(f + ': …' + m[0].trim());
  }
}
assert.deepEqual(bad, [], 'còn tên cũ «Trường Đại học Cần Thơ»:\n' + bad.join('\n'));
const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
assert.ok(home.includes('Nghiên cứu sinh Quản trị Kinh doanh, Đại học Cần Thơ'), 'thẻ tác giả trên trang chủ dùng tên mới');
assert.ok(home === fs.readFileSync(path.join(ROOT, 'academia3d-v2.html'), 'utf8'), 'index.html giống hệt academia3d-v2.html');
assert.ok(+(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8').match(/bizon-v(\d+)/) || [])[1] >= 896, 'sw.js ≥ v896');
console.log('dai-hoc-can-tho: ok');
