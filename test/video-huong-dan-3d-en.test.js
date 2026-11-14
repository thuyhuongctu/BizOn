// Video tiếng Anh «chơi một vòng Bật Nghiệp 3D» (3 phút, phụ đề in trên hình) cho lớp UM Kendari (14/11/2026):
// gắn ở đầu trang Hướng dẫn chơi (huong-dan.html), poster WebP, không tải trước khi bấm, có trong mục lục, không tràn ngang ở 360 px.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..');
assert.ok(+(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8').match(/bizon-v(\d+)/) || [])[1] >= 868);
const MP4 = 'assets/video/bat-nghiep-3d-huong-dan-en.mp4', POSTER = 'assets/video/bat-nghiep-3d-huong-dan-en-poster.webp';
const mp4 = fs.readFileSync(path.join(ROOT, MP4));
assert.ok(mp4.length > 5e6 && mp4.length < 25e6, 'cỡ video ' + mp4.length);
assert.equal(mp4.slice(4, 8).toString(), 'ftyp', 'mp4 hợp lệ');
assert.ok(mp4.indexOf('moov') < mp4.indexOf('mdat'), 'faststart: moov đứng trước mdat để phát ngay khi tải');
assert.ok(fs.statSync(path.join(ROOT, POSTER)).size > 20000, 'poster');

(async () => {
  const b = await chromium.launch(); const errs = [];
  const open = async (lang, width) => {
    const pg = await b.newPage({ viewport: { width, height: 800 } }); pg.on('pageerror', e => errs.push(e.message));
    await pg.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
    await pg.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
    await pg.goto(BASE + '/huong-dan.html?lang=' + lang, { waitUntil: 'load', timeout: 60000 });
    await pg.waitForFunction(() => { const h = document.querySelector('#video-3d h2'); return h && !/\{\{/.test(h.textContent) && h.textContent.trim(); }, null, { timeout: 15000 });
    return pg.evaluate(() => {
      const sec = document.querySelector('#video-3d'), v = sec.querySelector('video');
      return {
        title: sec.querySelector('h2').textContent, src: v.querySelector('source').getAttribute('src'), poster: v.getAttribute('poster'),
        preload: v.getAttribute('preload'), controls: v.hasAttribute('controls'), playsinline: v.hasAttribute('playsinline'),
        beforeStart: sec.nextElementSibling && sec.nextElementSibling.id === 'bat-dau',
        toc0: (document.querySelector('nav[aria-label="Mục lục"] a') || {}).getAttribute && document.querySelector('nav[aria-label="Mục lục"] a').getAttribute('href'),
        tocN: document.querySelectorAll('nav[aria-label="Mục lục"] a').length,
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        vw: v.getBoundingClientRect().width, sw: sec.getBoundingClientRect().width,
      };
    });
  };
  try {
    for (const [lang, w, re] of [['en', 1280, /play one round of Bật Nghiệp 3D/], ['vi', 1280, /chơi một vòng Bật Nghiệp 3D/], ['en', 360, /3D/], ['vi', 390, /3D/]]) {
      const r = await open(lang, w);
      assert.match(r.title, re, lang + ' tiêu đề');
      assert.equal(r.src, MP4); assert.equal(r.poster, POSTER);
      assert.equal(r.preload, 'none', 'không tải video trước khi bấm');
      assert.ok(r.controls && r.playsinline);
      assert.ok(r.beforeStart, 'video nằm ngay trên mục «1 · Bắt đầu»');
      assert.equal(r.toc0, '#video-3d'); assert.equal(r.tocN, 9);
      assert.ok(r.overflow <= 0, `${lang} ${w}px tràn ngang ${r.overflow}px`);
      assert.ok(Math.abs(r.vw - r.sw) < 2, 'video rộng bằng mục');
    }
    assert.deepEqual(errs, []);
    console.log('video-huong-dan-3d-en: ok');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
