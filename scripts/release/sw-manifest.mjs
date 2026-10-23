// Tạo sw-manifest.json: mã băm nội dung của từng tệp trong SHELL của sw.js.
// Chạy lúc deploy (deploy-pages.yml), không commit. Khi cài phiên bản CACHE mới,
// sw.js so mã băm này với bản đã lưu ở cache cũ: tệp trùng mã thì chép sang,
// không tải lại. Không dùng ETag vì GitHub Pages đóng giờ mới cho mọi tệp mỗi
// lần deploy, nên ETag luôn đổi dù nội dung không đổi.
import crypto from 'node:crypto';
import fs from 'node:fs';

const sw = fs.readFileSync('sw.js', 'utf8');
const shell = sw.match(/const SHELL = \[([\s\S]*?)\];/)[1];
const files = {};
for (const [, u] of shell.matchAll(/'([^']+)'/g)) {
  const p = u === './' ? 'index.html' : decodeURI(u.replace(/^\.\//, ''));
  try { files[u] = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0, 20); } catch (e) { /* tệp thiếu: để sw.js tải như thường */ }
}
fs.writeFileSync('sw-manifest.json', JSON.stringify({ cache: (sw.match(/const CACHE = '([^']+)'/) || [])[1], files }));
console.log('sw-manifest.json: ' + Object.keys(files).length + ' tệp');
