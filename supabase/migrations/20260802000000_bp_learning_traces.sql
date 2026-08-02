-- ============================================================
-- BizOn Brand Passport Learning Edition — governed trace storage
--
-- Nguyên tắc:
--   1. local-only là mặc định ở client;
--   2. chỉ RPC submit mới được ghi sau consent rõ ràng;
--   3. anon không SELECT/UPDATE/DELETE trực tiếp;
--   4. người học xóa bằng deletion receipt token;
--   5. retention mặc định 180 ngày, không tự gia hạn khi cập nhật;
--   6. reflection không dùng để AI chấm điểm.
--
-- Yêu cầu migration trước đó đã tạo bizon_check_key(text).
-- ============================================================

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.bp_learning_traces (
  id uuid primary key,
  class_code text not null check (class_code ~ '^[A-Z0-9_-]{3,40}$'),
  team_alias text not null default 'anonymous' check (char_length(team_alias) between 1 and 80),
  session_id text not null check (char_length(session_id) between 1 and 120),
  game_seed text check (game_seed is null or char_length(game_seed) <= 80),
  schema_version text not null check (char_length(schema_version) <= 80),
  learning_layer_version text not null check (char_length(learning_layer_version) <= 80),
  consent_version text not null check (consent_version = 'bp-learning-consent-v1'),
  consented_at timestamptz not null,
  trace_json jsonb not null,
  delete_token_hash text not null check (delete_token_hash ~ '^[0-9a-f]{64}$'),
  retention_until timestamptz not null default (now() + interval '180 days'),
  client_ts timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(trace_json) = 'object'),
  check (jsonb_typeof(trace_json -> 'records') = 'array'),
  check (jsonb_array_length(trace_json -> 'records') between 1 and 6),
  check (octet_length(trace_json::text) <= 250000),
  check (retention_until <= created_at + interval '181 days')
);

create index if not exists idx_bp_learning_class
  on public.bp_learning_traces (class_code, updated_at desc);
create index if not exists idx_bp_learning_retention
  on public.bp_learning_traces (retention_until);

alter table public.bp_learning_traces enable row level security;

-- Không tạo policy trực tiếp. Mọi thao tác client đi qua RPC SECURITY DEFINER.
revoke all on table public.bp_learning_traces from public, anon, authenticated;

create or replace function public.bizon_submit_learning_trace(
  p_id uuid,
  p_class_code text,
  p_team_alias text,
  p_session_id text,
  p_game_seed text,
  p_schema_version text,
  p_learning_layer_version text,
  p_consent_version text,
  p_consented_at timestamptz,
  p_trace_json jsonb,
  p_delete_token text,
  p_client_ts timestamptz default null
)
returns table (
  trace_id uuid,
  retention_until timestamptz,
  stored_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_class_code text := upper(trim(coalesce(p_class_code, '')));
  v_team_alias text := left(trim(coalesce(p_team_alias, 'anonymous')), 80);
  v_token_hash text;
  v_existing_hash text;
begin
  if v_class_code !~ '^[A-Z0-9_-]{3,40}$' then
    raise exception 'invalid class code';
  end if;
  if p_consent_version is distinct from 'bp-learning-consent-v1' or p_consented_at is null then
    raise exception 'valid consent is required';
  end if;
  if p_session_id is null or char_length(p_session_id) not between 1 and 120 then
    raise exception 'invalid session id';
  end if;
  if p_delete_token is null or char_length(p_delete_token) < 32 then
    raise exception 'invalid deletion token';
  end if;
  if jsonb_typeof(p_trace_json) <> 'object'
     or jsonb_typeof(p_trace_json -> 'records') <> 'array'
     or jsonb_array_length(p_trace_json -> 'records') not between 1 and 6
     or octet_length(p_trace_json::text) > 250000 then
    raise exception 'invalid trace payload';
  end if;
  if coalesce((p_trace_json #>> '{data_governance,ai_scoring}')::boolean, true) then
    raise exception 'trace must declare ai_scoring=false';
  end if;

  v_token_hash := encode(extensions.digest(p_delete_token, 'sha256'), 'hex');
  select t.delete_token_hash into v_existing_hash
  from public.bp_learning_traces t where t.id = p_id;

  if found then
    if v_existing_hash is distinct from v_token_hash then
      raise exception 'invalid deletion credential';
    end if;
    update public.bp_learning_traces t set
      class_code = v_class_code,
      team_alias = coalesce(nullif(v_team_alias, ''), 'anonymous'),
      session_id = p_session_id,
      game_seed = left(p_game_seed, 80),
      schema_version = left(p_schema_version, 80),
      learning_layer_version = left(p_learning_layer_version, 80),
      consent_version = p_consent_version,
      consented_at = p_consented_at,
      trace_json = p_trace_json,
      client_ts = p_client_ts,
      updated_at = now()
    where t.id = p_id;
  else
    insert into public.bp_learning_traces (
      id, class_code, team_alias, session_id, game_seed, schema_version,
      learning_layer_version, consent_version, consented_at, trace_json,
      delete_token_hash, client_ts
    ) values (
      p_id, v_class_code, coalesce(nullif(v_team_alias, ''), 'anonymous'),
      p_session_id, left(p_game_seed, 80), left(p_schema_version, 80),
      left(p_learning_layer_version, 80), p_consent_version, p_consented_at,
      p_trace_json, v_token_hash, p_client_ts
    );
  end if;

  return query
    select t.id, t.retention_until, t.updated_at
    from public.bp_learning_traces t where t.id = p_id;
end;
$$;

create or replace function public.bizon_delete_learning_trace(
  p_trace_id uuid,
  p_delete_token text
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_deleted boolean;
begin
  delete from public.bp_learning_traces t
  where t.id = p_trace_id
    and t.delete_token_hash = encode(extensions.digest(coalesce(p_delete_token, ''), 'sha256'), 'hex');
  v_deleted := found;
  return v_deleted;
end;
$$;

-- Giảng viên chỉ đọc dữ liệu đúng mã lớp khi khóa quản trị hợp lệ.
create or replace function public.bizon_bp_learning_traces(
  p_class_code text,
  p_key text
)
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
  select t.id, t.team_alias, t.session_id, t.game_seed, t.trace_json,
         t.consented_at, t.retention_until, t.updated_at
  from public.bp_learning_traces t
  where public.bizon_check_key(p_key)
    and t.class_code = upper(trim(p_class_code))
    and t.retention_until > now()
  order by t.updated_at desc;
$$;

-- Gọi bằng cron/service role để xóa vật lý dữ liệu hết hạn.
create or replace function public.bizon_purge_expired_learning_traces()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count bigint;
begin
  delete from public.bp_learning_traces where retention_until <= now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.bizon_submit_learning_trace(uuid,text,text,text,text,text,text,text,timestamptz,jsonb,text,timestamptz) from public;
revoke all on function public.bizon_delete_learning_trace(uuid,text) from public;
revoke all on function public.bizon_bp_learning_traces(text,text) from public;
revoke all on function public.bizon_purge_expired_learning_traces() from public, anon, authenticated;

grant execute on function public.bizon_submit_learning_trace(uuid,text,text,text,text,text,text,text,timestamptz,jsonb,text,timestamptz) to anon, authenticated;
grant execute on function public.bizon_delete_learning_trace(uuid,text) to anon, authenticated;
grant execute on function public.bizon_bp_learning_traces(text,text) to anon, authenticated;
grant execute on function public.bizon_purge_expired_learning_traces() to service_role;
