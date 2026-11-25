// Đặc tả 010 · PR 1 (Câu chuyện 1): Phòng luyện pitch gọi vốn – đồng hồ 7 phút theo 5 vai, Hội đồng hỏi từ bộ câu soạn sẵn.
//  - Luật khớp kịch bản «Đại hội Cổ đông» trong js/lop-hoc-data.js: CEO 30 · CMO 90 · CFO 90 · COO 60 · SEC 60 · CEO 90 = 7 phút;
//    quá 30 giây (7:30) thì trừ 5 điểm và dừng.
//  - Đồng hồ theo giờ thật (đồng hồ giả trong test), lệch ≤ 1 giây sau 7 phút, kể cả khi tạm dừng (SC-002).
//  - Bộ câu hỏi: phủ đủ 6 chữ PASTOR × 5 vai (SC-003), mỗi câu có bản EN, đúng người hỏi theo chữ, không kèm đáp án (FR-003).
//  - Rút câu tất định theo mã lượt, không lặp, đúng số câu (FR-004).
//  - Trang: chạy trọn một lượt bằng cách tua đồng hồ; 360 px không tràn; VI/EN; không lỗi JS; không gọi mạng ngoài (FR-007).
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const D = require('../lab/pitch-goi-von-data.js'), C = require('../lab/pitch-goi-von-core.js');
const L = D.LUAT;

// 1. Luật khớp kịch bản gốc
assert.deepEqual(D.DOAN.map(d => [d.vai, d.giay]), [['ceo', 30], ['cmo', 90], ['cfo', 90], ['coo', 60], ['sec', 60], ['ceo', 90]]);
assert.equal(D.DOAN.reduce((s, d) => s + d.giay, 0), L.tongGiay, 'tổng 6 đoạn = 7 phút');
assert.equal(L.tongGiay, 420); assert.equal(L.hanPhatGiay, 450); assert.equal(L.diemPhat, 5);
const kichBan = R('js/lop-hoc-data.js');
for (const s of ["['30 giây','👑 CEO'", "['90 giây','📣 CMO'", "['90 giây','💰 CFO'", "['60 giây','🏭 COO'", "['60 giây','📔 SEC'", "['90 giây','👑 CEO'", 'quá giờ 30 giây → trừ ngay 5 điểm']) {
  assert.ok(kichBan.includes(s), 'kịch bản gốc vẫn ghi: ' + s);
}

// 2. Đoạn vai đổi đúng mốc; quá giờ; phạt
const st = (t, som) => C.trangThai(t, som || [], D.DOAN, L);
assert.equal(st(29.9).vai, 'ceo'); assert.equal(st(30).vai, 'cmo');
assert.equal(st(119.9).vai, 'cmo'); assert.equal(st(120).vai, 'cfo', 'CMO hết 90 giây thì sang CFO');
assert.equal(st(210).vai, 'coo'); assert.equal(st(270).vai, 'sec'); assert.equal(st(330).doan, 5);
assert.ok(st(111).baoTruoc && !st(109).baoTruoc, 'báo trước khi còn ≤ 10 giây của đoạn');
assert.ok(!st(420).quaGio && st(420.1).quaGio, 'quá 7 phút là quá giờ');
assert.ok(!st(449.9).phat && st(450).phat && st(450).dung, 'chạm 7:30 thì phạt và dừng');
// Chuyển vai sớm: CEO xong ở giây 20, CMO ở giây 60 → CFO bắt đầu ở 60; phần dư dồn cho CEO chốt
assert.equal(st(61, [20, 60]).vai, 'cfo');
assert.equal(st(61, [20, 60]).conLaiDoan, 89);
const tg = C.thoiGianTungDoan(400, [20, 60], D.DOAN, L);
assert.deepEqual(tg, [20, 40, 90, 60, 60, 130], 'thời gian từng đoạn khi chuyển vai sớm');
assert.equal(st(5, [2, 3]).doan, 2, 'chuyển nhiều lần liên tiếp');
assert.equal(st(1, [100]).doan, 0, 'mốc chuyển sớm chưa tới thì không tính');
assert.deepEqual(C.thoiGianTungDoan(460, [], D.DOAN, L), [30, 90, 90, 60, 60, 120], 'bị phạt: đoạn cuối tính đến 7:30');

// 3. Đồng hồ giờ thật có tạm dừng, lệch ≤ 1 giây sau 7 phút
let gia = 1000; const dh = C.taoDongHo(() => gia);
dh.batDau(); gia += 200000; dh.tamDung(); gia += 999999; dh.batDau(); gia += 220000;
assert.ok(Math.abs(dh.giay() - 420) <= 1, 'đồng hồ lệch ≤ 1 giây: ' + dh.giay());
assert.equal(C.mmss(420), '7:00'); assert.equal(C.mmss(9.1), '0:10'); assert.equal(C.mmss(-12.2), '+0:12');

// 4. Bộ câu hỏi: phủ PASTOR × vai, đủ EN, đúng người hỏi, không đáp án
const CH = D.CAU_HOI;
assert.ok(CH.length >= 36 && CH.length <= 48, 'khoảng 40 câu: ' + CH.length);
assert.equal(new Set(CH.map(c => c.id)).size, CH.length, 'mã câu không trùng');
for (const p of 'PASTOR') for (const v of ['ceo', 'cmo', 'cfo', 'coo', 'sec']) assert.ok(CH.some(c => c.p === p && c.vai === v), 'thiếu ô ' + p + ' × ' + v);
const nguoi = { P: 'tu-phan', R: 'tu-phan', A: 'victor-lam', S: 'victor-lam', T: 'minh-khang', O: 'minh-khang' };
for (const c of CH) {
  assert.equal(c.hoi, nguoi[c.p], c.id + ' sai người hỏi');
  assert.ok(c.vi && c.en && c.vi.trim().endsWith('?') && c.en.trim().endsWith('?'), c.id + ' thiếu bản VI/EN hoặc không phải câu hỏi');
  assert.ok(!/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(c.en), c.id + ' bản EN còn chữ Việt');
  assert.deepEqual(Object.keys(c).sort(), ['en', 'hoi', 'id', 'p', 'vai', 'vi'], c.id + ' có trường lạ (không được kèm đáp án)');
}
const bang = R('specs/010-phong-pitch-goi-von/bo-cau-hoi.md');
for (const c of CH) assert.ok(bang.includes('| ' + c.id + ' |') && bang.includes(c.vi), 'bảng duyệt bo-cau-hoi.md khớp tệp dữ liệu: ' + c.id);
assert.ok(bang.includes(D.PHIEN_BAN), 'bảng duyệt ghi phiên bản bộ câu hỏi');
assert.deepEqual(D.HOI_DONG.map(h => h.id), ['tu-phan', 'victor-lam', 'minh-khang'], 'Hội đồng: thầy Tu Phan, Victor Lâm, Minh Khang');
for (const h of D.HOI_DONG) assert.ok(fs.existsSync(path.join(__dirname, '..', 'lab', h.anh)), 'có ảnh ' + h.anh);

// 5. Rút câu tất định, không lặp, đúng số câu, mỗi thành viên hỏi phần của mình
const rut = (ma, n) => C.rutCauHoi(CH, D.HOI_DONG, ma, n, L);
assert.deepEqual(rut('abc123', 4).map(c => c.id), rut(' ABC123 ', 4).map(c => c.id), 'cùng mã (không phân biệt hoa thường, khoảng trắng) cùng câu');
let khac = 0;
for (let i = 0; i < 30; i++) {
  for (const n of [3, 4, 5]) {
    const r = rut('L' + i, n);
    assert.equal(r.length, n); assert.equal(new Set(r.map(c => c.id)).size, n, 'không lặp câu');
    assert.equal(new Set(r.slice(0, 3).map(c => c.hoi)).size, 3, '3 câu đầu: mỗi thành viên hỏi một câu');
    assert.equal(new Set(r.map(c => c.vai)).size, n, 'mỗi câu hỏi một vai khác nhau');
  }
  if (rut('L' + i, 5).map(c => c.id).join() !== rut('L0', 5).map(c => c.id).join()) khac++;
}
assert.ok(khac >= 25, 'mã khác thì bộ câu thường khác: ' + khac + '/29');
assert.equal(rut('X', 9).length, 5); assert.equal(rut('X', 1).length, 3);

// 6. Trang: không gọi mạng ngoài; liên kết, sw, sitemap
const html = R('lab/pitch-goi-von.html');
for (const f of ['lab/pitch-goi-von.html', 'lab/pitch-goi-von-data.js', 'lab/pitch-goi-von-core.js']) {
  const s = R(f); assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|getUserMedia|MediaRecorder/.test(s), f + ' không gọi mạng, không ghi âm/hình');
}
assert.ok(!/\bAI\b/.test(html.replace(/không dùng AI|no AI/gi, '')), 'không gọi Lumina là AI');
assert.match(html, /<link rel="canonical" href="https:\/\/bizonland\.com\/lab\/pitch-goi-von\.html">/);
assert.match(R('sitemap.xml'), /lab\/pitch-goi-von\.html/);
for (const f of ['pitch-goi-von.html', 'pitch-goi-von-data.js', 'pitch-goi-von-core.js']) assert.ok(R('sw.js').includes("'./lab/" + f + "'"), 'sw.js lưu sẵn ' + f);
assert.ok(R('js/lop-hoc-data.js').includes("'lab/pitch-goi-von.html'") && R('js/lop-hoc-data-en.js').includes("'lab/pitch-goi-von.html'"), 'kịch bản Đại hội Cổ đông (VI/EN) liên kết tới phòng pitch');
const v = +R('sw.js').match(/bizon-v(\d+)/)[1];
assert.ok(v >= 998, 'sw.js phải ≥ bizon-v998, đang ' + v);

(async () => {
  const b = await chromium.launch();
  let fail = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fail++; };
  for (const lang of ['vi', 'en']) {
    const p = await b.newPage({ viewport: { width: 360, height: 760 } });
    const errs = [], ngoai = [];
    p.on('pageerror', e => errs.push(e.message));
    p.on('request', r => { const u = r.url(); if (!u.startsWith(BASE) && !u.startsWith('data:')) ngoai.push(u); });
    await p.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
    await p.goto(BASE + '/lab/pitch-goi-von.html?ma=lop7');
    check(await p.inputValue('#ma-luot') === 'LOP7', lang + ': mã lượt lấy từ ?ma=');
    await p.fill('#ten-doi', 'Đội Sen'); await p.selectOption('#so-cau', '4');
    await p.click('#nut-bat-dau');
    const vai = () => p.textContent('#vai-ten');
    check(/CEO/.test(await vai()), lang + ': bắt đầu bằng CEO');
    await p.evaluate(() => __pitchTest.tua(30.5));
    check(/CMO/.test(await vai()) && /CMO/.test(await p.textContent('#bao')), lang + ': hết 30 giây sang CMO, có báo «đến lượt»');
    await p.evaluate(() => __pitchTest.tua(80));
    check(/0:1\d|0:0\d/.test(await p.textContent('#so-doan')) && (await p.textContent('#bao')).length > 0, lang + ': còn ≤ 10 giây có báo');
    await p.click('#nut-chuyen');
    check(/CFO/.test(await vai()), lang + ': bấm «Xong, chuyển vai» sang CFO');
    // tạm dừng không làm chạy giờ
    await p.click('#nut-dung'); const g0 = (await p.evaluate(() => __pitchTest.trangThai())).giay; await p.waitForTimeout(600);
    const g1 = (await p.evaluate(() => __pitchTest.trangThai())).giay; await p.click('#nut-dung');
    check(Math.abs(g1 - g0) < 0.05, lang + ': tạm dừng thì đồng hồ đứng');
    await p.evaluate(() => __pitchTest.tua(400));
    await p.waitForTimeout(2300);
    const s = await p.evaluate(() => __pitchTest.trangThai());
    check(s.ket && s.ket.phat === true && s.ket.giay === 450, lang + ': quá 7:30 thì bị trừ điểm, dừng ở 7:30');
    check(s.phase === 'hoi-dap' && !(await p.isHidden('#man-hoi-dap')), lang + ': sang phần Hội đồng hỏi');
    check(s.cau.length === 4 && new Set(s.cau).size === 4, lang + ': Hội đồng hỏi đúng 4 câu, không lặp');
    const tvHoi = await p.$$eval('.tv.hoi', a => a.length);
    check(tvHoi === 1, lang + ': đúng một thành viên nổi bật khi hỏi');
    const cau1 = await p.textContent('#cau');
    const c1 = D.CAU_HOI.find(c => c.id === s.cau[0]);
    check(cau1 === c1[lang], lang + ': câu hiển thị đúng ngôn ngữ');
    await p.evaluate(() => __pitchTest.tua(61));
    check((await p.textContent('#bao-cau')).length > 0, lang + ': hết 1 phút có báo');
    for (let i = 0; i < 4; i++) await p.click('#nut-cau-tiep');
    check(!(await p.isHidden('#man-ket-thuc')), lang + ': sang màn kết thúc');
    const tom = await p.textContent('#tom-tat');
    check(/Đội Sen/.test(tom) && /LOP7/.test(tom) && /(trừ 5 điểm|minus 5 points)/.test(tom), lang + ': tóm tắt có tên đội, mã, điểm phạt');
    check(await p.$$eval('#bang-thoi-gian tbody tr', r => r.length) === 6 && await p.$$eval('#ds-cau li', r => r.length) === 4, lang + ': bảng 6 đoạn và 4 câu đã gặp');
    const body = await p.innerText('body');
    if (lang === 'en') check(!/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(body.replace(/Đội Sen|Victor Lâm|Lâm|PASTOR/g, '')), 'en: không còn chữ Việt');
    check(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, lang + ': 360 px không tràn ngang');
    const nho = await p.$$eval('button:not([hidden])', bs => bs.filter(b => b.offsetParent && (b.getBoundingClientRect().height < 44 || b.getBoundingClientRect().width < 44)).map(b => b.id));
    check(nho.length === 0, lang + ': nút ≥ 44 px ' + nho.join(','));
    // tập lại cùng mã thì cùng câu
    await p.click('#nut-lai'); await p.click('#nut-bat-dau'); await p.evaluate(() => __pitchTest.tua(460)); await p.waitForTimeout(2300);
    check(JSON.stringify((await p.evaluate(() => __pitchTest.trangThai())).cau) === JSON.stringify(s.cau), lang + ': tập lại cùng mã thì cùng bộ câu');
    check(errs.length === 0, lang + ': không lỗi JS ' + errs.join(' | '));
    check(ngoai.length === 0, lang + ': không gọi mạng ngoài ' + ngoai.join(' '));
    await p.close();
  }
  // Kết thúc sớm: không bị phạt
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await p.goto(BASE + '/lab/pitch-goi-von.html?lang=vi&ma=K1'); await p.click('#nut-bat-dau');
  await p.evaluate(() => __pitchTest.tua(400)); await p.click('#nut-ket-thuc');
  const s2 = await p.evaluate(() => __pitchTest.trangThai());
  check(s2.ket && s2.ket.phat === false && s2.cau.length === 3, 'kết thúc trước 7:30: không phạt; mặc định 3 câu');
  await b.close();
  if (fail) { console.error(fail + ' kiểm tra hỏng'); process.exit(1); }
  console.log('pitch-goi-von: đạt');
})().catch(e => { console.error(e); process.exit(1); });
