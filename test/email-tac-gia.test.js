// Email tác giả (03/11/2026): hộp thư chung bricoleur@bizonland.com vẫn là kênh chính; thêm email hai tác giả
// (thuyhuongctu@gmail.com, patu@ctu.edu.vn) ở trang Liên hệ, Chính sách và chân trang chung – không lặp hộp thư chung.
// Trang Vũ trụ: mục nhân vật có 2 người + 1 vật phẩm nên không ghi «Ba người đồng hành».
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
const AUTH = ['thuyhuongctu@gmail.com', 'patu@ctu.edu.vn'];

for (const f of ['lien-he.html', 'chinh-sach.html', 'js/site-footer.js', 'js/bizon-clay-footer.js']) {
  const s = read(f);
  assert.ok(s.includes('mailto:bricoleur@bizonland.com'), f + ': vẫn có hộp thư chung');
  for (const e of AUTH) assert.ok(s.includes('mailto:' + e), f + ': có ' + e);
  assert.ok(s.indexOf('bricoleur@bizonland.com') < s.indexOf('thuyhuongctu@gmail.com'), f + ': hộp thư chung đứng trước');
}
const u = read('universe.html');
assert.ok(!/Ba người đồng hành|Three companions/.test(u));
assert.match(u, /Hai người dẫn đường và một cuốn hộ chiếu/);
assert.equal((u.match(/<article class="vu-card3d">/g) || []).length, 3, 'hai nhân vật + hộ chiếu');
assert.ok(+read('sw.js').match(/bizon-v(\d+)/)[1] >= 760);

let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
(async () => {
  const b = await chromium.launch(); const errs = [];
  try {
    const pg = await b.newPage({ viewport: { width: 360, height: 760 } });
    pg.on('pageerror', e => errs.push(e.message));
    await pg.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
    // Trang game có dòng «✉️ Liên hệ» cũ: chân trang chỉ ghi hộp thư chung một lần, có email tác giả, không tràn ngang
    for (const page of ['ben-phu-sa-3d.html', 'lien-he.html', 'chinh-sach.html', 'universe.html']) {
      await pg.goto(BASE + '/' + page, { waitUntil: 'load', timeout: 60000 });
      // Trang đất sét dùng #clay-footer (js/bizon-clay-footer.js); vài trang game cũ dùng #bz-footer (js/site-footer.js)
      await pg.waitForSelector('#clay-footer .cf-mail, #bz-footer .bzf-authors', { state: 'attached', timeout: 20000 });
      const r = await pg.evaluate(() => { const f = document.getElementById('clay-footer') || document.getElementById('bz-footer'), m = f.querySelector('.cf-mail, .bzf-authors');
        return { n: (f.textContent.match(/bricoleur@bizonland\.com/g) || []).length, a: m.textContent, w: document.documentElement.scrollWidth - innerWidth }; });
      assert.equal(r.n, 1, page + ': hộp thư chung ghi một lần trong chân trang');
      assert.match(r.a, /thuyhuongctu@gmail\.com[\s\S]*patu@ctu\.edu\.vn/, page);
      assert.ok(r.w <= 1, page + ': không tràn ngang ở 360 px (' + r.w + ')');
    }
  } finally { await b.close(); }
  assert.deepEqual(errs, []);
  console.log('email-tac-gia: ok');
})().catch(e => { console.error(e); process.exit(1); });
