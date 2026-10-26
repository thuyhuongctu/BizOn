'use strict';
// Bài tình huống trước – sau · R2: hai bản song song A/B, giai đoạn do máy chủ quyết, nộp qua đăng nhập kèm điều kiện hộp đen,
// CSV cho giảng viên với khoá ẩn danh. RPC giả lập bằng page.route; cần máy chủ tĩnh (BIZON_URL).
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const D = require('../js/case-task-data.js');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const fnv = s => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const baseForm = (email, cls) => (fnv(String(email).toLowerCase() + '|' + cls) % 2 === 0 ? 'A' : 'B');

// --- bộ câu hỏi: hai bản song song cùng cấu trúc ---
for (const f of ['A', 'B']) {
  const items = D.FORMS[f]; assert.equal(items.length, 6, f);
  assert.deepEqual(items.map(i => i.id + ':' + i.mech), ['u1:uppsala', 'o1:outsidership', 'v1:void', 'e1:eff-high', 'e2:eff-low', 'x:explain']);
  for (const it of items) for (const L of ['vi', 'en']) { assert.ok(it[L] && it[L].title && it[L].text.length > 80, f + it.id + L);
    if (it.mech !== 'explain') { assert.deepEqual(Object.keys(it[L].opts), ['a', 'b', 'c', 'd']); assert.ok(it[L].opts[it.expected]); assert.deepEqual(Object.keys(it.logic), ['a', 'b', 'c', 'd']); } }
}
for (let i = 0; i < 6; i++) { assert.notEqual(D.FORMS.A[i].vi.text, D.FORMS.B[i].vi.text, 'bề mặt khác nhau'); if (i < 5) assert.equal(D.FORMS.A[i].expected, D.FORMS.B[i].expected, 'cùng vị trí phương án hợp lý thuyết'); }
assert.equal(D.other('A'), 'B'); assert.equal(D.item('B', 'v1').mech, 'void'); assert.equal(D.item('A', 'zz'), null);

// --- tĩnh ---
const page0 = read('bai-tinh-huong.html');
assert.ok(page0.includes('<script src="js/backend-config.js" defer></script>\n<script src="js/student-login.js" defer></script>\n<script src="js/explain-mode.js" defer></script>\n<script src="js/case-task-data.js" defer></script>\n<script src="js/bizon-clay-i18n.js" defer></script>\n<script src="js/case-task.js" defer></script>'), 'thứ tự nạp');
for (const id of ['ct-login', 'ct-class', 'ct-team', 'ct-start', 'ct-task', 'ct-items', 'ct-submit', 'ct-done', 'ct-done-text']) assert.ok(page0.includes(`id="${id}"`), id);
assert.match(page0, /<meta name="robots" content="noindex">/);
{ const sw = read('sw.js'); assert.match(sw, /const CACHE = 'bizon-v\d+';/); for (const f of ["'./bai-tinh-huong.html'", "'./js/case-task.js'", "'./js/case-task-data.js'"]) assert.ok(sw.includes(f), 'sw ' + f); }
assert.match(read('hanh-trinh.html'), /id="jr-case"[\s\S]*href="bai-tinh-huong\.html"/);
assert.match(read('js/instructor-api.js'), /async caseTasks\(code\)[^\n]*bizon_case_task_class/);
{ const g = read('js/bizon-grading.js'); assert.match(g, /function caseTaskCsv\(code, rows\)/); assert.match(g, /decRows, xls, caseTaskCsv, EVENTS/); }
{ const gv = read('Trang Giang Vien.dc.html'); assert.match(gv, /const ct = await this\.api\(\)\.caseTasks\(code\)/); assert.match(gv, /\{\{ ctHead \}\}/); assert.match(gv, /this\.P\(\)\.caseTaskCsv\(this\.state\.code, rows\)/); assert.match(gv, /<script src="js\/case-task-data\.js"><\/script>/); }
{ const m = read('supabase/migrations/20261028000000_case_tasks.sql'); for (const s of ['create table if not exists public.case_tasks', "check (phase in ('pre', 'post'))", 'unique (student_id, class_code, phase)', 'function public.bizon_case_task_submit(', 'function public.bizon_case_task_mine(', 'function public.bizon_case_task_class(', "interval '24 hours'", 'delete from case_tasks where updated_at < now() - interval \'12 months\'', 'revoke all on table public.case_tasks from public, anon, authenticated']) assert.ok(m.includes(s), 'migration: ' + s); }
assert.match(read('.github/workflows/supabase-student-login.yml'), /case_tasks_smoke\.sql[\s\S]*20261028000000_case_tasks\.sql/);
assert.ok(fs.existsSync(path.join(__dirname, '..', 'docs/architecture/BAI-TINH-HUONG.md')));

(async () => {
  const EMAIL = 'sva@student.ctu.edu.vn', CLS = 'KT-TEST', F0 = baseForm(EMAIL, CLS);
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 }, serviceWorkers: 'block' });
  const page = await ctx.newPage(); const errors = [], rpcCalls = []; let mine = [];
  page.on('pageerror', e => errors.push('err: ' + e.message)); page.on('dialog', d => d.accept());
  await page.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
  await page.route('**/rest/v1/rpc/**', async route => {
    const fn = route.request().url().split('/rpc/')[1].split('?')[0]; let body = {}; try { body = JSON.parse(route.request().postData() || '{}'); } catch (e) {}
    rpcCalls.push({ fn, body });
    const out = fn === 'bizon_student_domains' ? ['student.ctu.edu.vn'] : fn === 'bizon_case_task_mine' ? mine : fn === 'bizon_case_task_submit' ? { id: 7, phase: body.p_phase, form: body.p_form, updated_at: '2026-11-03T03:00:00Z' }
      : fn === 'bizon_class_feed' ? { controls: { explain_hidden: true }, grants: [] } : null;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
  });
  await page.addInitScript(em => { try { if (!sessionStorage.getItem('ct-init')) { localStorage.clear(); sessionStorage.setItem('ct-init', '1'); } localStorage.setItem('bizon-lang', 'vi'); if (em) sessionStorage.setItem('bizon-student-session', JSON.stringify({ accessToken: 'test-token', email: em, expiresAt: Date.now() + 3600000 })); else sessionStorage.removeItem('bizon-student-session'); } catch (e) {} }, EMAIL);
  const start = async (url) => { await page.goto(url, { waitUntil: 'commit', timeout: 60000 }); await page.waitForFunction(() => window.__ctTest && window.StudentLogin && window.BizOnExplain, null, { timeout: 60000 });
    await page.fill('#ct-class', CLS); await page.fill('#ct-team', 'Đội Thử'); await page.click('#ct-start'); await page.waitForFunction(() => !document.getElementById('ct-task').hidden || !document.getElementById('ct-done').hidden, null, { timeout: 15000 }); };
  const fillAll = () => page.evaluate(() => { document.querySelectorAll('.ct-item').forEach((li, i) => { const r = li.querySelector('input[value="b"]'); if (r) r.checked = true; li.querySelector('textarea').value = r ? 'Vì chưa đủ tri thức thị trường nên tăng dần.' : 'Cam kết lớn trước khi có tri thức thị trường và vị trí mạng lưới làm chi phí học hỏi và rủi ro tăng; nên vào dần qua đối tác trong cuộc.'; }); });

  // 1. Chưa nộp gì → pre, bản theo băm; thiếu câu trả lời bị chặn; nộp đủ → payload đúng
  await start(`${BASE}/bai-tinh-huong.html`);
  assert.equal(await page.evaluate(() => __ctTest.state.phase + '|' + __ctTest.state.form + '|' + __ctTest.state.practice), `pre|${F0}|false`);
  assert.equal(await page.evaluate(() => __ctTest.baseForm('SVA@student.ctu.edu.vn', 'KT-TEST')), F0, 'băm không phân biệt hoa thường');
  assert.equal(await page.$$eval('.ct-item', els => els.length), 6);
  assert.equal(await page.$$eval('.ct-item .ct-opt', els => els.length), 20);
  assert.equal(await page.evaluate(() => document.querySelector('.ct-item h3').textContent.trim()), '1. ' + D.FORMS[F0][0].vi.title);
  await page.click('#ct-submit'); await page.waitForFunction(() => /Mỗi tình huống/.test(document.getElementById('ct-msg').textContent), null, { timeout: 5000 }); assert.ok(await page.$('.ct-item.bad'));
  assert.equal(rpcCalls.filter(c => c.fn === 'bizon_case_task_submit').length, 0);
  await fillAll(); await page.click('#ct-submit');
  await page.waitForFunction(() => !document.getElementById('ct-done').hidden, null, { timeout: 15000 });
  const sub = rpcCalls.filter(c => c.fn === 'bizon_case_task_submit'); assert.equal(sub.length, 1); const b = sub[0].body;
  assert.equal(b.p_class_code, CLS); assert.equal(b.p_team_name, 'Đội Thử'); assert.equal(b.p_phase, 'pre'); assert.equal(b.p_form, F0); assert.equal(b.p_explain, 'hidden'); assert.equal(b.p_app_version, 'bizon-ct-v1');
  assert.equal(typeof b.p_duration_s, 'number'); assert.equal(b.p_answers.version, D.VERSION); assert.equal(b.p_answers.lang, 'vi'); assert.equal(b.p_answers.items.length, 6);
  assert.deepEqual(b.p_answers.items.slice(0, 5).map(i => i.id + ':' + i.mech + ':' + i.choice), ['u1:uppsala:b', 'o1:outsidership:b', 'v1:void:b', 'e1:eff-high:b', 'e2:eff-low:b']);
  assert.equal(b.p_answers.items[5].mech, 'explain'); assert.ok(b.p_answers.items[5].text.length > 50); assert.ok(b.p_answers.items[0].why.length > 5);
  assert.ok(/TRƯỚC/.test(await page.textContent('#ct-done-text')));
  assert.equal(JSON.parse(await page.evaluate(() => localStorage.getItem('bizon-case-task'))).last.phase, 'pre');

  // 2. Đã có pre → post với bản còn lại (theo máy chủ, kể cả khi khác băm)
  mine = [{ phase: 'pre', form: 'B', created_at: '2026-11-01T00:00:00Z', updated_at: '2026-11-01T00:00:00Z' }];
  await start(`${BASE}/bai-tinh-huong.html`);
  assert.equal(await page.evaluate(() => __ctTest.state.phase + '|' + __ctTest.state.form), 'post|A');
  assert.equal(await page.evaluate(() => document.querySelector('.ct-item h3').textContent.trim()), '1. ' + D.FORMS.A[0].vi.title);
  await fillAll(); await page.click('#ct-submit'); await page.waitForFunction(() => !document.getElementById('ct-done').hidden, null, { timeout: 15000 });
  assert.equal(rpcCalls.filter(c => c.fn === 'bizon_case_task_submit').pop().body.p_phase, 'post'); assert.ok(/SAU/.test(await page.textContent('#ct-done-text')));
  // 3. Đủ hai bài → báo xong, không hiện bài
  mine = [{ phase: 'pre', form: 'B' }, { phase: 'post', form: 'A' }];
  await start(`${BASE}/bai-tinh-huong.html`);
  assert.equal(await page.evaluate(() => document.getElementById('ct-task').hidden + '|' + document.getElementById('ct-done').hidden), 'true|false');
  assert.ok(/cả bài TRƯỚC và bài SAU/.test(await page.textContent('#ct-done-text')));
  // 4. URL ghi đè để xem trước
  await start(`${BASE}/bai-tinh-huong.html?phase=pre&form=B`);
  assert.equal(await page.evaluate(() => __ctTest.state.phase + '|' + __ctTest.state.form), 'pre|B');
  // 5. Tiếng Anh: đổi ngôn ngữ giữ câu trả lời
  await page.evaluate(() => { document.querySelector('.ct-item input[value="c"]').checked = true; document.querySelector('.ct-item textarea').value = 'giữ lại'; });
  await page.evaluate(() => { localStorage.setItem('bizon-lang', 'en'); window.dispatchEvent(new CustomEvent('bizon:langchange', { detail: { lang: 'en' } })); });
  await page.waitForTimeout(100);
  const enTitle = await page.evaluate(() => document.querySelector('.ct-item h3').textContent.trim()); assert.ok(enTitle === '1. ' + D.FORMS.B[0].en.title || enTitle === '1. ' + D.FORMS.B[0].vi.title, 'tiêu đề theo ngôn ngữ');
  assert.equal(await page.evaluate(() => document.querySelector('.ct-item input[value="c"]').checked + '|' + document.querySelector('.ct-item textarea').value), 'true|giữ lại');
  await page.evaluate(() => { localStorage.setItem('bizon-lang', 'vi'); });

  // 6. Chưa đăng nhập: làm thử, không nộp
  const nCalls = rpcCalls.length;
  await ctx.addInitScript(() => { try { sessionStorage.removeItem('bizon-student-session'); } catch (e) {} });
  const p2 = await ctx.newPage(); p2.on('pageerror', e => errors.push('err2: ' + e.message));
  await p2.goto(`${BASE}/bai-tinh-huong.html`, { waitUntil: 'commit', timeout: 60000 }); await p2.waitForFunction(() => window.__ctTest && window.StudentLogin, null, { timeout: 60000 });
  await p2.evaluate(() => { try { sessionStorage.removeItem('bizon-student-session'); } catch (e) {} });
  await p2.fill('#ct-class', CLS); await p2.click('#ct-start'); await p2.waitForFunction(() => !document.getElementById('ct-task').hidden, null, { timeout: 15000 });
  assert.equal(await p2.evaluate(() => __ctTest.state.practice + '|' + __ctTest.state.form + '|' + !!document.querySelector('.ct-warn')), 'true|A|true');
  await p2.evaluate(() => { document.querySelectorAll('.ct-item').forEach(li => { const r = li.querySelector('input[value="a"]'); if (r) r.checked = true; li.querySelector('textarea').value = 'đây là câu trả lời thử nghiệm đủ dài để qua kiểm tra'; }); });
  await p2.click('#ct-submit');
  await p2.waitForFunction(() => /Đăng nhập|Sign in|Mỗi tình huống|Each situation/.test(document.getElementById('ct-msg').textContent), null, { timeout: 5000 });
  assert.match(await p2.textContent('#ct-msg'), /Đăng nhập email trường|Sign in with your school email/, 'làm thử: báo cần đăng nhập, không chặn vì thiếu câu');
  assert.equal(rpcCalls.slice(nCalls).filter(c => c.fn === 'bizon_case_task_submit' || c.fn === 'bizon_case_task_mine').length, 0, 'không gọi RPC khi chưa đăng nhập');
  await p2.close();

  // 7. CSV giảng viên: khoá ẩn danh, aligned, băm journey_id, trích dẫn CSV
  await page.setContent(`<script src="${BASE}/js/case-task-data.js"></script><script src="${BASE}/js/bizon-grading.js"></script>`);
  await page.waitForFunction(() => window.BizOnInstructorPage && window.BizOnCaseTaskData, null, { timeout: 20000 });
  const lines = await page.evaluate(() => { HTMLAnchorElement.prototype.click = function () {}; return BizOnInstructorPage.caseTaskCsv('KT-TEST', [
    { student_email: 'SVA@student.ctu.edu.vn', team_name: 'Đội Thử', phase: 'pre', form: 'A', duration_s: 420, explain: 'hidden', journey_id: 'J-KT-TEST-DOI-THU-2026-11-03', updated_at: '2026-11-03T03:00:00Z',
      answers: { version: 'ct-v1', items: [{ id: 'u1', mech: 'uppsala', choice: 'b', why: 'vì "chưa" đủ, tri thức' }, { id: 'o1', mech: 'outsidership', choice: 'a', why: 'quảng cáo' }, { id: 'x', mech: 'explain', text: 'dòng 1\ndòng 2' }] } }]); });
  assert.equal(lines[0], 'class,student_key,team,phase,form,item,mech,choice,expected,aligned,logic,why,duration_s,explain_condition,journey_hash,submitted_at,answers_version');
  const key = fnv('sva@student.ctu.edu.vn').toString(16).padStart(8, '0'), jh = fnv('J-KT-TEST-DOI-THU-2026-11-03').toString(16).padStart(8, '0');
  assert.equal(lines[1], `KT-TEST,${key},Đội Thử,pre,A,u1,uppsala,b,b,1,incremental,"vì ""chưa"" đủ, tri thức",420,hidden,${jh},2026-11-03T03:00:00Z,ct-v1`);
  assert.equal(lines[2], `KT-TEST,${key},Đội Thử,pre,A,o1,outsidership,a,c,0,advertise,quảng cáo,420,hidden,${jh},2026-11-03T03:00:00Z,ct-v1`);
  assert.equal(lines[3], `KT-TEST,${key},Đội Thử,pre,A,x,explain,,,,,"dòng 1\ndòng 2",420,hidden,${jh},2026-11-03T03:00:00Z,ct-v1`);
  assert.ok(!lines.join('\n').includes('@'), 'không có email trong CSV');

  await browser.close();
  assert.deepEqual(errors, [], 'không lỗi JS');
  console.log('case-task: OK');
})().catch(e => { console.error(e); process.exit(1); });
