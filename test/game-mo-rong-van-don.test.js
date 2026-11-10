// Trung tâm trò chơi có mục «Game mở rộng» dẫn sang game Vân Đồn 1149 (10/11/2026). Vân Đồn là sản phẩm riêng của
// tác giả Đỗ Thùy Hương, nằm ngoài BizOn: thẻ phải nói rõ điều đó, mở tab mới, có bản VI/EN, không tràn ngang ở 360 px.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..');
const URL_VD = 'https://thuyhuongctu.github.io/ThuyHuong_Digital-2026-Games/van-don/';
assert.ok(+(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8').match(/bizon-v(\d+)/) || [])[1] >= 822);

(async () => {
  const b = await chromium.launch(); const errs = [];
  const open = async (lang, width) => {
    const pg = await b.newPage({ viewport: { width, height: 900 } }); pg.on('pageerror', e => errs.push(e.message));
    await pg.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
    await pg.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
    await pg.goto(BASE + '/games.html', { waitUntil: 'load', timeout: 60000 });
    await pg.waitForSelector('#ar-more a', { timeout: 15000 });
    return pg;
  };
  const info = pg => pg.evaluate(() => {
    const sec = document.getElementById('ar-more').closest('section'), a = sec.querySelector('#ar-more a'), r = a.getBoundingClientRect();
    return {
      tag: sec.querySelector('#ar-moretag').textContent, title: sec.querySelector('#ar-moretitle').textContent,
      href: a.getAttribute('href'), target: a.getAttribute('target'), rel: a.getAttribute('rel'), text: a.textContent,
      links: sec.querySelectorAll('#ar-more a').length, h: r.height,
      afterMini: !!(sec.previousElementSibling && sec.previousElementSibling.querySelector('#ar-ext')),
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
  try {
    let pg = await open('vi', 1280);
    let r = await info(pg);
    assert.equal(r.href, URL_VD);
    assert.equal(r.target, '_blank'); assert.match(r.rel || '', /noopener/);
    assert.equal(r.links, 1);
    assert.match(r.tag, /Game mở rộng/);
    assert.match(r.title, /Vân Đồn/);
    assert.match(r.text, /không thuộc BizOn/, 'phải nói rõ là sản phẩm ngoài BizOn');
    assert.match(r.text, /Đỗ Thùy Hương/);
    assert.match(r.text, /1149/);
    assert.match(r.text, /thương cảng quốc tế đầu tiên của Đại Việt/, 'câu chữ đúng sử: «của Đại Việt», không phải «tại Việt Nam»');
    assert.match(r.text, /16 tuổi/, 'game không dành cho trẻ em');
    assert.ok(r.afterMini, 'mục mở rộng nằm sau mục trò chơi nhỏ');
    await pg.close();
    pg = await open('en', 360);
    r = await info(pg);
    assert.equal(r.href, URL_VD);
    assert.match(r.tag, /More to play/);
    assert.match(r.text, /not part of BizOn/);
    assert.match(r.text, /in Vietnamese/, 'bản EN phải báo game chỉ có tiếng Việt');
    assert.ok(r.h >= 44, 'vùng chạm đủ lớn');
    assert.ok(r.overflow <= 0, 'tràn ngang ' + r.overflow + ' px');
    await pg.close();
    assert.deepEqual(errs, []);
    console.log('game-mo-rong-van-don: ok');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
