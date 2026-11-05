/* lab/hanh-trinh-sau-rieng.html – Hành Trình Một Trái Sầu Riêng: trang cuộn kể chuyện trên sa bàn 3D.
 * Kiểm dữ liệu 7 chặng (mỗi chặng có dữ kiện có nguồn trong DurianData.facts, đủ ảnh, đủ hai thứ tiếng), kiểm tĩnh
 * (canonical, sitemap, sw.js, hub dẫn tới, importmap three, không nạp engine/core Hộ Chiếu) và chạy thật bằng
 * Playwright trên BIZON_URL: cảnh 3D dựng được, cuộn tới chặng nào thì tiến độ máy quay về đúng chặng ấy, ô nguồn mở
 * được, bản EN, điện thoại 390px không tràn ngang, không lỗi JS. */
'use strict';
const path = require('path');
const fs = require('fs');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium;
try { chromium = require('playwright').chromium; } catch (e) {
  try { chromium = require('playwright-core').chromium; } catch (e2) { console.error('hanh-trinh-sau-rieng: cần playwright'); process.exit(1); }
}
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const H = require('../lab/hanh-trinh-sau-rieng-data.js');
const DD = require('../lab/ho-chieu-sau-rieng-data.js');

// ---- Dữ liệu ----
check(H.CHANG.length === 7 && H.CHANG.every((c, i) => i === 0 || c.x > H.CHANG[i - 1].x), '7 chặng, vị trí tăng dần dọc con đường');
check(H.CHANG.every(c => ['vi', 'en'].every(l => c[l].ten && c[l].loi) && (!c.lienKet || (c.vi.nut && c.en.nut))), 'mỗi chặng đủ tên và lời dẫn hai thứ tiếng');
{ const thieu = H.CHANG.flatMap(c => c.dk).filter(k => !DD.facts[k] || !DD.sources[DD.facts[k].src]);
  check(H.CHANG.every(c => c.dk.length) && !thieu.length, 'mỗi chặng trỏ tới dữ kiện có nguồn trong DurianData.facts ' + thieu.join(', ')); }
{ const thieu = H.CHANG.map(c => c.anh).filter(f => !fs.existsSync(path.join(root, 'assets/hc', f)));
  check(!thieu.length, 'đủ ảnh 3D có sẵn cho 7 chặng ' + thieu.join(', ')); }
check(H.CHANG.filter(c => c.lienKet).every(c => fs.existsSync(path.join(root, 'lab', c.lienKet))), 'liên kết trong chặng trỏ tới trang có thật');

// ---- Kiểm tĩnh ----
const page = read('lab/hanh-trinh-sau-rieng.html'), sw = read('sw.js'), g3 = read('lab/hanh-trinh-sau-rieng-3d.js');
check(page.includes('<link rel="canonical" href="https://bizonland.com/lab/hanh-trinh-sau-rieng.html">') && read('sitemap.xml').includes('https://bizonland.com/lab/hanh-trinh-sau-rieng.html'), 'canonical + sitemap');
check(/"three": "\.\.\/js\/vendor\/three\.module\.js"/.test(page) && page.includes('type="module" src="hanh-trinh-sau-rieng-3d.js"'), 'importmap three và cảnh 3D nạp dạng module');
check(!/ho-chieu-sau-rieng-(engine|core)\.js/.test(page) && page.indexOf('src="ho-chieu-sau-rieng-data.js"') > 0 && page.indexOf('src="ho-chieu-sau-rieng-data.js"') < page.indexOf('src="hanh-trinh-sau-rieng-ui.js"'), 'chỉ đọc dữ liệu Hộ Chiếu, không nạp engine/core');
check(['tan-cang-warehouse.glb', 'crate.glb', 'kenney-cay/'].every(f => g3.includes(f)) && /Kenney/.test(read('assets/models/SOURCES.md')), 'mô hình 3D chỉ dùng bộ Kenney (CC0) đã ghi nguồn');
check(read('ho-chieu-sau-rieng.html').includes('href="lab/hanh-trinh-sau-rieng.html"'), 'trang Hộ Chiếu Sầu Riêng dẫn tới hành trình');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(sw) || [])[1] >= 780 && ['html', '-data.js', '-ui.js', '-3d.js'].every(f => sw.includes("'./lab/hanh-trinh-sau-rieng" + (f === 'html' ? '.html' : f) + "'")), 'sw.js ≥ bizon-v780 và cache bốn tệp');

// ---- Chạy thật ----
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  async function chay(w, h, lang) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    const p = await ctx.newPage(); const loi = [];
    p.on('pageerror', e => loi.push(e.message)); p.on('console', m => { if (m.type() === 'error') loi.push(m.text()); });
    await p.goto(BASE + '/lab/hanh-trinh-sau-rieng.html?lang=' + lang);
    await p.waitForSelector('.ht-buoc'); await p.waitForTimeout(1200);
    const lop = await p.evaluate(() => document.documentElement.className);
    check(/ht-3d-san-sang/.test(lop) && !/ht-no3d/.test(lop) && (await p.locator('#ht-stage canvas').count()) === 1, w + 'px ' + lang + ': cảnh 3D dựng được');
    const tien = [];
    for (let i = 1; i <= 7; i++) {
      await p.evaluate(i => document.getElementById('chang-' + i).scrollIntoView({ block: 'center' }), i);
      await p.waitForTimeout(250);
      tien.push(await p.evaluate(() => window.__htTien));
    }
    check(tien.every((t, i) => Math.abs(t - i) < 0.05), w + 'px ' + lang + ': cuộn tới chặng nào thì máy quay về chặng ấy ' + tien.map(t => t.toFixed(2)).join(' '));
    check((await p.locator('#ht-ray a[aria-current]').textContent()) === '7', w + 'px ' + lang + ': thanh chặng đánh dấu chặng đang xem');
    await p.click('#chang-3 .ht-dk summary');
    const dk = await p.textContent('#chang-3 .ht-dk');
    check(dk.includes(lang === 'en' ? 'Source:' : 'Nguồn:') && dk.includes('10/1/2025'), w + 'px ' + lang + ': ô dữ kiện có nguồn mở được');
    check((await p.textContent('#ht-h-0')).startsWith(lang === 'en' ? 'An orchard with an area code' : 'Vườn có mã vùng trồng'), w + 'px ' + lang + ': tiêu đề chặng đúng ngôn ngữ');
    check((await p.getAttribute('#chang-3 .ht-nut', 'href')) === 'day-chuyen-sau-rieng.html', w + 'px ' + lang + ': chặng nhà đóng gói dẫn sang Dây Chuyền');
    check((await p.evaluate(() => document.documentElement.scrollWidth)) <= w, w + 'px ' + lang + ': không tràn ngang');
    check(!loi.length, w + 'px ' + lang + ': không lỗi JS ' + loi.join(' / '));
    await ctx.close();
  }
  try { await chay(1366, 820, 'vi'); await chay(390, 844, 'vi'); await chay(390, 844, 'en'); }
  catch (e) { check(false, 'lỗi khi chạy: ' + e.message); }
  await b.close();
  if (fails) { console.log('hanh-trinh-sau-rieng: ' + fails + ' lỗi'); process.exit(1); }
  console.log('hanh-trinh-sau-rieng: ok');
})();
