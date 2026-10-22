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

const PAGES = ['truong-giang-vien.html', 'global.html', 'hub-3d.html', 'khao-sat.html', 'khao-sat-online.html'];
// Trang ở thư mục con: giữ giao diện làm việc riêng, chỉ gắn menu + chân trang chung
const SUBDIR = ['app/release.html', 'app/command-center.html', 'app/instructor-studio.html', 'app/aibis.html',
  'app/blueprint-2030.html', 'lab/ie-lab.html', 'lab/cmr-lab.html', 'lab/cvp-studio.html', 'lab/nha-may-fdi.html'];
// Trang trùng lặp đã gộp → trang chuyển hướng (giữ link cũ)
const MERGED = { 'truong.html': 'universe.html', 'truong-gioi-thieu.html': 'doi-ngu.html',
  'truong-chinh-sach.html': 'chinh-sach.html', 'giang-vien.html': 'app/instructor-studio.html' };

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

for (const f of SUBDIR) {
  test(f + ': menu + chân trang đất sét (đường dẫn ../), không còn nút English nổi', () => {
    const s = read(f);
    for (const need of ['../css/bizon-clay-chrome.css', '../js/bizon-clay-i18n.js', '../js/bizon-clay-bridge.js',
      '../js/bizon-clay-nav.js', '../js/bizon-clay-footer.js']) assert.ok(s.includes(need), f + ' thiếu ' + need);
    assert.ok(!s.includes('id="clay-lang-fab"'), f + ' còn nút English nổi');
    if (f.startsWith('lab/')) assert.ok(/BIZON_LANG_RELOAD\s*=\s*true/.test(s), f + ' cần BIZON_LANG_RELOAD');
  });
}

for (const [from, to] of Object.entries(MERGED)) {
  test(from + ' chuyển hướng sang ' + to, () => {
    const s = read(from);
    assert.ok(s.includes('http-equiv="refresh"') && s.includes('url=' + to), from + ' thiếu meta refresh');
    assert.ok(s.includes('rel="canonical" href="https://bizonland.com/' + to + '"'), from + ' thiếu canonical');
    assert.ok(s.includes('noindex'), from + ' phải noindex');
    assert.ok(fs.existsSync(path.join(ROOT, to)), to + ' không tồn tại');
  });
}

test('nội dung gộp có mặt ở trang giữ lại', () => {
  const uni = read('universe.html'), dn = read('doi-ngu.html'), cs = read('chinh-sach.html');
  for (const id of ['hoc-phan', 'cau-hoi']) assert.ok(uni.includes('id="' + id + '"'), 'universe thiếu #' + id);
  for (const id of ['vi-sao', 'nguon-goc', 'trich-dan']) assert.ok(dn.includes('id="' + id + '"'), 'doi-ngu thiếu #' + id);
  for (const id of ['quan-tri-du-lieu', 'nguyen-tac', 'thu-gi', 'dong-thuan', 'rut-lui', 'shtt', 'con-mo'])
    assert.ok(cs.includes('id="' + id + '"'), 'chinh-sach thiếu #' + id);
});

test('nav/footer đất sét gắn tiền tố gốc cho trang thư mục con', () => {
  for (const f of ['js/bizon-clay-nav.js', 'js/bizon-clay-footer.js']) {
    const s = read(f);
    assert.ok(/currentScript/.test(s) && /BASE \+ h/.test(s), f + ' thiếu xử lý BASE');
  }
});

test('sw.js lưu sẵn tệp mới', () => {
  const sw = read('sw.js');
  for (const f of ['./css/bizon-clay-chrome.css', './css/clay-legacy.css', './js/bizon-clay-bridge.js']) {
    assert.ok(sw.includes("'" + f + "'"), 'sw.js thiếu ' + f);
  }
});
