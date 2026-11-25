// Đặc tả 010 · PR 2 (Câu chuyện 2): tự chấm, kiểm ba con số, bảng tổng kết, lưu trên máy, xuất CSV.
//  - Điểm: 4 tiêu chí × 2,5 (khả thi tài chính · độc đáo · đội ngũ · trình bày) = 10; phạt 5 điểm thang 100 = 0,5 thang 10 (FR-005).
//    Nghiệm thu: 2 / 2,5 / 2 / 1,5 và bị phạt → 75/100 = 7,5/10.
//  - Ba con số (FR-006): chỉ báo lệch kèm công thức, không đề xuất số thay. Kiểm: BEP khai so với F ÷ (giá − biến phí);
//    lợi nhuận mục tiêu so với (sản lượng dự kiến − BEP) × biên đóng góp; vốn xin so với đầu tư ban đầu + M × F ÷ 2.
//  - Lưu trong trình duyệt, so với lượt trước của cùng đội; CSV một dòng mỗi lượt, có BOM cho Excel (FR-008).
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const D = require('../lab/pitch-goi-von-data.js'), C = require('../lab/pitch-goi-von-core.js');

// 1. Điểm
assert.deepEqual(D.TIEU_CHI.map(t => t.id), ['kha-thi', 'doc-dao', 'doi-ngu', 'trinh-bay']);
assert.ok(D.TIEU_CHI.every(t => t.toiDa === 2.5 && t.vi && t.en));
let d = C.tinhDiem([2, 2.5, 2, 1.5], true, D.LUAT);
assert.deepEqual([d.tuCham, d.tong100, d.tong10], [8, 75, 7.5], 'nghiệm thu: 8/10, phạt → 75/100 = 7,5/10');
d = C.tinhDiem([2.5, 2.5, 2.5, 2.5], false, D.LUAT); assert.deepEqual([d.tong100, d.tong10], [100, 10]);
d = C.tinhDiem([0, 0, 0, 0], true, D.LUAT); assert.equal(d.tong100, 0, 'không âm');
d = C.tinhDiem([3, -1, 'x', 1.26], false, D.LUAT); assert.deepEqual(d.diem, [2.5, 0, 0, 1.5], 'kẹp 0–2,5, làm tròn 0,5');

// 2. Ba con số
const so = { vonXin: 200, bep: 400, lnMucTieu: 30, gia: 150, bienPhi: 90, dinhPhi: 24, sanLuong: 800, dauTu: 120, thangHoaVon: 4 };
let k = C.kiemBaCon(so);
const by = id => k.find(x => x.ma === id);
assert.equal(by('bep').ok, true, 'BEP 24 000 ÷ 60 = 400 sp: khớp'); assert.equal(by('bep').tinh, 400);
assert.equal(by('ln').tinh, 24); assert.equal(by('ln').ok, false, 'mục tiêu 30 triệu > tối đa 24 triệu: báo lệch');
assert.equal(by('von').tinh, 168, 'cần 120 + 4 × 24 ÷ 2 = 168 triệu'); assert.equal(by('von').ok, true, 'xin 200 ≥ 168');
k = C.kiemBaCon({ ...so, vonXin: 150, bep: 300 });
assert.equal(k.find(x => x.ma === 'von').ok, false, 'nghiệm thu: vốn xin nhỏ hơn số cần đến hòa vốn → báo lệch');
assert.equal(k.find(x => x.ma === 'bep').ok, false, 'BEP khai 300 lệch 25 % so với 400');
assert.ok(Math.abs(k.find(x => x.ma === 'bep').lech - (-0.25)) < 1e-9);
assert.equal(C.kiemBaCon({ ...so, bep: 380 }).find(x => x.ma === 'bep').ok, true, 'lệch 5 % vẫn chấp nhận (ngưỡng 10 %)');
assert.equal(C.kiemBaCon({ ...so, bienPhi: 160 }).find(x => x.ma === 'bep').ok, false, 'giá ≤ biến phí: báo, không chia');
assert.ok(!C.kiemBaCon({ ...so, bienPhi: 160 }).find(x => x.ma === 'bep').tinh, 'không tính BEP khi biên đóng góp ≤ 0');
assert.deepEqual(C.kiemBaCon({ vonXin: 100, bep: 10, lnMucTieu: 5 }).map(x => x.ma), [], 'thiếu số phụ thì không kiểm, không báo bừa');
for (const x of C.kiemBaCon(so)) assert.deepEqual(Object.keys(x).sort(), ['khai', 'lech', 'ma', 'ok', 'tinh'], 'chỉ có số tính và số khai, không có «số đề xuất»');

// 3. CSV
const luot = { thoiDiem: '2026-11-25T10:00:00.000Z', doi: 'Đội "Sen", A', nganh: 'nong-san', ma: 'LOP7', giay: 450, phat: true, tungDoan: [30, 90, 90, 60, 60, 120], cau: ['P-ceo-1', 'T-cfo-1'], diem: [2, 2.5, 2, 1.5], tong100: 75, tong10: 7.5, so, soLech: 1, phienBan: 'pq-v1' };
const csv = C.taoCsv([luot]);
assert.ok(csv.startsWith('﻿'), 'có BOM cho Excel');
const dong = csv.slice(1).trim().split('\r\n');
assert.equal(dong.length, 2);
assert.equal(dong[0], C.COT_CSV.join(','));
assert.ok(dong[1].includes('"Đội ""Sen"", A"'), 'thoát dấu nháy và dấu phẩy');
assert.ok(dong[1].includes('P-ceo-1;T-cfo-1'), 'câu hỏi nối bằng ;');
assert.equal(dong[1].split(',').length >= C.COT_CSV.length, true);
assert.ok(C.COT_CSV.includes('diem_100') && C.COT_CSV.includes('von_xin') && C.COT_CSV.includes('so_canh_bao'));

// 4. Không gửi mạng; tasks
const html = R('lab/pitch-goi-von.html');
assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon/.test(html + R('lab/pitch-goi-von-core.js')));
assert.match(html, /bizon-pitch-v1/, 'khóa lưu trên máy');
assert.match(R('specs/010-phong-pitch-goi-von/tasks.md'), /- \[X\] T006[\s\S]*- \[X\] T007/);
const v = +R('sw.js').match(/bizon-v(\d+)/)[1];
assert.ok(v >= 999, 'sw.js phải ≥ bizon-v999, đang ' + v);

(async () => {
  const b = await chromium.launch();
  let fail = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fail++; };
  for (const lang of ['vi', 'en']) {
    const ctx = await b.newContext({ viewport: { width: 360, height: 760 }, acceptDownloads: true });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
    await p.goto(BASE + '/lab/pitch-goi-von.html?ma=K7');
    const luot1 = async (diem, von) => {
      await p.fill('#ten-doi', 'Đội Sen'); await p.click('#nut-bat-dau');
      await p.evaluate(() => __pitchTest.tua(460)); await p.waitForTimeout(2300);
      for (let i = 0; i < 3; i++) await p.click('#nut-cau-tiep');
      check(!(await p.isHidden('#man-tu-cham')), lang + ': sau hỏi đáp sang màn tự chấm');
      for (let i = 0; i < 4; i++) await p.selectOption('#diem-' + i, String(diem[i]));
      const tien = { 'so-vonXin': von, 'so-bep': 300, 'so-lnMucTieu': 30, 'so-gia': 150, 'so-bienPhi': 90, 'so-dinhPhi': 24, 'so-sanLuong': 800, 'so-dauTu': 120, 'so-thangHoaVon': 4 };
      for (const [id, val] of Object.entries(tien)) await p.fill('#' + id, String(val));
      await p.click('#nut-kiem');
      return p.innerText('#ket-qua-kiem');
    };
    const kq = await luot1([2, 2.5, 2, 1.5], 150);
    check((kq.match(/⚠/g) || []).length === 3, lang + ': báo đúng 3 chỗ lệch (BEP, lợi nhuận, vốn) ' + JSON.stringify(kq));
    check(/÷/.test(kq) && /×/.test(kq), lang + ': lời báo kèm công thức');
    check(await p.inputValue('#so-vonXin') === '150', lang + ': không tự sửa số của đội');
    await p.click('#nut-tong-ket');
    check(!(await p.isHidden('#man-ket-thuc')), lang + ': sang bảng tổng kết');
    const tk = await p.innerText('#man-ket-thuc');
    check(/75\s*\/\s*100/.test(tk) && /7[,.]5\s*\/\s*10/.test(tk), lang + ': tổng 75/100 = 7,5/10 ' + tk.slice(0, 200));
    check(await p.$$eval('#bang-diem tbody tr', r => r.length) === 4, lang + ': bảng 4 tiêu chí');
    // lượt 2: so với lượt 1
    await p.click('#nut-lai'); await p.fill('#ma-luot', 'K7');
    await luot1([2.5, 2.5, 2.5, 2], 200);
    await p.click('#nut-tong-ket');
    const so2 = await p.innerText('#so-sanh');
    check(/75/.test(so2) && /90/.test(so2), lang + ': so với lượt trước (75 → 90) ' + so2);
    const luu = await p.evaluate(() => JSON.parse(localStorage.getItem('bizon-pitch-v1')));
    check(Array.isArray(luu) && luu.length === 2 && luu[1].tong100 === 90, lang + ': lưu 2 lượt trong trình duyệt');
    const [tai] = await Promise.all([p.waitForEvent('download'), p.click('#nut-csv')]);
    const noi = fs.readFileSync(await tai.path(), 'utf8');
    check(tai.suggestedFilename().endsWith('.csv') && noi.trim().split('\r\n').length === 3, lang + ': CSV có tiêu đề + 2 lượt');
    check(await p.isVisible('#nut-in'), lang + ': có nút in');
    check(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, lang + ': 360 px không tràn ngang');
    if (lang === 'en') check(!/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test((await p.innerText('body')).replace(/Đội Sen|Victor Lâm|Lâm/g, '')), 'en: không còn chữ Việt');
    p.on('dialog', dl => dl.accept());
    await p.click('#nut-xoa-luu');
    check(await p.evaluate(() => localStorage.getItem('bizon-pitch-v1')) === null, lang + ': xóa được kết quả đã lưu trên máy');
    check(errs.length === 0, lang + ': không lỗi JS ' + errs.join(' | '));
    await ctx.close();
  }
  await b.close();
  if (fail) { console.error(fail + ' kiểm tra hỏng'); process.exit(1); }
  console.log('pitch-goi-von-p2: đạt');
})().catch(e => { console.error(e); process.exit(1); });
