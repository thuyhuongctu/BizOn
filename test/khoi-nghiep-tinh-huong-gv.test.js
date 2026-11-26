// Đặc tả 011 · PR 3 (Câu chuyện 3): ghi chú giảng viên và gộp CSV của lớp.
//  - Hàm thuần: đọc CSV do taoCsv xuất (BOM, CRLF, nháy kép, dấu ' chặn công thức); gộp 3 tệp mẫu ra bảng phân bố đúng;
//    tệp sai cột báo lỗi; một đội nộp hai lần thì giữ lần mới nhất; dòng khác phiên bản không đếm.
//  - Ghi chú giảng viên: mỗi bộ có mục tiêu, thời lượng; mỗi tình huống có điều thường gặp và câu hỏi thảo luận; bộ
//    «Ra thị trường» có lưu ý đợt đo; hướng dẫn giảng viên có mục mới.
//  - Trang ?gv=1: nạp nhiều tệp trên máy, bảng đếm đúng, không gọi mạng ngoài, 360 px, VI/EN, không lỗi JS.
'use strict';
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const ROOT = path.join(__dirname, '..'), R = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const D = require('../lab/khoi-nghiep-tinh-huong-data.js'), C = require('../lab/khoi-nghiep-tinh-huong-core.js');
const VIET = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;

// 1. Ba tệp mẫu: đội A, B chọn bộ 1; đội C chọn bộ 2; đội A nộp lại kd1 muộn hơn với phương án khác
const kd = D.BO.find(b => b.id === 'kiem-dinh'), rt = D.BO.find(b => b.id === 'ra-thi-truong');
const lam = (bo, chonPa, doi, gio, lyDo) => { let c = {}; bo.tinhHuong.forEach((t, i) => { c = C.ghiChon(c, t, chonPa[i], lyDo || ('Lý do, có "nháy" số ' + i), 10, '2026-11-26T0' + gio + ':0' + i + ':00.000Z'); }); return C.taoCsv(bo, c, D.PHIEN_BAN, doi); };
const tepA = lam(kd, ['a', 'b', 'c', 'd'], 'Đội A', 1, '=HYPERLINK("http://x.y","Bấm") lý do đủ dài');
const tepB = lam(kd, ['b', 'b', 'c', 'a'], 'Đội B', 1);
const tepC = lam(rt, ['b', 'b', 'c', 'a'], 'Đội C', 1);
const tepA2 = lam(kd, ['c', 'b', 'c', 'd'], 'đội a', 2); // nộp lại, tên khác hoa thường
const r = C.docCsv(tepA);
assert.equal(r.length, 4); assert.equal(r[0].doi, 'Đội A'); assert.equal(r[0].ly_do, '=HYPERLINK("http://x.y","Bấm") lý do đủ dài', 'bỏ dấu \' chặn công thức khi đọc lại, giữ nháy kép');
assert.throws(() => C.docCsv('a,b\n1,2'), /Thiếu cột/); assert.throws(() => C.docCsv(''), /Tệp trống/);
const g = C.gopCsv([{ ten: 'a.csv', noiDung: tepA }, { ten: 'b.csv', noiDung: tepB }, { ten: 'c.csv', noiDung: tepC }, { ten: 'a2.csv', noiDung: tepA2 }, { ten: 'sai.csv', noiDung: 'x,y\n1,2' }]);
assert.equal(g.loi.length, 1); assert.equal(g.loi[0].tep, 'sai.csv');
assert.equal(g.trung, 4, 'đội A nộp lại 4 dòng'); assert.equal(g.dong.length, 12, '3 đội × 4 tình huống');
const pb = C.phanBo(D, g.dong), dem = (bo, th) => Object.fromEntries(pb.find(x => x.bo === bo).tinhHuong.find(x => x.id === th).pa.map(p => [p.id, p.n]));
assert.deepEqual(dem('kiem-dinh', 'kd1'), { a: 0, b: 1, c: 1, d: 0 }, 'kd1: lần nộp mới của đội A (c) thay lần cũ (a)');
assert.deepEqual(dem('kiem-dinh', 'kd2'), { a: 0, b: 2, c: 0, d: 0 });
assert.deepEqual(dem('kiem-dinh', 'kd4'), { a: 1, b: 0, c: 0, d: 1 });
assert.deepEqual(dem('ra-thi-truong', 'rt3'), { a: 0, b: 0, c: 1, d: 0 });
const kd2 = pb[0].tinhHuong[1]; assert.equal(kd2.tong, 2); assert.equal(kd2.pa.find(p => p.id === 'b').tiLe, 100);
// dòng khác phiên bản hoặc mã lạ: không đếm, báo riêng
const cu = tepB.replace(/kn-v1/g, 'kn-v0');
const pb2 = C.phanBo(D, C.gopCsv([{ ten: 'cu.csv', noiDung: cu }]).dong);
assert.equal(pb2[0].tinhHuong[0].tong, 0); assert.equal(pb2[0].tinhHuong[0].khac, 1);
// tệp không có tên đội vẫn được đếm, không gộp trùng
assert.equal(C.gopCsv([{ ten: '1', noiDung: lam(kd, ['a', 'a', 'a', 'a'], '', 1) }, { ten: '2', noiDung: lam(kd, ['a', 'a', 'a', 'a'], '', 1) }]).dong.length, 8);

// 2. Ghi chú giảng viên đủ, đủ hai thứ tiếng; hướng dẫn giảng viên có mục mới
const enSach = s => !VIET.test(String(s).replace(/Ninh Kiều|Cần Thơ/g, ''));
for (const b of D.BO) {
  const gv = D.GV[b.id]; assert.ok(gv, 'có ghi chú giảng viên cho ' + b.id);
  for (const k of ['mucTieu', 'thoiLuong']) assert.ok(gv[k].vi && gv[k].en && enSach(gv[k].en), b.id + ' thiếu ' + k);
  for (const t of b.tinhHuong) {
    const x = gv.tinhHuong[t.id]; assert.ok(x, b.id + ' thiếu ghi chú tình huống ' + t.id);
    assert.ok(x.hayChon.vi && x.hayChon.en && enSach(x.hayChon.en), t.id + ' thiếu «thường gặp»');
    assert.ok(x.cauHoi.length >= 2 && x.cauHoi.every(q => q.vi && q.en && enSach(q.en)), t.id + ' cần ≥ 2 câu hỏi thảo luận');
  }
}
assert.match(D.GV['ra-thi-truong'].luuYDoDo.vi, /ct-v1/); assert.match(D.GV['ra-thi-truong'].luuYDoDo.vi, /nhật ký lớp/);
const hd = R('docs/huong-dan-giang-vien.md');
assert.match(hd, /khoi-nghiep-tinh-huong\.html\?gv=1/); assert.match(hd, /nhật ký lớp/); assert.match(hd, /ct-v1/);
assert.match(R('specs/011-tinh-huong-khoi-nghiep/tasks.md'), /- \[X\] T009[\s\S]*- \[X\] T010/);
const v = +R('sw.js').match(/bizon-v(\d+)/)[1]; assert.ok(v >= 1006, 'sw.js phải ≥ bizon-v1006, đang ' + v);

// 3. Trang ?gv=1
(async () => {
  const thu = fs.mkdtempSync(path.join(os.tmpdir(), 'kn-gv-'));
  const tep = [['doi-a.csv', tepA], ['doi-b.csv', tepB], ['doi-c.csv', tepC], ['doi-a-lan-2.csv', tepA2], ['sai.csv', 'x,y\n1,2']].map(([n, s]) => { const f = path.join(thu, n); fs.writeFileSync(f, s); return f; });
  const b = await chromium.launch(); let fail = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fail++; };
  for (const lang of ['vi', 'en']) {
    const ctx = await b.newContext({ viewport: { width: 360, height: 760 } }); const p = await ctx.newPage(); const errs = [], ngoai = [];
    p.on('pageerror', e => errs.push(e.message));
    p.on('request', q => { const u = q.url(); if (!u.startsWith(BASE) && !u.startsWith('data:') && !u.startsWith('blob:')) ngoai.push(u); });
    await p.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
    await p.goto(BASE + '/lab/khoi-nghiep-tinh-huong.html?gv=1');
    check(!(await p.isHidden('#man-gv')) && await p.isHidden('#man-bo'), lang + ': ?gv=1 mở màn giảng viên');
    check(await p.$$eval('#gv-bo .gv-th', l => l.length) === 8, lang + ': đủ 8 tình huống, mỗi tình huống có bảng');
    check(await p.$$eval('#gv-bo .gv-so', l => l.every(x => x.textContent === '0')), lang + ': chưa nạp tệp thì mọi ô bằng 0');
    check((await p.textContent('#gv-bo')).includes(lang === 'en' ? 'Discussion questions' : 'Câu hỏi thảo luận'), lang + ': có câu hỏi thảo luận');
    check(await p.$$eval('.gv-luu-y', l => l.length) === 1, lang + ': có lưu ý đợt đo cho bộ «Ra thị trường»');
    await p.setInputFiles('#gv-tep', tep);
    await p.waitForFunction(() => window.__knTest.trangThai().gv);
    const st = await p.evaluate(() => window.__knTest.trangThai().gv);
    check(st.dong === 12 && st.trung === 4 && st.loi === 1, lang + ': gộp 12 lựa chọn, 4 trùng, 1 tệp lỗi ' + JSON.stringify(st));
    const so = (th, pa) => p.$eval(`.gv-th[data-th="${th}"] tr[data-pa="${pa}"] .gv-so`, x => x.textContent);
    check(await so('kd1', 'c') === '1' && await so('kd1', 'a') === '0' && await so('kd2', 'b') === '2' && await so('rt3', 'c') === '1', lang + ': bảng đếm đúng theo tình huống');
    check((await p.textContent('#gv-loi')).includes('sai.csv'), lang + ': báo tệp sai cột');
    check(/12/.test(await p.textContent('#gv-tom-tat')), lang + ': dòng tóm tắt có số lựa chọn');
    check(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, lang + ': 360 px không tràn ngang');
    const nut = await p.$eval('.gv-nap', e => e.getBoundingClientRect().height);
    check(nut >= 44, lang + ': nút chọn tệp ≥ 44 px');
    if (lang === 'en') check(!VIET.test((await p.innerText('#man-gv')).replace(/Ninh Kiều|Cần Thơ|đồng|\d[\d,.]* đ/g, '')), 'en: màn giảng viên không còn chữ Việt');
    check(errs.length === 0, lang + ': không lỗi JS ' + errs.join(' | '));
    check(ngoai.length === 0, lang + ': không gọi mạng ngoài ' + ngoai.join(' '));
    await ctx.close();
  }
  await b.close(); fs.rmSync(thu, { recursive: true, force: true });
  if (fail) { console.error(fail + ' kiểm tra hỏng'); process.exit(1); }
  console.log('khoi-nghiep-tinh-huong-gv: đạt');
})().catch(e => { console.error(e); process.exit(1); });
