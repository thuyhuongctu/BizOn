/* Trang Bằng chứng, mục 2d «Nguồn của từng con số» (23/11/2026): bảng nguồn dữ liệu, cách thu, mức công khai, giới hạn chính
 * cho mục 2 (n = 40), 2b (49 cặp), 2c (quy mô) và tham số game. Không viết cứng số liệu vào test mà đối chiếu với nguồn:
 * - số tham số Hộ Chiếu Sầu Riêng và số loại «có nguồn / hỗn hợp / minh hoạ» đếm lại từ bảng ở truong-hoc-thuat.html,
 *   theo đúng luật phân loại của js/academic-foundation.js; số tài liệu nguồn đếm từ danh mục #af-srclist;
 * - số phiếu, cặp ghép, tỷ lệ trần lấy từ docs/research/KET-QUA-TRUOC-SAU-2026-10.md;
 * - khoảng tin cậy 95 % của r ≈ 0,31 (n = 40) tính lại bằng biến đổi Fisher z;
 * - liên kết tới tệp trong kho trỏ đúng tệp có thật; neo nội bộ có thật.
 * Trình duyệt (BIZON_URL): 1280 px là bảng 5 cột; 390 px thành thẻ xếp chồng có nhãn cột, không tràn ngang; nhãn có bản tiếng Anh. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
const he = s => s.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

const bc = R('bang-chung.html');
const i = bc.indexOf('id="nguon-du-lieu"'); assert.ok(i > 0, 'có mục #nguon-du-lieu');
const sec = bc.slice(i, bc.indexOf('</section>\n', bc.indexOf('</table>', i)));
assert.ok(i < bc.indexOf('Giới hạn của bằng chứng hiện có'), 'mục 2d đứng trước mục 3 «Giới hạn»');
const rows = sec.match(/<tr><th scope="row"/g) || [];
assert.equal(rows.length, 5, 'năm dòng: mục 2, 2b, 2c, tham số Hộ Chiếu Sầu Riêng, tham số Bật Nghiệp/Bến Phù Sa');
assert.equal((sec.match(/<th scope="col"/g) || []).length, 5, 'năm cột có scope');
assert.equal((sec.match(/class="lb" aria-hidden="true" data-en="/g) || []).length, 20, 'mỗi ô có nhãn cột (VI/EN) cho bản điện thoại');

// Tham số Hộ Chiếu Sầu Riêng: đếm lại từ truong-hoc-thuat.html theo luật của js/academic-foundation.js
const th = R('truong-hoc-thuat.html');
const kinds = [...th.matchAll(/<tr data-param="[^"]+"[^>]*>[\s\S]*?<td class="s"><span data-en="([^"]*)"/g)].map(m => {
  const s = he(m[1]); return /^illustrative|^balanced/.test(s) ? 'illustrative' : /illustrative/.test(s) ? 'mixed' : 'sourced';
});
const cnt = k => kinds.filter(x => x === k).length;
assert.ok(/function kindOf\(src\) \{ if \(\/\^illustrative\|\^balanced\/\.test\(src\)\) return 'illustrative'; if \(\/illustrative\/\.test\(src\)\) return 'mixed'; return 'sourced'; \}/.test(R('js/academic-foundation.js')), 'luật phân loại nguồn không đổi');
const nDocs = (th.split('id="af-srclist"')[1].split('</ul>')[0].match(/<li/g) || []).length;
assert.ok(sec.includes(kinds.length + ' tham số trong tệp dữ liệu') && sec.includes(kinds.length + ' parameters in the game data file'), 'số tham số khớp bảng (' + kinds.length + ')');
assert.ok(sec.includes(`${cnt('sourced')} tham số có nguồn, ${cnt('mixed')} hỗn hợp, ${cnt('illustrative')} minh hoạ`), `phân loại khớp: ${cnt('sourced')}/${cnt('mixed')}/${cnt('illustrative')}`);
assert.ok(sec.includes(`${cnt('sourced')} sourced, ${cnt('mixed')} mixed, ${cnt('illustrative')} illustrative`), 'phân loại khớp (EN)');
assert.ok(sec.includes('(' + nDocs + ' tài liệu)') && sec.includes('(' + nDocs + ' documents)'), 'số tài liệu nguồn khớp danh mục (' + nDocs + ')');

// Mục 2b: khớp tệp kết quả
const kq = R('docs/research/KET-QUA-TRUOC-SAU-2026-10.md');
const m = kq.match(/(\d+) cặp ghép từ (\d+) phiếu: (\d+) trước, (\d+) sau; (\d+) phiếu trước và (\d+) phiếu sau không ghép/);
assert.ok(m, 'đọc được tóm tắt KET-QUA');
const [, cap, , truoc, , le1, le2] = m.map(Number);
assert.ok(sec.includes('Mục 2b · ' + cap + ' cặp'), 'số cặp ghép khớp');
assert.ok(sec.includes((le1 + le2) + ' phiếu không ghép được cặp') && sec.includes((le1 + le2) + ' forms could not be paired'), 'số phiếu không ghép được khớp');
const tran = kq.match(/(\d+)\/(\d+) phiếu trước \((\d+)%\) đạt 15\/15/);
assert.ok(tran && +tran[2] === truoc && sec.includes(tran[3] + ' % phiếu trước đạt 15/15'), 'tỷ lệ trần khớp');
assert.ok(/Phiếu thu từ 15\/10 đến 19\/10\/2026/.test(kq) && sec.includes('15 đến 19/10/2026'), 'ngày thu phiếu khớp');
assert.ok(/ngày 07\/11\/2026/.test(kq) && sec.includes('07/11/2026'), 'ngày tải gói dữ liệu khớp');

// Mục 2: khoảng tin cậy Fisher z của r ≈ 0,31, n = 40
const z = Math.atanh(0.31), se = 1 / Math.sqrt(40 - 3);
const lo = Math.tanh(z - 1.96 * se), hi = Math.tanh(z + 1.96 * se);
const vn = x => x.toFixed(2).replace('.', ',').replace('-0,00', '0,00');
assert.ok(sec.includes(`xấp xỉ từ ${vn(lo)} đến ${vn(hi)}`), 'khoảng tin cậy ' + vn(lo) + '–' + vn(hi));
assert.ok(sec.includes(`roughly ${Math.abs(lo).toFixed(2)} to ${hi.toFixed(2)}`), 'khoảng tin cậy (EN)');
assert.ok(lo < 0.01, 'cận dưới sát 0: trang phải nói chưa loại được khả năng không tương quan');
assert.ok(sec.includes('chưa loại được khả năng không có tương quan') && sec.includes('a zero correlation cannot be ruled out'), 'nói rõ hệ quả của khoảng tin cậy');
assert.ok(bc.includes('r ≈ 0,31'), 'mục 2 vẫn công bố r ≈ 0,31');

// Liên kết
for (const [, f] of sec.matchAll(/github\.com\/thuyhuongctu\/BizOn\/blob\/main\/([^"&]+)/g)) assert.ok(fs.existsSync(path.join(__dirname, '..', f)), 'tệp có thật: ' + f);
for (const [, a] of sec.matchAll(/href="truong-hoc-thuat\.html#([^"&]+)"/g)) assert.ok(th.includes('id="' + a + '"'), 'neo có thật: #' + a);
assert.ok(R('supabase/migrations/20261123000000_quy_mo_su_dung.sql').includes("'^(DEMO|TEST)'") && sec.includes('DEMO hoặc TEST'), 'mô tả bộ lọc lớp mẫu khớp hàm đếm');
assert.ok(+(R('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 966, 'sw.js tăng phiên bản');

// Trình duyệt
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('bang-chung-nguon-du-lieu: cần playwright'); process.exit(1); }
(async () => {
  const b = await chromium.launch(); let fails = 0;
  const ok = (c, msg) => { console.log((c ? '  ✓ ' : '  ✗ ') + msg); if (!c) fails++; };
  for (const [w, lang] of [[1280, 'vi'], [390, 'vi'], [390, 'en'], [360, 'vi']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
    await ctx.route(/googleapis|gstatic|goatcounter|supabase\.co|\.mp3|\.mp4/, r => r.abort());
    const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(BASE + '/bang-chung.html?lang=' + lang, { waitUntil: 'load' }); await pg.waitForTimeout(900);
    const r = await pg.evaluate(() => {
      const s = document.querySelector('#nguon-du-lieu .bc-src');
      return { over: document.documentElement.scrollWidth, thead: getComputedStyle(s.querySelector('thead')).display, lb: getComputedStyle(s.querySelector('.lb')).display,
        lbText: s.querySelector('.lb').textContent, row: getComputedStyle(s.querySelector('tbody tr')).display, h: document.querySelector('#nguon-du-lieu h2').textContent };
    });
    const tag = w + ' px ' + lang + ': ';
    ok(r.over <= w, tag + 'không tràn ngang (' + r.over + ')');
    if (w >= 1000) ok(r.thead !== 'none' && r.lb === 'none' && r.row === 'table-row', tag + 'bảng 5 cột, ẩn nhãn ô');
    else ok(r.thead === 'none' && r.lb === 'block' && r.row === 'block', tag + 'thẻ xếp chồng, hiện nhãn cột');
    if (lang === 'en') ok(/Where each number comes from/.test(r.h) && r.lbText === 'Source data', tag + 'tiêu đề và nhãn tiếng Anh');
    ok(!errs.length, tag + 'không lỗi JS' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await ctx.close();
  }
  await b.close();
  if (fails) { console.error('bang-chung-nguon-du-lieu: ' + fails + ' lỗi'); process.exit(1); }
  console.log('bang-chung-nguon-du-lieu: ok');
})().catch(e => { console.error(e); process.exit(1); });
