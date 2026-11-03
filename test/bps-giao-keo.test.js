// Bến Phù Sa 3D · «Ký giao kèo đầu vụ» (03/11/2026): trước tuần 1 đội tự đặt mục tiêu lợi nhuận, cách đi và một câu giao kèo;
// cuối ván, màn kết quả đặt giao kèo cạnh kết quả thật + câu hỏi phản tư; luôn có dòng «điểm là chỉ số mô phỏng».
// Giao kèo không cộng/trừ điểm, không gửi mạng.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
const GK = require('../js/bps-giao-keo.js');

// ---- 1. Hàm thuần
const t = GK.tiers(20);
assert.deepEqual(t.map(x => x.key), ['safe', 'mid', 'high']);
assert.deepEqual(t.map(x => x.target), [7, 11, 15]);
assert.ok(GK.tiers(1).every((x, i, a) => i === 0 || x.target > a[i - 1].target), 'mức luôn tăng dần kể cả khi trần nhỏ');
assert.equal(GK.classify([]), null);
assert.equal(GK.classify([{ w: 0, m: 0 }, { w: 1, m: 1 }]), 'bold');
assert.equal(GK.classify([{ w: 1, m: 0 }, { w: 0, m: 1 }]), 'scout', 'xếp theo tuần trước khi xét');
assert.equal(GK.classify([{ w: 0, m: 2 }, { w: 1, m: 1 }]), 'small');
const c = GK.compare({ target: 11, plan: 'scout', text: 'Dò <b>trước</b>' }, [{ w: 0, m: 1 }, { w: 1, m: 0 }], 9.46);
assert.equal(c.hit, false); assert.equal(c.gap, -1.5); assert.equal(c.actual, 'scout'); assert.equal(c.samePlan, true); assert.equal(c.text, 'Dò btrước/b');
assert.equal(GK.compare(null, [], 5), null);
// Khối cuối ván: không giao kèo vẫn có dòng chỉ số mô phỏng; có giao kèo thì có bảng th scope + câu phản tư; không lọt HTML
const none = GK.endHtml(null, [], 5, false);
assert.match(none, /chỉ số mô phỏng/); assert.ok(!/<table/.test(none));
const end = GK.endHtml({ target: 11, plan: 'bold', text: '<img src=x onerror=alert(1)>' }, [{ w: 0, m: 1 }], 12, false);
assert.match(end, /<th scope="col">Giao kèo<\/th>/); assert.match(end, /<th scope="row">Mục tiêu<\/th>/);
assert.match(end, /✅ vượt 1 triệu ₫/); assert.match(end, /🔀/); assert.match(end, /Điều gì trên thị trường khiến đội đi khác giao kèo/);
assert.ok(!/<img/.test(end), 'câu giao kèo đã được lọc');
assert.match(GK.endHtml({ target: 11, plan: 'scout' }, [{ w: 0, m: 1 }, { w: 1, m: 0 }], 9, false), /Đội đi đúng cách đã định nhưng chưa tới mục tiêu/);
assert.match(GK.endHtml({ target: 5, plan: 'small' }, [{ w: 0, m: 1 }], 6, true), /Season pact vs what really happened[\s\S]*simulation metrics/);

// ---- 2. Gắn vào trang
const html = read('ben-phu-sa-3d.html');
assert.ok(html.indexOf('<div id="ft-pledge"></div>') < html.indexOf('onclick="ftStart()"'), 'thẻ giao kèo đứng trước nút bắt đầu');
assert.match(html, /<script src="js\/bps-giao-keo\.js"><\/script>\n<script>\n\(function \(\) \{\n  var METHODS/);
assert.match(html, /S\.pledge = window\.BPSGiaoKeo \? BPSGiaoKeo\.read\(\) : null;/);
assert.match(html, /\$\('ft-pledge-end'\)\.innerHTML = BPSGiaoKeo\.endHtml\(S\.pledge, S\.history, S\.total, isEN\(\)\)/);
assert.match(html, /So giao kèo đầu vụ với kết quả/);
assert.ok(!read('js/bps-giao-keo.js').includes('fetch('), 'không gọi mạng');
const sw = read('sw.js');
assert.ok(sw.includes("'./js/bps-giao-keo.js'"));
assert.ok(+sw.match(/bizon-v(\d+)/)[1] >= 757);

// ---- 3. Trình duyệt: ký giao kèo, chơi 5 tuần, xem so sánh
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
  await page.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
  await page.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); localStorage.setItem('bizon-bps-tour-seen', '1'); } catch (e) {} });
  try {
    await page.goto(BASE + '/ben-phu-sa-3d.html', { waitUntil: 'commit', timeout: 60000 });
    await page.waitForFunction(() => !!window.__bps && !!document.querySelector('#ft-pledge .bps-gk'), null, { timeout: 60000 });
    await page.evaluate(() => { document.getElementById('ft-intro').classList.remove('hidden'); });
    const chips = await page.$$eval('#ft-pledge [data-gk-tier] small', els => els.map(e => e.textContent));
    assert.equal(chips.length, 3); assert.ok(chips.every(s => /^≥ [\d,]+ triệu ₫$/.test(s)), chips.join('|'));
    // Chưa ký → không có giao kèo
    assert.equal(await page.evaluate(() => BPSGiaoKeo.read()), null);
    // Màn cổng đăng nhập (Game3DGate) phủ lên màn giới thiệu khi chưa điền: bấm bằng sự kiện DOM
    const tap = sel => page.evaluate(q => document.querySelector(q).click(), sel);
    await tap('#ft-pledge [data-gk-tier="high"]');
    await tap('#ft-pledge [data-gk-plan="bold"]');
    await page.evaluate(() => { const i = document.getElementById('bps-gk-text'); i.value = 'Chạy ghe ngay, không chần chừ'; i.dispatchEvent(new Event('input', { bubbles: true })); });
    await tap('#ft-pledge [data-gk-sign]');
    assert.match(await page.textContent('#ft-pledge [data-gk-sign]'), /Đã ký/);
    // Không tràn ngang ở 390 px
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'không tràn ngang');
    await page.evaluate(() => { window.ftTeam(0); window.ftStart(); });
    const pledge = await page.evaluate(() => window.__bps.S.pledge);
    assert.equal(pledge.tier, 'high'); assert.equal(pledge.plan, 'bold'); assert.equal(pledge.text, 'Chạy ghe ngay, không chần chừ');
    assert.match(await page.textContent('#ft-log'), /Giao kèo đầu vụ/);
    // Chơi bằng gánh hàng rong cả 5 tuần → cách đi thật «small», khác giao kèo
    for (let w = 0; w < 5; w++) {
      await page.evaluate(() => { window.ftPick('menu', 1); window.ftPick('loc', 0); window.ftPick('m', 1); window.ftCommit(); });
      await page.waitForTimeout(120);
      if (await page.evaluate(() => !document.getElementById('ft-ritual').classList.contains('hidden'))) await page.evaluate(() => window.ftRitualNext(true));
    }
    await page.waitForSelector('#ft-pledge-end .bps-gk-end');
    const endTxt = await page.textContent('#ft-pledge-end');
    assert.match(endTxt, /«Chạy ghe ngay, không chần chừ»/);
    assert.match(endTxt, /Chạy ghe ngay từ tuần 1/); assert.match(endTxt, /Đi chắc bằng gánh cả mùa 🔀/);
    assert.match(endTxt, /chỉ số mô phỏng/);
    // Giao kèo không đổi điểm: tổng bằng tổng các tuần đã ghi
    const sums = await page.evaluate(() => { const S = window.__bps.S; return [S.total, S.history.reduce((a, h) => a + h.net, 0) - S.shopSpent]; });
    assert.ok(Math.abs(sums[0] - sums[1]) < 1e-6, 'giao kèo không đổi lợi nhuận');
    // Đổi ngôn ngữ ở màn kết quả vẫn giữ khối so sánh
    await page.evaluate(() => { localStorage.setItem('bizon-lang', 'en'); window.dispatchEvent(new Event('bizon:langchange')); });
    assert.match(await page.textContent('#ft-pledge-end'), /Season pact vs what really happened/);
  } finally { await browser.close(); }
  assert.deepEqual(errors, []);
  console.log('bps-giao-keo: ok');
})().catch(e => { console.error(e); process.exit(1); });
