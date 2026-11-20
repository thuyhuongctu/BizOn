/* Bến Phù Sa 3D nhẹ hơn trên điện thoại (20/11/2026, đợt 2 sau rà soát game 3D trên điện thoại).
 * Trước: DPR 2, bóng 2048, không tự hạ chất lượng, duyệt cả cảnh mỗi khung, vẫn vẽ đủ 60 khung khi khung 3D bị bảng che
 * hay đang ẩn – FPS thấp nhất trong 4 game 3D. Nay:
 * - điện thoại (cạnh ngắn < 600 px): DPR ≤ 1,25, bóng 1024; máy tính giữ DPR 2, bóng 2048;
 * - tự hạ: dưới 38 khung/giây thì giảm DPR rồi tắt bóng (như Hộ Chiếu Thương Hiệu 3D);
 * - vật có hoạt cảnh được gom mỗi giây một lần, không duyệt cảnh mỗi khung;
 * - khung 3D ẩn (chưa vào ván) thì không vẽ; bị che kín (bảng chơi, ảnh sa bàn, thẻ đăng nhập) thì vẽ thưa. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const js = fs.readFileSync(path.join(__dirname, '..', 'js/bps3d.js'), 'utf8');
assert.ok(js.includes('renderer.setPixelRatio(Math.min(nho ? 1.25 : 2, devicePixelRatio));'), 'điện thoại DPR ≤ 1,25');
assert.ok(js.includes('sun.shadow.mapSize.set(nho ? 1024 : 2048, nho ? 1024 : 2048);'), 'điện thoại bóng 1024');
assert.ok(!/^\s*scene\.traverse\(o => \{\n\s*if \(o\.userData\.bob/m.test(js) && js.includes('if (t - dongT > 1)'), 'không duyệt cả cảnh mỗi khung');
assert.ok(/if \(fps < 38 && t > \(nho \? 1\.5 : 4\)\)/.test(js), 'có tự hạ chất lượng');
assert.ok(+(fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8').match(/bizon-v(\d+)/) || [])[1] >= 919, 'sw.js ≥ bizon-v919');

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    for (const [w, h, dpr, mobile, ten] of [[390, 844, 3, true, 'điện thoại'], [1280, 800, 2, false, 'máy tính']]) {
      const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile });
      await ctx.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
      const p = await ctx.newPage(); const loi = []; p.on('pageerror', e => loi.push(e.message));
      await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
      await p.route(/\.(mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await p.goto(BASE + '/ben-phu-sa-3d.html', { waitUntil: 'load', timeout: 90000 });
      await p.waitForFunction(() => window.__bps3d && window.__bps3d.chatLuong, null, { timeout: 60000 });
      await p.waitForTimeout(1200);
      const a = await p.evaluate(() => window.__bps3d.chatLuong);
      if (mobile) { assert.ok(a.pr <= 1.25, ten + ': DPR ≤ 1,25 (' + a.pr + ')'); assert.equal(a.bongCo, 1024, ten + ': bóng 1024'); }
      else { assert.equal(a.pr, 2, ten + ': DPR 2 như cũ'); assert.equal(a.bongCo, 2048, ten + ': bóng 2048 như cũ'); }
      assert.equal(a.biChe, 'an', ten + ': chưa vào ván (khung 3D ẩn) thì không vẽ');
      // Vào ván: khung 3D hiện, giữa khung là cảnh 3D → vẽ đủ, có danh sách vật hoạt cảnh
      await p.evaluate(() => { const f = document.getElementById('ft-play'); if (f) f.classList.remove('hidden'); const g = document.getElementById('g3d-gate'); if (g) g.style.display = 'none'; });
      await p.waitForTimeout(1200);
      // Ảnh sa bàn phủ kín khung 3D thì cảnh 3D không lộ ra: vẽ thưa; tắt sa bàn (về 3D) thì vẽ đủ
      const sb = await p.evaluate(() => { const s = document.getElementById('bps-saban'); return !!(s && getComputedStyle(s).display !== 'none'); });
      if (sb) { assert.equal((await p.evaluate(() => window.__bps3d.chatLuong)).biChe, true, ten + ': ảnh sa bàn phủ kín thì vẽ thưa');
        await p.evaluate(() => document.getElementById('bps-saban').style.display = 'none'); }
      await p.waitForTimeout(2000);
      const c = await p.evaluate(() => window.__bps3d.chatLuong);
      assert.equal(c.biChe, false, ten + ': vào ván, khung 3D không bị che thì vẽ đủ ' + JSON.stringify(c));
      assert.ok(c.dong > 5, ten + ': gom được vật hoạt cảnh (' + c.dong + ')');
      // Phủ một tấm che giữa khung: vẽ thưa
      await p.evaluate(() => { const d = document.createElement('div'); d.id = 'che-thu'; d.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#fff'; document.body.appendChild(d); });
      await p.waitForTimeout(1200);
      assert.equal((await p.evaluate(() => window.__bps3d.chatLuong)).biChe, true, ten + ': bị che thì vẽ thưa');
      assert.deepEqual(loi, [], ten + ': không lỗi JS: ' + loi.join(' / '));
      await ctx.close();
    }
    console.log('bps3d-nhe: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
