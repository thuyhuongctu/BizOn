// Tên miền email cán bộ, giảng viên Đại học Cần Thơ (ctu.edu.vn, 15/11/2026): giảng viên vào chơi thử như một đội trong lớp.
// Một dòng trong student_email_domains, áp bằng workflow, có kiểm tra trước và sau, smoke SQL kiểm so khớp chính xác.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const F = '20261115000000_add_ctu_staff_domain.sql';
const m = read('supabase/migrations/' + F);
assert.match(m, /insert into public\.student_email_domains \(domain, note, added_by\)\s+values \('ctu\.edu\.vn', '[^']*', 'migration'\)\s+on conflict \(domain\) do nothing;/);
const lenh = m.split('\n').filter(l => !l.trim().startsWith('--')).join('\n');
assert.equal((lenh.match(/;/g) || []).length, 1, 'chỉ một lệnh');
assert.ok(!/drop |delete |truncate|alter |create |update |grant |revoke /i.test(lenh), 'chỉ thêm một dòng, không đổi gì khác');
assert.ok(!/instructor_allowlist/.test(lenh), 'không đụng quyền giảng viên');
assert.match(m, /instructor_allowlist/, 'chú thích nói rõ quyền giảng viên không đổi');

assert.ok(read('.github/workflows/supabase-migrate.yml').includes('          - ' + F));
(async () => {
  const ap = await import('../scripts/release/apply-supabase-migration.mjs');
  assert.deepEqual(ap.parseFile(F), { version: '20261115000000', name: 'add_ctu_staff_domain' });
  const c = ap.CHECKS.add_ctu_staff_domain;
  assert.ok(c.pre.length === 1 && /student_email_domains/.test(c.pre[0][0]), 'cần migration A');
  assert.ok(c.post.length === 3 && /'ctu\.edu\.vn'/.test(c.post[0][0]) && /patu@ctu\.edu\.vn/.test(c.post[1][0]) && /not public\.bizon_is_student_email\('sv@abc\.ctu\.edu\.vn'\)/.test(c.post[2][0]));
  const smoke = read('test/sql/require_student_login_smoke.sql');
  for (const s of ["bizon_is_student_email('PATU@ctu.edu.vn')", "bizon_is_student_email('sv@abc.ctu.edu.vn')", "bizon_is_student_email('sv@ctu.edu.vn.example.com')", "d = 'ctu.edu.vn'"]) assert.ok(smoke.includes(s), s);
  assert.match(read('docs/release/SUPABASE_SMTP_SETUP.md'), /\| `ctu\.edu\.vn` \| Cán bộ, giảng viên Đại học Cần Thơ/);
  assert.ok(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 871, 'sw.js ≥ bizon-v871');
  console.log('ten-mien-ctu: ok');
})().catch(e => { console.error(e); process.exit(1); });
