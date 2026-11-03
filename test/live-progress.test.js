// Tiến độ từng vụ (03/11/2026): game gửi tiến độ sau mỗi tuần/quý/vụ (js/live-progress.js → bizon_live_progress_upsert),
// Màn hình lớp học đọc lại (bizon_live_progress_class) và phát đường dẫn ?lop= kèm mã QR cho sinh viên.
// 1. Tĩnh: migration chỉ cho sinh viên đăng nhập ghi, chủ lớp đọc, không email; năm trang game có gọi report; CI SQL chạy smoke.
// 2. Trình duyệt: báo cáo chỉ gửi khi có mã lớp + đăng nhập, đúng tham số, không gửi trùng; nhãn ?lop= nhắc đăng nhập.
// 3. Trình duyệt: màn hình lớp học (giảng viên, máy chủ giả lập) gộp kết quả cuối với tiến độ, hiện đường dẫn + QR.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';

// ---- 1. Tĩnh
const mig = read('supabase/migrations/20261103000000_live_progress.sql');
assert.ok(/enable row level security/.test(mig) && /revoke all on table public\.live_progress from public, anon, authenticated/.test(mig), 'bảng khoá, chỉ qua RPC');
assert.ok(/bizon_is_student_email\(v_email\)/.test(mig), 'chỉ email trường được gửi');
assert.ok(/where bizon_owns_class\(p_class_code\)/.test(mig), 'chỉ chủ lớp đọc');
const readFn = mig.slice(mig.indexOf('function public.bizon_live_progress_class'));
assert.ok(!/email/i.test(readFn.slice(0, readFn.indexOf('$$;'))), 'hàm đọc không trả email');
assert.ok(/grant execute on function public\.bizon_live_progress_upsert\([^)]*\) to authenticated;/.test(mig) && !/to anon/.test(mig), 'anon không gọi được');
const wf = read('.github/workflows/supabase-student-login.yml');
assert.ok(wf.includes('-f test/sql/live_progress_smoke.sql') && wf.includes("- 'test/sql/live_progress_smoke.sql'"), 'CI chạy smoke SQL');
assert.ok(read('.github/workflows/supabase-migrate.yml').includes('20261103000000_live_progress.sql'), 'có trong danh sách áp migration');
const hooks = {
  'ben-phu-sa.html': "game: 'bps', round: S.week, roundsTotal: 5", 'ben-phu-sa-3d.html': "game: 'bps', round: S.week, roundsTotal: 5",
  'brand-passport.html': "game: 'hcth', round: S.q, roundsTotal: 6", 'Ho Chieu Thuong Hieu 3D.html': "game: 'hcth', round: S.q, roundsTotal: 6",
  'js/dp2-ui.js': "game: 'hcsr', round: h, roundsTotal: tot",
};
for (const [f, needle] of Object.entries(hooks)) assert.ok(read(f).includes(needle), f + ': gửi tiến độ mỗi vụ');
for (const f of ['ben-phu-sa.html', 'ben-phu-sa-3d.html', 'brand-passport.html', 'Ho Chieu Thuong Hieu 3D.html']) assert.ok(read(f).includes('<script src="js/live-progress.js"></script>'), f + ': nạp live-progress.js');
assert.ok(read('lab/ho-chieu-sau-rieng-v2.html').includes('<script src="../js/live-progress.js"></script>'));
assert.ok(!read('lab/ho-chieu-sau-rieng.html').includes('live-progress'), 'bản 2D không gọi mạng');
assert.ok(/async liveProgress\(code, game\)[^\n]*bizon_live_progress_class/.test(read('js/instructor-api.js')));
assert.ok(read('sw.js').includes("'./js/live-progress.js'"));

// ---- 2 + 3. Trình duyệt
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const SB = 'https://ceytblfelodpnudomccn.supabase.co';
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [];
  try {
    // Trang thử nhỏ, phục vụ giả từ cùng gốc để có sessionStorage/localStorage thật
    const ctx = await b.newContext();
    const calls = [];
    await ctx.route(BASE + '/__live-test.html*', r => r.fulfill({ contentType: 'text/html; charset=utf-8',
      body: '<!doctype html><html lang="vi"><body><script src="js/backend-config.js"></script><script src="js/live-progress.js"></script></body></html>' }));
    await ctx.route(SB + '/rest/v1/rpc/**', async r => { calls.push({ url: r.request().url(), body: JSON.parse(r.request().postData() || '{}'), auth: r.request().headers().authorization });
      await r.fulfill({ contentType: 'application/json', body: '{"ok":true}' }); });
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(BASE + '/__live-test.html');
    // Không mã lớp → bỏ qua; có mã lớp nhưng chưa đăng nhập → bỏ qua
    assert.equal(await pg.evaluate(() => BizOnLive.report({ game: 'bps', round: 1, roundsTotal: 5, score: 100 })), 'skip:no-class');
    assert.equal(await pg.evaluate(() => BizOnLive.report({ game: 'bps', round: 1, roundsTotal: 5, classCode: 'KT-01' })), 'skip:no-login');
    assert.equal(await pg.evaluate(() => BizOnLive.report({ game: 'xyz', round: 1, roundsTotal: 5, classCode: 'KT-01' })), 'skip:game');
    assert.equal(calls.length, 0);
    // Đăng nhập (phiên do student-login.js ghi) → gửi đúng tham số, không gửi trùng
    await pg.evaluate(() => sessionStorage.setItem('bizon-student-session', JSON.stringify({ accessToken: 'tok-sv', expiresAt: Date.now() + 3600e3, email: 'a@student.ctu.edu.vn' })));
    assert.equal(await pg.evaluate(() => BizOnLive.report({ game: 'bps', round: 2, roundsTotal: 5, score: 412.345, team: 'Đội <A>', classCode: 'kt-01' })), 'sent');
    assert.equal(await pg.evaluate(() => BizOnLive.report({ game: 'bps', round: 2, roundsTotal: 5, score: 412.345, team: 'Đội <A>', classCode: 'kt-01' })), 'skip:same');
    assert.equal(calls.length, 1);
    assert.ok(calls[0].url.endsWith('/rest/v1/rpc/bizon_live_progress_upsert')); assert.equal(calls[0].auth, 'Bearer tok-sv');
    assert.deepEqual(calls[0].body, { p_class_code: 'KT-01', p_game: 'bps', p_team_name: 'Đội A', p_round: 2, p_rounds_total: 5, p_score: 412.3, p_stage: null, p_finished: false, p_detail: null });
    // Mã lớp từ game (bp-class) khi không truyền; vòng vượt tổng bị chặn về tổng
    await pg.evaluate(() => localStorage.setItem('bp-class', 'QTKD-2026-A'));
    await pg.evaluate(() => BizOnLive.report({ game: 'hcth', round: 9, roundsTotal: 6, score: 70, finished: true, detail: { markets: [1, 0] } }));
    assert.equal(calls[1].body.p_class_code, 'QTKD-2026-A'); assert.equal(calls[1].body.p_round, 6); assert.equal(calls[1].body.p_finished, true);
    // Lỗi máy chủ không làm hỏng game
    await ctx.unroute(SB + '/rest/v1/rpc/**'); await ctx.route(SB + '/rest/v1/rpc/**', r => r.fulfill({ status: 500, body: '{}' }));
    assert.equal(await pg.evaluate(() => BizOnLive.report({ game: 'hcsr', round: 1, roundsTotal: 6, stage: 1, classCode: 'KT-01' })), 'error');
    // ?lop= : ghi nhớ mã lớp, chưa đăng nhập thì hiện nhãn nhắc
    const p2 = await ctx.newPage(); p2.on('pageerror', e => errs.push(e.message));
    await p2.goto(BASE + '/__live-test.html?lop=kt330h-01');
    await p2.evaluate(() => sessionStorage.removeItem('bizon-student-session'));
    await p2.reload();
    await p2.waitForSelector('#bz-live-chip');
    assert.ok((await p2.textContent('#bz-live-chip')).includes('Lớp KT330H-01 · đăng nhập email trường'));
    assert.equal(await p2.evaluate(() => localStorage.getItem('bizon-live-class')), 'KT330H-01');
    await ctx.close();

    // Màn hình lớp học với giảng viên đã đăng nhập (máy chủ giả lập)
    const c2 = await b.newContext({ viewport: { width: 1920, height: 1080 } });
    await c2.addInitScript(() => localStorage.setItem('bizon-instructor-session', JSON.stringify({ access: 'tok-gv', refresh: 'r', exp: Date.now() + 3600e3, email: 'gv@ctu.edu.vn' })));
    const seen = [];
    await c2.route(SB + '/rest/v1/rpc/**', r => {
      const fn = r.request().url().split('/rpc/')[1], body = JSON.parse(r.request().postData() || '{}'); seen.push(fn + ':' + (body.p_game || ''));
      const data = { bizon_my_classes: [{ class_code: 'KT-01' }],
        ft_class_leaderboard: [{ player_name: 'An', team_name: 'Đội Sen', total_revenue: 880, efficiency: 80, final_rank: 1 }],
        bizon_live_progress_class: body.p_game === 'bps' ? [{ team_name: 'Đội Lục Bình', round: 3, rounds_total: 5, score: 300 }, { team_name: 'Đội Mù U', round: 2, rounds_total: 5, score: 210 }] : [] }[fn];
      return r.fulfill({ contentType: 'application/json', body: JSON.stringify(data == null ? [] : data) });
    });
    const sc = await c2.newPage(); sc.on('pageerror', e => errs.push(e.message));
    await sc.goto(BASE + '/man-hinh-lop-hoc.html?game=bps', { waitUntil: 'load' });
    await sc.waitForFunction(() => document.querySelectorAll('#rank li').length === 3, null, { timeout: 30000 });
    assert.ok(seen.includes('bizon_live_progress_class:bps') && seen.includes('ft_class_leaderboard:'));
    assert.equal(await sc.textContent('#count'), '2'); assert.equal(await sc.textContent('#countLabel'), 'nhóm đang chơi');
    assert.ok((await sc.textContent('#upd')).startsWith('Tuần 2–3/5 · 1 đã nộp kết quả cuối'));
    assert.deepEqual(await sc.$$eval('#rank li b', els => els.map(e => e.textContent)), ['Đội Sen', 'Đội Lục Bình', 'Đội Mù U']);
    assert.equal(await sc.locator('#join').isVisible(), true);
    assert.ok((await sc.textContent('#joinUrl')).endsWith('/ben-phu-sa.html?lop=KT-01'));
    assert.ok((await sc.getAttribute('#joinQr', 'src')).length > 500, 'có mã QR');
    await sc.click('.tabs button[data-game="hcth"]');
    await sc.waitForFunction(() => document.querySelector('#joinUrl').textContent.endsWith('/brand-passport.html?lop=KT-01'), null, { timeout: 30000 });
    await c2.close();
  } finally { await b.close(); }
  assert.deepEqual(errs, []);
  console.log('live-progress: ok');
})().catch(e => { console.error(e); process.exit(1); });
