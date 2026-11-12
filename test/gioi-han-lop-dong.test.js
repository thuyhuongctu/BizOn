// Lớp đông (160–200 sinh viên trong một mã lớp): migration nâng giới hạn 12/11/2026.
// Kiểm tĩnh nội dung + CI chạy smoke SQL + có trong danh sách áp migration + trang Giảng viên không cắt cụt danh sách.
// Hành vi thật kiểm bằng test/sql/gioi_han_lop_dong_smoke.sql trên Postgres (workflow supabase-student-login.yml).
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const m = read('supabase/migrations/20261112000000_gioi_han_lop_dong.sql');
// 1. Phiếu khảo sát: 500 / phút / lớp, 1500 / phút toàn hệ thống; hai giới hạn còn lại giữ nguyên
assert.match(m, /class_code = new\.class_code and created_at > now\(\) - interval '1 minute';\s+if n >= 500 then/);
assert.match(m, /if n >= 1500 then raise exception 'Hệ thống đang nhận quá nhiều phiếu/);
assert.match(m, /interval '5 minutes';\s+if n >= 300 then/);
assert.match(m, /interval '1 hour';\s+if n >= 60 then/);
assert.match(m, /revoke all on function public\.bizon_rate_limit_guard\(\) from public, anon, authenticated/);
// 2. Bảng xếp hạng: 500 dòng, theo phiên bản 1000 dòng; vẫn chỉ lượt đã đăng nhập, vẫn biệt danh
assert.equal((m.match(/\) x order by x\.total_(score|revenue) desc, x\.created_at limit 500;/g) || []).length, 2);
assert.match(m, /coalesce\(r\.app_version, ''\), r\.total_revenue desc, r\.created_at\s+\) x order by x\.total_revenue desc, x\.created_at limit 1000;/);
assert.equal((m.match(/r\.student_id is not null/g) || []).length, 3, 'chỉ lượt đã đăng nhập');
assert.equal((m.match(/coalesce\(nullif\(r\.player_name, ''\), 'Người chơi'\)/g) || []).length, 3, 'vẫn trả biệt danh');
assert.ok(!/student_email/.test(m), 'không trả email');
for (const f of ['bp_class_leaderboard', 'ft_class_leaderboard', 'ft_class_results_by_version'])
  assert.ok(m.includes('revoke all on function public.' + f + '(text) from public;') && m.includes('grant execute on function public.' + f + '(text) to anon, authenticated;'), f);
// 3. Dòng nộp cho chủ lớp: mặc định 30, tối đa 1000, vẫn kiểm chủ lớp, khách không gọi được
assert.match(m, /bizon_feed_v2\(p_class_code text, p_limit int default 30\)/);
assert.match(m, /select bizon_owns_class\(p_class_code\) as ok/);
assert.match(m, /limit least\(coalesce\(p_limit, 30\), 1000\);/);
assert.match(m, /revoke all on function public\.bizon_feed_v2\(text, int\) from public, anon;\s+grant execute on function public\.bizon_feed_v2\(text, int\) to authenticated;/);
// Chỉ đổi con số: không đụng bảng, không xoá dữ liệu
assert.ok(!/drop |delete from|truncate|alter table|create table/i.test(m), 'không đổi bảng, không xoá dữ liệu');
assert.equal((m.match(/security definer/g) || []).length, 5);
assert.equal((m.match(/set search_path = public/g) || []).length, 5, 'hàm SECURITY DEFINER nào cũng có search_path');

// CI: smoke chạy sau khi áp toàn bộ migration và sau bước áp lại (áp lại 20261104 thì phải áp lại tệp này trước khi kiểm)
const wf = read('.github/workflows/supabase-student-login.yml');
assert.equal((wf.match(/- 'test\/sql\/gioi_han_lop_dong_smoke\.sql'/g) || []).length, 2, 'đổi smoke thì workflow chạy');
assert.equal((wf.match(/-f test\/sql\/gioi_han_lop_dong_smoke\.sql/g) || []).length, 2);
const iCu = wf.indexOf('-f supabase/migrations/20261104000000_ra_soat_bao_mat.sql'), iMoi = wf.indexOf('-f supabase/migrations/20261112000000_gioi_han_lop_dong.sql'), iSmoke = wf.indexOf('-f test/sql/ra_soat_bao_mat_smoke.sql', iCu);
assert.ok(iCu > 0 && iCu < iMoi && iMoi < iSmoke, 'áp lại mức cũ → áp lại mức mới → mới kiểm');
assert.match(read('test/sql/ra_soat_bao_mat_smoke.sql'), /from generate_series\(1, 500\) g;\s+set role anon;/, 'smoke cũ dùng trần mới');
const smoke = read('test/sql/gioi_han_lop_dong_smoke.sql');
for (const s of ['160 phiếu cùng phút đều được nhận', 'ft_class_leaderboard đủ 170 dòng', 'bp_class_leaderboard đủ 170 dòng', 'chủ lớp nhận đủ 192 lượt nộp', 'người không phải chủ lớp không thấy dòng nào']) assert.ok(smoke.includes(s), s);

// Áp lên production: có trong danh sách chọn và có kiểm tra trước, sau
assert.ok(read('.github/workflows/supabase-migrate.yml').includes('          - 20261112000000_gioi_han_lop_dong.sql'));
const ap = read('scripts/release/apply-supabase-migration.mjs');
assert.match(ap, /gioi_han_lop_dong: \{\s+pre: \[/);
assert.ok(ap.includes("position('limit 500' in pg_get_functiondef('public.ft_class_leaderboard(text)'::regprocedure)) > 0"));

// Trang Giảng viên: đường lùi xin 1000 lượt nộp (32 đội × 6 vòng = 192), danh sách hộ chiếu và cấp vốn không cắt ở 30 / 20
assert.ok(read('js/instructor-api.js').includes("rpc('bizon_feed_v2', { p_class_code: code, p_limit: 1000 })"));
const gv = read('Trang Giang Vien.dc.html');
assert.match(gv, /jpRows: \(s\.jp \|\| \[\]\)\.slice\(0, 300\)/);
assert.match(gv, /grants: \(\(s\.st && s\.st\.grants\) \|\| \[\]\)\.slice\(0, 200\)/);
assert.match(gv, /<div data-list="jp" style="max-height:320px;overflow:auto"><sc-for list="\{\{ jpRows \}\}"/, 'danh sách dài thì cuộn trong khung');

assert.match(read('docs/huong-dan-giang-vien.md'), /### Lớp đông \(trên 60 sinh viên, một mã lớp\)/);
assert.ok(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 840, 'sw.js ≥ bizon-v840');
console.log('gioi-han-lop-dong: ok');
