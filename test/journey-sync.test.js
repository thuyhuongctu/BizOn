'use strict';
// Hành trình 3 bậc · J7: đồng bộ hộ chiếu với máy chủ lớp (js/journey-sync.js), khối «Đồng bộ với lớp» trên trang Hành trình,
// thẻ «Hành trang hành trình 3 bậc» trên Trang Giảng viên, migration + kiểm thử SQL + CI. RPC được giả lập bằng page.route.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const J = require('../js/core/journey.js');
const Y = require('../js/journey-sync.js');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

// ---- 1. Hợp nhất thuần ----
const mk = (id, at, extra) => Object.assign({ journeyId: id, updatedAt: at }, extra);
assert.equal(Y.decide(null, null), 'none'); assert.equal(Y.decide(mk('A', '2026-11-03T00:00:00Z'), null), 'push'); assert.equal(Y.decide(null, mk('A', '2026-11-03T00:00:00Z')), 'pull');
assert.equal(Y.decide(mk('A', '2026-11-03T00:00:00Z'), mk('A', '2026-11-03T00:00:00Z')), 'same');
assert.equal(Y.decide(mk('A', '2026-11-04T00:00:00Z'), mk('A', '2026-11-03T00:00:00Z')), 'push');
assert.equal(Y.decide(mk('A', '2026-11-03T00:00:00Z'), mk('A', '2026-11-04T00:00:00Z')), 'pull');
assert.equal(Y.decide(mk('A', '2026-11-03T00:00:00Z'), mk('B', '2026-11-01T00:00:00Z')), 'conflict', 'khác journeyId → hỏi người dùng dù cũ hơn');
// create() với rpc/store giả: pull ghi kho, push gọi upsert đúng tham số, conflict không tự quyết
(async () => {
  const p0 = J.recordTier1(J.createPassport({ teamName: 'Đội Sync', createdAt: '2026-11-03T02:10:00Z' }), { total: 4, result: { eff: 70, rank: 2 }, history: [], knownPairs: {} });
  const newer = J.recordTier2(p0, { balance: 600, brand: 1.1, quickRatio: 1.2, loan: 0, rdCumulative: 40, history: [] });
  let saved = null, calls = [];
  const sync = Y.create({ rpc: async (fn, args) => { calls.push([fn, args]); if (fn === 'bizon_journey_get') return { passport: newer, updated_at: newer.updatedAt, mine: true }; return { journey_id: args.p_passport.journeyId, updated_at: '2026-11-05T00:00:00Z' }; }, store: { load: () => p0, save: p => { saved = p; return p; } } });
  let r = await sync.sync(); assert.equal(r.action, 'pull'); assert.equal(saved.tiers.t2.status, 'done'); assert.equal(calls[0][1].p_class_code, 'TU-HOC'); assert.equal(calls[0][1].p_team_name, 'Đội Sync');
  const sync2 = Y.create({ rpc: async (fn, args) => { calls.push([fn, args]); return fn === 'bizon_journey_get' ? null : { ok: 1 }; }, store: { load: () => newer, save: () => {} } });
  r = await sync2.sync(); assert.equal(r.action, 'push'); assert.equal(calls[calls.length - 1][0], 'bizon_journey_upsert'); assert.equal(calls[calls.length - 1][1].p_passport.journeyId, newer.journeyId); assert.equal(calls[calls.length - 1][1].p_app_version, 'bizon-journey-v1');
  const other = J.createPassport({ teamName: 'Đội Sync', createdAt: '2026-10-01T00:00:00Z', journeyId: 'J-OTHER' });
  const sync3 = Y.create({ rpc: async fn => (fn === 'bizon_journey_get' ? { passport: other, updated_at: other.updatedAt } : { ok: 1 }), store: { load: () => newer, save: p => { saved = p; } } });
  r = await sync3.sync(); assert.equal(r.action, 'conflict'); assert.equal(r.server.journeyId, 'J-OTHER');
  r = await sync3.sync({ resolve: 'pull' }); assert.equal(r.action, 'pull'); assert.equal(saved.journeyId, 'J-OTHER');
  // hộ chiếu máy chủ hỏng lược đồ → coi như không có → push
  const sync4 = Y.create({ rpc: async fn => (fn === 'bizon_journey_get' ? { passport: { schemaVersion: 9 } } : { ok: 1 }), store: { load: () => newer, save: () => {} } });
  r = await sync4.sync(); assert.equal(r.action, 'push');
})().then(() => {
  // ---- 2. Tĩnh: migration, kiểm thử SQL, CI, trang ----
  const mig = read('supabase/migrations/20261026000000_journey_passports.sql');
  for (const needle of ['alter table public.class_controls add column if not exists journey_carry boolean', 'create or replace function public.bizon_set_journey_carry(p_class_code text, p_on boolean)',
    "'journey_carry', c.journey_carry", 'create table if not exists public.journey_passports', 'alter table public.journey_passports enable row level security', 'revoke all on public.journey_passports from anon, authenticated, public',
    'create or replace function public.bizon_journey_upsert(p_class_code text, p_team_name text, p_passport jsonb, p_app_version text default null)', 'create or replace function public.bizon_journey_get(p_class_code text, p_team_name text)',
    'create or replace function public.bizon_journey_class(p_class_code text)', "delete from journey_passports where updated_at < now() - interval '12 months'", 'grant execute on function public.bizon_journey_upsert(text, text, jsonb, text) to authenticated', 'revoke all on function public.bizon_journey_get(text, text) from public, anon',
    "notify pgrst, 'reload schema';"]) assert.ok(mig.includes(needle), 'migration thiếu: ' + needle);
  assert.ok(!/grant .* to anon/.test(mig.replace(/bizon_class_feed\(text,text\) to anon, authenticated/, '')), 'không cấp hàm mới cho anon');
  const smoke = read('test/sql/journey_passports_smoke.sql'); assert.match(smoke, /journey_passports_smoke: OK/); assert.match(smoke, /permission denied/); assert.match(smoke, /bizon_purge_expired\(\)/);
  const wf = read('.github/workflows/supabase-student-login.yml'); assert.match(wf, /test\/sql\/journey_passports_smoke\.sql/); assert.match(wf, /20261026000000_journey_passports\.sql/);
  const ht = read('hanh-trinh.html'); assert.match(ht, /<script src="js\/backend-config\.js" defer><\/script>\n<script src="js\/student-login\.js" defer><\/script>\n<script src="js\/journey-sync\.js" defer><\/script>/); assert.match(ht, /id="jr-sync" style="grid-column:1\/-1" hidden/);
  assert.match(read('js/hanh-trinh.js'), /StudentLogin\.mount\(\$\('jr-login'\), \{ onChange/);
  const gv = read('Trang Giang Vien.dc.html'); assert.match(gv, /data-panel="journey"/); assert.match(gv, /setJourneyCarry\(on\)/); assert.match(gv, /this\.api\(\)\.journeyPassports\(code\)\.catch\(\(\) => \[\]\)/);
  const api = read('js/instructor-api.js'); assert.match(api, /rpc\('bizon_set_journey_carry', \{ p_class_code: code, p_on: !!on \}\)/); assert.match(api, /rpc\('bizon_journey_class', \{ p_class_code: code \}\)/);
  assert.match(read('js/class-sync.js'), /fetchControls/, 'journey-link đọc cờ qua fetchControls (J5)');
  return run();
}).catch(e => { console.error(e); process.exit(1); });

// ---- 3. Trình duyệt: trang Hành trình đồng bộ với RPC giả ----
async function run() {
  const base = J.recordTier1(J.createPassport({ classCode: 'KT-TEST', teamName: 'Đội Sync', createdAt: '2026-11-03T02:10:00Z' }), { total: 4.2, result: { eff: 71, rank: 2 }, history: [{ w: 1, m: 1 }], knownPairs: {} });
  const newer = J.recordTier2(base, { balance: 612, brand: 1.22, quickRatio: 1.3, loan: 0, rdCumulative: 60, history: [10, 20].map(x => ({ netProfit: x, share: 30, oee: 80 })) });
  newer.updatedAt = new Date(Date.parse(base.updatedAt) + 86400000).toISOString();   // hai bản tạo cùng mili-giây → ép bản máy chủ mới hơn một ngày
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, serviceWorkers: 'block' });
  const page = await ctx.newPage(); const errors = [], rpcCalls = []; let serverMode = 'newer';
  page.on('pageerror', e => errors.push('err: ' + e.message)); page.on('dialog', d => d.dismiss());
  await page.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
  await page.route('**/rest/v1/rpc/**', async route => {
    const url = route.request().url(), fn = url.split('/rpc/')[1].split('?')[0]; let body = {}; try { body = JSON.parse(route.request().postData() || '{}'); } catch (e) {}
    rpcCalls.push({ fn, body, auth: route.request().headers().authorization });
    const json = fn === 'bizon_journey_get' ? (serverMode === 'newer' ? { passport: newer, updated_at: newer.updatedAt, mine: true } : serverMode === 'other' ? { passport: J.createPassport({ classCode: 'KT-TEST', teamName: 'Đội Sync', journeyId: 'J-KHAC-2026', createdAt: '2026-10-01T00:00:00Z' }), updated_at: '2026-10-01T00:00:00Z', mine: false } : null)
      : fn === 'bizon_journey_upsert' ? { journey_id: body.p_passport && body.p_passport.journeyId, updated_at: new Date().toISOString() } : fn === 'bizon_student_domains' ? ['student.ctu.edu.vn'] : [];
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
  });
  await page.addInitScript(p => { try { if (!sessionStorage.getItem('js-init')) { localStorage.clear(); sessionStorage.setItem('js-init', '1'); localStorage.setItem('bizon-journey', JSON.stringify(p)); sessionStorage.setItem('bizon-student-session', JSON.stringify({ accessToken: 'test-token', email: 'sva@student.ctu.edu.vn', expiresAt: Date.now() + 3600000 })); } localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} }, base);
  // Mở trang khi đã đăng nhập: tự đồng bộ một lần → máy chủ mới hơn (có Bậc 2) → kéo về, bảng điều khiển hiện Bậc 2 xong
  await page.goto(`${BASE}/hanh-trinh.html`, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForFunction(() => { const b = document.getElementById('jr-sync'); return !!b && !b.hidden; }, null, { timeout: 60000 });
  await page.waitForFunction(() => /máy chủ/.test((document.getElementById('jr-sync-msg') || {}).textContent || ''), null, { timeout: 15000 });
  const a = await page.evaluate(() => ({ msg: document.getElementById('jr-sync-msg').textContent, t2: JSON.parse(localStorage.getItem('bizon-journey')).tiers.t2.status, st: document.querySelector('.jr-tier[data-tier="t2"]').dataset.status, login: document.getElementById('jr-login').textContent }));
  assert.match(a.msg, /Đã lấy bản mới hơn từ máy chủ/); assert.equal(a.t2, 'done'); assert.equal(a.st, 'done'); assert.match(a.login, /sva@student\.ctu\.edu\.vn/);
  const g = rpcCalls.filter(c => c.fn === 'bizon_journey_get'); assert.equal(g.length, 1); assert.equal(g[0].body.p_class_code, 'KT-TEST'); assert.equal(g[0].body.p_team_name, 'Đội Sync'); assert.equal(g[0].auth, 'Bearer test-token');
  // Máy chủ trống → bấm Đồng bộ ngay → ghi lên (upsert với hộ chiếu hiện tại)
  serverMode = 'none'; await page.click('#jr-sync-now');
  await page.waitForFunction(() => /Đã lưu hộ chiếu lên máy chủ/.test(document.getElementById('jr-sync-msg').textContent), null, { timeout: 15000 });
  const u = rpcCalls.filter(c => c.fn === 'bizon_journey_upsert'); assert.equal(u.length, 1); assert.equal(u[0].body.p_passport.journeyId, base.journeyId); assert.equal(u[0].body.p_passport.tiers.t2.status, 'done'); assert.equal(u[0].body.p_app_version, 'bizon-journey-v1');
  // Máy chủ có hộ chiếu khác → hỏi; Cancel = giữ bản máy này và ghi đè máy chủ
  serverMode = 'other'; await page.click('#jr-sync-now');
  await page.waitForFunction(() => /Đã ghi hộ chiếu của máy này lên máy chủ/.test(document.getElementById('jr-sync-msg').textContent), null, { timeout: 15000 });
  assert.equal(rpcCalls.filter(c => c.fn === 'bizon_journey_upsert').length, 2); assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('bizon-journey')).journeyId), base.journeyId);
  // Chưa đăng nhập: khối vẫn hiện (backend bật) nhưng không gọi RPC; bấm đồng bộ → nhắc đăng nhập
  await page.evaluate(() => sessionStorage.removeItem('bizon-student-session')); const before = rpcCalls.length;
  await page.reload({ waitUntil: 'commit' }); await page.waitForFunction(() => { const b = document.getElementById('jr-sync'); return !!b && !b.hidden; }, null, { timeout: 60000 });
  await page.click('#jr-sync-now'); await page.waitForFunction(() => /Đăng nhập email trường/.test(document.getElementById('jr-sync-msg').textContent), null, { timeout: 10000 });
  assert.equal(rpcCalls.slice(before).filter(c => /journey/.test(c.fn)).length, 0, 'không gọi RPC hành trình khi chưa đăng nhập');
  await browser.close();
  assert.deepEqual(errors, [], 'không lỗi JS');
  console.log('journey-sync: OK');
}
