-- ============================================================
-- BizOn Bật Nghiệp – Tên đội không phân biệt hoa/thường khi tải/lưu tiến trình
--
-- Vấn đề: team_saves khóa theo (class_code, team_name) khớp CHÍNH XÁC từng ký
-- tự. Cùng một đội gõ "Yến Phương" trên máy này và "yến  phương" trên máy khác
-- thì thành 2 dòng khác nhau: máy thứ hai không thấy tiến trình cũ, rồi bắt
-- đầu một ván mới.
--
-- Cách sửa (chỉ thay thân 2 hàm, KHÔNG đổi bảng, khóa hay chữ ký hàm):
--  • So khớp tên đội sau khi bỏ khoảng trắng thừa và không phân biệt hoa/thường.
--  • Nếu có nhiều dòng khớp (dữ liệu cũ đã tạo ra nhiều biến thể), lấy dòng mới
--    nhất. Không gộp hay xóa dữ liệu cũ.
--  • Token băm vẫn kiểm tra như cũ, trên đúng dòng khớp.
--
-- Chạy tệp này 1 lần trong Supabase Dashboard → SQL Editor → Run.
-- ============================================================

create or replace function get_team_save(p_class_code text, p_team_name text, p_token text default null)
returns table(state_json jsonb, updated_at timestamptz)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_row team_saves%rowtype;
begin
  select * into v_row
  from team_saves ts
  where ts.class_code = trim(p_class_code)
    and lower(regexp_replace(trim(ts.team_name), '\s+', ' ', 'g')) = lower(regexp_replace(trim(p_team_name), '\s+', ' ', 'g'))
  order by ts.updated_at desc
  limit 1;

  if not found then
    return; -- chưa từng lưu – không có gì để đọc, không cần token
  end if;

  -- Dòng cũ từ trước khi có token (save_token_hash null) vẫn đọc được bình thường.
  if v_row.save_token_hash is not null
     and v_row.save_token_hash is distinct from encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex') then
    return; -- token sai – coi như không có dữ liệu, không lộ gì thêm
  end if;

  return query select v_row.state_json, v_row.updated_at;
end;
$$;

revoke all on function get_team_save(text, text, text) from public;
grant execute on function get_team_save(text, text, text) to anon;

create or replace function upsert_team_save(p_class_code text, p_team_name text, p_state jsonb, p_token text default null)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_class text := trim(p_class_code);
  v_team text := trim(p_team_name);
  v_new_hash text := encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex');
  v_row team_saves%rowtype;
  v_found boolean;
begin
  select * into v_row
  from team_saves ts
  where ts.class_code = v_class
    and lower(regexp_replace(trim(ts.team_name), '\s+', ' ', 'g')) = lower(regexp_replace(v_team, '\s+', ' ', 'g'))
  order by ts.updated_at desc
  limit 1;
  v_found := found;

  if v_found and v_row.save_token_hash is not null and v_row.save_token_hash is distinct from v_new_hash then
    raise exception 'invalid save token';
  end if;

  if v_found then
    -- Ghi đè đúng dòng đã khớp (giữ tên đội như lần lưu đầu tiên của dòng đó).
    update team_saves
    set state_json = p_state,
        updated_at = now(),
        save_token_hash = coalesce(team_saves.save_token_hash, v_new_hash)
    where team_saves.class_code = v_row.class_code and team_saves.team_name = v_row.team_name;
  else
    insert into team_saves (class_code, team_name, state_json, save_token_hash, updated_at)
    values (v_class, v_team, p_state, v_new_hash, now())
    on conflict (class_code, team_name) do update
      set state_json = excluded.state_json, updated_at = now(),
          save_token_hash = coalesce(team_saves.save_token_hash, excluded.save_token_hash);
  end if;
end;
$$;

revoke all on function upsert_team_save(text, text, jsonb, text) from public;
grant execute on function upsert_team_save(text, text, jsonb, text) to anon;
