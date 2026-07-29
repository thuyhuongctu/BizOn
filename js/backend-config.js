/* BizOn — Cấu hình backend Supabase (backend mỏng cho Pilot Classroom)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú.
 *
 * CÁCH BẬT (5 phút, xem chi tiết docs/SUPABASE-SETUP.md):
 *  1. Tạo project miễn phí tại https://supabase.com
 *  2. SQL Editor → dán nội dung supabase/migrations/001_bizon_pilot.sql → Run
 *  3. Settings → API: chép "Project URL" và "anon public" key vào 2 dòng dưới
 *  4. Đổi enabled thành true, commit & đẩy lên như thường lệ
 *
 * Khi enabled=false (mặc định) game hoạt động y hệt hiện tại — hoàn toàn offline.
 * anon key là khóa CÔNG KHAI theo thiết kế của Supabase; không bao giờ dán
 * service_role key vào đây. */
window.BIZON_BACKEND = {
  enabled: true,
  url: 'https://ceytblfelodpnudomccn.supabase.co',
  anonKey: 'sb_publishable_5FPpCma_dVUs05K4hvahzQ_Yeq0bLJt',
};
