/* Màn hình lớp học ở tiếng Anh (19/11/2026, sau buổi UMK): khi chưa đăng nhập, nhãn đếm và tiêu đề bảng còn tiếng Việt
 * («nhóm đã nộp», «Xếp hạng các nhóm»), sa bàn Bến Phù Sa ghi «TP. Hồ Chí Minh», «Cảng Cái Mép». Kiểm cả bốn tab ở EN
 * (tab Bật Nghiệp thêm ngày 19/11/2026: tên tỉnh/thành ở EN viết «Can Tho, Ho Chi Minh City, Khanh Hoa, Da Nang, Thanh Hoa, Hanoi»). */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
assert.ok(+(fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8').match(/bizon-v(\d+)/) || [])[1] >= 899, 'sw.js ≥ v899');
const VI = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;
const NAMES = /Bến Phù Sa|Cần Thơ|Vĩnh Long|Mỹ Tho|Cái Mép|Mekong|Đỗ Thùy Hương|Phan Anh Tú/g;

(async () => {
  const b = await chromium.launch(); const errs = [];
  try {
    for (const g of ['bps', 'hcth', 'hcsr', 'bn']) {
      const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); p.on('pageerror', e => errs.push(g + ': ' + e.message));
      await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
      await p.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await p.addInitScript(() => localStorage.setItem('bizon-lang', 'en'));
      await p.goto(BASE + '/man-hinh-lop-hoc.html?game=' + g + '&lang=en', { waitUntil: 'load', timeout: 60000 });
      await p.waitForTimeout(1500);
      const left = await p.evaluate(() => {
        const out = [], w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (w.nextNode()) { const t = w.currentNode.textContent.trim(), el = w.currentNode.parentElement; if (t && el && el.offsetParent !== null && !el.closest('script,style')) out.push(t); }
        return out;
      });
      const vi = left.filter(t => VI.test(t.replace(NAMES, '')));
      assert.deepEqual(vi, [], g + ': còn chữ tiếng Việt ở chế độ EN');
      if (g === 'bn') assert.ok(left.includes('Bat Nghiep') && left.some(t => t.startsWith('6. Hanoi')), 'bn: tên game, thành phố bằng tiếng Anh');
      if (g === 'bps') assert.ok(left.includes('Ho Chi Minh City') && left.includes('Cái Mép Port'), 'bps: tên cảng, thành phố bằng tiếng Anh');
      await p.close();
    }
    assert.deepEqual(errs, []);
    console.log('man-hinh-lop-hoc-en: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
