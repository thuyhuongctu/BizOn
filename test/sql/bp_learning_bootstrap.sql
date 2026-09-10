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

-- Rate-limited RPCs (added by 20260730000000_instructor_dashboard.sql) call
-- bizon_check_key_gate() instead of bizon_check_key() directly. This test
-- database has no key_check_attempts table or lockout logic, so stub the
-- gate with the same test-key contract.
create or replace function public.bizon_check_key_gate(p_key text)
returns boolean
language sql
stable
as $$
  select p_key = 'TEST-INSTRUCTOR-KEY';
$$;
