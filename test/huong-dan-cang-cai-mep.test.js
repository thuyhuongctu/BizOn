/* Trang Hướng dẫn chơi: video 3D quay trước khi có Cảng Cái Mép (#1127), nên ngay dưới video có ô «Mới: Cảng Cái Mép»
 * nói cách vào (nút 🚢 ở dải nút dưới màn hình), 5 điểm chạm, không đổi điểm số, nên ghé trước vụ 5; mục «Mẹo» có một mẹo
 * về cảng. Kiểm VI/EN, ô nằm trong mục video (không thêm mục lục), không tràn ngang ở 360/390 px, liên kết mở Bật Nghiệp 3D. */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }

const html = fs.readFileSync(path.join(ROOT, 'huong-dan.html'), 'utf8');
assert.ok(/id="cang-cai-mep-moi"/.test(html), 'có ô Cảng Cái Mép trong trang');
assert.ok((html.match(/portB:'/g) || []).length === 2 && (html.match(/portP:'/g) || []).length === 2, 'chữ của ô có cả VI và EN');
assert.ok(/Cảng Cái Mép trước vụ 5/.test(html) && /Cái Mép Port before round 5/.test(html), 'mục Mẹo có mẹo về cảng (VI/EN)');
assert.ok(+(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8').match(/bizon-v(\d+)/) || [])[1] >= 889, 'sw.js ≥ v889');

(async () => {
  const b = await chromium.launch(); const errs = [];
  try {
    for (const [lang, w, reB, reTip] of [['vi', 390, /Mới sau video: 🚢 Cảng Cái Mép/, /Cảng Cái Mép trước vụ 5/], ['en', 360, /New since the video: 🚢 Cái Mép Port/, /Cái Mép Port before round 5/], ['vi', 1280, /Cảng Cái Mép/, /Cảng Cái Mép/]]) {
      const pg = await b.newPage({ viewport: { width: w, height: 800 } }); pg.on('pageerror', e => errs.push(e.message));
      await pg.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
      await pg.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await pg.goto(BASE + '/huong-dan.html?lang=' + lang, { waitUntil: 'load', timeout: 60000 });
      await pg.waitForFunction(() => { const h = document.querySelector('#cang-cai-mep-moi strong'); return h && !/\{\{/.test(h.textContent) && h.textContent.trim(); }, null, { timeout: 15000 });
      const r = await pg.evaluate(() => {
        const box = document.getElementById('cang-cai-mep-moi'), a = box.querySelector('a'), rb = box.getBoundingClientRect(), ra = a.getBoundingClientRect();
        return { inVideo: !!box.closest('#video-3d'), afterVideo: !!box.previousElementSibling && box.previousElementSibling.tagName === 'VIDEO',
          head: box.querySelector('strong').textContent, text: box.textContent, href: a.getAttribute('href'), aH: ra.height,
          tips: document.querySelector('#meo').textContent, toc: document.querySelectorAll('nav[aria-label="Mục lục"] a').length,
          over: document.documentElement.scrollWidth - innerWidth, boxIn: rb.right <= innerWidth + 1 };
      });
      assert.ok(r.inVideo && r.afterVideo, lang + ': ô cảng nằm ngay dưới video, trong mục video');
      assert.match(r.head, reB, lang + ' tiêu đề ô');
      assert.match(r.tips, reTip, lang + ' mẹo về cảng');
      assert.ok(/5/.test(r.text) && (lang === 'vi' ? /không đổi điểm/.test(r.text) : /does not change/.test(r.text)), lang + ': ô nói 5 điểm chạm và không đổi điểm số');
      assert.equal(r.href, 'BizOn Game 3D.html', 'liên kết mở Bật Nghiệp 3D');
      assert.ok(r.aH >= 44, 'nút ≥ 44 px (' + r.aH + ')');
      assert.equal(r.toc, 9, 'mục lục giữ 9 mục');
      assert.ok(r.over <= 0 && r.boxIn, `${lang} ${w}px tràn ngang ${r.over}px`);
      await pg.close();
    }
    assert.deepEqual(errs, []);
    console.log('huong-dan-cang-cai-mep: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
