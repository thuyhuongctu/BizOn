// Trang chủ, mục «Công cụ bổ trợ»: thẻ «Học qua tình huống» đưa tới Thư viện tình huống và Tình huống khởi nghiệp;
// thẻ «Lab thực hành» thêm Phòng luyện pitch gọi vốn
// (trước đó thư viện chỉ vào được qua Giảng viên → Dự án CHAM; lab khởi nghiệp không có lối vào từ trang chủ).
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), R = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const home = R('index.html');
assert.equal(home, R('academia3d-v2.html'), 'index.html phải giống hệt academia3d-v2.html');
const i = home.indexOf('<li class="hp-tool" id="hp-tinh-huong">');
assert.ok(i > 0, 'có thẻ «Học qua tình huống»');
// Thẻ «Lab thực hành» có thêm Phòng luyện pitch (đặc tả 010), mô tả «Năm lab»
assert.match(home, /Năm lab, mỗi lab gọn trong một buổi học/); assert.match(home, /data-en="Five labs, each fits in one class session:"/);
assert.ok(home.includes('<a href="lab/pitch-goi-von.html" data-en="Pitch room">Phòng luyện pitch</a>') && fs.existsSync(path.join(ROOT, 'lab/pitch-goi-von.html')), 'thẻ Lab thực hành có Phòng luyện pitch');
const lab = home.indexOf('href="lab/pitch-goi-von.html" data-en="Pitch room">Phòng luyện pitch</a>'), arcade = home.indexOf('assets/character/arcade-rong-bay-sau-rieng-cut.webp');
assert.ok(lab > 0 && lab < i && i < arcade, 'thẻ nằm ngay sau «Lab thực hành», trước Arcade');
const the = home.slice(i, home.indexOf('</li>\n      <li class="hp-tool">', i));
for (const h of ['thu-vien-tinh-huong.html', 'lab/khoi-nghiep-tinh-huong.html']) {
  assert.ok(the.includes('href="' + h + '"'), 'thẻ có liên kết ' + h);
  assert.ok(fs.existsSync(path.join(ROOT, h)), 'trang ' + h + ' có thật');
}
const img = the.match(/src="([^"]+)"/)[1]; assert.ok(fs.existsSync(path.join(ROOT, img)), 'ảnh thẻ có thật');
assert.match(the, /data-en="CASE STUDIES"/); assert.match(the, /giả định, không chấm điểm/);
const v = +R('sw.js').match(/bizon-v(\d+)/)[1]; assert.ok(v >= 1007, 'sw.js phải ≥ bizon-v1007, đang ' + v);
(async () => {
  const b = await chromium.launch(); let fail = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fail++; };
  for (const [w, lang] of [[360, 'vi'], [1280, 'en']]) {
    const p = await b.newPage({ viewport: { width: w, height: 800 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.route(/\.(mp4|mp3|m4a|woff2?)(\?|$)/, r => r.abort());
    await p.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
    await p.goto(BASE + '/index.html', { waitUntil: 'load', timeout: 60000 });
    await p.locator('#hp-tinh-huong').scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
    const c = await p.$eval('#hp-tinh-huong', el => ({ links: [...el.querySelectorAll('.hp-tool-links a')].map(a => [a.getAttribute('href'), a.textContent.trim(), a.getBoundingClientRect().height]), kick: el.querySelector('.hp-tool-kicker').textContent.trim(), img: el.querySelector('img').complete && el.querySelector('img').naturalWidth > 0 }));
    check(c.links.length === 2, w + ': hai liên kết (vùng chạm 44 px kiểm ở test/vung-cham-44.test.js)');
    check(c.img, w + ': ảnh thẻ tải được');
    check(lang === 'en' ? c.kick === 'CASE STUDIES' && c.links[1][1] === 'Startup cases' : c.kick === 'HỌC QUA TÌNH HUỐNG', w + ' ' + lang + ': chữ đúng ngôn ngữ');
    check(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, w + ': không tràn ngang');
    check(errs.length === 0, w + ': không lỗi JS ' + errs.join(' | '));
    await p.close();
  }
  await b.close();
  if (fail) { console.error(fail + ' kiểm tra hỏng'); process.exit(1); }
  console.log('trang-chu-tinh-huong: đạt');
})().catch(e => { console.error(e); process.exit(1); });
