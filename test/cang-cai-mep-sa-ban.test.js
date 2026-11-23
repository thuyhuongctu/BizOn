// 23/11/2026: chị thấy «Cảng Cái Mép trong game cũng như cũ» và chọn phương án A – đưa ảnh sa bàn «Cảng Cái Mép – Thị Vải»
// (assets/hc/sa-ban/cang-cai-mep-thi-vai.webp, dùng chung với Hộ Chiếu Sầu Riêng) vào khu cảng của Bật Nghiệp 3D:
// một bàn sa bàn lớn giữa bến, chạm vào mở thẻ «Sa bàn», và ảnh này làm ảnh đầu mọi thẻ kiến thức của cảng.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const ANH = 'assets/hc/sa-ban/cang-cai-mep-thi-vai.webp';
const mod = read('js/cang-cai-mep-3d.js');
assert.ok(fs.existsSync(R(ANH)), 'ảnh sa bàn có trong kho');
assert.ok(mod.includes("'" + ANH + "'") && /cm_saban_face/.test(mod) && /cmKey = 'saban'/.test(mod), 'mô-đun cảng dựng bàn sa bàn từ ảnh');
assert.ok(!/cang-cai-mep/.test(read('js/engine.js')), 'không chạm luật chơi');
assert.ok(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 963, 'sw.js ≥ v963');

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    for (const [lang, w, h] of [['vi', 390, 844], ['en', 1280, 800]]) {
      const tag = lang + ' ' + w;
      const ctx = await b.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block' });
      const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
      await p.addInitScript(l => { try { localStorage.clear(); localStorage.setItem('bizon-lang', l); localStorage.setItem('bizon-tour-seen', '1'); } catch (e) {} }, lang);
      await p.route(/\.(woff2?|mp3|m4a|mp4|glb)(\?|$)/, r => r.abort());
      await p.goto(BASE + '/BizOn%20Game%203D.html?diorama=1', { waitUntil: 'commit', timeout: 60000 });
      await p.waitForFunction(() => window.__caiMep && window.__caiMep.port, null, { timeout: 90000 });
      await p.waitForFunction(() => document.body.classList.contains('login3d'), null, { timeout: 45000 }).catch(() => {});
      for (let i = 0; i < 40 && await p.evaluate(() => document.body.classList.contains('login3d')); i++) { await p.evaluate(() => { const d = document.getElementById('l3Demo'); d && d.click(); }); await p.waitForTimeout(1000); }
      await p.waitForTimeout(1500);
      await p.evaluate(() => { const x = [...document.querySelectorAll('#zones button')].find(x => /Cái Mép/.test(x.textContent)); x && x.click(); });
      await p.waitForTimeout(3000);
      // Ảnh đã nạp vào mặt bàn sa bàn, và tâm bàn nằm trong khung hình khi bay tới cảng (cả điện thoại)
      await p.waitForFunction(() => { const m = window.__caiMep.sabanFace.material.map; return m && m.image && m.image.width > 0; }, null, { timeout: 20000 });
      const pt = await p.evaluate(() => { const K = window.__caiMep, f = K.sabanFace, v = f.getWorldPosition(new f.position.constructor()); v.project(K.camera);
        return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight, vao: Math.abs(v.x) < 0.9 && Math.abs(v.y) < 0.9 && v.z < 1, src: f.material.map.image.src || f.material.map.image.currentSrc || '' }; });
      assert.ok(pt.vao, tag + ': bàn sa bàn nằm trong khung hình khi bấm «Cảng Cái Mép»');
      assert.ok(pt.src.endsWith('cang-cai-mep-thi-vai.webp'), tag + ': mặt bàn là ảnh sa bàn');
      // Chạm vào bàn sa bàn thì mở thẻ «Sa bàn» có ảnh lớn
      await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(500);
      const the = await p.evaluate(() => { const c = document.getElementById('cmCard'); const i = c.querySelector('img.cm-img');
        return { k: c.dataset.k, mo: !c.hidden, img: i ? i.getAttribute('src') : '', h4: (c.querySelector('h4') || {}).textContent || '' }; });
      assert.equal(the.k, 'saban', tag + ': chạm bàn sa bàn mở thẻ sa bàn');
      assert.ok(the.mo && the.img === 'assets/hc/sa-ban/cang-cai-mep-thi-vai.webp', tag + ': thẻ có ảnh sa bàn');
      assert.match(the.h4, lang === 'en' ? /port diorama/ : /Sa bàn Cảng Cái Mép/, tag + ': tiêu đề đúng ngôn ngữ');
      // Năm thẻ kiến thức của cảng đều có ảnh đầu là sa bàn, ảnh đã tải xong
      const dau = await p.evaluate(async () => { const K = window.__caiMep, out = [];
        for (const k of K.keys) { K.open(k); const i = document.querySelector('#cmCard img.cm-img'); if (i && !i.complete) await new Promise(r => { i.onload = i.onerror = r; }); out.push(!!i && i.naturalWidth > 0); }
        K.close(); return out; });
      assert.deepEqual(dau, [true, true, true, true, true], tag + ': năm thẻ kiến thức có ảnh đầu');
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1, tag + ': không tràn ngang');
      assert.deepEqual(errs, [], tag + ': không lỗi JS');
      await ctx.close();
    }
    console.log('cang-cai-mep-sa-ban: đạt');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
