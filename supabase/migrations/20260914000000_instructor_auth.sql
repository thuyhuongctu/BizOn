-- ============================================================
-- BizOn — Tài khoản giảng viên thật (Supabase Auth) + lối vào khách
--
-- Bối cảnh: trước migration này, TOÀN BỘ giảng viên dùng chung một
-- "Khóa giảng viên" trong app_secrets. Ai cầm khóa đọc được dữ liệu
-- của BẤT KỲ mã lớp nào — không có ranh giới giữa các giảng viên.
-- Điều này đủ dùng khi chỉ có 1-2 người, nhưng không mở rộng được.
--
-- Migration này thêm một lớp truy cập thứ hai, song song với lớp cũ:
--   • Giảng viên đăng ký tài khoản Supabase Auth thật (email/mật khẩu),
--     rồi "đăng ký" (claim) một mã lớp — ai đăng ký trước, người đó sở
--     hữu mã lớp đó (auth.uid() ghi vào instructor_class_access).
--   • Các RPC đọc dữ liệu lớp có bản "_v2" mới: bỏ tham số p_key, thay
--     bằng kiểm tra auth.uid() có sở hữu đúng mã lớp không
--     (bizon_owns_class). Không cần khóa chung nữa.
--   • Bản "_v2" chỉ cấp quyền EXECUTE cho vai trò "authenticated"
--     (người đã đăng nhập thật) — "anon" không gọi được, vì auth.uid()
--     luôn là null với anon nên bizon_owns_class() luôn trả false.
--   • Thêm lối vào khách tham quan: bizon_demo_leaderboard()/
--     bizon_demo_feed(), đọc dữ liệu mẫu đã seed sẵn ở mã lớp
--     'DEMO-2026' — không cần đăng nhập, không đụng dữ liệu lớp thật.
--
-- CHƯA xóa các hàm khóa-chung cũ (bizon_leaderboard, bizon_feed,
-- bizon_ft_board, bizon_bp_board, bizon_survey_export,
-- bizon_bp_learning_traces với p_key) trong migration này — để không
-- khóa luôn quyền truy cập hiện tại của cô/thầy trong lúc kiểm thử
-- luồng đăng nhập mới. Một khi luồng mới chạy ổn với lớp thật, hãy áp
-- migration theo sau để REVOKE EXECUTE các hàm p_key cũ khỏi anon —
-- đóng hẳn "cửa sau" khóa chung. Xem ghi chú cuối tệp.
-- ============================================================

-- ---------- 1. Bảng sở hữu mã lớp ----------
create table if not exists public.instructor_class_access (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references auth.users(id) on delete cascade,
  class_code text not null check (class_code ~ '^[A-Z0-9_-]{3,40}$'),
  created_at timestamptz not null default now(),
  unique (class_code)
);

create index if not exists idx_ica_instructor on public.instructor_class_access (instructor_id);

alter table public.instructor_class_access enable row level security;
-- Không cấp policy nào cho anon/authenticated: mọi truy cập đi qua
-- các hàm SECURITY DEFINER bên dưới, không đọc/ghi bảng trực tiếp.
revoke all on public.instructor_class_access from anon, authenticated;

-- ---------- 2. Đăng ký mã lớp (ai đăng ký trước, người đó sở hữu) ----------
create or replace function public.bizon_claim_class(p_class_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(p_class_code));
begin
  if auth.uid() is null then
    raise exception 'Cần đăng nhập trước khi đăng ký mã lớp.';
  end if;
  if v_code !~ '^[A-Z0-9_-]{3,40}$' then
    raise exception 'Mã lớp cần 3-40 ký tự: chữ hoa, số, gạch dưới hoặc gạch nối.';
  end if;

  if exists (
    select 1 from instructor_class_access
    where class_code = v_code and instructor_id = auth.uid()
  ) then
    return true;
  end if;

  begin
    insert into instructor_class_access (instructor_id, class_code)
    values (auth.uid(), v_code);
    return true;
  exception when unique_violation then
    raise exception 'Mã lớp này đã được một giảng viên khác đăng ký.';
  end;
end;
$$;

revoke all on function public.bizon_claim_class(text) from public, anon;
grant execute on function public.bizon_claim_class(text) to authenticated;

-- Giảng viên xem các mã lớp mình đang sở hữu (cho UI "lớp của tôi").
create or replace function public.bizon_my_classes()
returns table (class_code text, created_at timestamptz)
language sql
security definer
stable
set search_path = public
as $$
  select class_code, created_at
  from instructor_class_access
  where instructor_id = auth.uid()
  order by created_at desc;
$$;

revoke all on function public.bizon_my_classes() from public, anon;
grant execute on function public.bizon_my_classes() to authenticated;

-- ---------- 3. Hàm kiểm tra sở hữu (thay cho bizon_check_key_gate) ----------
create or replace function public.bizon_owns_class(p_class_code text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from instructor_class_access
    where class_code = upper(trim(p_class_code))
      and instructor_id = auth.uid()
  );
$$;

revoke all on function public.bizon_owns_class(text) from public, anon;
grant execute on function public.bizon_owns_class(text) to authenticated;

-- ---------- 4. Bản "_v2" của các RPC đọc dữ liệu lớp ----------
-- Mỗi hàm giữ nguyên phần thân xử lý dữ liệu của hàm gốc; chỉ thay
-- CTE "auth" từ bizon_check_key_gate(p_key) sang bizon_owns_class(p_class_code)
-- và bỏ tham số p_key.

create or replace function public.bizon_leaderboard_v2(p_class_code text)
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
  with auth as materialized (
    select bizon_owns_class(p_class_code) as ok
  ), latest as (
    select distinct on (rs.team_name)
      rs.team_name, rs.round_number, rs.result_json, rs.created_at
    from round_submissions rs, auth
    where auth.ok and rs.class_code = p_class_code
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

create or replace function public.bizon_feed_v2(p_class_code text, p_limit int default 30)
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
  with auth as materialized (
    select bizon_owns_class(p_class_code) as ok
  )
  select rs.team_name, rs.round_number,
         (rs.result_json->>'netProfit')::numeric,
         (rs.result_json->>'share')::numeric,
         rs.created_at
  from round_submissions rs, auth
  where auth.ok and rs.class_code = p_class_code
  order by rs.created_at desc
  limit least(coalesce(p_limit, 30), 100);
$$;

create or replace function public.bizon_ft_board_v2(p_class_code text)
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
  with auth as materialized (
    select bizon_owns_class(p_class_code) as ok
  ), g as (
    select f.* from ft_results f, auth
    where auth.ok and f.class_code = p_class_code
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

create or replace function public.bizon_bp_board_v2(p_class_code text)
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
  with auth as materialized (
    select bizon_owns_class(p_class_code) as ok
  ), g as (
    select b.* from bp_results b, auth
    where auth.ok and b.class_code = p_class_code
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

create or replace function public.bizon_survey_export_v2(p_class_code text)
returns table (
  instrument text,
  phase text,
  student_code text,
  role text,
  rounds_played int,
  score_a int,
  score_by_outcome jsonb,
  likert_b jsonb,
  likert_c jsonb,
  nps int,
  open_like text,
  open_improve text,
  created_at timestamptz
)
language sql security definer stable
set search_path = public
as $$
  with auth as materialized (
    select bizon_owns_class(p_class_code) as ok
  )
  select sr.instrument, sr.phase, sr.student_code, sr.role, sr.rounds_played,
         sr.score_a, sr.score_by_outcome, sr.likert_b, sr.likert_c,
         sr.nps, sr.open_like, sr.open_improve, sr.created_at
  from survey_responses sr, auth
  where auth.ok and sr.class_code = p_class_code
  order by sr.instrument, sr.student_code, sr.phase desc, sr.created_at;
$$;

create or replace function public.bizon_bp_learning_traces_v2(p_class_code text)
returns table (
  trace_id uuid,
  team_alias text,
  session_id text,
  game_seed text,
  trace_json jsonb,
  consented_at timestamptz,
  retention_until timestamptz,
  updated_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  with auth as materialized (
    select public.bizon_owns_class(p_class_code) as ok
  )
  select t.id, t.team_alias, t.session_id, t.game_seed, t.trace_json,
         t.consented_at, t.retention_until, t.updated_at
  from public.bp_learning_traces t, auth
  where auth.ok
    and t.class_code = upper(trim(p_class_code))
    and t.retention_until > now()
  order by t.updated_at desc;
$$;

revoke all on function public.bizon_leaderboard_v2(text) from public, anon;
revoke all on function public.bizon_feed_v2(text, int) from public, anon;
revoke all on function public.bizon_ft_board_v2(text) from public, anon;
revoke all on function public.bizon_bp_board_v2(text) from public, anon;
revoke all on function public.bizon_survey_export_v2(text) from public, anon;
revoke all on function public.bizon_bp_learning_traces_v2(text) from public, anon;

grant execute on function public.bizon_leaderboard_v2(text) to authenticated;
grant execute on function public.bizon_feed_v2(text, int) to authenticated;
grant execute on function public.bizon_ft_board_v2(text) to authenticated;
grant execute on function public.bizon_bp_board_v2(text) to authenticated;
grant execute on function public.bizon_survey_export_v2(text) to authenticated;
grant execute on function public.bizon_bp_learning_traces_v2(text) to authenticated;

-- ---------- 5. Lối vào khách tham quan (lớp mẫu, không cần đăng nhập) ----------
insert into round_submissions (class_code, team_name, round_number, result_json, result_hash, created_at)
select * from (values
  ('DEMO-2026', 'Đội Rồng Vàng',  1, '{"share":18.4,"netProfit":420000000,"revenue":1850000000,"balance":610000000}'::jsonb, 'demo-seed-1', now() - interval '50 minutes'),
  ('DEMO-2026', 'Đội Rồng Vàng',  2, '{"share":21.1,"netProfit":510000000,"revenue":2100000000,"balance":780000000}'::jsonb, 'demo-seed-2', now() - interval '35 minutes'),
  ('DEMO-2026', 'Đội Sông Hậu',   1, '{"share":15.2,"netProfit":300000000,"revenue":1600000000,"balance":520000000}'::jsonb, 'demo-seed-3', now() - interval '48 minutes'),
  ('DEMO-2026', 'Đội Sông Hậu',   2, '{"share":19.6,"netProfit":460000000,"revenue":1950000000,"balance":690000000}'::jsonb, 'demo-seed-4', now() - interval '20 minutes'),
  ('DEMO-2026', 'Đội Miệt Vườn',  1, '{"share":12.8,"netProfit":250000000,"revenue":1400000000,"balance":470000000}'::jsonb, 'demo-seed-5', now() - interval '40 minutes')
) as v(class_code, team_name, round_number, result_json, result_hash, created_at)
where not exists (select 1 from round_submissions where class_code = 'DEMO-2026');

create or replace function public.bizon_demo_leaderboard()
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
    where rs.class_code = 'DEMO-2026'
    order by rs.team_name, rs.round_number desc, rs.created_at desc
  )
  select
    l.team_name,
    l.round_number,
    (select count(*) from round_submissions r2
      where r2.class_code = 'DEMO-2026' and r2.team_name = l.team_name),
    (l.result_json->>'share')::numeric,
    (l.result_json->>'netProfit')::numeric,
    (l.result_json->>'revenue')::numeric,
    (l.result_json->>'balance')::numeric,
    l.created_at
  from latest l
  order by (l.result_json->>'share')::numeric desc nulls last;
$$;

create or replace function public.bizon_demo_feed(p_limit int default 30)
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
  where rs.class_code = 'DEMO-2026'
  order by rs.created_at desc
  limit least(coalesce(p_limit, 30), 100);
$$;

revoke all on function public.bizon_demo_leaderboard() from public;
revoke all on function public.bizon_demo_feed(int) from public;
grant execute on function public.bizon_demo_leaderboard() to anon, authenticated;
grant execute on function public.bizon_demo_feed(int) to anon, authenticated;

-- ============================================================
-- Bước tiếp theo (KHÔNG chạy tự động — chờ xác nhận luồng mới ổn
-- định với lớp thật rồi mới áp dụng bằng migration riêng):
--
--   revoke execute on function public.bizon_leaderboard(text, text) from anon, authenticated;
--   revoke execute on function public.bizon_feed(text, text, int) from anon, authenticated;
--   revoke execute on function public.bizon_ft_board(text, text) from anon, authenticated;
--   revoke execute on function public.bizon_bp_board(text, text) from anon, authenticated;
--   revoke execute on function public.bizon_survey_export(text, text) from anon, authenticated;
--   revoke execute on function public.bizon_bp_learning_traces(text, text) from anon, authenticated;
--
-- Sau bước đó, khóa giảng viên chung trong app_secrets không còn mở
-- được dữ liệu lớp nào nữa — mỗi giảng viên chỉ vào được lớp do
-- chính auth.uid() của mình đăng ký.
-- ============================================================
