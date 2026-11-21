// 20/11/2026 tối: bài hát tri ân «BizOnland · The Northern Shield» (4:23) thay MV «Ngọn hải đăng soi đường» trên trang 20/11
// và có trong Kho Âm nhạc. Bản gốc 192 kbps để tải về, bản nghe trên web nén 128 kbps (-v2). Link YouTube chị gửi sau.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8'), size = f => fs.statSync(R(f)).size;
const ID = 'bizonland-the-northern-shield', GOC = 'assets/audio/' + ID + '.mp3', NHE = 'assets/audio/' + ID + '-v2.mp3';
assert.ok(fs.existsSync(R(GOC)) && fs.existsSync(R(NHE)), 'có bản gốc và bản nhẹ');
assert.ok(size(NHE) < size(GOC) * 0.8 && size(NHE) > size(GOC) * 0.5, 'bản nhẹ nhỏ hơn bản gốc 20–50 %');
for (const f of [GOC, NHE]) assert.equal(fs.readFileSync(R(f)).subarray(0, 3).toString('latin1'), 'ID3', 'MP3 hợp lệ ' + f);
global.window = {}; require(R('js/music-data.js'));
const g = window.BZ_MUSIC.groups.find(x => x[3].some(t => t[2] === ID));
assert.ok(g && /The Northern Shield/.test(g[0]) && fs.existsSync(R('assets/' + g[1])), 'có trong Kho Âm nhạc, ảnh bìa có thật');
for (const p of ['js/am-nhac-clay.js', 'js/thu-vien-clay.js']) assert.ok(read(p).includes("'" + ID + "'"), p + ': phát bản nhẹ');
const le = read('ngay-nha-giao-20-11.html');
assert.ok(le.includes('<audio controls preload="none" src="' + NHE + '"'), 'trang 20/11 phát bản nhẹ, chỉ tải khi bấm');
assert.ok(le.includes('<a class="clay-link" href="#bai-tri-an">') && le.includes('id="bai-tri-an"'), 'nút đầu trang dẫn tới bài hát');
assert.ok(le.includes('Kính dâng Người... ngọn hải đăng soi đường.') && le.includes('BIZON VƯƠN XA'), 'có lời bài hát');
assert.ok(!/\[(Intro|Verse|Chorus|Bridge|Outro)/.test(le), 'lời không lẫn chỉ dẫn phối khí');
assert.ok(!/sDI4m87s8Ss|hGpwZgAsx2I|id="hai-dang"|href="#hai-dang"/.test(le), 'không còn hai bản MV cũ đã gỡ');
assert.ok(le.includes('data-yt="8yottDb7Bg0"') && le.includes('<script src="js/am-mv.js" defer></script>') && le.includes('href="https://youtu.be/8yottDb7Bg0"'), 'có MV YouTube 8yottDb7Bg0 (21/11/2026), chỉ tải khi bấm');
assert.ok(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 936, 'sw.js ≥ v936');

(async () => {
  const b = await chromium.launch();
  try {
    for (const [w, lang] of [[360, 'vi'], [390, 'en'], [1280, 'vi']]) {
      const p = await b.newPage({ viewport: { width: w, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.route(/\.(mp3|mp4)(\?|$)/, r => r.abort());
      await p.addInitScript(l => localStorage.setItem('bizon-lang', l), lang);
      await p.goto(BASE + '/ngay-nha-giao-20-11.html?lang=' + lang, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(500);
      const tag = w + ' ' + lang;
      const st = await p.evaluate(() => { const s = document.getElementById('bai-tri-an'), a = s.querySelector('audio'), d = s.querySelector('details');
        return { h: a.getBoundingClientRect().height, img: !!s.querySelector('.le-mv button[data-yt]'), open: d.open, sum: d.querySelector('summary').textContent.trim(), sw: document.documentElement.scrollWidth }; });
      assert.ok(st.h > 20, tag + ': trình phát hiện ra');
      assert.ok(st.img, tag + ': có nút phát MV');
      assert.equal(st.open, false, tag + ': lời bài hát gập sẵn');
      assert.equal(st.sum, lang === 'en' ? 'Lyrics (Vietnamese)' : 'Lời bài hát', tag + ': nhãn lời bài hát');
      assert.ok(st.sw <= w, tag + ': không tràn ngang');
      await p.click('.le-nghe a'); await p.waitForTimeout(800);
      assert.ok(await p.evaluate(() => { const r = document.getElementById('bai-tri-an').getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }), tag + ': bấm nút đầu trang thì cuộn tới bài hát');
      assert.deepEqual(errs, [], tag + ': không lỗi JS');
      await p.close();
    }
    const p = await b.newPage({ viewport: { width: 390, height: 844 } });
    await p.addInitScript(() => localStorage.setItem('bizon-lang', 'vi'));
    await p.goto(BASE + '/am-nhac.html', { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(800);
    assert.ok(await p.evaluate(() => document.body.innerText.includes('The Northern Shield')), 'Kho Âm nhạc hiện tên bài');
    console.log('bai-tri-an-northern-shield: đạt');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
