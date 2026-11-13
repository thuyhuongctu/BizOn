/* Trùng tên khác người thì đổi tên (chị duyệt 13/11/2026). Hộ Chiếu Thương Hiệu giữ Bà Sáu Lành, Minh Khang, An Nhiên;
 * Hộ Chiếu Sầu Riêng dùng tên riêng cho nhân vật khác ảnh. Đội ở Văn phòng Bến Phù Sa (ảnh bps-*) là người khác
 * với đội 5 vai chuẩn nên có tên riêng. Ảnh anh Tư (cơ sở đóng gói) dùng bản -v2 có tờ giấy ghi đúng vai. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
for (const f of ['lab/ho-chieu-sau-rieng.html', 'lab/ho-chieu-sau-rieng-data.js', 'lab/ho-chieu-sau-rieng-3d.html', 'van-phong-hc-sau-rieng.html']) {
  const s = R(f);
  assert.ok(!/Sáu Lành|Minh Khang|An Nhiên/.test(s), f + ' còn tên trùng với Hộ Chiếu Thương Hiệu');
}
assert.ok(R('lab/ho-chieu-sau-rieng-data.js').includes("vi: 'Bà Bảy Hiền'"));
const r3 = R('lab/ho-chieu-sau-rieng-3d.html');
assert.ok(r3.includes("exporter: 'Quốc Huy'") && r3.includes("frozen: 'Ngọc Diệp'"));
// Thư viện: mục ảnh Sầu Riêng (hc/) không dùng tên của cố vấn Hộ Chiếu Thương Hiệu; cố vấn Thương Hiệu vẫn giữ tên
const tv = R('js/thu-vien-data.js'), tvEn = R('js/thu-vien-data-en.js');
for (const m of tv.matchAll(/\["hc\/[^\]]*\]/g)) assert.ok(!/Sáu Lành|Minh Khang|An Nhiên/.test(m[0]), m[0]);
for (const line of tvEn.split('\n').filter(l => l.includes('"hc/'))) assert.ok(!/Sáu Lành|Minh Khang|An Nhiên/.test(line), line);
assert.ok(tv.includes("['advisors/minh-khang-cut.webp','Minh Khang'") && tv.includes("['advisors/ba-sau-lanh-cut.webp','Bà Sáu Lành'"));
assert.ok(tv.includes("['firms/lam-viet-aodai-cut.webp','Thảo Vy – Lam Việt'") && tvEn.includes("'firms/lam-viet-aodai-cut.webp':['Thảo Vy – Lam Việt'"));
// Văn phòng Bến Phù Sa
const bps = R('van-phong-ben-phu-sa.html');
for (const [cu, moi] of [['Thu Hà', 'Thanh Trúc'], ['Mạnh Chi', 'Lan Chi'], ['Bảo Ngọc', 'Kim Oanh'], ['Gia Hân', 'Diệu Linh']]) {
  assert.ok(!bps.includes(cu) && bps.includes(moi), 'Văn phòng Bến Phù Sa: ' + cu + ' → ' + moi);
}
// Ảnh anh Tư
assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets/hc/cast/anh-tu-htx-cut-v2.webp')));
for (const f of ['lab/ho-chieu-sau-rieng-3d.html', 'js/thu-vien-data.js', 'js/thu-vien-data-en.js']) assert.ok(!R(f).includes('anh-tu-htx-cut.webp'), f);
console.log('doi-ten-nhan-vat: ok');
