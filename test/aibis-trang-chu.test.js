// 21/11/2026: AIBIS (gợi ý phương thức thâm nhập) có thẻ riêng trong «Công cụ bổ trợ · Mô hình chiến lược» trên trang chủ,
// ngay sau IE Lab, kèm nhãn «Bản xem thử · số liệu minh hoạ» vì mô hình còn chờ hiệu chỉnh và dữ liệu quốc gia có xuất xứ.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const home = read('index.html');
assert.equal(home, read('academia3d-v2.html'), 'index.html giống hệt academia3d-v2.html');
const ie = home.indexOf('href="lab/ie-lab.html" data-en="Explore the model"'), ai = home.indexOf('<li class="hp-tool" id="hp-aibis"');
assert.ok(ie > 0 && ai > ie && home.slice(ie, ai).split('<li class="hp-tool"').length === 1, 'thẻ AIBIS nằm ngay sau IE Lab');
for (const f of ['aibis-entry-mode-preview.html', 'ho-chieu-thuong-hieu.html', 'assets/hc/item/network.png']) assert.ok(fs.existsSync(R(f)), 'có tệp ' + f);
assert.ok(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 939, 'sw.js ≥ v939');

(async () => {
  const b = await chromium.launch();
  try {
    for (const [w, lang] of [[360, 'vi'], [390, 'en'], [1280, 'vi']]) {
      const p = await b.newPage({ viewport: { width: w, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
      await p.route(/\.(mp3|mp4|woff2?)(\?|$)/, r => r.abort());
      await p.addInitScript(l => localStorage.setItem('bizon-lang', l), lang);
      await p.goto(BASE + '/index.html?lang=' + lang, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(500);
      const tag = w + ' ' + lang;
      await p.$eval('#hp-aibis', el => el.scrollIntoView()); await p.waitForFunction(() => { const i = document.querySelector('#hp-aibis img'); return i.complete && i.naturalWidth > 0; }, null, { timeout: 10000 }).catch(() => {});
      const c = await p.$eval('#hp-aibis', el => ({ kick: el.querySelector('.hp-tool-kicker').textContent.trim(), tagT: el.querySelector('.hp-tool-tag').textContent.trim(),
        links: [...el.querySelectorAll('.hp-tool-links a')].map(a => a.getAttribute('href')), img: el.querySelector('img').complete && el.querySelector('img').naturalWidth > 0 }));
      assert.equal(c.kick, lang === 'en' ? 'STRATEGY MODEL' : 'MÔ HÌNH CHIẾN LƯỢC', tag + ': nhãn nhóm');
      assert.equal(c.tagT, lang === 'en' ? 'Preview · illustrative data' : 'Bản xem thử · số liệu minh hoạ', tag + ': nhãn bản xem thử');
      assert.deepEqual(c.links, ['aibis-entry-mode-preview.html', 'ho-chieu-thuong-hieu.html'], tag + ': hai lối vào');
      assert.ok(c.img, tag + ': ảnh tải được');
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth) <= w, tag + ': không tràn ngang');
      assert.deepEqual(errs, [], tag + ': không lỗi JS');
      await p.close();
    }
    console.log('aibis-trang-chu: đạt');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
