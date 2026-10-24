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
  assert.match(wf, /bash scripts\/release\/fetch-migration\.sh "\$MIGRATION" "\$SOURCE_REF"/);
  assert.match(wf, /pull-requests: read/);
  const sh = fs.readFileSync('scripts/release/fetch-migration.sh', 'utf8');
  assert.match(sh, /\[\[ "\$M" =~ \^\[0-9\]\{14\}_\[a-z0-9_\]\+\\\.sql\$ \]\]/);

  // fetch-migration.sh với «gh» giả: main chưa có file → tự tìm trong PR đang mở; nhiều bản khác nhau → dừng.
  const { execFileSync } = require('node:child_process');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bizon-fetchmig-'));
  fs.writeFileSync(path.join(dir, 'gh'), `#!/usr/bin/env bash
if [ "$1" = pr ]; then printf '%s\\n' $STUB_PRS; exit 0; fi
ref="\${@: -1}"; ref="\${ref##*ref=}"; f="$STUB_DIR/$(echo "$ref" | tr / _)"
[ -f "$f" ] && cat "$f" || exit 1
`, { mode: 0o755 });
  const put = (ref, body) => fs.writeFileSync(path.join(dir, ref.replace(/\//g, '_')), body);
  const M = '20261023000000_require_student_login.sql', out = path.join(dir, 'out.sql');
  const run = (ref, prs) => execFileSync('bash', ['scripts/release/fetch-migration.sh', M, ref, out], {
    env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, STUB_DIR: dir, STUB_PRS: prs, GITHUB_REPOSITORY: 'x/y' }, encoding: 'utf8' });
  put('claude/a', 'select 1;\n'); put('claude/b', 'select 1;\n');
  let log = run('', 'claude/a claude/b claude/c');
  assert.match(log, /Nhánh main chưa có/);
  assert.match(log, /Lấy .* từ nhánh claude\/a/);
  assert.equal(fs.readFileSync(out, 'utf8'), 'select 1;\n');
  log = run('main', 'claude/a');
  assert.match(log, /từ nhánh claude\/a/, 'để mặc định main vẫn tự tìm');
  put('main', 'select 0;\n');
  log = run('', 'claude/a');
  assert.match(log, /từ nhánh main/);
  assert.equal(fs.readFileSync(out, 'utf8'), 'select 0;\n');
  fs.rmSync(path.join(dir, 'main'));
  put('claude/b', 'select 2;\n');
  assert.throws(() => run('', 'claude/a claude/b'), e => /nội dung khác nhau/.test(e.stdout));
  log = run('claude/b', 'claude/a claude/b');
  assert.match(log, /từ nhánh claude\/b/, 'source_ref được ưu tiên');
  assert.throws(() => run('', 'claude/c'), e => /Không PR đang mở nào có/.test(e.stdout));
  assert.throws(() => execFileSync('bash', ['scripts/release/fetch-migration.sh', '../x.sql', '', out], { stdio: 'pipe', encoding: 'utf8' }), e => /không hợp lệ/.test(e.stdout));
  fs.rmSync(dir, { recursive: true, force: true });
  assert.match(wf, /CONFIRM: \$\{\{ inputs\.confirm \}\}/);
  const inputLines = wf.split('\n').filter(l => l.includes('${{ inputs.'));
  assert.ok(inputLines.length >= 4);
  for (const l of inputLines) assert.match(l, /^\s+[A-Z_]+: \$\{\{ inputs\.\w+ \}\}$/, `input chỉ đi qua env, không chèn thẳng vào lệnh shell: ${l.trim()}`);
  console.log('supabase-migrate: OK');
})().catch(e => { console.error(e); process.exit(1); });
