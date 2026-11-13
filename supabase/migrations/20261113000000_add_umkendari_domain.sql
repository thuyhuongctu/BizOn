-- ============================================================
-- BizOn — Thêm tên miền email sinh viên Universitas Muhammadiyah Kendari (Indonesia)
--
-- Lớp trao đổi tín chỉ quốc tế KT330H (160 sinh viên UM Kendari, học qua Zoom, 11/2026) chơi Bật Nghiệp.
-- Email sinh viên của trường có dạng ten.02@umkendari.ac.id: phần sau @ là đúng «umkendari.ac.id»
-- (hệ thống so khớp chính xác phần sau @, không nhận tên miền con như febi.umkendari.ac.id).
-- Cán bộ, giảng viên của trường cũng dùng đuôi này: họ đăng ký được như sinh viên, nhưng muốn làm
-- giảng viên của BizOn thì vẫn phải được quản trị duyệt riêng (instructor_allowlist).
-- Chỉ thêm một dòng vào student_email_domains (migration 20261023000000_require_student_login.sql),
-- an toàn khi chạy lại. Gỡ: select public.bizon_admin_set_student_domain('umkendari.ac.id', false);
-- ============================================================
insert into public.student_email_domains (domain, note, added_by)
values ('umkendari.ac.id', 'Sinh viên Universitas Muhammadiyah Kendari (Indonesia)', 'migration')
on conflict (domain) do nothing;
