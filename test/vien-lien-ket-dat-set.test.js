/* Viên liên kết đất sét .clay-link (20/11/2026, chị góp ý các dòng liên kết trơn «▶ …», «… →» trông xấu, «chỉnh cho các nội
 * dung tương tự»): Âm nhạc (4), Đội ngũ (1), Hộ Chiếu Sầu Riêng (2), Giảng viên (1). Kiểm ở 360 và 1280 px, VI/EN, sáng/tối:
 * đủ số viên, có nền, cao ≥ 44 px, không gạch chân, chữ không tràn khỏi viên, đã dịch, trang không tràn ngang, không lỗi JS;
 * nhãn nhỏ .clay-chip cũ (universe, tuyển dụng, giảng viên) không bị đổi. */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 930, 'sw.js ≥ v930');
const css = read('css/bizon-clay.css');
assert.match(css, /\.clay-link,body\.clay a\.clay-link\{/, 'css có .clay-link');
assert.match(css, /\.clay-chip\{display:inline-flex;padding:3px 10px/, 'nhãn nhỏ .clay-chip giữ nguyên');
assert.match(read('giang-vien.html'), /<span class="clay-chip"[^>]*>Ứng dụng chính/, 'nhãn «Ứng dụng chính» vẫn là .clay-chip');
const PAGES = { 'am-nhac.html': 4, 'doi-ngu.html': 1, 'ho-chieu-sau-rieng.html': 2, 'giang-vien.html': 1 };
for (const f of Object.keys(PAGES)) assert.ok(!/>▶ (Nghe|Chơi)|Giảng viên đăng nhập →<|kịch bản lớp học →<|chỉ báo 2030 →</.test(read(f)), f + ': không còn dòng liên kết trơn cũ');

(async () => {
  const b = await chromium.launch();
  try {
    for (const [f, n] of Object.entries(PAGES)) for (const w of [360, 1280]) for (const lang of ['vi', 'en']) for (const theme of ['light', 'dark']) {
      const p = await b.newPage({ viewport: { width: w, height: 844 }, colorScheme: theme }), errs = [];
      p.on('pageerror', e => errs.push(e.message));
      await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
      await p.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await p.addInitScript(([l, t]) => { localStorage.setItem('bizon-lang', l); localStorage.setItem('bizon-theme', t); }, [lang, theme]);
      await p.goto(BASE + '/' + f + '?lang=' + lang, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(500);
      const tag = f + ' ' + w + ' ' + lang + ' ' + theme;
      const links = await p.$$eval('a.clay-link', as => as.map(a => {
        const r = a.getBoundingClientRect(), cs = getComputedStyle(a), t = a.querySelector('span:last-child').getBoundingClientRect();
        return { h: r.height, line: cs.textDecorationLine, bg: cs.backgroundColor, over: t.right > r.right + 1, text: a.textContent.trim() };
      }));
      assert.equal(links.length, n, tag + ': đủ ' + n + ' viên');
      for (const l of links) {
        assert.ok(l.h >= 44, tag + ': cao ≥ 44 px: ' + l.text);
        assert.ok(!/underline/.test(l.line), tag + ': không gạch chân: ' + l.text);
        assert.ok(!/rgba\(0, 0, 0, 0\)/.test(l.bg), tag + ': có nền: ' + l.text);
        assert.ok(!l.over, tag + ': chữ không tràn: ' + l.text);
        assert.ok(!/→/.test(l.text), tag + ': không còn «→»: ' + l.text);
        if (lang === 'en') assert.ok(!/Nghe|Chơi|Đọc|Hành trình|Giảng viên/.test(l.text), tag + ': đã dịch: ' + l.text);
      }
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth) <= w, tag + ': không tràn ngang');
      assert.deepEqual(errs, [], tag + ': không lỗi JS');
      await p.close();
    }
    console.log('vien-lien-ket-dat-set: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
