/* Thầy Tu Phan «tranh động» bản 2 (13/11/2026): chị thấy thầy Tú trong Bật Nghiệp 3D chưa giống. Bản 1 làm từ ảnh mẫu vẽ lại
 * (mặt giống người thật, đầu nhỏ, không cười); bản 2 dựng thẳng từ tranh gốc áo dài assets/character/anh-tu-ao-dai-cut-v2.webp.
 * Kiểm: tệp v2 có mặt và hợp lệ, tệp cũ giữ nguyên, bộ nạp tranh động dùng bản v2, Bật Nghiệp 3D tải đúng tệp v2. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const TD = 'assets/character/tranh-dong/';
for (const t of ['tu-dung', 'tu-noi']) {
  check(fs.existsSync(R(TD + t + '.webp')), t + ': tệp cũ giữ nguyên');
  const j = JSON.parse(read(TD + t + '-v2.json'));
  check(j.quaLai === true && j.khung >= 12 && j.cao === 256 && fs.statSync(R(TD + t + '-v2.webp')).size < 600000, t + '-v2: tờ hợp lệ, nhẹ hơn 600 KB');
}
check(/BAN_MOI = \{ 'tu-dung': 'tu-dung-v2', 'tu-noi': 'tu-noi-v2' \}/.test(read('js/ben-bizon-tranh-dong.js')), 'bộ nạp tranh động dùng bản v2 cho thầy Tú');
check(/anh-tu-ao-dai-cut-v2\.webp/.test(read('assets/models/SOURCES.md')) && /tu-dung-v2/.test(read('assets/models/SOURCES.md')), 'SOURCES.md ghi nguồn bản v2');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 842, 'sw.js ≥ bizon-v842');

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const pg = await b.newPage({ viewport: { width: 900, height: 600 } }), tai = [], loi = [];
    pg.on('request', r => { const m = /tranh-dong\/(tu-[a-z0-9-]+)\.webp/.exec(r.url()); if (m) tai.push(m[1]); }); pg.on('pageerror', e => loi.push(e.message));
    await pg.goto(BASE + '/BizOn%20Game%203D.html?diorama=1', { waitUntil: 'load' });
    const ok = await pg.waitForFunction(() => window.__bn3dNhanVat && (window.__bn3dNhanVat().find(a => a.id === 'tu') || {}).tranh && window.__bn3dNhanVat().find(a => a.id === 'tu').tranh.sanSang, null, { timeout: 60000 }).then(() => true, () => false);
    check(ok, 'Bật Nghiệp 3D: thầy Tú là tranh động, đã tải');
    check(tai.includes('tu-dung-v2') && tai.includes('tu-noi-v2') && !tai.includes('tu-dung') && !tai.includes('tu-noi'), 'Bật Nghiệp 3D tải tờ v2, không tải tờ cũ (' + tai.join(', ') + ')');
    check(loi.length === 0, 'không lỗi trang' + (loi[0] ? ': ' + loi[0] : ''));
  } catch (e) { console.error(e); fails++; }
  await b.close();
  console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\ntu-tranh-dong-v2: ok');
  process.exit(fails ? 1 : 0);
})();
