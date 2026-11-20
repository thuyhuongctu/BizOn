/* Một bản three.js rút gọn cho mọi cảnh 3D (20/11/2026, lỗi 6 sau rà soát game 3D trên điện thoại; chị đồng ý sửa đường dẫn trong
 * tệp đã nộp hồ sơ, bản nộp giữ trong lịch sử git). Trước: hai bản sao giống hệt (vendor/three/ cho Bến Phù Sa, js/vendor/ cho các
 * game khác), đều là bản đầy đủ chưa rút gọn (2,0 MB); trình duyệt không dùng chung bộ nhớ đệm giữa các game. Nay:
 * - js/vendor/three.module.min.js + three.core.min.js là bản rút gọn chính thức r184 (khớp gói npm three@0.184.0);
 * - mọi importmap "three" và mọi chỗ nhập trực tiếp đều trỏ về đúng một đường dẫn đó; thư mục vendor/three/ đã bỏ;
 * - chạy thật Bến Phù Sa 3D, Hộ Chiếu Thương Hiệu 3D, Bến BizOn: chỉ tải bản rút gọn, cảnh dựng được, không lỗi JS. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { execSync } = require('node:child_process');
const ROOT = path.join(__dirname, '..');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const mod = read('js/vendor/three.module.min.js'), core = read('js/vendor/three.core.min.js');
assert.match(mod.slice(0, 200), /SPDX-License-Identifier: MIT/); assert.match(core.slice(0, 200), /SPDX-License-Identifier: MIT/);
assert.ok(core.includes('const t="184"') && mod.includes('from"./three.core.min.js"'), 'bản rút gọn r184, nhập lõi rút gọn');
assert.ok(mod.length < 400000 && core.length < 400000, 'đúng là bản rút gọn');
assert.ok(!fs.existsSync(path.join(ROOT, 'vendor/three')), 'không còn thư mục bản sao vendor/three/');

// Mọi tệp đang phục vụ (trừ tài liệu, test, chính thư viện): "three" trong importmap và mọi chỗ nhập three.module đều là bản rút gọn
const files = execSync('git ls-files "*.html" "*.js" "*.mjs"', { cwd: ROOT, encoding: 'utf8' }).split('\n')
  .filter(f => f && !/^(test|docs|node_modules)\//.test(f) && !/^js\/vendor\//.test(f));
const sai = [];
for (const f of files) {
  const s = read(f);
  for (const m of s.matchAll(/"three"\s*:\s*"([^"]+)"/g)) if (!/^https?:/.test(m[1]) && !/js\/vendor\/three\.module\.min\.js$/.test(m[1])) sai.push(f + ': importmap ' + m[1]);
  for (const m of s.matchAll(/['"]([^'"\s]*vendor\/three[^'"\s]*\.js)['"]/g)) if (!/three\.(module|core)\.min\.js$|three\.min\.js$/.test(m[1])) sai.push(f + ': ' + m[1]);
}
assert.deepEqual(sai, [], 'mọi chỗ dùng three.js trỏ về bản rút gọn chung');
const sw = read('sw.js');
assert.ok(sw.includes("'./js/vendor/three.module.min.js',") && sw.includes("'./js/vendor/three.core.min.js',") && !sw.includes('./vendor/three/') && !sw.includes("'./js/vendor/three.module.js'"), 'sw.js lưu sẵn bản rút gọn, bỏ bản sao');
assert.ok(+(sw.match(/bizon-v(\d+)/) || [])[1] >= 921, 'sw.js ≥ bizon-v921');

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    for (const [url, khung] of [['/ben-phu-sa-3d.html', '#bps3d canvas'], ['/Ho%20Chieu%20Thuong%20Hieu%203D.html', '#bp3d-stage canvas'], ['/hub-3d.html', 'canvas']]) {
      const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      const p = await ctx.newPage(); const loi = [], three = [];
      p.on('pageerror', e => loi.push(e.message));
      p.on('request', r => { const u = r.url(); if (/three\.(module|core)/.test(u) || /vendor\/three\//.test(u)) three.push(u.replace(/^https?:\/\/[^/]+/, '')); });
      await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
      await p.route(/\.(mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await p.goto(BASE + url, { waitUntil: 'load', timeout: 90000 });
      await p.waitForSelector(khung, { state: 'attached', timeout: 60000 }); await p.waitForTimeout(1500);
      assert.deepEqual([...new Set(three)].sort(), ['/js/vendor/three.core.min.js', '/js/vendor/three.module.min.js'], url + ': chỉ tải bản rút gọn chung ' + JSON.stringify(three));
      assert.deepEqual(loi, [], url + ': không lỗi JS: ' + loi.join(' / '));
      await ctx.close();
    }
    console.log('three-mot-ban: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
