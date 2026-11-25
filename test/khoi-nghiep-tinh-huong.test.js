// Đặc tả 011 · PR 1 (Câu chuyện 1): bộ «Kiểm định ý tưởng» – tình huống giả định, không chấm điểm, không AI.
//  - Dữ liệu: 4 tình huống, mỗi tình huống 3–4 phương án, mỗi phương án đủ hệ quả, «Vì sao?», câu hỏi phản biện VI/EN và nhãn logic.
//  - Không trùng bề mặt câu chuyện với bộ đo trước – sau ct-v1 (js/case-task-data.js); không sửa tệp đó.
//  - Lý do bắt buộc ≥ 10 ký tự trước khi xem hệ quả; tổng kết, CSV; giữ tiến độ khi tải lại; trích dẫn kiểm được.
//  - Trang: 360 px, VI/EN, không lỗi JS, không gọi mạng ngoài, ghi rõ «giả định», không hiện điểm hay «đáp án đúng».
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), { execFileSync } = require('node:child_process');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const ROOT = path.join(__dirname, '..'), R = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const D = require('../lab/khoi-nghiep-tinh-huong-data.js'), C = require('../lab/khoi-nghiep-tinh-huong-core.js');
const VIET = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;
// Tên riêng và đơn vị tiền được giữ nguyên tiếng Việt trong bản EN
const enSach = s => !VIET.test(String(s).replace(/Ninh Kiều|Cần Thơ|Rổ Rau Xanh|đồng|\d[\d,.]* đ(?!\p{L})/gu, ''));

// 1. Dữ liệu đủ trường, đủ hai thứ tiếng
const bo = D.BO.find(b => b.id === 'kiem-dinh');
assert.ok(bo, 'có bộ «Kiểm định ý tưởng»');
assert.equal(bo.tinhHuong.length, 4);
const ids = new Set();
for (const th of bo.tinhHuong) {
  assert.ok(!ids.has(th.id), 'mã tình huống trùng ' + th.id); ids.add(th.id);
  for (const k of ['tieuDe', 'boiCanh', 'cauHoi']) assert.ok(th[k].vi && th[k].en && enSach(th[k].en), th.id + ' thiếu ' + k + ' hoặc bản EN còn chữ Việt: ' + th[k].en);
  assert.ok(th.phuongAn.length >= 3 && th.phuongAn.length <= 4, th.id + ' cần 3–4 phương án');
  assert.equal(new Set(th.phuongAn.map(p => p.logic)).size, th.phuongAn.length, th.id + ' nhãn logic không trùng');
  for (const p of th.phuongAn) for (const k of ['nhan', 'heQua', 'viSao', 'phanBien']) {
    assert.ok(p[k] && p[k].vi.trim() && p[k].en.trim(), th.id + p.id + ' thiếu ' + k);
    assert.ok(enSach(p[k].en), th.id + p.id + ' bản EN của ' + k + ' còn chữ Việt: ' + p[k].en);
  }
  for (const p of th.phuongAn) assert.ok(!/đáp án đúng|correct answer|điểm số|\bscore\b/i.test(p.nhan.vi + p.nhan.en), 'không gắn đáp án hay điểm vào phương án');
  (th.nguon || []).forEach(k => assert.ok(D.NGUON[k], th.id + ' trích nguồn không có: ' + k));
}
assert.equal(D.LUAT.lyDoToiThieu, 10);

// 2. Không trùng bề mặt ct-v1; không sửa tệp bộ đo
const ct = R('js/case-task-data.js');
const tieuDeCt = [...ct.matchAll(/title: '([^']+)'/g)].map(m => m[1].toLowerCase());
const chuKn = JSON.stringify(D).toLowerCase();
for (const tu of ['cá tra', 'pangasius', 'gốm', 'ceramic', 'móc khóa', 'keychain', 'mứt', 'bưởi', 'pomelo', 'bánh phồng', 'cracker', 'kho lạnh', 'cold store', 'nhà hàng nhật', 'siêu thị hàn', 'korean supermarket', 'thị trường x', 'market x', 'đại lý độc quyền'])
  assert.ok(!chuKn.includes(tu), 'trùng bề mặt câu chuyện ct-v1: ' + tu);
for (const th of bo.tinhHuong) assert.ok(!tieuDeCt.includes(th.tieuDe.vi.toLowerCase()) && !tieuDeCt.includes(th.tieuDe.en.toLowerCase()), 'trùng tiêu đề ct-v1');
try { execFileSync('git', ['diff', '--quiet', 'origin/main', '--', 'js/case-task-data.js'], { cwd: ROOT, stdio: 'ignore' }); }
catch (e) { if (e.status === 1) assert.fail('js/case-task-data.js (ct-v1) bị sửa'); }

// 3. Hàm thuần
assert.ok(!C.lyDoHopLe('  ngắn  ', 10) && C.lyDoHopLe('Vì khách chưa trả tiền', 10) && !C.lyDoHopLe('a    b     c', 10));
const th1 = bo.tinhHuong[0];
assert.throws(() => C.ghiChon({}, th1, 'b', 'ngắn', 10), /Lý do/);
assert.throws(() => C.ghiChon({}, th1, 'z', 'lý do đủ dài đây', 10), /Phương án/);
let chon = C.ghiChon({}, th1, 'b', '  Cần   biết khách là ai trước  ', 10, '2026-11-25T10:00:00.000Z');
assert.equal(chon.kd1.lyDo, 'Cần biết khách là ai trước', 'gộp khoảng trắng');
assert.deepEqual(C.tienDo(bo, chon), { xong: 1, tong: 4, tiep: 1 });
bo.tinhHuong.slice(1).forEach((t, i) => { chon = C.ghiChon(chon, t, t.phuongAn[i % t.phuongAn.length].id, 'Lý do "thử", có dấu phẩy', 10, '2026-11-25T10:0' + (i + 1) + ':00.000Z'); });
assert.equal(C.tienDo(bo, chon).tiep, -1);
const csv = C.taoCsv(bo, chon, D.PHIEN_BAN, 'Đội A');
assert.ok(csv.startsWith('﻿'));
const dong = csv.slice(1).trim().split('\r\n');
assert.equal(dong[0], C.COT_CSV.join(',')); assert.equal(dong.length, 5);
assert.ok(dong[2].includes('"Lý do ""thử"", có dấu phẩy"'), 'thoát dấu nháy, dấu phẩy');
assert.ok(dong[1].startsWith('kiem-dinh,kn-v1,kd1,b,hypothesis,'));
assert.ok(!C.COT_CSV.some(c => /^(diem|score)/i.test(c)), 'CSV không có cột điểm');

// 4. Trích dẫn: mọi «Vì sao?» khớp danh mục nguồn, DOI đúng dạng (kiểm ngoại tuyến)
(async () => {
  const kt = await import(path.join(ROOT, 'scripts/research/kiem-trich-dan.mjs'));
  for (const l of ['vi', 'en']) {
    const k = kt.kiemNgoaiTuyen(C.vanBanTrichDan(D, l));
    assert.deepEqual(k.loi, [], 'trích dẫn (' + l + '): ' + k.loi.join(' | '));
    assert.equal(k.muc.length, Object.keys(D.NGUON).length, 'mọi nguồn đều được trích');
  }

  // 5. Trang, thư viện, sw, sitemap
  const html = R('lab/khoi-nghiep-tinh-huong.html');
  assert.match(html, /<link rel="canonical" href="https:\/\/bizonland\.com\/lab\/khoi-nghiep-tinh-huong\.html">/);
  assert.match(html, /js\/thong-ke\.js/);
  for (const f of ['lab/khoi-nghiep-tinh-huong.html', 'lab/khoi-nghiep-tinh-huong-data.js', 'lab/khoi-nghiep-tinh-huong-core.js'])
    assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon|WebSocket/.test(R(f)), f + ' không gọi mạng');
  assert.ok(!/\bAI\b/.test(html.replace(/không dùng AI|uses no AI/gi, '')), 'không có AI');
  for (const f of ['khoi-nghiep-tinh-huong.html', 'khoi-nghiep-tinh-huong-data.js', 'khoi-nghiep-tinh-huong-core.js']) assert.ok(R('sw.js').includes("'./lab/" + f + "'"), 'sw.js lưu sẵn ' + f);
  assert.match(R('sitemap.xml'), /lab\/khoi-nghiep-tinh-huong\.html/);
  assert.match(R('js/cham-library.js'), /href: 'lab\/khoi-nghiep-tinh-huong\.html'/);
  assert.match(R('specs/011-tinh-huong-khoi-nghiep/tasks.md'), /- \[X\] T001[\s\S]*- \[X\] T005/);
  const v = +R('sw.js').match(/bizon-v(\d+)/)[1];
  assert.ok(v >= 1002, 'sw.js phải ≥ bizon-v1002, đang ' + v);

  const b = await chromium.launch();
  let fail = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fail++; };
  for (const lang of ['vi', 'en']) {
    const ctx = await b.newContext({ viewport: { width: 360, height: 760 }, acceptDownloads: true });
    const p = await ctx.newPage(); const errs = [], ngoai = [];
    p.on('pageerror', e => errs.push(e.message));
    p.on('request', r => { const u = r.url(); if (!u.startsWith(BASE) && !u.startsWith('data:') && !u.startsWith('blob:')) ngoai.push(u); });
    await p.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
    await p.goto(BASE + '/lab/khoi-nghiep-tinh-huong.html');
    check(/(giả định|Fictional)/i.test(await p.textContent('.gia-dinh')), lang + ': ghi rõ tình huống giả định');
    await p.fill('#ten-doi', 'Đội A');
    await p.click('[data-bo="kiem-dinh"]');
    check(!(await p.isHidden('#man-th')), lang + ': mở tình huống 1');
    check(await p.isDisabled('#nut-xem'), lang + ': chưa chọn thì chưa xem được hệ quả');
    await p.check('#th-pa .pa:nth-of-type(1) input');
    await p.fill('#ly-do', 'ngắn');
    check(await p.isDisabled('#nut-xem') && /10/.test(await p.textContent('#ly-do-goi-y')), lang + ': lý do dưới 10 ký tự thì bị chặn, có nhắc');
    await p.fill('#ly-do', 'Ra mắt sớm để giữ chỗ trên thị trường');
    await p.click('#nut-xem');
    const hq = await p.textContent('#kq-he-qua'), heQuaDung = bo.tinhHuong[0].phuongAn[0].heQua[lang];
    check(hq === heQuaDung, lang + ': hiện đúng hệ quả của phương án đã chọn');
    check((await p.textContent('#kq-vi-sao')).length > 40 && (await p.textContent('#kq-phan-bien')).length > 20, lang + ': có «Vì sao?» và câu hỏi phản biện');
    check(await p.$$eval('#kq-khac-ds li', l => l.length) === 3, lang + ': xem được hệ quả của 3 phương án còn lại');
    check(await p.$$eval('#th-pa input:not([disabled])', l => l.length) === 0, lang + ': đã chọn thì khóa lựa chọn');
    const body = await p.innerText('body');
    check(!/(đáp án đúng|correct answer|điểm:|score:)/i.test(body), lang + ': không hiện điểm hay đáp án đúng');
    // tải lại giữa chừng: giữ tiến độ
    await p.click('#nut-tiep'); await p.reload(); await p.waitForTimeout(200);
    check(/1\/4|1 of 4/.test(await p.textContent('#ds-bo')), lang + ': tải lại vẫn nhớ đã làm 1/4');
    await p.click('[data-bo="kiem-dinh"]');
    check(/2\/4|2 of 4/.test(await p.textContent('#th-tien-do')), lang + ': tiếp tục ở tình huống 2');
    for (let i = 0; i < 3; i++) {
      await p.check('#th-pa .pa:nth-of-type(2) input'); await p.fill('#ly-do', 'Lý do của đội cho tình huống ' + (i + 2)); await p.click('#nut-xem'); await p.click('#nut-tiep');
    }
    check(!(await p.isHidden('#man-tk')) && await p.$$eval('#bang-tk tbody tr', r => r.length) === 4, lang + ': tổng kết 4 dòng');
    const [tai] = await Promise.all([p.waitForEvent('download'), p.click('#nut-csv')]);
    const noi = fs.readFileSync(await tai.path(), 'utf8');
    check(noi.trim().split('\r\n').length === 5 && noi.includes('Đội A'), lang + ': CSV 4 lựa chọn, có tên đội');
    check(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, lang + ': 360 px không tràn ngang');
    const nho = await p.$$eval('button', bs => bs.filter(x => x.offsetParent && (x.getBoundingClientRect().height < 44 || x.getBoundingClientRect().width < 44)).map(x => x.id || x.textContent));
    check(nho.length === 0, lang + ': nút ≥ 44 px ' + nho.join(','));
    if (lang === 'en') check(!VIET.test((await p.innerText('body')).replace(/Đội A|Ninh Kiều|Cần Thơ|đồng|\d+ đ|Lý do của đội cho tình huống \d|Ra mắt sớm để giữ chỗ trên thị trường|Gambardella|Sarasvathy/g, '')), 'en: không còn chữ Việt');
    p.on('dialog', d => d.accept()); await p.click('#nut-lam-lai');
    check(/1\/4|1 of 4/.test(await p.textContent('#th-tien-do')) && (await p.evaluate(() => __knTest.trangThai().luu.bo['kiem-dinh'])) === undefined, lang + ': làm lại xóa lựa chọn của bộ');
    check(errs.length === 0, lang + ': không lỗi JS ' + errs.join(' | '));
    check(ngoai.length === 0, lang + ': không gọi mạng ngoài ' + ngoai.join(' '));
    await ctx.close();
  }
  await b.close();
  if (fail) { console.error(fail + ' kiểm tra hỏng'); process.exit(1); }
  console.log('khoi-nghiep-tinh-huong: đạt');
})().catch(e => { console.error(e); process.exit(1); });
