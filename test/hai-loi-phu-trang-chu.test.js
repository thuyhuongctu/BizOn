/* Hai lối phụ dưới ba cửa trang chủ (20/11/2026, chị góp ý hai dòng gạch chân «Giảng viên: thử lớp demo…» và
 * «▶ Xem video Bật Nghiệp 3D» trông xấu): thành hai viên đất sét cạnh nhau, có biểu tượng tròn, chữ chính và chú thích.
 * Kiểm ở 360, 390, 1280 px, VI/EN, sáng/tối: cùng một hàng, cao ≥ 44 px, không gạch chân, chữ không tràn khỏi viên,
 * trang không tràn ngang; bấm viên video mở hộp trailer; index.html giống hệt academia3d-v2.html. */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 930, 'sw.js ≥ v930');
assert.equal(read('index.html'), read('academia3d-v2.html'), 'index.html giống hệt academia3d-v2.html');
const html = read('index.html');
assert.ok(!/Giảng viên: thử lớp demo/.test(html), 'không còn dòng chữ gạch chân cũ');
assert.match(html, /data-door-extra="giang-vien"[^>]*><span class="hp-more-i"/, 'viên lớp demo có biểu tượng');
assert.match(html, /data-door-extra="khach"[^>]*><span class="hp-more-i play"/, 'viên video có nút phát');

(async () => {
  const b = await chromium.launch();
  try {
    for (const w of [360, 390, 1280]) for (const lang of ['vi', 'en']) for (const theme of ['light', 'dark']) {
      const p = await b.newPage({ viewport: { width: w, height: 844 }, colorScheme: theme }), errs = [];
      p.on('pageerror', e => errs.push(e.message));
      await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
      await p.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await p.addInitScript(([l, t]) => { localStorage.setItem('bizon-lang', l); localStorage.setItem('bizon-theme', t); }, [lang, theme]);
      await p.goto(BASE + '/index.html?lang=' + lang, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(500);
      const tag = w + ' ' + lang + ' ' + theme;
      const chips = await p.$$eval('#ba-cua .hp-door-more a', as => as.map(a => {
        const r = a.getBoundingClientRect(), cs = getComputedStyle(a);
        const over = [...a.querySelectorAll('.hp-more-t,.hp-more-d')].some(x => { const q = x.getBoundingClientRect(); return q.right > r.right - 4 || q.left < r.left; });
        return { top: Math.round(r.top), h: r.height, line: cs.textDecorationLine, bg: cs.backgroundColor, over, t: a.textContent.trim() };
      }));
      assert.equal(chips.length, 2, tag + ': hai viên');
      assert.equal(chips[0].top, chips[1].top, tag + ': hai viên cùng một hàng');
      for (const c of chips) {
        assert.ok(c.h >= 44, tag + ': viên cao ≥ 44 px');
        assert.ok(!/underline/.test(c.line), tag + ': không gạch chân');
        assert.ok(!/rgba\(0, 0, 0, 0\)/.test(c.bg), tag + ': có nền đặc');
        assert.ok(!c.over, tag + ': chữ không tràn khỏi viên: ' + c.t);
      }
      if (lang === 'en') assert.ok(chips.every(c => !/Không|Xem /.test(c.t)), tag + ': đã dịch: ' + chips.map(c => c.t).join(' | '));
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth) <= w, tag + ': không tràn ngang');
      if (w === 390 && theme === 'light') {
        await p.click('#ba-cua [data-door-extra="khach"] .hp-more-t');
        assert.ok(await p.$eval('#hp-trailer', d => d.open), tag + ': bấm chữ trong viên video vẫn mở hộp trailer');
      }
      assert.deepEqual(errs, [], tag + ': không lỗi JS');
      await p.close();
    }
    console.log('hai-loi-phu-trang-chu: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
