// 20/11/2026: thêm ca khúc «BizOnland · Fjord Moonlight» (Je m'appelle Hương, 4:45) vào Kho Âm nhạc.
// Bản gốc 192 kbps để nút tải về; bản nghe trên web nén 128 kbps (-v2) như 17 bài nặng khác.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8'), size = f => fs.statSync(R(f)).size;
const ID = 'bizonland-fjord-moonlight', GOC = 'assets/audio/' + ID + '.mp3', NHE = 'assets/audio/' + ID + '-v2.mp3';
assert.ok(fs.existsSync(R(GOC)) && fs.existsSync(R(NHE)), 'có bản gốc và bản nhẹ');
assert.ok(size(NHE) < size(GOC) * 0.8 && size(NHE) > size(GOC) * 0.5, 'bản nhẹ nhỏ hơn bản gốc 20–50 %');
for (const f of [GOC, NHE]) { const b = fs.readFileSync(R(f)).subarray(0, 3).toString('latin1'); assert.equal(b, 'ID3', 'MP3 hợp lệ ' + f); }
global.window = {}; require(R('js/music-data.js'));
const g = window.BZ_MUSIC.groups.find(x => x[3].some(t => t[2] === ID));
assert.ok(g, 'có trong Kho Âm nhạc'); assert.match(g[0], /Fjord Moonlight/); assert.ok(fs.existsSync(R('assets/' + g[1])), 'ảnh bìa có thật');
for (const p of ['js/am-nhac-clay.js', 'js/thu-vien-clay.js']) assert.ok(read(p).includes("'" + ID + "'"), p + ': phát bản nhẹ');
assert.ok(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 926, 'sw.js ≥ v926');

(async () => {
  const b = await chromium.launch();
  try {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => localStorage.setItem('bizon-lang', 'vi'));
    const req = []; p.on('request', r => { if (r.url().includes(ID)) req.push(r.url()); });
    await p.goto(BASE + '/am-nhac.html', { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(800);
    assert.ok(await p.evaluate(() => document.body.innerText.includes('Fjord Moonlight')), 'trang Kho Âm nhạc hiện tên bài');
    assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= 390), 'không tràn ngang');
    assert.deepEqual(errs, [], 'không lỗi JS');
    console.log('nhac-fjord-moonlight: đạt');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
