/* Bến Phù Sa: ô «Mã lớp» ở màn nộp bài tự điền từ ?lop= (23/11/2026). Trang «Vào lớp» ghép ?lop=MÃ vào đường dẫn game, nhưng trước
 * đây màn nộp bài chỉ điền mã đã nộp lần trước, nên sinh viên vào từ đường dẫn lớp gặp ô trống (production chưa có ván Bến Phù Sa nào
 * được nộp). Chơi thật bản ben-phu-sa.html (có lối test window.ftTest): có ?lop= thì ô điền đúng mã (chữ hoa); không có ?lop= thì vẫn
 * điền mã đã nộp lần trước; mã sai dạng trên đường dẫn thì bỏ qua. Bản 3D và v8 không có lối test: kiểm cùng một dòng điền mã. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const DONG = read('ben-phu-sa.html').split('\n').find(l => l.includes("BizOnLive.classFor('bps')"));
for (const t of ['ben-phu-sa-3d.html', 'ben-phu-sa-v8.html']) check(!!DONG && read(t).includes(DONG), t + ': cùng dòng điền mã lớp từ ?lop= như bản 2D');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 961, 'sw.js ≥ bizon-v961');
(async () => {
  const b = await chromium.launch();
  async function maLop(trang, query, daNop) {
    const ctx = await b.newContext({ viewport: { width: 1000, height: 800 } });
    await ctx.addInitScript(m => { try { localStorage.clear(); localStorage.setItem('bizon-lang', 'vi'); localStorage.setItem('bizon-bps-tour-seen', '1'); if (m) localStorage.setItem('bps-class', m); } catch (e) {} }, daNop || '');
    await ctx.route(/googleapis|gstatic|goatcounter|\.mp3|\.mp4/, r => r.abort());
    await ctx.route('**/rest/v1/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: 'null' }));
    const pg = await ctx.newPage();
    await pg.goto(BASE + '/' + trang + query, { waitUntil: 'commit', timeout: 60000 });
    await pg.waitForFunction(() => !!window.ftTest, null, { timeout: 60000 });
    await pg.evaluate(() => { window.ftTeam(0); window.ftStart(); });
    for (let w = 0; w < 5; w++) {
      await pg.evaluate(() => { window.ftPick('menu', 0); window.ftPick('loc', 2); window.ftPick('m', 1); window.ftCommit(); });
      await pg.waitForTimeout(150);
      if (await pg.evaluate(() => window.ftTest.phase() === 'ritual')) await pg.evaluate(() => window.ftRitualNext(true));
    }
    await pg.waitForFunction(() => window.ftTest.phase() === 'end', null, { timeout: 15000 });
    const v = await pg.evaluate(() => document.getElementById('ft-class').value);
    await ctx.close(); return v;
  }
  try {
    for (const t of ['ben-phu-sa.html']) {
      let v = await maLop(t, '?lop=qtkd-2026-a');
      check(v === 'QTKD-2026-A', t + ': có ?lop= thì ô Mã lớp điền sẵn «' + v + '»');
      v = await maLop(t, '', 'KT-CU');
      check(v === 'KT-CU', t + ': không có ?lop= thì vẫn điền mã đã nộp lần trước «' + v + '»');
      v = await maLop(t, '?lop=%3Cb%3E', 'KT-CU');
      check(v === 'KT-CU', t + ': mã sai dạng trên đường dẫn bị bỏ qua «' + v + '»');
    }
  } catch (e) { console.error(e); fails++; }
  await b.close();
  console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\nbps-ma-lop-tu-duong-dan: ok');
  process.exit(fails ? 1 : 0);
})();
