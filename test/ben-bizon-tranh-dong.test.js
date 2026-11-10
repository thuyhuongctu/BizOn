/* Bến BizOn – nhân vật «tranh động» (js/ben-bizon-tranh-dong.js, 10/11/2026, bản thử): CEO là tấm tranh động dựng từ tranh gốc đã bỏ la bàn,
 * bật bằng hub-3d.html?nv=tranh. Kiểm: mặc định không đổi gì; có cờ thì CEO dùng tờ sprite, chọn đúng hướng nhìn (đi ra xa → «sau», đi về
 * máy quay → «trước», sang phải/trái → «ngang» và lật gương), khung hình chạy khi đi và về 0 khi đứng, vai chưa có sprite vẫn dùng mô hình,
 * tờ sprite tải hỏng thì không lỗi trang, giảm chuyển động thì không chạy khung. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const td = read('js/ben-bizon-tranh-dong.js');
check(!/https?:\/\//.test(td) && !/XMLHttpRequest|sendBeacon/.test(td), 'tệp tranh động không gọi mạng ngoài trang');
check(read('sw.js').includes("'./js/ben-bizon-tranh-dong.js'"), 'sw.js lưu sẵn js/ben-bizon-tranh-dong.js');
check(/NV_TRANH = \/\[\?&\]nv=tranh/.test(read('js/ben-bizon.js')), 'chỉ bật khi đường dẫn có ?nv=tranh');
check(!/tranh-dong/.test(read('bizon-characters.js')), 'bizon-characters.js không bị sửa');

const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const until = (pg, fn, arg, timeout = 30000) => pg.waitForFunction(fn, arg, { timeout, polling: 100 }).then(() => true, () => false);
const st = pg => pg.evaluate(() => window.__benBizon.state());
const vao = async (pg, q, vai) => { await pg.goto(BASE + '/hub-3d.html' + q); await pg.click('[data-vai="' + vai + '"]'); return until(pg, () => window.__benBizon && window.__benBizon.state().ready, null, 60000); };
const giu = async (pg, phim, fn, arg) => { await pg.keyboard.down(phim); const ok = await until(pg, fn, arg, 25000); const s = await st(pg); await pg.keyboard.up(phim); await until(pg, () => window.__benBizon.state().speed < 0.05, null, 15000); return [ok, s]; };

(async () => {
  const browser = await chromium.launch({ args: ARGS });
  try {
    const ctx = await browser.newContext({ viewport: { width: 900, height: 560 } }), pg = await ctx.newPage(), loi = [];
    pg.on('pageerror', e => loi.push(e.message));
    check(await vao(pg, '', 'ceo') && (await st(pg)).tranh === null, 'mặc định (không có cờ): CEO vẫn như cũ, không dùng tranh động');
    check(await vao(pg, '?nv=tranh', 'cfo') && (await st(pg)).tranh === null, 'có cờ nhưng vai chưa có tờ sprite (CFO): vẫn dùng mô hình');
    check(await vao(pg, '?nv=tranh', 'ceo'), 'có cờ, vai CEO: vào được');
    check(await until(pg, () => (window.__benBizon.state().tranh || {}).sanSang === true), 'ba tờ sprite của CEO đã tải');
    await pg.evaluate(() => window.__benBizon.dat(4.4, -6.6, 0)); await pg.waitForTimeout(400);
    check((await st(pg)).tranh.khung === 0, 'đứng yên: dừng ở khung đầu');
    let [ok, s] = await giu(pg, 'KeyW', () => { const t = window.__benBizon.state(); return t.speed > 1.2 && t.tranh.huong === 'sau' && t.tranh.khung > 2; });
    check(ok, 'bấm W (đi ra xa máy quay): tờ «sau», khung hình chạy');
    check(s.speed <= 1.9, 'tốc độ với tranh động không quá 1,8 (' + s.speed.toFixed(2) + ')');
    check((await st(pg)).tranh.khung === 0, 'thả phím: về khung đầu');
    [ok] = await giu(pg, 'KeyS', () => { const t = window.__benBizon.state(); return t.speed > 1 && t.tranh.huong === 'truoc'; });
    check(ok, 'bấm S (đi về phía máy quay): tờ «trước»');
    [ok] = await giu(pg, 'KeyD', () => { const t = window.__benBizon.state(); return t.speed > 0.8 && t.tranh.huong === 'ngang' && t.tranh.lat === 1; });
    check(ok, 'bấm D (sang phải): tờ «ngang», không lật');
    [ok] = await giu(pg, 'KeyA', () => { const t = window.__benBizon.state(); return t.speed > 0.8 && t.tranh.huong === 'ngang' && t.tranh.lat === -1; });
    check(ok, 'bấm A (sang trái): tờ «ngang», lật gương');
    check(loi.length === 0, 'không có lỗi trang' + (loi.length ? ': ' + loi[0] : ''));
    await ctx.close();
    // tờ sprite tải hỏng: không lỗi trang, báo hỏng (chặn service worker để lệnh chặn có tác dụng)
    const c2 = await browser.newContext({ viewport: { width: 900, height: 560 }, serviceWorkers: 'block' }), p2 = await c2.newPage(), loi2 = [];
    p2.on('pageerror', e => loi2.push(e.message)); await c2.route('**/tranh-dong/*.webp', r => r.abort());
    check(await vao(p2, '?nv=tranh', 'ceo') && await until(p2, () => (window.__benBizon.state().tranh || {}).hong === true), 'tờ sprite tải hỏng: nhận biết được');
    check(loi2.length === 0, 'tờ sprite tải hỏng: không lỗi trang');
    await c2.close();
    // giảm chuyển động: đi được nhưng không chạy khung
    const c3 = await browser.newContext({ viewport: { width: 900, height: 560 }, reducedMotion: 'reduce' }), p3 = await c3.newPage();
    await vao(p3, '?nv=tranh', 'ceo'); await until(p3, () => (window.__benBizon.state().tranh || {}).sanSang === true);
    await p3.keyboard.down('KeyW'); await until(p3, () => window.__benBizon.state().speed > 1.2, null, 20000); const g = await st(p3); await p3.keyboard.up('KeyW');
    check(g.tranh.khung === 0 && g.tranh.huong === 'sau', 'giảm chuyển động: vẫn đổi hướng nhìn nhưng không chạy khung hình');
    await c3.close();
  } finally { await browser.close(); }
  console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\nben-bizon-tranh-dong: ok');
  process.exit(fails ? 1 : 0);
})();
