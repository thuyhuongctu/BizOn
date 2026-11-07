-- ============================================================
-- BizOn — Ảnh chữ ký không đi qua đường công khai.
-- bizon_cert_feed (20261029000000_cert_issuer.sql) cấp cho anon, ai biết mã lớp cũng gọi được, và trả cả
-- signer_sig – đường dẫn ảnh chữ ký của người ký do giảng viên khai. Quyết định 07/11/2026: chữ ký chỉ in,
-- không công khai. Chữ ký thật đã có đường riêng: giảng viên chọn ảnh từ máy mình ở Trang Giảng viên, ảnh chỉ
-- nằm trong trình duyệt đó (js/official-cert.js, opts.signature). Chứng nhận sinh viên tự tải chỉ in tên và
-- chức danh người ký; chứng nhận BizOn mặc định dùng chữ ký in (phông chữ), không đổi.
--   1. bizon_cert_feed luôn trả signer_sig rỗng (giữ khoá để trang cũ không vỡ).
--   2. bizon_set_cert_issuer không lưu signer_sig nữa (tham số giữ nguyên chữ ký hàm cho trang cũ).
-- Không xoá dữ liệu đã lưu: bảng class_cert_config đã khoá RLS, anon/authenticated không đọc thẳng được.
-- Chạy SAU 20261029000000_cert_issuer.sql (áp lại tệp ấy thì phải chạy lại tệp này). An toàn khi chạy lại.
-- ============================================================
create or replace function public.bizon_cert_feed(p_class_code text)
returns jsonb language sql security definer stable set search_path = public as $$
  select coalesce(
    (select jsonb_build_object('course_code', c.course_code, 'course_name', c.course_name, 'course_dates', c.course_dates,
       'org_name', c.org_name, 'org_sub', c.org_sub, 'org_logo', c.org_logo, 'org_logo2', c.org_logo2,
       'signer_name', c.signer_name, 'signer_title', c.signer_title, 'signer_sig', '')
     from class_cert_config c where c.class_code = upper(trim(p_class_code))),
    jsonb_build_object('course_code', '', 'course_name', 'BizOn Bật Nghiệp', 'course_dates', '',
      'org_name', '', 'org_sub', '', 'org_logo', '', 'org_logo2', '', 'signer_name', '', 'signer_title', '', 'signer_sig', ''));
$$;

create or replace function public.bizon_set_cert_issuer(p_class_code text, p_org_name text, p_org_sub text, p_org_logo text, p_org_logo2 text, p_signer_name text, p_signer_title text, p_signer_sig text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v text := upper(trim(p_class_code));
begin
  if not bizon_owns_class(v) then raise exception 'Bạn không sở hữu lớp này'; end if;
  insert into class_cert_config (class_code, org_name, org_sub, org_logo, org_logo2, signer_name, signer_title, signer_sig, updated_at)
  values (v, coalesce(trim(p_org_name), ''), coalesce(trim(p_org_sub), ''), coalesce(trim(p_org_logo), ''), coalesce(trim(p_org_logo2), ''), coalesce(trim(p_signer_name), ''), coalesce(trim(p_signer_title), ''), '', now())
  on conflict (class_code) do update set org_name = excluded.org_name, org_sub = excluded.org_sub, org_logo = excluded.org_logo,
    org_logo2 = excluded.org_logo2, signer_name = excluded.signer_name, signer_title = excluded.signer_title, signer_sig = '', updated_at = now();
  return true;
end; $$;

revoke all on function public.bizon_set_cert_issuer(text,text,text,text,text,text,text,text) from public, anon;
grant execute on function public.bizon_set_cert_issuer(text,text,text,text,text,text,text,text) to authenticated;
revoke all on function public.bizon_cert_feed(text) from public;
grant execute on function public.bizon_cert_feed(text) to anon, authenticated;

notify pgrst, 'reload schema';
