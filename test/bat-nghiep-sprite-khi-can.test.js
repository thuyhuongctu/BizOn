/* Bật Nghiệp 3D tải tranh nhân vật khi cần (20/11/2026, lỗi 7 sau rà soát game 3D trên điện thoại; chị đồng ý sửa tệp đã nộp
 * hồ sơ, bản nộp giữ trong lịch sử git). Trước: vừa mở trang (còn ở màn đăng nhập, chưa thấy trụ sở) đã tải đủ 22 tờ sprite
 * (~3,7 MB) của 7 nhân vật. Nay:
 * - js/ben-bizon-tranh-dong.js có tuỳ chọn «cho» (chờ một Promise mới tải) và «napHet» (false: tờ còn lại chỉ tải khi cần);
 *   mặc định giữ như cũ nên Bến BizOn (hub-3d.html) không đổi;
 * - «BizOn Game 3D.html»: tranh nhân vật chờ tới khi đã vào game (app-shell hiện); mỗi vai tải trước tờ đứng + một tờ đi.
 * Không đụng js/engine.js, js/app.js, js/backend.js. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { execSync } = require('node:child_process');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const td = read('js/ben-bizon-tranh-dong.js'), g = read('BizOn Game 3D.html');
assert.ok(td.includes('giam = false, cho = null, napHet = true } = {}') && td.includes('Promise.resolve(cho).then(() => Promise.all(dau.map(napTo)))') && td.includes('if (napHet) bo.filter'), 'bộ nạp có tuỳ chọn chờ và tải dần');
assert.ok(g.includes("cho: vaoCanh, napHet: false })") && g.includes('if (booted && moCanh) { moCanh(); moCanh = null; }'), 'Bật Nghiệp chờ vào game mới tải tranh');
assert.ok(!/cho:|napHet/.test(read('js/ben-bizon.js')), 'Bến BizOn giữ cách tải cũ');
const doi = execSync('git diff --name-only origin/main -- js/engine.js js/app.js js/backend.js', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim();
assert.equal(doi, '', 'không đụng ba tệp hồ sơ js/engine.js, js/app.js, js/backend.js');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 922, 'sw.js ≥ bizon-v922');

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await ctx.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
    const p = await ctx.newPage(); const loi = [], to = [];
    p.on('pageerror', e => loi.push(e.message));
    p.on('request', r => { const m = /tranh-dong\/([\w-]+)\.webp/.exec(r.url()); if (m) to.push(m[1]); });
    await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await p.route(/\.(mp3|m4a|mp4)(\?|$)/, r => r.abort());
    await p.goto(BASE + '/BizOn%20Game%203D.html', { waitUntil: 'load', timeout: 90000 });
    await p.waitForFunction(() => window.__bn3dNhanVat && window.__bn3dNhanVat().length === 7, null, { timeout: 60000 });
    await p.waitForTimeout(6000);
    assert.deepEqual(to, [], 'màn đăng nhập: chưa tải tờ sprite nào');
    await p.waitForFunction(() => { const f = document.getElementById('gf'); return document.body.classList.contains('login3d') && f && f.contentWindow && typeof f.contentWindow.doLoginDemo === 'function' && !document.getElementById('boot'); }, null, { timeout: 60000 });
    for (let k = 0; k < 3 && await p.evaluate(() => document.body.classList.contains('login3d')); k++) { await p.locator('#l3Demo').click({ force: true }); await p.waitForTimeout(3000); }
    await p.waitForFunction(() => window.__bn3dNhanVat().every(a => a.tranh && a.tranh.sanSang), null, { timeout: 60000 });
    const luc = new Set(to).size;
    assert.ok(luc >= 7 && luc <= 16, 'vào game: tải tờ cần ngay (' + luc + ' tờ, trước đây 22)');
    assert.deepEqual(loi, [], 'không lỗi JS: ' + loi.join(' / '));
    await ctx.close();
    console.log('bat-nghiep-sprite-khi-can: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
