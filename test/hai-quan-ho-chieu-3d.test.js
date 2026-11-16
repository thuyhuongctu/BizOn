/* Hộ Chiếu Thương Hiệu 3D: Trạm Hải quan Vàm Thịnh cạnh nhà xưởng (bp3d.js).
 * Kiểm tra: mã có nhà hải quan, 5 loại hồ sơ xuất khẩu song ngữ, điểm chạm nằm trong danh sách raycast;
 * mở thẻ hồ sơ (#bp3d-act) bằng tiếng Việt và tiếng Anh, đủ 5 dòng, đóng được; không lỗi JS. Cần máy chủ tĩnh BIZON_URL. */
'use strict';
const path = require('path');
const fs = require('fs');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium;
try { chromium = require('playwright').chromium; } catch (e) {
  try { chromium = require('playwright-core').chromium; } catch (e2) { console.error('Cần playwright'); process.exit(1); }
}
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };

const src = fs.readFileSync(path.join(__dirname, '..', 'bp3d.js'), 'utf8');
const docs = (src.match(/const CUSTOMS_DOCS = \[([\s\S]*?)\];/) || [])[1] || '';
check((docs.match(/\['/g) || []).length === 5, 'bp3d.js: CUSTOMS_DOCS có 5 loại hồ sơ');
check(/C\/O/.test(docs) && /HS/.test(docs) && /Incoterms/.test(docs), 'bp3d.js: hồ sơ có C/O, mã HS, Incoterms');
check(/userData\.customs\s*=\s*true/.test(src), 'bp3d.js: điểm chạm hải quan được đánh dấu userData.customs');
check(/dataset\.m === 'customs'\) openCustoms\(\)/.test(src), 'bp3d.js: đổi ngôn ngữ mở lại đúng thẻ hải quan');

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    for (const lang of ['vi', 'en']) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, serviceWorkers: 'block' });
      const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
      await page.addInitScript(l => { try { localStorage.clear(); localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
      await page.route(/\.(woff2?|mp3|m4a|mp4|webp|png|jpg|jpeg|glb)(\?|$)/, r => r.abort());
      await page.goto(BASE + '/Ho%20Chieu%20Thuong%20Hieu%203D.html?seed=4242', { waitUntil: 'commit', timeout: 60000 });
      await page.waitForFunction(() => window.__bp3dKiosks && window.__bp3dKiosks.customs, null, { timeout: 60000 });
      const r = await page.evaluate(() => {
        const K = window.__bp3dKiosks, c = K.customs;
        const out = { inHits: K.hits.indexOf(c.hit) >= 0 && c.hit.userData.customs === true, gate: !!c.gate, flag: !!c.flag, label: !!c.label };
        out.opened = K.openCustoms();
        const box = document.getElementById('bp3d-act');
        out.shown = !box.hidden && box.dataset.m === 'customs';
        out.title = (box.querySelector('h4') || {}).textContent || '';
        out.items = box.querySelectorAll('li').length;
        out.text = box.textContent;
        const btn = box.querySelector('button'); if (btn) btn.click();
        out.closed = box.hidden;
        return out;
      });
      check(r.inHits && r.gate && r.flag && r.label, lang + ': nhà hải quan có điểm chạm trong hits, rào chắn, cờ, nhãn');
      check(r.opened === true && r.shown, lang + ': openCustoms() mở thẻ #bp3d-act (data-m=customs)');
      check(r.items === 5, lang + ': thẻ có 5 dòng hồ sơ (' + r.items + ')');
      if (lang === 'vi') check(/Hải quan Vàm Thịnh/.test(r.title) && /Giấy chứng nhận xuất xứ/.test(r.text), 'vi: tiêu đề và hồ sơ bằng tiếng Việt');
      else check(/Customs/.test(r.title) && /certificate of origin/i.test(r.text) && !/Giấy chứng nhận xuất xứ/.test(r.text), 'en: tiêu đề và hồ sơ bằng tiếng Anh');
      check(r.closed, lang + ': nút đóng ẩn thẻ');
      check(errors.length === 0, lang + ': không lỗi JS (' + errors.slice(0, 2).join(' | ') + ')');
      await ctx.close();
    }
  } catch (e) { check(false, 'lỗi khi chạy: ' + e.message); }
  await browser.close();
  console.log(fails ? `\n${fails} kiểm tra hỏng` : '\nhai-quan-ho-chieu-3d: ok'); process.exit(fails ? 1 : 0);
})();
