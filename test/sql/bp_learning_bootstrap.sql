\set ON_ERROR_STOP on

-- PostgreSQL bootstrap used only by CI. Supabase creates these roles and the
-- instructor-key function in the real project; the test database must emulate
-- the minimum contract so the migration is executed rather than text-matched.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin;
  end if;
end
$$;

create or replace function public.bizon_check_key(p_key text)
returns boolean
language sql
stable
as $$
  select p_key = 'TEST-INSTRUCTOR-KEY';
$$;

-- Các migration production kiểm khóa instructor QUA cổng có giới hạn
-- bizon_check_key_gate() (định nghĩa ở 20260730000000_instructor_dashboard.sql,
-- bọc bizon_check_key kèm chống dò khóa). Job CI chỉ áp một phần migration nên
-- hàm cổng này chưa tồn tại; cung cấp bản tối giản uỷ thác cho bizon_check_key
-- (không mô phỏng khóa) để các migration gọi *_gate được thực thi đúng hợp đồng.
create or replace function public.bizon_check_key_gate(p_key text)
returns boolean
language sql
stable
as $$
  select public.bizon_check_key(p_key);
$$;
