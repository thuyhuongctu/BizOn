/* Lớp chữ mờ chống chụp màn hình (js/capture-guard.js, 23/11/2026): thưa hơn, nhạt hơn, không phủ vùng game.
 * Tĩnh: độ mờ < 7 % (bản cũ), ô lặp lớn hơn ít nhất 2,5 lần diện tích ô cũ 340×170; lớp không nhận chuột, trình đọc bỏ qua;
 * mỗi id dùng để nhận ra game 2D có thật ở đúng trang game (đổi id mà không sửa ở đây thì game lại bị phủ).
 * Trình duyệt: trang thường dùng lớp lặp (chế độ tối đổi ảnh chữ sáng); trang game chỉ có nhãn góc; game trong iframe của
 * trang BizOn không vẽ thêm lớp; bấm xuyên qua lớp được. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';

const cg = R('js/capture-guard.js');
const WM = cg.match(/var WM = \{ text: '[^']+', tileW: (\d+), tileH: (\d+), alpha: ([\d.]+), gameShare: ([\d.]+),\s*gameSel: '([^']+)' \};/);
assert.ok(WM, 'đọc được cấu hình WM');
const [, tw, th, alpha, share, sel] = WM;
assert.ok(+alpha < 0.07 && +alpha >= 0.03, 'độ mờ nhạt hơn bản cũ 7 % nhưng vẫn còn dấu (' + alpha + ')');
assert.ok(+tw * +th >= 2.5 * 340 * 170, 'ô lặp thưa hơn ít nhất 2,5 lần (' + tw + '×' + th + ')');
assert.ok(+share > 0 && +share < 1, 'ngưỡng vùng game hợp lệ');
assert.ok(/#bz-wm\{position:fixed;inset:0;z-index:2147483646;pointer-events:none;/.test(cg), 'lớp lặp không nhận chuột');
assert.ok(/#bz-wm-goc\{[^}]*pointer-events:none/.test(cg), 'nhãn góc không nhận chuột');
assert.equal((cg.match(/setAttribute\('aria-hidden', 'true'\)/g) || []).length, 3, 'lớp che, lớp lặp, nhãn góc đều aria-hidden');
const ids = { '#ft-total': ['ben-phu-sa.html', 'ben-phu-sa-v8.html', 'ben-phu-sa-3d.html'], '#bp-hud': ['brand-passport.html'], '#rulesModal': ['lab/ho-chieu-sau-rieng.html'], '#screen-login': ['game.html'] };
for (const [id, files] of Object.entries(ids)) {
  assert.ok(sel.split(',').includes(id), 'bộ chọn game có ' + id);
  for (const f of files) assert.ok(R(f).includes('id="' + id.slice(1) + '"'), f + ' còn ' + id);
}
assert.ok(sel.includes('[data-bz-game]'), 'có lối cho game mới: [data-bz-game]');
assert.ok(+(R('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 968, 'sw.js tăng phiên bản');

let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('lop-chu-mo: cần playwright'); process.exit(1); }
(async () => {
  const b = await chromium.launch(); let fails = 0;
  const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
  const open = async (p, opts = {}) => {
    const cx = await b.newContext({ viewport: { width: 1280, height: 800 }, ...opts });
    await cx.route(/googleapis|gstatic|goatcounter|supabase\.co|\.mp3|\.mp4/, r => r.abort());
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(BASE + '/' + p, { waitUntil: 'load' }); await pg.waitForTimeout(1800);
    return { cx, pg, errs };
  };
  { // trang thường
    const { cx, pg, errs } = await open('bang-chung.html', { colorScheme: 'light' });
    const r = await pg.evaluate(() => { const l = document.getElementById('bz-wm'), cs = getComputedStyle(l);
      const mid = document.elementFromPoint(640, 400);
      return { wm: window.__bizonWatermark, shown: cs.display !== 'none', pe: cs.pointerEvents, bg: cs.backgroundImage.slice(0, 40), hit: mid && mid.id, badge: getComputedStyle(document.getElementById('bz-wm-goc')).display }; });
    ok(r.wm && r.wm.mode === 'lap', 'bang-chung: lớp lặp');
    ok(r.shown && r.pe === 'none' && /data:image\/png/.test(r.bg), 'bang-chung: lớp hiện, không nhận chuột');
    ok(r.hit !== 'bz-wm' && r.badge === 'none', 'bang-chung: bấm xuyên qua được, không có nhãn góc');
    const sang = await pg.evaluate(() => getComputedStyle(document.getElementById('bz-wm')).backgroundImage);
    await pg.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    const toi = await pg.evaluate(() => getComputedStyle(document.getElementById('bz-wm')).backgroundImage);
    ok(sang !== toi, 'bang-chung: chế độ tối dùng ảnh chữ sáng');
    ok(!errs.length, 'bang-chung: không lỗi JS');
    await cx.close();
  }
  for (const p of ['ben-phu-sa.html', 'brand-passport.html', 'lab/ho-chieu-sau-rieng.html', 'game.html', 'ben-phu-sa-3d.html']) {
    const { cx, pg, errs } = await open(p);
    const r = await pg.evaluate(() => ({ wm: window.__bizonWatermark, lap: getComputedStyle(document.getElementById('bz-wm')).display, goc: getComputedStyle(document.getElementById('bz-wm-goc')).display }));
    ok(r.wm && r.wm.mode === 'goc' && r.lap === 'none' && r.goc !== 'none', p + ': không phủ lớp lặp, chỉ nhãn góc');
    ok(!errs.length, p + ': không lỗi JS' + (errs.length ? ': ' + errs[0] : ''));
    await cx.close();
  }
  { // Bật Nghiệp 3D: game.html trong iframe không vẽ thêm lớp
    const { cx, pg } = await open('BizOn%20Game%203D.html');
    await pg.waitForTimeout(3000);
    const r = await pg.evaluate(() => { const f = document.getElementById('gf'); let inner = null;
      try { inner = { wm: f.contentWindow.__bizonWatermark, layer: !!f.contentDocument.getElementById('bz-wm') }; } catch (e) { inner = 'x'; }
      return { wm: window.__bizonWatermark, inner }; });
    ok(r.wm && r.wm.mode === 'goc', 'BizOn Game 3D: nhãn góc');
    ok(r.inner && r.inner.wm && r.inner.wm.mode === 'iframe' && !r.inner.layer, 'BizOn Game 3D: game.html trong iframe không vẽ thêm lớp');
    await cx.close();
  }
  await b.close();
  if (fails) { console.error('lop-chu-mo: ' + fails + ' lỗi'); process.exit(1); }
  console.log('lop-chu-mo: ok');
})().catch(e => { console.error(e); process.exit(1); });
