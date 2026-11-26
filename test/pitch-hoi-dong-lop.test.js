// Đặc tả 012 · PR 1 (Câu chuyện 1): «Hội đồng nhà đầu tư cả lớp» – mỗi đội là một quỹ 1 tỷ đồng, rót vốn qua điện thoại.
//  - Sổ góp vốn (hàm thuần): bậc 50 triệu, trần 500 triệu cho một đội, không rót cho mình, chỉ rót khi cửa sổ 60 giây đang mở,
//    bỏ tin trùng theo mã lượt; 12 quỹ rót liên tục và gửi trùng, tổng vẫn đúng (SC-001); xếp hạng; CSV.
//  - Ra Khơi 3D: tên kênh Realtime mặc định không đổi.
//  - Trình duyệt (kênh 'local' = BroadcastChannel, không mạng ngoài): màn chiếu + 3 trang quỹ: duyệt quỹ, mở cửa sổ,
//    rót, bảng cập nhật, khóa rót cho đội mình, tin trùng không cộng hai lần, đóng sớm, CSV, máy thứ hai chỉ xem; 360 px; VI/EN.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const P = require('../lab/pitch-goi-von-lop.js');
const { LUAT } = P;
const TY = 1e9, TR = 1e6;

// 1. Luật theo làm rõ 3 của đặc tả
assert.equal(LUAT.vonQuy, TY); assert.equal(LUAT.bac, 50 * TR); assert.equal(LUAT.tran, 500 * TR); assert.equal(LUAT.cuaSoGiay, 60);
assert.equal(LUAT.tran / LUAT.vonQuy, 0.5, 'tối đa 50 % vốn cho một đội');

// 2. Mã phòng
let k = 0; const rand = () => ((k++ * 7) % 32) / 32;
const ma = P.maPhongMoi(rand);
assert.ok(P.maPhongHopLe(ma) && ma.length === 6, 'mã phòng 6 ký tự hợp lệ: ' + ma);
for (let i = 0; i < 200; i++) assert.ok(P.maPhongHopLe(P.maPhongMoi()), 'mã ngẫu nhiên luôn hợp lệ');
for (const x of ['IO0123', 'abcdef', 'ABC12', 'ABCDEFG', '', null, 'AB CD2']) assert.ok(!P.maPhongHopLe(x), 'mã sai bị từ chối: ' + x);

// 3. Vào phòng, duyệt, từ chối
const T0 = 1_000_000;
let st = P.taoPhong('TEST22'), r;
r = P.xinVao(st, 'q1', '  Đội   Sen  ', 'x'); st = r.st; assert.ok(r.ok); assert.equal(st.quy.q1.ten, 'Đội Sen', 'tên đội gọn khoảng trắng');
assert.equal(P.xinVao(st, 'q9', '   ').ok, false, 'thiếu tên thì không vào');
st = P.xinVao(st, 'q2', 'Lúa').st; st = P.xinVao(st, 'q3', 'Dừa').st; st = P.xinVao(st, 'q4', 'Phá rối').st;
assert.equal(P.xinVao(st, 'q2', 'Lúa').ly, 'da-co', 'xin lại không nhân đôi');
assert.equal(st.thuTu.length, 4);
st = P.tuChoi(st, 'q4').st; assert.ok(!st.quy.q4 && st.thuTu.length === 3, 'từ chối quỹ đang chờ');
r = P.rot(st, { ma: 'm0', quy: 'q2', doi: 'q1', so: 50 * TR }, T0);
assert.equal(r.ly, 'quy-chua-duyet', 'quỹ chưa duyệt không được rót'); st = r.st;
for (const q of ['q1', 'q2', 'q3']) st = P.duyet(st, q).st;
assert.equal(P.moRot(P.taoPhong('X'), 'q1', 0, T0).ly, 'doi-chua-duyet');

// Tin lạ từ mạng không làm hỏng sổ
for (const x of ['__proto__', 'a b', '<img>', 'x'.repeat(41), 42, null]) assert.equal(P.xinVao(st, x, 'Lạ').ok, false, 'mã quỹ lạ bị từ chối: ' + String(x).slice(0, 12));
assert.equal(({}).trangThai, undefined, 'không nhiễm prototype');
let sDay = P.taoPhong('DAYDAY'); for (let i = 0; i < 60; i++) sDay = P.xinVao(sDay, 'd' + i, 'Đội ' + i).st;
assert.equal(P.xinVao(sDay, 'd60', 'Đội 60').ly, 'day', 'tối đa 60 quỹ một phòng');
// 4. Luật rót
assert.equal(P.rot(st, { ma: 'm1', quy: 'q2', doi: 'q1', so: 50 * TR }, T0).ly, 'chua-mo', 'chưa mở cửa sổ');
st = P.moRot(st, 'q1', 800 * TR, T0).st;
assert.equal(st.dangPitch.hetHan, T0 + 60000, 'cửa sổ 60 giây');
assert.ok(P.dangMo(st, T0 + 59999) && !P.dangMo(st, T0 + 60001));
const thu = (tin, now) => P.rot(st, tin, now == null ? T0 + 1000 : now);
assert.equal(thu({ ma: 'a', quy: 'q1', doi: 'q1', so: 50 * TR }).ly, 'cua-minh', 'không rót cho chính mình');
assert.equal(thu({ ma: 'b', quy: 'q2', doi: 'q3', so: 50 * TR }).ly, 'sai-doi', 'chỉ rót cho đội đang pitch');
for (const so of [30 * TR, -50 * TR, 0, 55 * TR, NaN, 'abc']) assert.equal(thu({ ma: 'c' + so, quy: 'q2', doi: 'q1', so }).ly, 'sai-bac', 'sai bậc 50 triệu: ' + so);
assert.equal(thu({ ma: 'd', quy: 'q2', doi: 'q1', so: 550 * TR }).ly, 'vuot-tran', 'một lần quá 500 triệu');
assert.equal(thu({ ma: 'e', quy: 'q2', doi: 'q1', so: 50 * TR }, T0 + 60001).ly, 'het-gio', 'hết 60 giây');
assert.equal(thu({ quy: 'q2', doi: 'q1', so: 50 * TR }).ly, 'thieu-ma');
assert.equal(thu({ ma: '__proto__', quy: 'q2', doi: 'q1', so: 50 * TR }).ly, 'thieu-ma', 'mã lượt lạ bị từ chối');
r = thu({ ma: 'f1', quy: 'q2', doi: 'q1', so: 300 * TR }); assert.ok(r.ok); st = r.st;
r = P.rot(st, { ma: 'f1', quy: 'q2', doi: 'q1', so: 300 * TR }, T0 + 2000); assert.ok(r.ok && r.ly === 'trung'); st = r.st;
assert.equal(P.tongDoi(st, 'q1').tong, 300 * TR, 'tin trùng mã không cộng hai lần');
r = P.rot(st, { ma: 'f2', quy: 'q2', doi: 'q1', so: 250 * TR }, T0 + 3000); assert.equal(r.ly, 'vuot-tran', 'cộng dồn quá 500 triệu cho một đội'); st = r.st;
r = P.rot(st, { ma: 'f2', quy: 'q2', doi: 'q1', so: 250 * TR }, T0 + 3500); assert.equal(r.ok, false, 'gửi lại tin đã bỏ vẫn bị bỏ'); assert.equal(r.ly, 'trung');
assert.equal(st.bo.filter(b => b.ma === 'f2').length, 1, 'tin bỏ chỉ ghi một lần');
r = P.rot(st, { ma: 'f3', quy: 'q2', doi: 'q1', so: 200 * TR }, T0 + 4000); assert.ok(r.ok, 'đúng 500 triệu thì được'); st = r.st;
r = P.rot(st, { ma: 'f4', quy: 'q3', doi: 'q1', so: 100 * TR }, T0 + 5000); st = r.st;
assert.deepEqual(P.tongDoi(st, 'q1'), { tong: 600 * TR, soQuy: 2 });
assert.equal(P.vonCon(st, 'q2'), 500 * TR);
// hết vốn: q2 rót 500 cho q3, còn 0
st = P.moRot(st, 'q3', 0, T0 + 70000).st;
st = P.rot(st, { ma: 'g1', quy: 'q2', doi: 'q3', so: 500 * TR }, T0 + 71000).st;
assert.equal(P.vonCon(st, 'q2'), 0);
st = P.moRot(st, 'q2', 0, T0 + 140000).st;
st = P.moRot(st, 'q1', 0, T0 + 150000).st;
assert.equal(P.rot(st, { ma: 'g2', quy: 'q2', doi: 'q1', so: 50 * TR }, T0 + 151000).ly, 'vuot-tran');
st = P.moRot(st, 'q3', 0, T0 + 160000).st;
r = P.rot(st, { ma: 'g3', quy: 'q2', doi: 'q3', so: 50 * TR }, T0 + 161000); assert.ok(['het-von', 'vuot-tran'].includes(r.ly), 'quỹ hết tiền không rót được');
// đóng sớm
st = P.dongRot(st, T0 + 162000).st; assert.equal(P.rot(st, { ma: 'g4', quy: 'q1', doi: 'q3', so: 50 * TR }, T0 + 162001).ly, 'het-gio', 'đóng sớm thì hết nhận');
// hết vốn đúng nghĩa: quỹ mới, 2 đội nhận 500 mỗi đội, đội thứ ba bị 'het-von'
let s2 = P.taoPhong('HETVON');
for (const q of ['a', 'b', 'c', 'd']) s2 = P.duyet(P.xinVao(s2, q, 'Đội ' + q).st, q).st;
for (const [i, doi] of ['b', 'c', 'd'].entries()) { s2 = P.moRot(s2, doi, 0, i * 100000).st; r = P.rot(s2, { ma: 'h' + i, quy: 'a', doi, so: 500 * TR }, i * 100000 + 1); s2 = r.st; if (i < 2) assert.ok(r.ok); else assert.equal(r.ly, 'het-von', 'quỹ dùng hết 1 tỷ thì không rót thêm'); }

// 5. Xếp hạng, danh mục, bản tin
const xh = P.xepHang(st);
assert.deepEqual(xh.map(x => [x.ten, x.tong, x.soQuy]), [['Đội Sen', 600 * TR, 2], ['Dừa', 500 * TR, 1], ['Lúa', 0, 0]], 'xếp hạng theo tổng gọi được');
assert.deepEqual(P.danhMuc(st, 'q2').khoan.map(x => [x.ten, x.so]), [['Đội Sen', 500 * TR], ['Dừa', 500 * TR]]);
const bt = P.banTin(st, T0 + 163000);
assert.ok(bt.phong === 'TEST22' && bt.quy.length === 3 && bt.dangPitch && bt.dangPitch.conMo === false, 'bản tin có phòng, quỹ, cửa sổ');
assert.ok(!('bo' in bt) && Array.isArray(bt.daXet) && bt.daXet.some(([m, v]) => m === 'f2' && /^bo:/.test(v)), 'bản tin báo tin đã xét (kể cả bị bỏ, kèm lý do), không gửi chi tiết');
assert.ok(JSON.stringify(bt).length < 20000, 'bản tin gọn');
const dl = P.tuBanTin(bt);
assert.deepEqual(P.xepHang(dl), xh, 'màn xem dựng lại bảng xếp hạng từ bản tin');
assert.equal(P.vonCon(dl, 'q2'), P.vonCon(st, 'q2'), 'trang quỹ tính vốn còn từ bản tin');

// 6. Giả lập 12 quỹ rót liên tục và gửi trùng (SC-001)
let seed = 42; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
let s12 = P.taoPhong('MUOIHA');
const quy12 = Array.from({ length: 12 }, (_, i) => 'Q' + i);
quy12.forEach(q => { s12 = P.duyet(P.xinVao(s12, q, 'Đội ' + q).st, q).st; });
const goc = []; let t = 0;
for (const doi of quy12) {
  t += 100000; goc.push({ mo: doi, t });
  for (let n = 0; n < 40; n++) { const quy = quy12[Math.floor(rnd() * 12)]; goc.push({ tin: { ma: doi + '-' + n, quy, doi, so: (1 + Math.floor(rnd() * 6)) * 50 * TR }, t: t + 1 + n * 1000 }); }
}
const chay = (dsTin) => { let s = s12; for (const e of dsTin) s = e.mo ? P.moRot(s, e.mo, 0, e.t).st : P.rot(s, e.tin, e.t).st; return s; };
const motLan = chay(goc);
const trung = []; goc.forEach(e => { trung.push(e); if (e.tin) for (let i = Math.floor(rnd() * 3); i > 0; i--) trung.push(Object.assign({}, e, { t: e.t + 10 })); });
// gửi lại muộn (sau khi cửa sổ đã sang đội khác) cũng không đổi kết quả
goc.filter(e => e.tin && rnd() < 0.3).forEach(e => trung.push(Object.assign({}, e, { t: t + 500000 })));
const nhieuLan = chay(trung);
assert.deepEqual(nhieuLan.gop, motLan.gop, 'gửi trùng không đổi sổ góp vốn');
assert.equal(new Set(nhieuLan.gop.map(g => g.ma)).size, nhieuLan.gop.length, 'mỗi mã lượt cộng tối đa một lần');
for (const q of quy12) {
  assert.ok(P.vonCon(nhieuLan, q) >= 0, q + ' không âm vốn');
  for (const d of quy12) { const da = nhieuLan.gop.filter(g => g.quy === q && g.doi === d).reduce((a, g) => a + g.so, 0); assert.ok(da <= 500 * TR, q + '→' + d + ' không quá trần'); if (q === d) assert.equal(da, 0, 'không tự rót'); }
}
const tongSo = nhieuLan.gop.reduce((a, g) => a + g.so, 0);
assert.equal(P.xepHang(nhieuLan).reduce((a, x) => a + x.tong, 0), tongSo, 'bảng xếp hạng cộng đúng tổng sổ');
assert.ok(nhieuLan.gop.length > 50 && nhieuLan.bo.length > 50, 'giả lập đủ lớn, có cả tin bị bỏ');

// 7. CSV
const sc = P.duyet(P.xinVao(P.taoPhong('CSV222'), 'x', '=SUM(A1)').st, 'x').st;
const sc2 = P.moRot(P.duyet(P.xinVao(sc, 'y', 'Đội "Y", số 2').st, 'y').st, 'y', 0, Date.UTC(2026, 10, 26, 3)).st;
const sc3 = P.rot(P.rot(sc2, { ma: 'k1', quy: 'x', doi: 'y', so: 100 * TR }, Date.UTC(2026, 10, 26, 3, 0, 5)).st, { ma: 'k2', quy: 'x', doi: 'y', so: 70 * TR }, Date.UTC(2026, 10, 26, 3, 0, 6)).st;
const csv = P.taoCsv(sc3);
assert.ok(csv.startsWith('﻿' + P.COT_CSV.join(',') + '\r\n') && csv.endsWith('\r\n'), 'CSV có BOM, tiêu đề, CRLF');
assert.deepEqual(P.COT_CSV, ['ma_buoi', 'loai', 'ma_luot', 'quy', 'doi', 'so_von', 'ly_do', 'thoi_diem']);
const dongCsv = csv.trim().split('\r\n');
assert.equal(dongCsv.length, 3, 'một dòng nhận, một dòng bỏ');
assert.equal(dongCsv[1], "CSV222,gop,k1,'=SUM(A1),\"Đội \"\"Y\"\", số 2\",100000000,,2026-11-26T03:00:05.000Z", 'dòng góp: chặn công thức, thoát dấu nháy');
assert.ok(dongCsv[2].includes(',bo,k2,') && dongCsv[2].includes(',sai-bac,'), 'dòng bỏ có lý do');

// 8. Định dạng tiền
assert.equal(P.dinhTien(350 * TR), '350 triệu'); assert.equal(P.dinhTien(TY), '1 tỷ'); assert.equal(P.dinhTien(1.25 * TY), '1,25 tỷ');
assert.equal(P.dinhTien(350 * TR, 'en'), '350 million'); assert.equal(P.dinhTien(1.25 * TY, 'en'), '1.25 billion');

// 9. Ra Khơi 3D giữ tên kênh mặc định; phòng pitch dùng tiền tố riêng
const rt = R('js/phong-realtime.js');
assert.ok(/\(tienTo \|\| 'bizon-ra-khoi-'\) \+ phong/.test(rt), 'Ra Khơi 3D: kênh mặc định vẫn là bizon-ra-khoi-<phòng>');
assert.ok(!/tienTo/.test(R('js/ra-khoi-3d.js') || ''), 'Ra Khơi 3D không truyền tiền tố');
assert.ok(R('lab/pitch-goi-von-lop.js').includes("tienTo: 'bizon-pitch-'"), 'phòng pitch dùng kênh bizon-pitch-');

// 10. Trang, sw, sitemap, quyền riêng tư
const quyHtml = R('lab/pitch-quy.html'), chieu = R('lab/pitch-goi-von.html');
assert.ok(/<meta name="robots" content="noindex/.test(quyHtml), 'trang quỹ có noindex');
assert.ok(!R('sitemap.xml').includes('pitch-quy'), 'trang quỹ không vào sitemap');
for (const f of ['pitch-goi-von-lop.js', 'pitch-goi-von-lop-ui.js', 'pitch-quy.html']) assert.ok(R('sw.js').includes("'./lab/" + f + "'"), 'sw.js lưu sẵn ' + f);
assert.ok(R('sw.js').includes("'./js/vendor/qrcode.js'"), 'sw.js lưu sẵn qrcode.js');
const v = +R('sw.js').match(/bizon-v(\d+)/)[1];
assert.ok(v >= 1010, 'sw.js phải ≥ bizon-v1010, đang ' + v);
assert.ok(!/api\.qrserver|chart\.googleapis|quickchart/i.test(chieu + R('lab/pitch-goi-von-lop-ui.js')), 'QR tạo trên máy, không dịch vụ ngoài');
assert.ok(/tên đội do lớp đặt/.test(quyHtml) && /team names chosen by the class/i.test(quyHtml), 'trang quỹ có dòng về dữ liệu (VI/EN)');

(async () => {
  const b = await chromium.launch();
  let fail = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fail++; };
  const ctx = await b.newContext({ acceptDownloads: true });
  const errs = [], ngoai = [];
  const theoDoi = (p, ten) => { p.on('pageerror', e => errs.push(ten + ': ' + e.message)); p.on('request', q => { const u = q.url(); if (!u.startsWith(BASE) && !u.startsWith('data:') && !u.startsWith('blob:')) ngoai.push(u); }); };
  const cho = async (p, fn, arg, ms) => { try { await p.waitForFunction(fn, arg, { timeout: ms || 5000 }); return true; } catch (e) { return false; } };
  await ctx.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });

  // Bản một máy: không có chế độ lớp thì không hiện màn lớp
  const p0 = await ctx.newPage(); theoDoi(p0, 'mot-may');
  await p0.goto(BASE + '/lab/pitch-goi-von.html');
  check(await p0.isHidden('#man-lop') && await p0.isVisible('#nut-che-do-lop'), 'bản một máy: màn lớp ẩn, có nút «Chế độ lớp»');
  await p0.close();

  // Màn chiếu
  const h = await ctx.newPage(); theoDoi(h, 'chieu'); await h.setViewportSize({ width: 1280, height: 900 });
  await h.goto(BASE + '/lab/pitch-goi-von.html?hoidong=1&kenh=local&p=TEST22');
  check(await cho(h, () => window.__pitchLop && __pitchLop.vai() === 'chu'), 'màn chiếu nhận làm chủ phòng');
  check(/TEST22/.test(await h.textContent('#lop-ma')), 'hiện mã phòng');
  check(/^data:image\//.test(await h.getAttribute('#lop-qr img', 'src') || ''), 'QR tạo trên máy (data URI)');
  check(/pitch-quy\.html\?p=TEST22/.test(await h.getAttribute('#lop-link', 'href') || ''), 'đường dẫn trang quỹ có mã phòng');
  check(await h.isHidden('#chan-mot-may') && await h.isVisible('#chan-lop'), 'chế độ lớp: câu chân trang nói đúng việc gửi dữ liệu');

  // Ba quỹ
  const ten = ['Sen', 'Lúa', 'Dừa'], q = [];
  for (const tn of ten) {
    const p = await ctx.newPage(); theoDoi(p, 'quy-' + tn); await p.setViewportSize({ width: 360, height: 760 });
    await p.goto(BASE + '/lab/pitch-quy.html?p=TEST22&kenh=local');
    await p.fill('#quy-ten', tn); await p.click('#nut-vao'); q.push(p);
  }
  check(await cho(h, () => __pitchLop.st().thuTu.length === 3), 'màn chiếu thấy 3 quỹ xin vào');
  check(/(chờ|Chờ)/.test(await q[0].textContent('#quy-trang-thai')), 'quỹ chờ giảng viên duyệt');
  for (let i = 0; i < 3; i++) await h.click('#lop-ds-quy [data-duyet]');
  check(await cho(h, () => Object.values(__pitchLop.st().quy).every(x => x.trangThai === 'duyet')), 'giảng viên duyệt cả 3 quỹ');
  for (const p of q) check(await cho(p, () => __quy.trangThai().duyet), 'quỹ ' + ten[q.indexOf(p)] + ' nhận được duyệt');
  check(/1 tỷ/.test(await q[1].textContent('#quy-von')), 'vốn còn lại 1 tỷ');

  // Mở cửa sổ rót cho Sen
  const idSen = await q[0].evaluate(() => __quy.trangThai().id);
  await h.selectOption('#lop-doi', idSen); await h.fill('#lop-muc-tieu', '800'); await h.click('#nut-mo-rot');
  check(await cho(q[1], () => __quy.trangThai().dangMo), 'quỹ thấy cửa sổ rót đang mở');
  check(await q[0].isDisabled('#nut-rot') && /(chính đội|your own)/i.test(await q[0].textContent('#quy-bao')), 'đội đang pitch không rót cho mình');
  await q[1].click('#nut-them'); await q[1].click('#nut-rot');   // 100 triệu
  await cho(q[2], () => __quy.trangThai().dangMo);
  for (let i = 0; i < 12; i++) if (!(await q[2].isDisabled('#nut-them'))) await q[2].click('#nut-them');   // chặn ở 500 triệu
  check(await q[2].isDisabled('#nut-them'), 'nút cộng tự khóa khi chạm trần');
  check(/500 triệu/.test(await q[2].textContent('#quy-so')), 'nút cộng dừng ở trần 500 triệu');
  await q[2].click('#nut-rot');
  check(await cho(h, () => __pitchLop.st().gop.reduce((a, g) => a + g.so, 0) === 6e8), 'màn chiếu cộng 600 triệu');
  check(/600 triệu/.test(await h.textContent('#lop-tong')) && /2/.test(await h.textContent('#lop-so-quy')), 'bảng trực tiếp: tổng và số quỹ');
  check(await cho(q[1], () => __quy.trangThai().vonCon === 9e8 && __quy.trangThai().choGui === 0), 'quỹ Lúa: còn 900 triệu, không còn tin chờ');
  check(/900 triệu/.test(await q[1].textContent('#quy-von')) && /Sen/.test(await q[1].textContent('#quy-danh-muc')), 'danh mục của quỹ Lúa có Sen');
  check(await q[2].isDisabled('#nut-rot'), 'quỹ Dừa đã chạm trần cho Sen thì khóa rót');

  // Tin trùng, tin vượt trần gửi thẳng lên kênh
  const idLua = await q[1].evaluate(() => __quy.trangThai().id), idDua = await q[2].evaluate(() => __quy.trangThai().id);
  await q[1].evaluate(([a, d]) => { for (let i = 0; i < 3; i++) __quy.guiTho('rot', { ma: 'trung-1', quy: a, doi: d, so: 5e7 }); }, [idLua, idSen]);
  await q[2].evaluate(([a, d]) => __quy.guiTho('rot', { ma: 'tran-1', quy: a, doi: d, so: 5e7 }), [idDua, idSen]);
  await q[1].evaluate(([d]) => __quy.guiTho('rot', { ma: 'gia-1', quy: 'khong-co', doi: d, so: 5e7 }), [idSen]);
  check(await cho(h, () => __pitchLop.st().bo.length >= 2), 'màn chiếu xét tin vượt trần và quỹ lạ');
  const sH = await h.evaluate(() => __pitchLop.st());
  check(sH.gop.reduce((a, g) => a + g.so, 0) === 6.5e8 && sH.gop.filter(g => g.ma === 'trung-1').length === 1, 'tin trùng mã chỉ cộng một lần');
  check(sH.bo.some(x => x.ma === 'tran-1' && x.ly === 'vuot-tran') && sH.bo.some(x => x.ma === 'gia-1' && x.ly === 'quy-chua-duyet'), 'tin sai luật bị bỏ, có lý do');

  // Máy thứ hai mở cùng phòng: chỉ xem
  const h2 = await ctx.newPage(); theoDoi(h2, 'chieu-2'); await h2.setViewportSize({ width: 1280, height: 900 });
  await h2.goto(BASE + '/lab/pitch-goi-von.html?hoidong=1&kenh=local&p=TEST22');
  check(await cho(h2, () => window.__pitchLop && __pitchLop.vai() === 'xem'), 'máy thứ hai chỉ được xem');
  check(await h2.isHidden('#lop-dieu-khien') && await cho(h2, () => /650 triệu/.test(document.getElementById('lop-tong').textContent)), 'màn xem: không có nút điều khiển, vẫn thấy bảng');
  check(await h.evaluate(() => __pitchLop.vai()) === 'chu', 'màn chiếu đầu vẫn là chủ');

  // Đóng sớm
  await h.click('#nut-dong-rot');
  check(await cho(q[1], () => !__quy.trangThai().dangMo), 'đóng sớm: quỹ thấy cửa sổ đã đóng');
  check(await q[1].isDisabled('#nut-rot'), 'đóng rồi thì khóa rót');
  check(await h.$$eval('#lop-xep-hang tbody tr', r => r.length) === 1 && /Sen/.test(await h.textContent('#lop-xep-hang')), 'bảng xếp hạng có đội đã pitch');

  // CSV
  const [dl] = await Promise.all([h.waitForEvent('download'), h.click('#nut-lop-csv')]);
  const noiDung = fs.readFileSync(await dl.path(), 'utf8');
  check(/^﻿?ma_buoi,loai,ma_luot,quy,doi,so_von,ly_do,thoi_diem\r\n/.test(noiDung) && noiDung.trim().split('\r\n').length === 1 + sH.gop.length + sH.bo.length, 'CSV đủ dòng góp và dòng bỏ');
  check(/^pitch-lop-TEST22-\d{4}-\d{2}-\d{2}\.csv$/.test(dl.suggestedFilename()), 'tên tệp CSV có mã phòng và ngày');

  // Tải lại màn chiếu không mất sổ
  await h.reload();
  check(await cho(h, () => window.__pitchLop && __pitchLop.vai() === 'chu' && __pitchLop.st().gop.length === 3, null, 6000), 'tải lại màn chiếu vẫn giữ sổ góp vốn');

  // 360 px, nút ≥ 44 px, VI/EN trên trang quỹ
  await h.setViewportSize({ width: 360, height: 760 });
  check(await h.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, 'màn chiếu 360 px không tràn ngang');
  for (const p of q) check(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, 'trang quỹ ' + ten[q.indexOf(p)] + ' 360 px không tràn ngang');
  const nho = await q[1].$$eval('button', bs => bs.filter(b => b.offsetParent && (b.getBoundingClientRect().height < 44 || b.getBoundingClientRect().width < 44)).map(b => b.id));
  check(nho.length === 0, 'trang quỹ: nút ≥ 44 px ' + nho.join(','));
  await q[1].click('#nut-lang');
  const bodyEn = await q[1].innerText('body');
  check(/Remaining capital|capital left/i.test(bodyEn) && /850 million/.test(bodyEn), 'trang quỹ đổi sang tiếng Anh');
  check(!/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(bodyEn.replace(/Lúa|Dừa|Sen/g, '')), 'trang quỹ EN không còn chữ Việt');
  await h.click('#nut-lang');
  const chieuEn = await h.innerText('#man-lop');
  check(/Room code|room code/.test(chieuEn) && !/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(chieuEn.replace(/Lúa|Dừa|Sen/g, '')), 'màn lớp EN không còn chữ Việt');

  // Trang quỹ không có mã phòng: ô nhập mã
  const p9 = await ctx.newPage(); theoDoi(p9, 'quy-khong-ma'); await p9.goto(BASE + '/lab/pitch-quy.html');
  check(await p9.isVisible('#quy-nhap-ma') && await p9.isHidden('#quy-vao'), 'không có mã phòng: hỏi mã phòng trước');

  check(errs.length === 0, 'không lỗi JS ' + errs.join(' | '));
  check(ngoai.length === 0, 'kênh local: không gọi mạng ngoài ' + ngoai.join(' '));
  await b.close();
  if (fail) { console.error(fail + ' kiểm tra hỏng'); process.exit(1); }
  console.log('pitch-hoi-dong-lop: đạt');
})().catch(e => { console.error(e); process.exit(1); });
