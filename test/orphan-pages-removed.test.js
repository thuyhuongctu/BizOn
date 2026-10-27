// Rà soát 27/10/2026: gỡ hai trang không còn liên kết nào trỏ tới – food-truck.html (trang chuyển hướng
// từ tên cũ của Bến Phù Sa) và lab/globe-demo.html (bản thử quả địa cầu). Không trang/script nào còn nhắc tới.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..');
for (const f of ['food-truck.html', 'lab/globe-demo.html']) assert.ok(!fs.existsSync(path.join(ROOT, f)), 'còn tệp ' + f);
const walk = d => fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).flatMap(e => {
  const p = path.join(d, e.name);
  if (e.isDirectory()) return /^(node_modules|\.git|docs|supabase|test|vendor|android|release|artifacts)$/.test(e.name) ? [] : walk(p);
  return /\.(html|js|css|json|webmanifest|xml)$/.test(e.name) ? [p] : [];
});
for (const f of walk('.')) { const s = fs.readFileSync(path.join(ROOT, f), 'utf8'); assert.ok(!/food-truck\.html|globe-demo\.html/.test(s), f + ' còn nhắc trang đã gỡ'); }
assert.ok(+(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8').match(/bizon-v(\d+)/) || [])[1] >= 696);
console.log('orphan-pages-removed: ok');
