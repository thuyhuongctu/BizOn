/* Hộ Chiếu Sầu Riêng · gợi ý tick chọn ở phiếu quyết định (giả định / rủi ro / lý do CEO).
 * DurianCore.sheetHints dựng câu gợi ý từ chính quyết định của đội (cách ứng phó biến cố, kênh lớn nhất, tin đã mua,
 * ưu tiên đầu tư, rủi ro tập trung/dư lượng); toggleHint thêm hoặc bỏ đúng câu đó trong ô. Mỗi lần bấm ghi
 * USE_HINT / UNUSE_HINT vào nhật ký sự kiện để dữ liệu nghiên cứu tách được câu chọn sẵn với câu tự gõ.
 * Kiểm tra hàm thuần, mẫu 3D đã nhúng, và chạy thật bản gọn (v2) + bản lớp học (?resume=1) bằng Playwright.
 * Kèm: nhắc tắt «Trang web dành cho máy tính» khi điện thoại đang hiện bản máy tính (js/bizon-lang.js). */
'use strict';
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium;
try { chromium = require('playwright').chromium; } catch (e) {
  try { chromium = require('playwright-core').chromium; } catch (e2) { console.error('srp-sheet-hints: Cần cài playwright'); process.exit(1); }
}
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

// 1. Hàm thuần trong lõi dùng chung
const g = { console }; g.window = g; vm.createContext(g);
for (const f of ['lab/ho-chieu-sau-rieng-data.js', 'lab/ho-chieu-sau-rieng-engine.js', 'lab/ho-chieu-sau-rieng-core.js']) vm.runInContext(read(f), g, { filename: f });
const D = g.DurianData, E = g.DurianEngine, C = g.DurianCore;
check(typeof C.sheetHints === 'function' && typeof C.toggleHint === 'function', 'DurianCore xuất sheetHints và toggleHint');
const st = E.newGame(D, 'packer', 7);
const dec = C.freshDec(D, 'packer');
const ev = E.eventFor(D, st); if (ev) dec.option = 0;
dec.intel = [D.intel[0].id]; dec.priority = D.priorities[0].id;
const VI = (vi) => vi, EN = (vi, en) => en;
const H = C.sheetHints(D, E, st, dec, 'profit', VI), He = C.sheetHints(D, E, st, dec, 'profit', EN);
check(['assume', 'risk', 'why'].every(k => Array.isArray(H[k]) && H[k].length >= 1 && H[k].length <= 4), 'đủ ba nhóm gợi ý, mỗi nhóm 1–4 câu');
check(H.why.some(s => /lợi nhuận/.test(s)) && He.why.some(s => /profit/i.test(s)), 'câu lý do bám mục tiêu đã chọn, có cả tiếng Anh');
check(H.assume.concat(H.risk).some(s => s.includes(D.intel[0].vi.split(' (')[0]) || s.includes(D.priorities[0].vi.split(' (')[0])), 'gợi ý nêu tên tin đã mua hoặc ưu tiên đầu tư của đội');
check(JSON.stringify(C.sheetHints(D, E, null, dec, 'profit', VI)) === '{"assume":[],"risk":[],"why":[]}', 'thiếu trạng thái ván → không gợi ý');
const a = C.toggleHint('', 'Câu A.'), b = C.toggleHint(a, 'Câu B.'), c = C.toggleHint(b, 'Câu A.');
check(a === 'Câu A.' && b === 'Câu A. Câu B.' && c === 'Câu B.', 'toggleHint thêm nối câu và bỏ đúng câu đã thêm');
check(C.toggleHint('Tự gõ', 'Câu A.') === 'Tự gõ. Câu A.' && C.toggleHint('Tự gõ', '') === 'Tự gõ', 'giữ nguyên chữ tự gõ, thêm dấu chấm ngăn câu');

// 2. Bản 3D: mẫu nhúng có chip gợi ý dưới ô ghi chú, bấm thì đổi state.journal và ghi sự kiện
const lines = read('lab/ho-chieu-sau-rieng-3d.html').split('\n');
const tpl = JSON.parse(lines[lines.findIndex(l => l.trim() === '<script type="__bundler/template">') + 1]);
check(/<sc-if value="\{\{ f\.hasHints \}\}">/.test(tpl) && /<sc-for list="\{\{ f\.hints \}\}" as="h"/.test(tpl), 'mẫu 3D: hàng chip gợi ý dưới mỗi ô của phiếu');
check(tpl.includes('window.DurianCore.toggleHint(cur, h)') && tpl.includes("this.logEv(had ? 'UNUSE_HINT' : 'USE_HINT', k, h, false)"), 'mẫu 3D: bấm chip thêm/bỏ câu và ghi USE_HINT/UNUSE_HINT');
check(read('lab/ho-chieu-sau-rieng.html').includes("DurianCore.sheetHints(D, E, g, dec, sh.goal, L)"), 'bản lớp học dựng gợi ý từ lõi dùng chung');

// 3. Nhắc tắt chế độ máy tính trên điện thoại
const lang = read('js/bizon-lang.js');
check(/function deskHint\(\)/.test(lang) && lang.includes("sw >= 600 || window.innerWidth < sw * 1.5") && lang.includes('bizon-desk-hint-off'), 'bizon-lang.js: nhận ra điện thoại đang hiện bản máy tính, nhắc một lần, tắt được');
const sw = read('sw.js'); const cv = +(sw.match(/bizon-v(\d+)/) || [])[1];
check(cv >= 691, 'sw.js nâng phiên bản bộ nhớ đệm (>= v691)');

(async () => {
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    const pg = await ctx.newPage(); const errors = []; pg.on('pageerror', e => errors.push(e.message)); pg.on('dialog', d => d.accept());
    await pg.addInitScript(() => { try { if (!sessionStorage.getItem('hk')) { localStorage.clear(); sessionStorage.setItem('hk', '1'); } localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
    await pg.route(/\.(woff2?|mp3|m4a)(\?|$)/, r => r.abort());
    await pg.goto(BASE + '/lab/ho-chieu-sau-rieng-v2.html', { waitUntil: 'load', timeout: 60000 });
    await pg.fill('input[name=cls]', 'KT330H-F1'); await pg.fill('input[name=team]', 'team_07');
    await pg.click('[data-act=role][data-v=packer]');
    await pg.click('#dp2-login button[type=submit]');
    await pg.waitForSelector('#dp2-why');
    if (await pg.$('.dp2-event .bp2-choice')) await pg.click('.dp2-event .bp2-choice:nth-child(1)');
    await pg.click('[data-act=pri][data-v=area]');
    await pg.click('[data-act=goal][data-v=profit]');
    const n0 = await pg.$$eval('.dp2-hints button', bs => bs.length);
    check(n0 >= 2, 'bản gọn: hiện chip gợi ý dưới ô lý do (' + n0 + ')');
    await pg.click('.dp2-hints button[data-v="0"]');
    const s1 = await pg.evaluate(() => ({ v: document.getElementById('dp2-why').value, sh: DP2.app().sheets[1], on: document.querySelector('.dp2-hints button[data-v="0"]').classList.contains('on'), ev: DP2.app().events.slice(-1)[0] }));
    check(s1.v.length > 10 && s1.sh.ceo === s1.v && s1.sh.assume === s1.v && s1.on, 'bản gọn: bấm chip điền câu vào ô, ghi cả assume và ceo, chip sáng');
    check(s1.ev && s1.ev.event_type === 'USE_HINT', 'bản gọn: ghi sự kiện USE_HINT');
    check(await pg.evaluate(() => !document.getElementById('dp2-commit').disabled), 'bản gọn: chọn gợi ý đủ để mở nút chốt');
    await pg.click('.dp2-hints button[data-v="0"]');
    const s2 = await pg.evaluate(() => ({ v: document.getElementById('dp2-why').value, ev: DP2.app().events.slice(-1)[0] }));
    check(s2.v === '' && s2.ev.event_type === 'UNUSE_HINT', 'bản gọn: bấm lại thì bỏ câu, ghi UNUSE_HINT');

    // bản lớp học mở đúng ván đó (?resume=1): chip dưới cả ba ô
    await pg.goto(BASE + '/lab/ho-chieu-sau-rieng.html?resume=1', { waitUntil: 'load', timeout: 60000 });
    await pg.waitForSelector('[data-hint-f]', { timeout: 15000 }).catch(() => {});
    const fs2 = await pg.$$eval('[data-hint-f]', bs => [...new Set(bs.map(b => b.dataset.hintF))]);
    check(['assume', 'risk', 'ceo'].every(f => fs2.includes(f)), 'bản lớp học: chip gợi ý dưới ô giả định, rủi ro và lý do CEO');
    if (fs2.includes('risk')) {
      await pg.click('[data-hint-f=risk][data-hint-i="0"]');
      const r = await pg.evaluate(() => { const b = document.querySelector('[data-hint-f=risk][data-hint-i="0"]'); const ta = [...document.querySelectorAll('textarea')].find(t => t.value.length > 5); return { pressed: b && b.getAttribute('aria-pressed'), v: ta ? ta.value : '' }; });
      check(r.pressed === 'true' && r.v.length > 5, 'bản lớp học: bấm chip điền câu vào ô rủi ro');
    }
    const ow = await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
    check(ow, 'bản lớp học: điện thoại không tràn ngang');
    check(errors.length === 0, 'không lỗi JS' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
    await ctx.close();

    // điện thoại bật «Trang web dành cho máy tính»: khung 980px trên màn 384px → hiện nhắc; điện thoại thường thì không
    const dctx = await browser.newContext({ viewport: { width: 980, height: 2170 }, screen: { width: 384, height: 854 }, hasTouch: true, serviceWorkers: 'block' });
    const dp = await dctx.newPage(); await dp.route(/\.(woff2?|mp3|m4a)(\?|$)/, r => r.abort());
    await dp.goto(BASE + '/thiet-ke-nghien-cuu.html', { waitUntil: 'load', timeout: 60000 });
    await dp.waitForSelector('#bz-desk-hint', { timeout: 5000 }).catch(() => {});
    check(!!(await dp.$('#bz-desk-hint')), 'điện thoại ở chế độ máy tính: hiện nhắc tắt «Trang web dành cho máy tính»');
    if (await dp.$('#bz-desk-hint')) { await dp.click('#bz-desk-hint button'); check(await dp.evaluate(() => !document.getElementById('bz-desk-hint') && localStorage.getItem('bizon-desk-hint-off') === '1'), 'bấm «Đã hiểu» thì ẩn và không nhắc lại'); }
    await dctx.close();
    const mctx = await browser.newContext({ viewport: { width: 384, height: 854 }, screen: { width: 384, height: 854 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    const mp = await mctx.newPage(); await mp.route(/\.(woff2?|mp3|m4a)(\?|$)/, r => r.abort());
    await mp.goto(BASE + '/thiet-ke-nghien-cuu.html', { waitUntil: 'load', timeout: 60000 }); await mp.waitForTimeout(1200);
    check(!(await mp.$('#bz-desk-hint')), 'điện thoại bình thường: không nhắc');
    await mctx.close();
  } finally { await browser.close(); }
  if (fails) { console.error('srp-sheet-hints: ' + fails + ' lỗi'); process.exit(1); }
  console.log('srp-sheet-hints: ok');
})().catch(e => { console.error(e); process.exit(1); });
