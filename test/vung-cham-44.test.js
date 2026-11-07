/* Vùng chạm ≥ 44 px (rà soát đợt 3, 07/11/2026). Nút tròn, VI/EN ở thanh nav và các nút nhỏ của trang Trường học thuật, trang chủ
 * giữ cỡ nhìn nhưng có lớp chạm vô hình ≥ 44 px. Kiểm bằng elementFromPoint: chạm ở điểm cách tâm 22 px (theo chiều thiếu) vẫn
 * trúng đúng nút. Chân trang: logo và nút Google Play cao ≥ 44 px. Gợi ý ngôn ngữ: hai nút ≥ 44 px. Không tràn ngang ở 360 px. */
'use strict';
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };

// Với mỗi phần tử khớp selector: chạm ở tâm ± 21 px theo chiều dọc và ngang (vùng 42–44 px) có trúng phần tử (hoặc con của nó) không
const doVung = (sel, chiDoc) => [...document.querySelectorAll(sel)].filter(e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden').map(e => {
  document.documentElement.style.scrollBehavior = 'auto';   // trang cuộn mượt: đo khi nút đã về chỗ
  e.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
  const b = e.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2;
  const trung = (x, y) => { const t = document.elementFromPoint(x, y); return !!t && (t === e || e.contains(t)); };
  const doc = b.height >= 44 || (trung(cx, cy - 21) && trung(cx, cy + 21));
  const ngang = chiDoc || b.width >= 44 || (trung(cx - 21, cy) && trung(cx + 21, cy));
  return { ok: doc && ngang, ten: (e.className || e.tagName) + ' ' + Math.round(b.width) + '×' + Math.round(b.height) };
});

(async () => {
  const b = await chromium.launch();
  async function trang(u, w, cacSel) {
    const p = await b.newPage({ viewport: { width: w, height: 844 } });
    await p.route(/googleapis|gstatic|goatcounter|gc\.zgo|\.mp3|\.mp4|\.glb/, r => r.abort());
    await p.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
    await p.goto(BASE + '/' + u, { waitUntil: 'load' }); await p.waitForTimeout(600);
    for (const sel of cacSel) {
      // VI/EN nằm sát nhau: chỉ đòi 44 px theo chiều dọc (chiều ngang giữ nguyên để hai nút không giành vùng chạm)
      const chiDoc = sel.includes('cn-lang');
      const kq = await p.evaluate(`(${doVung})(${JSON.stringify(sel)}, ${chiDoc})`);
      const hong = kq.filter(k => !k.ok).map(k => k.ten);
      check(kq.length > 0 && !hong.length, `${w}px ${u} ${sel}: ${kq.length} nút, vùng chạm ≥ 44 px ${hong.length ? '— hỏng: ' + hong.slice(0, 3).join(', ') : ''}`);
    }
    const tran = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(tran <= 0, `${w}px ${u}: không tràn ngang (${tran})`);
    await p.close();
  }
  try {
    for (const w of [360, 390]) {
      await trang('index.html', w, ['#clay-nav .cn-theme', '#clay-nav .cn-lang button', '.hp-tool-links a', '.hp-alt a']);
      await trang('truong-hoc-thuat.html', w, ['.af-copy', '.af-codes button', '.af-tabs button']);
    }
    // Chân trang: logo và nút Google Play cao ≥ 44 px
    const p = await b.newPage({ viewport: { width: 390, height: 844 } });
    await p.route(/googleapis|gstatic|goatcounter|gc\.zgo|\.mp3|\.mp4/, r => r.abort());
    await p.goto(BASE + '/universe.html', { waitUntil: 'load' }); await p.waitForTimeout(600);
    const h = await p.evaluate(() => ['#clay-footer .cf-logo', '#clay-footer .cf-gp'].map(s => { const e = document.querySelector(s); return e ? e.getBoundingClientRect().height : 0; }));
    check(h.every(x => x >= 44), 'chân trang: logo và nút Google Play cao ≥ 44 px (' + h.map(Math.round).join(', ') + ')');
    // Gợi ý «Xem bằng tiếng Việt?» (máy tiếng Anh, lần đầu): hai nút ≥ 44 px
    const c = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-US' }); const q = await c.newPage();
    await q.route(/googleapis|gstatic|goatcounter|gc\.zgo|\.mp3|\.mp4/, r => r.abort());
    await q.goto(BASE + '/universe.html', { waitUntil: 'load' }); await q.waitForSelector('#bz-lang-hint .go', { timeout: 10000 }).catch(() => {});
    const g = await q.evaluate(() => ['#bz-lang-hint .go', '#bz-lang-hint .x'].map(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return Math.min(r.width, r.height); }));
    check(g.every(x => x !== null && x >= 44), 'gợi ý ngôn ngữ: nút «Tiếng Việt» và nút đóng ≥ 44 px (' + g.join(', ') + ')');
    await c.close();
  } catch (e) { check(false, 'lỗi khi chạy: ' + e.message); }
  await b.close();
  if (fails) { console.log('vung-cham-44: ' + fails + ' lỗi'); process.exit(1); }
  console.log('vung-cham-44: ok');
})();
