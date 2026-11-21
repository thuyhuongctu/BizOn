/* 21/11/2026 – rà dịch thuật đợt 2 (mở trang bằng tiếng Việt rồi bấm EN, đúng thao tác của chị):
 * - cổng vào game Bến Phù Sa / Hộ Chiếu Thương Hiệu (js/game3d-login-gate.js) và khung đăng nhập sinh viên
 *   (js/student-login.js) vẽ lại theo ngôn ngữ mới, giữ chữ đã gõ;
 * - bảng tiện ích ⋯ (js/site-dock.js): gợi ý các nút có bản EN;
 * - bizon-clay-i18n.js đổi được alt (data-en-alt) và title (data-en-title); ảnh nhân vật ở trang Văn phòng dùng data-en-alt;
 * - nhãn menu ở trang x-dc theo ngôn ngữ ({{ t.ariaNav }}). */
'use strict';
const assert = require('assert'), fs = require('fs'), path = require('path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 944, 'sw.js ≥ v944');
const i18n = read('js/bizon-clay-i18n.js');
assert.ok(i18n.includes("swapAttr(el, 'alt', 'viAlt'") && i18n.includes("swapAttr(el, 'title', 'viTitle'"), 'i18n đổi alt và title');
for (const f of ['hinh-dung.html', 'huong-dan-cai-dat.html', 'huong-dan.html', 'lumina.html', 'thu-vien-clip.html']) {
  const s = read(f);
  assert.ok(s.includes('aria-label="{{ t.ariaNav }}"') && s.includes("ariaNav:'Main menu'") && !s.includes('aria-label="Menu chính"'), f + ': nhãn menu theo ngôn ngữ');
}
for (const f of ['van-phong-doi.html', 'van-phong-hc-thuong-hieu.html', 'van-phong-hc-sau-rieng.html', 'van-phong-ben-phu-sa.html'])
  assert.ok(!/<img\b[^>]*\balt="[^"]*"[^>]*\bdata-en-aria=/.test(read(f)), f + ': ảnh dùng data-en-alt, không dùng data-en-aria');

const VI = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;
async function page(b, url, w) {
  const ctx = await b.newContext({ viewport: { width: w || 390, height: 844 }, serviceWorkers: 'block' });
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await p.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
  await p.addInitScript(() => localStorage.setItem('bizon-lang', 'vi'));
  await p.goto(BASE + url, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(900);
  return { ctx, p, errs };
}
const toEn = async p => { await p.evaluate(() => window.clayApplyLang('en')); await p.waitForTimeout(500); };

(async () => {
  const b = await chromium.launch();
  try {
    // 1. Cổng vào game: đổi EN khi đang mở cổng
    for (const url of ['/ben-phu-sa.html', '/brand-passport.html']) {
      const { ctx, p, errs } = await page(b, url);
      await p.waitForSelector('#g3d-gate #g3d-team', { timeout: 15000 });
      assert.match(await p.$eval('#g3d-gate', e => e.innerText), /Mã lớp học/, url + ': cổng tiếng Việt lúc đầu');
      await p.fill('#g3d-team', 'Rồng Xanh'); await p.fill('#g3d-class', 'QTKD-1');
      await toEn(p);
      const t = await p.$eval('#g3d-gate', e => e.innerText);
      assert.ok(/Class code/.test(t) && /Quick play/.test(t) && !/Mã lớp học|Chơi thử nhanh/.test(t), url + ': cổng đổi sang tiếng Anh');
      assert.equal(await p.inputValue('#g3d-team'), 'Rồng Xanh', url + ': giữ tên đội đã gõ');
      assert.equal(await p.inputValue('#g3d-class'), 'QTKD-1', url + ': giữ mã lớp đã gõ');
      await p.click('#g3d-go'); await p.waitForTimeout(300);
      assert.equal(await p.$('#g3d-gate'), null, url + ': nút Bắt đầu vẫn chạy sau khi vẽ lại');
      // 2. Alt và title đổi theo ngôn ngữ
      const alts = await p.$$eval('img[data-en-alt]', a => a.map(x => x.alt === x.dataset.enAlt));
      assert.ok(alts.length && alts.every(Boolean), url + ': alt ảnh đã sang tiếng Anh');
      assert.deepEqual(errs, [], url + ': không lỗi JS');
      await ctx.close();
    }
    // 3. Bảng tiện ích ⋯ (trang có dock)
    {
      const { ctx, p, errs } = await page(b, '/brand-passport-learning.html');
      assert.equal(await p.$eval('#bz-next', e => e.title), 'Bài kế tiếp', 'dock: VI');
      await toEn(p);
      const t = await p.$$eval('#bz-dock [title]', a => a.map(x => x.title));
      assert.ok(t.includes('Next track') && t.includes('Copy this page’s link') && t.every(x => !VI.test(x)), 'dock: gợi ý các nút bằng tiếng Anh: ' + t.join(' | '));
      assert.deepEqual(errs, [], 'dock: không lỗi JS');
      await ctx.close();
    }
    // 4. Ảnh nhân vật, nút MV, ô tìm kiếm: alt/aria đổi sang EN
    for (const [url, sel] of [['/van-phong-doi.html', 'img[data-en-alt]'], ['/am-nhac.html', 'button[data-yt]'], ['/universe.html', 'img[data-en-alt]'], ['/thu-vien.html', '#lib-q']]) {
      const { ctx, p, errs } = await page(b, url, 1280);
      await toEn(p);
      const bad = await p.$$eval(sel, a => a.filter(x => (x.dataset.enAlt != null && x.alt !== x.dataset.enAlt) || (x.dataset.enAria != null && x.getAttribute('aria-label') !== x.dataset.enAria))
        .map(x => x.alt || x.getAttribute('aria-label')));
      assert.ok(await p.$$eval(sel, a => a.length > 0 && a.every(x => x.dataset.enAlt != null || x.dataset.enAria != null)), url + ': mọi phần tử đều có bản EN');
      assert.deepEqual(bad, [], url + ': alt/aria chưa đổi sang tiếng Anh');
      await p.evaluate(() => window.clayApplyLang('vi')); await p.waitForTimeout(300);
      assert.ok(await p.$$eval(sel, a => a.some(x => /[ạảấầậắằặẹẻếềệịọỏốồộớờợụủứừựỳỵ]/.test(x.getAttribute('alt') || x.getAttribute('aria-label') || ''))), url + ': về VI thì ra lại chữ gốc');
      assert.deepEqual(errs, [], url + ': không lỗi JS');
      await ctx.close();
    }
    // 5. Trang x-dc: nhãn menu
    for (const lang of ['en', 'vi']) {
      const ctx = await b.newContext({ viewport: { width: 1280, height: 844 }, serviceWorkers: 'block' });
      const p = await ctx.newPage();
      await p.addInitScript(l => localStorage.setItem('bizon-lang', l), lang);
      await p.goto(BASE + '/hinh-dung.html', { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(1200);
      const navs = await p.$$eval('nav[aria-label]', a => a.map(x => x.getAttribute('aria-label')));
      assert.ok(navs.includes(lang === 'en' ? 'Main menu' : 'Menu chính') && navs.every(x => !x.includes('{{')), 'hinh-dung ' + lang + ': ' + navs.join(' | '));
      await ctx.close();
    }
    console.log('dich-en-dot-2: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
