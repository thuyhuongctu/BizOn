// 21/11/2026: trang Bằng chứng, mục lớp quốc tế UM Kendari có thêm «Lớp học qua Zoom · 17–19/11/2026» với 2 ảnh chụp màn hình
// chị gửi: lớp trao đổi qua Zoom. Đã cắt khung chat, làm mờ họ tên sinh viên và giảng viên UMK (chị chọn «che tên, giữ mặt»).
// Thêm ảnh màn EnQuiz: sinh viên thi 2 quiz giữa kỳ trên EnQuiz (chị chọn; bảng điểm có họ tên, MSSV nên không đăng). Ảnh thầy Tú cúi nhìn xuống chị chọn bỏ, không ghép ảnh khác vào (trang Bằng chứng chỉ dùng ảnh thật). Tệp mới, không ghi đè ảnh cũ.
'use strict';
const fs = require('fs'), path = require('path'), assert = require('assert');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const IMGS = ['assets/photos/umk-zoom-2026-11-19-lop.webp', 'assets/photos/umk-quiz-kt330h-2026-11-18.webp'];   // ảnh lớp + màn Quiz (không có dữ liệu cá nhân)
for (const f of IMGS) {
  assert.ok(fs.existsSync(R(f)), 'có ' + f);
  const b = fs.readFileSync(R(f));
  assert.ok(b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP', f + ' là WebP');
  assert.ok(b.length < 200 * 1024, f + ' nhẹ hơn 200 KB');
}
const s = read('bang-chung.html');
assert.ok(s.indexOf('id="lop-quoc-te-umk"') < s.indexOf('id="lop-zoom-umk"'), 'nhóm ảnh Zoom nằm trong mục lớp UMK');
for (const f of IMGS) assert.ok(new RegExp('<img src="' + f.replace(/[.]/g, '\\.') + '" width="\\d+" height="\\d+" loading="lazy" alt="[^"]+" data-en-alt="[^"]+">').test(s), f + ': có kích thước, alt VI/EN');
assert.ok(/làm mờ họ tên/.test(s) && /names blurred/.test(s), 'chú thích nói rõ đã làm mờ họ tên');
assert.ok(s.includes('Sinh viên thi hai bài Quiz giữa kỳ (chương 1–3, 4–7) trên EnQuiz') && s.includes('Students sat both midterm quizzes (chapters 1–3 and 4–7) on EnQuiz'), 'chú thích: sinh viên thi 2 quiz trên EnQuiz (VI/EN)');
assert.ok(!s.includes('umk-zoom-2026-11-18-thay-tu') && !fs.existsSync(R('assets/photos/umk-zoom-2026-11-18-thay-tu.webp')), 'không dùng ảnh thầy Tú cúi đầu (chị chọn bỏ)');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 948, 'sw.js ≥ v948');

(async () => {
  const b = await chromium.launch();
  try {
    for (const [w, lang] of [[360, 'vi'], [390, 'en'], [1280, 'vi']]) {
      const ctx = await b.newContext({ viewport: { width: w, height: 844 }, serviceWorkers: 'block' });
      const p = await ctx.newPage(), errs = [];
      p.on('pageerror', e => errs.push(e.message));
      await p.addInitScript(l => localStorage.setItem('bizon-lang', l), lang);
      await p.goto(BASE + '/bang-chung.html#lop-zoom-umk', { waitUntil: 'load', timeout: 60000 });
      await p.locator('#lop-zoom-umk + .bc-photos.bc-zoom').scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
      const r = await p.evaluate(() => { const imgs = [...document.querySelectorAll('#lop-zoom-umk + .bc-photos.bc-zoom img')];
        return { n: imgs.length, ok: imgs.every(i => i.complete && i.naturalWidth > 0), alts: imgs.map(i => i.alt), h: document.getElementById('lop-zoom-umk').textContent.trim(), sw: document.documentElement.scrollWidth }; });
      const tag = w + ' ' + lang;
      assert.equal(r.n, 3, tag + ': ảnh buổi 1 (17/11), ảnh lớp và màn Quiz');
      assert.ok(r.ok, tag + ': ảnh tải được');
      assert.equal(r.h, lang === 'en' ? 'The class on Zoom · 17–19 November 2026' : 'Lớp học qua Zoom · 17–19/11/2026', tag + ': tiêu đề đúng ngôn ngữ');
      assert.ok(lang === 'en' ? /^UM Kendari students/.test(r.alts[1]) : /^Sinh viên và giảng viên UM Kendari/.test(r.alts[1]), tag + ': alt đúng ngôn ngữ');
      assert.ok(r.sw <= w, tag + ': không tràn ngang');
      assert.deepEqual(errs, [], tag + ': không lỗi JS');
      await ctx.close();
    }
    console.log('anh-lop-zoom-umk: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
