// Đặc tả 012 · PR 4 (Câu chuyện 4): Lumina góp ý sau pitch, theo luật; nhánh nghiên cứu explain_hidden.
//  - Tối đa 3 góp ý dựa trên: con số lệch, câu trả lời quá 1 phút (theo nhóm PASTOR / vai), pitch quá 7 phút. Không đọc nội dung.
//  - Ba câu nên luyện lại cùng nhóm, chưa hỏi, tất định theo mã lượt; nút «Luyện lại ba câu này».
//  - Lệch điểm hòa vốn 12 % và câu tài chính trả lời quá 40 giây → Lumina nêu đúng hai điểm, gợi ý 3 câu nhóm tài chính (CFO).
//  - Nhánh ẩn (cờ lớp explain_hidden; ?explain=hidden để thử): chỉ lời kết chung; CSV cột lumina = hien | an.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const D = require('../lab/pitch-goi-von-data.js'), C = require('../lab/pitch-goi-von-core.js');
const VIET = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;

// 1. Dữ liệu
for (const [k, v] of Object.entries(D.GOP_Y)) assert.ok(v.vi && v.en && !VIET.test(v.en), 'góp ý ' + k + ' đủ VI/EN');
assert.deepEqual(Object.keys(D.GOP_Y).sort(), ['bep', 'cham', 'ln', 'qua-gio', 'tot', 'von']);
assert.ok(D.KET_CHUNG.vi && D.KET_CHUNG.en && !VIET.test(D.KET_CHUNG.en));

// 2. Hàm thuần: tình huống nghiệm thu
const kq = C.kiemBaCon({ bep: 336, gia: 150, bienPhi: 90, dinhPhi: 18 });
assert.deepEqual(kq.map(x => [x.ma, x.ok, Math.round(x.lech * 100)]), [['bep', false, 12]], 'điểm hòa vốn lệch 12 %');
const g = C.gopY({ kq, traLoi: [{ id: 'van-bep', p: 'T', vai: 'cfo', giay: 100 }, { id: 'A-sec-1', p: 'A', vai: 'sec', giay: 30 }], giayPitch: 400 }, D);
assert.deepEqual(g.y.map(x => x.ma), ['bep', 'cham'], 'đúng hai góp ý: lệch hòa vốn, trả lời chậm');
assert.ok(/lệch 12 %/.test(g.y[0].vi) && /336/.test(g.y[0].vi) && /\(300\)/.test(g.y[0].vi) && /12 % off/.test(g.y[0].en), 'góp ý hòa vốn có số thật');
assert.ok(/100 giây/.test(g.y[1].vi) && /quá 40 giây/.test(g.y[1].vi) && /CFO/.test(g.y[1].vi) && /40 seconds over/.test(g.y[1].en), 'góp ý trả lời chậm nêu nhóm và số giây');
assert.deepEqual(g.nhom, { vai: 'cfo' });
const ll = C.luyenLai(D.CAU_HOI, g.nhom, ['van-bep', 'T-cfo-1'], 'K1');
assert.equal(ll.length, 3); assert.ok(ll.every(c => c.vai === 'cfo') && !ll.some(c => c.id === 'T-cfo-1'), 'ba câu nhóm tài chính, chưa hỏi');
assert.deepEqual(C.luyenLai(D.CAU_HOI, g.nhom, ['van-bep'], 'K1').map(c => c.id), C.luyenLai(D.CAU_HOI, g.nhom, ['van-bep'], 'K1').map(c => c.id), 'tất định theo mã lượt');
// Các luật khác
const nhieu = C.gopY({ kq: [{ ma: 'bep', ok: false, khai: 1, tinh: 2, lech: 0.5 }, { ma: 'von', ok: false, khai: 50, tinh: 98, lech: null }, { ma: 'ln', ok: false, khai: 40, tinh: 37.5, lech: null }], traLoi: [{ id: 'x', p: 'A', vai: 'cmo', giay: 90 }], giayPitch: 450 }, D);
assert.equal(nhieu.y.length, 3, 'tối đa 3 góp ý');
assert.ok(/37,5/.test(nhieu.y[2].vi) && /37\.5/.test(nhieu.y[2].en), 'số thập phân đúng kiểu VI/EN');
const cham = C.gopY({ kq: [], traLoi: [{ id: 'A-cmo-1', p: 'A', vai: 'cmo', giay: 75 }, { id: 'P-ceo-1', p: 'P', vai: 'ceo', giay: 95 }], giayPitch: 430 }, D);
assert.deepEqual(cham.y.map(x => x.ma), ['cham', 'qua-gio'], 'trả lời chậm + pitch quá giờ');
assert.deepEqual(cham.nhom, { p: 'P' }, 'câu chậm nhất không phải tài chính: luyện cùng chữ PASTOR');
assert.ok(C.luyenLai(D.CAU_HOI, cham.nhom, ['P-ceo-1'], 'Z').every(c => c.p === 'P'));
assert.ok(/quá 10 giây so với 7 phút/.test(cham.y[1].vi));
const tot = C.gopY({ kq: [{ ma: 'bep', ok: true }], traLoi: [{ id: 'a', p: 'O', vai: 'cfo', giay: 50 }], giayPitch: 410 }, D);
assert.deepEqual(tot.y.map(x => x.ma), ['tot'], 'không có gì lệch: một lời khen kèm việc nên thử'); assert.equal(tot.nhom, null);
assert.equal(C.luyenLai(D.CAU_HOI, null, [], 'Q').length, 3);
// CSV
const csv = C.taoCsv([{ thoiDiem: 'x', doi: '=Đội', ma: 'K', giay: 1, tungDoan: [], cau: [], diem: [1, 1, 1, 1], so: {}, traLoi: [{ id: 'van-bep', giay: 100.4 }, { id: 'A-sec-1', giay: 30 }], lumina: 'an' }]);
const [dau, dong] = csv.slice(1).trim().split('\r\n');
assert.ok(dau.endsWith(',giay_tra_loi,lumina') && dong.endsWith(',van-bep:100;A-sec-1:30,an'), 'CSV có giây trả lời và nhánh Lumina');
assert.ok(dong.includes(",'=Đội,"), 'CSV chặn công thức ở tên đội');
const vSw = +R('sw.js').match(/bizon-v(\d+)/)[1];
assert.ok(vSw >= 1013, 'sw.js phải ≥ bizon-v1013, đang ' + vSw);
assert.ok(R('lab/pitch-goi-von.html').includes('../js/explain-mode.js'), 'trang đọc cờ lớp qua explain-mode.js');
assert.ok(/nhánh Lumina|explain_hidden/.test(R('docs/huong-dan-giang-vien.md')), 'hướng dẫn giảng viên nói về nhánh Lumina');

const SO = { 'so-bep': 336, 'so-gia': 150, 'so-bienPhi': 90, 'so-dinhPhi': 18 };
(async () => {
  const b = await chromium.launch();
  let fail = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fail++; };
  const errs = [], ngoai = [];
  const luot = async (qs, lang) => {
    const ctx = await b.newContext({ viewport: { width: 360, height: 760 }, acceptDownloads: true });
    await ctx.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang || 'vi');
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    p.on('request', q => { const u = q.url(); if (!u.startsWith(BASE) && !u.startsWith('data:') && !u.startsWith('blob:')) ngoai.push(u); });
    await p.goto(BASE + '/lab/pitch-goi-von.html?ma=LU1&3d=0' + (qs || ''));
    await p.fill('#ten-doi', 'Đội Sen');
    await p.click('#so-truoc summary'); for (const [id, v] of Object.entries(SO)) await p.fill('#' + id, String(v));
    await p.click('#nut-bat-dau'); await p.evaluate(() => __pitchTest.tua(400)); await p.click('#nut-ket-thuc');
    await p.waitForFunction(() => __pitchTest.trangThai().phase === 'hoi-dap');
    await p.evaluate(() => __pitchTest.tua(100)); await p.click('#nut-cau-tiep');   // câu vặn tài chính: 100 giây
    await p.click('#nut-cau-tiep'); await p.click('#nut-cau-tiep');
    await p.click('#nut-tong-ket');
    return { ctx, p };
  };
  // A. Nhánh hiện
  {
    const { ctx, p } = await luot();
    check(await p.isVisible('#the-lumina-gop-y') && await p.getAttribute('#the-lumina-gop-y', 'data-nhanh') === 'hien', 'màn tổng kết có khối Lumina góp ý (nhánh hiện)');
    const y = await p.$$eval('#gop-y li', l => l.map(x => [x.dataset.ma, x.textContent]));
    check(y.length === 2 && y[0][0] === 'bep' && /lệch 12 %/.test(y[0][1]) && y[1][0] === 'cham' && /quá 40 giây/.test(y[1][1]), 'Lumina nêu đúng hai điểm: lệch hòa vốn 12 %, câu tài chính quá 40 giây');
    const luyen = await p.$$eval('#cau-luyen li', l => l.map(x => x.textContent));
    check(luyen.length === 3 && luyen.every(t => /CFO\]/.test(t)), 'gợi ý 3 câu nhóm tài chính');
    const ids = (await p.evaluate(() => __pitchTest.gopY())).luyen;
    await p.click('#nut-luyen-lai');
    const st = await p.evaluate(() => __pitchTest.trangThai());
    check(st.phase === 'hoi-dap' && JSON.stringify(st.cau) === JSON.stringify(ids), '«Luyện lại ba câu này» mở phần hỏi đáp với đúng ba câu');
    for (let i = 0; i < 3; i++) await p.click('#nut-cau-tiep');
    check(!(await p.isHidden('#man-ket-thuc')) && (await p.$$eval('#ds-cau li', l => l.length)) === 3 && /van-bep/.test(JSON.stringify((await p.evaluate(() => __pitchTest.trangThai())).cau)), 'luyện xong quay về tổng kết, danh sách câu của lượt giữ nguyên');
    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#nut-csv')]);
    const noi = fs.readFileSync(await dl.path(), 'utf8');
    check(/,giay_tra_loi,lumina\r\n/.test(noi) && /van-bep:100;[^,]*,hien\r\n/.test(noi), 'CSV ghi giây trả lời và lumina=hien');
    check(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, '360 px không tràn ngang');
    await ctx.close();
  }
  // B. Nhánh ẩn
  {
    const { ctx, p } = await luot('&explain=hidden');
    check(await p.getAttribute('#the-lumina-gop-y', 'data-nhanh') === 'an', 'nhánh ẩn: khối Lumina ghi nhánh an');
    check(await p.isHidden('#gop-y') && await p.isHidden('#khoi-luyen') && /Cảm ơn đội đã pitch/.test(await p.textContent('#ket-chung')), 'nhánh ẩn: chỉ lời kết chung, không góp ý cụ thể, không gợi ý luyện');
    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#nut-csv')]);
    check(/,an\r\n$/.test(fs.readFileSync(await dl.path(), 'utf8')), 'CSV ghi lumina=an');
    await ctx.close();
  }
  // C. EN
  {
    const { ctx, p } = await luot('', 'en');
    const t = await p.innerText('#the-lumina-gop-y');
    check(/12 % off/.test(t) && /40 seconds over/.test(t) && !VIET.test(t), 'EN: góp ý không còn chữ Việt');
    await ctx.close();
  }
  check(errs.length === 0, 'không lỗi JS ' + errs.join(' | '));
  check(ngoai.length === 0, 'không gọi mạng ngoài ' + ngoai.join(' '));
  await b.close();
  if (fail) { console.error(fail + ' kiểm tra hỏng'); process.exit(1); }
  console.log('pitch-lumina-gop-y: đạt');
})().catch(e => { console.error(e); process.exit(1); });
