// Workflow đếm phiếu khảo sát: chỉ đọc, gom Mã lớp gõ khác nhau, không in mã SV/câu trả lời, không lộ token.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');

(async () => {
  const m = await import('../scripts/release/survey-count.mjs');
  const sql = m.countSql('');
  assert.match(sql, /^select upper\(regexp_replace\(class_code/);
  assert.doesNotMatch(sql, /\b(insert|update|delete|drop|alter|grant)\b/i, 'chỉ đọc');
  assert.doesNotMatch(sql, /open_like|open_improve|answers_a|student_code as/i, 'không lấy ý kiến tự do hay đáp án');
  assert.doesNotMatch(sql, / where upper/, 'không lọc khi để trống');
  assert.match(m.countSql("m0132'; drop table x;--"), /like '%M0132'';DROPTABLEX;--%'/, 'thoát nháy đơn và bỏ khoảng trắng trong chuỗi lọc');

  const rows = [{ ma_lop: 'M01326', cach_go: 'M01326 | m0132 6', bo_cau_hoi: 'khoinghiep', truoc: 3, sau: 1, ma_sv_truoc: 3, ma_sv_sau: 1, cap_truoc_sau: 1, tu_ngay: '2026-10-24', den_ngay: '2026-10-24' }];
  const md = m.table(rows);
  assert.match(md, /\| M01326 \| M01326 \/ m0132 6 \| khoinghiep \| 3 \| 1 \| 3 \/ 1 \| 1 \|/);
  assert.match(md, /\*\*Tổng:\*\* 1 mã lớp · 3 phiếu trước · 1 phiếu sau\./);

  const sum = path.join(os.tmpdir(), 'bizon-survey-summary.md'); fs.rmSync(sum, { force: true });
  const realFetch = globalThis.fetch, realLog = console.log; const calls = [], logs = [];
  globalThis.fetch = async (url, init) => { calls.push([url, init.headers.Authorization, JSON.parse(init.body)]); return new Response(JSON.stringify(rows), { status: 201 }); };
  console.log = (...a) => logs.push(a.join(' '));
  try {
    await m.main({ SUPABASE_ACCESS_TOKEN: ' Bearer sbp_test\n', GITHUB_STEP_SUMMARY: sum });
    assert.equal(calls.length, 1);
    assert.equal(calls[0][0], 'https://api.supabase.com/v1/projects/ceytblfelodpnudomccn/database/query/read-only');
    assert.equal(calls[0][1], 'Bearer sbp_test');
    assert.match(fs.readFileSync(sum, 'utf8'), /## Phiếu khảo sát trước\/sau theo Mã lớp[\s\S]*M01326/);
    assert.ok(!logs.join('\n').includes('sbp_test'), 'log không lộ token');
    // Không có endpoint read-only → thử lại database/query với read_only: true
    calls.length = 0;
    globalThis.fetch = async (url, init) => { calls.push([url, null, JSON.parse(init.body)]); return url.endsWith('/read-only') ? new Response('nf', { status: 404 }) : new Response('[]', { status: 201 }); };
    await m.main({ SUPABASE_ACCESS_TOKEN: 'sbp_test', CLASS_FILTER: 'M0132' });
    assert.equal(calls.length, 2);
    assert.equal(calls[1][2].read_only, true);
    assert.match(logs.join('\n'), /Chưa có phiếu khảo sát nào có Mã lớp chứa «M0132»/);
    await assert.rejects(m.main({ SUPABASE_ACCESS_TOKEN: 'abcd efgh ijkl mnop' }), /dán nhầm/);
  } finally { globalThis.fetch = realFetch; console.log = realLog; fs.rmSync(sum, { force: true }); }

  const wf = fs.readFileSync('.github/workflows/supabase-survey-count.yml', 'utf8');
  assert.match(wf, /^on:\n  workflow_dispatch:/m);
  assert.doesNotMatch(wf, /^\s+(push|pull_request|schedule):/m);
  assert.match(wf, /permissions:\n  contents: read\n/);
  for (const l of wf.split('\n').filter(l => l.includes('${{ inputs.'))) assert.match(l, /^\s+[A-Z_]+: \$\{\{ inputs\.\w+ \}\}$/, 'input chỉ đi qua env: ' + l.trim());
  console.log('supabase-survey-count: OK');
})().catch(e => { console.error(e); process.exit(1); });
