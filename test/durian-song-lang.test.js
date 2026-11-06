/* Hộ Chiếu Sầu Riêng 2D và 3D: giao diện tiếng Anh mở bài tiếng Anh, tiếng Việt mở bài tiếng Việt.
 * Chạy thật bằng Playwright: đặt bizon-lang rồi mở trang, xem nguồn nhạc nền; bấm đổi ngôn ngữ thì bài đổi theo. */
'use strict';
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  try {
    // 2D
    for (const lang of ['vi', 'en']) {
      const ctx = await b.newContext(); const p = await ctx.newPage();
      await p.addInitScript(l => { localStorage.setItem('bizon-lang', l); localStorage.setItem('durian_track', l === 'en' ? 'vi2' : 'en'); }, lang);
      await p.goto(BASE + '/lab/ho-chieu-sau-rieng.html'); await p.waitForTimeout(500);
      const src = await p.evaluate(() => document.getElementById('bgm').src);
      check(lang === 'en' ? /durian-passport\.mp3$/.test(src) : /huong-ngot-phu-sa\.mp3$/.test(src), '2D ' + lang + ': mở bài đúng ngôn ngữ dù bài lưu khác ' + src.split('/').pop());
      await p.click(lang === 'en' ? '#langVI' : '#langEN'); await p.waitForTimeout(200);
      const src2 = await p.evaluate(() => document.getElementById('bgm').src);
      check(lang === 'en' ? /huong-ngot-phu-sa\.mp3$/.test(src2) : /durian-passport\.mp3$/.test(src2), '2D: đổi ngôn ngữ thì bài đổi theo ' + src2.split('/').pop());
      await ctx.close();
    }
    // 3D
    for (const lang of ['vi', 'en']) {
      const ctx = await b.newContext({ viewport: { width: 900, height: 600 } }); const p = await ctx.newPage();
      await p.addInitScript(l => { localStorage.setItem('bizon-lang', l); }, lang);
      await p.goto(BASE + '/lab/ho-chieu-sau-rieng-3d.html');
      // Chờ trang áp xong ngôn ngữ đã lưu (state.ready, sau khi tải three.js và dựng cảnh); __hsr3d có sớm hơn, lúc lang còn là «vi» mặc định.
      await p.waitForFunction(l => window.__hsr3d && window.__hsr3d.state.ready && window.__hsr3d.state.lang === l, lang, { timeout: 90000 });
      const r = await p.evaluate(l => { const c = window.__hsr3d; const K = c.K; localStorage.setItem(K + 'song2', JSON.stringify({ i: l === 'en' ? 0 : 2, t: 30 })); c.au = null; const a = c.songEl(); return a.src; }, lang);
      check(lang === 'en' ? /durian-passport\.mp3$/.test(r) : /huong-ngot-phu-sa\.mp3$/.test(r), '3D ' + lang + ': mở bài đúng ngôn ngữ dù bài lưu khác ' + r.split('/').pop());
      const r2 = await p.evaluate(l => { const c = window.__hsr3d; c.setState({ lang: l }); c.songLang(l); return c.au.src; }, lang === 'en' ? 'vi' : 'en');
      check(lang === 'en' ? /huong-ngot-phu-sa\.mp3$/.test(r2) : /durian-passport\.mp3$/.test(r2), '3D: đổi ngôn ngữ thì bài đổi theo ' + r2.split('/').pop());
      await ctx.close();
    }
  } catch (e) { check(false, 'lỗi khi chạy: ' + e.message); }
  await b.close();
  if (fails) { console.log('durian-song-lang: ' + fails + ' lỗi'); process.exit(1); }
  console.log('durian-song-lang: ok');
})();
