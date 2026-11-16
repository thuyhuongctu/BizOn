/* Trang Giảng viên: nút «📂 Hoặc chọn tệp Excel (.xlsx) / CSV» nhập danh sách sinh viên (chị Hương, 15/11/2026).
 * Tệp chỉ đọc trong trình duyệt (js/core/roster-file.js), không gửi lên hệ thống. Dữ liệu trong test là tên giả. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), assert = require('node:assert');
const ROOT = path.join(__dirname, '..');
const R = require(path.join(ROOT, 'js/core/roster-file.js'));
const { zip } = require(path.join(ROOT, 'js/core/zip-store.js'));
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }

// Tệp .xlsx tối giản: trang 1 «Teams» (tiêu đề ở dòng 3, chuỗi dùng chung), trang 2 «Paste to BizOn» (chuỗi nội tuyến).
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const sst = ['Team allocation', 'Team', 'Student No.', 'Full name', 'Team 01', 'Siti  Aminah', '1001', 'Budi & Sons'];
const cS = (r, i) => `<c r="${r}" t="s"><v>${i}</v></c>`, cI = (r, v) => `<c r="${r}" t="inlineStr"><is><t>${esc(v)}</t></is></c>`, cN = (r, v) => `<c r="${r}"><v>${v}</v></c>`;
const sheet = rows => `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows.map((c, i) => `<row r="${i + 1}">${c}</row>`).join('')}</sheetData></worksheet>`;
const xlsx = zip([
  { name: 'xl/workbook.xml', data: '<workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Teams" sheetId="1" r:id="rId1"/><sheet name="Paste to BizOn" sheetId="2" r:id="rId2"/></sheets></workbook>' },
  { name: 'xl/_rels/workbook.xml.rels', data: '<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Target="/xl/worksheets/sheet2.xml"/></Relationships>' },
  { name: 'xl/sharedStrings.xml', data: `<sst>${sst.map(t => `<si><t>${esc(t)}</t></si>`).join('')}</sst>` },
  { name: 'xl/worksheets/sheet1.xml', data: sheet([cS('A1', 0), '', cS('A3', 1) + cS('B3', 2) + cS('C3', 3), cS('A4', 4) + cS('B4', 6) + cS('C4', 5)]) },
  { name: 'xl/worksheets/sheet2.xml', data: sheet([
    cI('A1', 'No.') + cI('B1', 'Full name') + cI('C1', 'Student ID') + cI('D1', 'Email') + cI('E1', 'Team'),
    cN('A2', 1) + cI('B2', 'Siti  Aminah') + cI('C2', '1001') + cI('E2', 'Team 01'),
    cN('A3', 2) + cI('B3', 'Nguyễn Văn Bình') + cN('C3', 1002) + cI('D3', 'binh@example.com') + cI('E3', 'Team 02'),
    cN('A4', 3) + cI('C4', '9999'),
    cN('A5', 4) + cI('B5', 'Budi & Sons') + cI('C5', '1003') + cI('E5', 'Team 02')]) }
]);
const fileOf = (name, bytes) => ({ name, arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length) });

(async () => {
  // 1. Đơn vị: xlsx ưu tiên trang có «BizOn», gộp khoảng trắng, bỏ dòng thiếu tên, giữ thứ tự cột của danh sách lớp.
  const r = await R.read(fileOf('lop.xlsx', xlsx));
  assert.equal(r.sheet, 'Paste to BizOn');
  assert.equal(r.count, 3);
  assert.equal(r.text, '1\tSiti Aminah\t1001\t\tTeam 01\n2\tNguyễn Văn Bình\t1002\tbinh@example.com\tTeam 02\n3\tBudi & Sons\t1003\t\tTeam 02');
  // Trang tiêu đề không ở dòng đầu, chuỗi dùng chung.
  const sh = await R.xlsxSheets(xlsx);
  assert.equal(R.rowsToRoster(sh[0].rows).text, '1\tSiti Aminah\t1001\t\tTeam 01');
  // CSV có dấu ngoặc kép, BOM, tiêu đề tiếng Việt; tệp không tiêu đề giữ nguyên các cột.
  const csv = await R.read(fileOf('ds.csv', new TextEncoder().encode('﻿STT,Họ và tên,MSSV,Nhóm\r\n1,"Trần Thị, Hoa",B2400001,DOI-A\r\n')));
  assert.equal(csv.text, '1\tTrần Thị, Hoa\tB2400001\t\tDOI-A');
  assert.equal(R.rowsToRoster(R.csvRows('1\tAn\tB1\n2\tBa\tB2')).text, '1\tAn\tB1\n2\tBa\tB2');
  await assert.rejects(R.read(fileOf('cu.xls', new Uint8Array([0xd0, 0xcf, 0x11, 0xe0]))), /xls-old/);

  // 2. Trang Giảng viên có nút ở mục chứng nhận và tab Chấm điểm, nạp script, sw lưu script.
  const gv = fs.readFileSync(path.join(ROOT, 'Trang Giang Vien.dc.html'), 'utf8'), sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  assert.ok(gv.includes('<script src="js/core/roster-file.js"></script>'), 'nạp roster-file.js');
  assert.equal((gv.match(/onChange="\{\{ onRosterFile \}\}"/g) || []).length, 2, 'hai ô chọn tệp');
  assert.ok(sw.includes("'./js/core/roster-file.js'"), 'sw lưu roster-file.js');
  assert.ok(+(/bizon-v(\d+)/.exec(sw) || [])[1] >= 879, 'sw.js ≥ v879');
  assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon/.test(fs.readFileSync(path.join(ROOT, 'js/core/roster-file.js'), 'utf8')), 'không gửi tệp đi đâu');

  // 3. Chạy thật: lớp mẫu DEMO-2026 → Điều khiển lớp → chọn tệp → «In cả lớp (3)».
  const tmp = path.join(os.tmpdir(), 'bizon-ds-' + process.pid + '.xlsx'); fs.writeFileSync(tmp, xlsx);
  const b = await chromium.launch();
  try {
    const p = await (await b.newContext({ viewport: { width: 390, height: 900 } })).newPage(); const loi = []; p.on('pageerror', e => loi.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); localStorage.removeItem('bizon-lang-auto'); } catch (e) {} });
    await p.goto(BASE + '/Trang%20Giang%20Vien.dc.html', { timeout: 60000 }); await p.waitForTimeout(2500);
    await p.getByText('lớp mẫu DEMO-2026').first().click(); await p.waitForTimeout(2500);
    await p.getByText('Mở bảng điều khiển →').first().click(); await p.waitForTimeout(2500);
    await p.getByText('🎛 Điều khiển lớp', { exact: true }).first().click(); await p.waitForTimeout(1200);
    p.on('dialog', d => d.accept());
    const inp = p.locator('input[type=file][accept*=".xlsx"]').first(); assert.ok(await inp.count(), 'thấy ô chọn tệp danh sách');
    await inp.setInputFiles(tmp); await p.waitForTimeout(1200);
    assert.ok(await p.getByText('✅ Đã nhập 3 sinh viên (trang «Paste to BizOn») và lưu trên máy này.').count(), 'báo đã nhập');
    assert.ok(await p.getByText(/In cả lớp \(3\)/).count(), 'nút in cả lớp đếm 3');
    const saved = await p.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('bizon-gv-roster-')).map(k => localStorage.getItem(k)));
    assert.ok(saved.some(v => v.includes('Nguyễn Văn Bình')), 'đã lưu localStorage');
    assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'không tràn ngang ở 390 px');
    assert.deepEqual(loi, [], 'không lỗi JS');
    console.log('nhap-danh-sach-tep: ok');
  } finally { await b.close(); fs.rmSync(tmp, { force: true }); }
})().catch(e => { console.error(e); process.exit(1); });
