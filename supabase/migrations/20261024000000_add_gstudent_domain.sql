-- ============================================================
-- BizOn — Thêm tên miền email nghiên cứu sinh Đại học Cần Thơ
--
-- @student.ctu.edu.vn là email sinh viên – học viên; @gstudent.ctu.edu.vn là email
-- nghiên cứu sinh. Cả hai đều đăng ký, tham gia đội và nộp kết quả được (bảng
-- student_email_domains của migration 20261023000000_require_student_login.sql).
-- Chỉ thêm một dòng, an toàn khi chạy lại.
-- ============================================================
insert into public.student_email_domains (domain, note, added_by)
values ('gstudent.ctu.edu.vn', 'Nghiên cứu sinh Đại học Cần Thơ', 'migration')
on conflict (domain) do nothing;
