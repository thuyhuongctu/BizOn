/* Bến BizOn – câu hỏi nhanh ở mỗi điểm game (đặc tả specs/003-ben-bizon-nhiem-vu, câu chuyện 3, 11/11/2026).
 * Sau khi xong «Làm quen», thẻ của 6 điểm game có thêm nút «Câu hỏi nhanh» cạnh «Vào»: một câu 3 lựa chọn. Chọn sai chỉ hiện
 * gợi ý chỗ đọc lại (không lộ đáp án) và chọn lại được; chọn đúng tích việc trong nhiệm vụ «Một vòng quanh bến». Nút «Vào»
 * vẫn mở đúng game như cũ. Kiểm dữ liệu (đủ 6 câu, VI/EN, đúng một đáp án), 360 px dọc và ngang, tiếng Anh, phím Escape. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), { pathToFileURL } = require('node:url');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

const GAME = ['ben-phu-sa', 'bat-nghiep', 'hc-thuong-hieu', 'hc-sau-rieng', 'arcade', 'hanh-trinh'];
const LAM_QUEN = ['hoi-lumina', 'doc-bang-tin', 'ghe-hanh-trinh', 'hoi-thay-tu', 'xem-thanh-tich'];
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const nvs = pg => pg.evaluate(() => (window.__benBizon.state() || {}).nhiemVu || null);
const until = (pg, fn, arg, timeout = 20000) => pg.waitForFunction(fn, arg, { timeout, polling: 100 }).then(() => true, () => false);
const rect = (pg, sel) => pg.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(), c = getComputedStyle(e);
  return { x: r.left, y: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom, on: c.display !== 'none' && c.visibility !== 'hidden' && r.width > 0 && r.height > 0 }; }, sel);
const overlap = (a, b) => a && b && a.on && b.on && a.x < b.r - 0.5 && b.x < a.r - 0.5 && a.y < b.b - 0.5 && b.y < a.b - 0.5;

(async () => {
  // ---- Kiểm tĩnh và dữ liệu
  const sw = read('sw.js'), html = read('hub-3d.html');
  check(+(/CACHE = 'bizon-v(\d+)'/.exec(sw) || [])[1] >= 833, 'sw.js ≥ bizon-v833');
  check(sw.includes("'./js/ben-bizon-cau-hoi.js'"), 'sw.js lưu sẵn js/ben-bizon-cau-hoi.js');
  check(/<div id="bb-dlg-chon" role="group"/.test(html) && /<p id="bb-dlg-phan" aria-live="polite"/.test(html), 'hộp thoại có nhóm lựa chọn và dòng phản hồi đọc được bằng trình đọc màn hình');
  const { CAU_HOI } = await import(pathToFileURL(path.join(__dirname, '..', 'js/ben-bizon-cau-hoi.js')).href);
  check(GAME.every(id => CAU_HOI[id]) && Object.keys(CAU_HOI).length === 6, 'đủ 6 câu, mỗi điểm game một câu: ' + Object.keys(CAU_HOI).join(', '));
  const coVaEn = v => v && typeof v.vi === 'string' && v.vi && typeof v.en === 'string' && v.en;
  for (const id of GAME) {
    const q = CAU_HOI[id]; if (!q) continue;
    check(coVaEn(q.hoi) && coVaEn(q.goiY) && Array.isArray(q.chon) && q.chon.length === 3 && q.chon.every(coVaEn), id + ': 3 lựa chọn, câu hỏi và gợi ý có bản VI/EN');
    check(Number.isInteger(q.dung) && q.dung >= 0 && q.dung < 3 && new Set(q.chon.map(c => c.vi)).size === 3, id + ': đúng một đáp án, các lựa chọn khác nhau');
    check(!q.goiY.vi.includes(q.chon[q.dung].vi) && !q.goiY.en.includes(q.chon[q.dung].en), id + ': gợi ý không chép lại đáp án');
  }

  const b = await chromium.launch({ args: ARGS });
  const open = async (o = {}) => {
    const ctx = await b.newContext({ viewport: { width: o.w || 390, height: o.h || 664 }, hasTouch: true, isMobile: !!o.mobile });
    const pg = await ctx.newPage(); pg.errs = []; pg.on('pageerror', e => pg.errs.push(e.message)); pg.setDefaultTimeout(15000);
    // «Vào» chuyển trang: chặn trang game nặng, chỉ cần biết đã đi đúng địa chỉ
    await pg.route(/ben-phu-sa-3d\.html/, r => r.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>BPS</title>' }));
    await pg.addInitScript(([l, daXong]) => { try { if (!sessionStorage.getItem('da-xoa')) { localStorage.clear(); sessionStorage.setItem('da-xoa', '1');
      if (daXong) localStorage.setItem('bizon-ben-nhiem-vu', JSON.stringify({ xong: daXong, daChuc: ['lam-quen'] })); } localStorage.setItem('bizon-lang', l); } catch (e) {} },
      [o.lang || 'vi', o.lamQuenXong ? LAM_QUEN : null]);
    await pg.goto(BASE + '/hub-3d.html'); return [ctx, pg];
  };
  const vao = async (pg, v = 'ceo') => { await pg.click('#bb-pick [data-vai="' + v + '"]'); return until(pg, () => window.__benBizon && window.__benBizon.state().ready, null, 90000); };
  const toi = async (pg, id) => { await pg.evaluate(i => window.__benBizon.goTo(i), id); return until(pg, i => window.__benBizon.state().near === i, id, 8000); };
  try {
    // ---- 1. Chưa xong «Làm quen»: chưa có câu hỏi nhanh
    let [ctx, pg] = await open();
    check(await vao(pg), 'vào bến được');
    await toi(pg, 'ben-phu-sa');
    check(!(await rect(pg, '.dc-card .dc-phu')).on && (await nvs(pg)).moVongQuanh === false, 'chưa xong «Làm quen»: thẻ chưa có «Câu hỏi nhanh», nhiệm vụ thứ hai chưa mở');
    await ctx.close();

    // ---- 2. Đã xong «Làm quen» (390 × 664)
    [ctx, pg] = await open({ lamQuenXong: true, mobile: true }); await vao(pg, 'cfo');
    let n = await nvs(pg);
    check(n.dangTheo === 'vong-quanh' && n.tong === 6 && n.xong.length === 5, 'xong «Làm quen»: bảng hiện «Một vòng quanh bến», 0/6');
    await toi(pg, 'ben-phu-sa');
    const nut = await rect(pg, '.dc-card .dc-phu');
    check(nut && nut.on && nut.w >= 44 && nut.h >= 44 && /Câu hỏi nhanh/.test(await pg.textContent('.dc-card .dc-phu')), 'thẻ Bến Phù Sa có nút «Câu hỏi nhanh» ≥ 44 × 44 px');
    check((await rect(pg, '.dc-card .dc-vao')).on, 'nút «Vào» vẫn ở trên thẻ');
    await pg.click('.dc-card .dc-phu');
    check(await until(pg, () => document.querySelector('#bb-dlg').classList.contains('on') && document.querySelectorAll('#bb-dlg-chon .cq').length === 3, null, 3000), 'mở câu hỏi: hộp thoại có 3 lựa chọn');
    check(/Ở Bến Phù Sa/.test(await pg.textContent('#bb-dlg-text')), 'hiện câu hỏi của Bến Phù Sa');
    check(!(await rect(pg, '#bb-dlg-cta')).on, 'không hiện nút 🧭 rỗng trong hộp câu hỏi (lỗi cũ: luật CSS ẩn nút bị luật khác đè)');
    const q = CAU_HOI['ben-phu-sa'], sai = (q.dung + 1) % 3;
    await pg.click('#bb-dlg-chon .cq[data-i="' + sai + '"]');
    const phan = await pg.textContent('#bb-dlg-phan');
    check((await rect(pg, '#bb-dlg-phan')).on && /Gợi ý/.test(phan) && !phan.includes(q.chon[q.dung].vi), 'chọn sai: hiện gợi ý, không lộ đáp án');
    check(await pg.evaluate(i => document.querySelector('#bb-dlg-chon .cq[data-i="' + i + '"]').disabled, sai) && await pg.evaluate(() => [...document.querySelectorAll('#bb-dlg-chon .cq')].filter(x => !x.disabled).length === 2), 'chọn sai: lựa chọn đó mờ đi, còn 2 lựa chọn chọn lại được');
    check(!(await nvs(pg)).xong.includes('cau-ben-phu-sa'), 'chọn sai: chưa tích việc');
    await pg.click('#bb-dlg-chon .cq[data-i="' + q.dung + '"]');
    check(/Đúng rồi/.test(await pg.textContent('#bb-dlg-phan')) && (await nvs(pg)).xong.includes('cau-ben-phu-sa'), 'chọn đúng: báo «Đúng rồi» và tích việc «Bến Phù Sa» trong «Một vòng quanh bến»');
    check(/1\s*\/\s*6/.test(await pg.textContent('#bb-nv')), 'bảng nhiệm vụ ghi 1/6');
    await pg.click('#bb-dlg-close');
    check(!(await pg.evaluate(() => document.querySelector('#bb-dlg').classList.contains('on'))), 'đóng được hộp thoại');
    // Escape cũng đóng
    await pg.click('.dc-card .dc-phu'); await pg.keyboard.press('Escape');
    check(!(await pg.evaluate(() => document.querySelector('#bb-dlg').classList.contains('on'))), 'phím Escape đóng câu hỏi');
    // «Vào» vẫn mở đúng game
    await pg.click('.dc-card .dc-vao');
    check(await pg.waitForURL(/ben-phu-sa-3d\.html/, { timeout: 8000 }).then(() => true, () => false), 'nút «Vào» vẫn mở đúng game (ben-phu-sa-3d.html)');
    check(pg.errs.length === 0, 'không lỗi trang' + (pg.errs[0] ? ': ' + pg.errs[0] : ''));
    await ctx.close();

    // ---- 3. Trả lời đủ 6 câu (máy tính, tiếng Anh): xong nhiệm vụ thứ hai
    [ctx, pg] = await open({ lamQuenXong: true, lang: 'en', w: 1280, h: 800 }); await vao(pg, 'coo');
    await toi(pg, 'arcade');
    check(/Quick quiz/.test(await pg.textContent('.dc-card .dc-phu')), 'tiếng Anh: nút «Quick quiz»');
    await pg.click('.dc-card .dc-phu');
    check(/BizOn Arcade game/.test(await pg.textContent('#bb-dlg-text')) && /A few minutes/.test(await pg.textContent('#bb-dlg-chon')), 'tiếng Anh: câu hỏi và lựa chọn bằng tiếng Anh');
    await pg.click('#bb-dlg-close');
    for (const id of GAME) {
      await toi(pg, id); await pg.click('.dc-card .dc-phu');
      await pg.click('#bb-dlg-chon .cq[data-i="' + CAU_HOI[id].dung + '"]'); await pg.click('#bb-dlg-close');
    }
    n = await nvs(pg);
    check(n.xongHet === true && n.dangTheo === 'vong-quanh' && n.hoanThanh === true, 'trả lời đúng cả 6 câu: xong «Một vòng quanh bến»');
    check((await rect(pg, '#bb-nv-chuc')).on && (await rect(pg, '#bb-nv-tiep')).on, 'hiện lời chúc và nút đóng lời chúc');
    await pg.click('#bb-nv-tiep');
    check(!(await rect(pg, '#bb-nv-ds')).on && /Done/.test(await pg.textContent('#bb-nv')), 'xong hết: bảng thu thành một dòng «Done»');
    check(pg.errs.length === 0, 'không lỗi trang' + (pg.errs[0] ? ': ' + pg.errs[0] : ''));
    await ctx.close();

    // ---- 4. Thẻ có hai nút không chồng nút khác, không tràn ngang ở điện thoại dọc và ngang
    for (const [w, h] of [[360, 740], [412, 839], [740, 360], [844, 390]]) {
      [ctx, pg] = await open({ lamQuenXong: true, w, h, mobile: true }); await vao(pg, 'sec');
      await toi(pg, 'hc-thuong-hieu');
      const r = { the: await rect(pg, '.dc-card'), phu: await rect(pg, '.dc-card .dc-phu'), joy: await rect(pg, '.dc-joy'), chay: await rect(pg, '#bb-chay'), goc: await rect(pg, '#bb-goc'), exit: await rect(pg, '#bb-exit'), go: await rect(pg, '.dc-goto-btn') };
      const dung = ['joy', 'chay', 'goc', 'exit', 'go'].filter(k => overlap(r.the, r[k]));
      check(r.phu.on && r.the.x >= 0 && r.the.r <= w && r.the.y >= 0, w + '×' + h + ': thẻ có hai nút, nằm trong màn hình');
      check(dung.length === 0, w + '×' + h + ': thẻ không chồng nút khác ' + dung.join(', '));
      check(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth), w + '×' + h + ': không tràn ngang');
      await ctx.close();
    }
  } finally { await b.close(); }
  console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\nben-bizon-cau-hoi: ok');
  process.exit(fails ? 1 : 0);
})();
