// 22/11/2026: chị gửi đường dẫn kênh YouTube BizOnland (youtube.com/@jemappellehuong) để thêm nút «Kênh YouTube BizOnland»
// trên bizonland.com. Nút nằm ở chân trang dùng chung (js/bizon-clay-footer.js, ngay dưới nút Google Play) nên có trên mọi
// trang bản đất sét, kể cả trang chủ; chân trang cũ (js/site-footer.js) có thêm một dòng. Đường dẫn bỏ tham số theo dõi ?si=.
'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const YT = 'https://www.youtube.com/@jemappellehuong';
for (const f of ['js/bizon-clay-footer.js', 'js/site-footer.js']) {
  const s = read(f);
  assert.ok(s.includes(YT) && s.includes('Kênh YouTube BizOnland') && s.includes('BizOnland on YouTube'), f + ': có nút kênh YouTube VI/EN');
  assert.ok(!/youtube\.com\/@jemappellehuong\?si=/.test(s), f + ': không giữ tham số theo dõi ?si=');
}
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 952, 'sw.js ≥ v952');

(async () => {
  const b = await chromium.launch();
  try {
    for (const [url, lang, w, sel] of [['/index.html', 'vi', 360, '#clay-footer a.cf-yt'], ['/index.html', 'en', 1280, '#clay-footer a.cf-yt'], ['/am-nhac.html', 'vi', 390, '#clay-footer a.cf-yt'], ['/ben-phu-sa-3d.html', 'vi', 390, '#bz-footer a[href="' + YT + '"]']]) {
      const ctx = await b.newContext({ viewport: { width: w, height: 800 }, serviceWorkers: 'block' });
      const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); localStorage.setItem('bizon-tour-seen', '1'); } catch (e) {} }, lang);
      await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
      await p.route(/\.(woff2?|mp3|m4a|mp4|glb)(\?|$)/, r => r.abort());
      await p.goto(BASE + url, { waitUntil: 'load', timeout: 60000 });
      await p.waitForSelector(sel, { state: 'attached', timeout: 20000 }); await p.waitForTimeout(400);
      const r = await p.$eval(sel, a => { a.scrollIntoView(); const q = a.getBoundingClientRect(); return { href: a.href, t: a.target, rel: a.rel, txt: a.textContent.trim(), h: q.height, right: q.right, vw: innerWidth, over: document.documentElement.scrollWidth - innerWidth }; });
      const tag = url + ' ' + lang + ' ' + w;
      assert.equal(r.href, YT, tag + ': đúng đường dẫn kênh');
      assert.ok(r.t === '_blank' && /noopener/.test(r.rel), tag + ': mở thẻ mới, rel=noopener');
      assert.match(r.txt, lang === 'en' ? /BizOnland on YouTube/ : /Kênh YouTube BizOnland/, tag + ': chữ đúng ngôn ngữ');
      if (sel.includes('cf-yt')) assert.ok(r.h >= 44, tag + ': vùng chạm ≥ 44 px (' + r.h + ')');
      assert.ok(r.right <= r.vw + 1 && r.over <= 0, tag + ': không tràn ngang');
      assert.deepEqual(errs, [], tag + ': không lỗi JS');
      await ctx.close();
    }
    console.log('kenh-youtube: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
