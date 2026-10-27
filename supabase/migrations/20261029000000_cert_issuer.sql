-- ============================================================
-- BizOn — Đơn vị cấp chứng nhận do giảng viên cấu hình (thay mặc định
-- «ĐH Cần Thơ» cứng trong js/official-cert.js). Mặc định chứng nhận do
-- BizOn cấp; lớp nào muốn chứng nhận mang tên trường mình thì giảng viên
-- điền tên đơn vị, đơn vị trực thuộc, logo, người ký và chức danh.
-- Chạy SAU 20261001010000_cert_config.sql. An toàn khi chạy lại.
-- Lưu ý khi áp lại migration cũ: 20261001010000 định nghĩa lại
-- bizon_cert_feed không có các trường đơn vị → phải chạy lại tệp này sau nó.
-- ============================================================
alter table public.class_cert_config
  add column if not exists org_name text not null default '' check (char_length(org_name) <= 120),
  add column if not exists org_sub text not null default '' check (char_length(org_sub) <= 120),
  add column if not exists org_logo text not null default '' check (char_length(org_logo) <= 300),
  add column if not exists org_logo2 text not null default '' check (char_length(org_logo2) <= 300),
  add column if not exists signer_name text not null default '' check (char_length(signer_name) <= 80),
  add column if not exists signer_title text not null default '' check (char_length(signer_title) <= 120),
  add column if not exists signer_sig text not null default '' check (char_length(signer_sig) <= 300);
-- Mặc định môn học không còn gắn với một trường cụ thể.
alter table public.class_cert_config alter column course_code set default '';
alter table public.class_cert_config alter column course_name set default 'BizOn Bật Nghiệp';

-- Giảng viên (chủ lớp) đặt đơn vị cấp chứng nhận. Để trống mọi trường = quay về chứng nhận BizOn.
-- org_logo: logo đơn vị (góc trái); org_logo2: logo thứ hai, ví dụ khoa/trường thành viên (góc phải; trống = logo BizOn).
create or replace function public.bizon_set_cert_issuer(p_class_code text, p_org_name text, p_org_sub text, p_org_logo text, p_org_logo2 text, p_signer_name text, p_signer_title text, p_signer_sig text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v text := upper(trim(p_class_code));
begin
  if not bizon_owns_class(v) then raise exception 'Bạn không sở hữu lớp này'; end if;
  insert into class_cert_config (class_code, org_name, org_sub, org_logo, org_logo2, signer_name, signer_title, signer_sig, updated_at)
  values (v, coalesce(trim(p_org_name), ''), coalesce(trim(p_org_sub), ''), coalesce(trim(p_org_logo), ''), coalesce(trim(p_org_logo2), ''), coalesce(trim(p_signer_name), ''), coalesce(trim(p_signer_title), ''), coalesce(trim(p_signer_sig), ''), now())
  on conflict (class_code) do update set org_name = excluded.org_name, org_sub = excluded.org_sub, org_logo = excluded.org_logo, org_logo2 = excluded.org_logo2,
    signer_name = excluded.signer_name, signer_title = excluded.signer_title, signer_sig = excluded.signer_sig, updated_at = now();
  return true;
end; $$;

-- Mã môn/tên môn: giữ hành vi cũ nhưng mặc định không còn KT330H/Entrepreneurship.
create or replace function public.bizon_set_cert_config(p_class_code text, p_course_code text, p_course_name text, p_course_dates text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v text := upper(trim(p_class_code));
begin
  if not bizon_owns_class(v) then raise exception 'Bạn không sở hữu lớp này'; end if;
  insert into class_cert_config (class_code, course_code, course_name, course_dates, updated_at)
  values (v, coalesce(trim(p_course_code), ''), coalesce(nullif(trim(p_course_name), ''), 'BizOn Bật Nghiệp'), coalesce(trim(p_course_dates), ''), now())
  on conflict (class_code) do update set course_code = excluded.course_code, course_name = excluded.course_name,
    course_dates = excluded.course_dates, updated_at = now();
  return true;
end; $$;

-- Feed công khai: luôn trả đủ trường; lớp chưa cấu hình = chứng nhận BizOn, không gắn trường nào.
create or replace function public.bizon_cert_feed(p_class_code text)
returns jsonb language sql security definer stable set search_path = public as $$
  select coalesce(
    (select jsonb_build_object('course_code', c.course_code, 'course_name', c.course_name, 'course_dates', c.course_dates,
       'org_name', c.org_name, 'org_sub', c.org_sub, 'org_logo', c.org_logo, 'org_logo2', c.org_logo2,
       'signer_name', c.signer_name, 'signer_title', c.signer_title, 'signer_sig', c.signer_sig)
     from class_cert_config c where c.class_code = upper(trim(p_class_code))),
    jsonb_build_object('course_code', '', 'course_name', 'BizOn Bật Nghiệp', 'course_dates', '',
      'org_name', '', 'org_sub', '', 'org_logo', '', 'org_logo2', '', 'signer_name', '', 'signer_title', '', 'signer_sig', ''));
$$;

revoke all on function public.bizon_set_cert_issuer(text,text,text,text,text,text,text,text) from public, anon;
grant execute on function public.bizon_set_cert_issuer(text,text,text,text,text,text,text,text) to authenticated;
revoke all on function public.bizon_set_cert_config(text,text,text,text) from public, anon;
grant execute on function public.bizon_set_cert_config(text,text,text,text) to authenticated;
revoke all on function public.bizon_cert_feed(text) from public;
grant execute on function public.bizon_cert_feed(text) to anon, authenticated;

notify pgrst, 'reload schema';
