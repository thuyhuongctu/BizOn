/* truong-hoc-thuat.html – bản thiết kế lại 10-2026 (gói design_handoff_academic_foundation): mục lục dính + chỉ báo
 * tiến độ, model card xếp/mở ba góc nhìn, bảng tham số lọc/tìm được với nhãn loại nguồn và mã nguồn bấm được, hai sơ đồ
 * lý thuyết chọn được, mô phỏng mã băm tái lập, rubric chọn mức, nút chép trích dẫn, VI/EN qua i18n đất sét.
 * Kiểm tra tĩnh (9 mục đúng thứ tự, neo cũ #chuan-dau-ra/#rubric còn, bảng tham số vẫn là <tr data-param>, sw.js có
 * tệp mới) và chạy thật bằng Playwright trên máy chủ tĩnh BIZON_URL (desktop + điện thoại, sáng + tối, không lỗi JS).
 * Hợp đồng «bảng tham số = lab/ho-chieu-sau-rieng-data.js» vẫn do test/durian-params-page.test.js giữ. */
'use strict';
const path = require('path');
const fs = require('fs');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium;
try { chromium = require('playwright').chromium; } catch (e) {
  try { chromium = require('playwright-core').chromium; } catch (e2) { try { chromium = require(path.join(process.env.HOME || '', '.cache', 'playwright-core')).chromium; } catch (e3) { console.error('academic-foundation: cần playwright'); process.exit(1); } }
}
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

const page = read('truong-hoc-thuat.html'), css = read('css/academic-foundation.css'), js = read('js/academic-foundation.js'), sw = read('sw.js');
const ORDER = ['model-cards', 'tham-so-sau-rieng', 'ly-thuyet-kdqt', 'tai-lap', 'chuan-dau-ra', 'vietlens', 'dao-duc', 'doi-sanh', 'gioi-han', 'tai-lieu'];
const found = [...page.matchAll(/<section id="([a-z-]+)" class="af-sec/g)].map(m => m[1]);
check(found.join(',') === ORDER.join(','), '9 mục đúng thứ tự (được: ' + found.join(',') + ')');
check(page.includes('id="rubric"') && page.includes('href="#chuan-dau-ra"'), 'neo cũ #chuan-dau-ra và #rubric vẫn còn (trang khác liên kết tới)');
check(ORDER.every(id => page.includes('<a href="#' + id + '"><span class="n">')), 'mục lục dính có đủ 9 liên kết');
check((page.match(/<tr data-param="/g) || []).length === 27 && (page.match(/<li><b>[A-Z0-9]+<\/b>/g) || []).length === 12, 'bảng tham số vẫn 27 dòng <tr data-param> và 12 mã nguồn <li><b>');
check(!/class="ht-|<svg class="ht-svg"/.test(page) && !page.includes('<style>'), 'không còn kiểu/SVG bản cũ, CSS tách ra css/academic-foundation.css');
for (const need of ['css/academic-foundation.css', 'js/academic-foundation.js', 'js/bizon-boot.js', 'js/bizon-clay-i18n.js', 'js/bizon-clay-nav.js', 'js/bizon-clay-footer.js']) check(page.includes(need), 'trang nạp ' + need);
check(sw.includes("'./css/academic-foundation.css'") && sw.includes("'./js/academic-foundation.js'"), 'sw.js cache tệp mới');
check(/@media print/.test(css) && /@media \(max-width:899px\)/.test(css) && /prefers-reduced-motion/.test(css) && /:root\[data-theme="dark"\] \.af/.test(css), 'CSS: bản in, breakpoint 899, reduced motion, bản tối');
check(/bizon:langchange/.test(js) && /clayRefreshLang/.test(js) && /beforeprint/.test(js), 'script làm mới khi đổi ngôn ngữ, dịch nhãn mới bơm, xử lý bản in');
const details = (page.match(/<details class="af-model"/g) || []).length, open = (page.match(/<details class="af-model" id="m1" open>/g) || []).length;
check(details === 5 && open === 1, '5 model card dạng <details> (4 engine + hành trang hành trình), thẻ 1 mở sẵn');

(async () => {
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
    const pg = await ctx.newPage(); const errors = []; pg.on('pageerror', e => errors.push(e.message));
    // Trình duyệt headless chạy en-US: js/bizon-lang.js tự chọn EN cho khách chưa chọn ngôn ngữ, nên chốt VI như một người dùng đã chọn.
    await pg.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('bizon-lang', 'vi'); localStorage.setItem('bizon-theme', 'light'); } catch (e) {} });
    await pg.route(/\.(woff2?|mp3|m4a)(\?|$)/, r => r.abort());
    await pg.goto(BASE + '/truong-hoc-thuat.html', { waitUntil: 'load', timeout: 60000 });
    await pg.waitForFunction(() => window.AF && document.getElementById('clay-nav') && document.getElementById('clay-footer'), null, { timeout: 20000 });
    await pg.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    const r0 = await pg.evaluate(() => ({ counts: AF.counts(), active: AF.state().active, toc: getComputedStyle(document.querySelector('.af-toc')).position, chips: getComputedStyle(document.querySelector('.af-chips')).display,
      h1: document.querySelector('h1').textContent, badge: document.querySelector('#af-ptable tr[data-param="baseLoss"] .af-kind').textContent, codes: document.querySelectorAll('.af-codes button').length,
      prog: document.getElementById('af-prog-label').textContent, navH: parseFloat(getComputedStyle(document.querySelector('.af')).getPropertyValue('--af-nav-h')), hashOk: document.getElementById('af-match').classList.contains('ok'),
      sample: document.getElementById('af-sample-lvl').textContent, m1: document.getElementById('m1').open, m2: document.getElementById('m2').open }));
    check(r0.counts.all === 27 && r0.counts.sourced === 8 && r0.counts.mixed === 8 && r0.counts.illustrative === 11, 'nhãn loại nguồn: 8 có nguồn · 8 hỗn hợp · 11 minh hoạ (được ' + JSON.stringify(r0.counts) + ')');
    check(r0.toc === 'sticky' && r0.chips === 'none' && r0.navH > 40, 'desktop: mục lục dính dưới menu đất sét (nav ' + r0.navH + 'px), hàng chip ẩn');
    check(r0.active === 'model-cards' && r0.prog === '01 / 10', 'đầu trang: mục 01 đang đọc, chỉ báo 01 / 10');
    check(/Công bố kết quả/.test(r0.h1) && r0.badge === 'Có nguồn' && r0.codes >= 20, 'VI mặc định đã chọn; baseLoss gắn nhãn «Có nguồn»; có mã nguồn bấm được');
    check(r0.hashOk && r0.sample === 'Mức 4 · Xuất sắc' && r0.m1 && !r0.m2, 'mã băm trùng mặc định, rubric chọn mức 4, chỉ thẻ 1 mở');
    // model card: tab + mở thẻ 2
    await pg.click('#m1-t-mech');
    await pg.click('#m2 summary');
    const r1 = await pg.evaluate(() => ({ mech: !document.getElementById('m1-p-mech').hidden, limit: document.getElementById('m1-p-limit').hidden, sel: document.getElementById('m1-t-mech').getAttribute('aria-selected'), m2: document.getElementById('m2').open }));
    check(r1.mech && r1.limit && r1.sel === 'true' && r1.m2, 'model card: chuyển góc nhìn Cơ chế, mở thẻ 2');
    // bảng tham số: lọc, tìm, rỗng, xoá lọc, mã nguồn
    await pg.click('.af-filters button[data-kind="sourced"]');
    const r2 = await pg.evaluate(() => ({ n: document.getElementById('af-count-n').textContent, vis: document.querySelectorAll('#af-ptable tbody tr:not([hidden])').length, on: document.querySelector('.af-filters button[data-kind="sourced"]').getAttribute('aria-pressed') }));
    check(r2.n === '8 / 27' && r2.vis === 8 && r2.on === 'true', 'lọc «Có nguồn» → 8 dòng');
    await pg.click('.af-filters button[data-kind="all"]');
    await pg.fill('#af-search', 'cadimi');
    const r3 = await pg.evaluate(() => ({ n: document.getElementById('af-count-n').textContent, keys: Array.from(document.querySelectorAll('#af-ptable tbody tr:not([hidden])')).map(t => t.dataset.param).join(',') }));
    check(r3.n === '1 / 27' && r3.keys === 'cadmiumRiskMult', 'tìm «cadimi» → cadmiumRiskMult (được ' + r3.keys + ')');
    await pg.fill('#af-search', 'zzzz');
    const r4 = await pg.evaluate(() => !document.getElementById('af-empty').hidden);
    await pg.click('[data-act="clear"]');
    const r5 = await pg.evaluate(() => document.getElementById('af-count-n').textContent + '|' + document.getElementById('af-empty').hidden + '|' + document.getElementById('af-search').value);
    check(r4 && r5 === '27 / 27|true|', 'không khớp → trạng thái rỗng; «Xoá bộ lọc» về 27 dòng');
    await pg.click('#af-ptable tr[data-param="baseLoss"] .af-codes button[data-code="CAILAY"]');
    const r6 = await pg.evaluate(() => ({ hidden: document.getElementById('af-srcpanel').hidden, code: document.querySelector('#af-srcpanel .code').textContent, txt: document.querySelector('#af-srcpanel .t').textContent, uses: document.querySelector('#af-srcpanel .u').textContent, pressed: document.querySelectorAll('.af-codes button[aria-pressed="true"]').length }));
    check(!r6.hidden && r6.code === 'CAILAY' && /Cai Lậy/.test(r6.txt) && r6.uses.split(' · ').length === 5 && r6.uses.includes('baseLoss') && r6.pressed === 5, 'bấm mã CAILAY → bảng nguồn dính hiện trích dẫn và 5 tham số dùng nó');
    await pg.click('[data-act="closesrc"]');
    await pg.click('[data-act="togglesrc"]');
    const r7 = await pg.evaluate(() => ({ panel: document.getElementById('af-srcpanel').hidden, list: !document.getElementById('af-srclist').hidden, exp: document.querySelector('[data-act="togglesrc"]').getAttribute('aria-expanded') }));
    check(r7.panel && r7.list && r7.exp === 'true', 'đóng bảng nguồn; «Hiện 12 mã nguồn» mở danh mục');
    // lý thuyết: bậc + nút vòng Uppsala
    await pg.click('.af-tier[data-tier="t1"]');
    await pg.click('.af-node[data-node="n3"]');
    const r8 = await pg.evaluate(() => ({ tier: AF.state().tier, t1: !document.querySelector('[data-tier-panel="t1"]').hidden, t3: document.querySelector('[data-tier-panel="t3"]').hidden, node: AF.state().node, n3: !document.querySelector('[data-node-panel="n3"]').hidden, n1: document.querySelector('[data-node-panel="n1"]').hidden, chips: document.querySelectorAll('[data-tier-panel="t1"] .af-chipset span').length }));
    check(r8.tier === 't1' && r8.t1 && r8.t3 && r8.chips === 3 && r8.node === 'n3' && r8.n3 && r8.n1, 'Hình 1 chọn bậc 1 (3 chip), Hình 2 chọn nút 3 Hoạt động');
    // mã băm demo
    await pg.click('[data-rp="round:2"]');
    const r9 = await pg.evaluate(() => ({ ok: document.getElementById('af-match').classList.contains('ok'), you: document.getElementById('af-hash-you').textContent, ref: document.getElementById('af-hash-ref').textContent }));
    await pg.click('[data-rp="round:5"]');
    const r10 = await pg.evaluate(() => document.getElementById('af-match').classList.contains('ok') && document.getElementById('af-hash-you').textContent === document.getElementById('af-hash-ref').textContent);
    check(!r9.ok && r9.you !== r9.ref && /^[0-9a-f]{16}$/.test(r9.you) && r10, 'đổi vòng R3 → mã băm khác, không trùng; về R6 → trùng');
    // rubric + chép tài liệu
    await pg.click('.af-rub[data-lvl="1"]');
    const r11 = await pg.evaluate(() => ({ lvl: AF.state().lvl, hd: document.getElementById('af-sample-lvl').textContent, q: document.querySelector('#af-sample p:not([hidden])').dataset.sample }));
    check(r11.lvl === '1' && r11.hd === 'Mức 2 · Đạt' && r11.q === '1', 'rubric chọn mức 2 → câu trả lời mẫu đổi theo');
    await pg.click('.af-refs li:nth-child(4) [data-act="copyref"]');
    const r12 = await pg.evaluate(() => ({ t: AF.lastCopied(), flash: document.querySelector('.af-refs li:nth-child(4) .af-copy').classList.contains('copied') }));
    check(/^Sarasvathy, S\. D\. \(2001\)\..*243–263\. https:\/\/doi\.org\/10\.5465\/amr\.2001\.4378020$/.test(r12.t) && r12.flash, 'chép tài liệu 4: chữ thuần + liên kết DOI, nút báo «Đã chép»');
    await pg.click('[data-act="copyall"]');
    const r13 = await pg.evaluate(() => AF.lastCopied().split('\n'));
    check(r13.length === 18 && /Khanna, T\./.test(r13[16]) && /Capelo, C\./.test(r13[17]) && !/doi:/.test(r13.join('')), 'chép cả 18 tài liệu, mỗi dòng một tài liệu');
    // mục lục: cuộn tới cuối → Tài liệu; bấm mục lục → Tái lập nằm dưới menu
    await pg.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await pg.waitForTimeout(300);
    const r14 = await pg.evaluate(() => AF.state().active + '|' + document.getElementById('af-prog-label').textContent + '|' + document.querySelector('.af-toc-list a[aria-current="true"]').getAttribute('href'));
    check(r14 === 'tai-lieu|10 / 10|#tai-lieu', 'cuộn tới cuối → mục 10 Tài liệu (được ' + r14 + ')');
    await pg.click('.af-toc-list a[href="#tai-lap"]'); await pg.waitForTimeout(400);
    const r15 = await pg.evaluate(() => ({ active: AF.state().active, top: Math.round(document.getElementById('tai-lap').getBoundingClientRect().top), navH: parseFloat(getComputedStyle(document.querySelector('.af')).getPropertyValue('--af-nav-h')) }));
    check(r15.active === 'tai-lap' && r15.top >= r15.navH && r15.top < r15.navH + 80, 'bấm mục lục «Tái lập» → mục nằm ngay dưới menu dính (top ' + r15.top + ', nav ' + r15.navH + ')');
    // đổi ngôn ngữ qua i18n đất sét: nhãn bơm bằng JS cũng đổi
    await pg.evaluate(() => window.clayApplyLang('en')); await pg.waitForTimeout(200);
    const r16 = await pg.evaluate(() => ({ h1: document.querySelector('h1').textContent, badge: document.querySelector('#af-ptable tr[data-param="baseLoss"] .af-kind').textContent, sample: document.getElementById('af-sample-lvl').textContent, count: document.querySelector('.af-count').textContent.trim(), toc: document.querySelector('.af-toc-list a[href="#tai-lap"] span:last-child').textContent, ph: document.getElementById('af-search').placeholder }));
    check(/Results and their limitations/.test(r16.h1) && r16.badge === 'Sourced' && r16.sample === 'Level 2 · Pass' && r16.count === '27 / 27 parameters' && r16.toc === 'Reproducibility' && /Search parameter/.test(r16.ph), 'EN: tiêu đề, nhãn loại nguồn, câu mẫu, số đếm, mục lục, ô tìm đều đổi');
    // bản tối: biến chữ-trên-nền-nhạt đổi, không lỗi
    await pg.evaluate(() => window.clayApplyTheme('dark')); await pg.waitForTimeout(100);
    const r17 = await pg.evaluate(() => ({ bg: getComputedStyle(document.body).backgroundColor, peek: getComputedStyle(document.querySelector('.af-model .peek.c')).color }));
    check(r17.bg === 'rgb(30, 25, 21)' && r17.peek === 'rgb(255, 179, 138)', 'bản tối: nền #1E1915, chữ nhấn đổi sang sắc sáng (được ' + r17.peek + ')');
    check(errors.length === 0, 'không lỗi JS trên desktop' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await ctx.close();

    // Điện thoại 390px: một cột, hàng chip dính dưới menu, bảng xếp dọc, không tràn ngang; mục đang đọc đổi theo cuộn
    const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', isMobile: true, hasTouch: true });
    const mp = await mctx.newPage(); const merrors = []; mp.on('pageerror', e => merrors.push(e.message));
    await mp.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('bizon-lang', 'vi'); localStorage.setItem('bizon-theme', 'light'); } catch (e) {} });
    await mp.route(/\.(woff2?|mp3|m4a)(\?|$)/, r => r.abort());
    await mp.goto(BASE + '/truong-hoc-thuat.html', { waitUntil: 'load', timeout: 60000 });
    await mp.waitForFunction(() => window.AF && document.getElementById('clay-nav'), null, { timeout: 20000 });
    await mp.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    const m0 = await mp.evaluate(() => ({ overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, toc: getComputedStyle(document.querySelector('.af-toc')).display, chips: getComputedStyle(document.querySelector('.af-chips')).position, chipTop: Math.round(document.querySelector('.af-chips').getBoundingClientRect().top), navB: Math.round(document.getElementById('clay-nav').getBoundingClientRect().bottom),
      cols: getComputedStyle(document.querySelector('#af-ptable tr[data-param="cash0"]')).gridTemplateColumns.split(' ').length, tiers: getComputedStyle(document.querySelector('.af-tiers')).gridTemplateColumns.split(' ').length }));
    check(m0.overflow === 0 && m0.toc === 'none' && m0.chips === 'sticky', 'điện thoại: không tràn ngang, mục lục dọc ẩn, hàng chip dính');
    check(Math.abs(m0.chipTop - m0.navB) <= 2 && m0.cols === 1 && m0.tiers === 1, 'hàng chip nằm sát dưới menu (' + m0.chipTop + '/' + m0.navB + '); dòng tham số và bậc xếp một cột');
    await mp.evaluate(() => document.getElementById('ly-thuyet-kdqt').scrollIntoView()); await mp.waitForTimeout(300);
    const m1 = await mp.evaluate(() => ({ active: AF.state().active, chip: (document.querySelector('.af-chips a[aria-current="true"]') || {}).textContent, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
    check(m1.active === 'ly-thuyet-kdqt' && m1.chip === 'Lý thuyết' && m1.overflow === 0, 'cuộn tới Khung lý thuyết → chip «Lý thuyết» sáng, vẫn không tràn ngang');
    check(merrors.length === 0, 'không lỗi JS trên điện thoại' + (merrors.length ? ': ' + merrors.join(' | ') : ''));
    await mctx.close();
  } finally { await browser.close(); }
  console.log(fails ? `academic-foundation: ${fails} lỗi` : 'academic-foundation: ok');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
