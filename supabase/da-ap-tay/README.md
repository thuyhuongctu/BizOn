# SQL đã áp bằng tay trên production

Bốn tệp này từng nằm ở `supabase/` (ngoài `migrations/`) và được chạy trong Supabase SQL Editor khi làm tính năng
(29/09–07/10/2026), không qua workflow «Supabase – áp migration lên production». Kiểm tra trực tiếp trên dự án
production `ceytblfelodpnudomccn` ngày 07/11/2026: bảng `bp_results` (kèm cột `markets`, `badges`, `stars`),
`member_log` (kèm ràng buộc `member_log_kind_check`), `class_rubric_config` và các hàm `bizon_team_log`,
`bizon_member_log`, `bizon_team_all_log`, `bizon_set_rubric_config`, `bizon_rubric_config_feed` **đều đã có**.

Giữ lại để đối chiếu, **không chạy lại trên production** (có `create policy` sẽ lỗi vì policy đã tồn tại). Workflow kiểm thử `supabase-student-login.yml` vẫn áp bốn tệp này theo thứ tự thời gian cùng `migrations/` trên Postgres tạm của CI, vì các migration sau (`revoke_anon_writes`, `ra_soat_bao_mat`) cần bảng `member_log`. Migration mới đặt ở
`supabase/migrations/` và liệt kê trong `.github/workflows/supabase-migrate.yml` như quy ước.

| Tệp | Trong danh sách migration của Supabase |
|---|---|
| `20260929000000_bp_leaderboard.sql` | có, ghi là `20260929060408_bp_leaderboard` |
| `20260930000000_member_log.sql` | có, ghi là `20260929084205_member_log` |
| `20261007000000_member_log_lumina.sql` | không ghi, nhưng hàm `bizon_team_all_log` và ràng buộc mới đã có |
| `20261007010000_rubric_config.sql` | không ghi, nhưng bảng và hai hàm đã có |
