/* 21/11/2026, chị chụp trang chủ ở chế độ EN: dòng «20/11 Tri ân thầy cô…» và tin «160 sinh viên UM Kendari…» vẫn là tiếng Việt.
 * Nguyên nhân: js/bizon-clay-nav.js thay dấu «→» bằng viên đất sét .clay-go chèn vào TRONG phần tử có data-en, rồi
 * js/bizon-clay-i18n.js thấy phần tử có con nên bỏ qua, không đổi chữ. Nay i18n coi .clay-go là trang trí: đổi chữ được,
 * viên mũi tên tự gắn lại; đổi về VI vẫn ra chữ gốc. Test này kiểm mọi phần tử data-en (con chỉ là .clay-go) đều hiện đúng
 * chữ của ngôn ngữ đang chọn trên các trang chính, và dòng bản quyền ở chân các trang x-dc có bản EN («Assoc. Prof.»). */
'use strict';
const assert = require('assert'), fs = require('fs'), path = require('path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 943, 'sw.js ≥ v943');
const X_DC = ['hinh-dung.html', 'lumina.html', 'huong-dan.html', 'thu-vien-clip.html', 'hau-truong.html', 'du-an.html', 'vietlens/gioi-thieu.html'];
for (const f of X_DC) {
  const s = read(f);
  assert.ok(s.includes('<div>{{ t.copy }}</div>') && s.includes('Assoc. Prof. Phan Anh Tú – BizOn Bật Nghiệp') && s.includes('PGS.TS. Phan Anh Tú – BizOn Bật Nghiệp'), f + ': dòng bản quyền có VI và EN');
}
const norm = s => (s || '').replace(/→/g, '').replace(/\s+/g, ' ').trim();
// Phần tử data-en không hiện đúng chữ của ngôn ngữ đang chọn (bỏ qua phần tử có con thật, đúng quy ước của i18n)
const wrong = (p, lang) => p.evaluate(lang => {
  const n = s => (s || '').replace(/→/g, '').replace(/\s+/g, ' ').trim();
  return [...document.querySelectorAll('[data-en]')].filter(e => [...e.children].every(c => c.classList.contains('clay-go')))
    .filter(e => n(e.textContent) !== n(lang === 'en' ? e.dataset.en : (e.dataset.vi != null ? e.dataset.vi : e.textContent)))
    .map(e => n(e.textContent).slice(0, 70));
}, lang);

(async () => {
  const b = await chromium.launch();
  try {
    for (const [url, w] of [['/index.html', 390], ['/index.html', 1280], ['/games.html', 390], ['/giang-vien.html', 390], ['/truong-hoc-thuat.html', 1280], ['/bang-chung.html', 390]]) {
      const ctx = await b.newContext({ viewport: { width: w, height: 844 }, serviceWorkers: 'block' });
      const p = await ctx.newPage(), errs = [];
      p.on('pageerror', e => errs.push(e.message));
      await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
      await p.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await p.addInitScript(() => localStorage.setItem('bizon-lang', 'en'));
      await p.goto(BASE + url, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(700);
      const tag = url + ' ' + w;
      assert.deepEqual(await wrong(p, 'en'), [], tag + ' EN: mọi chữ có bản dịch đều đã đổi');
      for (const lang of ['vi', 'en']) {
        await p.evaluate(l => window.clayApplyLang(l), lang); await p.waitForTimeout(400);
        assert.deepEqual(await wrong(p, lang), [], tag + ' sau khi đổi sang ' + lang.toUpperCase());
      }
      if (url === '/index.html') {
        const umk = 'a.hp-news[href="bang-chung.html#lop-quoc-te-umk"] span';
        assert.match(norm(await p.$eval(umk, e => e.textContent)), /^17–19 Nov 2026 · 160 students from UM Kendari/, tag + ': tin UM Kendari bằng tiếng Anh');
        assert.ok(await p.$eval(umk, e => !!e.querySelector('.clay-go')), tag + ': vẫn có viên mũi tên');
        assert.equal(norm(await p.$eval('#hp-le-20-11 span', e => e.textContent)), 'Thank you, teachers · write a card for your teacher with Tèo Soi', tag + ': dòng 20/11 bằng tiếng Anh');
        await p.evaluate(() => window.clayApplyLang('vi')); await p.waitForTimeout(400);
        assert.match(norm(await p.$eval(umk, e => e.textContent)), /^17–19\/11\/2026 · 160 sinh viên/, tag + ': đổi về VI ra chữ gốc');
        assert.ok(await p.$eval(umk, e => !!e.querySelector('.clay-go')), tag + ': VI vẫn có viên mũi tên');
      }
      assert.deepEqual(errs, [], tag + ': không lỗi JS');
      await ctx.close();
    }
    for (const lang of ['en', 'vi']) {
      const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
      const p = await ctx.newPage();
      await p.addInitScript(l => localStorage.setItem('bizon-lang', l), lang);
      await p.goto(BASE + '/hinh-dung.html?lang=' + lang, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(1200);
      const t = await p.evaluate(() => document.body.innerText);
      assert.ok(t.includes(lang === 'en' ? 'Assoc. Prof. Phan Anh Tú' : 'PGS.TS. Phan Anh Tú') && !t.includes('{{'), 'hinh-dung ' + lang + ': dòng bản quyền đúng ngôn ngữ');
      await ctx.close();
    }
    console.log('dich-en-co-mui-ten: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
