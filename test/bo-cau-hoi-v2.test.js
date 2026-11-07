/* Bộ câu hỏi kiến thức bản 2 (PR 7c, docs/research/BO-CAU-HOI-KIEN-THUC-V2.md): 10 câu neo của bộ 1 + 5 câu vận dụng (2, 3, 10, 13, 15), mã
 * instrument «batnghiep2», dùng chung cho phiếu online (chấm tự động) và phiếu in (?bo=batnghiep2); Instructor Studio tạo được link; script
 * phân tích không ghép phiếu khác bộ với nhau. Có phần chạy thật bằng Playwright. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
// Nạp js/khao-sat-bo2.js như trình duyệt
const w = {}; vm.runInNewContext(R('js/khao-sat-bo2.js'), { window: w }); const B = w.BIZON_KS_BO2;
check(B && B.id === 'batnghiep2' && typeof B.ghep === 'function', 'khao-sat-bo2.js xuất BIZON_KS_BO2.batnghiep2');
const thay = Object.keys(B.thay).map(Number).sort((a, b) => a - b);
check(thay.join(',') === '2,3,10,13,15', 'thay đúng 5 câu 2, 3, 10, 13, 15');
for (const n of thay) { const it = B.thay[n]; check(it.q.length > 60 && it.o.length === 4 && /^[abcd]$/.test(it.key) && /\d/.test(it.q), 'câu ' + n + ' có 4 lựa chọn, đáp án hợp lệ, đề có số liệu'); }
check(new Set(thay.map(n => B.thay[n].key)).size >= 3, 'đáp án 5 câu mới không dồn vào một chữ cái');
// Ghép với bộ 1 lấy từ khao-sat-online.html
const on = R('khao-sat-online.html');
const QA = vm.runInNewContext('(' + /const QA = (\[[\s\S]*?\n  \]);/.exec(on)[1] + ')'); const KEY = vm.runInNewContext(/const KEY = (\[[^\]]+\])/.exec(on)[1]);
const g = B.ghep(QA, KEY);
check(g.qa.length === 15 && g.key.length === 15, 'bộ 2 đủ 15 câu');
check([1, 4, 5, 6, 7, 8, 9, 11, 12, 14].every(n => g.qa[n - 1] === QA[n - 1] && g.key[n - 1] === KEY[n - 1]), '10 câu neo giữ nguyên câu và đáp án');
check(thay.every(n => g.qa[n - 1] !== QA[n - 1]), '5 câu thay khác bộ 1');
check(g.key.join(' ') === 'a c a b b b b c b b a a d a a', 'đáp án bộ 2 khớp tài liệu');
const doc = R('docs/research/BO-CAU-HOI-KIEN-THUC-V2.md');
check(doc.includes('a c a b b b b c b b a a d a a') && doc.includes('batnghiep2') && doc.includes('0,40–0,70'), 'tài liệu ghi đáp án, mã bộ và độ khó mục tiêu');
for (const n of thay) check(doc.includes(B.thay[n].q.slice(0, 40)), 'tài liệu có nguyên văn câu ' + n);
check(on.includes('value="batnghiep2"') && on.includes('batnghiep2: { qa: BO2.qa, key: BO2.key, out: OUTCOMES') && on.includes('src="js/khao-sat-bo2.js"'), 'phiếu online có lựa chọn và ngân hàng bộ 2');
check(on.includes("if (bo && BANKS[bo])"), 'phiếu online nhận ?bo=batnghiep2');
const paper = R('khao-sat.html');
check(paper.includes('src="js/khao-sat-bo2.js"') && paper.includes("bo !== 'batnghiep2'") && paper.includes("' · BỘ 2'"), 'phiếu in thay câu và ghi nhãn bộ 2 khi ?bo=batnghiep2');
check(R('app/instructor-studio.html').includes('value="batnghiep2"') && R('js/app-shell/instructor-studio.js').includes("bo !== 'batnghiep'") && R('js/app-shell/instructor-studio.js').includes("['batnghiep', 'batnghiep2'].includes"), 'Instructor Studio tạo link bộ 2 và đếm phiếu');
check(R('scripts/research/phan-tich-truoc-sau.mjs').includes("(r.instrument || '').trim() + '|'"), 'script phân tích ghép cặp theo (bộ, mã)');
check(R('docs/research/TU-DIEN-BIEN.md').includes('batnghiep2'), 'từ điển biến ghi giá trị instrument mới');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(R('sw.js')) || [])[1] >= 805, 'sw.js ≥ bizon-v805');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage(); const loi = []; p.on('pageerror', e => loi.push(e.message));
    await p.goto(BASE + '/khao-sat-online.html?lop=THU-2026&phieu=truoc&bo=batnghiep2', { timeout: 60000 }); await p.waitForTimeout(1200);
    check(await p.evaluate(() => document.querySelector('input[name="instr"]:checked')?.value) === 'batnghiep2', 'online: ?bo=batnghiep2 chọn sẵn bộ 2');
    const t = await p.evaluate(() => document.getElementById('ks-a').innerText);
    check(t.includes('264 triệu') && t.includes('715 sản phẩm') && t.includes('40 × 70') && t.includes('Thái Lan') && t.includes('120 nghìn'), 'online: 5 câu mới hiện ra');
    check(t.includes('Khung CAGE') && !t.includes('Chỉ số OEE trong sản xuất đo điều gì'), 'online: câu neo còn, câu 10 cũ đã thay');
    check((await p.evaluate(() => document.querySelectorAll('#ks-a input[type=radio]').length)) === 60, 'online: 15 câu × 4 lựa chọn');
    check(await p.evaluate(() => document.documentElement.scrollWidth <= 390), 'online: không tràn ngang ở 390 px');
    await p.goto(BASE + '/khao-sat.html?bo=batnghiep2', { timeout: 60000 }); await p.waitForTimeout(800);
    const li = await p.evaluate(() => [...document.querySelectorAll('ol.q > li')].map(l => l.innerText));
    check(li.length === 15 && li[1].includes('264 triệu') && li[2].includes('715') && li[9].includes('2.800') && li[12].includes('Thái Lan') && li[14].includes('40%'), 'phiếu in: 5 câu thay đúng vị trí');
    check((await p.evaluate(() => [...document.querySelectorAll('.badge')].every(x => x.textContent.includes('BỘ 2')))), 'phiếu in: nhãn BỘ 2 trên cả hai phiếu');
    await p.goto(BASE + '/khao-sat.html', { timeout: 60000 }); await p.waitForTimeout(500);
    check((await p.evaluate(() => document.querySelectorAll('ol.q > li')[9].innerText)).includes('OEE'), 'phiếu in không tham số: vẫn bộ 1');
    check(!loi.length, 'không lỗi JS: ' + loi.join(' | '));
  } finally { await b.close(); }
  if (fails) { console.error(fails + ' kiểm tra thất bại'); process.exit(1); } console.log('bo-cau-hoi-v2: ok');
})().catch(e => { console.error(e); process.exit(1); });
