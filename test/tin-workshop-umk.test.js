// Tin workshop giao lưu học thuật Trường Kinh tế × UM Kendari (13/11/2026), thêm vào thẻ lớp quốc tế ở trang Bằng chứng (16/11/2026):
// (21/11/2026: khung ảnh lớp Zoom .bc-zoom nằm cùng mục, không tính vào 2 ảnh workshop) đoạn tóm tắt VI/EN, đủ tên đoàn và giảng viên, 2 ảnh mới (WebP, tệp mới), ghi nguồn ảnh/bài; ảnh tải được, không tràn ngang ở 360 px.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 884);
const IMGS = ['assets/photos/umk-workshop-2026-11-13-chung-nhan.webp', 'assets/photos/umk-workshop-2026-11-13-hoi-truong.webp'];
for (const f of IMGS) { const b = fs.readFileSync(path.join(ROOT, f)); assert.equal(b.slice(8, 12).toString(), 'WEBP', f); assert.ok(b.length > 30000 && b.length < 250000, f); }
assert.ok(fs.existsSync(path.join(ROOT, 'assets/photos/umk-don-doan-2026-11-13.webp')), 'giữ ảnh đón đoàn');
(async () => {
  const b = await chromium.launch(); const errs = [];
  try {
    for (const [w, lang] of [[1280, 'vi'], [360, 'en'], [390, 'vi']]) {
      const p = await b.newPage({ viewport: { width: w, height: 900 } }); p.on('pageerror', e => errs.push(e.message));
      await p.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
      await p.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await p.goto(BASE + '/bang-chung.html', { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(800);
      const imgs = p.locator('#lop-quoc-te-umk .bc-photos:not(.bc-zoom) img');
      assert.equal(await imgs.count(), 2);
      for (let i = 0; i < 2; i++) { await imgs.nth(i).scrollIntoViewIfNeeded(); await p.waitForFunction(n => { const x = document.querySelectorAll('#lop-quoc-te-umk .bc-photos:not(.bc-zoom) img')[n]; return x.complete && x.naturalWidth === 1200; }, i, { timeout: 15000 }); }
      const c = await p.evaluate(() => { const k = document.getElementById('lop-quoc-te-umk'); return { txt: k.textContent, srcs: [...k.querySelectorAll('.bc-photos:not(.bc-zoom) img')].map(i => i.getAttribute('src')), alts: [...k.querySelectorAll('.bc-photos:not(.bc-zoom) img')].map(i => i.alt), ov: document.documentElement.scrollWidth - innerWidth, wide: [...k.querySelectorAll('.bc-photos:not(.bc-zoom) img')].some(i => i.getBoundingClientRect().width > k.getBoundingClientRect().width) }; });
      assert.deepEqual(c.srcs, IMGS);
      assert.ok(c.alts.every(a => /Kendari/.test(a)), 'alt nêu Kendari');
      for (const n of ['Sitti Rahma Ma’mun', 'Asriani', 'Titin Rahmiatin Rahim', 'Khổng Tiến Dũng', 'Phan Anh Tú', 'RLC', 'Cẩm Trắt', 'Yến Nhi']) assert.ok(c.txt.includes(n), 'thiếu ' + n);
      assert.match(c.txt, lang === 'en' ? /Academic exchange workshop · 13 November 2026/ : /Workshop giao lưu học thuật · 13\/11\/2026/);
      assert.match(c.txt, lang === 'en' ? /sustainable agricultural economics/ : /kinh tế nông nghiệp bền vững/);
      assert.ok(!c.wide, 'ảnh không rộng hơn thẻ'); assert.ok(c.ov <= 0, `tràn ngang ${c.ov}px ở ${w}`);
      await p.close();
    }
    assert.deepEqual(errs, []);
    console.log('tin-workshop-umk: ok');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
