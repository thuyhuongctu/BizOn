// Tin mới lớp quốc tế UM Kendari (15/11/2026): dòng «Tin mới» ở trang chủ dẫn tới thẻ lớp ở trang Bằng chứng;
// thẻ lớp có ảnh thật PGS.TS. Phan Anh Tú đón đoàn (13/11/2026), ngày buổi chơi 19/11/2026, link video và game; không tràn ngang ở 360 px.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 872);
assert.equal(read('index.html'), read('academia3d-v2.html'), 'index.html giống hệt academia3d-v2.html');
const IMG = 'assets/photos/umk-don-doan-2026-11-13.webp';
const b0 = fs.readFileSync(path.join(ROOT, IMG));
assert.equal(b0.slice(8, 12).toString(), 'WEBP'); assert.ok(b0.length > 30000 && b0.length < 300000);

(async () => {
  const b = await chromium.launch(); const errs = [];
  try {
    for (const [w, lang] of [[1280, 'vi'], [360, 'en'], [390, 'vi']]) {
      const p = await b.newPage({ viewport: { width: w, height: 900 } }); p.on('pageerror', e => errs.push(e.message));
      await p.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
      await p.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await p.goto(BASE + '/index.html', { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(800);
      const h = await p.evaluate(() => { const a = document.querySelector('.hp-hero .hp-news'); const r = a.getBoundingClientRect(); return { href: a.getAttribute('href'), t: a.textContent, vis: r.width > 0 && r.top < innerHeight, ov: document.documentElement.scrollWidth - innerWidth }; });
      assert.equal(h.href, 'bang-chung.html#lop-quoc-te-umk');
      assert.match(h.t, lang === 'en' ? /^New19 Nov 2026 · 160 students from UM Kendari/ : /^Tin mới19\/11\/2026 · 160 sinh viên UM Kendari/);
      assert.ok(h.vis, 'tin mới hiện ngay màn đầu'); assert.ok(h.ov <= 0, `trang chủ tràn ngang ${h.ov}px ở ${w}`);
      await p.goto(BASE + '/bang-chung.html', { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(800);
      await p.locator('#lop-quoc-te-umk .bc-photo img').scrollIntoViewIfNeeded();
      await p.waitForFunction(() => { const i = document.querySelector('#lop-quoc-te-umk .bc-photo img'); return i.complete && i.naturalWidth > 0; }, null, { timeout: 15000 });
      const c = await p.evaluate(() => { const k = document.getElementById('lop-quoc-te-umk'), img = k.querySelector('.bc-photo img'); return { src: img.getAttribute('src'), nw: img.naturalWidth, alt: img.alt, cap: k.querySelector('figcaption').textContent, links: [...k.querySelectorAll('a')].map(a => a.getAttribute('href')), txt: k.textContent, ov: document.documentElement.scrollWidth - innerWidth, iw: img.getBoundingClientRect().width, kw: k.getBoundingClientRect().width }; });
      assert.equal(c.src, IMG); assert.equal(c.nw, 1039, 'ảnh tải được');
      assert.match(c.alt, /Phan Anh Tú/); assert.match(c.cap, lang === 'en' ? /13 November 2026/ : /13\/11\/2026/);
      assert.match(c.txt, lang === 'en' ? /Thursday 19 November 2026/ : /thứ Năm 19\/11\/2026/);
      assert.deepEqual(c.links, ['huong-dan.html?lang=en#video-3d', 'BizOn%20Game%203D.html?lang=en']);
      assert.ok(c.iw <= c.kw, 'ảnh không rộng hơn thẻ'); assert.ok(c.ov <= 0, `bang-chung tràn ngang ${c.ov}px ở ${w}`);
      await p.close();
    }
    assert.deepEqual(errs, []);
    console.log('tin-moi-umk: ok');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
