# Kế hoạch: Nút kêu gọi hành động trang Giải pháp

**Đặc tả**: [spec.md](spec.md) · **Duyệt**: chị đồng ý 08/11/2026 (kể cả nút phụ dẫn vào Bến Phù Sa)

## Bối cảnh kỹ thuật
Trang tĩnh, không build. Sửa `giai-phap.html` (nút) và `lien-he.html` (điền sẵn thư). Không đụng tệp hồ sơ quyền tác giả.

## Kiểm theo hiến chương
- II. Nói thật: chữ nút khớp chính sách (Bến Phù Sa miễn phí, Bật Nghiệp/HCTH dùng thử). ✔
- III. Trang tĩnh, 360–390 px, vùng chạm ≥ 44 px, song ngữ `data-en`. ✔
- IV. Có test Playwright, thấy hỏng trước khi sửa. ✔
- V. Không gửi dữ liệu: điền sẵn chạy trong trình duyệt, vẫn soạn email bằng `mailto`. ✔

## Thiết kế
- **Ý định liên hệ** truyền qua tham số `?y=` trên đường dẫn: `dung-thu`, `pilot`, `instructor-pro`, `institution`.
- `lien-he.html`: đọc `y`, chỉ nhận 4 giá trị trên; chọn chủ đề «Hợp tác giảng dạy»; điền lời nhắn theo ngôn ngữ đang
  xem (`localStorage['bizon-lang']`) **chỉ khi ô còn trống**. Giá trị lạ thì bỏ qua.
- `giai-phap.html`:
  - Đầu trang: nút chính «Đăng ký học kỳ dùng thử →» (`?y=dung-thu`); nút phụ «Chơi Bến Phù Sa – miễn phí».
  - Gói giá: ba nút giữ chữ, thêm `?y=pilot|instructor-pro|institution`.
  - Cuối trang: nút chính «Đăng ký học kỳ dùng thử», nút phụ «Chơi Bến Phù Sa – miễn phí», «Liên hệ nhóm».
- `sw.js` nâng `CACHE`.
