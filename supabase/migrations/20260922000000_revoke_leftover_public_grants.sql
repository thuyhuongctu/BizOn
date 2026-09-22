-- ============================================================
-- BizOn — Khóa nốt các "cổng phụ" còn sót quyền PUBLIC/anon
--
-- Rà soát bảo mật toàn bộ RPC ngày 22/09: xác nhận trực tiếp trên
-- Supabase production (proacl) rằng 3 hàm dưới đây vẫn gọi được bằng
-- anon key công khai (nhúng sẵn trong js/backend-config.js, tức là ai
-- cũng đọc được từ repo công khai trên GitHub) dù không còn UI hay RPC
-- hợp lệ nào cần đến chúng nữa:
--
--   1. bizon_check_key(text) / bizon_check_key_gate(text)
--      Nguyên thủy của cơ chế "Khóa giảng viên dùng chung" đã bị khóa ở
--      6 hàm bọc ngoài (migration 20260914010000) — nhưng chính 2 hàm
--      gốc này chưa từng được revoke khỏi PUBLIC lúc tạo (Postgres cấp
--      EXECUTE cho PUBLIC mặc định khi CREATE FUNCTION, phải revoke
--      tường minh). Không hàm hợp lệ nào còn gọi trực tiếp 2 hàm này
--      qua quyền anon/authenticated nữa (chỉ được gọi NỘI BỘ từ các RPC
--      SECURITY DEFINER khác, chạy bằng quyền chủ hàm nên không cần
--      caller có EXECUTE) — an toàn để đóng hẳn.
--
--   2. bizon_class_leaderboard(text)
--      Thêm ở migration 20260913000000 cho bảng xếp hạng chéo đội theo
--      thời gian thực; PR #469 đã tắt phía client (fetchClassLeaderboard
--      giờ no-op) sau khi sinh viên KT330H-M01 phản ánh xem được lợi
--      nhuận/thị phần của các đội khác giữa mùa — nhưng cố ý giữ RPC
--      sống ở backend "phòng khi cần bật lại". Vấn đề: giữ RPC sống
--      nghĩa là ai cũng gọi thẳng REST API (bỏ qua UI) với bất kỳ
--      class_code nào và vẫn đọc được đúng dữ liệu mà bản vá client
--      định che — khóa client không khóa được server. Đóng hẳn ở đây;
--      muốn bật lại một bảng xếp hạng chéo đội thật thì làm RPC mới có
--      cơ chế xác thực đúng (vd. bizon_owns_class như giảng viên, hoặc
--      một "mã tham gia" riêng của lớp), không gỡ lại hàm cũ này.
--
-- Không xóa hàm (để tránh vỡ nếu cần rollback/tham khảo), chỉ revoke
-- quyền gọi — giống cách tiếp cận của 20260914010000.
-- ============================================================

revoke execute on function public.bizon_check_key(text) from anon, authenticated, public;
revoke execute on function public.bizon_check_key_gate(text) from anon, authenticated, public;
revoke execute on function public.bizon_class_leaderboard(text) from anon, authenticated, public;
