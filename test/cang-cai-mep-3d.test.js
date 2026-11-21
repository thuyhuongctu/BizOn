/* Bật Nghiệp 3D: khu Cảng Cái Mép – Thị Vải (specs/005-cang-cai-mep, câu chuyện 1).
 * Kiểm tra: mô-đun riêng js/cang-cai-mep-3d.js không chạm luật chơi; trang 3D chỉ thêm import, lời gọi và một nút ZONES;
 * nút «🚢 Cảng Cái Mép» bay máy quay tới cảng; 5 điểm chạm mở đúng 5 thẻ kiến thức VI/EN, đổi ngôn ngữ thì thẻ vẽ lại;
 * nút đóng ≥ 44 px; không tràn ngang ở 390 px; không lỗi JS. Câu chuyện 2: vụ 5 thẻ hải quan có nút «Ra quyết định»
 * mở ô lựa chọn ở cảng (js/cang-cai-mep.js). Cần máy chủ tĩnh BIZON_URL. */
'use strict';
const path = require('path');
const fs = require('fs');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium;
try { chromium = require('playwright').chromium; } catch (e) {
  try { chromium = require('playwright-core').chromium; } catch (e2) { console.error('Cần playwright'); process.exit(1); }
}
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// Tĩnh: mô-đun có mặt, không đụng luật chơi; trang 3D gắn đúng ba chỗ; sw.js lưu sẵn mô-đun.
const modPath = path.join(ROOT, 'js', 'cang-cai-mep-3d.js');
check(fs.existsSync(modPath), 'có js/cang-cai-mep-3d.js');
const mod = fs.existsSync(modPath) ? read('js/cang-cai-mep-3d.js') : '';
check(/export function buildPort\(/.test(mod), 'mô-đun xuất buildPort(ctx)');
check(!/simulateRound|currentEvent|\bev\(|W\.eval|localStorage\.setItem/.test(mod), 'mô-đun không chạm luật chơi hay ván lưu (câu chuyện 1 không đổi số)');
check((mod.match(/key: '(crane|ship|yard|customs|jam)'/g) || []).length === 5, 'mô-đun có đúng 5 thẻ kiến thức');
check(/24\.188 TEU/.test(mod) && /24,188 TEU/.test(mod) && /FOB/.test(mod) && /CIF/.test(mod) && /C\/O/.test(mod), 'thẻ có số liệu cảng và Incoterms, hồ sơ C/O (VI/EN)');
const page = read('BizOn Game 3D.html');
check(/import \{ buildPort \} from '\.\/js\/cang-cai-mep-3d\.js';/.test(page), 'trang 3D nhập buildPort');
check((page.match(/buildPort\(/g) || []).length === 1, 'trang 3D gọi buildPort đúng một lần');
check(/\[\['🚢 Cảng Cái Mép', '🚢 Cái Mép Port'\]/.test(page), 'ZONES có nút «🚢 Cảng Cái Mép»');
// Câu chuyện 2 (PR luật cảng): game.html chỉ nạp mô-đun luật js/cang-cai-mep.js, không nạp khu cảng 3D; engine.js không đổi.
check(!/cang-cai-mep-3d/.test(read('game.html')) && !/cang-cai-mep/.test(read('js/engine.js')), 'game.html không nạp khu cảng 3D, engine.js không đổi');
check(/'\.\/js\/cang-cai-mep-3d\.js'/.test(read('sw.js')), 'sw.js lưu sẵn js/cang-cai-mep-3d.js');

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    for (const [lang, w, h] of [['vi', 390, 844], ['en', 1280, 860]]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block' });
      const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
      await page.addInitScript(l => { try { localStorage.clear(); localStorage.setItem('bizon-lang', l); localStorage.setItem('bizon-tour-seen', '1'); } catch (e) {} }, lang);
      await page.route(/\.(woff2?|mp3|m4a|mp4|glb)(\?|$)/, r => r.abort());
      await page.goto(BASE + '/BizOn%20Game%203D.html?diorama=1', { waitUntil: 'commit', timeout: 60000 });
      await page.waitForFunction(() => window.__caiMep && window.__caiMep.port, null, { timeout: 90000 });
      // Qua màn đăng nhập bằng «Chơi thử với Đội Demo» (dữ liệu chỉ ở máy), chờ trụ sở hiện.
      await page.waitForFunction(() => document.body.classList.contains('login3d'), null, { timeout: 45000 }).catch(() => {});
      for (let i = 0; i < 40 && await page.evaluate(() => document.body.classList.contains('login3d')); i++) { await page.evaluate(() => { const d = document.getElementById('l3Demo'); d && d.click(); }); await page.waitForTimeout(1000); }
      await page.waitForTimeout(1500);
      const zone = await page.evaluate(() => { const b = [...document.querySelectorAll('#zones button')].find(x => /Cái Mép/.test(x.textContent)); return b ? b.textContent : ''; });
      check(lang === 'vi' ? /🚢 Cảng Cái Mép/.test(zone) : /🚢 Cái Mép Port/.test(zone), lang + ': có nút ZONES «' + zone + '»');
      await page.evaluate(() => { const b = [...document.querySelectorAll('#zones button')].find(x => /Cái Mép/.test(x.textContent)); b && b.click(); });
      await page.waitForTimeout(2600);
      const fly = await page.evaluate(() => { const K = window.__caiMep; let n = 0;
        for (const k of K.keys) { const o = K.hits[k], v = o.getWorldPosition(new o.position.constructor()); v.project(K.camera); if (Math.abs(v.x) < 1 && Math.abs(v.y) < 1 && v.z < 1) n++; }
        return n; });
      check(fly >= 2, lang + ': máy quay bay tới cảng (' + fly + '/5 điểm chạm trong khung hình)');
      const r = await page.evaluate(() => {
        const K = window.__caiMep, out = [];
        for (const k of K.keys) { K.open(k); const c = document.getElementById('cmCard'); out.push({ k, shown: !!c && !c.hidden, title: (c.querySelector('h4') || {}).textContent || '', len: c.textContent.length }); }
        const c = document.getElementById('cmCard'), x = c.querySelector('button'), rb = x.getBoundingClientRect(), rc = c.getBoundingClientRect();
        return { cls: document.body.className, out, keys: K.keys.length, closeW: rb.width, closeH: rb.height, cardIn: rc.left >= 0 && rc.right <= innerWidth + 1, cardL: Math.round(rc.left), cardR: Math.round(rc.right), over: document.documentElement.scrollWidth - innerWidth };
      });
      check(r.keys === 5 && r.out.every(o => o.shown && o.title && o.len > 120), lang + ': 5 điểm chạm mở 5 thẻ có nội dung (' + r.out.map(o => o.k).join(', ') + ')');
      check(lang === 'vi' ? r.out.some(o => /Hải quan/.test(o.title)) && r.out.some(o => /Khi cảng tắc/.test(o.title)) : r.out.some(o => /Customs/.test(o.title)) && r.out.some(o => /congested/i.test(o.title)), lang + ': tiêu đề thẻ đúng ngôn ngữ');
      check(r.closeW >= 44 && r.closeH >= 44, lang + ': nút đóng ≥ 44 px (' + Math.round(r.closeW) + '×' + Math.round(r.closeH) + ', body: ' + r.cls + ')');
      check(r.cardIn && r.over <= 1, lang + ': thẻ nằm trong màn hình, không tràn ngang (tràn ' + r.over + ' px, thẻ ' + r.cardL + '–' + r.cardR + ')');
            // Chạm thật vào điểm gần giữa màn hình nhất (chiếu ra màn hình rồi bấm) → mở đúng thẻ của điểm đó.
      const pt = await page.evaluate(() => { const K = window.__caiMep; let best = null;
        for (const k of K.keys) { const o = K.hits[k], v = o.getWorldPosition(new o.position.constructor()); v.project(K.camera);
          const p = { k, x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight, d: Math.hypot(v.x, v.y) };
          if (p.x > 10 && p.x < innerWidth - 10 && p.y > 60 && p.y < innerHeight - 120 && (!best || p.d < best.d)) best = p; }
        return best || { k: '-', x: 0, y: 0 }; });
      await page.evaluate(() => window.__caiMep.close());
      await page.mouse.click(pt.x, pt.y); await page.waitForTimeout(300);
      const tapped = await page.evaluate(p => { const c = document.getElementById('cmCard'); if (c && !c.hidden) return c.dataset.k; const el = document.elementFromPoint(p.x, p.y); return 'không mở; dưới ngón tay: ' + (el ? el.tagName + '#' + el.id + '.' + el.className : '-') + ' @' + Math.round(p.x) + ',' + Math.round(p.y); }, pt);
      check(pt.k !== '-' && tapped === pt.k, lang + ': chạm vào «' + pt.k + '» mở đúng thẻ (' + tapped + ')');
      // Đổi ngôn ngữ khi thẻ đang mở: thẻ vẽ lại bằng ngôn ngữ mới, không đóng.
      const relang = await page.evaluate(() => { const K = window.__caiMep; K.open('customs'); const before = document.querySelector('#cmCard h4').textContent;
        try { localStorage.setItem('bizon-lang', localStorage.getItem('bizon-lang') === 'en' ? 'vi' : 'en'); } catch (e) {} K.relang();
        const c = document.getElementById('cmCard'); return { before, after: c.querySelector('h4').textContent, open: !c.hidden }; });
      check(relang.open && relang.before !== relang.after, lang + ': đổi ngôn ngữ thì thẻ vẽ lại (' + relang.before + ' → ' + relang.after + ')');
      // Câu chuyện 2: thẻ hải quan chỉ có nút «Ra quyết định» ở vụ 5; bấm thì mở bảng Quyết định tới ô lựa chọn ở cảng.
      const go1 = await page.evaluate(() => { window.__caiMep.open('customs'); return !!document.querySelector('#cmCard .cm-go'); });
      check(!go1, lang + ': vụ 1 thẻ hải quan không có nút «Ra quyết định»');
      const go5 = await page.evaluate(() => { const w = document.getElementById('gf').contentWindow; w.eval('S.round = 5; S.caseId = "A"; S.committed = false; S.finished = false');
        window.__caiMep.open('customs'); const b = document.querySelector('#cmCard .cm-go'); if (!b) return { has: false };
        const r = b.getBoundingClientRect(); b.click(); return { has: true, h: r.height, text: b.textContent }; });
      check(go5.has && go5.h >= 44, lang + ': vụ 5 thẻ hải quan có nút «Ra quyết định» ≥ 44 px (' + (go5.text || '') + ')');
      await page.waitForTimeout(900);
      const dec = await page.evaluate(() => { const d = document.getElementById('gf').contentWindow.document, tab = d.getElementById('tab-decisions'), box = d.getElementById('bz-port');
        return { tab: !!tab && tab.classList.contains('active'), box: !!box && !box.hidden, card: !document.getElementById('cmCard').hidden }; });
      check(dec.tab && dec.box && !dec.card, lang + ': bấm nút thì đóng thẻ, mở tab Quyết định có ô «Xử lý hàng kẹt ở Cái Mép» (' + JSON.stringify(dec) + ')');
      check(errors.length === 0, lang + ': không lỗi JS (' + errors.slice(0, 2).join(' | ') + ')');
      await ctx.close();
    }
  } catch (e) { check(false, 'lỗi khi chạy: ' + e.message); }
  await browser.close();
  console.log(fails ? `\n${fails} kiểm tra hỏng` : '\ncang-cai-mep-3d: ok'); process.exit(fails ? 1 : 0);
})();
