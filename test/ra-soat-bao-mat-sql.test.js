// Migration siết bảo mật sau rà soát 03/11/2026: kiểm tĩnh nội dung + CI chạy smoke SQL + có trong danh sách áp migration.
// Hành vi thật kiểm bằng test/sql/ra_soat_bao_mat_smoke.sql trên Postgres (workflow supabase-student-login.yml).
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const m = read('supabase/migrations/20261104000000_ra_soat_bao_mat.sql');
assert.match(m, /alter table public\.key_check_attempts enable row level security/);
assert.match(m, /revoke all on table public\.key_check_attempts from public, anon, authenticated/);
assert.match(m, /before insert or update of class_code on public\.live_progress/);
assert.match(m, /from public\.instructor_class_access a where a\.class_code = new\.class_code/);
for (const t of ['survey_responses', 'client_errors', 'bug_reports']) assert.ok(m.includes('before insert on public.' + t + ' for each row execute function public.bizon_rate_limit_guard()'), t);
assert.equal((m.match(/\) not valid;/g) || []).length, 3, 'ràng buộc chỉ áp cho dòng mới');
assert.match(m, /jsonb_typeof\(state_json\) = 'object' and pg_column_size\(state_json\) <= 262144/);
assert.equal((m.match(/security definer\s+set search_path = public/g) || []).length, 2, 'hàm SECURITY DEFINER có search_path');
assert.ok(!/drop table|delete from|truncate/i.test(m), 'không xoá dữ liệu');
const wf = read('.github/workflows/supabase-student-login.yml');
assert.ok(wf.includes('-f test/sql/ra_soat_bao_mat_smoke.sql') && wf.includes("- 'test/sql/ra_soat_bao_mat_smoke.sql'"));
assert.ok(read('.github/workflows/supabase-migrate.yml').includes('20261104000000_ra_soat_bao_mat.sql'));
assert.match(read('test/sql/live_progress_smoke.sql'), /f1 nhận lớp LP-TEST ngay từ đầu/);
console.log('ra-soat-bao-mat-sql: ok');
