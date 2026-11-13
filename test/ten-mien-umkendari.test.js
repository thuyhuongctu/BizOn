// Tên miền email sinh viên Universitas Muhammadiyah Kendari (lớp KT330H qua Zoom, 11/2026):
// một dòng trong student_email_domains, áp bằng workflow, có kiểm tra trước và sau, smoke SQL kiểm so khớp chính xác.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const m = read('supabase/migrations/20261113000000_add_umkendari_domain.sql');
assert.match(m, /insert into public\.student_email_domains \(domain, note, added_by\)\s+values \('umkendari\.ac\.id', '[^']*', 'migration'\),\s+\('student\.umkendari\.ac\.id', '[^']*', 'migration'\)\s+on conflict \(domain\) do nothing;/);
const lenh = m.split('\n').filter(l => !l.trim().startsWith('--')).join('\n');
assert.equal((lenh.match(/;/g) || []).length, 1, 'chỉ một lệnh');
assert.ok(!/drop |delete |truncate|alter |create |update |grant |revoke /i.test(lenh), 'chỉ thêm một dòng, không đổi gì khác');
assert.ok(!/gmail\.com/.test(lenh), 'không mở Gmail cá nhân');

assert.ok(read('.github/workflows/supabase-migrate.yml').includes('          - 20261113000000_add_umkendari_domain.sql'));
(async () => {
  const ap = await import('../scripts/release/apply-supabase-migration.mjs');
  assert.deepEqual(ap.parseFile('20261113000000_add_umkendari_domain.sql'), { version: '20261113000000', name: 'add_umkendari_domain' });
  const c = ap.CHECKS.add_umkendari_domain;
  assert.ok(c.pre.length === 1 && /student_email_domains/.test(c.pre[0][0]), 'cần migration A');
  assert.ok(c.post.length === 3 && /umkendari\.ac\.id/.test(c.post[0][0]) && /bizon_is_student_email/.test(c.post[1][0]) && /@student\.umkendari\.ac\.id/.test(c.post[2][0]));

  const smoke = read('test/sql/require_student_login_smoke.sql');
  for (const s of ["d = 'student.umkendari.ac.id'", "bizon_is_student_email('arsih@student.umkendari.ac.id')", "d = 'umkendari.ac.id'", "bizon_is_student_email('Ica.Nur.02@UMKendari.ac.id')", "bizon_is_student_email('sv@febi.umkendari.ac.id')", "bizon_is_student_email('sv@gmail.com')"]) assert.ok(smoke.includes(s), s);
  // Trang đăng nhập đọc danh sách tên miền từ máy chủ nên không phải sửa mã phía trình duyệt
  assert.match(read('js/student-login.js'), /rpc\/bizon_student_domains/);
  assert.match(read('js/student-auth.js'), /StudentLogin\.loadDomains\(\)/);
  assert.match(read('docs/release/SUPABASE_SMTP_SETUP.md'), /`umkendari\.ac\.id`, `student\.umkendari\.ac\.id` \| Universitas Muhammadiyah Kendari/);
  assert.ok(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 841, 'sw.js ≥ bizon-v841');
  console.log('ten-mien-umkendari: ok');
})().catch(e => { console.error(e); process.exit(1); });
