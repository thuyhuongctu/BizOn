-- ============================================================
-- BizOn Bật Nghiệp – Sổ nhận kết quả «Gánh Hàng Khởi Nghiệp» (food-truck.html)
-- Sinh viên chơi xong ván 5 tuần có thể nộp kết quả kèm Mã lớp; giảng viên
-- xem tổng hợp trên giang-vien.html bằng Khóa giảng viên (app_secrets).
-- Cùng triết lý các bảng khác: anon CHỈ ĐƯỢC GHI, đọc qua RPC có khóa.
-- Tệp này tự áp dụng qua tích hợp GitHub (hoặc dán vào SQL Editor → Run).
-- ============================================================

create table if not exists ft_results (
  id uuid primary key default gen_random_uuid(),
  class_code text not null,             -- Mã lớp giảng viên phát
  player_name text,                     -- Tên/nick sinh viên (tùy chọn)
  team_name text not null,              -- Đội trong game + thuyền trưởng
  total_revenue numeric not null,       -- Tổng doanh thu 5 tuần (triệu ₫)
  efficiency int not null check (efficiency between 0 and 100),
  final_rank int not null check (final_rank between 1 and 4), -- hạng so với 3 đối thủ AI
  detail_json jsonb,                    -- thuyền trưởng, điểm đối thủ, seed…
  app_version text,
  client_ts timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_ft_class on ft_results (class_code, created_at desc);

alter table ft_results enable row level security;

create policy "sinh vien chi duoc nop ket qua ganh hang"
  on ft_results for insert to anon
  with check (true);

-- KHÔNG tạo policy SELECT/UPDATE/DELETE cho anon → mặc định bị chặn.

-- Tổng hợp cho giảng viên: mỗi (sinh viên, đội) 1 dòng – ván có hiệu suất
-- cao nhất, kèm tổng lượt chơi; chỉ trả dữ liệu khi đúng Khóa giảng viên.
create or replace function bizon_ft_board(p_class_code text, p_key text)
returns table (
  player_name text,
  team_name text,
  best_eff int,
  best_revenue numeric,
  best_rank int,
  plays bigint,
  last_play timestamptz
)
language sql security definer stable
set search_path = public
as $$
  with g as (
    select f.* from ft_results f
    where bizon_check_key(p_key) and f.class_code = p_class_code
  ), best as (
    select distinct on (coalesce(g.player_name, '(ẩn danh)'), g.team_name)
      coalesce(g.player_name, '(ẩn danh)') as player_name,
      g.team_name, g.efficiency, g.total_revenue, g.final_rank, g.created_at
    from g
    order by coalesce(g.player_name, '(ẩn danh)'), g.team_name,
      g.efficiency desc, g.created_at desc
  )
  select
    b.player_name, b.team_name, b.efficiency, b.total_revenue, b.final_rank,
    (select count(*) from g
      where coalesce(g.player_name, '(ẩn danh)') = b.player_name and g.team_name = b.team_name),
    (select max(g.created_at) from g
      where coalesce(g.player_name, '(ẩn danh)') = b.player_name and g.team_name = b.team_name)
  from best b
  order by b.efficiency desc, b.total_revenue desc;
$$;
