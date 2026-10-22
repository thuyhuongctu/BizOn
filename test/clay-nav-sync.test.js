/* Kiểm thử đồng bộ menu/chân trang đất sét trên các trang cũ (nhóm 1).
 *
 * - css/bizon-clay-chrome.css phải khớp đúng phần :root + #clay-nav + #clay-footer
 *   của css/bizon-clay.css (chạy lại scripts/build-clay-chrome.mjs nếu lệch).
 * - 9 trang đã chuyển: nạp nav/footer đất sét + cầu nối VI/EN, không còn menu,
 *   chân trang hay nút ngôn ngữ cũ.
 */
'use strict';
const test = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const PAGES = ['truong.html', 'truong-gioi-thieu.html', 'truong-chinh-sach.html', 'truong-giang-vien.html',
  'giang-vien.html', 'global.html', 'hub-3d.html', 'khao-sat.html', 'khao-sat-online.html'];

test('bizon-clay-chrome.css khớp bizon-clay.css', async () => {
  const { buildClayChrome } = await import(path.join(ROOT, 'scripts', 'build-clay-chrome.mjs'));
  assert.strictEqual(read('css/bizon-clay-chrome.css'), buildClayChrome(read('css/bizon-clay.css')),
    'chạy: node scripts/build-clay-chrome.mjs');
});

for (const f of PAGES) {
  test(f + ': menu + chân trang đất sét, không còn vỏ cũ', () => {
    const s = read(f);
    for (const need of ['css/bizon-clay-chrome.css', 'css/clay-tool-skin.css', 'css/clay-legacy.css',
      'js/bizon-clay-i18n.js', 'js/bizon-clay-bridge.js', 'js/bizon-clay-nav.js', 'js/bizon-clay-footer.js']) {
      assert.ok(s.includes(need), f + ' thiếu ' + need);
    }
    for (const old of ['js/site-nav.js', 'js/site-footer.js', 'id="clay-lang-fab"', '<header class="nav"', 'css/bizon-clay.css"']) {
      assert.ok(!s.includes(old), f + ' còn ' + old);
    }
    assert.ok(s.indexOf('js/bizon-clay-bridge.js') < s.indexOf('js/bizon-clay-nav.js'), f + ': bridge phải nạp trước nav');
  });
}

test('sw.js lưu sẵn tệp mới', () => {
  const sw = read('sw.js');
  for (const f of ['./css/bizon-clay-chrome.css', './css/clay-legacy.css', './js/bizon-clay-bridge.js']) {
    assert.ok(sw.includes("'" + f + "'"), 'sw.js thiếu ' + f);
  }
});
