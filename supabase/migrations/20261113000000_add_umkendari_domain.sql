-- ============================================================
-- BizOn — Thêm tên miền email sinh viên Universitas Muhammadiyah Kendari (Indonesia)
--
-- Lớp trao đổi tín chỉ quốc tế KT330H (160 sinh viên UM Kendari, học qua Zoom, 11/2026) chơi Bật Nghiệp.
-- Hệ thống so khớp chính xác phần sau @, nên thêm cả hai tên miền thư của trường (cùng do Google nhận thư, tra DNS 13/11/2026):
--   • umkendari.ac.id          – địa chỉ sinh viên đã công bố có dạng ten.02@umkendari.ac.id, ten.student@umkendari.ac.id;
--   • student.umkendari.ac.id  – tên miền con dành cho sinh viên (có bản ghi MX riêng).
-- Tên miền con khác (vd febi.umkendari.ac.id) không được nhận.
-- Cán bộ, giảng viên của trường cũng dùng đuôi umkendari.ac.id: họ đăng ký được như sinh viên, nhưng muốn làm
-- giảng viên của BizOn thì vẫn phải được quản trị duyệt riêng (instructor_allowlist).
-- Chỉ thêm hai dòng vào student_email_domains (migration 20261023000000_require_student_login.sql),
-- an toàn khi chạy lại. Gỡ: select public.bizon_admin_set_student_domain('umkendari.ac.id', false);
-- ============================================================
insert into public.student_email_domains (domain, note, added_by)
values ('umkendari.ac.id', 'Sinh viên Universitas Muhammadiyah Kendari (Indonesia)', 'migration'),
       ('student.umkendari.ac.id', 'Sinh viên Universitas Muhammadiyah Kendari (Indonesia), tên miền con', 'migration')
on conflict (domain) do nothing;
