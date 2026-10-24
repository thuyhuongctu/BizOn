\set ON_ERROR_STOP on

-- Giả lập tối thiểu những gì Supabase có sẵn (vai trò, schema auth, hàm
-- auth.uid()/auth.jwt()/auth.email()) để chạy THẬT toàn bộ migration trên một
-- PostgreSQL trống, thay vì so khớp chữ. auth.uid() và auth.jwt() đọc cấu hình
-- request.jwt.claims như PostgREST, nên bài test đổi người dùng bằng
-- set_config('request.jwt.claims', ...) + set role.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin; end if;
end
$$;

-- Như Supabase: mọi bảng/hàm/sequence tạo trong public mặc định cấp cho
-- anon/authenticated/service_role; chỉ RLS + revoke trong migration mới chặn.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

create extension if not exists pgcrypto;
create schema if not exists auth;
grant usage on schema auth to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  created_at timestamptz not null default now()
);

create or replace function auth.jwt() returns jsonb
language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb;
$$;
create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(auth.jwt()->>'sub', '')::uuid;
$$;
create or replace function auth.email() returns text
language sql stable as $$
  select nullif(auth.jwt()->>'email', '');
$$;
create or replace function auth.role() returns text
language sql stable as $$
  select coalesce(nullif(auth.jwt()->>'role', ''), 'anon');
$$;
grant execute on all functions in schema auth to anon, authenticated, service_role;

-- Migration cũ (20260730) gọi hàm khóa giảng viên lưu trong app_secrets; bản thật
-- được tạo ở dashboard. Ở đây chỉ cần tồn tại.
create or replace function public.bizon_check_key(p_key text)
returns boolean language sql stable as $$ select p_key = 'TEST-INSTRUCTOR-KEY'; $$;
