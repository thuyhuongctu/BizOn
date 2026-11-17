/* Rà hành văn toàn web (17/11/2026): chị thấy nhiều đoạn tiếng Việt «vô nghĩa» vì dày ký hiệu, công thức, viết tắt và đường dẫn tệp.
 * Đã viết lại trên các trang công khai. Test này chặn tái phát những lỗi dễ nhận ra bằng máy, ở cả VI và EN:
 *  - chữ hiển thị không còn đường dẫn tệp thô (docs/…, scripts/…, assets/…, *.md, *.mjs, *.woff2); muốn dẫn tệp thì dùng liên kết có tên;
 *  - không còn công thức viết bằng ký hiệu kiểu «^2,2», «(giá chuẩn/giá)» (ô số trong bảng tham số và công thức đã kèm lời giải thích thì được);
 *  - không đoạn nào dài quá 700 ký tự (đoạn dài phải tách câu hoặc thành danh sách). */
'use strict';
const assert = require('assert');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }

const PAGES = ['index.html', 'thiet-ke-nghien-cuu.html', 'dinh-huong.html', 'truong-hoc-thuat.html', 'bang-chung.html', 'bao-chi.html',
  'chinh-sach.html', 'doi-ngu.html', 'giai-phap.html', 'games.html', 'lop-hoc.html', 'am-nhac.html', 'thu-vien-clip.html'];
const PATH = /\b(?:docs|scripts|assets|data)\/[\w./-]+|\b[\w-]+\.(?:md|mjs|woff2|cff)\b/;
const FORMULA = /\^\s?\d|\(giá chuẩn\s*\/\s*giá\)|\(benchmark price\s*\/\s*price\)/i;

(async () => {
  const b = await chromium.launch(); const bad = []; const errs = [];
  try {
    for (const lang of ['vi', 'en']) {
      for (const pg of PAGES) {
        const p = await b.newPage({ viewport: { width: 1280, height: 900 } }); p.on('pageerror', e => errs.push(pg + ': ' + e.message));
        await p.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); localStorage.setItem('bizon-tour-seen', '1'); } catch (e) {} }, lang);
        await p.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
        await p.goto(BASE + '/' + pg + '?lang=' + lang, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(700);
        const rows = await p.evaluate(() => {
          const out = [];
          document.querySelectorAll('main p, main li, main td, main dd, main figcaption, p, li, td').forEach(el => {
            if (el.closest('script,style,nav,header,code,pre,[aria-hidden="true"],.refs,#tham-khao,#tai-lieu,ol.ref')) return;
            if (el.querySelector('p,li,td,div,ul,ol,table')) return;
            out.push(el.textContent.replace(/\s+/g, ' ').trim());
          });
          return [...new Set(out)];
        });
        for (const t of rows) {
          if (PATH.test(t)) bad.push(`${lang} ${pg} đường dẫn thô: ${t.match(PATH)[0]} | ${t.slice(0, 80)}`);
          if (FORMULA.test(t)) bad.push(`${lang} ${pg} công thức ký hiệu: ${t.match(FORMULA)[0]} | ${t.slice(0, 80)}`);
          if (t.length > 700 && !/^\[\d+\]|\(\d{4}\)\./.test(t)) bad.push(`${lang} ${pg} đoạn dài ${t.length} ký tự: ${t.slice(0, 80)}`);
        }
        await p.close();
      }
    }
    assert.deepEqual(bad, [], '\n' + bad.join('\n'));
    assert.deepEqual(errs, []);
    console.log('hanh-van-de-hieu: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
