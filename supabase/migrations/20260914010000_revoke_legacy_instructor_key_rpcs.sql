-- ============================================================
-- BizOn — Khóa cổng phụ giảng viên (khóa dùng chung trong app_secrets)
--
-- Bối cảnh: migration 20260914000000_instructor_auth.sql đã dựng xong
-- luồng đăng nhập thật (Supabase Auth) cho giảng viên, với 6 hàm "_v2"
-- thay thế 6 hàm cũ dùng "Khóa giảng viên" chung (bizon_leaderboard,
-- bizon_feed, bizon_ft_board, bizon_bp_board, bizon_survey_export,
-- bizon_bp_learning_traces). Migration đó cố ý CHƯA khóa đường cũ để
-- không làm gián đoạn giữa buổi học.
--
-- Migration này thu hồi quyền gọi của "anon"/"authenticated" trên 6 hàm
-- cũ — đóng hẳn cửa sau dùng khóa chung. Không xóa hàm (để tránh vỡ nếu
-- cần rollback), không đụng dữ liệu (round_submissions/ft_results/
-- bp_results/survey_responses/bp_learning_traces giữ nguyên — giảng
-- viên đọc lại được ngay qua các hàm "_v2" sau khi đăng nhập và
-- bizon_claim_class() đúng mã lớp).
--
-- Lưu ý: các hàm này còn có quyền EXECUTE mặc định cấp cho PUBLIC lúc
-- tạo hàm (trừ bizon_bp_learning_traces, đã bị revoke từ PUBLIC trước
-- đó) — nên phải revoke cả khỏi PUBLIC, không chỉ anon/authenticated,
-- nếu không anon/authenticated vẫn gọi được qua quyền kế thừa từ PUBLIC.
-- ============================================================

revoke execute on function public.bizon_leaderboard(text, text) from anon, authenticated, public;
revoke execute on function public.bizon_feed(text, text, int) from anon, authenticated, public;
revoke execute on function public.bizon_ft_board(text, text) from anon, authenticated, public;
revoke execute on function public.bizon_bp_board(text, text) from anon, authenticated, public;
revoke execute on function public.bizon_survey_export(text, text) from anon, authenticated, public;
revoke execute on function public.bizon_bp_learning_traces(text, text) from anon, authenticated, public;
