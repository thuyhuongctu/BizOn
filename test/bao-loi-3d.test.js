/* Báo lỗi khi thư viện 3D hỏng (20/11/2026, đợt 1 sau rà soát game 3D trên điện thoại).
 * Trước đây: Bật Nghiệp 3D đứng mãi ở «Đang tải thư viện 3D…» khi three.js tự lưu trữ tải hỏng; Bến Phù Sa 3D và
 * Hộ Chiếu Thương Hiệu 3D để trống khung 3D, không một lời nào. Nay: báo ngay, có «Thử lại» và lối sang bản 2D.
 * Kiểm bằng cách chặn tệp three.module.js; và kiểm rằng khi mọi thứ tải bình thường thì không hiện thông báo. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
for (const [f, tag] of [['ben-phu-sa-3d.html', '<script src="js/bao-loi-3d.js" data-khung="bps3d" data-tep="js/bps3d.js" data-ban-2d="ben-phu-sa.html"></script>\n<script type="module" src="js/bps3d.js"></script>'],
  ['Ho Chieu Thuong Hieu 3D.html', '<script src="js/bao-loi-3d.js" data-khung="bp3d-stage" data-tep="bp3d.js" data-tren="72px" data-ban-2d="brand-passport.html"></script>\n<script type="module" src="bp3d.js"></script>'],
  ['Ho Chieu Mini 3D.html', '<script src="js/bao-loi-3d.js" data-khung="bp3d-stage" data-tep="bp3d.js" data-tren="72px" data-ban-2d="Ho%20Chieu%20Mini.dc.html"></script>\n<script type="module" src="bp3d.js"></script>']])
  assert.ok(R(f).includes(tag), f + ': gắn js/bao-loi-3d.js ngay trước module cảnh');
const bn = R('BizOn Game 3D.html');
assert.ok(bn.includes('id="bootRetry"') && bn.includes("t.tagName==='SCRIPT'&&t.type==='module'") && bn.includes("bar.style.width==='4%'"), 'Bật Nghiệp: bắt lỗi module, có Thử lại, có hạn chờ');
const sw = R('sw.js');
assert.ok(+(sw.match(/bizon-v(\d+)/) || [])[1] >= 918 && sw.includes("'./js/bao-loi-3d.js',"), 'sw.js ≥ bizon-v918 và lưu sẵn js/bao-loi-3d.js');

async function mo(b, url, chan, lang = 'vi') {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
  const p = await ctx.newPage();
  await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await p.route(/\.(mp3|m4a|mp4)(\?|$)/, r => r.abort());
  if (chan) await p.route(chan, r => r.abort());
  await p.goto(BASE + url, { waitUntil: 'load', timeout: 90000 });
  return { ctx, p };
}

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    // Bật Nghiệp 3D: màn chờ báo lỗi, hiện «Thử lại» và «bản 2D»
    { const { ctx, p } = await mo(b, '/BizOn%20Game%203D.html', '**/js/vendor/three.module.js');
      await p.waitForFunction(() => /Không tải được thư viện 3D/.test(document.getElementById('bootMsg').textContent), null, { timeout: 8000 });
      const r = await p.evaluate(() => { const v = id => { const e = document.getElementById(id), q = e.getBoundingClientRect(); return getComputedStyle(e).display !== 'none' && q.height > 0; };
        return { re: v('bootRetry'), lo: v('bootLow'), role: document.getElementById('bootMsg').getAttribute('role') }; });
      assert.deepEqual(r, { re: true, lo: true, role: 'alert' }, 'Bật Nghiệp: hiện Thử lại + bản 2D, đọc được bằng trình đọc màn hình');
      await ctx.close(); }
    // Bến Phù Sa 3D, Hộ Chiếu Thương Hiệu 3D, Hộ Chiếu Mini 3D: thông báo trong khung 3D
    for (const [url, chan, khung, ban2d, lang] of [
      ['/ben-phu-sa-3d.html', '**/vendor/three/three.module.js', 'bps3d', 'ben-phu-sa.html', 'vi'],
      ['/Ho%20Chieu%20Thuong%20Hieu%203D.html', '**/js/vendor/three.module.js', 'bp3d-stage', 'brand-passport.html', 'vi'],
      ['/Ho%20Chieu%20Thuong%20Hieu%203D.html', '**/js/vendor/three.module.js', 'bp3d-stage', 'brand-passport.html?lang=en', 'en'],
      ['/Ho%20Chieu%20Mini%203D.html', '**/js/vendor/three.module.js', 'bp3d-stage', 'Ho%20Chieu%20Mini.dc.html', 'vi']]) {
      const { ctx, p } = await mo(b, url, chan, lang);
      await p.waitForSelector('#' + khung + ' #bao-loi-3d', { state: 'attached', timeout: 8000 });
      // Bến Phù Sa: khung 3D chỉ hiện khi đang chơi (#ft-play) – thông báo nằm trong khung nên hiện cùng lúc vào ván
      await p.evaluate(() => { const f = document.getElementById('ft-play'); if (f) f.classList.remove('hidden'); });
      // Hộ Chiếu: khung 3D nằm sau thẻ đăng nhập; đã vào ván (ẩn thẻ) thì nút «Thử lại» phải bấm được, không bị bảng chơi che
      await p.evaluate(() => { const g = document.getElementById('g3d-gate'); if (g) g.style.display = 'none'; }); await p.waitForTimeout(300);
      assert.ok(await p.evaluate(() => { const d = document.getElementById('bao-loi-3d'), q = d.querySelector('button').getBoundingClientRect();
        return d.contains(document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2)); }), url + ': nút «Thử lại» không bị che');
      const r = await p.evaluate(() => { const d = document.getElementById('bao-loi-3d'), q = d.getBoundingClientRect();
        return { t: d.textContent, href: d.querySelector('a') && d.querySelector('a').getAttribute('href'), role: d.getAttribute('role'), h: q.height, btn: d.querySelector('button').getBoundingClientRect().height }; });
      assert.ok(lang === 'en' ? /Could not load the 3D scene/.test(r.t) && /Try again/.test(r.t) : /Không tải được cảnh 3D/.test(r.t) && /Thử lại/.test(r.t), url + ' ' + lang + ': lời báo đúng ngôn ngữ – ' + r.t);
      assert.equal(r.href, ban2d, url + ': lối sang bản 2D'); assert.equal(r.role, 'alert');
      assert.ok(r.h > 100 && r.btn >= 44, url + ': thông báo hiện, nút ≥ 44 px');
      await ctx.close();
    }
    // Tải bình thường: không có thông báo
    for (const [url, khung] of [['/ben-phu-sa-3d.html', 'bps3d'], ['/Ho%20Chieu%20Thuong%20Hieu%203D.html', 'bp3d-stage']]) {
      const { ctx, p } = await mo(b, url, null);
      await p.waitForSelector('#' + khung + ' canvas', { state: 'attached', timeout: 60000 }); await p.waitForTimeout(1500);
      assert.equal(await p.locator('#bao-loi-3d').count(), 0, url + ': tải bình thường thì không báo lỗi');
      await ctx.close();
    }
    console.log('bao-loi-3d: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
