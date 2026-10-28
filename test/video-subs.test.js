// Phụ đề VI/EN (28/10/2026): 7 video ngang (2 giới thiệu + 5 trailer) có assets/video/subs/<tên>.<vi|en>.vtt, gắn qua
// js/video-subs.js. Tự bật phụ đề khi tiếng trong video khác ngôn ngữ giao diện. Video hướng dẫn dạng dọc đã in sẵn phụ đề.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const src = read('js/video-subs.js');
const AUDIO = JSON.parse(src.match(/var AUDIO = (\{[^}]+\})/)[1].replace(/'/g, '"'));
assert.equal(Object.keys(AUDIO).length, 7);
const sec = t => { const [h, m, s] = t.split(':'); return +h * 3600 + +m * 60 + +s; };
for (const [base, audio] of Object.entries(AUDIO)) {
  assert.ok(['vi', 'en'].includes(audio));
  assert.ok(fs.existsSync(path.join(ROOT, 'assets/video', base + '.mp4')) || fs.existsSync(path.join(ROOT, 'assets/video', base + '-720p.mp4')), base + ': không có video');
  const counts = [];
  for (const l of ['vi', 'en']) {
    const f = `assets/video/subs/${base}.${l}.vtt`, v = read(f);
    assert.ok(v.startsWith('WEBVTT\n'), f + ': thiếu WEBVTT');
    const times = [...v.matchAll(/^(\d\d:\d\d:\d\d\.\d{3}) --> (\d\d:\d\d:\d\d\.\d{3})$/gm)].map(m => [sec(m[1]), sec(m[2])]);
    assert.ok(times.length >= 8, f + ': quá ít câu');
    let prev = 0;
    for (const [a, b] of times) { assert.ok(a >= prev - 1e-6 && b > a && b - a <= 12 && b <= 101, f + ': mốc thời gian sai ' + a + '–' + b); prev = b; }
    for (const block of v.trimEnd().split('\n\n').slice(2)) assert.ok(block.split('\n').length <= 4, f + ': câu quá 2 dòng');
    assert.ok(!/Bison|Ben Phu Xe|Gun Teh|Wat Nang/i.test(v), f + ': còn lỗi nhận dạng tên riêng');
    counts.push(times.length);
  }
  assert.equal(counts[0], counts[1], base + ': hai bản phụ đề lệch số câu');
}
assert.equal(read('index.html'), read('academia3d-v2.html'));
for (const f of ['index.html', 'universe.html']) assert.ok(read(f).includes('js/video-subs.js') && read(f).includes('BizOnSubs.attach('), f + ' chưa gắn phụ đề');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 701);
(async () => {
  const b = await chromium.launch(); const errs = [];
  const open = async (p, lang) => {
    const pg = await b.newPage({ viewport: { width: 1280, height: 800 } }); pg.on('pageerror', e => errs.push(p + ': ' + e.message));
    await pg.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
    await pg.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
    await pg.goto(BASE + '/' + p, { waitUntil: 'load', timeout: 60000 }); await pg.waitForTimeout(800);
    return pg;
  };
  const tracks = pg => pg.evaluate(sel => { const v = document.querySelector(sel); return [...v.querySelectorAll('track')].map((t, i) => [t.srclang, t.getAttribute('src'), v.textTracks[i].mode]); }, '#hp-trailer video');
  try {
    // Giao diện tiếng Việt, trailer tiếng Anh: phụ đề Việt bật sẵn, bản 720p dùng chung tệp phụ đề với bản gốc.
    let pg = await open('index.html', 'vi');
    await pg.evaluate(s => document.querySelector(s).click(), 'a.hp-game-tr[data-trailer*="srp-trailer"]'); await pg.waitForTimeout(300);
    assert.deepEqual(await tracks(pg), [['vi', 'assets/video/subs/srp-trailer.vi.vtt', 'showing'], ['en', 'assets/video/subs/srp-trailer.en.vtt', 'disabled']]);
    await pg.waitForFunction(() => { const t = document.querySelector('#hp-trailer track'); return t && t.readyState === 2 && t.track.cues.length > 8; }, null, { timeout: 10000 });
    assert.match(await pg.evaluate(() => document.querySelector('#hp-trailer track').track.cues[0].text), /Trung Quốc/);
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
    assert.equal(await pg.evaluate(() => document.querySelectorAll('#hp-trailer track').length), 0, 'đóng hộp thoại thì gỡ phụ đề');
    // Video giới thiệu bản tiếng Việt cho giao diện Việt: phụ đề có sẵn nhưng để tắt.
    await pg.evaluate(s => document.querySelector(s).click(), 'a.hp-intro'); await pg.waitForTimeout(300);
    assert.deepEqual((await tracks(pg)).map(t => t[1] + ' ' + t[2]), ['assets/video/subs/bizon-intro-vi-v4.vi.vtt disabled', 'assets/video/subs/bizon-intro-vi-v4.en.vtt disabled']);
    await pg.close();
    // Giao diện tiếng Anh, trailer tiếng Anh: không tự bật.
    pg = await open('index.html', 'en');
    await pg.evaluate(s => document.querySelector(s).click(), 'a.hp-game-tr[data-trailer*="bizon-trailer-v3"]'); await pg.waitForTimeout(300);
    assert.deepEqual((await tracks(pg)).map(t => t[2]), ['disabled', 'disabled']);
    await pg.close();
    // Trang Vũ trụ: video giới thiệu đổi bản tiếng Việt thì phụ đề đổi theo.
    for (const [lang, want] of [['vi', 'bizon-intro-vi-v4'], ['en', 'bizon-intro-en-v3']]) {
      pg = await open('universe.html', lang);
      const t = await pg.evaluate(() => [...document.querySelectorAll('#vu-intro track')].map(t => t.getAttribute('src')));
      assert.deepEqual(t, [`assets/video/subs/${want}.vi.vtt`, `assets/video/subs/${want}.en.vtt`], 'universe ' + lang);
      await pg.close();
    }
  } finally { await b.close(); }
  assert.deepEqual(errs, []);
  console.log('video-subs: ok');
})().catch(e => { console.error(e); process.exit(1); });
