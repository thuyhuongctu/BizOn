-- ============================================================
-- BizOn Bật Nghiệp – Bảng xếp hạng & trang tổng hợp Giảng viên (GĐ2)
-- Trang giang-vien.html gọi 2 hàm dưới đây để xem bảng xếp hạng lớp
-- theo thời gian thực. Dữ liệu vẫn kín: sinh viên (anon key) không đọc
-- được bảng nào; hàm chỉ trả kết quả khi nhập đúng KHÓA GIẢNG VIÊN.
-- Tệp này tự áp dụng qua tích hợp GitHub (hoặc dán vào SQL Editor → Run).
-- ============================================================

-- Kho khóa bí mật: RLS bật, KHÔNG có policy nào → anon bị chặn hoàn toàn.
create table if not exists app_secrets (
  name text primary key,
  value text not null
);
alter table app_secrets enable row level security;

-- Khóa giảng viên mặc định – KHÔNG đặt giá trị cố định (một chuỗi cố định
-- trong tệp này sẽ nằm mãi trong lịch sử của repo công khai). Mỗi lần
-- migration này chạy lần đầu trên một project mới, sinh ngẫu nhiên một
-- khóa riêng cho project đó – không ai đọc được từ mã nguồn.
insert into app_secrets (name, value)
select 'instructor_key', 'BIZON-GV-' || upper(replace(gen_random_uuid()::text, '-', ''))
where not exists (select 1 from app_secrets where name = 'instructor_key');

-- Chống dò khóa: đếm số lần sai liên tiếp, khóa tạm 15 phút sau 15 lần sai.
-- Đơn giản hóa: 1 bộ đếm dùng chung cho cả project (không theo IP/người
-- gọi – anon key vốn dùng chung cho mọi trình duyệt nên không phân biệt
-- được ai gọi). Đủ để chặn dò khóa tự động hàng loạt mà không cần hạ
-- tầng phức tạp; khóa đủ dài (sinh bởi gen_random_uuid) nên brute-force
-- trong khung 15 phút là bất khả thi kể cả khi không bị khóa tạm.
create table if not exists key_check_attempts (
  id boolean primary key default true check (id),
  fail_count int not null default 0,
  locked_until timestamptz,
  last_attempt_at timestamptz
);
insert into key_check_attempts (id) values (true) on conflict (id) do nothing;

-- Hàm so khớp thuần túy (không ghi gì) – giữ lại để tương thích ngược,
-- nhưng các RPC bên dưới nay gọi qua bizon_check_key_gate() có giới hạn
-- số lần sai thay vì gọi hàm này trực tiếp.
create or replace function bizon_check_key(p_key text)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from app_secrets where name = 'instructor_key' and value = p_key
  );
$$;

-- Cổng có giới hạn tốc độ: kiểm tra khóa VÀ ghi nhận lần thử. Gọi đúng
-- 1 lần cho mỗi lượt yêu cầu của giảng viên (xem cách dùng "with auth as
-- materialized" trong các hàm bizon_* bên dưới – materialized đảm bảo
-- Postgres không gọi lại hàm này nhiều lần cho nhiều dòng dữ liệu).
create or replace function bizon_check_key_gate(p_key text)
returns boolean
language plpgsql security definer
set search_path = public
as $$
declare
  v_locked_until timestamptz;
  v_ok boolean;
begin
  select locked_until into v_locked_until from key_check_attempts where id = true;
  if v_locked_until is not null and v_locked_until > now() then
    return false;
  end if;

  v_ok := bizon_check_key(p_key);

  if v_ok then
    update key_check_attempts set fail_count = 0, locked_until = null, last_attempt_at = now()
      where id = true;
  else
    update key_check_attempts set
      fail_count = fail_count + 1,
      last_attempt_at = now(),
      locked_until = case when fail_count + 1 >= 15 then now() + interval '15 minutes' else locked_until end
      where id = true;
  end if;

  return v_ok;
end;
$$;

-- Bảng xếp hạng: mỗi đội 1 dòng – vòng cao nhất đã khóa + chỉ số của lần nộp
-- mới nhất ở vòng đó, xếp theo thị phần giảm dần.
create or replace function bizon_leaderboard(p_class_code text, p_key text)
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
    select bizon_check_key_gate(p_key) as ok
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

-- Dòng thời gian: các lượt nộp gần nhất của lớp (tối đa 100).
create or replace function bizon_feed(p_class_code text, p_key text, p_limit int default 30)
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
    select bizon_check_key_gate(p_key) as ok
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

-- Ghi chú vận hành:
--  • ĐỔI KHÓA GIẢNG VIÊN bất cứ lúc nào (chọn khóa riêng của cô):
--    update app_secrets set value = 'KHOA-MOI-CUA-CO' where name = 'instructor_key';
--  • Xem khóa hiện tại (chỉ chạy trong SQL Editor, không lộ qua REST API):
--    select value from app_secrets where name = 'instructor_key';
--  • Khóa sai → hàm trả 0 dòng (không lộ thông tin gì).
--  • Sai liên tục 15 lần → khóa tạm 15 phút cho MỌI người gọi (kể cả
--    khóa đúng) – tự mở lại sau đó, không cần thao tác gì thêm.
--  • Trang giang-vien.html tự làm mới mỗi 10 giây – "thời gian thực" đủ
--    dùng cho lớp học mà không tốn kết nối Realtime của gói miễn phí.
