-- ============================================================
-- BizOn — Trợ lý giảng viên: nhận xét cuối vòng đã duyệt (Bật Nghiệp)
-- Thiết kế: docs/design/tro-ly-giang-vien.md. Bản nháp soạn trên máy giảng viên (js/tro-ly-mau-cau.js), KHÔNG lưu
-- lên máy chủ; chỉ khi giảng viên bấm duyệt (hoặc bỏ) mới ghi một dòng. Mỗi dòng là một biên nhận: ai duyệt, lúc nào,
-- chữ gì, dựa trên lần nộp nào (result_hash lấy từ round_submissions ngay trên máy chủ, không tin máy khách).
--
-- CHỈ THÊM, an toàn khi chạy lại:
--   1. Bảng class_feedback: (class_code, team_name, round_number, phien_ban) duy nhất. RLS bật, không cấp quyền trực tiếp.
--      Sửa sau khi gửi = dòng mới phien_ban + 1, dòng cũ giữ nguyên. Thu hồi = đổi trạng thái dòng mới nhất, không xoá.
--      Không có email, không có tên sinh viên. Dòng quá 365 ngày tự xoá mỗi lần gửi (cùng nếp live_progress).
--   2. bizon_feedback_send(...): chủ lớp gửi một bản đã duyệt. Chặn khi chế độ thi đang bật.
--   3. bizon_feedback_set_state(...): chủ lớp bỏ một bản nháp ('bo') hoặc thu hồi bản đã gửi ('thu_hoi').
--   4. bizon_feedback_class(p_class_code): chủ lớp đọc mọi dòng (kể cả biên nhận cũ) và hash lần nộp mới nhất của mỗi đội.
--   5. bizon_class_feed thêm khoá 'feedback': chỉ phiên bản mới nhất, và chỉ khi nó đang 'da_gui', của đúng đội hỏi.
-- Chạy SAU 20261027000000_explain_mode.sql: tệp ấy định nghĩa bizon_class_feed không có 'feedback', nên nếu về sau chạy
-- lại tệp ấy (hay 20261026000000_journey_passports.sql) thì phải chạy lại tệp này. Kiểm thử: test/sql/class_feedback_smoke.sql.
-- ============================================================

-- ---------- 1. Bảng ----------
create table if not exists public.class_feedback (
  id uuid primary key default gen_random_uuid(),
  class_code text not null,
  team_name text not null,
  round_number integer not null check (round_number between 1 and 6),
  phien_ban integer not null check (phien_ban >= 1),
  trang_thai text not null check (trang_thai in ('da_gui', 'bo', 'thu_hoi')),
  ngon_ngu text not null default 'vi' check (ngon_ngu in ('vi', 'en')),
  noi_dung text not null default '' check (char_length(noi_dung) <= 1200),
  can_cu jsonb check (can_cu is null or (jsonb_typeof(can_cu) = 'object' and char_length(can_cu::text) <= 4000)),
  result_hash text,
  da_sua boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_code, team_name, round_number, phien_ban)
);
comment on table public.class_feedback is 'Nhận xét cuối vòng giảng viên đã duyệt (biên nhận). Mỗi lần sửa là một phiên bản mới; tự xoá sau 365 ngày.';
create index if not exists idx_class_feedback_created on public.class_feedback (created_at);
alter table public.class_feedback enable row level security;
revoke all on table public.class_feedback from public, anon, authenticated;

-- Phiên bản mới nhất hiện có (0 nếu chưa có dòng nào).
create or replace function public.bizon_feedback_latest(p_class_code text, p_team_name text, p_round integer)
returns integer language sql stable security definer set search_path = public as $$
  select coalesce(max(phien_ban), 0) from class_feedback
  where class_code = p_class_code and team_name = p_team_name and round_number = p_round;
$$;
revoke all on function public.bizon_feedback_latest(text, text, integer) from public, anon, authenticated;

-- Kiểm chung cho hai hàm ghi. Trả mã lớp đã chuẩn hoá.
create or replace function public.bizon_feedback_check(p_class_code text, p_team_name text, p_round integer, p_phien_ban_truoc integer)
returns text language plpgsql stable security definer set search_path = public as $$
declare v text := upper(trim(coalesce(p_class_code, '')));
begin
  if auth.uid() is null or not bizon_owns_class(v) then raise exception 'Không có quyền với lớp này.'; end if;
  if coalesce(trim(p_team_name), '') = '' or char_length(p_team_name) > 60 then raise exception 'Tên đội không hợp lệ.'; end if;
  if p_round is null or p_round not between 1 and 6 then raise exception 'Vòng không hợp lệ.'; end if;
  if to_regclass('public.class_exam') is not null
     and exists (select 1 from class_exam e where e.class_code = v and e.active) then
    raise exception 'Lớp đang ở chế độ thi: chưa gửi nhận xét được.';
  end if;
  -- Hai thẻ cùng mở: thẻ sau phải tải lại thay vì ghi đè lên bản thẻ trước vừa gửi.
  if coalesce(p_phien_ban_truoc, -1) <> bizon_feedback_latest(v, p_team_name, p_round) then
    raise exception 'Nhận xét này vừa được cập nhật ở nơi khác. Tải lại trang rồi làm tiếp.';
  end if;
  return v;
end; $$;
revoke all on function public.bizon_feedback_check(text, text, integer, integer) from public, anon, authenticated;

-- ---------- 2. Gửi một bản đã duyệt ----------
create or replace function public.bizon_feedback_send(p_class_code text, p_team_name text, p_round integer, p_noi_dung text,
                                                     p_ngon_ngu text, p_can_cu jsonb, p_phien_ban_truoc integer)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v text := bizon_feedback_check(p_class_code, p_team_name, p_round, p_phien_ban_truoc);
  v_text text := trim(coalesce(p_noi_dung, '')); v_lang text := lower(coalesce(p_ngon_ngu, 'vi'));
  v_hash text; v_row class_feedback;
begin
  if v_text = '' then raise exception 'Nhận xét đang trống.'; end if;
  if char_length(v_text) > 1200 then raise exception 'Nhận xét dài quá 1 200 ký tự.'; end if;
  if v_lang not in ('vi', 'en') then raise exception 'Ngôn ngữ không hợp lệ.'; end if;
  if p_can_cu is not null and (jsonb_typeof(p_can_cu) <> 'object' or char_length(p_can_cu::text) > 4000) then raise exception 'Số liệu căn cứ không hợp lệ.'; end if;
  -- Căn cứ là lần nộp MỚI NHẤT của đội ở vòng ấy, đúng như bizon_submissions_v2 trả cho giảng viên.
  select rs.result_hash into v_hash from round_submissions rs
  where rs.class_code = v and rs.team_name = p_team_name and rs.round_number = p_round
  order by rs.created_at desc limit 1;
  if v_hash is null then raise exception 'Đội chưa nộp vòng này.'; end if;

  delete from class_feedback where created_at < now() - interval '365 days';
  insert into class_feedback (class_code, team_name, round_number, phien_ban, trang_thai, ngon_ngu, noi_dung, can_cu, result_hash, da_sua, created_by)
  values (v, p_team_name, p_round, p_phien_ban_truoc + 1, 'da_gui', v_lang, v_text, p_can_cu, v_hash,
          exists (select 1 from class_feedback f where f.class_code = v and f.team_name = p_team_name and f.round_number = p_round and f.trang_thai <> 'bo'),
          auth.uid())
  returning * into v_row;
  return to_jsonb(v_row) - 'created_by';
end; $$;
revoke all on function public.bizon_feedback_send(text, text, integer, text, text, jsonb, integer) from public, anon;
grant execute on function public.bizon_feedback_send(text, text, integer, text, text, jsonb, integer) to authenticated;

-- ---------- 3. Bỏ bản nháp / thu hồi bản đã gửi ----------
create or replace function public.bizon_feedback_set_state(p_class_code text, p_team_name text, p_round integer, p_trang_thai text, p_phien_ban_truoc integer)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v text := bizon_feedback_check(p_class_code, p_team_name, p_round, p_phien_ban_truoc);
  v_cur class_feedback; v_row class_feedback;
begin
  select * into v_cur from class_feedback
  where class_code = v and team_name = p_team_name and round_number = p_round and phien_ban = p_phien_ban_truoc;
  if p_trang_thai = 'thu_hoi' then
    if v_cur.id is null or v_cur.trang_thai <> 'da_gui' then raise exception 'Chỉ thu hồi được nhận xét đang gửi.'; end if;
    update class_feedback set trang_thai = 'thu_hoi', updated_at = now() where id = v_cur.id returning * into v_row;
  elsif p_trang_thai = 'bo' then
    if v_cur.id is not null and v_cur.trang_thai = 'da_gui' then raise exception 'Nhận xét đã gửi: dùng thu hồi thay vì bỏ.'; end if;
    insert into class_feedback (class_code, team_name, round_number, phien_ban, trang_thai, created_by)
    values (v, p_team_name, p_round, p_phien_ban_truoc + 1, 'bo', auth.uid())
    returning * into v_row;
  else
    raise exception 'Trạng thái không hợp lệ.';
  end if;
  return to_jsonb(v_row) - 'created_by';
end; $$;
revoke all on function public.bizon_feedback_set_state(text, text, integer, text, integer) from public, anon;
grant execute on function public.bizon_feedback_set_state(text, text, integer, text, integer) to authenticated;

-- ---------- 4. Chủ lớp đọc ----------
create or replace function public.bizon_feedback_class(p_class_code text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v text := upper(trim(coalesce(p_class_code, '')));
begin
  if not bizon_owns_class(v) then raise exception 'Không có quyền với lớp này.'; end if;
  return jsonb_build_object(
    'feedback', coalesce((select jsonb_agg(to_jsonb(f) - 'created_by' order by f.team_name, f.round_number, f.phien_ban)
                          from class_feedback f where f.class_code = v), '[]'::jsonb),
    'hashes', coalesce((select jsonb_agg(jsonb_build_object('team_name', h.team_name, 'round_number', h.round_number, 'result_hash', h.result_hash))
                        from (select distinct on (rs.team_name, rs.round_number) rs.team_name, rs.round_number, rs.result_hash
                              from round_submissions rs where rs.class_code = v
                              order by rs.team_name, rs.round_number, rs.created_at desc) h), '[]'::jsonb));
end; $$;
revoke all on function public.bizon_feedback_class(text) from public, anon;
grant execute on function public.bizon_feedback_class(text) to authenticated;

-- ---------- 5. Feed của game: thêm 'feedback' (giữ nguyên mọi khoá của bản 20261027) ----------
create or replace function public.bizon_class_feed(p_class_code text, p_team_name text)
returns jsonb language sql security definer stable set search_path = public as $$
  select jsonb_build_object(
    'controls', (select jsonb_build_object('locked_round', c.locked_round, 'forced_event', c.forced_event, 'forced_event_round', c.forced_event_round, 'message', c.message, 'exam_started_at', c.exam_started_at, 'journey_carry', c.journey_carry, 'explain_hidden', c.explain_hidden, 'updated_at', c.updated_at)
                 from class_controls c where c.class_code = upper(trim(p_class_code))),
    'grants', coalesce((select jsonb_agg(jsonb_build_object('id', g.id, 'amount', g.amount, 'reason', g.reason, 'created_at', g.created_at) order by g.created_at)
                 from class_grants g where g.class_code = upper(trim(p_class_code)) and (g.team_name = p_team_name or g.team_name = '*')), '[]'::jsonb),
    'feedback', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'round', m.round_number, 'phien_ban', m.phien_ban, 'noi_dung', m.noi_dung,
                                                             'ngon_ngu', m.ngon_ngu, 'da_sua', m.da_sua, 'created_at', m.created_at) order by m.round_number)
                 from (select distinct on (f.round_number) f.* from class_feedback f
                       where f.class_code = upper(trim(p_class_code)) and f.team_name = p_team_name
                       order by f.round_number, f.phien_ban desc) m
                 where m.trang_thai = 'da_gui'), '[]'::jsonb)
  );
$$;
revoke all on function public.bizon_class_feed(text, text) from public;
grant execute on function public.bizon_class_feed(text, text) to anon, authenticated;

notify pgrst, 'reload schema';
