/* lab/ho-chieu-sau-rieng-v2.html – bản gọn Hộ Chiếu Sầu Riêng (kiểu Bật Nghiệp v2): giao diện mới trên ba mô-đun dùng
 * chung (engine, data, core), cùng khoá lưu «durian_class_v2» và cùng cấu trúc APP với bản lớp học.
 * Kiểm tra tĩnh (trang nạp đúng mô-đun, không có công thức riêng, liên kết từ games/index/trang lớp học, sw.js) và chạy
 * thật bằng Playwright trên BIZON_URL: bắt đầu ván theo mã lớp (cùng hạt giống với bản lớp học), quyết định qua giao diện,
 * chốt bị chặn khi thiếu ghi chú, kết quả + nhật ký, chạy hết 6 vụ, màn tổng kết, bản lớp học mở đúng ván (?resume=1),
 * EN, điện thoại không tràn ngang, không lỗi JS. */
'use strict';
const path = require('path');
const fs = require('fs');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium;
try { chromium = require('playwright').chromium; } catch (e) {
  try { chromium = require('playwright-core').chromium; } catch (e2) { try { chromium = require(path.join(process.env.HOME || '', '.cache', 'playwright-core')).chromium; } catch (e3) { console.error('ho-chieu-sau-rieng-v2: cần playwright'); process.exit(1); } }
}
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const E = require('../lab/ho-chieu-sau-rieng-engine.js');

const page = read('lab/ho-chieu-sau-rieng-v2.html'), js = read('js/dp2-ui.js'), css = read('css/dp2.css'), sw = read('sw.js');
for (const need of ['ho-chieu-sau-rieng-engine.js', 'ho-chieu-sau-rieng-data.js', 'ho-chieu-sau-rieng-core.js', '../js/dp2-ui.js', '../css/dp2.css', '../css/bn2.css', '../css/bp2.css', 'DP2.start()']) check(page.includes(need), 'trang nạp ' + need);
check(/SAVE_KEY = 'durian_class_v2'/.test(js) && /C\.commitSeason\(/.test(js) && /E\.forecast\(/.test(js) && /E\.rivalsRun\(/.test(js), 'giao diện dùng engine/core dùng chung và cùng khoá lưu với bản lớp học');
check(!/Math\.random|priceMult \*|\* P\.offMult/.test(js), 'không có công thức mô phỏng riêng trong lớp giao diện');
check(js.includes('C.sheetComplete(') && js.includes('assume: el.value, ceo: el.value'), 'phiếu rút gọn vẫn qua sheetComplete, ghi cả assume và ceo');
check(read('js/games-clay.js').includes("lab/ho-chieu-sau-rieng-v2.html") && read('index.html').includes('href="lab/ho-chieu-sau-rieng-v2.html"') && read('index.html') === read('academia3d-v2.html'), 'games.html và index.html (= academia3d-v2.html) dẫn tới bản gọn');
check(read('lab/ho-chieu-sau-rieng.html').includes('ho-chieu-sau-rieng-v2.html') && /resume=1/.test(read('lab/ho-chieu-sau-rieng.html')), 'bản lớp học dẫn sang bản gọn và mở thẳng ván khi ?resume=1');
check(sw.includes("'./lab/ho-chieu-sau-rieng-v2.html'") && sw.includes("'./js/dp2-ui.js'") && sw.includes("'./css/dp2.css'"), 'sw.js cache ba tệp bản gọn');
check(/@media\(max-width:560px\)/.test(css), 'CSS có breakpoint điện thoại');

(async () => {
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
    const pg = await ctx.newPage(); const errors = []; pg.on('pageerror', e => errors.push(e.message)); pg.on('dialog', d => d.accept());
    await pg.addInitScript(() => { try { if (!sessionStorage.getItem('dp2keep')) { localStorage.clear(); sessionStorage.setItem('dp2keep', '1'); } localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
    await pg.route(/\.(woff2?|mp3|m4a)(\?|$)/, r => r.abort());
    await pg.goto(BASE + '/lab/ho-chieu-sau-rieng-v2.html', { waitUntil: 'load', timeout: 60000 });
    await pg.waitForFunction(() => window.DP2 && DP2.phase() === 'start', null, { timeout: 20000 });
    check(await pg.evaluate(() => document.querySelectorAll('[data-act=role]').length === 4 && !document.querySelector('[data-act=resume]')), 'màn mở đầu: 4 doanh nghiệp, chưa có ván lưu');
    await pg.fill('input[name=cls]', 'KT330H-F1'); await pg.fill('input[name=team]', 'team_03');
    await pg.click('[data-act=role][data-v=packer]');
    await pg.click('#dp2-login button[type=submit]');
    await pg.waitForSelector('#dp2-commit');
    const s0 = await pg.evaluate(() => ({ a: DP2.app(), ok: DP2.okIds(), ev: !!document.querySelector('.dp2-event'), dis: document.getElementById('dp2-commit').disabled, rows: document.querySelectorAll('.dp2-rank .row').length, lock: document.querySelectorAll('.dp2-ch .row.lock').length }));
    check(s0.a.roleId === 'packer' && s0.a.team === 'TEAM_03' && s0.a.seed === E.seedFrom('KT330H-F1|packer') && s0.a.lean === true, 'ván mới: đúng vai, mã đội viết hoa, hạt giống = seedFrom(mã lớp|vai) như bản lớp học');
    check(s0.ok.join(',') === 'BORDER,TW,DOM' && s0.lock === 3 && s0.rows === 4 && s0.dis, 'cơ sở đóng gói: 3 kênh mở, 3 kênh khoá; bảng xếp hạng 4 dòng; chưa chốt được khi chưa ghi chú');
    // quyết định qua giao diện
    if (s0.ev) await pg.click('.dp2-event .bp2-choice:nth-child(2)');
    await pg.click('[data-act=pri][data-v=area]');
    await pg.evaluate(() => { const r = document.getElementById('dp2-linked'); r.value = 70; r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); });
    await pg.waitForSelector('#dp2-commit');
    await pg.evaluate(() => { const r = document.querySelector('input[data-ch=BORDER]'); r.value = 60; r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); });
    await pg.waitForSelector('#dp2-commit');
    await pg.click('[data-act=adv]'); await pg.click('[data-act=intel][data-v=moit]');
    const s1 = await pg.evaluate(() => ({ d: DP2.dec(), sig: document.querySelectorAll('.dp2-sig li').length, pct: document.getElementById('dp2-pct-BORDER').textContent, fc: Number.isFinite(DP2.forecast().profit), ev: DP2.app().events.map(e => e.event_type) }));
    check(s1.d.priority === 'area' && s1.d.linked === 0.7 && s1.d.alloc.BORDER === 60 && s1.d.intel[0] === 'moit' && (!s0.ev || s1.d.option === 1), 'ưu tiên, tỷ lệ vùng có mã, tỷ trọng kênh, tin, phương án biến cố ghi vào quyết định');
    check(s1.sig === 1 && s1.pct === '55%' && s1.fc, 'tín hiệu giá từ tin đã mua, % kênh chuẩn hoá (55%), dự báo engine có số');
    check(['LOGIN', 'CHANGE_PRIORITY', 'CHANGE_LINKED', 'CHANGE_ALLOC_BORDER', 'BUY_INTEL'].every(t => s1.ev.includes(t)), 'nhật ký kiểm toán ghi như bản lớp học (' + s1.ev.length + ' sự kiện)');
    const rej = await pg.evaluate(() => { const ok = DP2.commit(); return { ok, err: !!document.querySelector('.dp2-err'), n: DP2.app().game.history.length }; });
    check(!rej.ok && rej.err && rej.n === 0, 'chốt khi thiếu ghi chú → từ chối, báo lỗi, chưa sang vụ');
    await pg.click('[data-act=goal][data-v=profit]');
    await pg.fill('#dp2-why', 'Giá vựa cao, dồn tiểu ngạch, lấy mã vùng trồng trước.');
    check(await pg.evaluate(() => !document.getElementById('dp2-commit').disabled), 'đủ mục tiêu và lý do → nút chốt mở');
    await pg.click('[data-act=commit]'); await pg.waitForSelector('[data-act=journal]');
    const r1 = await pg.evaluate(() => ({ ph: DP2.phase(), h: DP2.app().game.history.length, sh: DP2.app().sheets[1], flag: document.querySelector('.bn2-flag').textContent, kpis: document.querySelectorAll('.dp2-kpis div').length, tbl: document.querySelectorAll('.bp2-table tbody tr').length }));
    check(r1.ph === 'result' && r1.h === 1 && r1.sh.goal === 'profit' && r1.sh.assume === r1.sh.ceo && Number.isFinite(r1.sh.forecastFinal) && /cờ/.test(r1.flag) && r1.tbl >= 2, 'chốt vụ 1 → thẻ kết quả, phiếu lưu đủ goal/assume/ceo/forecastFinal, bảng kênh');
    const rj = await pg.evaluate(() => { const ok = DP2.journalDone(); return { ok, err: !!document.querySelector('.dp2-err') }; });
    check(!rj.ok && rj.err, 'nhật ký thiếu nguyên nhân → chưa sang vụ');
    await pg.click('[data-act=cause][data-v=price]'); await pg.fill('#dp2-next', 'Mua thêm tin và giảm tiểu ngạch.');
    await pg.click('[data-act=journal]'); await pg.waitForSelector('#dp2-commit');
    const r2 = await pg.evaluate(() => ({ n: DP2.app().game.n, j: DP2.app().journals[1], draft: !!DP2.app().journals.draft1, saved: JSON.parse(localStorage.getItem('durian_class_v2')).game.n }));
    check(r2.n === 2 && r2.j.cause === 'price' && Number.isFinite(r2.j.deviation) && !r2.draft && r2.saved === 2, 'nhật ký vụ 1 lưu (cause, deviation), sang vụ 2, ván lưu ở khoá durian_class_v2');
    // chạy hết 6 vụ qua API
    for (let k = 2; k <= 6; k++) await pg.evaluate(() => { DP2.setSheet({ goal: 'profit', assume: 'Giữ nhịp, ưu tiên mã số', ceo: 'Giữ nhịp, ưu tiên mã số' }); DP2.commit(); DP2.setJournal({ cause: 'event', next: 'Điều chỉnh theo biến cố.' }); DP2.journalDone(); });
    await pg.waitForSelector('[data-act=again]');
    const e1 = await pg.evaluate(() => ({ ph: DP2.phase(), h1: document.querySelector('h1').textContent, flags: DP2.app().flags.filter(Boolean).length, dots: document.querySelectorAll('.dp2-dots span.win,.dp2-dots span.lose').length, link: (document.querySelector('a.bn2-btn.pri') || {}).getAttribute('href'), bars: document.querySelectorAll('.dp2-score .row').length }));
    check(e1.ph === 'end' && /TEAM_03 · \d+\/100/.test(e1.h1) && e1.flags === 6 && e1.dots === 6 && e1.bars === 5 && e1.link === 'ho-chieu-sau-rieng.html?resume=1', 'hết 6 vụ: tổng kết điểm /100, 6 cờ, 5 thành phần điểm, liên kết báo cáo đầy đủ');
    await pg.click('[data-act=help]');
    check(await pg.evaluate(() => document.querySelectorAll('.dp2-rvs .rv').length === 3 && document.querySelectorAll('.bp2-rules h3').length >= 5), 'hộp cách chơi: 3 đối thủ của ván và luật từ DurianCore.howToPlay');
    await pg.click('[data-act=closehelp]');
    await pg.click('[data-act=lang]');
    check(await pg.evaluate(() => document.querySelector('.bn2-eyebrow').textContent === 'Six seasons are over' && document.documentElement.lang === 'en'), 'đổi EN: màn tổng kết dịch');
    // bản lớp học mở đúng ván (resume=1) → báo cáo cuối với chứng nhận và xuất dữ liệu
    await pg.goto(BASE + '/lab/ho-chieu-sau-rieng.html?resume=1', { waitUntil: 'load', timeout: 60000 });
    await pg.waitForSelector('#app h1');
    const fp = await pg.evaluate(() => ({ h1: document.querySelector('#app h1').textContent, cert: !!document.getElementById('certDone'), csv: !!document.getElementById('csvRounds'), rows: document.querySelectorAll('#app table tr').length }));
    check(/Report after 6 seasons|Báo cáo sau 6 vụ/.test(fp.h1) && fp.cert && fp.csv && fp.rows > 6, 'bản lớp học ?resume=1 mở đúng ván: báo cáo sau 6 vụ, chứng nhận, CSV (' + fp.h1 + ')');
    check(errors.length === 0, 'không lỗi JS' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await ctx.close();

    // điện thoại 390px: màn mở đầu + thẻ vụ 1 (HTX: có nút xử lý nghịch vụ ở vụ chẵn, vụ 1 chính vụ) không tràn ngang
    const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', isMobile: true, hasTouch: true });
    const mp = await mctx.newPage(); const merr = []; mp.on('pageerror', e => merr.push(e.message)); mp.on('dialog', d => d.accept());
    await mp.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
    await mp.route(/\.(woff2?|mp3|m4a)(\?|$)/, r => r.abort());
    await mp.goto(BASE + '/lab/ho-chieu-sau-rieng-v2.html', { waitUntil: 'load', timeout: 60000 });
    await mp.waitForFunction(() => window.DP2, null, { timeout: 20000 });
    const m0 = await mp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await mp.click('[data-act=role][data-v=htx]'); await mp.click('#dp2-login button[type=submit]'); await mp.waitForSelector('#dp2-commit');
    const m1 = await mp.evaluate(() => ({ overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, linked: !!document.getElementById('dp2-linked'), note: /vườn nhà tự ra hoa|flowers on its own/.test(document.body.textContent), cols: getComputedStyle(document.querySelector('.dp2-ch .row')).gridTemplateColumns.split(' ').length }));
    check(m0 === 0 && m1.overflow === 0 && m1.cols === 2, 'điện thoại: không tràn ngang ở màn mở đầu và thẻ vụ; dòng kênh xếp 2 cột');
    check(!m1.linked && m1.note, 'HTX nhà vườn: không có thanh vùng liên kết, vụ 1 chính vụ ghi «vườn nhà tự ra hoa»');
    check(merr.length === 0, 'không lỗi JS trên điện thoại' + (merr.length ? ': ' + merr.join(' | ') : ''));
    await mctx.close();
  } finally { await browser.close(); }
  console.log(fails ? `ho-chieu-sau-rieng-v2: ${fails} lỗi` : 'ho-chieu-sau-rieng-v2: ok');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
