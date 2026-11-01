// Thư viện tình huống bản 2 (11/2026, theo gói bàn giao design_handoff_thu_vien_tinh_huong):
// cột lọc + kệ theo bậc, chế độ Sinh viên / Giảng viên, trang case 4 bước có địa chỉ riêng (?case=…&step=…).
// 12 «Case mẫu» của bản thiết kế chỉ hiện với ?mau=1, không bao giờ hiện mặc định như case thật.
// Không giả lập đăng nhập giảng viên: ghi chú chỉ dẫn sang Bộ công cụ giảng dạy.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// --- Phần thuần (không DOM) ---
const ctx = { URLSearchParams }; ctx.self = ctx; vm.createContext(ctx);
vm.runInContext(read('js/cham-library.js'), ctx);
const A = ctx.BizOnCaseLibrary;
const J = x => JSON.parse(JSON.stringify(x)), deq = (a, b, m) => assert.deepEqual(J(a), J(b), m); // mảng từ vm khác realm
assert.ok(A, 'chưa xuất BizOnCaseLibrary');
deq(A.CASES.map(c => c.id), ['cham', 'bps', 'srp'], 'ba case thật');
assert.equal(A.SAMPLES.length, 12);
assert.ok(A.SAMPLES.every(c => c.kind === 'draft' && c.sims === 0), 'thẻ mẫu luôn là Case mẫu, không mô phỏng');
assert.ok(A.CASES.every(c => c.kind !== 'draft'), 'case thật không mang nhãn mẫu');
assert.equal(A.casesFor(false).length, 3); assert.equal(A.casesFor(true).length, 15);
const all = A.casesFor(true), F0 = { q: '', tier: 0, kind: 'all', disc: '', region: '' };
assert.equal(A.filterCases(all, F0).length, 15);
deq(A.filterCases(all, { ...F0, q: 'sau rieng' }).map(c => c.id), ['srp'], 'tìm không dấu');
deq(A.filterCases(all, { ...F0, q: 'durian' }).map(c => c.id), ['srp'], 'tìm bằng tên tiếng Anh');
assert.ok(A.filterCases(all, { ...F0, q: 'mekong delta' }).some(c => c.id === 'bps'), 'tìm theo vùng tiếng Anh');
assert.ok(A.filterCases(all, { ...F0, disc: 'Tài chính' }).every(c => c.disc.includes('Tài chính')));
deq(A.filterCases(all, { ...F0, kind: 'full' }).map(c => c.id), ['cham']);
assert.ok(A.filterCases(all, { ...F0, kind: 'sim' }).every(c => c.kind !== 'draft'), '«Có mô phỏng» gồm cả case đầy đủ');
assert.ok(A.filterCases(all, { ...F0, tier: 2, region: 'Cần Thơ' }).every(c => c.tier === 2 && c.region === 'Cần Thơ'));
assert.equal(A.activeCount(F0), 0); assert.equal(A.activeCount({ q: ' x ', tier: 3, kind: 'sim', disc: 'Marketing', region: '' }), 4);
const sh = A.shelves(all);
deq(sh.map(s => s.n), [1, 2, 3]);
sh.forEach(s => { const k = s.items.map(c => c.kind === 'draft'); deq(k, k.slice().sort(), 'case thật đứng trước Case mẫu trong kệ'); });
deq(A.shelves(A.filterCases(all, { ...F0, tier: 3 })).map(s => s.n), [3], 'chỉ hiện kệ có kết quả');
assert.equal(A.related(A.casesFor(false), A.CASES[0]).same, false, 'chỉ một case trong bậc thì gợi ý case khác');
assert.ok(A.related(A.casesFor(false), A.CASES[0]).items.length === 2);
assert.ok(A.related(all, A.CASES[0]).same && A.related(all, A.CASES[0]).items.length === 3);
// Địa chỉ
assert.equal(JSON.stringify(A.parseUrl('?case=cham&step=3')), JSON.stringify({ mau: false, view: 'case', caseId: 'cham', step: 3 }));
assert.equal(A.parseUrl('?case=bps&step=3').step, 1, 'bước chỉ dùng cho CHAM');
assert.equal(A.parseUrl('?case=mau1').view, 'lib', 'Case mẫu không mở được khi chưa bật ?mau=1');
assert.equal(A.parseUrl('?case=mau1&mau=1').view, 'case');
assert.equal(A.parseUrl('?case=cham&step=9').step, 1);
assert.equal(A.buildUrl({ view: 'case', caseId: 'cham', step: 2 }), '?case=cham&step=2');
assert.equal(A.buildUrl({ view: 'case', caseId: 'cham', step: 1, mau: true }), '?case=cham&mau=1');
assert.equal(A.buildUrl({ view: 'lib', caseId: 'cham', step: 2 }), '');
// Liên kết nội bộ tồn tại; không giả đăng nhập
for (const h of A.SIMS.map(s => s.href).concat(Object.values(A.LINKS), A.CASES.filter(c => c.href).map(c => c.href))) {
  const f = h.split('#')[0]; assert.ok(fs.existsSync(path.join(ROOT, f.endsWith('/') ? f + 'index.html' : f)), 'thiếu tệp ' + h);
}
assert.ok(read('cham/bo-cong-cu.html').includes('id="tk4"'), 'đích ghi chú giảng dạy');
const js = read('js/cham-library.js'), html = read('thu-vien-tinh-huong.html');
assert.ok(!/password|mật khẩu|signIn|login\(/i.test(js), 'không giả lập đăng nhập');
assert.ok(js.includes('hiện chưa có khóa'), 'nói rõ chưa có khóa giảng viên');
assert.ok(!/https?:\/\//.test(js.replace(/^\s*\/[*/].*$/gm, '')), 'liên kết trong thư viện là nội bộ');
assert.ok(html.includes('<meta name="bizon-nav-current" content="lop-hoc.html">'));
assert.ok(read('js/bizon-clay-nav.js').includes('bizon-nav-current'));
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 731);

// --- Trình duyệt ---
(async () => {
  const b = await chromium.launch(); const errs = [];
  try {
    const pg = await b.newPage({ viewport: { width: 1280, height: 900 } }); pg.on('pageerror', e => errs.push(e.message));
    await pg.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
    await pg.addInitScript(() => { try { if (!sessionStorage.getItem('tv-init')) { localStorage.clear(); localStorage.setItem('bizon-lang', 'vi'); sessionStorage.setItem('tv-init', '1'); } } catch (e) {} /* chỉ xóa ở lần nạp đầu */ });
    await pg.goto(BASE + '/thu-vien-tinh-huong.html', { waitUntil: 'load', timeout: 60000 }); await pg.waitForTimeout(400);
    assert.equal(await pg.$$eval('.tv-card', l => l.length), 3, 'mặc định chỉ 3 case thật');
    assert.equal(await pg.$$eval('.tv-shelf', l => l.length), 3);
    assert.equal(await pg.$$eval('[data-g="kind"][data-v="draft"]', l => l.length), 0, 'không có chip Case mẫu khi ẩn thẻ mẫu');
    assert.equal(await pg.textContent('#tv-count'), '3 / 3 case');
    assert.equal(await pg.$eval('#clay-nav a[aria-current="page"]', a => a.getAttribute('href')).then(h => h.endsWith('lop-hoc.html')), true, 'menu tô Lớp học');
    // Lọc
    await pg.fill('#tv-q', 'sầu riêng'); await pg.waitForTimeout(100);
    assert.equal(await pg.$$eval('.tv-card', l => l.length), 1);
    await pg.click('[data-act="reset"]'); assert.equal(await pg.$$eval('.tv-card', l => l.length), 3);
    await pg.click('[data-g="tier"][data-v="2"]'); assert.deepEqual(await pg.$$eval('.tv-card', l => l.map(x => x.dataset.open)), ['cham']);
    await pg.click('[data-g="tier"][data-v="0"]');
    // Giảng viên: dải thời lượng trên thẻ
    await pg.click('#tv-roles [data-v="gv"]'); assert.equal(await pg.$$eval('.tv-gvstrip', l => l.length), 3);
    // Mở CHAM → 4 bước, địa chỉ riêng
    await pg.click('.tv-card[data-open="cham"]');
    assert.ok(pg.url().endsWith('?case=cham'), 'địa chỉ case: ' + pg.url());
    assert.equal(await pg.$$eval('.tv-steps button', l => l.length), 4);
    assert.equal(await pg.$$eval('.tv-stats > div', l => l.length), 4);
    assert.ok(await pg.$('.tv-gv'), 'góc giảng viên khi xem với tư cách giảng viên');
    await pg.click('[data-act="notes"]'); assert.equal(await pg.$$eval('.tv-lock', l => l.length), 3);
    assert.equal(await pg.getAttribute('.tv-gvgo', 'href'), 'cham/bo-cong-cu.html#tk4');
    await pg.click('[data-act="next"]'); assert.ok(pg.url().endsWith('?case=cham&step=2'));
    await pg.click('[data-dot="3"]'); await pg.click('[data-dot="3"]');
    assert.equal(await pg.$$eval('.tv-dots button.on', l => l.length), 2, 'bấm lại cùng chấm thì giảm một');
    await pg.click('[data-step="3"]'); assert.equal(await pg.$$eval('.tv-sims a[target="_blank"][rel="noopener"]', l => l.length), 4);
    await pg.click('[data-step="4"]'); await pg.fill('#tv-reflect', 'Tính lại hòa vốn trên 4 tỷ'); assert.equal(await pg.isVisible('#tv-saved'), true);
    assert.equal(await pg.evaluate(() => JSON.parse(localStorage.getItem('bizon-thuvien-v1')).found), 2);
    // Tải lại giữ bước và phản tư; Back về thư viện
    await pg.reload({ waitUntil: 'load' }); await pg.waitForTimeout(300);
    assert.equal(await pg.$eval('.tv-steps button.cur', b => b.dataset.step), '4');
    assert.equal(await pg.inputValue('#tv-reflect'), 'Tính lại hòa vốn trên 4 tỷ');
    assert.equal(await pg.$$eval('.tv-related .tv-card', l => l.length), 2, 'gợi ý case khác');
    await pg.goto(BASE + '/thu-vien-tinh-huong.html', { waitUntil: 'load' }); await pg.click('.tv-card[data-open="srp"]');
    assert.ok(await pg.$('a.tv-btn.primary[href="ho-chieu-sau-rieng.html"]'), 'nút chơi mô phỏng');
    await pg.goBack(); await pg.waitForTimeout(200); assert.equal(await pg.isVisible('#tv-lib'), true, 'Back về thư viện');
    // Tiếng Anh
    await pg.click('#clay-nav [data-lang="en"]'); await pg.waitForTimeout(200);
    assert.equal(await pg.textContent('#tv-count'), '3 of 3 cases');
    assert.ok((await pg.textContent('#tv-shelves')).includes('Durian Passport'));
    // ?mau=1: thẻ minh họa có nhãn và ghi chú
    await pg.goto(BASE + '/thu-vien-tinh-huong.html?mau=1', { waitUntil: 'load' }); await pg.waitForTimeout(200);
    assert.equal(await pg.$$eval('.tv-card', l => l.length), 15);
    assert.equal(await pg.isVisible('#tv-sample'), true); assert.equal(await pg.isVisible('#tv-lic-sample'), true);
    // Điện thoại: cột lọc gập sau nút, không tràn ngang
    const m = await b.newPage({ viewport: { width: 390, height: 844 } }); m.on('pageerror', e => errs.push(e.message));
    await m.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
    await m.goto(BASE + '/thu-vien-tinh-huong.html', { waitUntil: 'load' }); await m.waitForTimeout(300);
    assert.equal(await m.isVisible('#tv-filters'), false); await m.click('#tv-ftoggle'); assert.equal(await m.isVisible('#tv-filters'), true);
    await m.click('[data-g="tier"][data-v="1"]'); assert.equal(await m.textContent('#tv-fbadge'), '1');
    assert.ok(await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'tràn ngang trên điện thoại (thư viện)');
    await m.goto(BASE + '/thu-vien-tinh-huong.html?case=cham&step=2', { waitUntil: 'load' }); await m.waitForTimeout(300);
    assert.ok(await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'tràn ngang trên điện thoại (case)');
  } finally { await b.close(); }
  assert.deepEqual(errs, []);
  console.log('thu-vien-tinh-huong: ok');
})().catch(e => { console.error(e); process.exit(1); });
