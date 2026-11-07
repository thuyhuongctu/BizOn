/* Dọn điều hướng (PR 2 của kế hoạch docs/roadmap/KE-HOACH-DON-HE-SINH-THAI-2026-11.md, 06/11/2026): lối vào «Sinh viên» trên trang chủ
 * dẫn cùng bản Bến Phù Sa với thẻ game (ben-phu-sa-3d.html); menu và chân trang không còn «Sảnh 3D (thử nghiệm)» (tệp hub-3d.html vẫn giữ);
 * hai trang công khai brand-passport-learning.html và lab/bo-do-tien-quyet.html có canonical và nằm trong sitemap. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
for (const p of ['index.html', 'academia3d-v2.html']) {
  const s = R(p);
  assert.ok(s.includes('href="ben-phu-sa-3d.html" data-en="Bến Phù Sa →"'), p + ': lối vào Sinh viên phải dẫn tới ben-phu-sa-3d.html');
  assert.ok(!s.includes('href="ben-phu-sa-v8.html" data-en="Bến Phù Sa →"'), p + ': lối vào Sinh viên không còn trỏ v8');
  assert.ok(s.includes('class="hp-play" href="ben-phu-sa-3d.html"'), p + ': thẻ game Bến Phù Sa vẫn lấy bản 3D làm chính');
}
assert.equal(R('index.html'), R('academia3d-v2.html'), 'index.html phải giống hệt academia3d-v2.html');
for (const p of ['js/site-nav.js', 'js/site-footer.js']) assert.ok(!R(p).includes('hub-3d.html'), p + ': không còn mục Sảnh 3D thử nghiệm');
assert.ok(fs.existsSync(path.join(__dirname, '..', 'hub-3d.html')), 'hub-3d.html vẫn giữ (chỉ bỏ khỏi menu)');
const sm = R('sitemap.xml');
for (const p of ['brand-passport-learning.html', 'lab/bo-do-tien-quyet.html']) {
  assert.ok(R(p).includes('<link rel="canonical" href="https://bizonland.com/' + p + '">'), p + ': thiếu canonical');
  assert.ok(sm.includes('https://bizonland.com/' + p + '<'), p + ': chưa có trong sitemap');
}
assert.ok(+(/CACHE = 'bizon-v(\d+)'/.exec(R('sw.js')) || [])[1] >= 796, 'sw.js ≥ bizon-v796');
console.log('don-dieu-huong: ok');
