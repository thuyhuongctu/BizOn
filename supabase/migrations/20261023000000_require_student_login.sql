-- ============================================================
-- BizOn — Bắt buộc sinh viên đăng nhập mới nộp kết quả về lớp (bước 1/2: CỘNG THÊM)
--
-- Bối cảnh (review 23/10/2026): round_submissions, member_log, bp_results,
-- ft_results nhận INSERT từ anon, nên ai biết Mã lớp + Tên đội đều ghi đè
-- được bài của đội khác hoặc bịa điểm cá nhân; bizon_claim_class cho bất kỳ
-- tài khoản nào nhận mã lớp chưa có chủ (ai nhận trước thì đọc được dữ liệu
-- sinh viên của lớp đó).
--
-- Migration này CHỈ THÊM, không thu hồi gì — áp trước, để các trang mới
-- (gọi hàm có đăng nhập) chạy được ngay trong khi trang cũ vẫn chạy:
--   1. instructor_allowlist: chỉ giảng viên được admin duyệt mới nhận mã lớp.
--      Seed sẵn 2 admin + mọi giảng viên ĐANG sở hữu lớp, không ai bị khoá.
--   2. bizon_submit_round / bizon_log_member: nộp kết quả vòng và nhật ký
--      đóng góp Bật Nghiệp bằng danh tính thật; đội, vai, email lấy từ
--      student_team_membership (bizon_join_team), không nhận từ client.
--   3. bizon_team_log_v2 / bizon_team_all_log_v2: chỉ thành viên đúng đội
--      xem nhật ký đội mình.
--   4. bizon_submit_bp_result / bizon_submit_ft_result: thêm kiểm tra giá trị;
--      bản Hộ Chiếu nhận thêm markets/badges/stars (tùy chọn) cho bảng xếp hạng 3D.
-- Bước 2/2 (20261023010000_revoke_anon_writes.sql) thu hồi đường ghi ẩn danh
-- và chỉ cho bảng xếp hạng hiện các lượt đã đăng nhập (biệt danh, không email)
-- — áp SAU khi các trang đã lên bản mới. An toàn khi chạy lại.
-- ============================================================

-- ---------- 1. Duyệt giảng viên ----------
create table if not exists public.instructor_allowlist (
  email text primary key check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+$'),
  note text,
  added_by text,
  created_at timestamptz not null default now()
);
alter table public.instructor_allowlist enable row level security;
revoke all on public.instructor_allowlist from anon, authenticated, public;

insert into public.instructor_allowlist (email, note, added_by)
values ('thuyhuongctu@gmail.com', 'Quản trị', 'migration'),
       ('patu@ctu.edu.vn', 'Quản trị', 'migration')
on conflict (email) do nothing;

-- Giảng viên đã có lớp trước khi bật duyệt: giữ nguyên quyền.
insert into public.instructor_allowlist (email, note, added_by)
select distinct lower(u.email), 'Đã có lớp trước khi bật duyệt', 'migration'
from public.instructor_class_access a
join auth.users u on u.id = a.instructor_id
where u.email is not null
on conflict (email) do nothing;

create or replace function public.bizon_is_instructor()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.bizon_is_admin()
      or exists (select 1 from instructor_allowlist l where l.email = lower(coalesce(auth.email(), '')));
$$;
revoke all on function public.bizon_is_instructor() from public, anon;
grant execute on function public.bizon_is_instructor() to authenticated;

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

  if not public.bizon_is_instructor() then
    raise exception 'Tài khoản này chưa được duyệt là giảng viên. Liên hệ quản trị BizOn để được thêm vào danh sách.';
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

-- Admin quản lý danh sách (gọi từ Trang Giảng viên, mục Quản trị).
create or replace function public.bizon_admin_instructors()
returns table (email text, note text, added_by text, created_at timestamptz, classes int)
language plpgsql
security definer
stable
set search_path = public
as $$
#variable_conflict use_column
begin
  if not public.bizon_is_admin() then
    raise exception 'Chỉ quản trị BizOn xem được danh sách giảng viên.';
  end if;
  return query
    select l.email, l.note, l.added_by, l.created_at,
      (select count(*)::int from instructor_class_access a join auth.users u on u.id = a.instructor_id
        where lower(u.email) = l.email)
    from instructor_allowlist l
    order by l.created_at;
end;
$$;
revoke all on function public.bizon_admin_instructors() from public, anon;
grant execute on function public.bizon_admin_instructors() to authenticated;

create or replace function public.bizon_admin_set_instructor(p_email text, p_allowed boolean, p_note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
begin
  if not public.bizon_is_admin() then
    raise exception 'Chỉ quản trị BizOn duyệt được giảng viên.';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+$' then
    raise exception 'Email không hợp lệ.';
  end if;
  if p_allowed then
    insert into instructor_allowlist (email, note, added_by)
    values (v_email, left(nullif(trim(coalesce(p_note, '')), ''), 120), auth.email())
    on conflict (email) do update set note = coalesce(excluded.note, instructor_allowlist.note);
  else
    -- Gỡ duyệt chỉ chặn nhận lớp MỚI; lớp đã nhận vẫn giữ (gỡ lớp: bizon_delete_class).
    delete from instructor_allowlist where email = v_email;
  end if;
end;
$$;
revoke all on function public.bizon_admin_set_instructor(text, boolean, text) from public, anon;
grant execute on function public.bizon_admin_set_instructor(text, boolean, text) to authenticated;

-- ---------- 2. Nộp Bật Nghiệp bằng danh tính thật ----------
-- Thành viên đội của người gọi trong một lớp (null nếu chưa tham gia / sai domain).
create or replace function public.bizon_my_membership(p_class_code text)
returns table (class_code text, team_name text, role text, student_email text)
language plpgsql
security definer
stable
set search_path = public
as $$
#variable_conflict use_column
begin
  if auth.uid() is null then
    raise exception 'Cần đăng nhập bằng email trường để gửi kết quả về lớp.';
  end if;
  if lower(coalesce(auth.jwt()->>'email', '')) !~ '@student\.ctu\.edu\.vn$' then
    raise exception 'Cần dùng đúng email trường (@student.ctu.edu.vn).';
  end if;
  return query
    select m.class_code, m.team_name, m.role, m.student_email
    from student_team_membership m
    where m.student_id = auth.uid() and m.class_code = upper(trim(p_class_code));
end;
$$;
revoke all on function public.bizon_my_membership(text) from public, anon;

alter table public.round_submissions add column if not exists student_id uuid references auth.users(id) on delete set null;

create or replace function public.bizon_submit_round(
  p_class_code text, p_round int, p_result_json jsonb, p_result_hash text, p_client_ts timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  m record;
begin
  select * into m from public.bizon_my_membership(p_class_code);
  if m.team_name is null then
    raise exception 'Bạn chưa tham gia đội nào trong lớp này.';
  end if;
  if p_round is null or p_round not between 1 and 6 then
    raise exception 'Vòng phải từ 1 đến 6.';
  end if;
  if p_result_json is null or jsonb_typeof(p_result_json) <> 'object' or length(p_result_json::text) > 20000 then
    raise exception 'Kết quả vòng không hợp lệ.';
  end if;
  if coalesce(p_result_hash, '') !~ '^([0-9a-f]{64}|nohash)$' then
    raise exception 'Mã băm kết quả không hợp lệ.';
  end if;

  insert into round_submissions (class_code, team_name, student_email, round_number, result_json, result_hash, client_ts, student_id)
  values (m.class_code, m.team_name, m.student_email, p_round, p_result_json, p_result_hash,
          least(coalesce(p_client_ts, now()), now() + interval '5 minutes'), auth.uid());
end;
$$;
revoke all on function public.bizon_submit_round(text, int, jsonb, text, timestamptz) from public, anon;
grant execute on function public.bizon_submit_round(text, int, jsonb, text, timestamptz) to authenticated;

create or replace function public.bizon_log_member(
  p_class_code text, p_round int, p_kind text, p_payload jsonb, p_member_name text default null, p_client_ts timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  m record;
begin
  select * into m from public.bizon_my_membership(p_class_code);
  if m.team_name is null then
    raise exception 'Bạn chưa tham gia đội nào trong lớp này.';
  end if;
  if p_round is null or p_round not between 1 and 6 then
    raise exception 'Vòng phải từ 1 đến 6.';
  end if;
  if p_kind not in ('proposal','minutes','whatif','commit','lumina') then
    raise exception 'Loại ghi nhận không hợp lệ.';
  end if;
  if coalesce(length(p_payload::text), 0) > 4000 then
    raise exception 'Nội dung ghi nhận quá dài.';
  end if;

  insert into member_log (class_code, team_name, round_number, member_email, member_name, role, kind, payload, client_ts)
  values (m.class_code, m.team_name, p_round, m.student_email,
          left(nullif(trim(coalesce(p_member_name, '')), ''), 60), m.role, p_kind, coalesce(p_payload, '{}'::jsonb),
          least(coalesce(p_client_ts, now()), now() + interval '5 minutes'));
end;
$$;
revoke all on function public.bizon_log_member(text, int, text, jsonb, text, timestamptz) from public, anon;
grant execute on function public.bizon_log_member(text, int, text, jsonb, text, timestamptz) to authenticated;

-- ---------- 3. Nhật ký đội: chỉ thành viên đúng đội ----------
create or replace function public.bizon_team_log_v2(p_class_code text, p_round int)
returns table (member_name text, role text, kind text, payload jsonb, created_at timestamptz)
language plpgsql
security definer
stable
set search_path = public
as $$
#variable_conflict use_column
declare
  m record;
begin
  select * into m from public.bizon_my_membership(p_class_code);
  if m.team_name is null then
    raise exception 'Bạn chưa tham gia đội nào trong lớp này.';
  end if;
  return query
    select l.member_name, l.role, l.kind, l.payload, l.created_at from member_log l
    where upper(l.class_code) = m.class_code and l.team_name = m.team_name and l.round_number = p_round
      and l.kind in ('proposal','minutes')
    order by l.created_at desc limit 40;
end;
$$;
revoke all on function public.bizon_team_log_v2(text, int) from public, anon;
grant execute on function public.bizon_team_log_v2(text, int) to authenticated;

create or replace function public.bizon_team_all_log_v2(p_class_code text)
returns table (round_number int, member_name text, role text, kind text, payload jsonb, created_at timestamptz)
language plpgsql
security definer
stable
set search_path = public
as $$
#variable_conflict use_column
declare
  m record;
begin
  select * into m from public.bizon_my_membership(p_class_code);
  if m.team_name is null then
    raise exception 'Bạn chưa tham gia đội nào trong lớp này.';
  end if;
  return query
    select l.round_number, l.member_name, l.role, l.kind, l.payload, l.created_at from member_log l
    where upper(l.class_code) = m.class_code and l.team_name = m.team_name
    order by l.round_number, l.created_at limit 500;
end;
$$;
revoke all on function public.bizon_team_all_log_v2(text) from public, anon;
grant execute on function public.bizon_team_all_log_v2(text) to authenticated;

-- ---------- 4. Hộ Chiếu / Bến Phù Sa: thêm kiểm tra giá trị ----------
-- Hộ Chiếu 3D gửi thêm số thị trường / huy hiệu / sao (cột từ 20260929000000_bp_leaderboard.sql).
-- Bản 13 tham số cũ chưa trang nào gọi; bỏ đi để PostgREST không phải chọn giữa 2 bản.
alter table public.bp_results add column if not exists markets int;
alter table public.bp_results add column if not exists badges int;
alter table public.bp_results add column if not exists stars int;
drop function if exists public.bizon_submit_bp_result(text, text, text, int, numeric, int, int, int, int, text, int, jsonb, text);
create or replace function public.bizon_submit_bp_result(
  p_class_code text, p_player_name text, p_company text, p_total_score int,
  p_profit numeric, p_rep int, p_capab int, p_adapt int, p_sust int,
  p_title text, p_quarters int, p_detail_json jsonb, p_app_version text,
  p_markets int default null, p_badges int default null, p_stars int default null
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'Cần đăng nhập để nộp kết quả.';
  end if;
  v_email := lower(coalesce(auth.jwt()->>'email', ''));
  if v_email !~ '@student\.ctu\.edu\.vn$' then
    raise exception 'Cần dùng đúng email trường (@student.ctu.edu.vn) để nộp kết quả.';
  end if;
  if coalesce(trim(p_class_code), '') !~ '^[A-Za-z0-9_-]{3,40}$' then
    raise exception 'Mã lớp không hợp lệ.';
  end if;
  if coalesce(p_total_score, 0) not between 0 and 100 or coalesce(length(p_player_name), 0) > 60
     or coalesce(p_markets, 0) not between 0 and 50 or coalesce(p_badges, 0) not between 0 and 200
     or coalesce(p_stars, 0) not between 0 and 200
     or coalesce(length(p_detail_json::text), 0) > 20000 then
    raise exception 'Kết quả không hợp lệ.';
  end if;

  insert into public.bp_results (
    class_code, player_name, company, total_score, profit, rep, capab, adapt, sust,
    title, quarters, detail_json, app_version, client_ts, student_id, student_email, markets, badges, stars
  ) values (
    trim(p_class_code), nullif(trim(coalesce(p_player_name, '')), ''), left(p_company, 80), p_total_score, p_profit,
    p_rep, p_capab, p_adapt, p_sust, left(p_title, 80), p_quarters, p_detail_json,
    left(p_app_version, 40), now(), auth.uid(), v_email, p_markets, p_badges, p_stars
  );
end;
$$;
revoke all on function public.bizon_submit_bp_result(text, text, text, int, numeric, int, int, int, int, text, int, jsonb, text, int, int, int) from public, anon;
grant execute on function public.bizon_submit_bp_result(text, text, text, int, numeric, int, int, int, int, text, int, jsonb, text, int, int, int) to authenticated;

create or replace function public.bizon_submit_ft_result(
  p_class_code text, p_player_name text, p_team_name text, p_total_revenue numeric,
  p_efficiency int, p_final_rank int, p_detail_json jsonb, p_app_version text
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'Cần đăng nhập để nộp kết quả.';
  end if;
  v_email := lower(coalesce(auth.jwt()->>'email', ''));
  if v_email !~ '@student\.ctu\.edu\.vn$' then
    raise exception 'Cần dùng đúng email trường (@student.ctu.edu.vn) để nộp kết quả.';
  end if;
  if coalesce(trim(p_class_code), '') !~ '^[A-Za-z0-9_-]{3,40}$' then
    raise exception 'Mã lớp không hợp lệ.';
  end if;
  if coalesce(length(p_player_name), 0) > 60 or coalesce(length(p_team_name), 0) > 80
     or coalesce(p_efficiency, 0) not between -1000 and 1000
     or coalesce(length(p_detail_json::text), 0) > 20000 then
    raise exception 'Kết quả không hợp lệ.';
  end if;

  insert into public.ft_results (
    class_code, player_name, team_name, total_revenue, efficiency, final_rank,
    detail_json, app_version, client_ts, student_id, student_email
  ) values (
    trim(p_class_code), nullif(trim(coalesce(p_player_name, '')), ''), p_team_name, p_total_revenue, p_efficiency,
    p_final_rank, p_detail_json, left(p_app_version, 40), now(), auth.uid(), v_email
  );
end;
$$;
revoke all on function public.bizon_submit_ft_result(text, text, text, numeric, int, int, jsonb, text) from public, anon;
grant execute on function public.bizon_submit_ft_result(text, text, text, numeric, int, int, jsonb, text) to authenticated;

notify pgrst, 'reload schema';
