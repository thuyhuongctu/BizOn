/* Tuyên bố tiếp cận (tiep-can.html, 23/11/2026) và các chỗ sửa tương phản, bàn phím, tương phản cao, giảm chuyển động.
 * Tĩnh: trang có canonical, hreflang, VI/EN, mục phương pháp và hạn chế, nằm trong sitemap, chân trang, sw.js; các luật CSS
 * (gạch chân liên kết trong đoạn, viền tương phản cao, giảm chuyển động, màu cam nhấn sẫm) còn nguyên.
 * Trình duyệt (BIZON_URL): đo tỷ lệ tương phản thật của các phần tử từng không đạt (≥ 4,5:1), bảng cuộn ngang nhận Tab,
 * liên kết trong đoạn có gạch chân. Số đo axe-core 4.10.2 trước/sau ghi trên trang là kết quả chạy tay, không chạy lại ở đây. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';

// --- Tĩnh ---
const tc = read('tiep-can.html');
assert.ok(tc.includes('<link rel="canonical" href="https://bizonland.com/tiep-can.html">'), 'canonical');
assert.ok(/hreflang="en"/.test(tc) && /hreflang="vi"/.test(tc), 'hreflang VI/EN');
assert.ok(tc.includes('WCAG 2.2') && tc.includes('axe-core 4.10.2'), 'nêu chuẩn và công cụ đo');
for (const id of ['pham-vi', 'phuong-phap', 'ket-qua', 'han-che', 'ho-tro', 'phan-hoi']) assert.ok(tc.includes('id="' + id + '"'), 'mục #' + id);
assert.ok(/Chưa kiểm thủ công/.test(tc) && /Manual testing with screen readers/.test(tc), 'nói rõ chưa kiểm thủ công (VI/EN)');
assert.ok(tc.includes('mailto:bricoleur@bizonland.com'), 'địa chỉ báo rào cản');
assert.ok(tc.includes('js/thong-ke.js') && tc.includes('js/bizon-clay-footer.js'), 'chân trang và thống kê như các trang khác');
assert.ok(read('sitemap.xml').includes('<loc>https://bizonland.com/tiep-can.html</loc>'), 'có trong sitemap');
assert.ok(read('js/bizon-clay-footer.js').includes("href:'tiep-can.html'"), 'có liên kết ở chân trang');
const sw = read('sw.js');
assert.ok(sw.includes("'./tiep-can.html'"), 'sw.js nạp sẵn trang');
assert.ok(+(sw.match(/bizon-v(\d+)/) || [])[1] >= 965, 'sw.js tăng phiên bản');
assert.equal(read('index.html'), read('academia3d-v2.html'), 'index.html giống hệt academia3d-v2.html');
const clay = read('css/bizon-clay.css'), chrome = read('css/bizon-clay-chrome.css');
assert.ok(/--clay-accent:#B04F17/.test(clay) && /--clay-accent:#B04F17/.test(chrome), 'màu cam nhấn sẫm #B04F17 ở cả hai tệp');
assert.ok(/:is\(p, li, td, dd\) > a:not\(\[class\]\)[^{]*\{text-decoration:underline/.test(clay), 'liên kết trong đoạn có gạch chân');
assert.ok(/@media \(forced-colors:active\)\{[^}]*\.clay-card[^}]*border:2px solid CanvasText/.test(clay), 'viền khi bật tương phản cao');
assert.ok(/@media \(prefers-reduced-motion:reduce\)\{\.clay-btn,\.clay-btn:active\{transition:none;transform:none\}\}/.test(clay), 'nút không lún khi giảm chuyển động');
const af = read('css/academic-foundation.css');
assert.doesNotMatch(af.match(/\.af-node\{[^}]*\}/)[0], /opacity:\./, 'nút sơ đồ không làm mờ chữ bằng opacity');

// --- Trình duyệt ---
let chromium;
try { chromium = require('playwright').chromium; } catch (e) { console.error('tiep-can: cần playwright'); process.exit(1); }
const DO = () => {
  const rgb = s => { const m = s.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const blend = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  return window.__ratio = el => {
    const layers = []; let op = 1;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) { const cs = getComputedStyle(n); op *= +cs.opacity; const bg = rgb(cs.backgroundColor); if (bg.a > 0) layers.push(bg); if (bg.a === 1) break; }
    let bg = { r: 255, g: 255, b: 255, a: 1 }; for (let i = layers.length - 1; i >= 0; i--) bg = blend(layers[i], bg);
    let fg = rgb(getComputedStyle(el).color); fg = blend({ ...fg, a: fg.a * op }, bg);
    const a = lum(fg), b = lum(bg); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  };
};
const CASES = [
  ['index.html', '.hp-news b', 'nhãn tin mới trang chủ'],
  ['index.html', '.hp-le b', 'nhãn lễ trang chủ'],
  ['truong-hoc-thuat.html', '.af-node[data-node="n2"] .code', 'nhãn phụ nút sơ đồ chưa chọn'],
  ['truong-hoc-thuat.html', '.af-node[data-node="n3"] .eb', 'tiêu đề nút sơ đồ chưa chọn'],
  ['truong-hoc-thuat.html', '.af-nodepanel .next span', 'dòng «tiếp theo» trong khung sơ đồ'],
  ['bang-chung.html', '.bc-more', 'nút xem thêm trang Bằng chứng'],
  ['tiep-can.html', '.tc-sec h2', 'tiêu đề mục trang tiếp cận'],
];
(async () => {
  const b = await chromium.launch(); let fails = 0;
  const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
  await ctx.route(/googleapis|gstatic|goatcounter|supabase\.co|\.mp3|\.mp4/, r => r.abort());
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  let cur = '';
  for (const [p, sel, name] of CASES) {
    if (p !== cur) { await pg.goto(BASE + '/' + p, { waitUntil: 'load' }); await pg.waitForTimeout(800); await pg.evaluate(DO); cur = p; }
    const els = await pg.$$(sel); if (!els.length) { ok(false, p + ' ' + name + ': không thấy ' + sel); continue; }
    const r = await els[0].evaluate(el => window.__ratio(el));
    ok(r >= 4.5, p + ' ' + name + ': tương phản ' + r.toFixed(2) + ':1');
  }
  await pg.goto(BASE + '/tiep-can.html', { waitUntil: 'load' }); await pg.waitForTimeout(800);
  ok(await pg.$eval('.tc-wrap', el => el.tabIndex === 0 && !!el.getAttribute('aria-label')), 'tiep-can: bảng cuộn ngang nhận Tab, có nhãn');
  ok(await pg.$eval('#phan-hoi p a', el => getComputedStyle(el).textDecorationLine.includes('underline')), 'tiep-can: liên kết trong đoạn có gạch chân');
  ok(await pg.$$eval('#clay-footer a[href="tiep-can.html"]', a => a.length === 1), 'tiep-can: chân trang có liên kết Tuyên bố tiếp cận');
  await pg.goto(BASE + '/tiep-can.html?lang=en', { waitUntil: 'load' }); await pg.waitForTimeout(800);
  ok(/Accessibility statement/.test(await pg.$eval('h1', h => h.textContent)), 'tiep-can: tiêu đề tiếng Anh');
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= 1280), 'tiep-can: không tràn ngang 1280');
  await pg.setViewportSize({ width: 360, height: 800 }); await pg.waitForTimeout(300);
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= 360), 'tiep-can: không tràn ngang 360');
  await pg.goto(BASE + '/truong-hoc-thuat.html', { waitUntil: 'load' }); await pg.waitForTimeout(600);
  ok(await pg.$eval('.af-cmpwrap', el => el.tabIndex === 0), 'truong-hoc-thuat: bảng so sánh nhận Tab');
  ok(errs.length === 0, 'không lỗi JS' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close();
  if (fails) { console.error('tiep-can: ' + fails + ' lỗi'); process.exit(1); }
  console.log('tiep-can: ok');
})().catch(e => { console.error(e); process.exit(1); });
