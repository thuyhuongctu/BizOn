/* Tranh động 2D (js/tranh-dong-2d.js, 10/11/2026): phát tờ sprite ngay tại chỗ một ảnh tĩnh có data-tranh-dong (dùng cho rồng Tèo Soi ở
 * trang chủ và Hộ Chiếu Sầu Riêng). Kiểm: tải xong thì khung phát nằm đúng chỗ ảnh, khung hình chạy, tờ «qua lại» không vượt số khung,
 * đổi được sang động tác «nói»; giảm chuyển động hoặc tờ sprite tải hỏng thì ảnh tĩnh ở nguyên; tệp không gọi mạng ngoài trang. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const js = read('js/tranh-dong-2d.js'), sw = read('sw.js');
check(!/https?:\/\//.test(js) && !/XMLHttpRequest|sendBeacon|eval\(/.test(js), 'tệp không gọi mạng ngoài trang');
check(sw.includes("'./js/tranh-dong-2d.js'"), 'sw.js lưu sẵn js/tranh-dong-2d.js');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(sw) || [])[1] >= 828, 'sw.js ≥ bizon-v828');

const TRANG = (dung, noi) => `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>thử</title><base href="${BASE}/"></head><body style="margin:0">
<div id="san" style="position:relative;width:600px;height:400px">
<img id="a" src="assets/character/teo-soi-wink-cut.webp" alt="" style="position:absolute;left:10%;bottom:20%;width:22%" data-tranh-dong="${dung}"${noi ? ` data-tranh-dong-noi="${noi}"` : ''}>
</div><script src="js/tranh-dong-2d.js"></script></body></html>`;
const TD = 'assets/character/tranh-dong/';
const until = (pg, fn, arg, timeout = 15000) => pg.waitForFunction(fn, arg, { timeout, polling: 50 }).then(() => true, () => false);
const r5ok = h => Math.abs(h[2] - h[3]) < 40;
const mo = async (ctx, dung, noi) => { const pg = await ctx.newPage(); await pg.goto(BASE + '/404.html'); await pg.setContent(TRANG(dung, noi), { waitUntil: 'load' }); return pg; };

(async () => {
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 800, height: 600 } }), loi = [];
    const pg = await mo(ctx, TD + 'cfo-dung', TD + 'cfo-di-truoc'); pg.on('pageerror', e => loi.push(e.message));
    check(await until(pg, () => document.querySelector('#a').tranhDong && document.querySelector('#a').tranhDong.sanSang), 'tờ sprite tải xong: sẵn sàng');
    const h = await pg.evaluate(() => { const a = document.querySelector('#a'), s = document.querySelector('.bz-tranh-dong'), ra = a.getBoundingClientRect(), rs = s.getBoundingClientRect(); return { an: getComputedStyle(a).visibility, l: [ra.left, rs.left], b: [ra.bottom, rs.bottom], w: [ra.width, rs.width], hs: rs.height, bg: getComputedStyle(s).backgroundImage, ah: s.getAttribute('aria-hidden') }; });
    check(h.an === 'hidden' && /cfo-dung\.webp/.test(h.bg) && h.ah === 'true', 'ảnh tĩnh ẩn đi, khung phát dùng tờ sprite và ẩn với trình đọc màn hình');
    check(Math.abs(h.l[0] - h.l[1]) < 1.5 && Math.abs(h.b[0] - h.b[1]) < 1.5 && Math.abs(h.w[0] - h.w[1]) < 1.5 && h.hs > 100, 'khung phát nằm đúng chỗ ảnh tĩnh (cùng mép trái, mép dưới, bề rộng): ' + JSON.stringify(h.l.concat(h.b, h.w).map(Math.round)));
    check(await until(pg, () => document.querySelector('#a').tranhDong.thongSo().khung >= 2), 'khung hình chạy');
    const ks = await pg.evaluate(() => new Promise(ok => { const t = document.querySelector('#a').tranhDong, ds = []; const id = setInterval(() => { ds.push(t.thongSo().khung); if (ds.length >= 40) { clearInterval(id); ok({ ds, n: t.thongSo().soKhung }); } }, 100); }));
    check(ks.ds.every(k => k >= 0 && k < ks.n) && new Set(ks.ds).size > 5, 'tờ «qua lại»: khung luôn trong khoảng 0…' + (ks.n - 1) + ' và có thay đổi');
    check(await pg.evaluate(() => document.querySelector('#a').tranhDong.dongTac('noi')) === 'noi' && /cfo-di-truoc\.webp/.test(await pg.evaluate(() => getComputedStyle(document.querySelector('.bz-tranh-dong')).backgroundImage)), 'đổi sang động tác «nói»: dùng tờ thứ hai');
    check(await pg.evaluate(() => document.querySelector('#a').tranhDong.dongTac('khong-co')) === 'noi', 'động tác không có tờ: giữ nguyên động tác đang phát');
    check(loi.length === 0, 'không có lỗi trang' + (loi.length ? ': ' + loi[0] : ''));
    // ảnh định vị bằng CSS của trang (như .hp-stage img ở trang chủ) và data-tranh-dong-kieu chỉnh riêng khung phát
    const p4 = await ctx.newPage(); await p4.goto(BASE + '/404.html');
    await p4.setContent(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>thử</title><base href="${BASE}/"><style>#san2 img{position:absolute}</style></head><body style="margin:0">
<div id="san2" style="position:relative;width:600px;height:400px"><img id="b" src="assets/character/teo-soi-wink-cut.webp" alt="" data-tranh-dong="${TD}teo-dung" data-tranh-dong-kieu="left:0%;width:30%" style="left:4%;bottom:36%;width:22%"></div>
<script src="js/tranh-dong-2d.js"></script></body></html>`, { waitUntil: 'load' });
    check(await until(p4, () => document.querySelector('#b').tranhDong && document.querySelector('#b').tranhDong.sanSang), 'ảnh định vị bằng CSS: tờ sprite tải xong');
    const h4 = await p4.evaluate(() => { const a = document.querySelector('#b').getBoundingClientRect(), s = document.querySelector('.bz-tranh-dong'), r = s.getBoundingClientRect(); return { pos: getComputedStyle(s).position, l: r.left, w: r.width, b: [a.bottom, r.bottom] }; });
    check(h4.pos === 'absolute' && Math.abs(h4.b[0] - h4.b[1]) < 1.5, 'ảnh định vị bằng CSS: khung phát cũng định vị tuyệt đối, cùng mép dưới với ảnh tĩnh: ' + JSON.stringify(h4));
    check(Math.abs(h4.l - 0) < 1.5 && Math.abs(h4.w - 180) < 1.5, 'data-tranh-dong-kieu: khung phát theo left:0%, width:30% (180 px)');
    await p4.close();
    // trang chủ: Tèo Soi ở sân khấu dùng tờ «teo-dung»; index.html và academia3d-v2.html giống hệt nhau
    const idx = read('index.html');
    check(/<img src="assets\/character\/teo-soi-wink-cut\.webp"[^>]*data-tranh-dong="assets\/character\/tranh-dong\/teo-dung"/.test(idx) && idx.includes('<script src="js/tranh-dong-2d.js" defer></script>'), 'trang chủ: ảnh Tèo Soi có data-tranh-dong và trang nạp js/tranh-dong-2d.js');
    check(idx === read('academia3d-v2.html'), 'index.html giống hệt academia3d-v2.html');
    const p5 = await ctx.newPage(), l5 = []; p5.on('pageerror', e => l5.push(e.message)); await p5.goto(BASE + '/index.html'); await p5.evaluate(() => document.querySelector('.hp-stage').scrollIntoView());
    check(await until(p5, () => { const a = document.querySelector('.hp-stage img[data-tranh-dong]'); return a && a.tranhDong && a.tranhDong.sanSang && a.tranhDong.thongSo().khung > 0; }), 'trang chủ: Tèo Soi động, khung hình chạy');
    const h5 = await p5.evaluate(() => { const a = document.querySelector('.hp-stage img[data-tranh-dong]').getBoundingClientRect(), r = document.querySelector('.hp-stage .bz-tranh-dong').getBoundingClientRect(); return [a.bottom, r.bottom, a.left, r.left]; });
    check(Math.abs(h5[0] - h5[1]) < 5 && r5ok(h5), 'trang chủ: Tèo Soi động đứng đúng chỗ ảnh cũ (cùng mép dưới, lệch trái ít): ' + JSON.stringify(h5.map(Math.round)));
    check(l5.length === 0, 'trang chủ: không có lỗi trang' + (l5.length ? ': ' + l5[0] : ''));
    await p5.close();
    // tờ sprite không có: ảnh tĩnh ở nguyên
    const p2 = await mo(ctx, TD + 'khong-co-to-nay');
    check(await until(p2, () => document.querySelector('#a').tranhDong && document.querySelector('#a').tranhDong.hong) && await p2.evaluate(() => getComputedStyle(document.querySelector('#a')).visibility === 'visible' && !document.querySelector('.bz-tranh-dong')), 'tờ sprite tải hỏng: ảnh tĩnh ở nguyên, không thêm khung phát');
    await ctx.close();
    // giảm chuyển động: không đụng vào trang
    const c3 = await browser.newContext({ viewport: { width: 800, height: 600 }, reducedMotion: 'reduce' }), p3 = await mo(c3, TD + 'cfo-dung');
    await p3.waitForTimeout(700);
    check(await p3.evaluate(() => window.BizOnTranhDong2D.giam === true && !document.querySelector('.bz-tranh-dong') && getComputedStyle(document.querySelector('#a')).visibility === 'visible'), 'giảm chuyển động: giữ ảnh tĩnh');
    await c3.close();
  } finally { await browser.close(); }
  console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\ntranh-dong-2d: ok');
  process.exit(fails ? 1 : 0);
})();
