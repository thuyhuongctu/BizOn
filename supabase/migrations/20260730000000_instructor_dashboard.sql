-- ============================================================
-- BizOn Bật Nghiệp – Bảng xếp hạng & trang tổng hợp Giảng viên (GĐ2)
-- Trang giang-vien.html gọi 2 hàm dưới đây để xem bảng xếp hạng lớp
-- theo thời gian thực. Dữ liệu vẫn kín: sinh viên (anon key) không đọc
-- được bảng nào; hàm chỉ trả kết quả khi nhập đúng KHÓA GIẢNG VIÊN.
-- Tệp này tự áp dụng qua tích hợp GitHub (hoặc dán vào SQL Editor → Run).
-- ============================================================

-- Kho khóa bí mật: RLS bật, KHÔNG có policy nào → anon bị chặn hoàn toàn.
create table if not exists app_secrets (
  name text primary key,
  value text not null
);
alter table app_secrets enable row level security;

-- Khóa giảng viên mặc định – ĐỔI NGAY sau khi chạy (xem ghi chú cuối tệp).
insert into app_secrets (name, value) values ('instructor_key', 'BIZON-GV-2026')
on conflict (name) do nothing;

-- Hàm kiểm khóa (security definer: chạy bằng quyền chủ bảng, anon chỉ nhận true/false)
create or replace function bizon_check_key(p_key text)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from app_secrets where name = 'instructor_key' and value = p_key
  );
$$;

-- Bảng xếp hạng: mỗi đội 1 dòng – vòng cao nhất đã khóa + chỉ số của lần nộp
-- mới nhất ở vòng đó, xếp theo thị phần giảm dần.
create or replace function bizon_leaderboard(p_class_code text, p_key text)
returns table (
  team_name text,
  best_round int,
  submissions bigint,
  share numeric,
  net_profit numeric,
  revenue numeric,
  balance numeric,
  last_submit timestamptz
)
language sql security definer stable
set search_path = public
as $$
  with latest as (
    select distinct on (rs.team_name)
      rs.team_name, rs.round_number, rs.result_json, rs.created_at
    from round_submissions rs
    where bizon_check_key(p_key) and rs.class_code = p_class_code
    order by rs.team_name, rs.round_number desc, rs.created_at desc
  )
  select
    l.team_name,
    l.round_number,
    (select count(*) from round_submissions r2
      where r2.class_code = p_class_code and r2.team_name = l.team_name),
    (l.result_json->>'share')::numeric,
    (l.result_json->>'netProfit')::numeric,
    (l.result_json->>'revenue')::numeric,
    (l.result_json->>'balance')::numeric,
    l.created_at
  from latest l
  order by (l.result_json->>'share')::numeric desc nulls last;
$$;

-- Dòng thời gian: các lượt nộp gần nhất của lớp (tối đa 100).
create or replace function bizon_feed(p_class_code text, p_key text, p_limit int default 30)
returns table (
  team_name text,
  round_number int,
  net_profit numeric,
  share numeric,
  created_at timestamptz
)
language sql security definer stable
set search_path = public
as $$
  select rs.team_name, rs.round_number,
         (rs.result_json->>'netProfit')::numeric,
         (rs.result_json->>'share')::numeric,
         rs.created_at
  from round_submissions rs
  where bizon_check_key(p_key) and rs.class_code = p_class_code
  order by rs.created_at desc
  limit least(coalesce(p_limit, 30), 100);
$$;

-- Ghi chú vận hành:
--  • ĐỔI KHÓA GIẢNG VIÊN (nên làm ngay, chọn khóa riêng của cô):
--    update app_secrets set value = 'KHOA-MOI-CUA-CO' where name = 'instructor_key';
--  • Khóa sai → hàm trả 0 dòng (không lộ thông tin gì).
--  • Trang giang-vien.html tự làm mới mỗi 10 giây – "thời gian thực" đủ
--    dùng cho lớp học mà không tốn kết nối Realtime của gói miễn phí.
