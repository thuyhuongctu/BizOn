/* Trang Bằng chứng và trang Thiết kế nghiên cứu (13/11/2026): chữ nằm gọn trong khung, thêm lớp hợp tác quốc tế.
 * 1. bang-chung.html: «.clay h2» của css/bizon-clay.css xóa khoảng cách dưới tiêu đề mục («.bc-h2») nên tiêu đề nhiều dòng trên điện thoại
 *    bị khung bên dưới che dòng cuối. Kiểm: tiêu đề mục có khoảng cách dưới, chữ không chạm phần tử kế tiếp ở 360 và 412 px.
 * 2. thiet-ke-nghien-cuu.html: ba sơ đồ SVG có chữ dài hơn khung (cả trên máy tính). Kiểm: mọi dòng chữ trong một khung nằm trong khung đó,
 *    cách mép ít nhất 8 đơn vị, ở cả tiếng Việt và tiếng Anh; không dòng nào ra ngoài viewBox.
 * 3. bang-chung.html mục 4 có thẻ lớp trao đổi tín chỉ quốc tế với UM Kendari; không đưa tên hay thông tin cá nhân của phía đối tác lên trang. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

const bc = R('bang-chung.html');
check(/\.clay \.bc-h2\{margin:0 0 18px;[^}]*line-height:1\.24/.test(bc), 'bang-chung: «.clay .bc-h2» thắng «.clay h2», có khoảng cách dưới và giãn dòng 1,24');
check(/\.bc-h2 \.num\{flex:0 0 40px/.test(bc), 'bang-chung: ô số mục không bị bóp khi tiêu đề dài');
const the = (/<div class="bc-course" id="lop-quoc-te-umk">[\s\S]*?<\/p>\s*<\/div>/.exec(bc) || [''])[0];
check(the.includes('KT330H – Entrepreneurship (lớp quốc tế)') && the.includes('UM Kendari × ĐH Cần Thơ') && the.includes('Universitas Muhammadiyah Kendari (Indonesia)') && the.includes('khoảng 160 sinh viên') && the.includes('Zoom'), 'bang-chung: có thẻ lớp trao đổi tín chỉ quốc tế với UM Kendari');
check((the.match(/data-en="/g) || []).length === 3 && the.includes('International Credit Exchange Program'), 'bang-chung: thẻ lớp quốc tế có đủ bản tiếng Anh');
check(!/@|Titin|Rahim/i.test(the), 'bang-chung: thẻ lớp quốc tế không nêu tên hay email của phía đối tác');
check((bc.match(/<div class="bc-course"/g) || []).length === 3 && bc.includes('Ba lớp kế tiếp đã có kế hoạch tích hợp') && bc.includes('Three upcoming classes with integration plans') && bc.includes('Hai thí điểm tại ĐH Cần Thơ sẽ bổ sung'), 'bang-chung: mục 4 ghi ba lớp, câu về phiếu bổ sung chỉ nói hai thí điểm tại ĐH Cần Thơ');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(R('sw.js')) || [])[1] >= 843, 'sw.js ≥ bizon-v843');

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    // --- Trang Bằng chứng: tiêu đề mục không chạm phần tử kế tiếp ---
    for (const w of [360, 412]) {
      const ctx = await b.newContext({ viewport: { width: w, height: 860 }, locale: 'vi-VN' }); const p = await ctx.newPage(); const loi = []; p.on('pageerror', e => loi.push(e.message));
      await p.goto(BASE + '/bang-chung.html', { timeout: 60000 }); await p.waitForTimeout(1500);
      const r = await p.evaluate(() => [...document.querySelectorAll('.bc-h2')].map(h => {
        const rng = document.createRange(); rng.selectNodeContents(h.querySelector('span:last-child')); const chu = rng.getBoundingClientRect();
        const ke = h.nextElementSibling.getBoundingClientRect(), so = h.querySelector('.num').getBoundingClientRect();
        return { cach: Math.round(ke.top - chu.bottom), so: Math.round(so.width), mb: getComputedStyle(h).marginBottom };
      }));
      check(r.length >= 6 && r.every(x => x.cach >= 6 && x.so === 40 && x.mb === '18px'), 'bang-chung ' + w + ' px: ' + r.length + ' tiêu đề mục cách phần tử kế tiếp ≥ 6 px, ô số rộng đủ 40 px (hở nhỏ nhất ' + Math.min(...r.map(x => x.cach)) + ' px)');
      check(await p.evaluate(wd => document.documentElement.scrollWidth <= wd, w), 'bang-chung ' + w + ' px: không tràn ngang');
      check(!loi.length, 'bang-chung ' + w + ' px: không lỗi JS: ' + loi.join(' | '));
      await ctx.close();
    }
    // --- Trang Thiết kế nghiên cứu: chữ trong sơ đồ nằm trong khung ---
    for (const lang of ['vi', 'en']) {
      const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, locale: lang === 'vi' ? 'vi-VN' : 'en-US' }); const p = await ctx.newPage(); const loi = []; p.on('pageerror', e => loi.push(e.message));
      await p.goto(BASE + '/thiet-ke-nghien-cuu.html?lang=' + lang, { timeout: 60000 }); await p.waitForTimeout(1800);
      const r = await p.evaluate(() => {
        const tran = []; let dem = 0;
        document.querySelectorAll('.rd-svg').forEach((svg, i) => {
          svg.querySelectorAll('g').forEach(g => {
            const rect = g.querySelector(':scope > rect'); if (!rect) return; const rb = rect.getBBox();
            g.querySelectorAll(':scope > text').forEach(t => {
              dem++; const tb = t.getBBox();
              if (tb.x < rb.x + 8 || tb.x + tb.width > rb.x + rb.width - 8 || tb.y < rb.y || tb.y + tb.height > rb.y + rb.height) tran.push('sơ đồ ' + (i + 1) + ': «' + t.textContent.trim().slice(0, 40) + '»');
            });
          });
          const vb = svg.viewBox.baseVal;
          svg.querySelectorAll('text').forEach(t => { const tb = t.getBBox(); if (tb.x < 0 || tb.x + tb.width > vb.width || tb.y + tb.height > vb.height) tran.push('sơ đồ ' + (i + 1) + ' ngoài viewBox: «' + t.textContent.trim().slice(0, 40) + '»'); });
        });
        return { tran, dem, soDo: document.querySelectorAll('.rd-svg').length, lang: document.documentElement.lang };
      });
      check(r.soDo === 3 && r.dem >= 60 && r.lang === lang, 'thiet-ke-nghien-cuu (' + lang + '): đo ' + r.dem + ' dòng chữ trong khung của 3 sơ đồ');
      check(r.tran.length === 0, 'thiet-ke-nghien-cuu (' + lang + '): không dòng nào tràn khung' + (r.tran.length ? ' → ' + r.tran.join(' | ') : ''));
      check(!loi.length, 'thiet-ke-nghien-cuu (' + lang + '): không lỗi JS: ' + loi.join(' | '));
      await ctx.close();
    }
  } finally { await b.close(); }
  if (fails) { console.error(fails + ' kiểm tra thất bại'); process.exit(1); } console.log('bang-chung-lop-quoc-te: ok');
})().catch(e => { console.error(e); process.exit(1); });
