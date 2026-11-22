// 22/11/2026: MV «Ngọn hải đăng soi đường» bản tiếng Anh – Pháp (Southern Horizons, YouTube 3Z934Ae8Zmo)
// có trên trang tri ân 20/11 (nút phát, chỉ tải trình phát YouTube khi bấm) và trong Thư viện Sáng tạo, mục MV 3D
// (thẻ mở YouTube ở tab mới), cạnh bản tiếng Việt 8yottDb7Bg0.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const EN = '3Z934Ae8Zmo', VI = '8yottDb7Bg0', POSTER = 'assets/video/mv-southern-horizons-en-fr-poster.webp';

const b = fs.readFileSync(R(POSTER));
assert.ok(b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP', 'ảnh bìa bản EN/FR là WebP');
const le = read('ngay-nha-giao-20-11.html');
assert.ok(le.includes('data-yt="' + EN + '"') && le.includes('href="https://youtu.be/' + EN + '"'), 'trang tri ân có MV bản tiếng Anh – Pháp');
assert.ok(le.includes('data-yt="' + VI + '"'), 'trang tri ân vẫn giữ bản tiếng Việt');
assert.ok(le.includes("url('" + POSTER + "')"), 'nút phát dùng ảnh bìa lưu trên trang');
const tv = read('js/thu-vien-clay.js');
assert.ok(tv.includes("'" + EN + "'") && tv.includes("'" + VI + "'"), 'Thư viện có cả hai bản MV');
assert.ok(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 956, 'sw.js ≥ v956');

(async () => {
  const br = await chromium.launch();
  try {
    for (const [w, lang] of [[360, 'vi'], [390, 'en'], [1280, 'vi']]) {
      const tag = w + ' ' + lang;
      const p = await br.newPage({ viewport: { width: w, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.route(/youtube|\.(mp3|mp4)(\?|$)/, r => r.abort());
      await p.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);

      // Trang tri ân: hai nút phát, bấm bản EN/FR thì trình phát YouTube của đúng video hiện ra
      await p.goto(BASE + '/ngay-nha-giao-20-11.html?lang=' + lang, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(400);
      const ids = await p.$$eval('#bai-tri-an .le-mv button[data-yt]', bs => bs.map(x => x.getAttribute('data-yt')));
      assert.deepEqual(ids, [VI, EN], tag + ': tri ân có bản Việt rồi bản Anh – Pháp');
      const note = await p.textContent('#bai-tri-an button[data-yt="' + EN + '"] .note');
      assert.match(note, lang === 'en' ? /English & French/ : /tiếng Anh – Pháp/, tag + ': nhãn bản EN/FR đúng ngôn ngữ');
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth) <= w, tag + ': tri ân không tràn ngang');
      await p.click('#bai-tri-an button[data-yt="' + EN + '"]');
      assert.ok(await p.$('#bai-tri-an iframe[src*="youtube-nocookie.com/embed/' + EN + '"]'), tag + ': bấm thì nhúng đúng MV EN/FR');

      // Thư viện Sáng tạo: hai thẻ YouTube trong mục MV 3D
      await p.goto(BASE + '/thu-vien.html?lang=' + lang, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(600);
      const links = await p.$$eval('#lib-sections a[data-yt-link]', as => as.map(a => [a.getAttribute('data-yt-link'), a.href, a.target, a.innerText]));
      assert.deepEqual(links.map(x => x[0]), [VI, EN], tag + ': thư viện có hai thẻ MV');
      assert.equal(links[1][1], 'https://youtu.be/' + EN, tag + ': thẻ EN/FR mở đúng video');
      assert.equal(links[1][2], '_blank', tag + ': mở ở tab mới');
      assert.match(links[1][3], lang === 'en' ? /English & French/ : /tiếng Anh – Pháp/, tag + ': tên thẻ đúng ngôn ngữ');
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth) <= w, tag + ': thư viện không tràn ngang');
      assert.deepEqual(errs, [], tag + ': không lỗi JS');
      await p.close();
    }
    console.log('mv-southern-horizons-en-fr: đạt');
  } finally { await br.close(); }
})().catch(e => { console.error(e); process.exit(1); });
