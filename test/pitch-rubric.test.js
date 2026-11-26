// Đặc tả 012 · PR 2 (Câu chuyện 2): rubric nghiên cứu 6 tiêu chí, chấm cặp mù, script độ tin cậy.
//  - Rubric: đủ 6 tiêu chí và câu «ý định đầu tư», VI/EN, mô tả neo cho từng mức 1–5; tài liệu có trích dẫn APA kiểm được.
//  - Chấm mù: chưa đủ phiếu thì không có điểm trong bản tin; đủ phiếu (hoặc giảng viên mở) thì có trung bình.
//  - Script: ICC(2,1), ICC(2,k) khớp số liệu Shrout & Fleiss (1979), sai số < 0,01; α Krippendorff khớp ví dụ mẫu; cảnh báo dưới 30 lượt.
//  - Trình duyệt (kênh 'local'): màn chiếu + 3 quỹ + 1 giảng viên (&gv=1); phiếu chấm mù, mở điểm, CSV chấm; 360 px; VI/EN.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), { execFileSync } = require('node:child_process');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const ROOT = path.join(__dirname, '..'), R = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const RB = require('../lab/pitch-goi-von-rubric.js'), P = require('../lab/pitch-goi-von-lop.js');
const VIET = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;

(async () => {
  const D = await import(path.join(ROOT, 'scripts/research/do-tin-cay-pitch.mjs'));

  // 1. Rubric
  assert.deepEqual(RB.TIEU_CHI.map(t => t.id), D.TIEU_CHI, 'rubric và script dùng cùng 6 mã tiêu chí');
  assert.deepEqual(D.TIEU_CHI, ['chuan_bi', 'nhiet_huyet', 'tai_chinh', 'van_de_giai_phap', 'doi_ngu', 'tra_loi']);
  for (const tc of RB.TIEU_CHI.concat([RB.Y_DINH])) {
    assert.ok(tc.vi && tc.en && tc.hoi.vi && tc.hoi.en && tc.nguon, tc.id + ' đủ tên, câu hỏi VI/EN, nguồn');
    assert.ok(!VIET.test(tc.en + tc.hoi.en), tc.id + ' bản EN không còn chữ Việt');
    for (let v = 1; v <= 5; v++) {
      assert.ok(tc.neo[v] && tc.neo[v].vi && tc.neo[v].en, tc.id + ' thiếu mô tả neo mức ' + v);
      assert.ok(!VIET.test(tc.neo[v].en), tc.id + ' neo ' + v + ' bản EN còn chữ Việt');
    }
    assert.equal(new Set([1, 2, 3, 4, 5].map(v => tc.neo[v].vi)).size, 5, tc.id + ': 5 mô tả neo khác nhau');
  }
  assert.equal(RB.Y_DINH.id, 'y_dinh');
  // Tài liệu: trích dẫn APA khớp danh mục (ngoại tuyến; DOI đã tra Crossref khi viết)
  const doc = 'docs/research/DO-TIN-CAY-PITCH.md';
  execFileSync(process.execPath, [path.join(ROOT, 'scripts/research/kiem-trich-dan.mjs'), path.join(ROOT, doc)], { stdio: 'pipe' });
  for (const k of ['Chen', 'Clingingsmith', 'Huang', 'Shrout', 'McGraw', 'Hayes', 'Koo']) assert.ok(R(doc).includes('\n' + k + ', '), doc + ' có mục ' + k);
  assert.ok(R('docs/research/ISAGA-2027-DAN-Y-BAI.md').includes('do-tin-cay-pitch.mjs'), 'dàn ý ISAGA nối tới trang chấm mù');

  // 2. Chấm mù (hàm thuần)
  let so = P.taoPhong('RUB234');
  for (const [id, ten] of [['a', 'Sen'], ['b', 'Lúa'], ['c', 'Dừa']]) so = P.duyet(P.xinVao(so, id, ten).st, id).st;
  so = P.moRot(so, 'a', 0, 1000).st;
  let sc = RB.taoSoCham(), r;
  r = RB.gvXin(sc, 'gv-x', ' GV 1 '); sc = r.s; assert.ok(r.ok && sc.gv['gv-x'].ten === 'GV 1');
  assert.equal(RB.gvXin(sc, '__proto__', 'X').ok, false, 'mã người chấm lạ bị từ chối');
  const phieu = (nguoi, doi, d, y) => ({ nguoi, doi, diem: d || [3, 4, 2, 5, 3, 4], yDinh: y || 4 });
  assert.equal(RB.nop(sc, so, phieu('gv-x', 'a'), 1).ly, 'khong-cham', 'giảng viên chưa duyệt không chấm');
  sc = RB.gvDuyet(sc, 'gv-x').s;
  assert.deepEqual(RB.nguoiCan(sc, so, 'a').tat.sort(), ['b', 'c', 'gv-x'], 'người phải chấm: quỹ khác và giảng viên');
  assert.equal(RB.nop(sc, so, phieu('a', 'a'), 1).ly, 'cua-minh', 'không chấm chính đội mình');
  for (const d of [[3, 4, 2, 5, 3], [0, 4, 2, 5, 3, 4], [3, 4, 2, 5, 3, 6], [3, 4, 2.5, 5, 3, 4], 'abc']) assert.equal(RB.nop(sc, so, phieu('b', 'a', d), 1).ly, 'sai-diem', 'điểm sai: ' + JSON.stringify(d));
  assert.equal(RB.nop(sc, so, phieu('b', 'a', null, 6), 1).ly, 'sai-diem', 'ý định ngoài 1–5');
  assert.equal(RB.nop(sc, so, phieu('khach', 'a'), 1).ly, 'khong-cham', 'người lạ không chấm');
  r = RB.nop(sc, so, phieu('b', 'a', [4, 4, 4, 4, 4, 4], 5), 2); sc = r.s; assert.ok(r.ok);
  r = RB.nop(sc, so, phieu('b', 'a', [1, 1, 1, 1, 1, 1], 1), 3); sc = r.s; assert.equal(r.ly, 'trung', 'gửi lại không đổi phiếu');
  let tt = RB.tomTat(sc, so, 'a');
  assert.ok(!tt.mo && tt.soNop === 1 && tt.soCan === 3 && !('tb' in tt) && !('tbGv' in tt), 'chưa đủ phiếu: không có điểm (chấm mù)');
  assert.ok(!JSON.stringify(tt).includes('"diem"'), 'tóm tắt chưa mở không lộ phiếu');
  sc = RB.nop(sc, so, phieu('c', 'a', [2, 2, 2, 2, 2, 2], 3), 4).s;
  sc = RB.nop(sc, so, phieu('gv-x', 'a', [3, 5, 3, 3, 3, 3], 2), 5).s;
  tt = RB.tomTat(sc, so, 'a');
  assert.ok(tt.mo && tt.soNop === 3, 'đủ phiếu thì tự mở');
  assert.deepEqual(tt.tb, [3, 11 / 3, 3, 3, 3, 3]);
  assert.deepEqual(tt.tbGv, [3, 5, 3, 3, 3, 3]); assert.deepEqual(tt.tbBan, [3, 3, 3, 3, 3, 3]);
  assert.equal(tt.yDinh, 10 / 3);
  // Giảng viên mở sớm
  so = P.moRot(so, 'b', 0, 100000).st;
  sc = RB.nop(sc, so, phieu('gv-x', 'b'), 6).s;
  assert.ok(!RB.tomTat(sc, so, 'b').mo, 'đội b mới 1/3 phiếu');
  sc = RB.moDiem(sc, 'b').s;
  assert.ok(RB.tomTat(sc, so, 'b').mo && RB.tomTat(sc, so, 'b').tb, 'mở sớm thì có điểm');
  // CSV dạng dài, đọc lại được bằng script
  const csv = RB.taoCsv(sc, so);
  assert.ok(csv.startsWith('﻿' + RB.COT_CSV.join(',') + '\r\n'), 'CSV có BOM và tiêu đề');
  const dongs = D.docCsv(csv);
  assert.equal(dongs.length, 4 * 7, '4 phiếu × (6 tiêu chí + ý định)');
  assert.ok(dongs.every(d => d.ma_buoi === 'RUB234') && dongs.some(d => d.nguoi_cham === 'gv-1' && d.vai === 'gv') && dongs.some(d => d.nguoi_cham === 'Lúa' && d.vai === 'ban'), 'người chấm ghi bằng tên đội hoặc gv-1, không tên thật');
  assert.ok(!csv.includes('GV 1'), 'CSV không ghi tên hiển thị của giảng viên');

  // 3. Độ tin cậy
  const sf = [[9, 2, 5, 8], [6, 1, 3, 2], [8, 4, 6, 8], [7, 1, 2, 6], [10, 5, 6, 9], [6, 2, 4, 7]];
  const ic = D.icc(sf);
  assert.ok(Math.abs(ic.icc21 - 0.29) < 0.01 && Math.abs(ic.icc2k - 0.62) < 0.01, 'ICC khớp Shrout & Fleiss (1979): ' + ic.icc21 + ', ' + ic.icc2k);
  assert.ok(Math.abs(ic.ci21[0] - 0.019) < 0.01 && Math.abs(ic.ci21[1] - 0.761) < 0.01, 'khoảng tin cậy ICC(2,1) theo McGraw & Wong: ' + ic.ci21);
  assert.ok(Math.abs(ic.ci2k[0] - 0.071) < 0.01 && Math.abs(ic.ci2k[1] - 0.927) < 0.01, 'khoảng tin cậy ICC(2,k): ' + ic.ci2k);
  assert.ok(Math.abs(D.fQuantile(0.975, 5, 15) - 3.576) < 0.002 && Math.abs(D.fQuantile(0.95, 2, 10) - 4.103) < 0.002, 'phân vị F đúng bảng');
  const A = [1, 2, 3, 3, 2, 1, 4, 1, 2, null, null, null], B = [1, 2, 3, 3, 2, 2, 4, 1, 2, 5, null, 3], C = [null, 3, 3, 3, 2, 3, 4, 2, 2, 5, 1, null], E = [1, 2, 3, 3, 2, 4, 4, 1, 2, 5, 1, null];
  const don = A.map((_, i) => [A[i], B[i], C[i], E[i]]);
  assert.ok(Math.abs(D.alphaKrippendorff(don, 'interval') - 0.849) < 0.001, 'α khoảng khớp ví dụ mẫu (0,849)');
  assert.ok(Math.abs(D.alphaKrippendorff(don, 'nominal') - 0.743) < 0.001, 'α định danh khớp ví dụ mẫu (0,743)');
  const ci = D.alphaBootstrap(don, { lan: 500, seed: 7 });
  assert.ok(ci[0] < 0.849 && ci[1] > 0.849 && ci[1] <= 1, 'khoảng bootstrap bao điểm ước lượng');
  assert.deepEqual(D.alphaBootstrap(don, { lan: 300, seed: 3 }), D.alphaBootstrap(don, { lan: 300, seed: 3 }), 'cùng hạt giống, cùng kết quả');
  assert.throws(() => D.icc([[1, 2]]), /ít nhất 2/);
  // Phân tích từ CSV: lượt ít thì cảnh báo; nhiều lượt nhất quán thì đạt ngưỡng
  const kq = D.phanTich(dongs, { lan: 200 });
  assert.ok(kq.canhBao.some(c => /dưới 30/.test(c)), 'dưới 30 lượt có cảnh báo');
  const tao = (n, nhieu) => { const rows = ['ma_buoi,doi,nguoi_cham,vai,tieu_chi,diem,thoi_diem']; for (let i = 0; i < n; i++) { const that = 1 + (i % 5); [['gv-1', 'gv', 0], ['A', 'ban', nhieu], ['B', 'ban', -nhieu]].forEach(([ng, vai, lech]) => D.TIEU_CHI.forEach(tc => rows.push(['S1', 'doi' + i, ng, vai, tc, Math.min(5, Math.max(1, that + (i % 2 ? lech : 0))), ''].join(',')))); } return rows.join('\r\n'); };
  const tot = D.phanTich(D.docCsv(tao(40, 0)), { lan: 200 });
  assert.ok(tot.soLuot === 40 && tot.soLuotCap === 40 && tot.icc2k > 0.99 && tot.datNguong && tot.alpha > 0.99 && !tot.canhBao.length, 'dữ liệu nhất quán: đạt ngưỡng, không cảnh báo');
  // CLI
  const tam = path.join(require('node:os').tmpdir(), 'bizon-cham-' + process.pid + '.csv');
  const chay = noi => { fs.writeFileSync(tam, noi); try { return execFileSync(process.execPath, [path.join(ROOT, 'scripts/research/do-tin-cay-pitch.mjs'), tam], { encoding: 'utf8' }); } finally { fs.unlinkSync(tam); } };
  const out = chay(tao(12, 1));
  assert.ok(/ICC\(2,1\) =/.test(out) && /ICC\(2,k\) =/.test(out) && /α Krippendorff/.test(out) && /dưới 30/.test(out), 'CLI in ICC, α và cảnh báo:\n' + out);
  assert.ok(/Chưa đủ lượt/.test(chay(csv)), 'CLI báo khi chưa đủ lượt có cả giảng viên và bạn học');

  // 4. sw, trang
  for (const f of ['pitch-goi-von-rubric.js']) assert.ok(R('sw.js').includes("'./lab/" + f + "'"), 'sw.js lưu sẵn ' + f);
  const v = +R('sw.js').match(/bizon-v(\d+)/)[1];
  assert.ok(v >= 1011, 'sw.js phải ≥ bizon-v1011, đang ' + v);
  assert.ok(R('lab/pitch-quy.html').includes('pitch-goi-von-rubric.js') && R('lab/pitch-goi-von.html').includes('pitch-goi-von-rubric.js'), 'hai trang nạp rubric');

  // 5. Trình duyệt
  const b = await chromium.launch();
  let fail = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fail++; };
  const ctx = await b.newContext({ acceptDownloads: true });
  const errs = [], ngoai = [];
  const theoDoi = (p, ten) => { p.on('pageerror', e => errs.push(ten + ': ' + e.message)); p.on('request', q => { const u = q.url(); if (!u.startsWith(BASE) && !u.startsWith('data:') && !u.startsWith('blob:')) ngoai.push(u); }); };
  const cho = async (p, fn, arg, ms) => { try { await p.waitForFunction(fn, arg, { timeout: ms || 6000 }); return true; } catch (e) { return false; } };
  await ctx.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
  const h = await ctx.newPage(); theoDoi(h, 'chieu'); await h.setViewportSize({ width: 1280, height: 900 });
  await h.goto(BASE + '/lab/pitch-goi-von.html?hoidong=1&kenh=local&p=RUB234');
  check(await cho(h, () => window.__pitchLop && __pitchLop.vai() === 'chu'), 'màn chiếu làm chủ phòng');
  const q = [];
  for (const tn of ['Sen', 'Lúa', 'Dừa']) { const p = await ctx.newPage(); theoDoi(p, 'quy-' + tn); await p.setViewportSize({ width: 360, height: 760 }); await p.goto(BASE + '/lab/pitch-quy.html?p=RUB234&kenh=local'); await p.fill('#quy-ten', tn); await p.click('#nut-vao'); q.push(p); }
  const g = await ctx.newPage(); theoDoi(g, 'gv'); await g.setViewportSize({ width: 360, height: 760 });
  await g.goto(BASE + '/lab/pitch-quy.html?p=RUB234&kenh=local&gv=1');
  check(await g.isVisible('#quy-vao') && /Giảng viên/.test(await g.textContent('#h-vao')), 'trang giảng viên chấm: ô nhập tên hiển thị');
  await g.fill('#quy-ten', 'GV 1'); await g.click('#nut-vao');
  check(await cho(h, () => __pitchLop.st().thuTu.length === 3 && Object.keys(__pitchLop.sc().gv).length === 1), 'màn chiếu thấy 3 quỹ và 1 giảng viên xin vào');
  check(/giảng viên chấm/.test(await h.textContent('#lop-ds-quy')), 'danh sách ghi rõ người chấm là giảng viên');
  for (let i = 0; i < 3; i++) await h.click('#lop-ds-quy [data-duyet]');
  await h.click('#lop-ds-quy [data-duyet-gv]');
  check(await cho(g, () => /duyệt làm người chấm/.test(document.getElementById('quy-trang-thai').textContent)), 'giảng viên được duyệt');
  check(await g.isHidden('#the-von') && await g.isHidden('#the-rot'), 'giảng viên không có quỹ, không rót vốn');
  for (const p of q) await cho(p, () => __quy.trangThai().duyet);
  const idSen = await q[0].evaluate(() => __quy.trangThai().id);
  await h.selectOption('#lop-doi', idSen); await h.click('#nut-mo-rot');
  check(await cho(q[1], () => !document.getElementById('the-cham').hidden && document.querySelectorAll('#cham-form fieldset').length === 7), 'quỹ khác thấy phiếu 6 tiêu chí + ý định');
  check(await cho(q[0], () => !document.getElementById('the-cham').hidden) && await q[0].isHidden('#cham-form') && /không chấm chính đội/.test(await q[0].textContent('#cham-bao')), 'đội đang pitch không chấm mình');
  const nho = await q[1].$$eval('#the-cham label, #the-cham button', bs => bs.filter(x => x.offsetParent && (x.getBoundingClientRect().height < 44 || x.getBoundingClientRect().width < 44)).map(x => x.htmlFor || x.id));
  check(nho.length === 0 && await q[1].$$eval('#the-cham label', l => l.length) === 35, 'ô chọn mức và nút ≥ 44 px ' + nho.join(','));
  // Nộp thiếu thì báo
  await q[1].click('#nut-nop-cham');
  check(/Chọn đủ/.test(await q[1].textContent('#cham-bao')), 'nộp thiếu tiêu chí thì nhắc');
  const chamHet = async (p, ds) => { for (const [i, id] of ['chuan_bi', 'nhiet_huyet', 'tai_chinh', 'van_de_giai_phap', 'doi_ngu', 'tra_loi', 'y_dinh'].entries()) await p.click('label[for="tc-' + id + '-' + ds[i] + '"]'); };
  await chamHet(q[1], [4, 4, 4, 4, 4, 4, 5]);
  check(/Mức 4:/.test(await q[1].textContent('#neo-chuan_bi')), 'chọn mức thì hiện mô tả neo');
  await q[1].click('#nut-nop-cham');
  check(await cho(q[1], () => /Đã nộp phiếu/.test(document.getElementById('cham-bao').textContent)), 'quỹ Lúa nộp xong');
  check(await cho(h, () => /1\/3/.test(document.getElementById('lop-cham-tien').textContent)), 'màn chiếu: đã nộp 1/3');
  check(await h.isHidden('#lop-cham-bang'), 'chưa đủ phiếu: màn chiếu chưa hiện điểm');
  const tin = await q[2].evaluate(() => __quy.chamTin());
  check(tin && tin.tt && tin.tt.soNop === 1 && !tin.tt.tb && !JSON.stringify(tin).includes('"diem"'), 'bản tin tới các máy không có điểm khi chưa mở (chấm mù)');
  await chamHet(q[2], [2, 2, 2, 2, 2, 2, 3]); await q[2].click('#nut-nop-cham');
  await chamHet(g, [3, 5, 3, 3, 3, 3, 2]); await g.click('#nut-nop-cham');
  check(await cho(h, () => !document.getElementById('lop-cham-bang').hidden), 'đủ phiếu: màn chiếu tự mở điểm');
  const bang = await h.$$eval('#lop-cham-bang tbody tr', rs => rs.map(r => [...r.children].map(c => c.textContent)));
  check(bang.length === 7 && bang[0][1] === '3,00' && bang[1][1] === '3,67' && bang[1][2] === '5,00' && bang[1][3] === '3,00' && bang[6][1] === '3,33', 'trung bình cả lớp / giảng viên / bạn học đúng ' + JSON.stringify(bang.slice(0, 2)));
  // Đội sau: mở điểm sớm
  const idLua = await q[1].evaluate(() => __quy.trangThai().id);
  await h.selectOption('#lop-doi', idLua); await h.click('#nut-mo-rot');
  check(await cho(g, () => /Lúa/.test(document.getElementById('cham-tieu-de').textContent) && !document.getElementById('cham-form').hidden && !document.querySelector('#cham-form input:checked')), 'vòng mới: phiếu trống cho đội Lúa');
  await chamHet(g, [5, 5, 5, 5, 5, 5, 5]); await g.click('#nut-nop-cham');
  check(await cho(h, () => /1\/3/.test(document.getElementById('lop-cham-tien').textContent)) && await h.isVisible('#nut-mo-diem'), 'đội Lúa: 1/3, có nút mở điểm sớm');
  await h.click('#nut-mo-diem');
  check(await cho(h, () => !document.getElementById('lop-cham-bang').hidden), 'mở điểm sớm thì hiện bảng');
  // Màn xem thứ hai
  const h2 = await ctx.newPage(); theoDoi(h2, 'chieu-2'); await h2.goto(BASE + '/lab/pitch-goi-von.html?hoidong=1&kenh=local&p=RUB234');
  check(await cho(h2, () => __pitchLop.vai() === 'xem' && !document.getElementById('lop-cham-bang').hidden), 'màn xem cũng thấy bảng điểm đã mở');
  check(await h2.isHidden('#nut-cham-csv') && await h2.isHidden('#nut-mo-diem'), 'màn xem không có nút chấm');
  // CSV chấm
  const [dl] = await Promise.all([h.waitForEvent('download'), h.click('#nut-cham-csv')]);
  const noiDung = fs.readFileSync(await dl.path(), 'utf8'), ds = D.docCsv(noiDung);
  check(/^pitch-cham-RUB234-\d{4}-\d{2}-\d{2}\.csv$/.test(dl.suggestedFilename()) && ds.length === 4 * 7, 'CSV chấm: 4 phiếu × 7 dòng');
  check(ds.filter(d => d.vai === 'gv').every(d => d.nguoi_cham === 'gv-1') && !noiDung.includes('GV 1'), 'CSV không có tên hiển thị của giảng viên');
  // EN, 360 px
  await g.click('#nut-lang');
  const en = await g.innerText('#quy-chinh');
  check(/score sheet|Score sheet/.test(en) && !VIET.test(en.replace(/Sen|Lúa|Dừa|GV 1/g, '')), 'trang giảng viên EN không còn chữ Việt');
  await h.click('#nut-lang');
  check(!VIET.test((await h.innerText('#the-lop-cham')).replace(/Sen|Lúa|Dừa/g, '')), 'thẻ chấm trên màn chiếu EN không còn chữ Việt');
  for (const p of q.concat([g])) check(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, '360 px không tràn ngang');
  check(errs.length === 0, 'không lỗi JS ' + errs.join(' | '));
  check(ngoai.length === 0, 'không gọi mạng ngoài ' + ngoai.join(' '));
  await b.close();
  if (fail) { console.error(fail + ' kiểm tra hỏng'); process.exit(1); }
  console.log('pitch-rubric: đạt');
})().catch(e => { console.error(e); process.exit(1); });
