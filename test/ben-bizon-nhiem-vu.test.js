/* Bến BizOn – nhiệm vụ «Làm quen Bến BizOn» (đặc tả specs/003-ben-bizon-nhiem-vu, câu chuyện 1, 11/11/2026).
 * Người mới vào bến thấy bảng nhiệm vụ ở góc trái trên: 5 việc tích ô, «việc tiếp theo», tiến độ x/5, nút «Dẫn đường»
 * (dùng lối tắt «Đi tới…») và nút thu gọn. Việc được tích ngay khi hành động xảy ra, không cần theo thứ tự; tiến độ chỉ
 * lưu trên máy (chị chọn 3a). Kiểm 360/390/412 px dọc và ngang, VI/EN, giảm chuyển động, localStorage bị chặn. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

// ---- Kiểm tĩnh
const sw = read('sw.js'), html = read('hub-3d.html');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(sw) || [])[1] >= 831, 'sw.js ≥ bizon-v831');
check(sw.includes("'./js/ben-bizon-nhiem-vu.js'"), 'sw.js lưu sẵn js/ben-bizon-nhiem-vu.js');
check(/<section id="bb-nv"[^>]*aria-label/.test(html), 'hub-3d.html có khung bảng nhiệm vụ #bb-nv có aria-label');
const nv = fs.existsSync(path.join(__dirname, '..', 'js/ben-bizon-nhiem-vu.js')) ? read('js/ben-bizon-nhiem-vu.js') : '';
check(nv && !/https?:\/\/(?!threejs)/.test(nv.replace(/\/\*[\s\S]*?\*\//g, '')) && !/fetch\(|XMLHttpRequest|sendBeacon/.test(nv), 'tệp nhiệm vụ không gọi mạng (tiến độ chỉ lưu trên máy)');
const VIEC = ['hoi-lumina', 'doc-bang-tin', 'ghe-hanh-trinh', 'hoi-thay-tu', 'xem-thanh-tich'];
check(VIEC.every(v => nv.includes("'" + v + "'")), 'đủ 5 việc chị duyệt (1a): ' + VIEC.join(', '));

const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const st = pg => pg.evaluate(() => window.__benBizon.state());
const nvs = pg => pg.evaluate(() => (window.__benBizon.state() || {}).nhiemVu || null);
const until = (pg, fn, arg, timeout = 25000) => pg.waitForFunction(fn, arg, { timeout, polling: 100 }).then(() => true, () => false);
const rect = (pg, sel) => pg.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(), c = getComputedStyle(e);
  return { x: r.left, y: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom, on: c.display !== 'none' && c.visibility !== 'hidden' && r.width > 0 && r.height > 0 }; }, sel);
const overlap = (a, b) => a && b && a.on && b.on && a.x < b.r - 0.5 && b.x < a.r - 0.5 && a.y < b.b - 0.5 && b.y < a.b - 0.5;

(async () => {
  const b = await chromium.launch({ args: ARGS });
  const open = async (o = {}) => {
    const ctx = await b.newContext({ viewport: { width: o.w || 390, height: o.h || 664 }, hasTouch: true, isMobile: !!o.mobile, reducedMotion: o.reduce ? 'reduce' : 'no-preference' });
    const pg = await ctx.newPage(); pg.errs = []; pg.on('pageerror', e => pg.errs.push(e.message)); pg.setDefaultTimeout(15000);
    await pg.addInitScript(l => { try { if (!sessionStorage.getItem('da-xoa')) { localStorage.clear(); sessionStorage.setItem('da-xoa', '1'); } localStorage.setItem('bizon-lang', l); } catch (e) {} }, o.lang || 'vi');
    if (o.init) await pg.addInitScript(o.init);
    await pg.goto(BASE + '/hub-3d.html');
    return [ctx, pg];
  };
  const vao = async (pg, v = 'ceo') => { await pg.click('#bb-pick [data-vai="' + v + '"]'); return until(pg, () => window.__benBizon && window.__benBizon.state().ready, null, 90000); };
  try {
    // ---- 1. Lần đầu vào bến (390 × 664, như iPhone 13)
    let [ctx, pg] = await open({ mobile: true });
    check(await vao(pg), 'vào bến được');
    const t0 = Date.now();
    check(await until(pg, () => { const e = document.querySelector('#bb-nv'); return e && e.offsetParent && /Tiếp theo: Hỏi đường Lumina/.test(e.textContent); }, null, 3000) && Date.now() - t0 <= 3000, 'SC-001: thấy «việc tiếp theo» trong 3 giây sau khi cảnh sẵn sàng');
    let n = await nvs(pg);
    check(n && n.dangTheo === 'lam-quen' && n.xong.length === 0 && n.tong === 5 && n.tiepTheo === 'hoi-lumina', 'lần đầu: «Làm quen», 0/5, việc tiếp theo là hỏi Lumina: ' + JSON.stringify(n));
    check(/0\s*\/\s*5/.test(await pg.textContent('#bb-nv')), 'bảng ghi tiến độ 0/5');
    const bt = await rect(pg, '#bb-nv-dan'); check(bt && bt.on && bt.w >= 44 && bt.h >= 44, 'nút «Dẫn đường» ≥ 44 px');
    const bg = await rect(pg, '#bb-nv-gon'); check(bg && bg.on && bg.w >= 44 && bg.h >= 44, 'nút thu gọn ≥ 44 px');
    check(!(await rect(pg, '#bb-hint')).on, 'có bảng nhiệm vụ thì bỏ dòng nhắc «Kéo cần để đi» (bảng đã nói việc tiếp theo)');
    // Dẫn đường tới Lumina rồi mở hội thoại
    await pg.click('#bb-nv-dan');
    check(await until(pg, () => window.__benBizon.state().near === 'lumina', null, 8000), '«Dẫn đường» đưa tới Lumina');
    await pg.click('.dc-card .dc-vao');
    check(await until(pg, () => { const n = window.__benBizon.state().nhiemVu; return n.xong.includes('hoi-lumina') && n.tiepTheo === 'doc-bang-tin'; }, null, 5000), 'mở hội thoại với Lumina: tích việc, việc tiếp theo chuyển sang Bảng tin');
    check(/1\s*\/\s*5/.test(await pg.textContent('#bb-nv')), 'tiến độ 1/5');
    await pg.click('#bb-dlg-close');
    // Làm không theo thứ tự: Bảng thành tích trước Bảng tin
    await pg.evaluate(() => window.__benBizon.goTo('thanh-tich')); await until(pg, () => window.__benBizon.state().near === 'thanh-tich', null, 8000);
    await pg.click('.dc-card .dc-vao');
    check(await until(pg, () => window.__benBizon.state().nhiemVu.xong.includes('xem-thanh-tich'), null, 5000), 'làm không theo thứ tự (Bảng thành tích trước) vẫn được tích');
    n = await nvs(pg); check(n.tiepTheo === 'doc-bang-tin', 'việc tiếp theo vẫn là việc chưa xong đầu tiên (Bảng tin)');
    await pg.click('#bb-dlg-close');
    // Tải lại: giữ tiến độ
    await pg.reload(); check(await vao(pg), 'tải lại, vào lại bến');
    n = await nvs(pg); check(n && n.xong.length === 2 && n.xong.includes('hoi-lumina') && n.xong.includes('xem-thanh-tich'), 'tải lại giữ đúng 2 việc đã tích');
    // Thu gọn và nhớ
    await pg.click('#bb-nv-gon'); n = await nvs(pg); check(n.gon === true && !(await rect(pg, '#bb-nv-ds')).on, 'thu gọn: bảng chỉ còn một dòng');
    await pg.reload(); await vao(pg); n = await nvs(pg); check(n.gon === true, 'trạng thái thu gọn được nhớ');
    await pg.click('#bb-nv-gon'); n = await nvs(pg); check(n.gon === false, 'bấm lại thì mở ra');
    // Làm nốt: Bảng tin, Hành trình (đứng ở thẻ), thầy Tu Phan
    for (const [noi, viec] of [['bang-tin', 'doc-bang-tin'], ['hanh-trinh', 'ghe-hanh-trinh'], ['thay-tu', 'hoi-thay-tu']]) {
      await pg.evaluate(id => window.__benBizon.goTo(id), noi); await until(pg, id => window.__benBizon.state().near === id, noi, 8000);
      if (noi !== 'hanh-trinh') { await pg.click('.dc-card .dc-vao'); await pg.waitForTimeout(200); await pg.click('#bb-dlg-close').catch(() => {}); }
      check(await until(pg, v => window.__benBizon.state().nhiemVu.xong.includes(v), viec, 5000), 'tích việc ' + viec + (noi === 'hanh-trinh' ? ' (chỉ cần tới thẻ, không phải vào trang)' : ''));
    }
    n = await nvs(pg); check(n.xong.length === 5 && n.hoanThanh === true, 'xong cả 5 việc: nhiệm vụ hoàn thành');
    check(/Bến Phù Sa/.test(await pg.textContent('#bb-nv')) && (await rect(pg, '#bb-nv-tiep')).on, 'hiện lời chúc và nút tới Bến Phù Sa');
    await pg.click('#bb-nv-tiep'); check(await until(pg, () => window.__benBizon.state().near === 'ben-phu-sa', null, 8000), 'nút gợi ý đưa tới Bến Phù Sa');
    check(!(await rect(pg, '#bb-nv-ds')).on && /Đã xong/.test(await pg.textContent('#bb-nv')), 'xong rồi: bảng thu thành một dòng «Đã xong»');
    check(pg.errs.length === 0, 'không có lỗi trang' + (pg.errs[0] ? ': ' + pg.errs[0] : ''));
    await ctx.close();

    // ---- 2. Đã ghé Hành trình 3 bậc từ trước: việc đó tích sẵn; tiếng Anh
    [ctx, pg] = await open({ lang: 'en', init: () => { try { localStorage.setItem('bizon-hub3d-visited', JSON.stringify(['hanh-trinh.html'])); } catch (e) {} } });
    await vao(pg, 'cfo'); n = await nvs(pg);
    check(n && n.xong.includes('ghe-hanh-trinh'), 'đã ghé hanh-trinh.html từ trước: việc «Ghé Hành trình 3 bậc» tích sẵn');
    check(/Ask Lumina/i.test(await pg.textContent('#bb-nv')) && /1\s*\/\s*5/.test(await pg.textContent('#bb-nv')), 'tiếng Anh: bảng ghi bằng tiếng Anh, 1/5');
    await pg.evaluate(() => { localStorage.setItem('bizon-lang', 'vi'); window.dispatchEvent(new CustomEvent('bizon:langchange', { detail: { lang: 'vi' } })); });
    check(await until(pg, () => /Hỏi đường Lumina/.test(document.querySelector('#bb-nv').textContent), null, 3000), 'đổi VI/EN: bảng đổi ngôn ngữ ngay');
    await ctx.close();

    // ---- 3. Không chồng lấn ở 360/390/412 px, dọc và ngang; không tràn ngang
    for (const [w, h] of [[360, 740], [390, 664], [412, 839], [740, 360], [844, 390], [1280, 800]]) {
      [ctx, pg] = await open({ w, h, mobile: w < 900 });
      await vao(pg, 'coo');
      if (h < 420) check((await nvs(pg)).gon === true, w + '×' + h + ': màn thấp thì bảng tự thu gọn');
      const r = { nv: await rect(pg, '#bb-nv'), exit: await rect(pg, '#bb-exit'), goc: await rect(pg, '#bb-goc'), go: await rect(pg, '.dc-goto-btn'), joy: await rect(pg, '.dc-joy'), note: await rect(pg, '#bb-note') };
      await pg.evaluate(() => window.__benBizon.goTo('bat-nghiep')); await until(pg, () => window.__benBizon.state().near === 'bat-nghiep', null, 8000);
      r.the = await rect(pg, '.dc-card');
      const dung = ['exit', 'goc', 'go', 'joy', 'the', 'note'].filter(k => overlap(r.nv, r[k]));
      check(r.nv.on && dung.length === 0, w + '×' + h + ': bảng nhiệm vụ không chồng ' + (dung.join(', ') || 'nút nào'));
      check(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth), w + '×' + h + ': không tràn ngang');
      await ctx.close();
    }

    // ---- 4. localStorage bị chặn: vẫn chạy trong lượt chơi, không lỗi
    [ctx, pg] = await open({ init: () => { const chan = () => { throw new Error('chặn'); }; try { Object.defineProperty(window, 'localStorage', { get: chan }); } catch (e) {} } });
    check(await vao(pg, 'sec'), 'localStorage bị chặn: vẫn vào bến');
    n = await nvs(pg); check(n && n.tong === 5, 'localStorage bị chặn: bảng vẫn chạy');
    check(pg.errs.length === 0, 'localStorage bị chặn: không lỗi trang' + (pg.errs[0] ? ': ' + pg.errs[0] : ''));
    await ctx.close();

    // ---- 5. Giảm chuyển động: dùng được đầy đủ
    [ctx, pg] = await open({ reduce: true, w: 1280, h: 800 });
    await vao(pg); await pg.click('#bb-nv-dan');
    check(await until(pg, () => window.__benBizon.state().near === 'lumina', null, 8000), 'giảm chuyển động: «Dẫn đường» vẫn chạy');
    await ctx.close();
  } finally { await b.close(); }
  console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\nben-bizon-nhiem-vu: ok');
  process.exit(fails ? 1 : 0);
})();
