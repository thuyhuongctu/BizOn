/* Hộ Chiếu Sầu Riêng 3D (10/11/2026): Tèo Soi dẫn chuyện thành «tranh động». Dáng mặc định (ts-wave, ts-salute) đứng thở
 * (tờ teo-dung) trên nút «Hỏi Tèo» và nói (tờ teo-noi) trong khung hội thoại; dáng cảm xúc khác giữ ảnh tĩnh; giảm chuyển động
 * thì giữ ảnh tĩnh. Mã nằm trong template của bundle (sửa bằng scripts/release/rebundle-ho-chieu-sau-rieng-3d.mjs). */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const lines = read('lab/ho-chieu-sau-rieng-3d.html').split('\n');
const tpl = JSON.parse(lines[lines.findIndex(l => l.trim() === '<script type="__bundler/template">') + 1]);
check(/static TD_MAC = \['ts-wave', 'ts-salute'\]/.test(tpl), 'chỉ dáng mặc định (vẫy, chào) dùng tranh động');
check(tpl.includes("out.td = 'assets/character/tranh-dong/teo-noi.webp'") && tpl.includes("'assets/character/tranh-dong/teo-dung.webp'"), 'khung hội thoại dùng tờ teo-noi, nút «Hỏi Tèo» dùng tờ teo-dung');
check(/clearInterval\(this\.tdTimer\)/.test(tpl) && /prefers-reduced-motion: reduce/.test(tpl), 'dừng đồng hồ khi gỡ trang; tôn trọng giảm chuyển động');
for (const f of ['teo-dung', 'teo-noi']) check(fs.existsSync(path.join(__dirname, '..', 'assets/character/tranh-dong/' + f + '.webp')), 'có tờ ' + f);

const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const until = (pg, fn, arg, timeout = 15000) => pg.waitForFunction(fn, arg, { timeout, polling: 100 }).then(() => true, () => false);
const vao = async (ctx) => { const pg = await ctx.newPage(), loi = []; pg.on('pageerror', e => loi.push(e.message)); await pg.goto(BASE + '/lab/ho-chieu-sau-rieng-3d.html'); const ok = await until(pg, () => window.__hsr3d && window.__hsr3d.state.ready, null, 90000); return [pg, loi, ok]; };
const bg = (pg, sel) => pg.evaluate(s => [...document.querySelectorAll(s)].map(e => getComputedStyle(e).backgroundImage + ' @ ' + getComputedStyle(e).backgroundPosition), sel);

(async () => {
  const browser = await chromium.launch({ args: ARGS });
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 760 } }), [pg, loi, ok] = await vao(ctx);
    check(ok, 'trang 3D sẵn sàng');
    check(await pg.evaluate(() => window.__hsr3d.dragonMood()) === 'ts-passport-show', 'đầu ván: dáng cầm hộ chiếu');
    check(!(await bg(pg, '.ts-td')).length, 'đầu ván (dáng cầm hộ chiếu): giữ ảnh tĩnh, không có tranh động');
    await pg.evaluate(() => window.__hsr3d.setState({ phase: 'team' }));
    check(await until(pg, () => !!document.querySelector('[role=button] .ts-td')), 'dáng chào: nút «Hỏi Tèo» thành tranh động');
    check((await bg(pg, '[role=button] .ts-td')).some(x => /teo-dung\.webp/.test(x)), 'nút «Hỏi Tèo» dùng tờ teo-dung');
    await pg.evaluate(() => window.__hsr3d.talkTo('dragon'));
    check(await until(pg, () => [...document.querySelectorAll('.ts-td')].some(e => /teo-noi/.test(getComputedStyle(e).backgroundImage))), 'mở hội thoại với Tèo: khung hội thoại dùng tờ teo-noi');
    const a = (await bg(pg, '.ts-td')).join('|'); await pg.waitForTimeout(500); const b = (await bg(pg, '.ts-td')).join('|');
    check(a !== b, 'khung hình chạy (vị trí nền đổi theo thời gian)');
    await pg.evaluate(() => window.__hsr3d.setState({ talk: { id: 'dragon', reply: 'thử', woke: 0 } }));
    check(await until(pg, () => !document.querySelector('.ts-td[aria-label="Tèo Soi"]:not([role=button] *)') || ![...document.querySelectorAll('.ts-td')].some(e => /teo-noi/.test(getComputedStyle(e).backgroundImage))), 'Tèo đang trả lời (dáng suy nghĩ): khung hội thoại về ảnh tĩnh');
    check(loi.length === 0, 'không có lỗi trang' + (loi.length ? ': ' + loi[0] : ''));
    await ctx.close();
    const c2 = await browser.newContext({ viewport: { width: 1280, height: 760 }, reducedMotion: 'reduce' }), [p2, , ok2] = await vao(c2);
    await p2.evaluate(() => window.__hsr3d.setState({ phase: 'team' })); await p2.evaluate(() => window.__hsr3d.talkTo('dragon')); await p2.waitForTimeout(800);
    check(ok2 && !(await bg(p2, '.ts-td')).length, 'giảm chuyển động: giữ ảnh tĩnh');
    await c2.close();
  } finally { await browser.close(); }
  console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\nho-chieu-sau-rieng-teo-dong: ok');
  process.exit(fails ? 1 : 0);
})();
