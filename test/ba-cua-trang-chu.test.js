/* Đặc tả 006, câu chuyện 1 (19/11/2026): góp ý của thầy Tú sau buổi UMK – «quá nhiều thông tin nên không biết vào đâu».
 * Màn đầu trang chủ có ba cửa «Tôi là sinh viên / Tôi là giảng viên / Tôi muốn xem thử», nằm trọn trong màn ở 360, 390
 * và 1280 px, VI và EN. Cửa Sinh viên tới trang mới vao-lop.html (bốn thẻ game, ô mã lớp gắn ?lop= vào liên kết);
 * cửa Giảng viên tới trang hướng dẫn, kèm lối lớp demo; cửa Khách tới Bến Phù Sa, kèm video Bật Nghiệp. */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const VI = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;
const NAMES = /Bến Phù Sa|Bật Nghiệp|Hộ Chiếu Sầu Riêng|Hộ Chiếu Thương Hiệu|Cần Thơ/g;

// Tĩnh: trùng byte, trang mới có canonical, có trong sitemap và sw.js
assert.ok(fs.readFileSync(R('index.html')).equals(fs.readFileSync(R('academia3d-v2.html'))), 'index.html trùng byte academia3d-v2.html');
const sw = read('sw.js');
assert.ok(+(sw.match(/bizon-v(\d+)/) || [])[1] >= 903, 'sw.js ≥ v903');
assert.match(sw, /'\.\/vao-lop\.html'/, 'sw.js lưu sẵn vao-lop.html');
assert.match(read('sitemap.xml'), /bizonland\.com\/vao-lop\.html/, 'sitemap.xml có vao-lop.html');
assert.match(read('vao-lop.html'), /<link rel="canonical" href="https:\/\/bizonland\.com\/vao-lop\.html">/, 'vao-lop.html có canonical');
assert.ok(fs.existsSync(R('docs/thu-nghiem/thu-5-phut.md')), 'có phiếu thử 5 phút');
assert.doesNotMatch(read('docs/thu-nghiem/thu-5-phut.md'), /@[a-z0-9-]+\.[a-z]/i, 'phiếu thử không chứa email');

function lum(c) {
  const m = c.match(/[\d.]+/g).map(Number);
  const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]);
}
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

async function open(b, url, w, h, opt = {}) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p._errs = []; p.on('pageerror', e => p._errs.push(e.message));
  await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await p.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
  if (opt.en) await p.addInitScript(() => localStorage.setItem('bizon-lang', 'en'));
  if (opt.dark) await p.addInitScript(() => localStorage.setItem('bizon-theme', 'dark'));
  await p.goto(BASE + url, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(700);
  return p;
}

(async () => {
  const b = await chromium.launch();
  try {
    // 1. Ba cửa nằm trọn trong màn đầu, đủ lớn, đọc được, đúng đích
    for (const [w, h] of [[360, 740], [390, 844], [1280, 800]]) for (const en of [false, true]) for (const dark of (w === 390 ? [false, true] : [false])) {
      const tag = w + (en ? ' EN' : ' VI') + (dark ? ' tối' : '');
      const p = await open(b, '/index.html' + (en ? '?lang=en' : ''), w, h, { en, dark });
      const doors = await p.evaluate(() => [...document.querySelectorAll('#ba-cua a.hp-door')].map(a => {
        const r = a.getBoundingClientRect(), cs = getComputedStyle(a), t = a.querySelector('.hp-door-t'), d = a.querySelector('.hp-door-d');
        return { k: a.dataset.door, href: a.getAttribute('href'), top: r.top, bottom: r.bottom, h: r.height, bg: cs.backgroundColor,
          tc: getComputedStyle(t).color, dc: getComputedStyle(d).color, text: a.innerText.trim() };
      }));
      assert.deepEqual(doors.map(d => d.k), ['sinh-vien', 'giang-vien', 'khach'], tag + ': đủ ba cửa theo thứ tự');
      for (const d of doors) {
        assert.ok(d.top >= 0 && d.bottom <= h, tag + ': cửa ' + d.k + ' nằm trọn trong màn đầu (' + Math.round(d.top) + '–' + Math.round(d.bottom) + ' / ' + h + ')');
        assert.ok(d.h >= 44, tag + ': cửa ' + d.k + ' cao ≥ 44 px');
        assert.ok(!/rgba\(0, 0, 0, 0\)|transparent/.test(d.bg), tag + ': cửa ' + d.k + ' có nền đặc');
        assert.ok(ratio(d.tc, d.bg) >= 4.5, tag + ': tiêu đề cửa ' + d.k + ' tương phản ≥ 4,5 (' + ratio(d.tc, d.bg).toFixed(2) + ')');
        assert.ok(ratio(d.dc, d.bg) >= 4.5, tag + ': mô tả cửa ' + d.k + ' tương phản ≥ 4,5 (' + ratio(d.dc, d.bg).toFixed(2) + ')');
        if (en) assert.ok(!VI.test(d.text.replace(NAMES, '')), tag + ': cửa ' + d.k + ' bằng tiếng Anh: ' + d.text);
      }
      assert.deepEqual(doors.map(d => d.href), ['vao-lop.html', 'truong-giang-vien.html', 'ben-phu-sa.html'], tag + ': đích ba cửa');
      const extra = await p.evaluate(() => ({
        demo: (document.querySelector('#ba-cua [data-door-extra="giang-vien"]') || {}).getAttribute?.('href'),
        video: (document.querySelector('#ba-cua [data-door-extra="khach"]') || {}).dataset?.trailer
      }));
      assert.equal(extra.demo, 'man-hinh-lop-hoc.html?demo=1', tag + ': lối lớp demo cho giảng viên');
      assert.match(extra.video || '', /^assets\/video\/.+\.mp4$/, tag + ': video Bật Nghiệp cho khách');
      assert.ok(fs.existsSync(R(extra.video)), tag + ': tệp video có thật');
      const sw2 = await p.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(sw2 <= w, tag + ': không tràn ngang (' + sw2 + ')');
      assert.deepEqual(p._errs, [], tag + ': không lỗi JS');
      await p.close();
    }

    // 2. Tắt JavaScript: ba cửa vẫn là liên kết thường
    const ctx = await b.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const pn = await ctx.newPage(); await pn.goto(BASE + '/index.html', { waitUntil: 'load' });
    assert.deepEqual(await pn.$$eval('#ba-cua a.hp-door', as => as.map(a => a.getAttribute('href'))), ['vao-lop.html', 'truong-giang-vien.html', 'ben-phu-sa.html'], 'không JS: ba cửa vẫn là liên kết');
    await ctx.close();

    // 3. vao-lop.html: bốn thẻ game, mã lớp gắn vào liên kết (chữ hoa, bỏ khoảng trắng)
    const GAMES = { 'ben-phu-sa': 'ben-phu-sa.html', 'bat-nghiep': 'BizOn Game 3D.html', 'hcth': 'brand-passport.html', 'hcsr': 'lab/ho-chieu-sau-rieng-v2.html' };
    for (const [w, en] of [[360, false], [390, true], [1280, false]]) {
      const tag = 'vao-lop ' + w + (en ? ' EN' : ' VI');
      const p = await open(b, '/vao-lop.html' + (en ? '?lang=en' : ''), w, 800, { en });
      const hrefs = () => p.$$eval('a[data-game]', as => Object.fromEntries(as.map(a => [a.dataset.game, decodeURI(a.getAttribute('href'))])));
      assert.deepEqual(await hrefs(), GAMES, tag + ': bốn thẻ game, đúng đường dẫn');
      await p.fill('#ma-lop', ' umk 2026 ');
      const withCode = await hrefs();
      for (const k in GAMES) assert.equal(withCode[k], GAMES[k] + '?lop=UMK2026', tag + ': ' + k + ' mang mã lớp');
      await p.fill('#ma-lop', '');
      assert.deepEqual(await hrefs(), GAMES, tag + ': xóa mã thì liên kết trở lại như cũ');
      assert.ok(await p.$('a[data-choi-thu]'), tag + ': có lối «Chưa có mã lớp? Chơi thử»');
      if (en) {
        const vis = await p.evaluate(() => { const o = [], tw = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT); while (tw.nextNode()) { const t = tw.currentNode.textContent.trim(), el = tw.currentNode.parentElement; if (t && el.offsetParent !== null) o.push(t); } return o; });
        const vi = vis.filter(t => VI.test(t.replace(NAMES, '')));
        assert.deepEqual(vi, [], tag + ': không còn chữ Việt ngoài tên riêng');
      }
      const sw3 = await p.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(sw3 <= w, tag + ': không tràn ngang (' + sw3 + ')');
      assert.deepEqual(p._errs, [], tag + ': không lỗi JS');
      await p.close();
    }
    console.log('ba-cua-trang-chu: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
