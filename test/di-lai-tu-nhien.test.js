// Đi lại tự nhiên (03/11/2026, học từ các game đi lại 3D như «chùa online»):
// 1. Hub clay dùng chung (js/clay-hub.js): vận tốc có gia tốc/giảm tốc, nhịp bước theo quãng đường, quay mặt mượt,
//    lớp theo chiều sâu (z-index = y), bụi chân, NPC nghiêng về phía người chơi; tôn trọng prefers-reduced-motion.
// 2. Bến Phù Sa 3D (js/bps3d.js): ghe không nhảy vòng cung nữa – quay mũi (+x) về hướng đi rồi trượt, có vệt sóng;
//    người gánh bước theo nhịp chân; lệnh đi mới thay lệnh cũ (không giằng co).
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';

const hub = read('js/clay-hub.js'), sc = read('js/bps3d.js');
assert.match(hub, /MAXSP = 380, ACC = 2200, STEP_PX = 46/);
assert.match(hub, /phase \+= moved \/ STEP_PX \* Math\.PI/, 'nhịp bước theo quãng đường');
assert.match(hub, /player\.style\.zIndex = Math\.round\(py\)/);
assert.match(hub, /prefers-reduced-motion/);
assert.ok(!/Math\.sin\(k \* Math\.PI\) \* 1\.2/.test(sc), 'ghe không còn nhảy vòng cung');
assert.match(sc, /obj\.userData\.kind === 0 \? y - Math\.PI \/ 2 : y/, 'mũi ghe ở +x');
assert.match(sc, /g\.userData\.kind = kind; scene\.add\(g\)/);
const sw = read('sw.js'); assert.ok(+sw.match(/bizon-v(\d+)/)[1] >= 758);

let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errors = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, serviceWorkers: 'block' });
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
    await page.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
    await page.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); localStorage.setItem('bizon-bps-tour-seen', '1'); sessionStorage.setItem('bps-hs', '1'); } catch (e) {} });
    await page.goto(BASE + '/ben-phu-sa-3d.html', { waitUntil: 'load', timeout: 60000 });
    await page.waitForFunction(() => window.__bps3d && window.__bps, null, { timeout: 60000 });

    // ---- 1. Hub clay
    await page.evaluate(() => window.BPSHub.open());
    await page.waitForSelector('#chub .pl');
    const pos = () => page.evaluate(() => { const p = document.querySelector('#chub .pl'); return { x: parseFloat(p.style.left), y: parseFloat(p.style.top), z: +p.style.zIndex, tf: document.querySelector('#chub .pi').style.transform }; });
    await page.waitForFunction(() => window.ClayHub.state() && document.querySelector('#chub .pl').style.left !== '');
    // Vận tốc thật bên trong hub: khởi hành từ 0, tăng dần tới trần 380 px/s (không nhảy tức thì)
    await page.keyboard.down('d');
    await page.waitForFunction(() => window.ClayHub.state().vx > 0);
    const v1 = await page.evaluate(() => window.ClayHub.state().vx);
    assert.ok(v1 < 300, 'khung đầu chưa đạt trần (vx = ' + v1.toFixed(0) + ')');
    await page.waitForFunction(() => window.ClayHub.state().vx >= 379, null, { timeout: 15000 });
    assert.ok(await page.evaluate(() => window.ClayHub.state().vx) <= 380.01, 'không vượt trần');
    await page.waitForTimeout(150); const p2 = await pos();
    assert.match(p2.tf, /rotate\(/, 'có lắc vai khi đi');
    // Thả phím: vận tốc giảm dần qua các giá trị trung gian rồi mới về 0 (trượt thêm một đoạn ngắn)
    const xUp = await page.evaluate(() => window.ClayHub.state().x);
    await page.keyboard.up('d');
    await page.waitForFunction(() => window.ClayHub.state().vx === 0, null, { timeout: 15000 });
    const p4 = await pos(), slid = (await page.evaluate(() => window.ClayHub.state().x)) - xUp;
    assert.ok(slid > 3 && slid < 80, 'giảm tốc trượt thêm một đoạn ngắn, không khựng (' + slid.toFixed(1) + ' px)');
    assert.equal(p4.z, Math.round(p4.y), 'z-index theo chiều sâu');
    const npcZ = await page.$$eval('#chub [data-id]', els => els.map(e => +e.style.zIndex));
    assert.ok(npcZ.length && npcZ.every(z => z >= 300), 'NPC/trạm có z theo y');
    await page.waitForTimeout(1200);
    assert.ok(await page.evaluate(() => document.querySelectorAll('#chub .dust').length === 0), 'bụi chân tự dọn');
    await page.evaluate(() => window.ClayHub.close());

    // ---- 2. Ghe: chơi tuần 1 bằng ghe hàng bông, theo dõi tư thế trong lúc chạy
    await page.evaluate(() => { window.ftTeam(0); window.ftStart(); window.ftPick('menu', 0); window.ftPick('loc', 3); window.ftPick('m', 0); window.ftCommit(); });
    await page.waitForFunction(() => window.__bps3d.me && window.__bps3d.moving > 0, null, { timeout: 20000 });
    const samples = [];
    for (let i = 0; i < 12; i++) { samples.push(await page.evaluate(() => { const m = window.__bps3d.me; return { x: m.position.x, y: m.position.y, z: m.position.z, ry: m.rotation.y, moving: window.__bps3d.moving }; })); await page.waitForTimeout(110); }
    const maxY = Math.max(...samples.map(s => s.y));
    assert.ok(maxY < 0.3, 'ghe không nhảy lên (y tối đa ' + maxY.toFixed(2) + ')');
    // mũi (+x cục bộ) chỉ theo hướng đã đi
    const a = samples[2], b = samples[samples.length - 1];
    const dir = [b.x - a.x, b.z - a.z], n = Math.hypot(dir[0], dir[1]);
    if (n > 0.5) { const bow = [Math.cos(b.ry), -Math.sin(b.ry)]; const dot = (bow[0] * dir[0] + bow[1] * dir[1]) / n; assert.ok(dot > 0.8, 'mũi ghe chỉ về hướng đi (cos = ' + dot.toFixed(2) + ')'); }
    // Vệt sóng sinh theo quãng đường đã trượt: máy CI chậm có thể chưa kịp sinh khi lấy mẫu xong (07/11/2026), chờ tối đa 8 s
    await page.waitForFunction(() => window.__bps3d.wakes.length > 0, null, { timeout: 8000 }).catch(() => {});
    assert.ok(await page.evaluate(() => window.__bps3d.wakes.length > 0), 'có vệt sóng sau lái');

    await ctx.close();

    // prefers-reduced-motion: vẫn đi được, không bụi, không lắc
    const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
    const pg = await ctx2.newPage(); pg.on('pageerror', e => errors.push(e.message));
    await pg.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
    await pg.addInitScript(() => { try { localStorage.setItem('bizon-bps-tour-seen', '1'); sessionStorage.setItem('bps-hs', '1'); } catch (e) {} });
    await pg.goto(BASE + '/ben-phu-sa-3d.html', { waitUntil: 'load', timeout: 60000 });
    await pg.waitForFunction(() => window.BPSHub && window.ClayHub);
    await pg.evaluate(() => window.BPSHub.open());
    await pg.waitForSelector('#chub .pl');
    await pg.waitForFunction(() => window.ClayHub.state());
    const r0 = await pg.evaluate(() => window.ClayHub.state().x);
    await pg.keyboard.down('d'); await pg.waitForFunction(x0 => window.ClayHub.state().x > x0 + 20, r0, { timeout: 15000 }); await pg.keyboard.up('d');
    const r1 = await pg.evaluate(() => ({ x: window.ClayHub.state().x, tf: document.querySelector('#chub .pi').style.transform, dust: document.querySelectorAll('#chub .dust').length }));
    assert.ok(r1.x > r0, 'vẫn đi được'); assert.ok(!/rotate/.test(r1.tf)); assert.equal(r1.dust, 0);
    await ctx2.close();
  } finally { await browser.close(); }
  assert.deepEqual(errors, []);
  console.log('di-lai-tu-nhien: ok');
})().catch(e => { console.error(e); process.exit(1); });
