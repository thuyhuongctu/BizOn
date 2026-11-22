// Video «Đường ngắn nhất đi qua Singapore» – bước 2 (21/11/2026): giọng đọc VI/EN (13 câu mỗi thứ tiếng), hai bản video
// 1080p + 720p, ảnh bìa, phụ đề VI/EN theo mốc câu, ghi nguồn gốc ở THIRD-PARTY-NOTICES mục 7, và trang Hướng dẫn phát đúng
// bản theo ngôn ngữ trong ô «🚢 Cảng Cái Mép».
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const ROOT = path.join(__dirname, '..'), R = f => path.join(ROOT, f), size = f => fs.statSync(R(f)).size, read = f => fs.readFileSync(R(f), 'utf8');

for (const l of ['vi', 'en']) {
  const n = `cang-cai-mep-${l}`;
  for (const f of [`${n}.mp4`, `${n}-720p.mp4`]) {
    const head = fs.readFileSync(R('assets/video/' + f)).subarray(0, 64 * 1024).toString('latin1');
    assert.ok(head.includes('moov') && head.includes('avc1') && head.includes('mp4a'), f + ': H.264 + AAC, faststart');
  }
  assert.ok(size(`assets/video/${n}-720p.mp4`) < size(`assets/video/${n}.mp4`) * 0.7, n + ': bản 720p nhẹ hơn nhiều');
  assert.ok(size(`assets/video/${n}.mp4`) < 25e6, n + ': bản 1080p dưới 25 MB');
  assert.ok(size(`assets/video/${n}-poster.webp`) < size(`assets/video/${n}-poster.jpg`), n + ': poster WebP nhỏ hơn JPG');
  for (const s of ['vi', 'en']) {
    const v = read(`assets/video/subs/${n}.${s}.vtt`);
    assert.ok(v.startsWith('WEBVTT') && (v.match(/-->/g) || []).length === 13, `${n}.${s}.vtt: đủ 13 câu`);
  }
  const src = fs.readdirSync(R(`assets/video/src/cang-cai-mep/${l}`)).filter(f => /^\d\d\.mp3$/.test(f));
  assert.equal(src.length, 13, 'giọng nguồn ' + l + ' đủ 13 câu');
}
assert.ok(read('assets/video/subs/cang-cai-mep-vi.vi.vtt').includes('Còn khi cảng tắc, đường nào ngắn nhất, là đội bạn chọn.'), 'phụ đề VI có câu kết');
assert.ok(read('assets/video/subs/cang-cai-mep-en.en.vtt').includes('which way is shortest is for your team to choose.'), 'phụ đề EN có câu kết');
assert.ok(read('THIRD-PARTY-NOTICES.md').includes('`assets/video/cang-cai-mep-*`') && /HeyGen Voice 1 Turbo/.test(read('THIRD-PARTY-NOTICES.md')), 'ghi nguồn gốc ở mục 7');
assert.ok(fs.existsSync(R('scripts/video/cat-giong-theo-cau.py')), 'có script cắt giọng theo câu');
const hd = read('huong-dan.html');
// 22/11/2026: ảnh bìa đổi sang sa bàn cảng (cang-cai-mep-poster-v2), dùng chung cho hai bản
for (const l of ['vi', 'en']) for (const f of [`assets/video/cang-cai-mep-${l}-720p.mp4`, 'assets/video/cang-cai-mep-poster-v2.webp', `assets/video/subs/cang-cai-mep-${l}.${l}.vtt`])
  assert.ok(hd.includes(`'${f}'`) && fs.existsSync(R(f)), 'trang Hướng dẫn trỏ tới tệp có thật: ' + f);
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 951, 'sw.js ≥ v951');
assert.ok(size('assets/video/cang-cai-mep-poster-v2.webp') < size('assets/video/cang-cai-mep-poster-v2.jpg'), 'poster v2: WebP nhỏ hơn JPG');

(async () => {
  const b = await chromium.launch();
  try {
    for (const [lang, w] of [['vi', 360], ['en', 390], ['vi', 1280]]) {
      const p = await b.newPage({ viewport: { width: w, height: 800 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
      await p.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await p.goto(BASE + '/huong-dan.html?lang=' + lang, { waitUntil: 'load', timeout: 60000 });
      await p.waitForFunction(() => { const s = document.querySelector('#cang-cai-mep-video source'); return s && !/\{\{/.test(s.getAttribute('src') || '{{'); }, null, { timeout: 15000 });
      const r = await p.evaluate(() => { const v = document.getElementById('cang-cai-mep-video'), rv = v.getBoundingClientRect();
        return { src: v.querySelector('source').getAttribute('src'), poster: v.getAttribute('poster'), track: v.querySelector('track').getAttribute('src'),
          srclang: v.querySelector('track').getAttribute('srclang'), label: v.getAttribute('aria-label'), inBox: !!v.closest('#cang-cai-mep-moi'),
          fits: rv.right <= innerWidth + 1 && rv.width > 200, over: document.documentElement.scrollWidth - innerWidth }; });
      const tag = lang + ' ' + w;
      assert.equal(r.src, `assets/video/cang-cai-mep-${lang}-720p.mp4`, tag + ': phát đúng bản theo ngôn ngữ');
      assert.equal(r.poster, 'assets/video/cang-cai-mep-poster-v2.webp', tag + ': ảnh bìa là sa bàn cảng');
      assert.equal(r.track, `assets/video/subs/cang-cai-mep-${lang}.${lang}.vtt`, tag + ': phụ đề đúng bản');
      assert.equal(r.srclang, lang, tag + ': srclang');
      assert.ok(r.inBox && r.fits && r.over <= 0, tag + ': video nằm trong ô cảng, vừa khung, không tràn ngang');
      assert.ok(lang === 'en' ? /Short video/.test(r.label) : /Video ngắn/.test(r.label), tag + ': nhãn video đúng ngôn ngữ');
      assert.deepEqual(errs, [], tag + ': không lỗi JS');
      await p.close();
    }
    console.log('video-cang-cai-mep-thanh-pham: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
