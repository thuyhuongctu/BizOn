'use strict';
// Lối vào «Hành trình 3 bậc» (hanh-trinh.html) từ mọi cửa chính: dải «nối ba bậc» ngay sau danh sách bậc trên trang chủ
// (index = academia3d-v2), thẻ cuối danh sách game chính ở Trung tâm trò chơi, thẻ Hộ chiếu trên trang Vũ trụ, menu dùng chung, lối tắt PWA và lối tắt Android (TWA).
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// --- tĩnh ---
const home = read('academia3d-v2.html');
assert.equal(read('index.html'), home, 'index.html phải y hệt academia3d-v2.html');
assert.match(home, /<a class="hp-journey" href="hanh-trinh.html" id="hp-journey">/);
assert.ok(home.includes('data-en="Link the three levels into one journey: From the River Silt to the World">Nối ba bậc thành một hành trình: Từ Phù Sa ra Thế giới</h3>'));
assert.ok(home.includes('<ul class="hp-journey-steps"><li><b>1</b>') && home.includes('<li><b>3</b><span data-en="Brand or Durian Passport">'));
assert.ok(home.includes('data-en="Start the journey">Bắt đầu hành trình</span>'));
assert.ok(home.indexOf('</ol>') < home.indexOf('id="hp-journey"') && home.indexOf('id="hp-journey"') < home.indexOf('<div class="hp-tools-head">'), 'dải hành trình đứng ngay sau danh sách bậc, trước công cụ bổ trợ');
assert.ok(home.includes('thành <a href="#hp-journey">một hành trình liền mạch</a>'), 'lời dẫn nhảy tới dải');
assert.ok(home.includes('một hành trình liền mạch · ba công cụ bổ trợ</div>'));
assert.match(home, /\.hp-journey\{display:flex;/);
// mọi phần tử chữ trong dải có data-en
const strip = home.slice(home.indexOf('<a class="hp-journey"'), home.indexOf('<div class="hp-tools-head">'));
for (const m of strip.matchAll(/<(div|h3|p|span)\b([^>]*)>([^<]+)</g)) if (m[3].trim() && m[3].trim() !== '→') assert.ok(/\sdata-en=/.test(m[2]), 'thiếu data-en: ' + m[3].slice(0, 40));
const hub = read('js/games-clay.js');
assert.equal((hub.match(/journeyKicker:'/g) || []).length, 2, 'từ điển VI + EN');
assert.ok(hub.includes("journeyTitle:'Nối ba bậc thành một hành trình: Từ Phù Sa ra Thế giới'") && hub.includes("journeyTitle:'Link the three levels into one journey: From the River Silt to the World'"));
assert.ok(hub.includes(`'<a id="ar-journey" href="'+B+'hanh-trinh.html"`) && hub.includes("}).join('') + journey);"));
assert.ok(read('universe.html').includes('<a class="go" href="hanh-trinh.html"') && read('universe.html').includes('data-en="Start the 3-level journey →">Bắt đầu hành trình 3 bậc →</a>'));
assert.ok(read('js/bizon-clay-nav.js').includes("{ href:'hanh-trinh.html',       vi:'Hành trình',en:'Journey' },"));
const man = JSON.parse(read('manifest.webmanifest'));
assert.ok(Array.isArray(man.shortcuts) && man.shortcuts[0].url === './hanh-trinh.html' && man.shortcuts.length >= 2 && man.shortcuts.length <= 4, 'lối tắt PWA');
for (const sc of man.shortcuts) { assert.ok(sc.name && sc.short_name && sc.icons && sc.icons[0].src.startsWith('assets/icons/'), 'lối tắt thiếu trường'); assert.ok(fs.existsSync(path.join(ROOT, sc.url.replace(/^\.\//, ''))), 'lối tắt trỏ tới trang không tồn tại: ' + sc.url); }
const twa = JSON.parse(read('android/twa-manifest.json'));
assert.ok(twa.shortcuts.length <= 4 && twa.shortcuts.some(s => s.url === '/hanh-trinh.html' && s.shortName === 'Hành trình'), 'lối tắt Android');
assert.ok(read('sw.js').includes("'./hanh-trinh.html'"), 'hanh-trinh.html trong precache');
assert.match(read('sw.js'), /const CACHE = 'bizon-v\d+';/);

// --- trình duyệt ---
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } }); const errors = [];
  page.on('pageerror', e => errors.push('err: ' + e.message));
  await page.route(/\.(mp3|m4a|mp4|webm)(\?|$)/, r => r.abort());
  await page.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
  // trang chủ: dải hiện, bấm vào tới hanh-trinh.html không lỗi
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 60000 }); await page.waitForTimeout(500);
  assert.ok(await page.$eval('#hp-journey', e => e.offsetHeight > 60 && getComputedStyle(e).display === 'flex'));
  assert.equal(await page.$eval('#hp-journey h3', e => e.textContent.trim()), 'Nối ba bậc thành một hành trình: Từ Phù Sa ra Thế giới');
  assert.ok(await page.evaluate(() => document.querySelector('ol.hp-games').compareDocumentPosition(document.getElementById('hp-journey')) & Node.DOCUMENT_POSITION_FOLLOWING), 'dải đứng sau danh sách bậc trong DOM');
  await Promise.all([page.waitForNavigation({ waitUntil: 'load', timeout: 60000 }), page.click('#hp-journey')]);
  assert.match(page.url(), /\/hanh-trinh\.html$/); await page.waitForTimeout(400);
  assert.equal(await page.$eval('h1', e => e.textContent.trim()), 'Từ Phù Sa ra Thế giới');
  // menu dùng chung có «Hành trình» và đánh dấu trang hiện tại
  assert.equal(await page.$eval('#clay-nav a[href$="hanh-trinh.html"]', e => e.textContent.trim() + '|' + (e.getAttribute('aria-current') || '')), 'Hành trình|page');
  // Trung tâm trò chơi: thẻ hành trình đứng đầu, song ngữ
  await page.goto(`${BASE}/games.html`, { waitUntil: 'load', timeout: 60000 }); await page.waitForSelector('#ar-journey', { timeout: 20000 });
  assert.equal(await page.$eval('#ar-mains', e => e.lastElementChild.id), 'ar-journey');
  assert.equal(await page.$eval('#ar-mains', e => e.children.length), 5, '4 game + thẻ hành trình');
  assert.equal(await page.$eval('#ar-journey h3', e => e.textContent.trim()), 'Nối ba bậc thành một hành trình: Từ Phù Sa ra Thế giới');
  await page.goto(`${BASE}/games.html?lang=en`, { waitUntil: 'load', timeout: 60000 }); await page.waitForSelector('#ar-journey', { timeout: 20000 }); await page.waitForTimeout(300);
  assert.equal(await page.$eval('#ar-journey h3', e => e.textContent.trim()), 'Link the three levels into one journey: From the River Silt to the World');
  // trang Vũ trụ: thẻ Hộ chiếu dẫn tới hành trình
  await page.goto(`${BASE}/universe.html`, { waitUntil: 'load', timeout: 60000 }); await page.waitForTimeout(300);
  assert.equal(await page.$eval('a.go[href="hanh-trinh.html"]', e => e.textContent.trim()), 'Bắt đầu hành trình 3 bậc →');
  // điện thoại: dải không tràn ngang
  const phone = await browser.newPage({ viewport: { width: 390, height: 800 } }); phone.on('pageerror', e => errors.push('phone: ' + e.message));
  await phone.route(/\.(mp3|m4a|mp4|webm)(\?|$)/, r => r.abort());
  await phone.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 60000 }); await phone.waitForTimeout(500);
  const over = await phone.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(over <= 1, 'tràn ngang: ' + over);
  await browser.close();
  assert.deepEqual(errors, [], 'không lỗi JS');
  console.log('journey-entry: OK');
})().catch(e => { console.error(e); process.exit(1); });
