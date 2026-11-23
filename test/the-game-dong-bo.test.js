// 23/11/2026: chị chụp màn hình trang chủ trên điện thoại – bốn thẻ game hiển thị không đồng bộ: Bật Nghiệp không có
// «Kịch bản lớp học», Hộ Chiếu Sầu Riêng để kịch bản lớp học lẫn trong «Bản khác», nhãn của Bật Nghiệp dài nên xuống hai dòng.
// Nay bốn thẻ cùng một khuôn: nút «Chơi bản 3D» → hàng «Bản khác» (chỉ các phiên bản) → hàng «Cho lớp học»
// (Kịch bản lớp học + Văn phòng đội); mỗi thẻ hai nhãn ngắn, nằm trên một dòng ở 390 px.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const home = read('index.html');
assert.equal(home, read('academia3d-v2.html'), 'index.html giống hệt academia3d-v2.html');
const the = home.match(/<li class="hp-game( lv\d)?">[\s\S]*?<\/li>\n/g) || [];
assert.equal(the.length, 4, 'trang chủ có 4 thẻ game');
for (const t of the) {
  const ten = (t.match(/<h3[^>]*>([^<]+)/) || [])[1];
  const ban = (t.match(/<div class="hp-alt">([\s\S]*?)<\/div>/) || [])[1] || '';
  const lop = (t.match(/<div class="hp-alt hp-lop">([\s\S]*?)<\/div>/) || [])[1] || '';
  assert.ok(/Bản khác:/.test(ban) && !/lop-hoc\.html|van-phong/.test(ban), ten + ': hàng «Bản khác» chỉ có các phiên bản');
  assert.ok(/Cho lớp học:/.test(lop) && lop.includes('href="lop-hoc.html"') && /Kịch bản lớp học/.test(lop) && /href="van-phong[^"]*\.html"/.test(lop), ten + ': hàng «Cho lớp học» có kịch bản lớp học và văn phòng đội');
  const nhan = [...t.matchAll(/<ul class="hp-game-meta">([\s\S]*?)<\/ul>/g)].map(m => [...m[1].matchAll(/<li[^>]*>([^<]+)/g)].map(x => x[1]))[0] || [];
  assert.equal(nhan.length, 2, ten + ': hai nhãn');
  assert.ok(nhan.every(x => x.length <= 22), ten + ': nhãn ngắn (' + nhan.join(' · ') + ')');
}
assert.ok(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 962, 'sw.js ≥ v962');

(async () => {
  const b = await chromium.launch();
  try {
    for (const [w, lang, theme] of [[390, 'vi', 'dark'], [360, 'en', 'light'], [1280, 'vi', 'dark']]) {
      const tag = w + ' ' + lang + ' ' + theme;
      const p = await b.newPage({ viewport: { width: w, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.route(/\.(mp3|mp4)(\?|$)/, r => r.abort());
      await p.addInitScript(([l, t]) => { try { localStorage.setItem('bizon-lang', l); localStorage.setItem('bizon-theme', t); } catch (e) {} }, [lang, theme]);
      await p.goto(BASE + '/index.html?lang=' + lang, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(500);
      await p.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
      const r = await p.evaluate(() => [...document.querySelectorAll('.hp-game')].map(li => {
        const tops = [...li.querySelectorAll('.hp-game-meta li')].map(x => Math.round(x.getBoundingClientRect().top));
        const play = li.querySelector('.hp-play'), lop = li.querySelector('.hp-lop'), ban = li.querySelector('.hp-alt:not(.hp-lop)');
        return { ten: li.querySelector('h3').textContent, motDong: new Set(tops).size === 1, mau: getComputedStyle(play).color,
          duoi: lop.getBoundingClientRect().top >= ban.getBoundingClientRect().bottom - 1, lopChu: lop.innerText };
      }));
      assert.equal(r.length, 4, tag + ': 4 thẻ');
      for (const x of r) {
        assert.ok(x.motDong, tag + ' ' + x.ten + ': hai nhãn trên một dòng');
        assert.ok(x.duoi, tag + ' ' + x.ten + ': hàng «Cho lớp học» nằm dưới hàng «Bản khác»');
        assert.match(x.lopChu, lang === 'en' ? /For class:[\s\S]*Classroom playbook[\s\S]*Team office/ : /Cho lớp học:[\s\S]*Kịch bản lớp học[\s\S]*Văn phòng đội/, tag + ' ' + x.ten + ': chữ đúng ngôn ngữ');
      }
      assert.equal(new Set(r.map(x => x.mau)).size, 1, tag + ': nút «Chơi bản 3D» cùng màu chữ ở cả 4 thẻ');
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth) <= w, tag + ': không tràn ngang');
      assert.deepEqual(errs, [], tag + ': không lỗi JS');
      await p.close();
    }
    console.log('the-game-dong-bo: đạt');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
