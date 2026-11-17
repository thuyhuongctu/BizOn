/* Giảm dung lượng trang 3D (16/11/2026): 22 tờ tranh động nén lại thành bản «-v2» (WebP chất lượng 80, alpha 85), tờ gốc giữ
 * nguyên; vai đội nạp trước hai tờ (đứng, đi lùi), các hướng còn lại nạp sau khi nhân vật hiện.
 * Kiểm: mỗi tờ -v2 có mặt, nhẹ hơn tờ gốc, .json giống hệt tờ gốc; mã nạp đúng bản -v2; tờ gốc còn trong kho; trong trình duyệt
 * Bật Nghiệp 3D chỉ tải tờ -v2 của vai đội (không tải tờ gốc), Bến Phù Sa 3D tải hai tờ -v2. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8'), D = 'assets/character/tranh-dong/';
const TO = [];
for (const v of ['ceo', 'cfo', 'cmo', 'coo', 'sec']) for (const t of ['di-truoc', 'di-ngang', 'di-sau', 'dung']) TO.push(v + '-' + t);
TO.push('tu-ganh-dung', 'huong-phusa-dung');
let goc = 0, moi = 0;
for (const n of TO) {
  const a = R(D + n + '.webp'), b = R(D + n + '-v2.webp');
  const ok = fs.existsSync(a) && fs.existsSync(b) && fs.statSync(b).size < fs.statSync(a).size && read(D + n + '.json') === read(D + n + '-v2.json');
  if (ok) { goc += fs.statSync(a).size; moi += fs.statSync(b).size; }
  check(ok, n + ': có bản -v2 nhẹ hơn, tờ gốc còn, .json giống hệt');
}
check(moi < goc * 0.8, 'tổng 22 tờ giảm ' + Math.round((1 - moi / goc) * 100) + ' % (' + (goc / 1e6).toFixed(2) + ' → ' + (moi / 1e6).toFixed(2) + ' MB)');
const td = read('js/ben-bizon-tranh-dong.js'), bps = read('js/bps3d.js');
check(/BAN_MOI\[v \+ '-' \+ t\] = v \+ '-' \+ t \+ '-v2'/.test(td), 'ben-bizon-tranh-dong.js nạp bản -v2 của năm vai đội');
check(/dangNap\[t\]/.test(td) && /const dau = coDi \?/.test(td), 'ben-bizon-tranh-dong.js nạp trước hai tờ, các tờ còn lại nạp sau');
check(/'tu-ganh-dung': 'tu-ganh-dung-v2'/.test(bps) && /'huong-phusa-dung': 'huong-phusa-dung-v2'/.test(bps), 'bps3d.js nạp hai tờ -v2');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 893, 'sw.js ≥ bizon-v893');

(async () => {
  const b = await chromium.launch();
  try {
    for (const [u, can] of [['BizOn%20Game%203D.html?diorama=1', 20], ['ben-phu-sa-3d.html', 2]]) {
      const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
      await ctx.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); localStorage.setItem('bizon-bps-tour-seen', '1'); } catch (e) {} });
      const pg = await ctx.newPage(), tai = [];
      pg.on('request', r => { const m = /tranh-dong\/([\w-]+)\.webp/.exec(r.url()); if (m) tai.push(m[1]); });
      await pg.goto(BASE + '/' + u, { waitUntil: 'load' });
      await pg.waitForTimeout(u.startsWith('BizOn') ? 9000 : 5000);
      const vai = tai.filter(n => TO.some(t => n === t || n === t + '-v2'));
      check(vai.length > 0 && vai.every(n => n.endsWith('-v2')), u + ': chỉ tải tờ -v2 (' + vai.length + ' tờ, không tải tờ gốc)');
      check(new Set(vai).size >= can, u + ': đã tải đủ ' + can + ' tờ -v2 sau khi nhân vật hiện (' + new Set(vai).size + ')');
      await ctx.close();
    }
  } catch (e) { console.error(e); fails++; }
  await b.close();
  console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\ngiam-dung-luong-3d: ok');
  process.exit(fails ? 1 : 0);
})();
