'use strict';
// Rà soát đợt 2 (07/11/2026): trang nội bộ, game ngoài sitemap và bản phụ của game gắn noindex, không nằm trong sitemap.
// Bản chính mỗi game giữ trong sitemap. Ba tệp thuộc hồ sơ quyền tác giả đang thẩm định (ben-phu-sa-v8, ben-phu-sa-3d,
// Ho Chieu Thuong Hieu 3D) chưa sửa, để Giai đoạn 3 (docs/roadmap/KE-HOACH-DON-HE-SINH-THAI-2026-11.md).
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const NOINDEX = [
  'Bang Giao Vien.dc.html',
  'Bang Xep Hang Ben Phu Sa.dc.html',
  'Ben Phu Sa Game v4 Nhom.dc.html',
  'BizOn Office Game.html',
  'Grading Scale Bat Nghiep - Student EN.dc.html',
  'Grading Scale Ho Chieu - Student EN.dc.html',
  'Ho Chieu Indonesia 60.dc.html',
  'Ho Chieu Mini 3D.html',
  'Ho Chieu Mini.dc.html',
  'Pho Thi Truong 3D.html',
  'Thang Diem Bat Nghiep - Sinh Vien.dc.html',
  'Thang Diem Chi Tiet.dc.html',
  'Thang Diem Danh Gia.dc.html',
  'Thang Diem Ho Chieu - Sinh Vien.dc.html',
  'Thang Diem Ho Chieu Mini.dc.html',
  'Trang Giang Vien.dc.html',
  'app/aibis.html',
  'app/blueprint-2030.html',
  'app/brand-passport.html',
  'app/command-center.html',
  'app/offline.html',
  'app/release.html',
  'bp3d-boat/ghe-hang-bong.html',
  'bp3d-boat/ghe-mui-doi-5.html',
  'bp3d-boat/index.html',
  'instructor-grading.html',
  'khao-sat.html',
  'kt330h/index.html',
  'ben-phu-sa-v2.html',
  'brand-passport-v2.html',
  'lab/ho-chieu-sau-rieng-v2.html',
  'lab/ho-chieu-sau-rieng-3d.html',
];
const sm = read('sitemap.xml');
for (const f of NOINDEX) {
  assert.match(read(f).slice(0, 30000), /<meta name="robots" content="noindex">/, f + ': thiếu noindex');
  assert.ok(!sm.includes('https://bizonland.com/' + encodeURI(f) + '<'), f + ': không được nằm trong sitemap');
}
// Bản chính mỗi game vẫn trong sitemap, không noindex
for (const f of ['ben-phu-sa.html', 'ho-chieu-thuong-hieu.html', 'brand-passport.html', 'ho-chieu-sau-rieng.html', 'lab/ho-chieu-sau-rieng.html', 'game.html']) {
  assert.ok(sm.includes('https://bizonland.com/' + f + '<'), f + ': phải nằm trong sitemap');
  assert.ok(!/<meta name="robots" content="[^"]*noindex/.test(read(f).slice(0, 30000)), f + ': không được noindex');
}
// index.html và academia3d-v2.html phải giống hệt nhau: không gắn noindex riêng cho bản sao
assert.ok(read('index.html') === read('academia3d-v2.html'));
console.log('seo-dot-2: ok (' + NOINDEX.length + ' trang noindex)');
