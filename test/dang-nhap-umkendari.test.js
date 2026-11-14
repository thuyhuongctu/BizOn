// Màn đăng nhập email trường của Bật Nghiệp (game.html, 14/11/2026, lớp UM Kendari):
// dòng gợi ý có cả @umkendari.ac.id; ở chế độ tiếng Anh không còn câu tiếng Việt nào (trừ tên riêng), kể cả placeholder và lựa chọn vai Thư ký.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..');
assert.ok(+(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8').match(/bizon-v(\d+)/) || [])[1] >= 869);
assert.match(fs.readFileSync(path.join(ROOT, 'js/student-auth.js'), 'utf8'), /Cần email trường đã đăng ký với BizOn \(vd [^)]*@umkendari\.ac\.id\)/);
const VI = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;
const NAMES = /Hương|Đỗ Thùy|Phan Anh Tú|Bật Nghiệp/;

(async () => {
  const b = await chromium.launch(); const errs = [];
  const open = async lang => {
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } }); p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
    await p.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
    await p.goto(BASE + '/game.html?lang=' + lang, { waitUntil: 'load', timeout: 60000 });
    await p.waitForSelector('#screen-login.active', { timeout: 15000 });
    await p.waitForTimeout(500);
    return p.evaluate(() => {
      const vi = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
      while ((n = w.nextNode())) {
        const t = n.textContent.trim(), el = n.parentElement;
        if (!t || !el || el.closest('script,style')) continue;
        if (!el.offsetParent && getComputedStyle(el).position !== 'fixed' && !el.classList.contains('bz-skip')) continue;
        vi.push(t);
      }
      return {
        texts: vi, label: document.querySelector('#sa-auth-block label').textContent,
        ph: [...document.querySelectorAll('#sa-class,#sa-team,#login-email,#login-team,#login-class')].map(i => i.placeholder),
        sec: document.querySelector('#sa-role option[value=SEC]').textContent,
      };
    });
  };
  try {
    const en = await open('en');
    assert.match(en.label, /@umkendari\.ac\.id/);
    const left = en.texts.filter(t => VI.test(t) && !NAMES.test(t));
    assert.deepEqual(left, [], 'còn chữ tiếng Việt ở chế độ EN');
    assert.ok(en.ph.every(x => !VI.test(x) && !/^VD:/.test(x)), 'placeholder EN: ' + en.ph);
    assert.equal(en.sec, 'SEC (Secretary)');
    const vi = await open('vi');
    assert.match(vi.label, /^Email trường \(vd .*@umkendari\.ac\.id\)$/);
    assert.equal(vi.sec, 'SEC (Thư ký)');
    assert.ok(vi.texts.includes('Bỏ qua tới nội dung chính'));
    assert.deepEqual(errs, []);
    console.log('dang-nhap-umkendari: ok');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
