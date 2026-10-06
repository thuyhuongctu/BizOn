-- ============================================================
-- BizOn — Sinh viên tự xóa tài khoản thật
--
-- Bối cảnh: migration 20260914020000_student_auth.sql xây đăng nhập email
-- thật cho sinh viên, nhưng CHƯA bật ở giao diện vì chưa có quy trình
-- xóa tài khoản trong app — bắt buộc theo Google Play Data Safety khi
-- app cho tạo tài khoản (xem docs/release/GOOGLE_PLAY_DATA_SAFETY_DRAFT.md
-- mục 9.1/6/9). Migration này đóng khoảng trống đó: một hàm duy nhất để
-- sinh viên tự xóa tài khoản Supabase Auth của chính mình.
--
-- bizon_delete_my_account(): xóa đúng 1 dòng auth.users của người gọi
-- (auth.uid()). Bảng student_team_membership đã có
-- "references auth.users(id) on delete cascade" từ migration trước, nên
-- hàng tư cách thành viên đội của người đó tự mất theo, không cần xóa
-- tay. KHÔNG đụng team_saves/round_submissions: đó là kết quả chung của
-- cả đội (nhiều vai trò cùng ghi), xóa tài khoản cá nhân không được phép
-- xóa luôn thành quả của đồng đội.
--
-- SECURITY DEFINER chạy với quyền của hàm (áp migration bằng vai trò
-- "postgres" trên Supabase, vốn có quyền quản trị schema auth) nên xóa
-- được auth.users dù người gọi chỉ là "authenticated" thường — giống
-- cách Supabase Dashboard tự xóa user. Vẫn kiểm tra auth.uid() trước để
-- không ai xóa được tài khoản người khác.
-- ============================================================
create or replace function public.bizon_delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'Cần đăng nhập để xóa tài khoản.';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.bizon_delete_my_account() from public, anon;
grant execute on function public.bizon_delete_my_account() to authenticated;
