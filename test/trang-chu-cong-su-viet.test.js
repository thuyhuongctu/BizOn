// Trang chủ có thẻ dẫn sang Cổng Trò Chơi Sử Việt (13/11/2026), đặt ngay dưới thẻ «Âm nhạc». Cổng game là sản phẩm
// riêng của tác giả Đỗ Thùy Hương, nằm ngoài BizOn: thẻ phải nói rõ điều đó, mở tab mới, có bản VI/EN, không tràn ngang
// ở 360 px. index.html và academia3d-v2.html giống hệt nhau nên thẻ có ở cả hai.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..');
const URL_CONG = 'https://thuyhuongctu.github.io/Vietnamese-History-Games/';
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 854);
assert.equal(read('index.html'), read('academia3d-v2.html'), 'index.html phải giống hệt academia3d-v2.html');
assert.ok(fs.existsSync(path.join(ROOT, 'assets/covers/cong-tro-choi-su-viet.webp')), 'thiếu ảnh bìa thẻ cổng game');
for (const f of ['index.html', 'academia3d-v2.html']) {
  const html = read(f);
  assert.equal((html.match(/id="hp-su-viet"/g) || []).length, 1, f + ': phải có đúng một thẻ cổng game sử Việt');
  assert.match(html, /href="https:\/\/thuyhuongctu\.github\.io\/Vietnamese-History-Games\/" target="_blank" rel="noopener"/, f);
}

(async () => {
  const b = await chromium.launch(); const errs = [];
  const open = async (lang, width) => {
    const pg = await b.newPage({ viewport: { width, height: 900 } }); pg.on('pageerror', e => errs.push(e.message));
    await pg.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
    await pg.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
    await pg.goto(BASE + '/index.html', { waitUntil: 'load', timeout: 60000 });
    await pg.waitForSelector('#hp-su-viet', { timeout: 15000 });
    await pg.waitForTimeout(300);
    return pg;
  };
  const info = pg => pg.evaluate(() => {
    const a = document.getElementById('hp-su-viet'), r = a.getBoundingClientRect(), img = a.querySelector('img');
    const prev = a.previousElementSibling;
    return {
      href: a.getAttribute('href'), target: a.getAttribute('target'), rel: a.getAttribute('rel'), text: a.textContent,
      w: r.width, h: r.height, imgOk: !!(img && img.complete && img.naturalWidth > 0) || (img && img.loading === 'lazy'),
      afterMusic: !!(prev && prev.getAttribute('href') === 'am-nhac.html'),
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
  try {
    let pg = await open('vi', 1280);
    let r = await info(pg);
    assert.equal(r.href, URL_CONG);
    assert.equal(r.target, '_blank'); assert.match(r.rel || '', /noopener/);
    assert.ok(r.afterMusic, 'thẻ cổng game phải nằm ngay sau thẻ Âm nhạc');
    assert.match(r.text, /Cổng Trò Chơi Sử Việt/);
    assert.match(r.text, /ngoài BizOn/);
    assert.match(r.text, /Vân Đồn 1149/);
    assert.ok(r.h > 0 && r.w > 0);
    await pg.close();

    pg = await open('en', 1280);
    r = await info(pg);
    assert.match(r.text, /Vietnamese History Game Portal/);
    assert.match(r.text, /outside BizOn/);
    assert.match(r.text, /Open the history games/);
    await pg.close();

    for (const lang of ['vi', 'en']) {
      pg = await open(lang, 360);
      r = await info(pg);
      assert.ok(r.overflow <= 1, lang + ': tràn ngang ' + r.overflow + 'px ở 360 px');
      assert.ok(r.w <= 360, lang + ': thẻ rộng hơn màn hình');
      await pg.close();
    }
    assert.deepEqual(errs, []);
    console.log('trang-chu-cong-su-viet: OK');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
