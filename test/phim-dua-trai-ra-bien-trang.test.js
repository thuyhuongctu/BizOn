// Đặc tả 008 · PR 3 (làm sớm để giới thiệu trước): trang loạt phim «Đưa trái ra biển».
//  - Lịch 6 tập, hai tuần một tập, Chủ nhật 20:00 giờ Việt Nam; đếm ngược tới tập sắp phát (giả lập ngày bằng page.clock).
//  - Chưa có tập nào lên YouTube: mọi tập «sắp phát hành», không tải gì của YouTube. Tập đã phát có mã: nút phát,
//    bấm mới tải youtube-nocookie.
//  - canonical, sitemap, chân trang, sw.js precache; 360 VI, 390 EN, 1280 VI không tràn ngang, không lỗi JS.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), R = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const P = require('../js/phim-data.js');

// 1. Dữ liệu
assert.equal(P.tap.length, 6);
assert.deepEqual(P.tap.map(t => t.phat.slice(0, 10)), ['2026-12-13', '2026-12-27', '2027-01-10', '2027-01-24', '2027-02-21', '2027-03-07'], 'lịch theo docs/phim/ke-hoach-san-xuat.md');
for (const t of P.tap) {
  assert.match(t.phat, /T20:00:00\+07:00$/, 'phát lúc 20:00 giờ Việt Nam');
  assert.equal(new Date(t.phat).getUTCDay(), 0, 'tập ' + t.so + ' phát Chủ nhật');
  assert.ok(t.ten.vi && t.ten.en && t.quyetDinh.vi && t.quyetDinh.en, 'tập ' + t.so + ' đủ VI/EN');
  assert.deepEqual(t.yt, { vi: '', en: '' }, 'chưa đăng thì mã YouTube để trống');
}
assert.equal(P.tapKeTiep(new Date('2026-11-26T00:00:00Z')).so, 1);
assert.equal(P.tapKeTiep(new Date('2026-12-13T13:00:01Z')).so, 2, 'qua 20:00 ngày 13/12 thì tập kế tiếp là tập 2');
assert.equal(P.tapKeTiep(new Date('2027-03-08T00:00:00Z')), null);
assert.deepEqual(P.conLai('2026-12-13T20:00:00+07:00', new Date('2026-12-12T12:30:00Z')), { ngay: 1, gio: 0, phut: 30, giay: 0 });
// Không lộ «cú lật» của tập 1 (con nước ròng, đối thủ thuê hết xe lạnh) trên trang giới thiệu
const html = R('phim-dua-trai-ra-bien.html');
assert.ok(!/nước ròng|xe lạnh|low tide|refrigerated trucks/i.test(html + JSON.stringify(P)), 'không tiết lộ cú lật');
// 2. Trang, liên kết, precache
assert.match(html, /<link rel="canonical" href="https:\/\/bizonland\.com\/phim-dua-trai-ra-bien\.html">/);
assert.match(html, /js\/thong-ke\.js/);
assert.ok(!/<iframe/.test(html) && !/youtube\.com\/embed/.test(html), 'không nhúng YouTube sẵn khi mở trang');
assert.match(R('sitemap.xml'), /phim-dua-trai-ra-bien\.html/);
for (const f of ['js/bizon-clay-footer.js', 'js/site-footer.js']) assert.match(R(f), /phim-dua-trai-ra-bien\.html/, f + ' có liên kết tới trang loạt phim');
for (const f of ['phim-dua-trai-ra-bien.html', 'js/phim-data.js']) assert.ok(R('sw.js').includes("'./" + f + "'"), 'sw.js lưu sẵn ' + f);
const v = +R('sw.js').match(/bizon-v(\d+)/)[1]; assert.ok(v >= 1009, 'sw.js phải ≥ bizon-v1009, đang ' + v);
for (const m of html.matchAll(/src="(assets\/[^"]+)"/g)) assert.ok(fs.existsSync(path.join(ROOT, m[1])), 'ảnh có thật: ' + m[1]);

(async () => {
  const b = await chromium.launch(); let fail = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fail++; };
  for (const [w, lang] of [[360, 'vi'], [390, 'en'], [1280, 'vi']]) {
    const p = await b.newPage({ viewport: { width: w, height: 800 } }); const errs = [], yt = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('request', r => { if (/youtube/.test(r.url())) yt.push(r.url()); });
    await p.clock.setFixedTime(new Date('2026-12-12T12:30:00Z'));
    await p.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
    await p.goto(BASE + '/phim-dua-trai-ra-bien.html', { waitUntil: 'load' }); await p.waitForTimeout(400);
    check(await p.$$eval('#ph-lich .ph-tap', l => l.length) === 6, w + ' ' + lang + ': lịch 6 tập');
    const dem = [await p.textContent('#dem-ngay'), await p.textContent('#dem-gio'), await p.textContent('#dem-phut')].join(':');
    check(dem === '1:0:30', w + ': đếm ngược tới tập 1 còn 1 ngày 0 giờ 30 phút (' + dem + ')');
    check((await p.$eval('.ph-tap.ke-tiep', e => e.dataset.tap)) === '1', w + ': tập 1 là tập kế tiếp');
    const nhan = await p.$$eval('#ph-lich .nhan', l => l.map(x => x.textContent));
    check(nhan.every(x => (lang === 'en' ? /Coming soon|Next episode/ : /Sắp phát hành|Tập kế tiếp/).test(x)), w + ': chưa có tập nào: «sắp phát hành»');
    check(lang === 'en' ? /Fruit to the Sea/.test(await p.textContent('h1')) : /Đưa trái ra biển/.test(await p.textContent('h1')), w + ': tiêu đề đúng ngôn ngữ');
    check(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, w + ': không tràn ngang');
    check(yt.length === 0, w + ': không tải gì của YouTube khi mở trang');
    if (w === 1280) {
      // Tập 1 đã phát và có mã: hiện nút phát; bấm mới tải youtube-nocookie
      await p.clock.setFixedTime(new Date('2026-12-14T00:00:00Z'));
      await p.evaluate(() => { const t = JSON.parse(JSON.stringify(window.PhimData.tap)); t[0].yt = { vi: 'abcdefghijk', en: '' }; window.__phimTest.ve({ tap: t }); });
      check(await p.$$eval('[data-yt]', l => l.length) === 1 && (await p.$eval('.ph-tap.ke-tiep', e => e.dataset.tap)) === '2', '1280: tập 1 có nút phát, tập kế tiếp là tập 2');
      await p.click('[data-yt]'); await p.waitForTimeout(300);
      check(await p.$eval('.ph-xem iframe', f => f.src.startsWith('https://www.youtube-nocookie.com/embed/abcdefghijk')), '1280: bấm mới tải youtube-nocookie');
    }
    check(errs.length === 0, w + ': không lỗi JS ' + errs.join(' | '));
    await p.close();
  }
  await b.close();
  if (fail) { console.error(fail + ' kiểm tra hỏng'); process.exit(1); }
  console.log('phim-dua-trai-ra-bien-trang: đạt');
})().catch(e => { console.error(e); process.exit(1); });
