/* Bến Phù Sa 3D (js/bps3d.js, 13/11/2026): cô Hương và thầy Tú gánh hàng đứng ở bến nhà là «tranh động» đứng thở, dựng từ chính tranh
 * gốc của game (assets/character/tranh-dong/huong-phusa-dung, tu-ganh-dung). Chị mở khóa hồ sơ quyền tác giả cho việc này (bản đã nộp
 * vẫn ở commit afbacd2). Kiểm: mặc định hai tờ sprite tải xong và khung hình chạy; ?nv=3d giữ ảnh tĩnh cũ; tờ sprite tải hỏng thì
 * quay về ảnh tĩnh, không lỗi trang; trang không nạp phần di chuyển dùng chung. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const js = read('js/bps3d.js');
check(/tranhDong\('tu-ganh-dung', 'assets\/character\/phu-sa\/tu-new\.png'/.test(js) && /tranhDong\('huong-phusa-dung', 'assets\/character\/phu-sa\/huong-new-v3\.webp'/.test(js), 'bến nhà dùng tranh động, ảnh tĩnh cũ làm đường lui');
for (const t of ['huong-phusa-dung', 'tu-ganh-dung']) {
  const j = JSON.parse(read('assets/character/tranh-dong/' + t + '.json'));
  check(j.quaLai === true && j.khung >= 12 && fs.statSync(path.join(__dirname, '..', 'assets/character/tranh-dong/' + t + '.webp')).size < 600000, t + ': tờ đứng thở hợp lệ, nhẹ hơn 600 KB');
}
check(fs.existsSync(path.join(__dirname, '..', 'assets/character/phu-sa/tu-new.png')) && fs.existsSync(path.join(__dirname, '..', 'assets/character/phu-sa/huong-new-v3.webp')), 'ảnh gốc giữ nguyên');
check(read('assets/models/SOURCES.md').includes('huong-phusa-dung'), 'SOURCES.md ghi nguồn hai tờ sprite');
check(!/di-chuyen-3d|BizOnDiChuyen/.test(js + read('ben-phu-sa-3d.html')), 'không nạp phần di chuyển dùng chung');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 841, 'sw.js ≥ bizon-v841');

const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const URL = BASE + '/ben-phu-sa-3d.html';
const until = (pg, fn, timeout = 60000) => pg.waitForFunction(fn, null, { timeout, polling: 200 }).then(() => true, () => false);
const st = pg => pg.evaluate(() => window.__bps3dTranh());
(async () => {
  const b = await chromium.launch({ args: ARGS });
  try {
    let pg = await b.newPage({ viewport: { width: 900, height: 640 } }); const loi = []; pg.on('pageerror', e => loi.push(e.message));
    await pg.goto(URL, { waitUntil: 'load' });
    check(await until(pg, () => window.__bps3dTranh && window.__bps3dTranh().every(t => t.sanSang)), 'mặc định: cô Hương và thầy Tú là tranh động, đã tải');
    // Chờ tới khi khung đổi (tối đa 15 giây) thay vì đúng 600 ms: trên máy CI vẽ bằng phần mềm, một khung hình có khi lâu hơn 600 ms,
    // nên hai lần đọc cách 600 ms từng ra cùng khung 0 dù tranh động vẫn chạy (CI của PR #1088, hai lần liền).
    const k1 = (await st(pg)).map(t => t.khung);
    await pg.waitForFunction(k => window.__bps3dTranh().some((t, i) => t.khung !== k[i]), k1, { timeout: 15000, polling: 200 }).catch(() => {});
    const k2 = (await st(pg)).map(t => t.khung);
    check(k1.some((k, i) => k !== k2[i]), 'khung hình chạy (' + k1 + ' → ' + k2 + ')');
    check(loi.length === 0, 'không lỗi trang' + (loi[0] ? ': ' + loi[0] : ''));
    await pg.close();
    pg = await b.newPage({ viewport: { width: 900, height: 640 } });
    await pg.goto(URL + '?nv=3d', { waitUntil: 'load' });
    check(await until(pg, () => window.__bps3dTranh && window.__bps3dTranh().every(t => t.hong && !t.sanSang)), '?nv=3d: giữ ảnh tĩnh cũ');
    await pg.close();
    const ctx = await b.newContext({ viewport: { width: 900, height: 640 } }); pg = await ctx.newPage(); const loi3 = []; pg.on('pageerror', e => loi3.push(e.message));
    await pg.route('**/assets/character/tranh-dong/**', r => r.abort());
    await pg.goto(URL, { waitUntil: 'load' });
    check(await until(pg, () => window.__bps3dTranh && window.__bps3dTranh().every(t => t.hong)), 'tờ sprite tải hỏng: quay về ảnh tĩnh');
    check(loi3.length === 0, 'tờ sprite tải hỏng: không lỗi trang' + (loi3[0] ? ': ' + loi3[0] : ''));
    await ctx.close();
  } catch (e) { console.error(e); fails++; }
  await b.close();
  console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\nben-phu-sa-3d-tranh-dong: ok');
  process.exit(fails ? 1 : 0);
})();
