/* Bật Nghiệp 3D («BizOn Game 3D.html», 12/11/2026): trụ sở dùng nhân vật «tranh động» (js/ben-bizon-tranh-dong.js) như Bến BizOn.
 * Chị mở khóa hồ sơ quyền tác giả cho riêng việc này (bản đã nộp vẫn ở commit afbacd2). Kiểm: mặc định cả 7 nhân vật là tranh động
 * và tải xong; COO đi tuần thì dùng tờ đi bộ và khung hình chạy; ?nv=3d quay về mô hình cũ; tờ sprite tải hỏng thì thay bằng mô hình
 * cũ, không lỗi trang; bizon-characters.js không bị sửa; trang không nạp phần di chuyển dùng chung (di-chuyen-3d.js). */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const g = read('BizOn Game 3D.html');
check(/from '\.\/js\/ben-bizon-tranh-dong\.js'/.test(g), 'Bật Nghiệp 3D nạp js/ben-bizon-tranh-dong.js');
check(/NV_TRANH = !\/\[\?&\]nv=3d/.test(g), 'tranh động là mặc định; ?nv=3d quay về mô hình 3D');
check(!/tranh-dong/.test(read('bizon-characters.js')), 'bizon-characters.js không bị sửa');
check(!/di-chuyen-3d|BizOnDiChuyen/.test(g), 'không nạp phần di chuyển dùng chung');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 840, 'sw.js ≥ bizon-v840');

const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const URL = BASE + '/BizOn%20Game%203D.html?diorama=1';
const until = (pg, fn, timeout = 60000) => pg.waitForFunction(fn, null, { timeout, polling: 200 }).then(() => true, () => false);
const nv = pg => pg.evaluate(() => window.__bn3dNhanVat());
(async () => {
  const b = await chromium.launch({ args: ARGS });
  try {
    // 1. mặc định
    let pg = await b.newPage({ viewport: { width: 900, height: 600 } }); const loi = []; pg.on('pageerror', e => loi.push(e.message));
    await pg.goto(URL, { waitUntil: 'load' });
    check(await until(pg, () => window.__bn3dNhanVat && window.__bn3dNhanVat().length === 7 && window.__bn3dNhanVat().every(a => a.tranh && a.tranh.sanSang)), 'mặc định: cả 7 nhân vật là tranh động và đã tải tờ sprite');
    check(await until(pg, () => { const c = window.__bn3dNhanVat().find(a => a.id === 'coo'); return c.tranh.to.startsWith('di-'); }, 20000), 'COO đi tuần: dùng tờ đi bộ');
    const k1 = (await nv(pg)).find(a => a.id === 'coo'); await pg.waitForTimeout(700); const k2 = (await nv(pg)).find(a => a.id === 'coo');
    check(k1.tranh.khung !== k2.tranh.khung || k1.tranh.to !== k2.tranh.to, 'COO đi: khung hình chạy (' + k1.tranh.khung + ' → ' + k2.tranh.khung + ')');
    check((await nv(pg)).filter(a => a.id !== 'coo').every(a => a.tranh.dongTac !== 'di'), 'nhân vật đứng yên không phát tờ đi bộ');
    check(loi.length === 0, 'không lỗi trang' + (loi[0] ? ': ' + loi[0] : ''));
    await pg.close();
    // 2. ?nv=3d
    pg = await b.newPage({ viewport: { width: 900, height: 600 } });
    await pg.goto(URL + '&nv=3d', { waitUntil: 'load' });
    check(await until(pg, () => window.__bn3dNhanVat && window.__bn3dNhanVat().length === 7) && (await nv(pg)).every(a => a.tranh === null), '?nv=3d: cả 7 nhân vật dùng mô hình 3D cũ');
    await pg.close();
    // 3. tờ sprite tải hỏng
    const ctx = await b.newContext({ viewport: { width: 900, height: 600 } }); pg = await ctx.newPage(); const loi3 = []; pg.on('pageerror', e => loi3.push(e.message));
    await pg.route('**/assets/character/tranh-dong/**', r => r.abort());
    await pg.goto(URL, { waitUntil: 'load' });
    check(await until(pg, () => window.__bn3dNhanVat && window.__bn3dNhanVat().length === 7 && window.__bn3dNhanVat().every(a => a.tranh === null)), 'tờ sprite tải hỏng: thay bằng mô hình cũ');
    check(loi3.length === 0, 'tờ sprite tải hỏng: không lỗi trang' + (loi3[0] ? ': ' + loi3[0] : ''));
    await ctx.close();
  } catch (e) { console.error(e); fails++; }
  await b.close();
  console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\nbat-nghiep-3d-tranh-dong: ok');
  process.exit(fails ? 1 : 0);
})();
