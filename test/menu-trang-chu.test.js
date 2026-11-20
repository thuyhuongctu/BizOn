/* Menu đất sét có mục chữ «Trang chủ / Home» đứng đầu (20/11/2026): trước đây chỉ logo BizOn dẫn về trang chủ,
 * nhiều người không biết bấm logo. Kiểm: mục có ở cả hàng máy tính và hàng cuộn của điện thoại, đúng đích (kể cả
 * trang ở thư mục con), được đánh dấu khi đang ở trang chủ, song ngữ, không làm tràn ngang ở 360/390/1280 px. */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

const nav = read('js/bizon-clay-nav.js');
const first = nav.match(/var LINKS = \[[\s\S]*?\{ href:'([^']+)',\s*vi:'([^']+)',\s*en:'([^']+)'/);
assert.ok(first, 'đọc được LINKS');
assert.deepEqual(first.slice(1), ['index.html', 'Trang chủ', 'Home'], 'mục đầu menu là Trang chủ / Home');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 925, 'sw.js ≥ v925');

(async () => {
  const b = await chromium.launch();
  try {
    for (const [url, w, h, lang, href, cur] of [
      ['/games.html', 360, 740, 'vi', 'index.html', false],
      ['/games.html', 1280, 800, 'en', 'index.html', false],
      ['/index.html', 390, 844, 'vi', 'index.html', true],
      ['/doi-ngu.html', 1280, 800, 'vi', 'index.html', false],
      ['/lab/ie-lab.html', 390, 844, 'vi', '../index.html', false]
    ]) {
      const tag = url + ' ' + w + ' ' + lang;
      const p = await b.newPage({ viewport: { width: w, height: h } });
      const errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
      await p.route(/\.(mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await p.addInitScript(l => localStorage.setItem('bizon-lang', l), lang);
      await p.goto(BASE + url, { waitUntil: 'load', timeout: 60000 });
      await p.waitForSelector('#clay-nav', { timeout: 15000 });
      await p.waitForTimeout(500);
      const st = await p.evaluate(() => {
        const vis = el => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
        const pick = sel => { const a = document.querySelector(sel); return a && { text: a.textContent.trim(), href: a.getAttribute('href'), cur: a.getAttribute('aria-current'), vis: vis(a), r: a.getBoundingClientRect().right }; };
        return { links: pick('#clay-nav .cn-links a'), row2: pick('#clay-nav .cn-row2 a'), sw: document.documentElement.scrollWidth,
          bar: (() => { const b = document.querySelector('#clay-nav .cn-bar'); return b ? b.scrollWidth - b.clientWidth : 0; })() };
      });
      const shown = [st.links, st.row2].filter(x => x && x.vis);
      assert.ok(shown.length >= 1, tag + ': thấy mục Trang chủ trên menu');
      for (const x of shown) {
        assert.equal(x.text, lang === 'en' ? 'Home' : 'Trang chủ', tag + ': chữ của mục');
        assert.equal(x.href, href, tag + ': đích của mục');
        assert.equal(x.cur === 'page', cur, tag + ': đánh dấu trang hiện tại');
        assert.ok(x.r <= w, tag + ': mục Trang chủ nằm trong màn hình');
      }
      assert.ok(st.sw <= w, tag + ': không tràn ngang (' + st.sw + ')');
      assert.ok(st.bar <= 1, tag + ': thanh menu không bị tràn (' + st.bar + ')');
      assert.deepEqual(errs, [], tag + ': không lỗi JS');
      await p.close();
    }
    console.log('menu-trang-chu: đạt');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
