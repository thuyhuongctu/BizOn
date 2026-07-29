-- ============================================================
-- BizOn Bật Nghiệp — Backend mỏng cho Pilot Classroom v1
-- Triết lý: engine mô phỏng VẪN chạy trên máy sinh viên (giữ offline,
-- chi phí 0); server chỉ là SỔ NHẬN KẾT QUẢ — mỗi lần đội khóa vòng,
-- game nộp kết quả kèm mã băm để giảng viên đối chiếu và xuất CSV.
-- Chạy tệp này 1 lần trong Supabase Dashboard → SQL Editor → Run.
-- ============================================================

create table if not exists round_submissions (
  id uuid primary key default gen_random_uuid(),
  class_code text not null,              -- Mã lớp giảng viên phát (sinh viên nhập khi đăng nhập game)
  team_name text not null,               -- Tên đội / công ty
  student_email text,                    -- Email người nộp (tùy chọn)
  round_number int not null check (round_number between 1 and 6),
  result_json jsonb not null,            -- Kết quả vòng: doanh thu, lợi nhuận, thị phần, quyết định...
  result_hash text not null,             -- SHA-256 của result_json — chống sửa tay khi đối chiếu
  client_ts timestamptz,                 -- Thời điểm trên máy sinh viên
  created_at timestamptz not null default now()
);

create index if not exists idx_rs_class_round on round_submissions (class_code, round_number, created_at);

-- Bảo mật hàng (RLS): sinh viên (anon key) CHỈ ĐƯỢC GHI, không đọc được
-- dữ liệu của bất kỳ đội nào. Giảng viên xem/xuất dữ liệu bằng
-- Dashboard → Table Editor (đăng nhập chủ project) hoặc CSV export.
alter table round_submissions enable row level security;

create policy "sinh vien chi duoc nop ket qua"
  on round_submissions for insert to anon
  with check (true);

-- KHÔNG tạo policy SELECT/UPDATE/DELETE cho anon → mặc định bị chặn.

-- Ghi chú vận hành:
--  • Một đội chơi lại vòng sẽ tạo dòng nộp mới — khi chấm lấy dòng
--    created_at mới nhất của mỗi (class_code, team_name, round_number).
--  • anon key được phép nhúng công khai trong web (thiết kế của Supabase);
--    TUYỆT ĐỐI không nhúng service_role key.
