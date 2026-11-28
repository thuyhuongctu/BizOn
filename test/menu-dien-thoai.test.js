/* Menu điện thoại một tầng (28/11/2026, rà UX trang chủ – docs/ux/ux-trang-chu-2026-11-28.md). Trước đây ≤ 1199 px thanh menu có
 * hai tầng (hàng mục trang cuộn ngang), cao ~150 px và dính suốt khi cuộn (18 % màn 844 px). Kiểm:
 * - ≤ 820 px: hàng 2 ẩn, nút ☰ hiện (≥ 40 px), thanh menu ≤ 100 px, thanh không tràn ở 320–390 px, trang không tràn ngang;
 * - bấm ☰: bảng hiện đủ 10 mục, đánh dấu trang hiện tại, mỗi mục ≥ 44 px, nằm trong màn hình; tiêu điểm vào mục đầu;
 *   aria-expanded đổi; Esc đóng và trả tiêu điểm về ☰; bấm ra ngoài thì đóng; bấm một mục thì sang trang đó;
 * - ≤ 440 px: nút sáng/tối chuyển vào bảng và vẫn đổi được chế độ; bảng có lối tải app;
 * - tiếng Anh: nhãn nút và mục bảng bằng tiếng Anh;
 * - máy tính (1 280 px): không có ☰, hàng mục trang trên thanh như cũ; máy tính bảng 900 px vẫn có hàng 2 như cũ;
 * - css/bizon-clay-chrome.css được sinh lại (trang công cụ cũ cũng có menu mới); không lỗi JS. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
const nav = R('js/bizon-clay-nav.js');
assert.match(nav, /class="cn-menu" aria-expanded="false" aria-controls="cn-panel"/, 'nút ☰ có aria-expanded, aria-controls');
assert.match(nav, /<button type="button" class="cn-menu"/, 'nút ☰ là button có type');
for (const f of ['css/bizon-clay.css', 'css/bizon-clay-chrome.css']) assert.match(R(f), /@media \(max-width:820px\)\{\s*#clay-nav \.cn-row2\{display:none\}/, f + ': ≤ 820 px ẩn hàng 2');
assert.ok(+(R('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 1019, 'sw.js tăng phiên bản');

const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); let fails = 0;
  const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
  const errs = [];
  async function mo(w, h, url, lang) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 900, isMobile: w < 900 });
    await ctx.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); localStorage.removeItem('bizon-theme'); } catch (e) {} }, lang || 'vi');
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(url + ': ' + e.message));
    await pg.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await pg.route(/\.(mp3|m4a|mp4)(\?|$)/, r => r.abort());
    await pg.goto(BASE + '/' + url, { waitUntil: 'load', timeout: 60000 }); await pg.waitForSelector('#clay-nav'); await pg.waitForTimeout(500);
    return { ctx, pg };
  }
  const doc = pg => pg.evaluate(() => {
    const n = document.getElementById('clay-nav'), bar = n.querySelector('.cn-bar'), m = n.querySelector('.cn-menu'), r2 = n.querySelector('.cn-row2');
    const mr = m.getBoundingClientRect(), rr = n.querySelector('.cn-right'), con = [...rr.children].filter(e => getComputedStyle(e).display !== 'none');
    const can = con.reduce((a, e) => a + e.getBoundingClientRect().width, 0) + (parseFloat(getComputedStyle(rr).columnGap) || 0) * (con.length - 1);
    const du = rr.getBoundingClientRect().right - n.querySelector('.cn-brand').getBoundingClientRect().right - (parseFloat(getComputedStyle(bar).columnGap) || 0) - can;   // chỗ dư thật trên thanh
    return { du, navH: n.getBoundingClientRect().height, barTran: bar.scrollWidth - bar.clientWidth, sw: document.documentElement.scrollWidth - innerWidth,
      menu: getComputedStyle(m).display !== 'none' ? Math.min(mr.width, mr.height) : 0, row2: getComputedStyle(r2).display !== 'none',
      links: getComputedStyle(n.querySelector('.cn-links')).display !== 'none', theme: (n.querySelector('.cn-theme') && getComputedStyle(n.querySelector('.cn-theme')).display !== 'none') };
  });
  const bang = pg => pg.evaluate(() => {
    const p = document.getElementById('cn-panel'), r = p.getBoundingClientRect(), a = [...p.querySelectorAll('.cn-plinks a')];
    const nut = [...p.querySelectorAll('a,button')].filter(e => e.getBoundingClientRect().width > 0);
    return { mo: !p.hidden && r.height > 0, n: a.length, cur: (a.find(x => x.getAttribute('aria-current') === 'page') || {}).textContent, nho: nut.filter(e => e.getBoundingClientRect().height < 44).length,
      trong: r.left >= 0 && r.right <= innerWidth, dau: document.activeElement === a[0], exp: document.querySelector('.cn-menu').getAttribute('aria-expanded'),
      chu: a.map(x => x.textContent.trim()), theme: (() => { const t = p.querySelector('.cn-ptheme'); return t && getComputedStyle(t).display !== 'none' ? t.textContent.trim() : null; })(), app: p.querySelectorAll('.cn-pextra a').length };
  });

  for (const [w, h, url] of [[320, 700, 'index.html'], [360, 760, 'index.html'], [390, 844, 'games.html'], [390, 844, 'lab/ie-lab.html'], [441, 800, 'index.html'], [501, 800, 'index.html'], [768, 1000, 'index.html']]) {
    const tag = w + ' ' + url;
    const { ctx, pg } = await mo(w, h, url);
    const d = await doc(pg);
    ok(!d.row2 && d.menu >= 40 && d.navH <= 100, tag + ': một tầng (cao ' + Math.round(d.navH) + ' px), hàng 2 ẩn, nút ☰ ' + Math.round(d.menu) + ' px');
    ok(d.barTran <= 1 && d.sw <= 1, tag + ': thanh menu và trang không tràn ngang');
    ok(d.du >= 8, tag + ': thanh còn dư ' + Math.round(d.du) + ' px (≥ 8 px, phòng phông chữ máy CI rộng hơn)');
    await pg.click('#clay-nav .cn-menu'); await pg.waitForTimeout(150);
    const p = await bang(pg);
    ok(p.mo && p.n === 10 && p.exp === 'true' && p.dau, tag + ': bấm ☰: bảng mở, đủ 10 mục, aria-expanded = true, tiêu điểm vào mục đầu');
    ok(!p.nho && p.trong, tag + ': mọi nút trong bảng ≥ 44 px, bảng nằm trong màn hình');
    if (url === 'games.html') ok(p.cur === 'Trò chơi', tag + ': đánh dấu trang hiện tại («' + p.cur + '»)');
    ok(p.app >= 2, tag + ': bảng có lối tải app (Android, iPhone)');
    if (url === 'index.html' || url === 'games.html') ok(url === 'index.html' ? (w <= 500) === await pg.isVisible('#clay-nav .cn-preload') : !(await pg.isVisible('#clay-nav .cn-preload')), tag + ': nút «⟳ Làm mới trang» trong bảng chỉ có ở trang chủ ≤ 500 px');
    if (w <= 500 && url !== 'lab/ie-lab.html') {
      ok(!d.theme && p.theme, tag + ': ≤ 500 px: nút sáng/tối chuyển vào bảng («' + p.theme + '»)');
      const t0 = await pg.evaluate(() => document.documentElement.getAttribute('data-theme'));
      await pg.click('#clay-nav .cn-ptheme'); await pg.waitForTimeout(200);
      const t1 = await pg.evaluate(() => document.documentElement.getAttribute('data-theme'));
      ok(t1 !== t0, tag + ': nút sáng/tối trong bảng đổi được chế độ (' + t0 + ' → ' + t1 + ')');
    }
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(100);
    ok(await pg.evaluate(() => document.getElementById('cn-panel').hidden && document.activeElement.classList.contains('cn-menu')), tag + ': Esc đóng bảng, tiêu điểm về ☰');
    await pg.click('#clay-nav .cn-menu'); await pg.mouse.click(w / 2, h - 20); await pg.waitForTimeout(100);
    ok(await pg.evaluate(() => document.getElementById('cn-panel').hidden), tag + ': bấm ra ngoài thì bảng đóng');
    if (url === 'index.html' && w === 360) {
      await pg.click('#clay-nav .cn-menu');
      await Promise.all([pg.waitForURL(/games\.html/, { timeout: 15000 }), pg.click('#clay-nav .cn-plinks a[href="games.html"]')]);
      ok(/games\.html$/.test(pg.url()), tag + ': bấm «Trò chơi» trong bảng thì sang trang Trò chơi');
    }
    await ctx.close();
  }
  // tiếng Anh
  { const { ctx, pg } = await mo(390, 844, 'index.html', 'en');
    const lb = await pg.getAttribute('#clay-nav .cn-menu', 'aria-label');
    await pg.click('#clay-nav .cn-menu'); await pg.waitForTimeout(150);
    const p = await bang(pg);
    ok(lb === 'Open menu' && p.chu[0] === 'Home' && /Light \/ dark/.test(p.theme || ''), 'EN: nhãn «' + lb + '», mục «' + p.chu[0] + '», nút «' + p.theme + '»');
    ok(await pg.getAttribute('#clay-nav .cn-menu', 'aria-label') === 'Close menu', 'EN: bảng mở thì nhãn nút là «Close menu»');
    await ctx.close(); }
  // máy tính và máy tính bảng ngang: như cũ
  for (const [w, h, coLinks] of [[1280, 860, true], [900, 700, false]]) {
    const { ctx, pg } = await mo(w, h, 'index.html');
    const d = await doc(pg);
    ok(!d.menu && (coLinks ? d.links : d.row2), w + ' px: không có ☰, mục trang ' + (coLinks ? 'trên thanh' : 'ở hàng 2') + ' như cũ');
    await ctx.close();
  }
  ok(!errs.length, 'không lỗi JS' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  if (fails) { console.error('menu-dien-thoai: ' + fails + ' lỗi'); process.exit(1); }
  console.log('menu-dien-thoai: ok');
})().catch(e => { console.error(e); process.exit(1); });
