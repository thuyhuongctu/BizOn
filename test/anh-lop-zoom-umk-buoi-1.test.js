// 26/11/2026: mục «Lớp học qua Zoom» (trang Bằng chứng, lớp quốc tế UM Kendari) thêm ảnh buổi 1 môn KT330H (17/11/2026)
// chị gửi. Như hai ảnh Zoom trước: cắt bỏ khung danh sách người tham gia (toàn tên sinh viên), thanh tiêu đề và thanh công cụ Zoom;
// làm mờ nhãn tên ở dải ảnh nhỏ phía trên (che tên, giữ mặt); giữ tên thầy Tú. Tệp mới, không ghi đè ảnh cũ.
'use strict';
const fs = require('fs'), path = require('path'), assert = require('assert');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const IMG = 'assets/photos/umk-zoom-2026-11-17-kt330h.webp';
const b = fs.readFileSync(R(IMG));
assert.ok(b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP', 'ảnh là WebP');
assert.ok(b.length < 200 * 1024, 'ảnh nhẹ hơn 200 KB');
const s = read('bang-chung.html');
const vt = s.indexOf(IMG);
assert.ok(vt > s.indexOf('id="lop-zoom-umk"') && vt < s.indexOf('umk-zoom-2026-11-19-lop.webp'), 'ảnh buổi 1 đứng đầu nhóm ảnh Zoom (theo thứ tự ngày)');
assert.ok(new RegExp('<img src="' + IMG.replace(/[.]/g, '\\.') + '" width="1200" height="754" loading="lazy" alt="[^"]+" data-en-alt="[^"]+">').test(s), 'có kích thước, alt VI/EN');
assert.ok(s.includes('Buổi 1 môn KT330H Khởi nghiệp (17/11/2026)') && s.includes('Day 1 of KT330H Entrepreneurship (17 November 2026)'), 'chú thích VI/EN');
assert.ok(/KT330H[^<]*đã làm mờ họ tên/.test(s) && /KT330H[^<]*names blurred/.test(s), 'chú thích nói rõ đã làm mờ họ tên');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 1014, 'sw.js ≥ v1014');

(async () => {
  const br = await chromium.launch();
  try {
    for (const [w, lang] of [[360, 'vi'], [390, 'en'], [1280, 'vi']]) {
      const ctx = await br.newContext({ viewport: { width: w, height: 844 }, serviceWorkers: 'block' });
      const p = await ctx.newPage(), errs = [];
      p.on('pageerror', e => errs.push(e.message));
      await p.addInitScript(l => localStorage.setItem('bizon-lang', l), lang);
      await p.goto(BASE + '/bang-chung.html#lop-zoom-umk', { waitUntil: 'load', timeout: 60000 });
      const img = p.locator('#lop-zoom-umk + .bc-photos.bc-zoom img').first();
      await img.scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
      const r = await img.evaluate(i => ({ src: i.getAttribute('src'), ok: i.complete && i.naturalWidth === 1200, alt: i.alt, cap: i.parentElement.querySelector('figcaption').textContent, sw: document.documentElement.scrollWidth }));
      const tag = w + ' ' + lang;
      assert.equal(r.src, IMG, tag + ': ảnh buổi 1 đứng đầu');
      assert.ok(r.ok, tag + ': ảnh tải được');
      assert.ok(lang === 'en' ? /^Assoc\. Prof\. Phan Anh Tu teaching day 1/.test(r.alt) && /^Day 1 of KT330H/.test(r.cap) : /^Thầy Phan Anh Tú giảng buổi 1/.test(r.alt) && /^Buổi 1 môn KT330H/.test(r.cap), tag + ': alt và chú thích đúng ngôn ngữ');
      assert.ok(r.sw <= w, tag + ': không tràn ngang');
      assert.deepEqual(errs, [], tag + ': không lỗi JS');
      await ctx.close();
    }
    console.log('anh-lop-zoom-umk-buoi-1: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await br.close();
})();
