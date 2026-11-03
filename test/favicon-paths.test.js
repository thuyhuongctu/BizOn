// Kiểm tra đêm 03/11/2026: hai trang trỏ favicon tới tệp không tồn tại
// (man-hinh-lop-hoc.html → logo/bizon-icon.svg; lab/ho-chieu-sau-rieng-3d.html → lab/assets/icons/icon-192.png).
// Phép thử tĩnh: mọi <link rel="icon"> trong các trang HTML phải trỏ tới tệp có thật.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..');
const dirs = ['.', 'lab', 'kt330h'];
const bad = [];
let n = 0;
for (const d of dirs) {
  const abs = path.join(ROOT, d);
  if (!fs.existsSync(abs)) continue;
  for (const f of fs.readdirSync(abs).filter(x => x.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(abs, f), 'utf8');
    for (const m of html.matchAll(/<link\b[^>]*rel=["'](?:shortcut )?icon["'][^>]*>/gi)) {
      const href = (m[0].match(/href=["']([^"'?#]+)/) || [])[1];
      if (!href || /^(https?:|data:|\/\/)/.test(href)) continue;
      n++;
      const target = href.startsWith('/') ? path.join(ROOT, href) : path.join(abs, decodeURIComponent(href));
      if (!fs.existsSync(target)) bad.push(path.join(d, f) + ' → ' + href);
    }
  }
}
assert.ok(n > 50, 'tìm thấy quá ít favicon: ' + n);
assert.deepEqual(bad, [], 'favicon trỏ tới tệp không tồn tại');
assert.ok(+(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8').match(/bizon-v(\d+)/) || [])[1] >= 762);
console.log('✓ favicon-paths: ' + n + ' liên kết favicon đều trỏ tới tệp có thật');
