/* Bến BizOn – nút chạy/đi và góc nhìn cho tay phải (đặc tả specs/003-ben-bizon-nhiem-vu, câu chuyện 2, 11/11/2026).
 * Góc phải dưới có hai nút tròn: «chạy/đi» (#bb-chay, chuyển giữa nhịp «tự động» như cũ và «luôn chạy», chị chọn 4a) và
 * «góc nhìn» (#bb-goc, chuyển từ góc trái trên xuống, giữ id và aria-pressed). Kiểm cỡ ≥ 44 px, không chồng nút khác ở
 * 360/390/412 px dọc và ngang, nhớ nhịp, bàn phím như cũ, giảm chuyển động, hộp thoại đang mở thì không bấm nhầm. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

// ---- Kiểm tĩnh
const html = read('hub-3d.html'), dc = read('js/di-chuyen-3d.js');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 831, 'sw.js nâng phiên bản (≥ bizon-v831)');
check(/<button type="button" id="bb-chay"[^>]*aria-pressed="false"[^>]*data-en-aria=/.test(html), 'nút #bb-chay là button có type, aria-pressed và nhãn tiếng Anh');
check(/<button type="button" id="bb-goc"[^>]*aria-pressed="false"[^>]*data-en-aria=/.test(html), 'nút #bb-goc giữ id, aria-pressed, có nhãn tiếng Anh');
check(/nhip:\s*function/.test(dc) && !/ben-bizon|lumina|Bến/i.test(dc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')), 'di-chuyen-3d.js có nhip() chung, không mang bối cảnh của Bến BizOn');

const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const st = pg => pg.evaluate(() => window.__benBizon.state());
const until = (pg, fn, arg, timeout = 20000) => pg.waitForFunction(fn, arg, { timeout, polling: 100 }).then(() => true, () => false);
const rect = (pg, sel) => pg.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(), c = getComputedStyle(e);
  return { x: r.left, y: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom, on: c.display !== 'none' && c.visibility !== 'hidden' && r.width > 0 && r.height > 0 }; }, sel);
const overlap = (a, b) => a && b && a.on && b.on && a.x < b.r - 0.5 && b.x < a.r - 0.5 && a.y < b.b - 0.5 && b.y < a.b - 0.5;

(async () => {
  const b = await chromium.launch({ args: ARGS });
  const open = async (o = {}) => {
    const ctx = await b.newContext({ viewport: { width: o.w || 390, height: o.h || 664 }, hasTouch: true, isMobile: !!o.mobile, reducedMotion: o.reduce ? 'reduce' : 'no-preference' });
    const pg = await ctx.newPage(); pg.errs = []; pg.on('pageerror', e => pg.errs.push(e.message)); pg.setDefaultTimeout(15000);
    await pg.addInitScript(l => { try { if (!sessionStorage.getItem('da-xoa')) { localStorage.clear(); sessionStorage.setItem('da-xoa', '1'); } localStorage.setItem('bizon-lang', l); } catch (e) {} }, o.lang || 'vi');
    await pg.goto(BASE + '/hub-3d.html'); return [ctx, pg];
  };
  const vao = async (pg, v = 'ceo') => { await pg.click('#bb-pick [data-vai="' + v + '"]'); return until(pg, () => window.__benBizon && window.__benBizon.state().ready, null, 90000); };
  // đẩy cần gạt lên một phần (0..1 của biên độ) rồi đọc trạng thái
  const day = async (pg, phan) => {
    await pg.evaluate(() => window.__benBizon.dat(0, -7, 0)); await until(pg, () => window.__benBizon.state().speed < 0.05);
    const j = await rect(pg, '.dc-joy'), cx = j.x + j.w / 2, cy = j.y + j.h / 2, bien = j.w / 2 * 0.72;
    await pg.mouse.move(cx, cy); await pg.mouse.down(); await pg.mouse.move(cx, cy - bien * phan, { steps: 3 });
    await until(pg, () => window.__benBizon.state().speed > 0.3, null, 5000); await pg.waitForTimeout(500);
    const s = await st(pg); await pg.mouse.up(); await until(pg, () => window.__benBizon.state().speed < 0.05);
    return s;
  };
  try {
    // ---- 1. Vị trí, cỡ và không chồng ở các khổ điện thoại (dọc, ngang) và máy tính
    for (const [w, h] of [[360, 740], [390, 664], [412, 839], [740, 360], [844, 390], [1280, 800]]) {
      const [ctx, pg] = await open({ w, h, mobile: w < 900 }); await vao(pg, 'cfo');
      const r = { chay: await rect(pg, '#bb-chay'), goc: await rect(pg, '#bb-goc'), joy: await rect(pg, '.dc-joy'), exit: await rect(pg, '#bb-exit'), go: await rect(pg, '.dc-goto-btn'), nv: await rect(pg, '#bb-nv') };
      check(r.chay && r.chay.on && r.chay.w >= 44 && r.chay.h >= 44 && r.goc.on && r.goc.w >= 44 && r.goc.h >= 44, w + '×' + h + ': hai nút hiện, ≥ 44 × 44 px');
      check(r.chay.x > w / 2 && r.goc.x > w / 2 && r.chay.y > h / 2 && r.goc.y > h / 2 && r.chay.r <= w && r.goc.b <= h, w + '×' + h + ': hai nút ở góc phải dưới, trong màn hình');
      await pg.evaluate(() => window.__benBizon.goTo('bat-nghiep')); await until(pg, () => window.__benBizon.state().near === 'bat-nghiep', null, 8000);
      r.the = await rect(pg, '.dc-card');
      const dung = []; for (const a of ['chay', 'goc']) for (const k of ['joy', 'exit', 'go', 'nv', 'the', a === 'chay' ? 'goc' : 'chay']) if (overlap(r[a], r[k])) dung.push(a + '/' + k);
      check(dung.length === 0, w + '×' + h + ': không chồng nhau ' + (dung.join(', ') || ''));
      check(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth), w + '×' + h + ': không tràn ngang');
      check(pg.errs.length === 0, w + '×' + h + ': không lỗi trang' + (pg.errs[0] ? ': ' + pg.errs[0] : ''));
      await ctx.close();
    }

    // ---- 2. Nhịp chạy/đi
    let [ctx, pg] = await open({ w: 390, h: 664 }); await vao(pg, 'ceo');
    let s = await st(pg); check(s.nhip === 'tu-dong' && (await pg.getAttribute('#bb-chay', 'aria-pressed')) === 'false', 'mặc định: nhịp «tự động»');
    s = await day(pg, 0.4); check(s.chay === false, 'nhịp tự động: đẩy cần 40 % là đi bộ (như cũ)');
    s = await day(pg, 1); check(s.chay === true, 'nhịp tự động: đẩy hết cần là chạy (như cũ)');
    await pg.click('#bb-chay');
    check((await st(pg)).nhip === 'chay' && (await pg.getAttribute('#bb-chay', 'aria-pressed')) === 'true', 'bấm nút: nhịp «luôn chạy», aria-pressed = true');
    s = await day(pg, 0.4); check(s.chay === true, 'nhịp luôn chạy: đẩy cần 40 % cũng chạy');
    await pg.reload(); await vao(pg, 'ceo');
    check((await st(pg)).nhip === 'chay', 'tải lại: nhớ nhịp «luôn chạy»');
    await pg.click('#bb-chay'); check((await st(pg)).nhip === 'tu-dong', 'bấm lại: về nhịp «tự động»');
    // góc nhìn ở chỗ mới vẫn chạy như cũ
    await pg.click('#bb-goc'); check((await st(pg)).goc === 'cao' && (await pg.getAttribute('#bb-goc', 'aria-pressed')) === 'true', 'nút góc nhìn (chỗ mới): chuyển sang nhìn từ trên');
    await pg.click('#bb-goc'); check((await st(pg)).goc === 'sau', 'bấm lại: về sau lưng');
    // hộp thoại đang mở thì hai nút không bấm được
    await pg.evaluate(() => window.__benBizon.goTo('lumina')); await until(pg, () => window.__benBizon.state().near === 'lumina', null, 8000);
    await pg.click('.dc-card .dc-vao');
    const anDuoi = await pg.evaluate(() => ['#bb-chay', '#bb-goc'].every(sel => { const e = document.querySelector(sel), r = e.getBoundingClientRect(); if (getComputedStyle(e).visibility === 'hidden' || r.width === 0) return true; const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !e.contains(t); }));
    check(anDuoi, 'hộp thoại đang mở: hai nút bị che hoặc ẩn, không bấm nhầm');
    await pg.click('#bb-dlg-close');
    check(pg.errs.length === 0, 'không lỗi trang' + (pg.errs[0] ? ': ' + pg.errs[0] : ''));
    await ctx.close();

    // ---- 3. Máy tính: bàn phím như cũ, nút dùng được bằng Tab / Enter; tiếng Anh
    [ctx, pg] = await open({ w: 1280, h: 800, lang: 'en' }); await vao(pg, 'coo');
    check(/run|walk/i.test(await pg.getAttribute('#bb-chay', 'aria-label') || ''), 'tiếng Anh: nút chạy/đi có nhãn tiếng Anh');
    await pg.focus('#bb-chay'); await pg.keyboard.press('Enter'); check((await st(pg)).nhip === 'chay', 'bấm nút bằng bàn phím (Enter)');
    await pg.click('#bb-chay');
    await pg.evaluate(() => window.__benBizon.dat(0, -7, 0)); await pg.locator('#bb-stage').focus();
    await pg.keyboard.down('KeyW'); await until(pg, () => window.__benBizon.state().speed > 1, null, 8000); s = await st(pg); await pg.keyboard.up('KeyW');
    check(s.chay === true, 'bàn phím: W là chạy (như cũ)');
    await until(pg, () => window.__benBizon.state().speed < 0.05);
    await pg.keyboard.down('ShiftLeft'); await pg.keyboard.down('KeyW'); await until(pg, () => window.__benBizon.state().speed > 0.5, null, 8000); s = await st(pg); await pg.keyboard.up('KeyW'); await pg.keyboard.up('ShiftLeft');
    check(s.chay === false, 'bàn phím: Shift + W là đi bộ (như cũ)');
    await ctx.close();

    // ---- 4. Giảm chuyển động: nút vẫn có, không có hiệu ứng chuyển động
    [ctx, pg] = await open({ reduce: true, w: 390, h: 664 }); await vao(pg, 'sec');
    const tr = await pg.evaluate(() => { const c = getComputedStyle(document.querySelector('#bb-chay')); return c.transitionDuration + '|' + c.animationName; });
    check((await rect(pg, '#bb-chay')).on && /^(0s(, 0s)*)\|none$/.test(tr), 'giảm chuyển động: nút có, không chuyển động (' + tr + ')');
    await ctx.close();
  } finally { await b.close(); }
  console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\nben-bizon-dieu-khien: ok');
  process.exit(fails ? 1 : 0);
})();
