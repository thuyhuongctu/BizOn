-- Khách đăng ký email để xem «Nguồn dữ liệu mở» trên Trang Giảng viên (19/11/2026).
--
-- Vì sao: chị muốn mục «Nguồn dữ liệu mở» chỉ mở cho sinh viên, giảng viên đã đăng nhập bằng email trường,
-- hoặc khách để lại email (có đồng ý). Email khách lưu ở đây để nhóm BizOn liên hệ về BizOn.
--
-- Thiết kế:
--   • Bảng guest_signups bật RLS, thu hết quyền của anon/authenticated: không ai đọc/ghi thẳng qua API.
--     Chỉ chủ dự án đọc được (Table Editor / service role).
--   • Khách ghi qua một hàm SECURITY DEFINER duy nhất: bizon_guest_signup(email, đồng ý, ngôn ngữ, nguồn).
--     Hàm kiểm định dạng email, bắt buộc đồng ý, chuẩn hoá chữ thường, trùng email thì bỏ qua (không lộ email đã có hay chưa),
--     giới hạn 300 lượt đăng ký mới mỗi giờ toàn hệ thống để chống spam.
--   • Chỉ thêm, không đổi bảng nào khác, không xoá dữ liệu. Chạy lại được.

create table if not exists public.guest_signups (
  id bigint generated always as identity primary key,
  email text not null,
  consent boolean not null,
  lang text not null default 'vi',
  source text not null default 'giang-vien',
  created_at timestamptz not null default now(),
  constraint guest_signups_email_chk check (char_length(email) between 6 and 254 and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  constraint guest_signups_consent_chk check (consent),
  constraint guest_signups_lang_chk check (lang in ('vi', 'en')),
  constraint guest_signups_source_chk check (source ~ '^[a-z0-9-]{1,40}$')
);
create unique index if not exists guest_signups_email_key on public.guest_signups (lower(email));
alter table public.guest_signups enable row level security;
revoke all on table public.guest_signups from public, anon, authenticated;
comment on table public.guest_signups is 'Email khách (có đồng ý) để mở «Nguồn dữ liệu mở» trên Trang Giảng viên. Không đọc qua API công khai.';

create or replace function public.bizon_guest_signup(p_email text, p_consent boolean, p_lang text default 'vi', p_source text default 'giang-vien')
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_lang text := case when lower(coalesce(p_lang, '')) = 'en' then 'en' else 'vi' end;
  v_source text := lower(trim(coalesce(p_source, 'giang-vien')));
  n integer;
begin
  if p_consent is not true then
    raise exception 'Cần đồng ý để lưu email.' using errcode = 'P0001';
  end if;
  if char_length(v_email) < 6 or char_length(v_email) > 254 or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'Email không hợp lệ.' using errcode = 'P0001';
  end if;
  if v_source !~ '^[a-z0-9-]{1,40}$' then v_source := 'giang-vien'; end if;
  if exists (select 1 from public.guest_signups where lower(email) = v_email) then
    return true;
  end if;
  select count(*) into n from public.guest_signups where created_at > now() - interval '1 hour';
  if n >= 300 then
    raise exception 'Đang có quá nhiều lượt đăng ký, thử lại sau.' using errcode = 'P0001';
  end if;
  insert into public.guest_signups (email, consent, lang, source)
  values (v_email, true, v_lang, v_source)
  on conflict do nothing;
  return true;
end;
$$;
revoke all on function public.bizon_guest_signup(text, boolean, text, text) from public;
grant execute on function public.bizon_guest_signup(text, boolean, text, text) to anon, authenticated;
