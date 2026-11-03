-- ============================================================
-- BizOn — Tiến độ từng vụ cho Màn hình lớp học (man-hinh-lop-hoc.html)
-- Trong lúc lớp đang chơi, mỗi sinh viên đã đăng nhập gửi tiến độ sau mỗi vụ / tuần / quý: vụ đang ở, điểm tạm, chặng.
-- Giảng viên chủ lớp đọc để chiếu «vụ 3/6, 7 nhóm đang chơi» thay vì chỉ thấy kết quả cuối ván.
--
-- CHỈ THÊM, an toàn khi chạy lại:
--   1. Bảng live_progress: một dòng cho mỗi sinh viên × lớp × trò (ghi đè mỗi lần gửi). RLS bật, không cấp quyền trực tiếp.
--   2. bizon_live_progress_upsert(...): sinh viên (đăng nhập + email trường) gửi tiến độ của chính mình. Tự dọn dòng cũ hơn 30 ngày.
--   3. bizon_live_progress_class(p_class_code, p_game): chủ lớp đọc tiến độ 12 giờ gần nhất. KHÔNG trả email.
-- Không đụng bảng hay hàm có sẵn. Kiểm thử: test/sql/live_progress_smoke.sql.
-- ============================================================

-- ---------- 1. Bảng ----------
create table if not exists public.live_progress (
  student_id uuid not null references auth.users (id) on delete cascade,
  class_code text not null,
  game text not null check (game in ('bps', 'hcth', 'hcsr')),
  team_name text not null default '',
  round integer not null check (round between 0 and 24),
  rounds_total integer not null check (rounds_total between 1 and 24),
  score numeric,
  stage integer check (stage between 0 and 7),
  finished boolean not null default false,
  detail jsonb,
  updated_at timestamptz not null default now(),
  primary key (student_id, class_code, game)
);
comment on table public.live_progress is 'Tiến độ đang chơi (Màn hình lớp học): một dòng mỗi sinh viên × lớp × trò, ghi đè sau mỗi vụ; dòng quá 30 ngày tự xoá.';
create index if not exists idx_live_progress_class on public.live_progress (class_code, game, updated_at desc);
create index if not exists idx_live_progress_updated on public.live_progress (updated_at);
alter table public.live_progress enable row level security;
revoke all on table public.live_progress from public, anon, authenticated;

-- ---------- 2. Sinh viên gửi tiến độ ----------
create or replace function public.bizon_live_progress_upsert(p_class_code text, p_game text, p_team_name text, p_round integer, p_rounds_total integer,
                                                            p_score numeric default null, p_stage integer default null, p_finished boolean default false,
                                                            p_detail jsonb default null)
returns jsonb
language plpgsql security definer set search_path = public, auth as $$
declare
  v_email text; v_code text := upper(trim(coalesce(p_class_code, ''))); v_game text := lower(trim(coalesce(p_game, '')));
  v_team text := left(trim(coalesce(p_team_name, '')), 60); v_at timestamptz;
begin
  if auth.uid() is null then raise exception 'Cần đăng nhập để gửi tiến độ.'; end if;
  v_email := lower(coalesce(auth.jwt()->>'email', ''));
  if not public.bizon_is_student_email(v_email) then raise exception 'Cần dùng đúng email trường (vd @student.ctu.edu.vn) để gửi tiến độ.'; end if;
  if v_code !~ '^[A-Z0-9_-]{3,40}$' then raise exception 'Mã lớp không hợp lệ.'; end if;
  if v_game not in ('bps', 'hcth', 'hcsr') then raise exception 'Trò chơi không hợp lệ.'; end if;
  if p_rounds_total is null or p_rounds_total not between 1 and 24 or p_round is null or p_round not between 0 and p_rounds_total then
    raise exception 'Vụ không hợp lệ.';
  end if;
  if p_stage is not null and p_stage not between 0 and 7 then raise exception 'Chặng không hợp lệ.'; end if;
  if p_score is not null and abs(p_score) > 1e9 then raise exception 'Điểm không hợp lệ.'; end if;
  if p_detail is not null and (jsonb_typeof(p_detail) <> 'object' or char_length(p_detail::text) > 4000) then raise exception 'Chi tiết không hợp lệ.'; end if;

  delete from public.live_progress where updated_at < now() - interval '30 days';
  insert into public.live_progress (student_id, class_code, game, team_name, round, rounds_total, score, stage, finished, detail, updated_at)
  values (auth.uid(), v_code, v_game, v_team, p_round, p_rounds_total, p_score, p_stage, coalesce(p_finished, false), p_detail, now())
  on conflict (student_id, class_code, game) do update
    set team_name = excluded.team_name, round = excluded.round, rounds_total = excluded.rounds_total, score = excluded.score,
        stage = excluded.stage, finished = excluded.finished, detail = excluded.detail, updated_at = now()
  returning updated_at into v_at;
  return jsonb_build_object('game', v_game, 'round', p_round, 'updated_at', v_at);
end; $$;
revoke all on function public.bizon_live_progress_upsert(text, text, text, integer, integer, numeric, integer, boolean, jsonb) from public, anon;
grant execute on function public.bizon_live_progress_upsert(text, text, text, integer, integer, numeric, integer, boolean, jsonb) to authenticated;

-- ---------- 3. Chủ lớp đọc tiến độ (12 giờ gần nhất, không email) ----------
create or replace function public.bizon_live_progress_class(p_class_code text, p_game text)
returns table (team_name text, round integer, rounds_total integer, score numeric, stage integer, finished boolean, detail jsonb, updated_at timestamptz)
language sql security definer stable set search_path = public as $$
  select l.team_name, l.round, l.rounds_total, l.score, l.stage, l.finished, l.detail, l.updated_at
  from live_progress l
  where bizon_owns_class(p_class_code) and l.class_code = upper(trim(p_class_code)) and l.game = lower(trim(p_game))
    and l.updated_at > now() - interval '12 hours'
  order by l.round desc, l.score desc nulls last, l.updated_at desc;
$$;
revoke all on function public.bizon_live_progress_class(text, text) from public, anon;
grant execute on function public.bizon_live_progress_class(text, text) to authenticated;

notify pgrst, 'reload schema';
