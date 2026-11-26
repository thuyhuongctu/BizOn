/* Toàn cảnh Bến BizOn (hub-3d.html, 26/11/2026, chị yêu cầu «thêm nút toàn cảnh»). Kiểm:
 * - tĩnh: nút #bb-toan là button có type, aria-pressed, nhãn VI/EN; sw.js tăng phiên bản;
 * - 360 px: 🗺️ cùng hàng bên trái 🔊, ≥ 44 px, không chồng nút khác hay cần điều khiển, không tràn ngang;
 * - bấm 🗺️ (điện thoại dọc 390 px và máy tính 1100 px): máy quay lên cao, người chơi đứng yên, thẻ địa điểm, cần điều khiển,
 *   bảng nhiệm vụ ẩn; tên cả 11 địa điểm hiện và nằm trọn trong màn hình; bấm lại thì về góc máy cũ, đi lại được;
 * - Esc thoát toàn cảnh; «Dẫn đường» trong bảng nhiệm vụ cũng thoát; thoát bến thì xóa trạng thái; giảm chuyển động thì chuyển ngay;
 * - không lỗi JS. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
const hub = R('hub-3d.html');
assert.match(hub, /<button type="button" id="bb-toan" aria-pressed="false" aria-label="Toàn cảnh" data-en-aria="Overview"/, 'nút #bb-toan có type, aria-pressed, nhãn VI/EN');
assert.ok(+(R('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 1015, 'sw.js tăng phiên bản');

const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); let fails = 0;
  const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
  const errs = [];
  async function moTrang(w, h, giam) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 600, isMobile: w < 600, reducedMotion: giam ? 'reduce' : 'no-preference' });
    await ctx.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(BASE + '/hub-3d.html', { waitUntil: 'load' });
    await pg.click('#bb-pick [data-vai="coo"]');
    await pg.waitForFunction(() => window.__benBizon && window.__benBizon.state().ready, null, { timeout: 90000 });
    return { ctx, pg };
  }
  const tc = pg => pg.evaluate(() => window.__benBizon.toanCanh());
  const hien = (pg, sel) => pg.evaluate(s => [...document.querySelectorAll(s)].some(e => e.getBoundingClientRect().width > 0 && getComputedStyle(e).display !== 'none'), sel);
  const choMuc = (pg, m) => pg.waitForFunction(m => window.__benBizon.toanCanh().muc === m, m, { timeout: 15000 }).then(() => true, () => false);

  // bố cục 360 px
  { const { ctx, pg } = await moTrang(360, 740);
    const r = await pg.evaluate(() => {
      const box = e => { const q = e.getBoundingClientRect(); return { l: q.left, t: q.top, r: q.right, b: q.bottom, w: q.width, h: q.height }; };
      const t = box(document.getElementById('bb-toan')), a = box(document.getElementById('bb-am'));
      const khac = ['#bb-am', '#bb-chay', '#bb-goc', '.dc-joy', '#bb-exit', '.dc-goto-btn'].map(s => document.querySelector(s)).filter(Boolean).map(box);
      return { t, a, chong: khac.some(q => q.w > 0 && q.l < t.r && q.r > t.l && q.t < t.b && q.b > t.t), sw: document.documentElement.scrollWidth };
    });
    ok(r.t.w >= 44 && r.t.h >= 44 && Math.abs(r.t.b - r.a.b) < 2 && r.t.r < r.a.l && r.t.l >= 0, '360 px: 🗺️ cùng hàng, bên trái 🔊, ≥ 44 px');
    ok(!r.chong && r.sw <= 360, '360 px: không chồng nút khác hay cần điều khiển, không tràn ngang');
    await ctx.close(); }

  for (const [w, h, ten] of [[390, 844, 'điện thoại'], [1100, 700, 'máy tính']]) {
    const { ctx, pg } = await moTrang(w, h);
    const y0 = (await tc(pg)).cam[1];
    await pg.click('#bb-toan');
    ok(await choMuc(pg, 1), ten + ': máy quay chuyển hẳn sang toàn cảnh');
    const t = await tc(pg), s = await pg.evaluate(() => window.__benBizon.state());
    ok(t.bat && t.cam[1] > y0 + 10 && s.dangDung && await pg.getAttribute('#bb-toan', 'aria-pressed') === 'true', ten + ': máy quay lên cao (' + t.cam[1].toFixed(1) + ' m), người chơi đứng yên, nút đang bật');
    ok(!(await hien(pg, '.dc-card.on')) && !(await hien(pg, '#bb-nv')) && (w > 600 || !(await hien(pg, '.dc-joy'))), ten + ': thẻ địa điểm, bảng nhiệm vụ, cần điều khiển ẩn');
    const nhan = await pg.evaluate(() => [...document.querySelectorAll('#bb-labels .bb-lb')].map(e => { const q = e.getBoundingClientRect(); return { t: e.textContent, hien: e.style.display !== 'none' && q.width > 0, trong: q.left >= 0 && q.right <= innerWidth && q.top >= 0 && q.bottom <= innerHeight }; }));
    const thieu = nhan.filter(n => !n.hien || !n.trong).map(n => n.t);
    ok(nhan.length === 11 && !thieu.length, ten + ': tên cả 11 địa điểm hiện, nằm trọn trong màn hình' + (thieu.length ? ' (thiếu: ' + thieu.join(', ') + ')' : ''));
    await pg.click('#bb-toan');
    ok(await choMuc(pg, 0), ten + ': bấm lại: máy quay về hẳn');
    const t2 = await tc(pg), s2 = await pg.evaluate(() => window.__benBizon.state());
    ok(!t2.bat && Math.abs(t2.cam[1] - y0) < 1.5 && !s2.dangDung && await hien(pg, '#bb-nv'), ten + ': về góc máy cũ, đi lại được, bảng nhiệm vụ hiện lại');
    await ctx.close();
  }

  // Esc, «Dẫn đường», thoát bến, giảm chuyển động
  { const { ctx, pg } = await moTrang(390, 844, true);
    await pg.click('#bb-toan'); await pg.waitForTimeout(100);
    ok((await tc(pg)).muc === 1, 'giảm chuyển động: chuyển sang toàn cảnh ngay');
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(100);
    ok(!(await tc(pg)).bat && !(await pg.evaluate(() => window.__benBizon.state().dangDung)), 'Esc: thoát toàn cảnh, đi lại được');
    await pg.click('#bb-toan'); await pg.waitForTimeout(100);
    const daoDuong = await pg.evaluate(() => { const b = [...document.querySelectorAll('#bb-nv button')].find(x => /Dẫn đường/.test(x.textContent)); if (!b) return false; b.click(); return true; });
    await pg.waitForTimeout(150);
    ok(daoDuong && !(await tc(pg)).bat, '«Dẫn đường» (bảng nhiệm vụ): thoát toàn cảnh để dẫn người chơi đi');
    await pg.click('#bb-toan'); await pg.waitForTimeout(100);
    await pg.click('#bb-exit'); await pg.waitForTimeout(200);
    ok(!(await tc(pg)).bat && await pg.getAttribute('#bb-toan', 'aria-pressed') === 'false', 'thoát bến: xóa trạng thái toàn cảnh');
    await ctx.close(); }

  ok(!errs.length, 'không lỗi JS' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  if (fails) { console.error('toan-canh-ben-bizon: ' + fails + ' lỗi'); process.exit(1); }
  console.log('toan-canh-ben-bizon: ok');
})().catch(e => { console.error(e); process.exit(1); });
