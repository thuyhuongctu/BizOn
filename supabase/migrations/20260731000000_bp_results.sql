-- ============================================================
-- BizOn Bật Nghiệp — Sổ nhận kết quả «Hộ Chiếu Thương Hiệu» (brand-passport.html)
-- Sinh viên chơi xong 6 quý có thể nộp kết quả kèm Mã lớp; giảng viên xem
-- tổng hợp trên giang-vien.html bằng Khóa giảng viên (app_secrets).
-- Cùng triết lý các bảng khác: anon CHỈ ĐƯỢC GHI, đọc qua RPC có khóa.
-- Tệp này tự áp dụng qua tích hợp GitHub (hoặc dán vào SQL Editor → Run).
-- ============================================================

create table if not exists bp_results (
  id uuid primary key default gen_random_uuid(),
  class_code text not null,
  player_name text,
  company text not null,                 -- doanh nghiệp đã chọn (Mộc Nhiên…)
  total_score int not null check (total_score between 0 and 100),
  profit numeric not null,               -- lợi nhuận tích lũy (tỷ ₫)
  rep int, capab int, adapt int, sust int,
  title text,                            -- danh hiệu cuối ván
  quarters int not null,                 -- số quý đã chơi (thua sớm < 6)
  detail_json jsonb,
  app_version text,
  client_ts timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_bp_class on bp_results (class_code, created_at desc);

alter table bp_results enable row level security;

create policy "sinh vien chi duoc nop ket qua ho chieu"
  on bp_results for insert to anon
  with check (true);

-- KHÔNG tạo policy SELECT/UPDATE/DELETE cho anon → mặc định bị chặn.

-- Tổng hợp cho giảng viên: ván điểm cao nhất của mỗi (sinh viên, doanh nghiệp)
create or replace function bizon_bp_board(p_class_code text, p_key text)
returns table (
  player_name text,
  company text,
  best_score int,
  best_profit numeric,
  best_title text,
  quarters int,
  plays bigint,
  last_play timestamptz
)
language sql security definer stable
set search_path = public
as $$
  with g as (
    select b.* from bp_results b
    where bizon_check_key(p_key) and b.class_code = p_class_code
  ), best as (
    select distinct on (coalesce(g.player_name, '(ẩn danh)'), g.company)
      coalesce(g.player_name, '(ẩn danh)') as player_name,
      g.company, g.total_score, g.profit, g.title, g.quarters, g.created_at
    from g
    order by coalesce(g.player_name, '(ẩn danh)'), g.company,
      g.total_score desc, g.created_at desc
  )
  select
    b.player_name, b.company, b.total_score, b.profit, b.title, b.quarters,
    (select count(*) from g
      where coalesce(g.player_name, '(ẩn danh)') = b.player_name and g.company = b.company),
    (select max(g.created_at) from g
      where coalesce(g.player_name, '(ẩn danh)') = b.player_name and g.company = b.company)
  from best b
  order by b.total_score desc, b.profit desc;
$$;
