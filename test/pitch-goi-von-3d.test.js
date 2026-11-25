// Đặc tả 010 · PR 3 (Câu chuyện 3): Phòng Hội đồng 3D.
//  - Có WebGL và bật 3D: phần hỏi đáp có canvas 3D, người đang hỏi nổi bật (đổi theo câu), ảnh nhân vật tải xong, khung hình có vẽ.
//  - three.js chỉ nạp khi vào phần hỏi đáp ở chế độ 3D, không nạp lúc mở trang; ?3d=0 thì không nạp.
//  - Không có WebGL: tự về bản phẳng (lưới ảnh Hội đồng), có dòng báo, không lỗi JS, không nạp three.js.
//  - 360 px không tràn ngang; bản EN đổi biển và bảng tên; nhớ lựa chọn bật/tắt 3D.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

const m3d = R('lab/pitch-goi-von-3d.js');
assert.match(m3d, /assets\/character|anh/, 'dùng ảnh gốc nhân vật');
assert.ok(!/GLTFLoader|\.glb/.test(m3d), 'không dựng mô hình mới');
assert.match(m3d, /prefers-reduced-motion/, 'tôn trọng giảm chuyển động');
assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon/.test(m3d));
const html = R('lab/pitch-goi-von.html');
assert.ok(!/<script[^>]+three\.min\.js/.test(html), 'three.js không nạp tĩnh trong trang');
assert.ok(R('sw.js').includes("'./lab/pitch-goi-von-3d.js'"), 'sw.js lưu sẵn mô-đun 3D');
const v = +R('sw.js').match(/bizon-v(\d+)/)[1];
assert.ok(v >= 1000, 'sw.js phải ≥ bizon-v1000, đang ' + v);

(async () => {
  const b = await chromium.launch();
  let fail = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fail++; };
  const vaoHoiDap = async (p) => { await p.fill('#ten-doi', 'Đội Sen'); await p.click('#nut-bat-dau'); await p.evaluate(() => __pitchTest.tua(100)); await p.click('#nut-ket-thuc'); };

  // 1. Có WebGL, bật 3D
  for (const lang of ['vi', 'en']) {
    const p = await b.newPage({ viewport: { width: 360, height: 780 } });
    const errs = [], three = []; p.on('pageerror', e => errs.push(e.message));
    p.on('request', r => { if (/three\.min\.js/.test(r.url())) three.push(r.url()); });
    await p.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
    await p.goto(BASE + '/lab/pitch-goi-von.html?ma=K3&3d=1');
    const coWebgl = await p.evaluate(() => window.PitchPhong3D.hoTro());
    check(await p.isChecked('#chk-3d'), lang + ': ?3d=1 bật ô 3D');
    check(three.length === 0, lang + ': chưa nạp three.js khi mới mở trang');
    await vaoHoiDap(p);
    if (!coWebgl) { check(false, 'trình duyệt test không có WebGL – không kiểm được phần 3D'); await p.close(); continue; }
    await p.waitForFunction(() => { const s = __pitchTest.p3(); return s.sanSang && s.khung > 0; }, null, { timeout: 30000 }).catch(() => {});
    const s = await p.evaluate(() => __pitchTest.p3()), st = await p.evaluate(() => __pitchTest.trangThai());
    const cauDau = require('../lab/pitch-goi-von-data.js').CAU_HOI.find(c => c.id === st.cau[0]);
    check(three.length === 1, lang + ': nạp three.js đúng một lần khi vào hỏi đáp');
    check(s.sanSang && s.khung > 0 && s.nhanVat === 3, lang + ': phòng 3D dựng xong, 3 thành viên, có vẽ ' + JSON.stringify(s));
    check(!(await p.isHidden('#phong-3d')) && await p.isHidden('#hoi-dong'), lang + ': hiện canvas 3D thay lưới ảnh');
    check(s.hoi === cauDau.hoi, lang + ': người hỏi câu 1 nổi bật (' + s.hoi + ')');
    check(/(đang hỏi|is asking)/.test(await p.getAttribute('#phong-3d', 'aria-label')), lang + ': canvas có mô tả cho trình đọc màn hình');
    await p.click('#nut-cau-tiep');
    const s2 = await p.evaluate(() => __pitchTest.p3()), st2 = await p.evaluate(() => __pitchTest.trangThai());
    const cau2 = require('../lab/pitch-goi-von-data.js').CAU_HOI.find(c => c.id === st2.cau[1]);
    check(s2.hoi === cau2.hoi, lang + ': sang câu 2 thì đổi người nổi bật (' + s2.hoi + ')');
    const anh = await p.evaluate(() => { const c = document.getElementById('phong-3d'); return { w: c.width, h: c.height }; });
    check(anh.w > 0 && anh.h > 0, lang + ': canvas có kích thước ' + JSON.stringify(anh));
    check(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, lang + ': 360 px không tràn ngang');
    check(errs.length === 0, lang + ': không lỗi JS ' + errs.join(' | '));
    await p.close();
  }

  // 2. Không có WebGL → bản phẳng, không nạp three.js
  {
    const p = await b.newPage({ viewport: { width: 360, height: 780 } });
    const errs = [], three = []; p.on('pageerror', e => errs.push(e.message));
    p.on('request', r => { if (/three\.min\.js/.test(r.url())) three.push(r.url()); });
    await p.addInitScript(() => {
      const goc = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (k, ...a) { return /webgl/i.test(k) ? null : goc.call(this, k, ...a); };
      try { localStorage.setItem('bizon-lang', 'vi'); } catch (e) {}
    });
    await p.goto(BASE + '/lab/pitch-goi-von.html?ma=K3&3d=1');
    await vaoHoiDap(p); await p.waitForTimeout(500);
    check(await p.isHidden('#phong-3d') && !(await p.isHidden('#hoi-dong')), 'không WebGL: dùng lưới ảnh phẳng');
    check(/bản phẳng/.test(await p.textContent('#note-3d')), 'không WebGL: có dòng báo dùng bản phẳng');
    check(await p.$$eval('.tv.hoi', a => a.length) === 1, 'không WebGL: người hỏi vẫn nổi bật trong bản phẳng');
    check(three.length === 0, 'không WebGL: không nạp three.js');
    check(errs.length === 0, 'không WebGL: không lỗi JS ' + errs.join(' | '));
    await p.close();
  }

  // 3. ?3d=0 → không nạp three.js; nhớ lựa chọn
  {
    const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
    const three = []; p.on('request', r => { if (/three\.min\.js/.test(r.url())) three.push(r.url()); });
    await p.goto(BASE + '/lab/pitch-goi-von.html?lang=vi&ma=K3&3d=0');
    check(!(await p.isChecked('#chk-3d')), '?3d=0: ô 3D tắt');
    await vaoHoiDap(p); await p.waitForTimeout(500);
    check(three.length === 0 && await p.isHidden('#phong-3d'), '?3d=0: không nạp three.js, dùng bản phẳng');
    await p.goto(BASE + '/lab/pitch-goi-von.html?lang=vi');
    await p.check('#chk-3d'); await p.goto(BASE + '/lab/pitch-goi-von.html?lang=vi');
    check(await p.isChecked('#chk-3d'), 'nhớ lựa chọn bật 3D');
    await p.uncheck('#chk-3d'); await p.goto(BASE + '/lab/pitch-goi-von.html?lang=vi');
    check(!(await p.isChecked('#chk-3d')), 'nhớ lựa chọn tắt 3D');
    await p.close();
  }
  await b.close();
  if (fail) { console.error(fail + ' kiểm tra hỏng'); process.exit(1); }
  console.log('pitch-goi-von-3d: đạt');
})().catch(e => { console.error(e); process.exit(1); });
