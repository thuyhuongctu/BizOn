/* Trang Giảng viên: nút «🇮🇩 Điền sẵn mẫu lớp quốc tế UM Kendari» (chị Hương, 15/11/2026).
 * Một lần bấm điền và lưu mẫu chứng nhận thầy Tú đã duyệt cho lớp đang mở. Chạy thật bằng Playwright với lớp mẫu DEMO-2026. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const gv = fs.readFileSync(path.join(__dirname, '..', 'Trang Giang Vien.dc.html'), 'utf8');
assert.ok(gv.includes('onClick="{{ fillUmkCert }}"') && gv.includes('async fillUmkCert()'), 'có nút và hàm điền mẫu');
for (const v of ["course_code: ''", "'KT330H - Entrepreneurship (03 credits) | Credit Exchange Program'", "'November 17–19, 2026'", "'Can Tho University'", "'School of Economics'",
  "'assets/docs/ctu-logo.png | assets/docs/soe-logo-v2.png'", "'assets/docs/umk-logo.png'", "'Assoc. Prof. Dr. Phan Anh Tu'", "'Vice Rector & Lecturer | School of Economics'"]) assert.ok(gv.includes(v), 'mẫu có ' + v);
for (const f of ['assets/docs/ctu-logo.png', 'assets/docs/soe-logo-v2.png', 'assets/docs/umk-logo.png']) assert.ok(fs.existsSync(path.join(__dirname, '..', f)), 'có tệp ' + f);
(async () => {
  const b = await chromium.launch();
  try {
    const ctx = await b.newContext({ viewport: { width: 1200, height: 900 } }); const p = await ctx.newPage(); const loi = []; p.on('pageerror', e => loi.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); localStorage.removeItem('bizon-lang-auto'); } catch (e) {} });
    await p.goto(BASE + '/Trang%20Giang%20Vien.dc.html', { timeout: 60000 }); await p.waitForTimeout(2500);
    await p.getByText('lớp mẫu DEMO-2026').first().click(); await p.waitForTimeout(2500);
    await p.getByText('Mở bảng điều khiển →').first().click(); await p.waitForTimeout(2500);
    await p.getByText('🎛 Điều khiển lớp', { exact: true }).first().click(); await p.waitForTimeout(1200);
    p.on('dialog', d => d.accept());
    const btn = p.getByText('🇮🇩 Điền sẵn mẫu lớp quốc tế UM Kendari').first(); assert.ok(await btn.count(), 'thấy nút điền mẫu');
    await btn.click(); await p.waitForTimeout(1200);
    const vals = await p.evaluate(() => [...document.querySelectorAll('input[type=text], input:not([type])')].map(i => i.value));
    for (const v of ['KT330H - Entrepreneurship (03 credits) | Credit Exchange Program', 'November 17–19, 2026', 'Can Tho University', 'School of Economics', 'assets/docs/ctu-logo.png | assets/docs/soe-logo-v2.png', 'assets/docs/umk-logo.png', 'Assoc. Prof. Dr. Phan Anh Tu', 'Vice Rector & Lecturer | School of Economics'])
      assert.ok(vals.includes(v), 'ô đã điền: ' + v);
    assert.ok(await p.getByText('✓ Đã điền và lưu mẫu lớp quốc tế').count(), 'báo đã lưu');
    assert.equal(await p.evaluate(() => [...document.querySelectorAll('select')].some(s => s.value === 'en' && [...s.options].some(o => o.value === 'vi'))), true, 'ngôn ngữ chứng nhận = English');
    assert.deepEqual(loi, [], 'không lỗi JS');
    console.log('mau-chung-nhan-umk: ok');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
