-- ============================================================
-- BizOn — Thêm tên miền email cán bộ, giảng viên Trường Đại học Cần Thơ (ctu.edu.vn)
--
-- Giảng viên CTU (vd thầy Phan Anh Tú, patu@ctu.edu.vn) cần vào chơi như một đội trong lớp để thử luồng
-- của sinh viên (đăng nhập email trường → «Join team» → kết quả về bảng điều khiển), như lớp KT330H với UM Kendari (11/2026).
-- Hệ thống so khớp chính xác phần sau @: chỉ nhận ...@ctu.edu.vn; student.ctu.edu.vn, gstudent.ctu.edu.vn đã có từ trước;
-- tên miền con khác (vd sv@abc.ctu.edu.vn) không được nhận.
-- Lưu ý: mọi email @ctu.edu.vn (cán bộ CTU) đăng ký được như sinh viên và nộp được kết quả về lớp có mã.
-- Quyền giảng viên của BizOn (tạo mã lớp) không đổi: vẫn phải nằm trong instructor_allowlist do quản trị duyệt.
-- Chỉ thêm một dòng vào student_email_domains (migration 20261023000000_require_student_login.sql),
-- an toàn khi chạy lại. Gỡ: select public.bizon_admin_set_student_domain('ctu.edu.vn', false);
-- ============================================================
insert into public.student_email_domains (domain, note, added_by)
values ('ctu.edu.vn', 'Cán bộ, giảng viên Trường Đại học Cần Thơ (chơi thử như sinh viên)', 'migration')
on conflict (domain) do nothing;
