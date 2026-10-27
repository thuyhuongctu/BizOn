'use strict';
// «Cuốn hộ chiếu» trên trang Hành trình (js/journey-passport.js; tên tệp khác test/journey-passport.test.js của lõi để workflow journey-core không chạy nhầm bộ Playwright này): bìa + ba trang thị thực, tem đóng dần theo bậc đã xong,
// dải «đã đi hết ba bậc», tải PNG 1600×1000, in; biến thể Bậc 3 nói rõ cách hoạt động (không còn «(mặc định)»), thẻ Bậc 3
// nhắc biến thể đã chọn. VI/EN, điện thoại không tràn ngang, không lỗi JS. Cần máy chủ tĩnh (run-tests.mjs tự bật).
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

// --- tĩnh ---
const html = read('hanh-trinh.html'), js = read('js/hanh-trinh.js'), mod = read('js/journey-passport.js'), css = read('css/journey.css');
assert.ok(html.includes('<script src="js/journey-passport.js" defer></script>') && html.indexOf('journey-card.js') < html.indexOf('journey-passport.js') && html.indexOf('journey-passport.js') < html.indexOf('js/hanh-trinh.js'));
assert.ok(html.includes('id="jr-book-box"') && html.includes('id="jr-book"') && html.includes('id="jr-book-png"') && html.includes('id="jr-book-print"'));
assert.ok(html.indexOf('id="jr-book-box"') < html.indexOf('id="jr-carry-box"'), 'cuốn hộ chiếu đứng ngay sau ba thẻ bậc');
assert.ok(!html.includes('(mặc định)') && !html.includes('(default)') && html.includes('id="jr-variant-help"'), 'biến thể: không còn «(mặc định)», có câu giải thích');
assert.ok(js.includes("PB.html(p, { lang: lang() })") && js.includes('PB.png(p, { lang: lang() })') && js.includes("window.print()"));
assert.ok(js.includes("Biến thể đã chọn: ${C.tierName('t3', lang(), variant)}"));
assert.ok(mod.includes('root.BizOnJourneyPassport = Object.freeze({ html, lines, draw, png, fileName, doneCount })'));
assert.ok(css.includes('.jp-book{') && css.includes('.jp-stamp{') && css.includes('@media print{') && css.includes('.jr-box:not(#jr-book-box)'));
assert.ok(read('sw.js').includes("'./js/journey-passport.js'") && +(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 689, 'sw.js precache journey-passport.js và từ bizon-v689 trở lên');
assert.doesNotMatch(html, /[ \t]+$/m, 'không khoảng trắng cuối dòng');
// mô-đun chạy được trong Node với lõi thật
{ const vm = require('node:vm'); const g = { console }; g.window = g; g.self = g; const ctx = vm.createContext(g);
  for (const f of ['js/core/journey.js', 'js/journey-card.js', 'js/journey-passport.js']) vm.runInContext(read(f), ctx, { filename: f });
  const J = g.BizOnJourney, PB = g.BizOnJourneyPassport; assert.ok(PB, 'mô-đun không gắn vào window');
  let p = J.createPassport({ teamName: 'Đội Thử', variant: 'brand' });
  assert.equal(PB.doneCount(p), 0); assert.equal(JSON.stringify(PB.lines(p, 't1', 'vi')), '[]');   // mảng khác realm (vm) → so sánh qua JSON
  const h0 = PB.html(p, { lang: 'vi' }); assert.ok(h0.includes('class="jp-book" data-done="0"') && (h0.match(/class="jp-page"/g) || []).length === 3 && h0.includes('jp-empty') && !h0.includes('jp-ribbon'));
  assert.ok(h0.includes('data-tier="t1" data-status="open"') && h0.includes('data-tier="t3" data-status="locked"') && h0.includes('Hộ Chiếu Thương Hiệu'));
  p = J.recordTier1(p, { total: 4, result: { eff: 70, rank: 1 }, history: [{ w: 1, m: 0 }], knownPairs: ['0-1'] }, { finishedAt: '2026-10-27T03:00:00Z' });
  assert.equal(JSON.stringify(PB.lines(p, 't1', 'en')), JSON.stringify(['Efficiency 70/100 · rank 1/4', '1 dish–place pairs learnt']));
  p = J.recordTier2(p, { balance: 500, history: [{ netProfit: 1, share: 30 }], brand: 1.2, caseId: 'A' });
  p = J.recordTier3(p, 'brand', { total: 55, entered: [1, null, 2], cash: 9, rep: 60 });
  const h3 = PB.html(p, { lang: 'en' }); assert.ok(h3.includes('data-done="3"') && (h3.match(/class="jp-stamp" role="img"/g) || []).length === 3 && h3.includes('id="jp-ribbon"') && h3.includes('2 markets entered · reputation 60'));
  assert.equal(PB.fileName(p), 'ho-chieu-hanh-trinh-' + p.journeyId + '.png'); }

(async () => {
  const browser = await chromium.launch(); let fails = 0; const check = (ok, m) => { console.log((ok ? '  ✓ ' : '  ✗ ') + m); if (!ok) fails++; };
  for (const vw of [1280, 390]) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: 900 } }); const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    // chỉ xóa ở lần tải đầu của mỗi khung (sessionStorage sống qua reload) để bước đổi tiếng Anh vẫn giữ hộ chiếu
    await page.addInitScript(() => { try { if (!sessionStorage.getItem('jp-init')) { localStorage.clear(); localStorage.setItem('bizon-lang', 'vi'); sessionStorage.setItem('jp-init', '1'); } } catch (e) {} });
    await page.goto(BASE + '/hanh-trinh.html', { waitUntil: 'load' }); await page.waitForFunction(() => window.__jrRender && !document.getElementById('jr-setup').hidden);
    check(/Chọn một trong hai game làm Bậc 3/.test(await page.textContent('#jr-variant-help')), vw + ': câu giải thích biến thể');
    await page.fill('#jr-team', 'Đội Sách'); await page.click('#jr-create'); await page.waitForSelector('#jr-dash:not([hidden])');
    check(await page.$$eval('.jp-page', e => e.length) === 3 && await page.$$eval('.jp-stamp.jp-empty', e => e.length) === 3, vw + ': ba trang, chưa tem');
    check(/Đội Sách/.test(await page.textContent('.jp-cover')) && /0\/3 tem/.test(await page.textContent('.jp-cover')), vw + ': bìa có tên đội và 0/3 tem');
    check(/Biến thể đã chọn: Hộ Chiếu Sầu Riêng/.test(await page.textContent('.jr-tier[data-tier="t3"]')), vw + ': thẻ Bậc 3 nhắc biến thể');
    await page.evaluate(() => { const J = window.BizOnJourney, S = window.BizOnJourneyStore;
      S.update(q => J.recordTier1(q, { total: 4.2, result: { eff: 71, rank: 2 }, history: [{ w: 1, m: 0 }, { w: 2, m: 2 }], knownPairs: { '0-2': true } }));
      S.update(q => J.recordTier2(q, { balance: 363, history: [1, 2, 3].map(i => ({ netProfit: 20, share: 33.5, oee: 70 })), brand: 1.3, quickRatio: 1.2, loan: 0, rdCumulative: 40, caseId: 'B' }));
      S.update(q => J.recordTier3(q, 'durian', { total: 62, cash: 7.1, badges: ['a', 'b'], channelOrder: ['x', 'y'], parts: {} })); window.__jrRender(); });
    await page.waitForSelector('#jp-ribbon');
    check(await page.$$eval('.jp-stamp[role="img"]', e => e.length) === 3 && /3\/3 tem/.test(await page.textContent('.jp-cover')), vw + ': ba tem, 3/3');
    check(/Điểm 62\/100/.test(await page.textContent('.jp-page[data-tier="t3"]')) && /2 huy hiệu · 2 kênh/.test(await page.textContent('.jp-page[data-tier="t3"]')), vw + ': trang Bậc 3 có điểm và huy hiệu');
    const png = await page.evaluate(async () => { const b = await window.BizOnJourneyPassport.png(window.BizOnJourneyStore.load(), { lang: 'vi' }); return { size: b.size, type: b.type }; });
    check(png.type === 'image/png' && png.size > 30000, vw + ': PNG ' + png.size + ' byte');
    const dims = await page.evaluate(() => { const c = document.createElement('canvas'); window.BizOnJourneyPassport.draw(c, window.BizOnJourneyStore.load(), { lang: 'en' }); return [c.width, c.height]; });
    check(dims[0] === 1600 && dims[1] === 1000, vw + ': khung 1600×1000');
    // tiếng Anh
    await page.evaluate(() => { localStorage.setItem('bizon-lang', 'en'); }); await page.reload({ waitUntil: 'load' }); await page.waitForSelector('#jp-ribbon');
    check(/JOURNEY PASSPORT/.test(await page.textContent('.jp-cover')) && /COMPLETED/.test(await page.textContent('.jp-page[data-tier="t1"]')), vw + ': bản tiếng Anh');
    check(await page.evaluate(() => document.documentElement.scrollWidth) <= vw, vw + ': không tràn ngang');
    check(errors.length === 0, vw + ': không lỗi JS ' + errors.join(' | '));
    await ctx.close();
  }
  await browser.close(); if (fails) { console.error(fails + ' lỗi'); process.exit(1); } console.log('journey-passport: OK');
})().catch(e => { console.error(e); process.exit(1); });
