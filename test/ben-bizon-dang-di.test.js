/* Bến BizOn – dáng đi của nhân vật (js/ben-bizon-dang-di.js, 10/11/2026). Lỗi cũ: nhân vật bị kéo đi 3,4 đơn vị/giây trong khi clip «đi»
 * chỉ hợp khoảng 1 đơn vị/giây nên chân trượt trên mặt đất («di chuyển xấu»). Kiểm: có hai nhịp đi và chạy, clip phát đúng nhịp với
 * quãng đường (tốc độ clip × tốc độ tự nhiên ≈ tốc độ thật), clip «chạy» ghép được từ kho động tác dùng chung cho vai không có sẵn,
 * kho hỏng thì hạ tốc độ để clip «đi» vẫn theo kịp, giảm chuyển động thì không nghiêng người, bizon-characters.js không bị sửa. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');

// ---- Kiểm tĩnh
const kho = fs.readFileSync(R('assets/models/nhan-vat/dong-tac-v1.glb')), n = kho.readUInt32LE(12), js = JSON.parse(kho.subarray(20, 20 + n).toString());
check(kho.subarray(0, 4).toString() === 'glTF' && kho.length < 300000, 'kho động tác là GLB hợp lệ, nhẹ hơn 300 KB (' + Math.round(kho.length / 1024) + ' KB)');
check(['Run', 'Wave', 'Cheer'].every(t => js.animations.some(a => a.name === t)), 'kho có clip Run, Wave, Cheer');
check(!js.meshes && !js.images && !js.textures, 'kho chỉ có bộ xương và clip, không có lưới hay ảnh');
check(['Hips', 'LeftFoot', 'RightHand', 'Head'].every(t => js.nodes.some(x => x.name === t)), 'kho giữ tên khớp (Hips, LeftFoot, RightHand, Head)');
const dd = read('js/ben-bizon-dang-di.js'), dc = read('js/di-chuyen-3d.js'), bb = read('js/ben-bizon.js');
check(!/fetch\(|XMLHttpRequest|https?:\/\//.test(dd), 'tệp dáng đi không gọi mạng ngoài');
check(/tocDoDi: TOC_DI, tocDoChay: TOC_CHAY/.test(bb) && /TOC_DI = 1\.15, TOC_CHAY = 2\.1/.test(bb), 'Bến BizOn đặt tốc độ đi 1,15 và chạy 2,1 (không còn 3,4)');
check(/o\.tocDoDi \|\| TOC/.test(dc) && /o\.tocDoChay \|\| TOC/.test(dc), 'nơi khác không đặt tocDoDi/tocDoChay thì phần di chuyển vẫn một tốc độ như cũ');
check(!/dang-di|dong-tac-v1/.test(read('bizon-characters.js')), 'bizon-characters.js không bị sửa vì việc này');
check(read('sw.js').includes("'./js/ben-bizon-dang-di.js'"), 'sw.js lưu sẵn js/ben-bizon-dang-di.js');
check(read('assets/models/SOURCES.md').includes('dong-tac-v1.glb'), 'SOURCES.md ghi nguồn dong-tac-v1.glb');

const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const until = (pg, fn, arg, timeout = 30000) => pg.waitForFunction(fn, arg, { timeout, polling: 100 }).then(() => true, () => false);
const doc = pg => pg.evaluate(() => { const s = window.__benBizon.state(), d = window.__benBizon.info().dangDi || {}; return Object.assign({ speed: s.speed, dang: s.dang, clip: s.clip, mode: s.mode }, d); });
const vao = async (pg, vai) => { await pg.goto(BASE + '/hub-3d.html'); await pg.click('[data-vai="' + vai + '"]'); return until(pg, () => window.__benBizon && window.__benBizon.state().ready && window.__benBizon.state().glb, null, 60000); };
const khop = (ts, v, toc) => Math.abs(ts * v - toc) / toc;

(async () => {
  const browser = await chromium.launch({ args: ARGS });
  try {
    // ---- 1. Hai vai không có sẵn clip chạy: ghép được, đi và chạy đều khớp nhịp
    for (const vai of ['cfo', 'sec']) {
      const ctx = await browser.newContext({ viewport: { width: 900, height: 560 } }), pg = await ctx.newPage(), loi = [];
      pg.on('pageerror', e => loi.push(e.message));
      check(await vao(pg, vai), vai + ': mô hình có xương đã tải');
      check(await until(pg, () => (window.__benBizon.info().dangDi || {}).coChay === true), vai + ': đã ghép clip «chạy» từ kho động tác');
      const d0 = await doc(pg);
      check(d0.vDi > 0.7 && d0.vDi < 1.4 && d0.vChay > d0.vDi * 1.3, vai + ': đo được tốc độ tự nhiên, đi ' + d0.vDi + ' < chạy ' + d0.vChay);
      await pg.keyboard.down('KeyW');
      check(await until(pg, () => { const s = window.__benBizon.state(); return s.dang === 'chay' && s.speed > 1.95; }, null, 20000), vai + ': bấm W → chạy');
      await until(pg, () => (window.__benBizon.info().dangDi || {}).wChay > 0.9, null, 20000); const c = await doc(pg);
      check(Math.abs(c.speed - 2.1) < 0.12 && c.mode === 'walk' && c.clip === 'walk', vai + ': tốc độ chạy ≈ 2,1 (' + c.speed.toFixed(2) + ')');
      check(khop(c.tsChay, c.vChay, c.speed) < 0.12 && c.wChay > 0.9, vai + ': clip chạy phát đúng nhịp với quãng đường, chân không trượt (lệch ' + (khop(c.tsChay, c.vChay, c.speed) * 100).toFixed(0) + ' %)');
      await pg.keyboard.down('ShiftLeft');
      check(await until(pg, () => { const s = window.__benBizon.state(); return s.dang === 'di' && s.speed < 1.25; }, null, 20000), vai + ': giữ Shift → đi bộ');
      await until(pg, () => (window.__benBizon.info().dangDi || {}).wDi > 0.9, null, 20000);   // máy thử vẽ chậm: chờ hoà trộn xong, không chờ theo giây
      const d = await doc(pg);
      check(Math.abs(d.speed - 1.15) < 0.1 && khop(d.tsDi, d.vDi, d.speed) < 0.12 && d.wDi > 0.9, vai + ': đi bộ ≈ 1,15 và clip đi khớp nhịp (lệch ' + (khop(d.tsDi, d.vDi, d.speed) * 100).toFixed(0) + ' %)');
      await pg.keyboard.up('ShiftLeft'); await pg.keyboard.up('KeyW');
      check(await until(pg, () => { const s = window.__benBizon.state(); return s.dang === 'dung' && s.speed < 0.05 && s.clip === 'idle'; }, null, 20000), vai + ': thả phím → đứng lại');
      check(loi.length === 0, vai + ': không có lỗi trang' + (loi.length ? ': ' + loi[0] : ''));
      await ctx.close();
    }
    // ---- 2. Kho động tác không tải được: vẫn đi được, tốc độ hạ xuống để clip «đi» theo kịp
    const c2 = await browser.newContext({ viewport: { width: 900, height: 560 } }), p2 = await c2.newPage();
    await p2.route('**/dong-tac-v1.glb', r => r.abort());
    check(await vao(p2, 'cmo'), 'kho hỏng: vẫn vào được');
    check(await until(p2, () => (window.__benBizon.info().dangDi || {}).khoHong === true), 'kho hỏng: nhận biết được');
    await p2.keyboard.down('KeyW');
    check(await until(p2, () => window.__benBizon.state().speed > 1.4, null, 20000), 'kho hỏng: vẫn đi được');
    await p2.waitForTimeout(500); const k = await doc(p2); await p2.keyboard.up('KeyW');
    check(k.speed < 1.6 && k.coChay === false && khop(k.tsDi, k.vDi, k.speed) < 0.12, 'kho hỏng: tốc độ hạ còn ' + k.speed.toFixed(2) + ', clip «đi» vẫn khớp nhịp');
    await c2.close();
    // ---- 3. Giảm chuyển động: không nghiêng người khi rẽ
    const c3 = await browser.newContext({ viewport: { width: 900, height: 560 }, reducedMotion: 'reduce' }), p3 = await c3.newPage();
    check(await vao(p3, 'coo'), 'giảm chuyển động: vào được');
    await until(p3, () => (window.__benBizon.info().dangDi || {}).coChay === true);
    await p3.keyboard.down('KeyW'); await p3.keyboard.down('KeyD'); await until(p3, () => window.__benBizon.state().speed > 1.5, null, 20000);
    const g = await doc(p3); await p3.keyboard.up('KeyD'); await p3.keyboard.up('KeyW');
    check(g.nghieng === 0 && g.dang !== 'dung', 'giảm chuyển động: vẫn đi được, không nghiêng người');
    await c3.close();
  } finally { await browser.close(); }
  console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\nben-bizon-dang-di: ok');
  process.exit(fails ? 1 : 0);
})();
