/* Bảng tinh chỉnh cảnh 3D (js/tinh-chinh-3d.js, 19/11/2026): Tweakpane 4.0.5 (MIT) đóng gói ở vendor/tweakpane/.
 * Kiểm: tệp vendor đúng bản và có giấy phép; hai cảnh (Bến Phù Sa 3D, Bến BizOn) chỉ nạp bảng khi có ?tinh-chinh=1;
 * chạy thật Bến Phù Sa 3D: không có cờ thì không tải tweakpane, có cờ thì bảng hiện, đọc đúng thông số máy quay, chỉnh độ sáng
 * có tác dụng; không lỗi JS. Không đụng tệp hồ sơ quyền tác giả. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');

assert.match(read('vendor/tweakpane/tweakpane.min.js').slice(0, 120), /Tweakpane 4\.0\.5 \(c\) 2016 cocopon, licensed under the MIT license/);
assert.match(read('vendor/tweakpane/LICENSE.txt'), /cocopon[\s\S]*Permission is hereby granted, free of charge/);
assert.match(read('THIRD-PARTY-NOTICES.md'), /\*\*Tweakpane\*\* · cocopon \| 4\.0\.5 \| MIT/);
const mod = read('js/tinh-chinh-3d.js');
assert.match(mod, /export async function gan\(o\)/);
assert.match(mod, /if \(!batTinhChinh\(\)/, 'module tự kiểm cờ ?tinh-chinh=1');
for (const f of ['js/bps3d.js', 'js/ben-bizon.js'])
  assert.match(read(f), /if \(\/\[\?&\]tinh-chinh=1\(&\|\$\)\/\.test\(location\.search\)\) import\('\.\/tinh-chinh-3d\.js'\)/, f + ': chỉ nạp bảng khi có cờ');
for (const f of ['js/engine.js', 'js/app.js', 'js/backend.js', 'BizOn Game 3D.html']) assert.doesNotMatch(read(f), /tinh-chinh/, f + ': tệp hồ sơ không bị đụng');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 915, 'sw.js ≥ bizon-v915');

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    async function mo(q) {
      const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
      await ctx.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
      const p = await ctx.newPage(); const loi = [], tai = [];
      p.on('pageerror', e => loi.push(e.message)); p.on('request', r => { if (/tweakpane|tinh-chinh/.test(r.url())) tai.push(r.url()); });
      await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
      await p.route(/\.(mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await p.goto(BASE + '/ben-phu-sa-3d.html' + q, { waitUntil: 'load', timeout: 90000 });
      await p.waitForFunction(() => !!window.__bps3d, null, { timeout: 90000 });
      return { ctx, p, loi, tai };
    }
    { const { ctx, p, loi, tai } = await mo('');
      await p.waitForTimeout(1500);
      assert.deepEqual(tai, [], 'không có cờ thì không tải tweakpane hay module tinh chỉnh');
      assert.equal(await p.$('[data-tinh-chinh]'), null, 'không có cờ thì không có bảng');
      assert.deepEqual(loi, [], 'không lỗi JS: ' + loi.join(' / '));
      await ctx.close(); }
    { const { ctx, p, loi, tai } = await mo('?tinh-chinh=1');
      await p.waitForFunction(() => !!window.__tinhChinh, null, { timeout: 60000 });
      assert.ok(tai.some(u => /vendor\/tweakpane\/tweakpane\.min\.js/.test(u)), 'có cờ thì tải tweakpane đóng gói trong kho');
      const ts = await p.evaluate(() => window.__tinhChinh.thongSo());
      assert.equal(ts.camera.fov, 34, 'đọc đúng góc nhìn máy quay Bến Phù Sa 3D');
      assert.ok(ts.lights.length >= 2, 'liệt kê đèn trong cảnh (' + ts.lights.length + ')');
      const txt = await p.$eval('[data-tinh-chinh]', e => e.innerText);
      assert.match(txt, /Tinh chỉnh · Bến Phù Sa 3D/); assert.match(txt, /Hiệu năng/); assert.match(txt, /Máy quay/);
      // Chỉnh độ sáng qua bảng: gõ giá trị mới vào ô «Độ sáng»
      const o = p.locator('[data-tinh-chinh] .tp-lblv', { hasText: 'Độ sáng' }).locator('input');
      await o.fill('1.5'); await o.press('Enter'); await p.waitForTimeout(200);
      assert.equal((await p.evaluate(() => window.__tinhChinh.thongSo())).exposure, 1.5, 'chỉnh độ sáng có tác dụng');
      assert.deepEqual(loi, [], 'không lỗi JS: ' + loi.join(' / '));
      await ctx.close(); }
    console.log('tinh-chinh-3d: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
