/* Hộ Chiếu Thương Hiệu 3D vào cảnh nhanh trên điện thoại (20/11/2026, đợt 1 sau rà soát game 3D trên điện thoại).
 * Trước đây màn nhỏ khởi đầu DPR 1,6 + bóng mềm; khung đầu ~0,5 fps và cơ chế tự hạ chỉ bắt đầu sau 4 s, mỗi bậc 2,5 s
 * (vào cảnh mất ~10 s). Nay màn nhỏ khởi đầu DPR ≤ 1,25, chưa bật bóng, đo sớm hơn; máy khỏe bật lại bóng một lần.
 * Máy tính (màn lớn) giữ nguyên như cũ. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const js = fs.readFileSync(path.join(__dirname, '..', 'bp3d.js'), 'utf8');
assert.ok(js.includes('R.setPixelRatio(Math.min(devicePixelRatio, small ? 1.25 : 1.75));'), 'màn nhỏ khởi đầu DPR ≤ 1,25');
assert.ok(js.includes('R.shadowMap.enabled = !small;'), 'màn nhỏ chưa bật bóng lúc vào cảnh');
assert.ok(js.includes("perf.s > (small ? 1.2 : 2.5)") && js.includes("t > (small ? 1.5 : 4)"), 'màn nhỏ tự hạ sớm hơn, màn lớn giữ như cũ');
assert.ok(/if \(small && !perf\.up && fps > 55[^\n]*perf\.up = true; R\.shadowMap\.enabled = true/.test(js), 'máy khỏe bật lại bóng đúng một lần');
assert.ok(+(fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8').match(/bizon-v(\d+)/) || [])[1] >= 917, 'sw.js ≥ bizon-v917');

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    for (const [w, h, dpr, mobile, ten] of [[390, 844, 3, true, 'điện thoại'], [1280, 800, 2, false, 'máy tính']]) {
      const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile });
      await ctx.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
      const p = await ctx.newPage(); const loi = []; p.on('pageerror', e => loi.push(e.message));
      await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
      await p.route(/\.(mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await p.goto(BASE + '/Ho%20Chieu%20Thuong%20Hieu%203D.html', { waitUntil: 'load', timeout: 90000 });
      await p.waitForFunction(() => window.__bp3dKiosks && window.__bp3dKiosks.R, null, { timeout: 60000 });
      const r = await p.evaluate(() => { const R = window.__bp3dKiosks.R; return { pr: R.getPixelRatio(), sh: R.shadowMap.enabled }; });
      if (mobile) { assert.ok(r.pr <= 1.25, ten + ': DPR lúc vào ≤ 1,25 (' + r.pr + ')'); assert.equal(r.sh, false, ten + ': chưa bật bóng lúc vào'); }
      else { assert.equal(r.pr, 1.75, ten + ': DPR như cũ (' + r.pr + ')'); assert.equal(r.sh, true, ten + ': có bóng như cũ'); }
      assert.deepEqual(loi, [], ten + ': không lỗi JS: ' + loi.join(' / '));
      await ctx.close();
    }
    console.log('hcth-vao-nhanh: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
