'use strict';
// R5 · Trang thiết kế nghiên cứu: mục «Cơ chế và giả thuyết» cho nhánh hộp đen (H1–H3, Hình 3 sơ đồ 2×2, điều kiện biên,
// cỡ mẫu 60–100 có lưu ý lực kiểm định), RQ9–RQ10, cột tạp chí mục tiêu; song ngữ VI/EN đầy đủ cho mọi phần tử mới.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const html = read('thiet-ke-nghien-cuu.html');

// --- 1 · cấu trúc tĩnh ---
const sec = html.slice(html.indexOf('<section class="rd-sec" id="co-che">'), html.indexOf('<section class="rd-sec" id="ghep-du-lieu">'));
assert.ok(sec.length > 4000, 'mục co-che nằm giữa thiết kế và ghép dữ liệu');
assert.ok(html.indexOf('id="thiet-ke"') < html.indexOf('id="co-che"'), 'co-che sau thiet-ke');
for (const k of ['H1 · cơ chế chính', 'H2 · chuyển giao', 'H3 · cơ chế phụ', 'Uppsala', 'effectuation', 'uppsala_ok = false', 'dc-v1', 'rb-v1', 'class_controls.explain_hidden']) assert.ok(sec.includes(k), 'thiếu: ' + k);
assert.match(sec, /Post = β₀ \+ β₁·Shown \+ β₂·Pre \+ u_class \+ ε/);
// Hình 3: SVG có tiêu đề truy cập, 4 ô (2 làn × 2 pha), ô trung tâm 6 vụ, ghi chú phân lớp
const fig = sec.slice(sec.indexOf('<figure'), sec.indexOf('</figure>'));
assert.match(fig, /<svg class="rd-svg" viewBox="0 0 960 430" role="img" aria-labelledby="rd-fig3-t"/);
assert.match(fig, /<title id="rd-fig3-t">/);
assert.equal((fig.match(/<g class="(lane-a|lane-b|master|m)">/g) || []).length, 4, '4 ô 2×2');
assert.ok(fig.includes('data-en="6 SEASONS">6 VỤ CHƠI<') && fig.includes('explain = shown') && fig.includes('explain = hidden'));
assert.ok(fig.includes('WHY 0–10 (5 lý do × 0–2) · EXPLAIN 0–8 (4 tiêu chí × 0–2)') && fig.includes('ALIGNED 0–5 (lựa chọn khớp lý thuyết) · rubric rb-v1'));
// điều kiện biên: 4 bước; cỡ mẫu 60–100 với ANCOVA 48/điều kiện, d = 0,50, lực 0,80
assert.equal((sec.match(/<div class="rd-step">/g) || []).length, 4);
assert.ok(sec.includes('κ của Cohen ≥ 0,60 cho WHY và ICC(2,k) ≥ 0,75 cho EXPLAIN'));
assert.ok(sec.includes('cần khoảng 48 sinh viên mỗi điều kiện để phát hiện d = 0,50 với lực 0,80 (α = 0,05, hai phía)'));
assert.ok(sec.includes('60–100 sinh viên trong 2–3 lớp mỗi điều kiện chỉ cho thấy được hiệu ứng trung bình trở lên (d ≥ 0,5–0,6)'));
assert.ok(sec.includes('?explain='), 'loại trừ nhiễm chéo qua công tắc xem trước');
// RQ9–RQ10 và tiêu đề «Mười câu hỏi»
assert.ok(html.includes('data-en="Ten questions, three data sources">Mười câu hỏi, ba nguồn dữ liệu<'));
assert.match(html, /<th scope="row">RQ9<\/th>[\s\S]*?rubric rb-v1, cờ lớp explain_hidden/);
assert.match(html, /<th scope="row">RQ10<\/th>[\s\S]*?quyết định có mã dc-v1 \+ điểm rubric/);
// bảng bản thảo: 4 cột, 4 bản thảo, tạp chí mục tiêu
assert.ok(html.includes('<th scope="col" data-en="Target journal">Tạp chí mục tiêu</th>'));
assert.equal((html.match(/<th scope="row" data-en="P__ · /g) || []).length, 4, 'bốn bản thảo');
assert.ok(html.includes('Journal of Teaching in International Business') && html.includes('The International Journal of Management Education'));
assert.ok(html.includes('data-en="Four manuscripts are planned from this design.'));
for (const doi of ['10.1057/palgrave.jibs.8490676', '10.1057/jibs.2009.24', '10.5465/amr.2001.4378020', '10.2307/2529310', '10.1016/j.jcm.2016.02.012']) assert.ok(html.includes('doi:' + doi), 'thiếu DOI ' + doi);
assert.ok(html.includes('cập nhật 27/10/2026'));
// song ngữ: mọi <p>, <h3>, <h4>, <li>, <td>, <tspan> trong mục mới có data-en (trừ <p> chỉ chứa công thức)
for (const m of sec.matchAll(/<(p|h3|h4|li|td|tspan)\b([^>]*)>/g)) { const attrs = m[2]; if (/class="rd-eq"|style="margin-top:10px"/.test(sec.slice(m.index, m.index + 80)) && m[1] === 'p') continue; assert.ok(/\sdata-en=/.test(attrs), `thiếu data-en ở <${m[1]}${attrs.slice(0, 60)}>`); }
{ const sw = read('sw.js'); assert.match(sw, /const CACHE = 'bizon-v\d+';/); }
assert.ok(read('docs/architecture/HANH-TRINH-3-BAC.md').includes('| R5 | Trang thiết kế nghiên cứu `thiet-ke-nghien-cuu.html`'));

// --- 2 · trình duyệt: không lỗi JS, đổi sang EN dịch mục mới, không tràn ngang trên điện thoại ---
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } }); const errors = [];
  page.on('pageerror', e => errors.push('err: ' + e.message));
  await page.goto(`${BASE}/thiet-ke-nghien-cuu.html?lang=vi`, { waitUntil: 'load', timeout: 60000 }); await page.waitForTimeout(400);
  assert.equal(await page.$eval('#co-che h2', e => e.textContent.trim()), 'Nhánh «hộp đen» kiểm điều gì');
  await page.goto(`${BASE}/thiet-ke-nghien-cuu.html?lang=en`, { waitUntil: 'load', timeout: 60000 }); await page.waitForTimeout(400);
  assert.equal(await page.$eval('#co-che h2', e => e.textContent.trim()), 'What the black-box branch tests');
  assert.equal(await page.$eval('#rd-fig3-t + text tspan', e => e.textContent), 'BEFORE · WEEK 1 · FORM A OR B');
  assert.equal(await page.$eval('#cau-hoi h2', e => e.textContent.trim()), 'Ten questions, three data sources');
  const phone = await browser.newPage({ viewport: { width: 390, height: 800 } });
  phone.on('pageerror', e => errors.push('phone: ' + e.message));
  await phone.goto(`${BASE}/thiet-ke-nghien-cuu.html?lang=vi`, { waitUntil: 'load', timeout: 60000 }); await phone.waitForTimeout(400);
  const over = await phone.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(over <= 1, 'không tràn ngang trên điện thoại: ' + over);
  assert.ok(await phone.$eval('#co-che .rd-scroll', e => getComputedStyle(e).display !== 'none'), 'nhắc kéo ngang hiện trên điện thoại');
  await browser.close();
  assert.deepEqual(errors, [], 'không lỗi JS');
  console.log('research-design-r5: OK');
})().catch(e => { console.error(e); process.exit(1); });
