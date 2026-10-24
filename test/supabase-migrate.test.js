// Kiểm tra script/workflow áp migration lên production: kiểm tra trước, chỉ áp khi gõ APPLY,
// ghi lịch sử với dollar-quote riêng (SQL migration có $$), kiểm tra sau, không lộ token.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');

(async () => {
  const m = await import('../scripts/release/apply-supabase-migration.mjs');
  assert.deepEqual(m.parseFile('20261023000000_require_student_login.sql'), { version: '20261023000000', name: 'require_student_login' });
  assert.throws(() => m.parseFile('../../etc/passwd'), /không hợp lệ/);
  assert.throws(() => m.parseFile('2026_x.sql'), /không hợp lệ/);
  const h = m.historySql('20261023000000', 'x', "create function f() returns int as $$ select 1 $$ language sql; select 'a';");
  assert.match(h, /^do \$bizon_hist\$ begin/);
  assert.match(h, /end \$bizon_hist\$;$/);
  assert.match(h, /''a''/, 'nháy đơn trong SQL được thoát');
  assert.match(h, /on conflict \(version\) do nothing/);
  assert.ok(m.CHECKS.revoke_anon_writes.pre.length, 'B phải kiểm tra A đã áp');

  const tmp = path.join(os.tmpdir(), 'bizon-mig-test.sql');
  fs.writeFileSync(tmp, 'create table if not exists public.t(id int);');
  const realFetch = globalThis.fetch, realLog = console.log;
  let calls = [], logs = [], answer = true;
  globalThis.fetch = async (url, init) => {
    const q = JSON.parse(init.body).query;
    calls.push([url, init.headers.Authorization, q]);
    const rows = /as has_table/.test(q) ? [{ has_table: false }] : /as ok;$/.test(q) ? [{ ok: answer }] : [];
    return new Response(JSON.stringify(rows), { status: 201 });
  };
  console.log = (...a) => logs.push(a.join(' '));
  try {
    const base = { SUPABASE_ACCESS_TOKEN: ' Bearer sbp_test\n', MIGRATION_PATH: tmp };
    // Không gõ APPLY: chỉ kiểm tra, không chạy SQL migration.
    let r = await m.main({ ...base, MIGRATION_FILE: '20261023000000_require_student_login.sql', CONFIRM: '' });
    assert.equal(r.applied, false);
    assert.ok(!calls.some(c => c[2].includes('create table if not exists public.t')));
    assert.ok(calls.every(c => c[0] === 'https://api.supabase.com/v1/projects/ceytblfelodpnudomccn/database/query' && c[1] === 'Bearer sbp_test'));
    // APPLY: chạy SQL, ghi lịch sử, chạy 3 kiểm tra sau.
    calls = [];
    r = await m.main({ ...base, MIGRATION_FILE: '20261023000000_require_student_login.sql', CONFIRM: 'APPLY' });
    assert.equal(r.applied, true);
    assert.ok(calls.some(c => c[2] === 'create table if not exists public.t(id int);'));
    assert.ok(calls.some(c => c[2].startsWith('do $bizon_hist$')));
    assert.equal(calls.filter(c => /as ok;$/.test(c[2])).length, 3);
    // B khi A chưa áp: từ chối trước khi chạy SQL.
    calls = []; answer = false;
    await assert.rejects(m.main({ ...base, MIGRATION_FILE: '20261023010000_revoke_anon_writes.sql', CONFIRM: 'APPLY' }), /Chưa đủ điều kiện/);
    assert.ok(!calls.some(c => c[2].includes('create table if not exists public.t')));
    // Kiểm tra sau không đạt → báo lỗi.
    answer = true;
    const realQ = globalThis.fetch;
    globalThis.fetch = async (url, init) => { const q = JSON.parse(init.body).query; if (/has_table_privilege/.test(q)) return new Response('[{"ok":false}]', { status: 201 }); return realQ(url, init); };
    await assert.rejects(m.main({ ...base, MIGRATION_FILE: '20261023010000_revoke_anon_writes.sql', CONFIRM: 'APPLY' }), /kiểm tra sau không đạt/);
    // Token sai dạng → dừng trước khi gọi API.
    calls = [];
    await assert.rejects(m.main({ ...base, SUPABASE_ACCESS_TOKEN: 'abcd efgh ijkl mnop', MIGRATION_FILE: '20261023000000_require_student_login.sql' }), /dán nhầm/);
    assert.equal(calls.length, 0);
    assert.ok(!logs.join('\n').includes('sbp_test'), 'log không lộ token');
  } finally { globalThis.fetch = realFetch; console.log = realLog; fs.rmSync(tmp, { force: true }); }

  const wf = fs.readFileSync('.github/workflows/supabase-migrate.yml', 'utf8');
  assert.match(wf, /^on:\n  workflow_dispatch:/m);
  assert.doesNotMatch(wf, /^\s+(push|pull_request|schedule):/m);
  assert.match(wf, /if: github\.ref == 'refs\/heads\/main'/);
  assert.match(wf, /\[\[ "\$MIGRATION" =~ \^\[0-9\]\{14\}_\[a-z0-9_\]\+\\\.sql\$ \]\]/);
  assert.match(wf, /CONFIRM: \$\{\{ inputs\.confirm \}\}/);
  const inputLines = wf.split('\n').filter(l => l.includes('${{ inputs.'));
  assert.ok(inputLines.length >= 4);
  for (const l of inputLines) assert.match(l, /^\s+[A-Z_]+: \$\{\{ inputs\.\w+ \}\}$/, `input chỉ đi qua env, không chèn thẳng vào lệnh shell: ${l.trim()}`);
  console.log('supabase-migrate: OK');
})().catch(e => { console.error(e); process.exit(1); });
