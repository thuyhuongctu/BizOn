-- ============================================================
-- BizOn — Gắn danh tính sinh viên thật vào kết quả Hộ Chiếu Mini (bp_results)
-- và Bến Phù Sa (ft_results)
--
-- Bối cảnh: trả lời câu hỏi "có truy được email SV đăng ký tên nhóm không"
-- (trước đây: không — bp_results/ft_results chỉ có player_name/team_name tự
-- gõ, không xác thực gì). Migration này thêm một lớp xác thực thật, CÙNG
-- kiến trúc Supabase Auth đã dùng cho Bật Nghiệp (20260914020000_student_auth.sql):
-- auth.uid() + domain @student.ctu.edu.vn, qua hàm SECURITY DEFINER.
--
-- Thiết kế song song, không phá đường cũ:
--   • student_id/student_email: cột MỚI, nullable, cộng thêm vào 2 bảng.
--     Hàng cũ (đã nộp trước migration này) không bị đụng — vẫn null.
--   • Đường anon INSERT trực tiếp cũ (round_submissions-style, không xác
--     thực) VẪN CÒN, không revoke — dành cho "chơi thử nhanh, không cần
--     tài khoản" (xem chính sách chạy song song đã áp dụng cho Bật Nghiệp).
--   • Hàng nộp QUA 2 hàm RPC mới bên dưới (bizon_submit_bp_result/
--     bizon_submit_ft_result) bắt buộc auth.uid() + email đúng domain
--     trường — student_id/student_email được GHI SERVER-SIDE từ
--     auth.uid()/auth.jwt(), không nhận từ client, nên không giả mạo
--     được. player_name/team_name vẫn do client gõ như cũ (không đổi tên
--     hiển thị trên bảng xếp hạng), chỉ CỘNG THÊM danh tính xác thực đi
--     kèm để giảng viên tra cứu khi cần.
--   • student_id dùng "on delete set null" (không "cascade"): sinh viên tự
--     xóa tài khoản (bizon_delete_my_account, migration 20261006000000)
--     không được phép xóa luôn điểm đã nộp — đó là hồ sơ chấm điểm của
--     lớp học, không phải dữ liệu cá nhân đơn thuần. student_email (cột
--     text, chụp lại tại thời điểm nộp) vẫn giữ nguyên làm dấu vết sau khi
--     student_id bị null hoá.
-- ============================================================

alter table public.bp_results
  add column if not exists student_id uuid references auth.users(id) on delete set null,
  add column if not exists student_email text;

alter table public.ft_results
  add column if not exists student_id uuid references auth.users(id) on delete set null,
  add column if not exists student_email text;

create index if not exists idx_bp_results_student on public.bp_results (student_id);
create index if not exists idx_ft_results_student on public.ft_results (student_id);

-- ---------- Nộp kết quả Hộ Chiếu Mini qua danh tính xác thực ----------
create or replace function public.bizon_submit_bp_result(
  p_class_code text, p_player_name text, p_company text, p_total_score int,
  p_profit numeric, p_rep int, p_capab int, p_adapt int, p_sust int,
  p_title text, p_quarters int, p_detail_json jsonb, p_app_version text
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'Cần đăng nhập để nộp kết quả.';
  end if;
  v_email := lower(coalesce(auth.jwt()->>'email', ''));
  if v_email !~ '@student\.ctu\.edu\.vn$' then
    raise exception 'Cần dùng đúng email trường (@student.ctu.edu.vn) để nộp kết quả.';
  end if;

  insert into public.bp_results (
    class_code, player_name, company, total_score, profit, rep, capab, adapt, sust,
    title, quarters, detail_json, app_version, client_ts, student_id, student_email
  ) values (
    trim(p_class_code), p_player_name, p_company, p_total_score, p_profit,
    p_rep, p_capab, p_adapt, p_sust, p_title, p_quarters, p_detail_json,
    p_app_version, now(), auth.uid(), v_email
  );
end;
$$;

revoke all on function public.bizon_submit_bp_result(text, text, text, int, numeric, int, int, int, int, text, int, jsonb, text) from public, anon;
grant execute on function public.bizon_submit_bp_result(text, text, text, int, numeric, int, int, int, int, text, int, jsonb, text) to authenticated;

-- ---------- Nộp kết quả Bến Phù Sa qua danh tính xác thực ----------
create or replace function public.bizon_submit_ft_result(
  p_class_code text, p_player_name text, p_team_name text, p_total_revenue numeric,
  p_efficiency int, p_final_rank int, p_detail_json jsonb, p_app_version text
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'Cần đăng nhập để nộp kết quả.';
  end if;
  v_email := lower(coalesce(auth.jwt()->>'email', ''));
  if v_email !~ '@student\.ctu\.edu\.vn$' then
    raise exception 'Cần dùng đúng email trường (@student.ctu.edu.vn) để nộp kết quả.';
  end if;

  insert into public.ft_results (
    class_code, player_name, team_name, total_revenue, efficiency, final_rank,
    detail_json, app_version, client_ts, student_id, student_email
  ) values (
    trim(p_class_code), p_player_name, p_team_name, p_total_revenue, p_efficiency,
    p_final_rank, p_detail_json, p_app_version, now(), auth.uid(), v_email
  );
end;
$$;

revoke all on function public.bizon_submit_ft_result(text, text, text, numeric, int, int, jsonb, text) from public, anon;
grant execute on function public.bizon_submit_ft_result(text, text, text, numeric, int, int, jsonb, text) to authenticated;
