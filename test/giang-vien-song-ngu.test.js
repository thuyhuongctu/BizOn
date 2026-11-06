/* Trang giảng viên song ngữ (PR 8 của kế hoạch docs/roadmap/KE-HOACH-DON-HE-SINH-THAI-2026-11.md, 06/11/2026): Trang Giảng viên (x-dc) dịch
 * hết chữ tĩnh qua bảng L() và chữ do script dựng qua this.tr(); Màn hình lớp học mặc định tiếng Việt, sang EN khi ?lang=en hoặc đã tự chọn EN.
 * Chạy thật bằng Playwright với lớp mẫu DEMO-2026. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const VI = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/g;
const gv = R('Trang Giang Vien.dc.html');
check(gv.includes('  L() {') && gv.includes('      L: this.L(),'), 'Trang Giảng viên có bảng chữ L() và đưa vào render');
{ const body = gv.split('</helmet>')[1].split('<script type="text/x-dc"')[0]; const left = [...body.matchAll(/>([^<>{}]*?)</g)].map(m => m[1].trim()).filter(t => VI.test(t)); check(!left.length, 'markup Trang Giảng viên không còn chữ Việt chưa dịch ' + left.slice(0, 3).join(' | ')); }
check(/data-en="Classroom screen"/.test(R('man-hinh-lop-hoc.html')) && /const EN = /.test(R('man-hinh-lop-hoc.html')) && /const EN = /.test(R('js/man-hinh-lop-hoc.js')), 'Màn hình lớp học có cơ chế song ngữ');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(R('sw.js')) || [])[1] >= 802, 'sw.js ≥ bizon-v802');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    for (const lang of ['en', 'vi']) {
      const ctx = await b.newContext({ viewport: { width: 1200, height: 900 }, locale: 'en-US' }); const p = await ctx.newPage(); const loi = []; p.on('pageerror', e => loi.push(e.message));
      await p.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); localStorage.removeItem('bizon-lang-auto'); } catch (e) {} }, lang);
      await p.goto(BASE + '/Trang%20Giang%20Vien.dc.html', { timeout: 60000 }); await p.waitForTimeout(2500);
      await p.getByText(lang === 'en' ? 'DEMO-2026 sample class' : 'lớp mẫu DEMO-2026').first().click(); await p.waitForTimeout(2500);
      const open = p.getByText(lang === 'en' ? 'Open dashboard →' : 'Mở bảng điều khiển →').first(); check(await open.count() > 0, lang + ': màn lớp của tôi đúng ngôn ngữ'); if (await open.count()) { await open.click(); await p.waitForTimeout(2500); }
      let bad = 0, viLeft = 0;
      for (const tab of (lang === 'en' ? ['Teams & progress', 'Decisions', 'Class controls', 'Grading', 'Members', 'Gradebook'] : ['Đội & tiến độ', 'Quyết định', 'Điều khiển lớp', 'Chấm điểm', 'Thành viên', 'Sổ điểm'])) {
        const t = p.getByText(tab, { exact: false }).first(); if (!(await t.count())) { bad++; continue; } await t.click(); await p.waitForTimeout(900);
        const r = await p.evaluate(() => ({ un: (document.body.innerText.match(/\{\{|\bL\.[ka]\d\d\b/g) || []).length, vi: (document.body.innerText.replace(/DEMO-2026|Đội [A-Z0-9]+|khach@demo/g, '').match(/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/g) || []).length }));
        bad += r.un; if (lang === 'en') viLeft += r.vi;
      }
      check(bad === 0, lang + ': sáu tab mở được, không lộ {{ }} hay L.kNN');
      if (lang === 'en') check(viLeft < 60, 'EN: còn rất ít chữ Việt trong bảng điều khiển (' + viLeft + ' ký tự có dấu, gồm tên đội/ô nhập)');
      check(!loi.length, lang + ': không lỗi JS ' + loi.join(' / '));
      await ctx.close();
    }
    // Màn hình lớp học: mặc định VI dù trình duyệt tiếng Anh; ?lang=en sang EN
    const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, locale: 'en-US' }); const p = await ctx.newPage(); const loi = []; p.on('pageerror', e => loi.push(e.message));
    await p.goto(BASE + '/man-hinh-lop-hoc.html?demo=1&game=hcsr', { timeout: 60000 }); await p.waitForTimeout(4000);
    let r = await p.evaluate(() => [document.documentElement.lang, document.getElementById('panelTitle').textContent, document.getElementById('langBtn').textContent]);
    check(r[0] === 'vi' && r[1] === 'Xếp hạng các nhóm' && r[2] === 'EN', 'màn hình lớp học mặc định tiếng Việt (' + r.join(' / ') + ')');
    await p.goto(BASE + '/man-hinh-lop-hoc.html?demo=1&game=hcsr&lang=en', { timeout: 60000 }); await p.waitForTimeout(4000);
    r = await p.evaluate(() => [document.documentElement.lang, document.getElementById('panelTitle').textContent, document.getElementById('kicker').textContent, document.querySelector('.brand small').textContent]);
    check(r[0] === 'en' && r[1] === 'Team ranking' && /Durian Passport · sample class/.test(r[2]) && r[3] === 'Classroom screen', 'màn hình lớp học ?lang=en sang tiếng Anh (' + r.join(' / ') + ')');
    check(!loi.length, 'màn hình lớp học không lỗi JS ' + loi.join(' / '));
    await ctx.close();
  } catch (e) { check(false, 'lỗi khi chạy: ' + e.message); }
  await b.close();
  if (fails) { console.log('giang-vien-song-ngu: ' + fails + ' lỗi'); process.exit(1); }
  console.log('giang-vien-song-ngu: ok');
})();
