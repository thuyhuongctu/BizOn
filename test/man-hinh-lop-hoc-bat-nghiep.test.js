// Màn hình lớp học – tab thứ tư «Bật Nghiệp» (19/11/2026, đặc tả specs/007-cong-cu-giang-vien, câu chuyện 1, làm rõ 1A).
// Mỗi đội là một xe tải đất sét trên tuyến Cần Thơ → TP. Hồ Chí Minh → Khánh Hòa → Đà Nẵng → Thanh Hóa → Hà Nội,
// đứng ở chặng = vòng lớn nhất đã nộp. Bảng 10 đội đầu theo lợi nhuận lũy kế, đúng thứ tự BizOnInstructorPage.teams().
// 1. Bộ chuyển dữ liệu fromBn + dữ liệu minh họa.  2. Trang, sw.js.  3. Trình duyệt: minh họa, chưa đăng nhập,
// giảng viên đã đăng nhập (máy chủ giả lập, tự làm mới 20 giây), tiếng Anh, 390/1280 px, không lỗi JS.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
const SB = 'https://ceytblfelodpnudomccn.supabase.co';
const D = require('../js/man-hinh-lop-hoc-data.js');
const gctx = { window: {} }; vm.createContext(gctx); vm.runInContext(read('js/bizon-grading.js'), gctx);
const P = gctx.window.BizOnInstructorPage;

// ---- 1. Dữ liệu
assert.ok(D.GAMES.bn && D.GAMES.bn.vi === 'Bật Nghiệp' && D.GAMES.bn.en === 'Bat Nghiep', 'GAMES.bn');
assert.deepEqual(D.BN_CITIES.map(c => c.vi), ['Cần Thơ', 'TP. Hồ Chí Minh', 'Khánh Hòa', 'Đà Nẵng', 'Thanh Hóa', 'Hà Nội'], 'đúng thứ tự vòng trong game');
assert.deepEqual(D.BN_CITIES.map(c => c.en), ['Can Tho', 'Ho Chi Minh City', 'Khanh Hoa', 'Da Nang', 'Thanh Hoa', 'Hanoi']);
assert.ok(read('js/app.js').includes('Cần Thơ → TP. Hồ Chí Minh → Khánh Hòa → Đà Nẵng → Thanh Hóa → Hà Nội'), 'thứ tự tỉnh vẫn khớp game');
{
  const sub = (team, round, np) => ({ team_name: team, round_number: round, created_at: '2026-11-19T0' + round + ':00:00Z', result_json: { netProfit: np, share: 20 } });
  const subs = [sub('Đội A', 1, 50), sub('Đội A', 2, 70), sub('đội a', 3, 10), sub('Đội B', 1, 200), sub('GV Thử', 1, 999), sub('Đội C', 1, -40), sub('Đội C', 2, -10),
    sub('x@student.ctu.edu.vn', 2, 5)];
  assert.throws(() => D.fromBn(subs), /bizon-grading/, 'thiếu bizon-grading.js thì báo rõ, không tự tính');
  const d = D.fromBn(subs, P.teams);
  const want = Array.from(P.teams(subs)).filter(t => !t.staff).map(t => t.name.replace(/@.*/, ''));
  assert.deepEqual(d.teams.map(t => t.name), want, 'cùng thứ tự với Trang Giảng viên');
  assert.deepEqual(d.teams.map(t => t.name), ['Đội B', 'Đội A', 'x', 'Đội C'], 'lợi nhuận lũy kế; gộp hoa/thường; bỏ đội GV');
  assert.deepEqual(d.teams.map(t => t.stage), [0, 2, 1, 1], 'chặng = vòng lớn nhất đã nộp − 1');
  assert.equal(d.teams[1].score, 130); assert.equal(d.teams[1].label, '130 triệu ₫'); assert.equal(d.teams[1].labelEn, '₫130m');
  assert.equal(d.teams[1].sub, 'Vòng 3/6 · Khánh Hòa'); assert.equal(d.teams[1].subEn, 'Round 3/6 · Khanh Hoa');
  assert.equal(d.teams[0].progress, 1); assert.equal(d.teams[3].progress, 0.04, 'lỗ: thanh tối thiểu');
  assert.equal(d.submitted, 4); assert.deepEqual(d.stages, [1, 2, 1, 0, 0, 0]); assert.equal(d.round, 3); assert.equal(d.atRound, 1);
  assert.ok(!JSON.stringify(d).includes('@'), 'không chiếu email');
  const e = D.fromBn([], P.teams); assert.deepEqual([e.submitted, e.round, e.atRound, e.teams.length], [0, 0, 0, 0], 'lớp trống');
  assert.equal(D.fromBn([sub('Đội Z', 8, 1)], P.teams).teams[0].stage, 5, 'vòng lạ vượt 6: đứng ở Hà Nội');
}
{
  const a = D.demo('bn', P.teams), b = D.demo('bn', P.teams);
  assert.deepEqual(a, b, 'minh họa không ngẫu nhiên');
  assert.equal(a.submitted, 32, 'lớp đông 32 đội');
  assert.ok(a.stages.every(n => n > 0), 'có đội ở cả sáu chặng');
  assert.ok(a.teams.every(t => /^Demo /.test(t.name)), 'tên đội rõ là giả');
  assert.deepEqual(a.teams.map(t => t.name), Array.from(P.teams(D.demoBnSubs()), t => t.name));
}

// ---- 2. Trang, service worker
const page = read('man-hinh-lop-hoc.html');
assert.ok(page.includes('<button type="button" data-game="bn" aria-pressed="false" data-en="Bat Nghiep">Bật Nghiệp</button>'), 'nút tab thứ tư');
assert.ok(page.includes('<script src="js/bizon-grading.js"></script>'), 'nạp hàm xếp hạng của Trang Giảng viên');
assert.ok(page.includes("bn: 'BizOn Game 3D.html'"), 'đường dẫn game cho sinh viên');
assert.ok(/game === 'bn'[^\n]*I\.submissions\(cls\)/.test(page), 'đọc bizon_submissions_v2 khi đã đăng nhập');
const sw = read('sw.js');
assert.ok(+(sw.match(/const CACHE = 'bizon-v(\d+)'/) || [])[1] >= 904, 'sw.js ≥ v904');
assert.ok(sw.includes("'./js/bizon-grading.js'"), 'sw.js có js/bizon-grading.js');
for (const f of ['js/engine.js', 'js/app.js', 'js/backend.js']) assert.ok(!page.includes('src="' + f + '"'), 'không nạp ' + f + ' (hồ sơ quyền tác giả)');

// ---- 3. Trình duyệt
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const VI = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;
const NAMES = /Bến Phù Sa|Cần Thơ|Vĩnh Long|Mỹ Tho|Cái Mép|Mekong|Đỗ Thùy Hương|Phan Anh Tú/g;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [];
  const open = async (q, vp = { width: 1280, height: 800 }, ctx) => {
    const pg = await (ctx || b).newPage(ctx ? undefined : { viewport: vp });
    pg.on('pageerror', e => errs.push(q + ': ' + e.message));
    pg.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errs.push(q + ': ' + m.text()); });
    await pg.route(/\.(woff2?|mp3|mp4)(\?|$)/, r => r.abort());
    if (!ctx) await pg.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await pg.goto(BASE + '/man-hinh-lop-hoc.html?' + q, { waitUntil: 'load', timeout: 60000 });
    return pg;
  };
  const noOverflow = pg => pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.body.scrollWidth <= innerWidth &&
    [...document.querySelectorAll('header, header *, .hud, .hud *')].every(e => { const r = e.getBoundingClientRect(); return !r.width || (r.left >= -1 && r.right <= innerWidth + 1); }));
  const info = pg => pg.evaluate(() => window.__manHinhLop && window.__manHinhLop.info);
  try {
    // Minh họa 1280×800
    const pg = await open('game=bn&demo=1');
    await pg.waitForFunction(() => document.querySelectorAll('#tags .lab').length === 6, null, { timeout: 30000 });
    assert.equal(await pg.locator('.tabs button').count(), 4, 'bốn tab');
    assert.equal(await pg.getAttribute('.tabs button[data-game="bn"]', 'aria-pressed'), 'true');
    const inf = await info(pg);
    assert.deepEqual(inf.cities, ['Cần Thơ', 'TP. Hồ Chí Minh', 'Khánh Hòa', 'Đà Nẵng', 'Thanh Hóa', 'Hà Nội'], 'sáu thành phố trên sa bàn');
    const exp = await pg.evaluate(() => { const T = window.BizOnInstructorPage.teams(window.BizOnClassScreen.demoBnSubs());
      return T.slice(0, 10).map(t => ({ name: t.name, stage: Math.min(6, t.last.round_number) - 1 })); });
    assert.deepEqual(inf.trucks, exp, 'mười xe của mười đội đầu, mỗi xe ở chặng = vòng đã nộp');
    const labs = await pg.$$eval('#tags .lab', els => els.map(e => e.textContent));
    assert.ok(labs[2].startsWith('3. Khánh Hòa') && labs[2].includes('12 đội'), 'nhãn chặng đếm cả lớp: ' + labs[2]);
    assert.deepEqual(await pg.$$eval('#rank li b', els => els.map(e => e.textContent)), exp.map(t => t.name), 'bảng trùng thứ tự teams()');
    assert.equal(await pg.textContent('#count'), '2'); assert.equal(await pg.textContent('#countLabel'), 'đội đã nộp vòng 6');
    assert.ok((await pg.textContent('#upd')).startsWith('32 đội · vòng 1–6/6'), 'dòng tiến độ cả lớp');
    assert.ok((await pg.textContent('#note')).includes('lợi nhuận lũy kế'), 'ghi rõ tiêu chí xếp hạng');
    assert.equal(await pg.locator('#demoChip').isVisible(), true);
    assert.equal(await pg.evaluate(() => document.body.classList.contains('night')), false, 'mặc định ban ngày');
    assert.ok(await noOverflow(pg), '1280px: không tràn ngang');
    await pg.click('#night'); assert.ok(await pg.evaluate(() => document.body.classList.contains('night')));
    await pg.waitForFunction(() => window.__manHinhLop.info && window.__manHinhLop.info.night === true, null, { timeout: 30000 });
    // Đổi sang tab khác rồi về lại
    await pg.click('.tabs button[data-game="hcsr"]');
    await pg.waitForFunction(() => document.querySelectorAll('#tags .st').length === 8, null, { timeout: 30000 });
    await pg.click('.tabs button[data-game="bn"]');
    await pg.waitForFunction(() => document.querySelectorAll('#tags .lab').length === 6, null, { timeout: 30000 });
    assert.ok(pg.url().includes('game=bn'));
    await pg.close();

    // Điện thoại 390 px
    const ph = await open('game=bn&demo=1', { width: 390, height: 844 });
    await ph.waitForFunction(() => document.querySelectorAll('#tags .lab').length === 6, null, { timeout: 30000 });
    assert.ok(await noOverflow(ph), '390px: không tràn ngang');
    await ph.close();

    // Chưa đăng nhập: màn đăng nhập, không gọi dữ liệu lớp, không lộ đội nào
    const gate = await b.newPage({ viewport: { width: 1280, height: 800 } }); const rpc = [];
    gate.on('pageerror', e => errs.push('gate: ' + e.message));
    await gate.route(/supabase\.co/, r => { rpc.push(r.request().url()); return r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }); });
    await gate.goto(BASE + '/man-hinh-lop-hoc.html?game=bn', { waitUntil: 'load', timeout: 60000 });
    await gate.waitForSelector('#gate.on');
    await gate.waitForFunction(() => document.querySelectorAll('#tags .lab').length === 6, null, { timeout: 30000 });
    assert.equal(await gate.locator('#rank li b').count(), 0, 'không lộ đội');
    assert.deepEqual((await info(gate)).trucks, [], 'không xe nào');
    assert.ok(!rpc.some(u => /bizon_submissions_v2/.test(u)), 'không gọi bizon_submissions_v2');
    await gate.close();

    // Tiếng Anh: minh họa và màn đăng nhập
    for (const q of ['game=bn&demo=1&lang=en', 'game=bn&lang=en']) {
      const en = await open(q);
      await en.waitForFunction(() => document.querySelectorAll('#tags .lab').length === 6, null, { timeout: 30000 });
      await en.waitForTimeout(500);
      const left = await en.evaluate(() => { const out = [], w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (w.nextNode()) { const t = w.currentNode.textContent.trim(), el = w.currentNode.parentElement; if (t && el && el.offsetParent !== null && !el.closest('script,style')) out.push(t); }
        return out; });
      assert.deepEqual(left.filter(t => VI.test(t.replace(NAMES, ''))), [], q + ': còn chữ tiếng Việt ở chế độ EN');
      assert.ok(left.some(t => t.includes('Ho Chi Minh City')) && left.some(t => t.includes('Hanoi')), q + ': tên thành phố tiếng Anh');
      if (q.includes('demo')) { assert.equal(await en.textContent('#countLabel'), 'teams submitted round 6'); assert.ok((await en.textContent('#rank li .v')).startsWith('₫')); }
      await en.close();
    }

    // Giảng viên đã đăng nhập (máy chủ giả lập): đọc bizon_submissions_v2, xe tiến khi đội chốt vòng mới, không tải lại trang
    const c2 = await b.newContext({ viewport: { width: 1280, height: 800 } });
    await c2.addInitScript(() => localStorage.setItem('bizon-instructor-session', JSON.stringify({ access: 'tok-gv', refresh: 'r', exp: Date.now() + 3600e3, email: 'gv@ctu.edu.vn' })));
    const sub = (team, round, np) => ({ team_name: team, round_number: round, created_at: '2026-11-19T0' + round + ':00:00Z', result_json: { netProfit: np, share: 20 } });
    let rows = [1, 2, 3].flatMap(r => [sub('Đội Sen', r, 60), sub('Đội Lúa', r, 40)]);
    const seen = [];
    await c2.route(SB + '/rest/v1/rpc/**', r => {
      const fn = r.request().url().split('/rpc/')[1], body = JSON.parse(r.request().postData() || '{}'); seen.push(fn + ':' + (body.p_class_code || ''));
      const data = { bizon_my_classes: [{ class_code: 'KT-01' }], bizon_submissions_v2: rows }[fn];
      return r.fulfill({ contentType: 'application/json', body: JSON.stringify(data == null ? [] : data) });
    });
    const sc = await open('game=bn', null, c2);
    await sc.waitForFunction(() => document.querySelectorAll('#rank li b').length === 2, null, { timeout: 30000 });
    assert.ok(seen.includes('bizon_submissions_v2:KT-01'), 'gọi bizon_submissions_v2 cho lớp KT-01');
    assert.equal(await sc.locator('#gate.on').count(), 0);
    assert.equal(await sc.textContent('#count'), '2'); assert.equal(await sc.textContent('#countLabel'), 'đội đã nộp vòng 3');
    assert.ok((await sc.textContent('#upd')).includes('tự làm mới mỗi 20 giây'));
    assert.deepEqual((await info(sc)).trucks.map(t => t.stage), [2, 2]);
    assert.ok((await sc.textContent('#joinUrl')).includes('BizOn%20Game%203D.html?lop=KT-01'), 'đường dẫn game Bật Nghiệp cho sinh viên');
    rows = rows.concat([sub('Đội Lúa', 4, 300)]);
    await sc.waitForFunction(() => { const i = window.__manHinhLop.info; return i && i.trucks.length === 2 && i.trucks[0].name === 'Đội Lúa' && i.trucks[0].stage === 3; }, null, { timeout: 30000 });
    assert.equal(await sc.textContent('#countLabel'), 'đội đã nộp vòng 4'); assert.equal(await sc.textContent('#count'), '1');
    assert.deepEqual(await sc.$$eval('#rank li b', els => els.map(e => e.textContent)), ['Đội Lúa', 'Đội Sen']);
    // Mất mạng: giữ số liệu lần cuối, báo không tải được
    await c2.unroute(SB + '/rest/v1/rpc/**'); await c2.route(SB + '/rest/v1/rpc/**', r => r.abort('internetdisconnected'));
    await sc.waitForFunction(() => /Không tải được kết quả/.test(document.getElementById('upd').textContent), null, { timeout: 30000 });
    assert.equal(await sc.locator('#rank li b').count(), 2, 'mất mạng: giữ bảng lần cuối');
    await c2.close();
  } finally { await b.close(); }
  assert.deepEqual(errs, []);
  console.log('man-hinh-lop-hoc-bat-nghiep: ok');
})().catch(e => { console.error(e); process.exit(1); });
