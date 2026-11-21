// 21/11/2026: bài tri ân «Ngọn hải đăng soi đường» (The Northern Shield) có mặt ở mọi nơi nghe nhạc của BizOn,
// không chỉ trang 20/11 và kệ đĩa Kho âm nhạc: danh sách phát của thanh tiện ích (dock), mục «Nhạc gốc» của Thư viện (VI/EN)
// và lời bài hát trong Kho âm nhạc (chép từ trang 20/11).
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const ID = 'bizonland-the-northern-shield';

const dock = read('js/site-dock.js');
assert.ok(dock.includes("'" + ID + "-v2.mp3']"), 'dock phát bản nhẹ của bài');
assert.ok(dock.indexOf("'bizon-lesprit-du-mekong-v2.mp3'") < dock.indexOf("'" + ID + "-v2.mp3'"), 'đứng ngay sau bài hát chính');
assert.ok(fs.existsSync(R('assets/audio/' + ID + '-v2.mp3')), 'tệp nhạc có thật');

global.window = {};
require(R('js/thu-vien-data.js')); require(R('js/thu-vien-data-en.js')); require(R('js/music-lyrics.js'));
const m = window.BZ_LIB.music, i = m.findIndex(x => x[2] === ID);
assert.ok(i === 1 && /Ngọn hải đăng soi đường/.test(m[i][0]), 'Thư viện: có bài, ngay sau bài hát chính');
assert.ok(read('js/thu-vien-data-en.js').includes("'" + ID + "':['«The Guiding Light» · The Northern Shield'"), 'Thư viện: có tên tiếng Anh');
const L = window.BZ_LYRICS[ID];
assert.ok(Array.isArray(L) && L[0] === '[Lời 1]' && L.includes('Kính dâng Người... ngọn hải đăng soi đường.') && L.includes('[Điệp khúc]'), 'Kho âm nhạc: có lời bài hát');
assert.ok(L.every(x => !/[<>]|&[a-z]+;/.test(x)), 'lời không lẫn thẻ HTML');
const le = read('ngay-nha-giao-20-11.html');
for (const x of L) if (x && !x.startsWith('[')) assert.ok(le.includes(x), 'lời khớp trang 20/11: ' + x);
assert.ok(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 942, 'sw.js ≥ v942');

(async () => {
  const b = await chromium.launch();
  try {
    for (const [w, lang, ten] of [[360, 'vi', 'Ngọn hải đăng soi đường'], [390, 'en', 'The Guiding Light']]) {
      const ctx = await b.newContext({ viewport: { width: w, height: 844 }, serviceWorkers: 'block' });
      const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.route(/\.(mp3|mp4)(\?|$)/, r => r.abort());
      await p.addInitScript(l => localStorage.setItem('bizon-lang', l), lang);
      const tag = w + ' ' + lang;
      await p.goto(BASE + '/thu-vien.html?lang=' + lang, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(800);
      assert.ok(await p.evaluate(t => document.body.innerText.includes(t), ten), tag + ': Thư viện hiện tên bài');
      await p.goto(BASE + '/am-nhac.html?lang=' + lang, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(800);
      const gi = await p.evaluate(id => window.BZ_MUSIC.groups.findIndex(g => g[3].some(t => t[2] === id)), ID);
      await p.click('button[data-gi="' + gi + '"]'); await p.waitForTimeout(400);
      assert.equal(await p.evaluate(() => !document.getElementById('am-lyr').hidden), true, tag + ': nút «Lời bài hát» hiện khi đặt đĩa bài này');
      await p.click('#am-lyr'); await p.waitForTimeout(300);
      assert.ok(await p.evaluate(() => document.getElementById('am-lyrics').innerText.includes('ngọn hải đăng soi đường')), tag + ': mở được lời bài hát');
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth) <= w, tag + ': không tràn ngang');
      await p.goto(BASE + '/brand-passport-learning.html', { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(800);
      assert.equal(await p.evaluate(f => window.BizonDock && window.BizonDock.play(f), ID + '-v2.mp3'), true, tag + ': dock phát được bài');
      assert.deepEqual(errs, [], tag + ': không lỗi JS');
      await ctx.close();
    }
    console.log('northern-shield-kho-nhac: đạt');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
