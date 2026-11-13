/* Sửa chữ theo đề xuất mục 2 báo cáo rà soát 13/11/2026: số liệu tự mâu thuẫn và cách gọi chưa thống nhất.
 * Test giữ cho các con số và cách gọi đã thống nhất không quay lại. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

// Lớp học: Mùa giải 2 đúng 6 vòng; pitch 7 phút đủ 5 vai, cộng đúng 420 giây; IE Lab 4 phương thức
const lh = R('js/lop-hoc-data.js'), lhEn = R('js/lop-hoc-data-en.js');
assert.ok(lh.includes('tuần 9–10 mỗi tuần 1 vòng, tuần 11–12 tăng nhịp 2 vòng/tuần, tuần 13 tổng kết mùa'));
assert.ok(lhEn.includes('two rounds/week in weeks 11–12, week 13 wraps up the season'));
for (const [src, unit] of [[lh, 'giây'], [lhEn, 'sec']]) {
  const i = src.indexOf(unit === 'giây' ? 'Giải phẫu pitch 7 phút' : 'Anatomy of the 7-minute pitch');
  const rows = src.slice(i, src.indexOf(']]}', i));
  const secs = [...rows.matchAll(new RegExp("\\['(\\d+) " + unit + "','([^']+)'", 'g'))];
  assert.equal(secs.reduce((a, m) => a + Number(m[1]), 0), 420, 'pitch cộng đúng 7 phút');
  assert.equal(new Set(secs.map(m => m[2].split(' ').pop())).size, 5, 'pitch có đủ 5 vai');
}
assert.ok(lh.includes('7 thị trường, 4 phương thức thâm nhập') && lhEn.includes('7 markets, 4 entry modes'));
assert.ok(R('lab/ie-lab.js').includes('So sánh 4 phương thức thâm nhập'));

// Thư viện: số tạo hình và số tư thế Tèo Soi khớp dữ liệu
const tv = R('js/thu-vien-data.js'), clay = R('js/thu-vien-clay.js');
const cast = tv.slice(tv.indexOf('cast:['), tv.indexOf(']],', tv.indexOf('cast:[')) + 2).match(/\['[^']+\.webp'/g);
assert.ok(clay.includes('Bộ ' + cast.length + ' tạo hình') && clay.includes(cast.length + ' 3D clay figures'));
const teo = new Set(tv.match(/teo-soi[^'"]*\.webp/g)).size;
assert.ok(clay.includes('Tèo Soi với ' + teo + ' tư thế') && clay.includes('in ' + teo + ' in-game poses'));

// Thiết kế nghiên cứu: không còn «130 phiếu» bên cạnh con số đã phân tích 125
const tk = R('thiet-ke-nghien-cuu.html');
assert.ok(!/130 (phiếu|forms)/.test(tk) && tk.includes('n = 125 phiếu'));

// Vũ trụ: lộ trình khoa kinh doanh quốc tế đủ ba bậc
assert.ok(R('universe.html').includes('data-en="Level 1 + Level 2 + Level 3">Bậc 1 + Bậc 2 + Bậc 3</span>'));
{ const u = R('universe.html'); assert.ok(!u.includes('buổi học sống') && u.includes('>Bốn đầu vào, một buổi học trên lớp</h2>'), 'mục Hệ sinh thái'); }

// Chính sách: có mục 1, không còn «mục 02»
const cs = R('chinh-sach.html');
assert.ok(cs.includes('>1. Hai chế độ sử dụng</h2>') && !cs.includes('mục 02') && !cs.includes('(see 02)'));

// Sầu Riêng: câu giới thiệu vai không còn nói «nấc cao có mã số» (công ty xuất khẩu chưa có mã)
for (const f of ['lab/ho-chieu-sau-rieng.html', 'js/dp2-ui.js']) assert.ok(!R(f).includes('nấc cao có mã số'), f);

// Cách gọi thống nhất
const PAGES = ['index.html', 'universe.html', 'demo.html', 'giai-phap.html', 'du-an.html', 'doi-ngu.html', 'classic-home.html',
  'truong-giang-vien.html', 'truong-hoc-thuat.html', 'thiet-ke-nghien-cuu.html', 'brand-passport-learning.html', 'js/site-ui.js'];
for (const f of PAGES) {
  const s = R(f);
  assert.ok(!/[Ee]ngine (tính toán )?xác định/.test(s), f + ': dùng «engine tất định»');
  assert.ok(!/[Cc]ố vấn theo luật/.test(s), f + ': dùng «cố vấn chạy theo quy tắc»');
}
assert.ok(!/Cố vấn (học tập |chiến lược )?AI/.test(tv + R('classic-home.html')), 'Lumina chạy theo quy tắc, không gọi là AI');
assert.ok(!R('ho-chieu-thuong-hieu.html').includes('đàm phán với AI'));
assert.ok(!tv.includes('Gánh Hàng Khởi Nghiệp'), 'tên cũ của Bến Phù Sa');

// Brand Passport Learning: chữ hiện cho người học bằng tiếng Việt
const bpl = R('brand-passport-learning.html');
for (const s of ['Learning Layer</h1>', 'Reflection của người học', 'trace phiên', 'audit trail', 'cần consent']) assert.ok(!bpl.includes(s), s);
assert.ok(R('js/brand-passport-learning.js').includes("PHASE_VI = { obs: 'quan sát'"));

// Bằng chứng: đường dẫn kho mã là liên kết mở được
const bc = R('bang-chung.html');
assert.ok(bc.includes('<a href="https://github.com/thuyhuongctu/BizOn/blob/main/docs/research/KET-QUA-TRUOC-SAU-2026-10.md">'));

// Bài hát: không hiện ghi chú sản xuất (s.dir) dưới tên đoạn
assert.ok(!R('nhac-ben-phu-sa.html').includes('esc(s.dir)'));
console.log('sua-chu-de-xuat: ok');
