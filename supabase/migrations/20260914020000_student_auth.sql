-- ============================================================
-- BizOn — Tài khoản sinh viên thật (Supabase Auth), CHƯA bật ở giao diện
--
-- Bối cảnh: hiện tại sinh viên "đăng nhập" game.html chỉ bằng cách gõ
-- tự do email + tên đội + mã lớp — không xác thực gì cả (email không
-- kiểm tra, ai gõ đúng class_code + team_name cũng đọc/ghi được
-- get_team_save/upsert_team_save qua "token" tùy chọn, không bắt buộc).
-- Bất kỳ ai biết (hoặc đoán) đúng Mã lớp + Tên đội đều ghi đè được kết
-- quả của đội đó.
--
-- Migration này thêm một lớp xác thực thật, giống hệt kiến trúc đã dùng
-- cho giảng viên (20260914000000_instructor_auth.sql):
--   • Sinh viên đăng ký tài khoản Supabase Auth thật (email/mật khẩu),
--     dùng đúng email trường @student.ctu.edu.vn — kiểm tra domain ngay
--     trong hàm tham gia đội (không dựa vào cấu hình GoTrue vì không có
--     công cụ để chỉnh domain allow-list ở tầng Auth).
--   • "Tham gia đội" (bizon_join_team): một auth.uid() = một đội trong
--     một mã lớp; một vai trò (CEO/CFO/CMO/COO/SEC) trong một đội chỉ
--     một người giữ (unique constraint, ai xí trước giữ vai đó).
--   • Đọc/ghi tiến trình đội qua bizon_student_get_save/
--     bizon_student_upsert_save — suy ra đúng đội của người gọi từ
--     bảng thành viên, KHÔNG nhận team_name từ client nữa. Ghi vào
--     đúng bảng team_saves hiện có (không tách dữ liệu song song) nên
--     Instructor Studio và Dashboard cổ điển đọc được ngay, không cần
--     đổi gì ở phía giảng viên.
--
-- CHƯA đổi gì cho luồng hiện tại: get_team_save/upsert_team_save (nhận
-- token, không bắt buộc đăng nhập) VẪN chạy y nguyên — game.html/js/app.js
-- CHƯA được nối vào các hàm mới trong migration này, được gài sau lưng
-- một cờ tắt (mặc định tắt) ở phía giao diện, do một migration/PR sau
-- quyết định khi nào bật. Migration này chỉ chuẩn bị sẵn backend, thuần
-- cộng thêm — không sửa/xóa bảng hay hàm nào đang dùng.
-- ============================================================

-- ---------- 1. Bảng thành viên đội (ai — lớp nào — đội nào — vai gì) ----------
create table if not exists public.student_team_membership (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  class_code text not null check (class_code ~ '^[A-Z0-9_-]{3,40}$'),
  team_name text not null check (char_length(team_name) between 1 and 60),
  role text not null check (role in ('CEO','CFO','CMO','COO','SEC')),
  student_email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, class_code),
  unique (class_code, team_name, role)
);

create index if not exists idx_stm_class_team on public.student_team_membership (class_code, team_name);

alter table public.student_team_membership enable row level security;
-- Không cấp policy nào cho anon/authenticated: mọi truy cập đi qua các
-- hàm SECURITY DEFINER bên dưới, không đọc/ghi bảng trực tiếp — giống
-- instructor_class_access.
revoke all on public.student_team_membership from anon, authenticated, public;

-- ---------- 2. Tham gia đội (yêu cầu đúng email @student.ctu.edu.vn) ----------
create or replace function public.bizon_join_team(p_class_code text, p_team_name text, p_role text)
returns table (class_code text, team_name text, role text)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_class text := upper(trim(p_class_code));
  v_team text := trim(p_team_name);
  v_role text := upper(trim(p_role));
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'Cần đăng nhập trước khi tham gia đội.';
  end if;

  v_email := lower(coalesce(auth.jwt()->>'email', ''));
  if v_email !~ '@student\.ctu\.edu\.vn$' then
    raise exception 'Cần dùng đúng email trường (@student.ctu.edu.vn) để tham gia đội.';
  end if;

  if v_class !~ '^[A-Z0-9_-]{3,40}$' then
    raise exception 'Mã lớp cần 3-40 ký tự: chữ hoa, số, gạch dưới hoặc gạch nối.';
  end if;
  if v_team = '' or char_length(v_team) > 60 then
    raise exception 'Tên đội cần 1-60 ký tự.';
  end if;
  if v_role not in ('CEO','CFO','CMO','COO','SEC') then
    raise exception 'Vai trò phải là một trong CEO, CFO, CMO, COO, SEC.';
  end if;

  begin
    insert into student_team_membership (student_id, class_code, team_name, role, student_email)
    values (auth.uid(), v_class, v_team, v_role, v_email)
    on conflict (student_id, class_code)
      do update set team_name = excluded.team_name, role = excluded.role,
                     student_email = excluded.student_email, updated_at = now();
  exception when unique_violation then
    raise exception 'Vai trò % của đội % trong lớp % đã có người khác giữ.', v_role, v_team, v_class;
  end;

  return query
    select m.class_code, m.team_name, m.role
    from student_team_membership m
    where m.student_id = auth.uid() and m.class_code = v_class;
end;
$$;

revoke all on function public.bizon_join_team(text, text, text) from public, anon;
grant execute on function public.bizon_join_team(text, text, text) to authenticated;

-- Sinh viên xem đội hiện tại của mình trong một lớp (cho UI hiển thị lại
-- sau khi đăng nhập, không phải gõ lại từ đầu).
create or replace function public.bizon_my_team(p_class_code text)
returns table (class_code text, team_name text, role text)
language sql
security definer
stable
set search_path = public
as $$
  select class_code, team_name, role
  from student_team_membership
  where student_id = auth.uid() and class_code = upper(trim(p_class_code));
$$;

revoke all on function public.bizon_my_team(text) from public, anon;
grant execute on function public.bizon_my_team(text) to authenticated;

-- ---------- 3. Đọc/ghi tiến trình đội theo danh tính thật (không nhận team_name từ client) ----------
create or replace function public.bizon_student_get_save(p_class_code text)
returns table (state_json jsonb, updated_at timestamptz)
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_class text := upper(trim(p_class_code));
  v_team text;
begin
  if auth.uid() is null then
    raise exception 'Cần đăng nhập.';
  end if;
  select m.team_name into v_team
  from student_team_membership m
  where m.student_id = auth.uid() and m.class_code = v_class;
  if v_team is null then
    raise exception 'Bạn chưa tham gia đội nào trong lớp này.';
  end if;
  return query
    select ts.state_json, ts.updated_at
    from team_saves ts
    where ts.class_code = v_class and ts.team_name = v_team;
end;
$$;

revoke all on function public.bizon_student_get_save(text) from public, anon;
grant execute on function public.bizon_student_get_save(text) to authenticated;

create or replace function public.bizon_student_upsert_save(p_class_code text, p_state jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class text := upper(trim(p_class_code));
  v_team text;
begin
  if auth.uid() is null then
    raise exception 'Cần đăng nhập.';
  end if;
  select m.team_name into v_team
  from student_team_membership m
  where m.student_id = auth.uid() and m.class_code = v_class;
  if v_team is null then
    raise exception 'Bạn chưa tham gia đội nào trong lớp này.';
  end if;

  insert into team_saves (class_code, team_name, state_json, updated_at)
  values (v_class, v_team, p_state, now())
  on conflict (class_code, team_name)
    do update set state_json = excluded.state_json, updated_at = now();
end;
$$;

revoke all on function public.bizon_student_upsert_save(text, jsonb) from public, anon;
grant execute on function public.bizon_student_upsert_save(text, jsonb) to authenticated;
