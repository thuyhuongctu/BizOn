/* Bản tiếng Anh gọi cố vấn là «Tu Phan», không kèm «thầy» (chị chốt 17/11/2026): «Ask Tu Phan», «Lumina and Tu Phan»…
 * Bản tiếng Việt giữ nguyên «thầy Tu Phan». Quét mọi chuỗi tiếng Anh (data-en, data-en-html, data-en-aria, en: '…',
 * "en": "…", T('vi', 'en'), cặp ('vi', 'en') của trình tạo trang Văn phòng) rồi mở trang Văn phòng HCTH ở chế độ EN. */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }

const SKIP = /^(node_modules|\.git|specs|docs|test|assets|\.claude|android|supabase)(\/|$)/;
const files = [];
(function walk(d) {
  for (const n of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) {
    const rel = d ? d + '/' + n.name : n.name;
    if (SKIP.test(rel)) continue;
    if (n.isDirectory()) walk(rel);
    else if (/\.(html|js|py)$/.test(n.name)) files.push(rel);
  }
})('');

const PATS = [
  /data-en(?:-[a-z]+)?="([^"]*)"/g,
  /\ben:\s*'([^']*)'/g,
  /"en":\s*"([^"]*)"/g,
  /T\('[^']*',\s*'([^']*)'\)/g,
  /\('[^']*',\s*'([^']*)'\)/g,
];
const bad = [];
for (const f of files) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  if (!/[Tt]hầy Tu Phan|Prof\. Tú/.test(s)) continue;
  for (const re of PATS) {
    for (const m of s.matchAll(re)) {
      const en = m[1];
      if (!/[Tt]hầy Tu Phan|Prof\. Tú/.test(en)) continue;
      // chỉ tính chuỗi tiếng Anh: bỏ tên riêng rồi không còn dấu tiếng Việt
      const rest = en.replace(/[Tt]hầy Tu Phan|Prof\. Tú|Bà Bảy Hiền|Bà Sáu Lành/g, '');
      if (/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(rest)) continue;
      bad.push(f + ': ' + en.slice(0, 90));
    }
  }
}
assert.deepEqual(bad, [], 'chuỗi tiếng Anh còn «thầy Tu Phan»:\n' + bad.join('\n'));
assert.ok(/T\('Hỏi thầy Tu Phan', 'Ask Tu Phan'\)/.test(fs.readFileSync(path.join(ROOT, 'js/bp-signature.js'), 'utf8')), 'nút hỏi trong Hộ Chiếu Thương Hiệu 3D: «Ask Tu Phan»');
assert.ok(+(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8').match(/bizon-v(\d+)/) || [])[1] >= 892, 'sw.js ≥ v892');

(async () => {
  const b = await chromium.launch(); const errs = [];
  try {
    for (const [lang, re, no] of [['en', /Ask Tu Phan, once a game\./, /thầy Tu Phan/i], ['vi', /Hỏi thầy Tu Phan, một lần mỗi ván\./, null]]) {
      const pg = await b.newPage({ viewport: { width: 390, height: 844 } }); pg.on('pageerror', e => errs.push(e.message));
      await pg.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
      await pg.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await pg.goto(BASE + '/van-phong-hc-thuong-hieu.html?lang=' + lang, { waitUntil: 'load', timeout: 60000 });
      await pg.waitForFunction(() => document.documentElement.lang === (localStorage.getItem('bizon-lang') || 'vi'), null, { timeout: 15000 }).catch(() => {});
      await pg.waitForTimeout(600);
      const r = await pg.evaluate(() => ({ h: document.getElementById('h-thaytu').textContent.trim(), body: document.body.innerText }));
      assert.match(r.h, re, lang + ' tiêu đề mục cố vấn: ' + r.h);
      if (no) assert.ok(!no.test(r.body.replace(/Thầy Tu Phan(?= ·)/g, '')), lang + ': thân trang tiếng Anh không còn «thầy Tu Phan» trong câu');
      await pg.close();
    }
    assert.deepEqual(errs, []);
    console.log('ask-tu-phan: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
