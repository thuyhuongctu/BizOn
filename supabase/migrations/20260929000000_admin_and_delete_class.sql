-- BizOn — Quản trị hệ thống cho 2 tài khoản chủ dự án + xóa lớp cho giảng viên
-- Cần có sẵn: public.bizon_owns_class(text), public.instructor_class_access
-- (từ 20260914000000_instructor_auth.sql), public.round_submissions.
--
-- 1) bizon_is_admin(): true khi email đăng nhập nằm trong danh sách cố định
--    (Đỗ Thùy Hương + Phan Anh Tú). Đây là danh sách "dành riêng cho tôi và
--    thầy" theo đúng yêu cầu — cứng trong code, không đọc từ bảng do ai
--    khác chỉnh sửa được. Muốn đổi/thêm người thì sửa mảng email ở đây rồi
--    chạy migration mới, không sửa trực tiếp trên dashboard.
-- 2) bizon_owns_class() được nới thêm "hoặc là admin" — vì MỌI hàm _v2 đọc
--    dữ liệu lớp (leaderboard, feed, submissions, class_state, set_controls,
--    grant, save_score…) đều gọi qua đúng hàm này, nới ở một chỗ duy nhất
--    là đủ để 2 tài khoản admin xem/thao tác được TẤT CẢ lớp — không cần
--    viết lại logic ở từng hàm.
-- 3) bizon_admin_all_classes(): danh sách toàn bộ lớp kèm email chủ lớp và
--    số liệu tóm tắt, chỉ admin gọi được.
-- 4) bizon_delete_class(): gỡ quyền sở hữu mã lớp (giảng viên xóa lớp của
--    mình, hoặc admin xóa lớp bất kỳ). CHỈ xóa dòng sở hữu trong
--    instructor_class_access — KHÔNG xóa round_submissions/class_controls/
--    class_grants/class_scores đã có, để không mất dữ liệu bài nộp của
--    sinh viên một cách không thể khôi phục. Mã lớp sẽ trống chỗ cho ai đó
--    claim lại; nếu claim lại đúng mã đó, lịch sử bài nộp cũ vẫn hiện ra.

create or replace function public.bizon_is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(auth.email(), '') = any(array['thuyhuongctu@gmail.com', 'patu@ctu.edu.vn']);
$$;

revoke all on function public.bizon_is_admin() from public, anon;
grant execute on function public.bizon_is_admin() to authenticated;

create or replace function public.bizon_owns_class(p_class_code text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select bizon_is_admin() or exists (
    select 1 from instructor_class_access
    where class_code = upper(trim(p_class_code))
      and instructor_id = auth.uid()
  );
$$;

revoke all on function public.bizon_owns_class(text) from public, anon;
grant execute on function public.bizon_owns_class(text) to authenticated;

create or replace function public.bizon_admin_all_classes()
returns table (
  class_code text,
  created_at timestamptz,
  owner_email text,
  team_count bigint,
  submission_count bigint
)
language sql
security definer
stable
set search_path = public
as $$
  select
    ica.class_code,
    ica.created_at,
    u.email::text as owner_email,
    (select count(distinct rs.team_name) from round_submissions rs where rs.class_code = ica.class_code) as team_count,
    (select count(*) from round_submissions rs where rs.class_code = ica.class_code) as submission_count
  from instructor_class_access ica
  join auth.users u on u.id = ica.instructor_id
  where bizon_is_admin()
  order by ica.created_at desc;
$$;

revoke all on function public.bizon_admin_all_classes() from public, anon;
grant execute on function public.bizon_admin_all_classes() to authenticated;

create or replace function public.bizon_delete_class(p_class_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v text := upper(trim(p_class_code));
begin
  if not bizon_owns_class(v) then
    raise exception 'Không có quyền với lớp này.';
  end if;
  delete from instructor_class_access where class_code = v;
  return true;
end;
$$;

revoke all on function public.bizon_delete_class(text) from public, anon;
grant execute on function public.bizon_delete_class(text) to authenticated;

notify pgrst, 'reload schema';
