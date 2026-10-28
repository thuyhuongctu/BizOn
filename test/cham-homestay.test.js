// Tình huống CHAM Homestay (28/10/2026): tài sản riêng của Đỗ Thùy Hương, BizOn dùng theo giấy phép không độc quyền.
// Trang có dòng giấy phép, noindex, song ngữ, nêu đúng quyết định công nhận xã đảo; lối vào từ trang giảng viên.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const s = read('cham-homestay.html');
assert.ok(s.includes('<meta name="robots" content="noindex">'), 'trang tình huống để noindex tới khi nộp nhãn hiệu');
assert.ok(s.includes('© 2026 Đỗ Thùy Hương, dùng trên BizOn theo giấy phép không độc quyền'), 'thiếu dòng giấy phép');
assert.ok(!/®/.test(s), 'chưa có văn bằng, không được dùng ®');
assert.ok(s.includes('3972/QĐ-UBND') && s.includes('07/8/2026'), 'thiếu căn cứ công nhận xã đảo');
for (const need of ['js/bizon-clay-nav.js', 'js/bizon-clay-footer.js', 'js/bizon-clay-i18n.js']) assert.ok(s.includes(need), 'thiếu ' + need);
assert.ok(read('giang-vien.html').includes('href="cham-homestay.html"'), 'trang giảng viên chưa có lối vào');
assert.ok(read('docs/ho-so-so-huu-tri-tue.md').includes('## D4 · CHAM Homestay'), 'hồ sơ SHTT chưa ghi giấy phép CHAM');
assert.ok(read('cham-homestay.html').includes('href="https://doi.org/10.5281/zenodo.23720576"'), 'trang tình huống chưa có DOI Zenodo');
assert.ok(read('cham-homestay.html').includes('src="assets/geo/tan-loc-clay.svg"'), 'trang tình huống chưa có bản đồ cù lao');
assert.ok(read('assets/geo/tan-loc-clay.svg').includes('OpenStreetMap'), 'bản đồ thiếu ghi nguồn OpenStreetMap');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 704);
(async () => {
  const b = await chromium.launch(); const errs = [];
  try {
    for (const [lang, want] of [['vi', 'Câu hỏi thảo luận'], ['en', 'Discussion questions']]) {
      const pg = await b.newPage({ viewport: { width: 390, height: 844 } }); pg.on('pageerror', e => errs.push(e.message));
      await pg.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
      await pg.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await pg.goto(BASE + '/cham-homestay.html', { waitUntil: 'load', timeout: 60000 }); await pg.waitForTimeout(800);
      assert.equal(await pg.textContent('#cau-hoi h2'), want, lang + ': tiêu đề câu hỏi');
      assert.equal(await pg.$$eval('#cau-hoi li', l => l.length), 6);
      assert.ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), lang + ': tràn ngang trên điện thoại');
      await pg.close();
    }
  } finally { await b.close(); }
  assert.deepEqual(errs, []);
  console.log('cham-homestay: ok');
})().catch(e => { console.error(e); process.exit(1); });
