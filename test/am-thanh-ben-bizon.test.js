/* Âm thanh Bến BizOn (hub-3d.html, 26/11/2026): bước chân, gió, chim hót, nước vỗ bến – tổng hợp bằng Web Audio trong
 * js/ben-bizon-am-thanh.js, không tải tệp, không gọi mạng. Kiểm:
 * - tĩnh: mô-đun không có URL hay tệp âm thanh, không new Audio(); nút #bb-am là button có type, aria-pressed, nhãn VI/EN;
 *   ben-bizon.js gọi am.batDau() khi chọn vai (thao tác của người chơi), am.capNhat() mỗi khung, am.tamDung() khi thoát / ẩn trang;
 *   sw.js nạp sẵn mô-đun;
 * - trình duyệt: chọn vai → âm thanh chạy; đi bộ → có tiếng bước chân, đứng yên → không thêm; bấm 🔊 → tắt, đi tiếp không có bước;
 *   lựa chọn nhớ sau khi tải lại; thoát → ngừng phát; không lỗi JS, không gọi mạng ra ngoài. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';

const mod = R('js/ben-bizon-am-thanh.js'), ben = R('js/ben-bizon.js'), hub = R('hub-3d.html');
assert.doesNotMatch(mod, /https?:\/\/|\.mp3|\.wav|\.ogg|new Audio\(|fetch\(/, 'mô-đun âm thanh không tải tệp, không gọi mạng');
assert.match(mod, /createBiquadFilter/, 'tổng hợp bằng Web Audio');
assert.match(hub, /<button type="button" id="bb-am" aria-pressed="true" aria-label="Tiếng bến sông" data-en-aria="River sounds"/, 'nút #bb-am có type, aria-pressed, nhãn VI/EN');
assert.ok(ben.includes("import { taoAmThanh } from './ben-bizon-am-thanh.js';"), 'ben-bizon.js nạp mô-đun');
assert.ok(/stage\.focus\([^)]*\)[^\n]*\n\s*am\.batDau\(\);/.test(ben), 'bật âm thanh ngay sau khi chọn vai (thao tác của người chơi)');
assert.ok(ben.includes('am.capNhat(dt, s.speed)') && /function thoat\(\)[\s\S]{0,300}am\.tamDung\(\)/.test(ben), 'bước chân theo tốc độ; thoát thì tạm dừng');
assert.ok(/document\.hidden\)[^}]*am\.tamDung\(\)/.test(ben), 'ẩn trang thì tạm dừng');
const sw = R('sw.js');
assert.ok(sw.includes("'./js/ben-bizon-am-thanh.js'") && +(sw.match(/bizon-v(\d+)/) || [])[1] >= 1012, 'sw.js nạp sẵn mô-đun, tăng phiên bản');

let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('am-thanh-ben-bizon: cần playwright'); process.exit(1); }
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=user-gesture-required'] }); let fails = 0;
  const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
  const ctx = await b.newContext({ viewport: { width: 1100, height: 760 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
  const ngoai = [];
  await ctx.route('**/*', r => { const u = r.request().url(); if (!u.startsWith(BASE) && !u.startsWith('data:') && !u.startsWith('blob:')) { ngoai.push(u); return r.abort(); } return r.continue(); });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  const until = async (fn, ms = 60000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await pg.evaluate(fn).catch(() => false)) return true; await pg.waitForTimeout(250); } return false; };
  const am = () => pg.evaluate(() => window.__benBizon.amThanh());
  const di = async (ms) => { await pg.keyboard.down('KeyW'); await pg.waitForTimeout(ms); await pg.keyboard.up('KeyW'); await pg.waitForTimeout(300); };

  await pg.goto(BASE + '/hub-3d.html', { waitUntil: 'load' });
  await pg.click('#bb-pick [data-vai="ceo"]');
  ok(await until(() => window.__benBizon && window.__benBizon.state().ready, 90000), 'vào bến');
  let t = await am();
  ok(t.coHoTro && t.bat, 'mặc định bật tiếng bến sông');
  ok(await until(() => window.__benBizon.amThanh().chay, 8000), 'âm thanh chạy sau khi chọn vai');
  ok(await pg.getAttribute('#bb-am', 'aria-pressed') === 'true', 'nút 🔊 ở trạng thái bật');
  const b0 = (await am()).soBuoc;
  await di(5000);   // trình duyệt không màn hình chạy ít khung hình (dt tối đa 0,05 s): ~0,55 m mỗi giây thật
  const b1 = (await am()).soBuoc;
  ok(b1 - b0 >= 2, 'đi bộ có tiếng bước chân (' + (b1 - b0) + ' bước)');
  await pg.waitForTimeout(1500);
  ok((await am()).soBuoc === b1, 'đứng yên thì không thêm bước');
  await pg.click('#bb-am');
  t = await am();
  ok(!t.bat && await pg.getAttribute('#bb-am', 'aria-pressed') === 'false', 'bấm 🔊: tắt, aria-pressed = false');
  ok(/tắt tiếng bến sông/.test(await pg.textContent('#bb-note')), 'báo đã tắt');
  await di(1500);
  ok((await am()).soBuoc === b1, 'đã tắt thì không có tiếng bước chân');
  await pg.reload({ waitUntil: 'load' });
  await pg.click('#bb-pick [data-vai="ceo"]'); await until(() => window.__benBizon && window.__benBizon.state().ready, 90000);
  ok(!(await am()).bat && await pg.getAttribute('#bb-am', 'aria-pressed') === 'false', 'nhớ lựa chọn tắt sau khi tải lại');
  await pg.click('#bb-am');
  ok(await until(() => window.__benBizon.amThanh().chay, 8000), 'bật lại: âm thanh chạy');
  await pg.click('#bb-exit');
  ok(await until(() => !window.__benBizon.amThanh().chay, 5000), 'thoát: ngừng phát');
  ok(!errs.length, 'không lỗi JS' + (errs.length ? ': ' + errs[0] : ''));
  ok(!ngoai.length, 'không gọi mạng ra ngoài' + (ngoai.length ? ': ' + ngoai[0] : ''));
  await b.close();
  if (fails) { console.error('am-thanh-ben-bizon: ' + fails + ' lỗi'); process.exit(1); }
  console.log('am-thanh-ben-bizon: ok');
})().catch(e => { console.error(e); process.exit(1); });
