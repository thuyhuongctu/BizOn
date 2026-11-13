// Hoạt động lớp Dollar Street (13/11/2026): trang 10 phút cho phần Price của Xưởng Nhãn Hiệu Đặc Sản.
// Kiểm: nối từ phần Price, có trong sitemap, dùng đúng tên bốn chiến lược giá của Xưởng, đồng hồ tô đúng bước, song ngữ, không tràn ngang.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const PAGE = 'xuong-nhan-hieu-dollar-street.html';
const s = read(PAGE);

assert.ok(read('xuong-nhan-hieu.html').includes('href="' + PAGE + '"'), 'phần Price chưa nối sang hoạt động');
assert.ok(read('sitemap.xml').includes('https://bizonland.com/' + PAGE + '<'), 'sitemap thiếu trang');
assert.ok(s.includes('<link rel="canonical" href="https://bizonland.com/' + PAGE + '">'), 'thiếu canonical');
for (const need of ['js/bizon-clay-nav.js', 'js/bizon-clay-footer.js', 'js/bizon-clay-i18n.js', 'href="https://www.gapminder.org/dollar-street"', 'href="xuong-nhan-hieu.html"']) assert.ok(s.includes(need), 'thiếu ' + need);
assert.ok(s.includes('Đề bài © 2026 NCS. Đỗ Thùy Hương &amp; PGS.TS. Phan Anh Tú'), 'thiếu dòng ghi đề bài hai tác giả');
assert.ok(!/chương 5|chapter 5/i.test(s), 'không ghi «chương 5»');
// Câu hỏi bàn theo cặp phải nêu đúng bốn chiến lược trong Xưởng (js/xuong-nhan-hieu.js, PRICES).
for (const t of ['thâm nhập', 'ngang giá thị trường', 'giá cao theo giá trị', 'chi phí cộng lãi']) assert.ok(s.includes(t), 'thiếu chiến lược: ' + t);
// Ảnh bìa Xưởng ở trang giảng viên: bản gốc có hai khối «PLACE» trong cột 4P; bản -v2 bỏ khối thừa.
assert.ok(read('giang-vien.html').includes('src="assets/giang-vien/xuong-nhan-hieu-v2.webp"'), 'trang giảng viên còn dùng ảnh bìa có hai khối PLACE');
assert.ok(fs.existsSync(path.join(ROOT, 'assets/giang-vien/xuong-nhan-hieu-v2.webp')));
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 842);

(async () => {
  const b = await chromium.launch(); const errs = [];
  try {
    for (const [lang, h1, btn] of [['vi', 'Ai mua đặc sản của bạn, và họ chi được bao nhiêu?', '⏸ Tạm dừng'], ['en', 'Who buys your specialty, and what can they spend?', '⏸ Pause']]) {
      const ctx = await b.newContext({ viewport: { width: 360, height: 800 } });
      const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
      await pg.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
      await pg.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await pg.clock.install();
      await pg.goto(BASE + '/' + PAGE, { waitUntil: 'load', timeout: 60000 }); await pg.clock.runFor(800);
      assert.equal((await pg.textContent('h1')).trim(), h1, lang + ': tiêu đề');
      assert.equal(await pg.$$eval('#ds-steps > li.is-now', l => l.length), 0, 'chưa bấm thì chưa tô bước nào');
      await pg.click('#ds-run'); await pg.clock.runFor(70000);
      assert.equal(await pg.textContent('#ds-time'), '8:50');
      assert.equal(await pg.textContent('#ds-run'), btn, lang + ': nút đồng hồ');
      assert.match(await pg.textContent('#ds-steps > li.is-now h2'), /^2 · /, '70 giây: bước 2');
      await pg.clock.runFor(300000);
      assert.match(await pg.textContent('#ds-steps > li.is-now h2'), /^3 · /, '370 giây: bước 3');
      assert.ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), lang + ': tràn ngang ở 360 px');
      await ctx.close();
    }
  } finally { await b.close(); }
  assert.deepEqual(errs, []);
  console.log('xuong-nhan-hieu-dollar-street: ok');
})().catch(e => { console.error(e); process.exit(1); });
