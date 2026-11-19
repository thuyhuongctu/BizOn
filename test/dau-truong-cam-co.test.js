/* Bật Nghiệp 3D («BizOn Game 3D.html», 19/11/2026): chị gửi ảnh điện thoại màn «Đấu trường» cuối vòng – bục và tên đội hai bên
 * bị cắt mép màn, bản đồ và lá cờ quá nhỏ; ảnh minh hoạ trong thẻ Lumina bị cắt. Kiểm:
 * - camera ôm vừa nội dung: ở 390×844, 360×740 (EN) và 1280×800 cả 4 bục, nhân vật và biển tên đều nằm trong màn, biển tên không
 *   chồng nhau, không lấn tiêu đề và khung kết luận; nút «Xem kết quả chi tiết» hiện và bấm được;
 * - khoảnh khắc cắm cờ: camera tiến về tỉnh, cờ rơi đúng chốt tỉnh, tung đất sét, vương miện hiện; đội dẫn đầu không nhảy trên bục;
 * - giảm chuyển động (prefers-reduced-motion): hiện ngay cảnh cuối, không tung đất sét;
 * - ảnh minh hoạ thẻ Lumina hiện trọn khung (không cắt chiều cao cố định); sw.js ≥ bizon-v907. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const g = read('BizOn Game 3D.html');
const arena = g.slice(g.indexOf('// ================= ĐẤU TRƯỜNG 3D'), g.indexOf('// ================= PHÒNG 3D (2)'));

check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 907, 'sw.js ≥ bizon-v907');
check(/prefers-reduced-motion: reduce/.test(arena), 'đấu trường tôn trọng prefers-reduced-motion');
check(/window\.__arenaState = /.test(arena) && /window\.__arenaHold = /.test(arena), 'có móc kiểm thử __arenaState/__arenaHold');
check(!/p\.ch\.position\.y \+= Math\.abs/.test(arena), 'đội dẫn đầu không nhảy trên bục');
{ const at = /const AT = \{[^}]*\bshow: ([\d.]+)[^}]*\}/.exec(arena); check(!!at && +at[1] <= 4, 'khung kết luận hiện trong ≤ 4 giây (AT.show = ' + (at && at[1]) + ')'); }
check(/#evc \.pic\{[^}]*aspect-ratio:1100\/614;object-fit:contain/.test(g) && !/#evc \.pic\{[^}]*height:118px/.test(g), 'ảnh thẻ Lumina hiện trọn khung (không cắt cao 118px)');
// Ai được cờ vẫn như cũ: cờ mới theo cur.win / cur.winner
check(/const winKey = cur\.win \? 'star' : KEY_OF\[cur\.winner\] \|\|/.test(arena), 'luật cờ giữ nguyên (cur.win, cur.winner)');

const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const URL = BASE + '/BizOn%20Game%203D.html?diorama=1';
const until = (pg, fn, arg, timeout = 90000) => pg.waitForFunction(fn, arg, { timeout, polling: 250 }).then(() => true, () => false);
const inside = (r, w, h) => r.left >= 0 && r.top >= 0 && r.right <= w && r.bottom <= h;
const cut = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

async function openArena(b, { w, h, lang, round, win, reduce }) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: reduce ? 'reduce' : 'no-preference' });
  await ctx.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
  const pg = await ctx.newPage(); const loi = []; pg.on('pageerror', e => loi.push(e.message));
  await pg.goto(URL, { waitUntil: 'load' });
  const ok = await until(pg, () => {
    if (document.body.classList.contains('login3d')) { const d = document.getElementById('l3Demo'); if (d) d.click(); }
    const W = document.getElementById('gf').contentWindow;
    return !!(W && W.__bridged && W.showArena && W.eval('typeof S!=="undefined"&&!!S&&!!S.competitors&&S.competitors.length===3'));
  });
  if (!ok) return { ctx, pg, loi, ok };
  await pg.waitForTimeout(2500);
  await pg.evaluate(([round, win]) => {
    const W = document.getElementById('gf').contentWindow;
    // ván giả: các vòng trước xen kẽ thắng/thua; vòng này đội bạn dẫn thị phần (win) hoặc Alpha Dynamics dẫn
    W.eval(`S.profile.teamName='Đội Claymorphism Siêu Dài Tên';S.competitors.forEach((c,i)=>c.share=[${win ? '24,22,18' : '33,20,15'}][i]);
      S.conquest=Array.from({length:${round}},(_, i)=>i<${round - 1}?(i%2?{round:i+1,win:true,hasTopShare:true,winner:S.profile.teamName}:{round:i+1,win:false,hasTopShare:false,winner:S.competitors[0].name}):{round:i+1,win:${win},hasTopShare:${win},winner:${win} ? S.profile.teamName : S.competitors[0].name});`);
    window.__xong = false;
    W.showArena({ round, share: win ? 36 : 32, demandUnits: 3000, event: { icon: '⛅', name: 'Thị trường ổn định' } }, () => { window.__xong = true; });
  }, [round, win]);
  return { ctx, pg, loi, ok };
}

async function endChecks(pg, w, h, tag) {
  const s = await pg.evaluate(() => window.__arenaState());
  check(s && s.on && s.shown && s.landed && s.crown, tag + ': cảnh cuối – cờ đã cắm, vương miện hiện, khung kết luận hiện');
  check(s.labs.every(r => inside(r, w, h)), tag + ': 4 biển tên nằm trọn trong màn');
  check(s.labs.every((a, i) => s.labs.every((b2, j) => i >= j || !cut(a, b2))), tag + ': biển tên không chồng nhau');
  check(s.chars.every(c => [c.feet, c.head].every(p => p.x >= 0 && p.x <= w && p.y >= 0 && p.y <= h)), tag + ': 4 nhân vật (đầu và chân) nằm trong màn');
  check(Math.hypot(s.flag.x - s.pin.x, s.flag.z - s.pin.z) < 0.01 && Math.abs(s.flag.y - s.pin.y) < 0.05, tag + ': cờ mới cắm đúng chốt tỉnh');
  check(s.flag.scr.x >= 0 && s.flag.scr.x <= w && s.flag.scr.y >= 0 && s.flag.scr.y <= h, tag + ': chốt tỉnh có cờ nằm trong màn');
  const L = await pg.evaluate(() => {
    const r = el => { const b = el.getBoundingClientRect(); return { left: b.left, right: b.right, top: b.top, bottom: b.bottom }; };
    const n = document.getElementById('aNext'), nb = n.getBoundingClientRect(), hit = document.elementFromPoint(nb.left + nb.width / 2, nb.top + nb.height / 2);
    return { head: r(document.querySelector('#arena .ah')), foot: r(document.getElementById('aFoot')), next: r(n), hitOk: !!hit && (hit === n || n.contains(hit)), footOn: document.getElementById('aFoot').classList.contains('on'), op: getComputedStyle(document.getElementById('aFoot')).opacity };
  });
  check(L.footOn && L.hitOk && inside(L.next, w, h), tag + ': nút «Xem kết quả chi tiết» hiện, nằm trong màn và không bị che');
  check(s.labs.every(r => r.bottom <= L.foot.top + 1) && s.chars.every(c => c.feet.y <= L.foot.top), tag + ': khung kết luận không đè lên bục và biển tên');
  check(s.chars.every(c => c.head.y >= L.head.bottom - 2), tag + ': tiêu đề không đè lên nhân vật');
  return s;
}

(async () => {
  const b = await chromium.launch({ args: ARGS });
  try {
    for (const cfg of [{ w: 390, h: 844, lang: 'vi', round: 1, win: true }, { w: 1280, h: 800, lang: 'vi', round: 3, win: false }, { w: 360, h: 740, lang: 'en', round: 6, win: false }]) {
      const tag = `${cfg.w}×${cfg.h} ${cfg.lang.toUpperCase()} vòng ${cfg.round}`;
      const { ctx, pg, loi, ok } = await openArena(b, cfg);
      check(ok, tag + ': vào được Đội Demo');
      if (ok) {
        // giữ cảnh ở giây 2,95 (cờ vừa chạm): camera đã tiến về tỉnh, đất sét đang tung
        check(await until(pg, () => window.__arenaState && window.__arenaState() && window.__arenaState().k > 0.5, null, 60000), tag + ': đấu trường mở');
        await pg.evaluate(() => window.__arenaHold(2.95)); await pg.waitForTimeout(800);
        const m = await pg.evaluate(() => window.__arenaState());
        check(m.landed && m.flag.scr.x > cfg.w * 0.15 && m.flag.scr.x < cfg.w * 0.85 && m.flag.scr.y > 0 && m.flag.scr.y < cfg.h, tag + ': lúc cắm cờ, camera đưa chốt tỉnh vào giữa màn');
        await pg.evaluate(() => window.__arenaHold(null));
        check(await until(pg, () => { const s = window.__arenaState(); return s && s.shown && s.k > 4.3; }, null, 60000), tag + ': chuỗi cắm cờ xong, khung kết luận hiện');
        await pg.waitForTimeout(400);
        await endChecks(pg, cfg.w, cfg.h, tag);
        await pg.click('#aNext');
        check(await until(pg, () => window.__xong === true && !document.body.classList.contains('arena'), null, 10000), tag + ': bấm nút thì sang kết quả chi tiết');
      }
      check(loi.length === 0, tag + ': không lỗi trang' + (loi[0] ? ': ' + loi[0] : ''));
      await ctx.close();
    }
    // Giảm chuyển động: hiện ngay cảnh cuối
    { const tag = '390×844 giảm chuyển động';
      const { ctx, pg, loi, ok } = await openArena(b, { w: 390, h: 844, lang: 'vi', round: 2, win: true, reduce: true });
      check(ok, tag + ': vào được Đội Demo');
      if (ok) {
        check(await until(pg, () => { const s = window.__arenaState && window.__arenaState(); return s && s.on && s.shown; }, null, 15000), tag + ': khung kết luận hiện ngay');
        const s = await pg.evaluate(() => window.__arenaState());
        check(s.rm && s.landed && s.k > 5, tag + ': bỏ qua chuyển động, cờ đã cắm sẵn');
        await endChecks(pg, 390, 844, tag);
      }
      check(loi.length === 0, tag + ': không lỗi trang' + (loi[0] ? ': ' + loi[0] : ''));
      await ctx.close(); }
  } catch (e) { console.error(e); fails++; }
  await b.close();
  console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\ndau-truong-cam-co: ok');
  process.exit(fails ? 1 : 0);
})();
