/* BizOn – Sổ đăng ký điều hướng ứng dụng (nguồn duy nhất)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Trước đây mỗi trang trong /app/ tự chép tay danh sách điều hướng, nên đã lệch
 * nhau (Command Center có Analytics/Lumina/Settings; Instructor Studio đổi thành
 * "Kịch bản lớp học"/"Quyền riêng tư"; Classroom lúc trỏ giang-vien.html lúc bị
 * JS viết lại thành instructor-studio.html). Gom về MỘT nơi ở đây; js/app-shell/
 * unified-app.js đọc sổ này rồi dựng thanh bên (desktop) và thanh dưới (mobile)
 * cho mọi trang app – sửa một lần là cả cụm ứng dụng đổi theo.
 *
 * href tính theo thư mục /app/ (trang trong app dùng "./…", trang gốc dùng "../…").
 * icon là ký tự glyph đặt trước nhãn, đúng như markup sẵn có của bz-side-nav.
 * Không đổi route chính thức và manifest – release.html vẫn là start_url của PWA.
 */
(function () {
  'use strict';
  window.BIZON_ROUTES = {
    // Thanh bên desktop – danh sách mô-đun chuẩn (bz-side-nav / bi-nav)
    primary: [
      { id: 'command',   icon: '⌂', label: 'Command Center',   href: './command-center.html' },
      { id: 'startup',   icon: '☆', label: 'Startup Lab',      href: '../game.html' },
      { id: 'brand',     icon: '◇', label: 'Brand Passport',   href: './brand-passport.html' },
      { id: 'aibis',     icon: '◎', label: 'AIBIS Global',     href: './aibis.html' },
      { id: 'classroom', icon: '♙', label: 'Instructor Studio', href: './instructor-studio.html' },
      { id: 'reports',   icon: '▤', label: 'Reports',          href: '../hoc-thuat.html' },
      { id: 'blueprint', icon: '◈', label: 'Blueprint 2030',   href: './blueprint-2030.html' },
    ],
    // Nhóm phụ – vẫn giữ lối vào nhưng tách khỏi danh sách mô-đun chính
    secondary: [
      { id: 'lumina',   icon: '✦', label: 'Lumina',   href: '../lumina.html' },
      { id: 'settings', icon: '⚙', label: 'Cài đặt',  href: '../chinh-sach.html' },
    ],
    // Thanh dưới cho màn hình hẹp – tối đa 5 tab
    mobile: [
      { id: 'home',      label: 'Trang chủ', href: './release.html' },
      { id: 'command',   label: 'Điều hành', href: './command-center.html' },
      { id: 'startup',   label: 'Startup',   href: '../game.html' },
      { id: 'aibis',     label: 'AIBIS',     href: './aibis.html' },
      { id: 'classroom', label: 'Lớp học',   href: './instructor-studio.html' },
    ],
  };
})();
