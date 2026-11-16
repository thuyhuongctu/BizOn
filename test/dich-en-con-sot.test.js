/* Rà soát bản tiếng Anh (16/11/2026): ở chế độ EN không còn chữ tiếng Việt chưa dịch ở
 *  - game.html (Bật Nghiệp, lớp quốc tế dùng): Cài đặt, tab Hành trình, Quyết định, Lumina – chỉ còn tên riêng;
 *  - huong-dan.html bản EN: nhãn giao diện dùng đúng chữ tiếng Anh của game (Overview, Decisions, Settings, Easy/Normal/Hard…);
 *  - các chỗ lẻ: truong-hoc-thuat, thiet-ke-nghien-cuu, lab/ho-chieu-sau-rieng (chân trang), lab/hanh-trinh-sau-rieng (17.28 t),
 *    brand-passport-learning (nút Lumina). Cần máy chủ tĩnh BIZON_URL. */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const VI = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
// Tên riêng được giữ nguyên dấu trong bản tiếng Anh
const NAMES = ['Bật Nghiệp', 'Bến Phù Sa', 'Hộ Chiếu', 'Sầu Riêng', 'Thương Hiệu', 'Cái Mép', 'Thị Vải', 'Cần Thơ', 'Việt Nam', 'Phù Sa', 'Rồng Xanh',
  'Thu Hà', 'Mạnh Chi', 'Bảo Ngọc', 'Gia Hân', 'Minh Long', 'Hương', 'Phan Anh Tú', 'Đỗ Thùy Hương', 'Giữ Sân Nhà', 'Sóng Ngoại Nhập', 'triệu ₫', 'Hà Khẩu', 'Cai Lậy'];
const strip = t => [...NAMES].sort((a, b) => b.length - a.length).reduce((s, w) => s.split(w).join(' '), t);

// Tĩnh: bản EN của trang Hướng dẫn chơi không còn nhãn giao diện tiếng Việt
const hd = read('huong-dan.html'), en = hd.slice(hd.indexOf("vidH:'Video: play one round"), hd.indexOf('</script>', hd.indexOf("vidH:'Video: play one round")));
for (const bad of ['Thư ký (SEC)', '(chu kỳ)', 'Tổng quan', 'Quyết định tab', 'Khóa vòng', 'Dễ · Thường · Khó', 'Cài đặt', 'Độ khó đối thủ', 'Chơi lại', 'Nếu–Thì', 'Giao diện tiếng Anh', 'Gửi báo cáo lỗi'])
  assert.ok(!en.includes(bad), 'huong-dan EN còn «' + bad + '»');
for (const good of ['Overview', 'Decisions tab', 'Commit – Lock in decisions', 'Easy · Normal · Hard', 'Rival difficulty', 'Restart (Reset)', 'English interface', 'Report a bug'])
  assert.ok(en.includes(good), 'huong-dan EN thiếu «' + good + '»');
assert.ok(/\["🎚️ Độ khó đối thủ", ?"🎚️ Rival difficulty"\]/.test(read('js/site-ui.js')), 'site-ui.js có bản dịch nhãn độ khó');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 890, 'sw.js ≥ v890');

(async () => {
  const b = await chromium.launch(); const errs = [];
  const open = async (url, w = 390) => {
    const p = await b.newPage({ viewport: { width: w, height: 844 } }); p.on('pageerror', e => errs.push(url + ': ' + e.message));
    await p.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'en'); localStorage.setItem('bizon-tour-seen', '1'); } catch (e) {} });
    await p.route(/\.(mp4|mp3|m4a|woff2?)(\?|$)/, r => r.abort());
    await p.goto(BASE + '/' + url, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(2500);
    return p;
  };
  try {
    // 1. game.html: vào Đội Demo, đi qua các tab, không còn chữ tiếng Việt ngoài tên riêng
    const g = await open('game.html?lang=en');
    await g.evaluate(() => { try { window.doLoginDemo(); } catch (e) {} }); await g.waitForTimeout(3500);
    for (let i = 0; i < 6; i++) await g.keyboard.press('Escape');
    const left = [];
    for (const tab of ['dashboard', 'decisions', 'advisor', 'reports', 'journey', 'settings']) {
      await g.evaluate(t => { try { window.showTab(t); } catch (e) {} }, tab); await g.waitForTimeout(800);
      const rows = await g.evaluate(VIs => {
        const re = new RegExp(VIs, 'i'), out = [];
        document.querySelectorAll('h1,h2,h3,h4,p,a,button,span,b,label,li,small').forEach(el => {
          const cs = getComputedStyle(el); const rc = el.getBoundingClientRect();
          if (cs.display === 'none' || cs.visibility === 'hidden' || !rc.width || !rc.height || el.closest('[hidden],[aria-hidden="true"],footer')) return;
          const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').replace(/\s+/g, ' ').trim();
          if (own && re.test(own)) out.push(own);
        });
        return out;
      }, VI.source);
      rows.filter(t => VI.test(strip(t)) && !/^©/.test(t)).forEach(t => left.push(tab + ': ' + t.slice(0, 80)));
    }
    assert.deepEqual([...new Set(left)], [], 'game.html EN còn tiếng Việt: ' + JSON.stringify([...new Set(left)]));
    const diff = await g.evaluate(() => [document.getElementById('diff-easy').textContent, document.getElementById('diff-normal').textContent, document.getElementById('diff-hard').textContent].join('/'));
    assert.equal(diff, 'Easy/Normal/Hard');
    await g.close();
    // 2. các chỗ lẻ
    const t = await open('truong-hoc-thuat.html?lang=en', 1280);
    assert.match(await t.evaluate(() => [...document.querySelectorAll('p.af-note')].map(p => p.textContent).join(' ')), /full working notes/);
    await t.close();
    const k = await open('thiet-ke-nghien-cuu.html?lang=en', 1280);
    const kt = await k.evaluate(() => document.body.innerText);
    assert.ok(/Keep 10 anchor items/.test(kt) && /RQ7, data quality/.test(kt) && !/Giữ 10 câu neo/.test(kt), 'thiet-ke-nghien-cuu EN');
    await k.close();
    const d = await open('lab/ho-chieu-sau-rieng.html?lang=en', 1280);
    const ft = await d.evaluate(() => document.querySelector('footer').innerText);
    assert.ok(/Assoc\. Prof\./.test(ft) && /Source code \(split from BizOn\)/.test(ft) && !/PGS\.TS|Mã nguồn/.test(ft), 'chân trang Sầu Riêng EN');
    await d.close();
    const h = await open('lab/hanh-trinh-sau-rieng.html?lang=en', 1280);
    const ht = await h.evaluate(() => document.body.innerText);
    assert.ok(!/17,28 tấn/.test(ht), 'hanh-trinh-sau-rieng EN không còn «17,28 tấn»');
    await h.close();
    const bp = await open('brand-passport-learning.html?lang=en', 1280);
    assert.match(await bp.evaluate(() => document.getElementById('lumina-toggle').textContent), /Open Lumina/);
    await bp.close();
    assert.deepEqual(errs, []);
    console.log('dich-en-con-sot: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
