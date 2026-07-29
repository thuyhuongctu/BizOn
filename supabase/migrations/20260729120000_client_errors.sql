-- ============================================================
-- BizOn Bật Nghiệp — Giám sát lỗi phía người dùng (GĐ2 hạ tầng)
-- Khi game/website gặp lỗi JavaScript trên máy sinh viên, trang tự gửi
-- một bản ghi gọn về đây để nhóm phát triển biết và sửa sớm — sinh viên
-- không cần báo cáo thủ công. Chạy tệp này 1 lần trong Supabase
-- Dashboard → SQL Editor → Run (giống tệp 001 trước đây).
-- ============================================================

create table if not exists client_errors (
  id uuid primary key default gen_random_uuid(),
  page text not null,                    -- Trang xảy ra lỗi (vd: game.html)
  message text not null,                 -- Nội dung lỗi (cắt gọn 500 ký tự)
  source text,                           -- Tệp script gây lỗi
  line_no int,                           -- Dòng lỗi
  col_no int,                            -- Cột lỗi
  stack text,                            -- Vết gọi hàm (cắt gọn 1500 ký tự)
  app_version text,                      -- Phiên bản app (khớp cache sw.js, vd: bizon-v137)
  user_agent text,                       -- Trình duyệt/thiết bị của sinh viên
  viewport text,                         -- Kích thước màn hình (vd: 390x844)
  client_ts timestamptz,                 -- Thời điểm trên máy sinh viên
  created_at timestamptz not null default now()
);

create index if not exists idx_ce_page_time on client_errors (page, created_at desc);

-- RLS: trình duyệt sinh viên (anon key) CHỈ ĐƯỢC GHI — không ai đọc được
-- dữ liệu lỗi của người khác. Nhóm phát triển xem qua Dashboard → Table Editor.
alter table client_errors enable row level security;

create policy "trinh duyet chi duoc ghi loi"
  on client_errors for insert to anon
  with check (true);

-- KHÔNG tạo policy SELECT/UPDATE/DELETE cho anon → mặc định bị chặn.

-- Ghi chú vận hành:
--  • Mỗi lượt tải trang gửi tối đa 5 lỗi, trùng lặp trong phiên bị lọc
--    ngay trên trình duyệt — bảng không bị "bão" bản ghi.
--  • Dọn dữ liệu cũ định kỳ (tùy chọn):
--    delete from client_errors where created_at < now() - interval '90 days';
