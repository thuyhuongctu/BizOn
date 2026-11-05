// Video «Một trái sầu riêng, cả vùng cùng sầu» gắn ở màn mở đầu Hộ Chiếu Sầu Riêng (bản lớp học, 5/11/2026):
// bản 720p theo ngôn ngữ giao diện, poster WebP, phụ đề VI/EN để tắt; đổi ngôn ngữ thì đổi video; không tràn ngang ở 360 px.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..');
assert.ok(+(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8').match(/bizon-v(\d+)/) || [])[1] >= 775);

(async () => {
  const b = await chromium.launch(); const errs = [];
  const open = async (lang, width) => {
    const pg = await b.newPage({ viewport: { width, height: 800 } }); pg.on('pageerror', e => errs.push(e.message));
    await pg.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
    await pg.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
    await pg.goto(BASE + '/lab/ho-chieu-sau-rieng.html', { waitUntil: 'load', timeout: 60000 });
    await pg.waitForSelector('#introVideo', { timeout: 15000 });
    return pg;
  };
  const info = pg => pg.evaluate(() => {
    const v = document.querySelector('#introVideo'), card = v.closest('.card');
    return {
      src: v.querySelector('source').getAttribute('src'), poster: v.getAttribute('poster'), preload: v.getAttribute('preload'),
      tracks: [...v.querySelectorAll('track')].map((t, i) => [t.srclang, t.getAttribute('src'), v.textTracks[i].mode]),
      beforeQuick: !!(card.nextElementSibling && card.nextElementSibling.classList.contains('quickstart')),
      title: card.querySelector('h2').textContent,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
  try {
    let pg = await open('vi', 1280);
    let r = await info(pg);
    assert.equal(r.src, '../assets/video/sau-rieng-ma-so-vi-720p.mp4');
    assert.equal(r.poster, '../assets/video/sau-rieng-ma-so-vi-poster.webp');
    assert.equal(r.preload, 'none', 'không tải video trước khi bấm');
    assert.deepEqual(r.tracks, [['vi', '../assets/video/subs/sau-rieng-ma-so-vi.vi.vtt', 'disabled'], ['en', '../assets/video/subs/sau-rieng-ma-so-vi.en.vtt', 'disabled']]);
    assert.ok(r.beforeQuick, 'video nằm ngay trên «Bắt đầu nhanh»');
    assert.match(r.title, /Một trái sầu riêng, cả vùng cùng sầu/);
    for (const f of [r.poster, ...r.tracks.map(t => t[1])]) assert.ok(fs.existsSync(path.join(ROOT, 'lab', f)), 'thiếu ' + f);
    // đổi sang tiếng Anh: video tiếng Anh
    await pg.click('#langEN'); await pg.waitForSelector('#introVideo');
    r = await info(pg);
    assert.equal(r.src, '../assets/video/sau-rieng-ma-so-en-720p.mp4');
    assert.match(r.title, /One Durian, One Code/);
    await pg.close();
    // điện thoại 360 px, giao diện tiếng Anh: không tràn ngang
    pg = await open('en', 360);
    r = await info(pg);
    assert.equal(r.src, '../assets/video/sau-rieng-ma-so-en-720p.mp4');
    assert.ok(r.overflow <= 0, 'tràn ngang ' + r.overflow + ' px');
    const w = await pg.evaluate(() => document.querySelector('#introVideo').getBoundingClientRect().width);
    assert.ok(w > 250 && w <= 360, 'bề rộng video ' + w);
    await pg.close();
    assert.deepEqual(errs, []);
    console.log('video-sau-rieng-trang: ok');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
