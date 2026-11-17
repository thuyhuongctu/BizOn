/* Trang Thiết kế nghiên cứu, mục «Hiện trạng»: chị thấy đoạn cũ là một khối ký hiệu (d_z, p, NPS, đường dẫn tệp) đọc không hiểu.
 * Viết lại (17/11/2026): giữ nguyên số liệu nhưng mỗi kết quả một dòng, giải thích bằng lời thường (vì sao kiến thức «không đổi»,
 * NPS nghĩa là gì, vì sao chưa nói được nhân quả); đường dẫn tệp thành liên kết có tên. Kiểm VI/EN, không tràn ngang ở 360/390 px. */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }

assert.ok(+(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8').match(/bizon-v(\d+)/) || [])[1] >= 893, 'sw.js ≥ v893');

(async () => {
  const b = await chromium.launch(); const errs = [];
  try {
    for (const [lang, w] of [['vi', 390], ['en', 360]]) {
      const pg = await b.newPage({ viewport: { width: w, height: 800 } }); pg.on('pageerror', e => errs.push(e.message));
      await pg.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
      await pg.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await pg.goto(BASE + '/thiet-ke-nghien-cuu.html?lang=' + lang, { waitUntil: 'load', timeout: 60000 });
      await pg.waitForTimeout(500);
      const r = await pg.evaluate(() => {
        const sec = document.getElementById('hien-trang'), a = sec.querySelector('a[href*="KET-QUA-TRUOC-SAU-2026-10.md"]');
        return { text: sec.innerText, items: sec.querySelectorAll('ul li').length, link: a && a.textContent.trim(),
          over: document.documentElement.scrollWidth - innerWidth };
      });
      assert.equal(r.items, 4, lang + ': bốn kết quả, mỗi kết quả một dòng');
      assert.ok(!/docs\/research/.test(r.text), lang + ': không để lộ đường dẫn tệp thô');
      assert.ok(r.link, lang + ': có liên kết tới bảng đầy đủ');
      if (lang === 'vi') {
        for (const s of ['49 cặp ghép', '14,22 → 14,20', '30,6 → 31,1', 'chạm trần', 'Không phải vì sinh viên không học được gì', 'chưa có nhóm đối chứng', 'không muốn giới thiệu'])
          assert.ok(r.text.includes(s), 'vi thiếu «' + s + '»');
      } else {
        for (const s of ['49 matched pairs', '14.22 → 14.20', '30.6 → 31.1', 'hit the ceiling', 'no comparison group', 'would not recommend'])
          assert.ok(r.text.includes(s), 'en thiếu «' + s + '»');
        assert.ok(!/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(r.text.replace(/Bật Nghiệp/g, '')), 'en: không còn chữ tiếng Việt');
      }
      assert.ok(r.over <= 0, `${lang} ${w}px tràn ngang ${r.over}px`);
      await pg.close();
    }
    assert.deepEqual(errs, []);
    console.log('hien-trang-de-hieu: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
