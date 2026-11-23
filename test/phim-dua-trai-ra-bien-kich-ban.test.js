// Loạt phim «Đưa trái ra biển», tập 1 «Sà lan hay xe tải?» – tiền kỳ (đặc tả 008, PR 1, 23/11/2026).
// Kiểm kịch bản đủ 7 nhịp, móc câu ≤ 10 giây, VI/EN cùng số câu, kết bằng câu hỏi và không phán lựa chọn nào đúng,
// mọi con số có nguồn, cảnh và nhân vật có thật, mô tả cảnh cấm chữ và logo, lời thu giọng khớp kịch bản.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), R = f => path.join(ROOT, f), read = f => fs.readFileSync(R(f), 'utf8');
const rows = (t, n) => t.split('\n').filter(l => l.startsWith('|')).map(l => l.split('|').slice(1, -1).map(x => x.trim()))
  .filter(c => c.length >= n && /^(\d+|C\d+|N\d+)$/.test(c[0]));

// 1. Nguồn số liệu: mỗi mã N có tài liệu và URL hoặc số trang
const nguon = read('docs/phim/nguon-so-lieu.md');
const N = new Map(rows(nguon, 6).map(c => [c[0], c]));
assert.ok(N.size >= 8, 'có ít nhất 8 nguồn');
for (const [ma, c] of N) assert.ok(/https:\/\//.test(c[2]) || /tr\./.test(c[3]) || /tự tính/.test(c[2]), ma + ': có URL hoặc số trang');
assert.match(nguon, /## Hư cấu/, 'có mục kê tình tiết hư cấu');

// 2. Kịch bản
const kb = read('docs/phim/tap-01-kich-ban.md');
const K = rows(kb, 8).map(c => ({ so: +c[0], moc: c[1], nhip: c[2], vi: c[3], en: c[4], chu: c[5], canh: c[6], nguon: c[7] }));
assert.ok(K.length >= 25, 'kịch bản có ít nhất 25 câu');
const NHIP = ['Móc câu', 'Tựa đề', 'Hai phe', 'Leo thang', 'Cú lật', 'Kết treo', 'Hậu đoạn'];
assert.deepEqual([...new Set(K.map(k => k.nhip))], NHIP, 'đủ 7 nhịp, đúng thứ tự');
const giay = m => { const [p, s] = m.split(':').map(Number); return p * 60 + s; };
assert.ok(giay(K.find(k => k.nhip !== 'Móc câu').moc) <= 10, 'móc câu kết thúc trong 10 giây đầu');
assert.ok(K.every((k, i) => i === 0 || giay(k.moc) >= giay(K[i - 1].moc)), 'mốc thời gian tăng dần');
assert.ok(giay(K[K.length - 1].moc) >= 240 && giay(K[K.length - 1].moc) <= 360, 'dài 4–6 phút');
for (const k of K) assert.equal(k.vi === '—', k.en === '—', 'câu ' + k.so + ': VI và EN cùng có hoặc cùng không có lời');
const ket = K.filter(k => k.nhip === 'Kết treo').map(k => k.vi + ' ' + k.en).join(' ');
assert.ok(/sông hay đường/i.test(ket) && /river or road/i.test(ket), 'kết treo bằng câu hỏi «sông hay đường?»');
const loiVi = K.map(k => k.vi).join(' ');
assert.ok(!/(nên|hãy) (chọn|đi) (sà lan|xe tải|sông|đường)|đáp án đúng|lựa chọn đúng|chọn đúng/i.test(loiVi), 'Lumina không phán lựa chọn nào đúng');
assert.ok(K.some(k => /không chọn giúp/.test(k.vi)) && K.some(k => /don't choose for anyone/.test(k.en)), 'Lumina nói rõ không chọn giúp');
assert.ok(!/\bAI\b/.test(K.map(k => k.vi + k.en).join(' ')), 'không gọi Lumina là AI');
assert.ok(!/1,30|1,25|0,06|0,95/.test(loiVi), 'không đọc số mô phỏng của game');
for (const k of K) {
  const so = (k.vi + ' ' + k.chu).replace(/Tập \d+|Ep\. \d+|\d\d:\d\d:\d\d/g, '');
  const ma = k.nguon.match(/N\d+/g) || [];
  if (/\d/.test(so)) assert.ok(ma.length || /H/.test(k.nguon), 'câu ' + k.so + ': có số thì phải có nguồn hoặc ghi H');
  for (const m of ma) assert.ok(N.has(m), 'câu ' + k.so + ': mã nguồn ' + m + ' có trong nguon-so-lieu.md');
}

// 3. Phân cảnh: mọi cảnh trong kịch bản có thật; cảnh nhân vật có ảnh tham chiếu thật và mô tả cấm chữ, logo
const pc = read('docs/phim/tap-01-phan-canh.md');
const C = new Map(rows(pc, 8).map(c => [c[0], { loai: c[1], nv: c[5], anh: c[6], mota: c[7] }]));
for (const k of K) assert.ok(C.has(k.canh), 'câu ' + k.so + ': cảnh ' + k.canh + ' có trong bảng phân cảnh');
const khung = read('docs/phim/khung-loat-phim.md');
const nhanVat = khung.split('## 4. Nhân vật')[1].split('## 5.')[0];
const ten = [...nhanVat.matchAll(/^\| \*\*([^*]+)\*\* \|/gm)].map(m => m[1]);
assert.ok(ten.length >= 9 && ten.includes('Lumina') && ten.includes('Tèo Soi'), 'khung có danh sách nhân vật');
for (const [ma, c] of C) {
  for (const f of c.anh.match(/assets\/[^`\s,]+/g) || []) assert.ok(fs.existsSync(R(f)), ma + ': ảnh tham chiếu có thật ' + f);
  if (c.loai === 'NV') {
    assert.ok(/no text/.test(c.mota) && /no logos/.test(c.mota), ma + ': mô tả cảnh cấm chữ và logo');
    assert.ok(/claymation/.test(c.mota), ma + ': giữ phong cách đất nặn');
  }
  for (const n of c.nv.split(',').map(x => x.replace(/\(.*\)/, '').trim()).filter(x => x && x !== '–')) assert.ok(ten.includes(n), ma + ': nhân vật có sẵn ' + n);
}
for (const f of nhanVat.match(/assets\/[^`\s,]+/g)) assert.ok(fs.existsSync(R(f)), 'khung: ảnh tham chiếu có thật ' + f);
assert.match(khung, /no text, no signs, no logos/, 'khung ghi quy tắc không chữ trong cảnh');
assert.match(khung, /Hoàng Sa và Trường Sa/, 'khung ghi quy tắc bản đồ');

// 4. Lời thu giọng khớp kịch bản (cùng số câu, cùng thứ tự) cho cả VI và EN
const ltg = read('docs/phim/tap-01-loi-thu-giong.md');
const coLoi = K.filter(k => k.vi !== '—').map(k => k.so);
const [phanVi, phanEn] = ltg.split('## English');
for (const [ten2, phan] of [['VI', phanVi], ['EN', phanEn]]) {
  const so = rows(phan, 3).map(c => +c[0]);
  assert.deepEqual(so, coLoi, ten2 + ': lời thu giọng có đúng các câu có lời của kịch bản');
}
assert.match(ltg, /48 kHz/, 'có hướng dẫn thu');

// 5. Kế hoạch sản xuất: lịch phát hành khớp plan.md của đặc tả, có lưu trữ, cổng duyệt, danh sách kiểm, dự phòng
const kh = read('docs/phim/ke-hoach-san-xuat.md'), plan = read('specs/008-phim-dua-trai-ra-bien/plan.md');
const ngayPhat = t => [...t.matchAll(/CN (\d\d\/\d\d\/20\d\d)/g)].map(m => m[1]);
const phatPlan = [...new Set(ngayPhat(plan.split('## Mùa 1')[1].split('**Hai nhánh')[0]))];
assert.equal(phatPlan.length, 6, 'plan.md có 6 ngày phát hành');
for (const d of phatPlan) assert.ok(kh.includes(d), 'kế hoạch sản xuất có ngày phát hành ' + d);
for (const muc of ['## 3. Dây chuyền một tập', '## 5. Lưu trữ tệp', '## 6. Cổng duyệt', '## 7. Danh sách kiểm chất lượng', '## 10. Dự phòng', '## 11. Bảng theo dõi tiến độ'])
  assert.ok(kh.includes(muc), 'kế hoạch có mục ' + muc);
assert.ok(/02-giong\/vi/.test(kh) && /03-canh-nv/.test(kh) && /05-ban-cuoi/.test(kh), 'có cấu trúc thư mục Drive');
assert.ok(/Hoàng Sa và Trường Sa/.test(kh) && /không dành cho trẻ em/.test(kh) && /làm trước Tết/.test(kh), 'danh sách kiểm và lịch Tết');
assert.ok(plan.includes('docs/phim/ke-hoach-san-xuat.md'), 'plan.md trỏ tới kế hoạch sản xuất');

// 6. Khung hình Stitch (23/11/2026): thương hiệu «Sầu Riêng Phù Sa» thay «Durian Express» (trùng dịch vụ của DHL Express Malaysia),
// Minh Khang đại diện hợp tác xã ở lễ ra mắt và ký hợp đồng, Kim Long chỉ là đối thủ; mọi khung dùng trong phân cảnh có trong danh sách.
const thuongHieu = khung.split('## 3.')[0];
assert.match(thuongHieu, /«Sầu Riêng Phù Sa»/, 'khung ghi thương hiệu «Sầu Riêng Phù Sa» của hợp tác xã');
assert.match(khung, /thay cho tên «Durian Express»[^\n]*DHL Express Malaysia/, 'ghi lý do bỏ tên «Durian Express»');
for (const dong of khung.split('\n').filter(l => /durian express/i.test(l))) assert.ok(/thay cho tên|xóa|in chữ/i.test(dong), '«Durian Express» chỉ được nhắc để bỏ hoặc xóa: ' + dong.slice(0, 50));
assert.ok(/\*\*Minh Khang\*\*[^\n]*lễ ra mắt và lễ ký hợp đồng/.test(nhanVat) && /\*\*Kim Long\*\*[^\n]*đối thủ\. Không bao giờ đứng ở vị trí của hợp tác xã/.test(nhanVat), 'Minh Khang dẫn lễ ra mắt, Kim Long là đối thủ');
const stitch = khung.split('## 11. Khung hình tham chiếu (Stitch)')[1] || '';
const khungStitch = [...stitch.matchAll(/^\| `([A-Za-z0-9-]+\.png)` \|/gm)].map(m => m[1]);
assert.equal(khungStitch.length, 21, 'khung kê đủ 21 khung hình Stitch');
assert.equal(new Set(khungStitch).size, 21, 'tên khung không trùng');
assert.match(stitch, /no text, no letters, no logos, no signage, no brand names, no flags, no maps/, 'có đuôi lời nhắc cấm chữ khi dựng lại');
for (const dong of stitch.split('\n').filter(l => l.startsWith('| `') && /Kim Long/.test(l))) assert.match(dong, /Kim Long (→ Minh Khang|ra rìa)/, 'khung có Kim Long phải ghi việc thay: ' + dong.slice(0, 40));
const pcStitch = pc.split('## Khung hình Stitch cho tập 1')[1].split('\n## ')[0];
const dungTap1 = [...pcStitch.matchAll(/`([A-Za-z0-9-]+\.png)`/g)].map(m => m[1]);
assert.ok(dungTap1.length >= 7, 'phân cảnh tập 1 chỉ rõ khung Stitch cho các cảnh');
for (const f of dungTap1) assert.ok(khungStitch.includes(f) && f.startsWith('tap01-'), 'khung ' + f + ' có trong danh sách và thuộc tập 1');
assert.ok(/\bC04\b/.test(pcStitch) && /\bC11\b/.test(pcStitch) && /\bC17\b/.test(pcStitch), 'khung Stitch gắn với C04, C11, C17');

// 7. sw.js
assert.ok(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 978, 'sw.js ≥ v978');
console.log('phim-dua-trai-ra-bien-kich-ban: đạt (' + K.length + ' câu, ' + C.size + ' cảnh, ' + N.size + ' nguồn)');
