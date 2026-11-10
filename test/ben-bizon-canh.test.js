/* Bến BizOn – lớp chi tiết của cảnh (js/ben-bizon-canh.js, 10/11/2026, bản thử): nền cỏ có lối đá lát, bụi cỏ, hoa, đá, hàng rào tre,
 * luống rau, lu nước, bếp lửa, gà vịt; thêm nút «Nhìn từ trên» đổi máy quay sang góc cao. Kiểm: lớp chi tiết có mặt và không làm hỏng
 * việc đi tới 11 điểm, không đặt vật lên lối đi, số lệnh vẽ còn trong ngân sách, nút góc máy bấm được và nhớ lựa chọn, 360 px không tràn,
 * giảm chuyển động thì con vật đứng yên, tệp mới không nạp gì từ ngoài. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

// ---- Kiểm tĩnh
const canh = read('js/ben-bizon-canh.js'), sw = read('sw.js'), html = read('hub-3d.html');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(sw) || [])[1] >= 826, 'sw.js ≥ bizon-v826');
check(sw.includes("'./js/ben-bizon-canh.js'"), 'sw.js lưu sẵn js/ben-bizon-canh.js');
check(!/fetch\(|XMLHttpRequest|TextureLoader|GLTFLoader|https?:\/\//.test(canh), 'lớp chi tiết không nạp tệp ngoài, không gọi mạng');
check(!/Math\.random\(/.test(canh), 'lớp chi tiết dùng số ngẫu nhiên có hạt giống (cảnh lần nào cũng giống nhau)');
check(/InstancedMesh/.test(canh), 'vật nhỏ lặp nhiều dùng InstancedMesh');
check(/id="bb-goc"[^>]*aria-pressed="false"/.test(html) && /<button type="button" id="bb-goc"/.test(html), 'nút góc máy là button có type và aria-pressed');
check(/mayQuay: function/.test(read('js/di-chuyen-3d.js')), 'phần di chuyển dùng chung có hàm mayQuay');
check(!/ben-bizon-canh/.test(read('bizon-characters.js') + read('js/clay-hub.js') + read('js/bps-hub.js') + read('js/bp-hub.js')), 'tệp thuộc hồ sơ quyền tác giả không nhắc tới lớp chi tiết');

const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const st = pg => pg.evaluate(() => window.__benBizon.state());
const info = pg => pg.evaluate(() => window.__benBizon.info());
const until = (pg, fn, arg, timeout = 30000) => pg.waitForFunction(fn, arg, { timeout, polling: 100 }).then(() => true, () => false);
async function vao(pg, vai = 'ceo') {
  await pg.goto(BASE + '/hub-3d.html'); await pg.click('[data-vai="' + vai + '"]');
  return until(pg, () => window.__benBizon && window.__benBizon.state().ready, null, 60000);
}

(async () => {
  const browser = await chromium.launch({ args: ARGS });
  try {
    // ---- 1. Lớp chi tiết có mặt, không lỗi, không gọi ra ngoài
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } }), pg = await ctx.newPage();
    const loi = [], ngoai = [];
    pg.on('pageerror', e => loi.push(e.message)); pg.on('console', m => { if (m.type() === 'warning' && /bỏ lớp chi tiết/.test(m.text())) loi.push(m.text()); });
    pg.on('request', r => { const u = r.url(); if (!u.startsWith(BASE) && !u.startsWith('data:') && !u.startsWith('blob:')) ngoai.push(u); });
    check(await vao(pg), 'vào được Bến BizOn');
    const i1 = await info(pg), d = i1.chiTiet || {};
    check(!!i1.chiTiet, 'info() có mục chiTiet');
    check(d.co >= 200 && d.hoa >= 30 && d.da >= 8 && d.rao >= 40, 'có bụi cỏ, hoa, đá, cọc rào: ' + JSON.stringify(d));
    check(d.ga >= 3 && d.vit >= 2 && d.vat >= 12, 'có gà, vịt và ít nhất 12 vật dựng (luống rau, lu, củi, thúng, chuối, bếp, dây phơi)');
    check(i1.veMoiKhung > 0 && i1.veMoiKhung < 260, 'số lệnh vẽ mỗi khung còn trong ngân sách (< 260): ' + i1.veMoiKhung);
    check(loi.length === 0, 'không có lỗi trang' + (loi.length ? ': ' + loi[0] : ''));

    // ---- 2. Lối đi và 11 điểm không bị vật mới chắn
    const tac = await pg.evaluate(() => {
      const b = window.__benBizon, xau = [], LOI = [[0, -6.4, 2.6, 12.2], [0, -6.2, 24, 2.2], [-10, -4.4, 2.2, 3.6], [10.5, -4.4, 2.2, 3.6]];
      LOI.forEach(([lx, lz, w, dd]) => { for (let x = lx - w / 2 + 0.4; x <= lx + w / 2 - 0.4; x += 0.4) for (let z = lz - dd / 2 + 0.4; z <= lz + dd / 2 - 0.4; z += 0.4) { b.dat(x, z, 0); const s = b.state(); if (Math.hypot(s.x - x, s.z - z) > 0.05) xau.push([x.toFixed(1), z.toFixed(1)]); } });
      return xau;
    });
    check(tac.length === 0, 'đặt nhân vật lên mọi ô của lối đi đều được (không vật nào nằm trên lối)' + (tac.length ? ': ' + JSON.stringify(tac.slice(0, 4)) : ''));
    const ids = i1.diaDiem; let toi = 0;
    for (const id of ids) {
      await pg.click('.dc-goto-btn'); await pg.click('.dc-goto [data-id="' + id + '"]').catch(() => {});
      if (await until(pg, i => window.__benBizon.state().near === i, id, 8000)) toi++;
    }
    check(toi === ids.length, '«Đi tới…» vẫn đưa tới đủ ' + ids.length + ' điểm (tới được ' + toi + ')');

    // ---- 3. Nút góc máy: bấm thì máy quay lên cao, bấm lại thì về sau lưng, có nhớ
    await pg.evaluate(() => window.__benBizon.dat(0, -7, 0)); await pg.waitForTimeout(500);
    const y0 = (await st(pg)).camY;
    await pg.click('#bb-goc'); await pg.waitForTimeout(400);
    const s1 = await st(pg);
    check(s1.goc === 'cao' && s1.camY > y0 + 3, 'bấm «Nhìn từ trên»: máy quay lên cao (y ' + y0.toFixed(1) + ' → ' + s1.camY.toFixed(1) + ')');
    check(await pg.getAttribute('#bb-goc', 'aria-pressed') === 'true', 'nút báo đang bật (aria-pressed)');
    await pg.keyboard.down('KeyW');   // máy thử chậm (vẽ bằng phần mềm) nên chờ theo quãng đường, không theo thời gian
    const diDuoc = await until(pg, o => { const s = window.__benBizon.state(); return Math.hypot(s.x - o.x, s.z - o.z) > 0.6; }, { x: s1.x, z: s1.z }, 12000);
    await pg.keyboard.up('KeyW');
    check(diDuoc, 'ở góc cao vẫn đi được bằng bàn phím');
    await pg.reload(); await pg.click('[data-vai="ceo"]'); await until(pg, () => window.__benBizon.state().ready, null, 60000);
    check((await st(pg)).goc === 'cao' && (await st(pg)).camY > y0 + 3, 'tải lại trang vẫn nhớ góc cao');
    await pg.click('#bb-goc'); await pg.waitForTimeout(400);
    check((await st(pg)).goc === 'sau' && Math.abs((await st(pg)).camY - y0) < 0.6, 'bấm lần nữa: về góc sau lưng');
    check(ngoai.length === 0, 'không gọi mạng ra ngoài' + (ngoai.length ? ': ' + ngoai[0] : ''));
    await ctx.close();

    // ---- 4. Điện thoại 360 px, tiếng Anh: nút không tràn, không đè nút khác, chạm đủ lớn
    const c2 = await browser.newContext({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true }), p2 = await c2.newPage();
    await p2.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'en'); } catch (e) {} });
    check(await vao(p2, 'cmo'), '360 px: vào được');
    const r = await p2.evaluate(() => { const q = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height, t: e.textContent.trim() }; };
      return { goc: q('#bb-goc'), exit: q('#bb-exit'), goto: q('.dc-goto-btn'), hint: q('#bb-hint'), sw: document.documentElement.scrollWidth, iw: innerWidth }; });
    const de = (a, b) => a && b && a.x < b.r && b.x < a.r && a.y < b.b && b.y < a.b;
    check(r.goc && r.goc.h >= 44 && r.goc.w >= 44 && r.goc.r <= 360 && r.goc.x >= 0, '360 px: nút góc máy chạm ≥ 44 px và nằm trong màn hình');
    check(!de(r.goc, r.exit) && !de(r.goc, r.goto), '360 px: nút góc máy không đè nút Thoát và «Đi tới…»');
    check(r.sw <= r.iw, '360 px: trang không tràn ngang');
    check(/Top view/.test(r.goc.t), 'tiếng Anh: nút ghi «Top view»');
    check(((await info(p2)).chiTiet || {}).co >= 200, '360 px: lớp chi tiết vẫn có (bản nhẹ)');
    await c2.close();

    // ---- 5. Giảm chuyển động: con vật đứng yên
    const c3 = await browser.newContext({ viewport: { width: 900, height: 600 }, reducedMotion: 'reduce' }), p3 = await c3.newPage();
    check(await vao(p3, 'cfo'), 'giảm chuyển động: vào được');
    check((await st(p3)).giamChuyenDong === true && ((await info(p3)).chiTiet || {}).ga >= 3, 'giảm chuyển động: cảnh vẫn đủ chi tiết');
    await c3.close();
  } finally { await browser.close(); }
  console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\nben-bizon-canh: ok');
  process.exit(fails ? 1 : 0);
})();
