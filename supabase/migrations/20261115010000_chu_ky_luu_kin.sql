-- ============================================================
-- BizOn — Lưu kín ảnh chữ ký thật của người ký chứng nhận, theo từng lớp.
-- Quyết định 15/11/2026 (chị Hương, lớp quốc tế UM Kendari): thầy Tú không có sẵn tệp chữ ký ở máy khác,
-- nên chữ ký thật được lưu trên hệ thống – nhưng KHÔNG công khai:
--   • bảng riêng class_cert_signature, bật RLS, không có policy: anon/authenticated không đọc thẳng được;
--   • chỉ chủ lớp (bizon_owns_class – gồm cả quản trị) đọc/ghi qua hai hàm dưới đây;
--   • bizon_cert_feed (công khai, sinh viên tự tải chứng nhận) KHÔNG đổi: vẫn trả signer_sig rỗng
--     (20261107000000_chu_ky_khong_cong_khai.sql). Bản sinh viên tự tải dùng chữ ký in.
-- Trang Giảng viên tự nạp chữ ký này khi mở lớp để «In cả lớp → PDF».
-- Chạy SAU 20261107000000_chu_ky_khong_cong_khai.sql. An toàn khi chạy lại.
-- ============================================================
create table if not exists public.class_cert_signature (
  class_code text primary key,
  sig text not null check (char_length(sig) <= 700000 and sig ~ '^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$'),
  updated_at timestamptz not null default now(),
  updated_by uuid
);
alter table public.class_cert_signature enable row level security;
revoke all on table public.class_cert_signature from public, anon, authenticated;

-- Chủ lớp đọc chữ ký đã lưu của lớp mình ('' nếu chưa có).
create or replace function public.bizon_get_cert_signature(p_class_code text)
returns text language plpgsql security definer stable set search_path = public as $$
declare v text := upper(trim(p_class_code));
begin
  if not bizon_owns_class(v) then raise exception 'Bạn không sở hữu lớp này'; end if;
  return coalesce((select sig from class_cert_signature where class_code = v), '');
end; $$;

-- Chủ lớp lưu (hoặc xoá khi truyền rỗng) chữ ký của lớp mình. Chỉ nhận ảnh PNG/JPEG/WebP dạng data URL.
create or replace function public.bizon_set_cert_signature(p_class_code text, p_sig text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v text := upper(trim(p_class_code)); s text := coalesce(trim(p_sig), '');
begin
  if not bizon_owns_class(v) then raise exception 'Bạn không sở hữu lớp này'; end if;
  if s = '' then delete from class_cert_signature where class_code = v; return true; end if;
  if char_length(s) > 700000 then raise exception 'Ảnh chữ ký quá lớn'; end if;
  if s !~ '^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$' then raise exception 'Ảnh chữ ký không hợp lệ'; end if;
  insert into class_cert_signature (class_code, sig, updated_at, updated_by) values (v, s, now(), auth.uid())
  on conflict (class_code) do update set sig = excluded.sig, updated_at = now(), updated_by = auth.uid();
  return true;
end; $$;

revoke all on function public.bizon_get_cert_signature(text) from public, anon;
grant execute on function public.bizon_get_cert_signature(text) to authenticated;
revoke all on function public.bizon_set_cert_signature(text, text) from public, anon;
grant execute on function public.bizon_set_cert_signature(text, text) to authenticated;

notify pgrst, 'reload schema';
