# Audit khả năng tiếp cận — WCAG 2.1 mức AA

**Phạm vi:** `game.html` (ứng dụng game BizOn Bật Nghiệp).
**Chuẩn đối chiếu:** Web Content Accessibility Guidelines (WCAG) 2.1, mức AA (W3C, 2018).
**Tính chất:** Audit chuyên gia theo tiêu chí thành công (Success Criteria – SC). Chưa kiểm thử với người dùng trợ năng thực tế và trình đọc màn hình thương mại (JAWS/NVDA/VoiceOver) — xem mục "Còn lại".

---

## 1. Đã khắc phục trong PR này

| SC (mức) | Vấn đề trước đây | Khắc phục |
|---|---|---|
| **2.4.7 Focus Visible (AA)** | `.clay-input { outline:none }` và các utility `outline-none` làm mất viền focus; nút clay tuỳ biến không có trạng thái focus nhất quán | Thêm quy tắc `:focus-visible` viền 3px cho `a, button, [role=button], input, select, textarea, [tabindex]` (và biến thể màu cho chế độ tối) |
| **2.4.1 Bypass Blocks (A)** | Không có cách bỏ qua thanh công cụ để tới nội dung | Thêm liên kết "Bỏ qua tới nội dung chính" (`.bz-skip`) trỏ tới `#main-content`, chỉ hiện khi focus bằng bàn phím |
| **4.1.2 Name, Role, Value (A)** | Nút chỉ-icon không có tên truy cập: Gửi `➤` và Micro `🎤` (không cả `title`); 🌙 🎵 EN chỉ có `title` | Thêm `aria-label` cho 5 nút: đổi chủ đề, đổi ngôn ngữ, bật/tắt nhạc, micro, gửi |
| **1.3.1 Info & Relationships (A)** | Hai vùng `<nav>` không phân biệt | Thêm `aria-label="Điều hướng chính"` cho thanh nav dưới; `<main>` có `id=main-content` |
| **2.3.3 Animation from Interactions (AAA) / 2.2.2 Pause, Stop, Hide (A)** | Nhiều hoạt ảnh tự chạy (ticker thị trường, confetti, float, pulse, sóng nhạc) không tôn trọng tuỳ chọn hệ thống | Thêm `@media (prefers-reduced-motion: reduce)` vô hiệu hoá/giảm hoạt ảnh |

*Các điểm đã đạt sẵn trước đó (giữ nguyên):* `aria-label` trên mọi thanh trượt quyết định (SC 4.1.2); chế độ Sáng/Tối; song ngữ VI/EN; landmark `<header>/<main>/<nav>`; nhãn chữ kèm icon ở thanh nav dưới.

---

## 2. Còn lại — cần quyết định thiết kế hoặc kiểm thử riêng

| SC (mức) | Ghi nhận | Khuyến nghị |
|---|---|---|
| **1.4.3 Contrast (Minimum) (AA)** | Nhiều chữ phụ dùng độ mờ thấp (`text-deep-teal/40`, `/50`) trên nền sáng — có nguy cơ < 4.5:1 với chữ thường và < 3:1 với chữ lớn | Audit tỉ lệ tương phản từng token; nâng các mức `/40`–`/50` mang thông tin lên tối thiểu `/70`. Cần chị duyệt vì ảnh hưởng thẩm mỹ. |
| **1.4.11 Non-text Contrast (AA)** | Viền ô input, thanh trượt, đường kẻ mảnh (`primary/10`) có thể < 3:1 | Nâng tương phản viền thành phần tương tác. |
| **2.1.1 Keyboard (A)** | Chưa kiểm thử toàn bộ luồng chỉ bằng bàn phím (carousel chọn vai, slider, mở/đóng modal) | Kiểm thử điều hướng bàn phím đầu-cuối; đảm bảo bẫy focus trong modal. |
| **1.1.1 Non-text Content (A)** | Biểu đồ/bản đồ vẽ bằng SVG/canvas (spark lines, bản đồ chinh phục, monitor) chưa có mô tả văn bản thay thế | Thêm `aria-label`/`<desc>`/bảng số liệu ẩn cho biểu đồ. |
| **1.4.10 Reflow (AA)** | Cần kiểm ở 320px và zoom 400% | Kiểm tra không cuộn ngang ở khổ hẹp/zoom cao. |
| **4.1.2 (động)** | Khi đổi VI/EN, thuộc tính `lang` của tài liệu nên cập nhật theo | Cập nhật `document.documentElement.lang` khi `toggleLang()`. |

---

## 3. Ghi chú phương pháp
Audit này dựa trên rà soát mã nguồn và tiêu chí WCAG 2.1, không thay cho kiểm thử với người dùng khuyết tật và trình đọc màn hình. Các mục mục 2 nên được xử lý ở (các) PR tiếp theo sau khi chốt hướng thiết kế tương phản màu.

---

## Tham chiếu
World Wide Web Consortium. (2018). *Web Content Accessibility Guidelines (WCAG) 2.1.* https://www.w3.org/TR/WCAG21/
