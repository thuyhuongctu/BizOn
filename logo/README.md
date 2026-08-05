# Logo BizOn — bộ nhận diện chính thức

Bộ logo chuẩn để dùng cho hồ sơ sở hữu trí tuệ và mọi ấn phẩm. Chữ "O" trong "BizOn" là **hình công tắc ở vị trí bật** (On = Bật) — bầu dục rỗng viền dày + chấm tròn đặc lệch phải.

| Tệp | Biến thể | Dùng khi |
|---|---|---|
| `bizon-logo-mau-2400.png` | **Màu** — chữ đen ngả lục, chấm xanh lục sẫm (jade) | Nền sáng · bản màu chính (hồ sơ nhãn hiệu §2.2) |
| `bizon-logo-den-trang-2400.png` | **Đen trắng** — toàn đen, chấm trắng | Bản đen trắng cho tờ khai nhãn hiệu (§2.2) · in một màu |
| `bizon-logo-am-ban-2400.png` | **Âm bản** — chữ trắng trên nền tối, chấm vàng | Nền tối · slide, bìa |
| `bizon-bieu-tuong-1024.png` | **Biểu tượng đơn** (PNG) — chỉ hình công tắc | Favicon lớn, app icon, dấu hiệu hình đơn (§7.1) |
| `bizon-bieu-tuong-mau.svg` | **Biểu tượng — vector màu** (viền ink, chấm jade) | Dấu hiệu "Hình công tắc" cho hồ sơ nhãn hiệu (vector) |
| `bizon-bieu-tuong-den-trang.svg` | **Biểu tượng — vector đen trắng** | Bản đen trắng của dấu hiệu hình cho tờ khai |
| `bizon-bieu-tuong-am-ban.svg` | **Biểu tượng — vector âm bản** (viền trắng, chấm vàng) | Nền tối |

## Mô tả cho tờ khai nhãn hiệu (theo `bohososhtt.html` §2.3)

- **Phần chữ:** "BizOn", chữ không chân, nét đậm, khoảng cách chữ thu hẹp.
- **Phần hình:** chữ "O" thay bằng bầu dục rỗng viền dày + hình tròn đặc lệch phải → mô phỏng công tắc ở vị trí bật.
- **Màu (bản màu):** chữ + viền bầu dục màu đen ngả lục; hình tròn bên trong màu xanh lục sẫm (#0F5C4E).
- **Ý nghĩa:** công tắc bật = "On" (Anh) và "Bật" (Việt) — cùng chỉ hành động khởi động.

## Nhãn hiệu — trạng thái nộp (ưu tiên)

Ba **dấu hiệu hình đơn** ("Hình công tắc", §1.1) nay **đã có bản vector SVG** (3 sắc độ ở trên) — dựng lại chính xác từ hình học công tắc, dùng được cho tờ khai nhãn hiệu.

| Dấu hiệu (§1.1) | Loại | Ảnh mẫu | Trạng thái |
|---|---|---|---|
| BizOn | Chữ | (word mark, không cần ảnh) | Sẵn — cần tra cứu khả năng đăng ký trước |
| Bật Nghiệp | Chữ | (word mark) | Sẵn |
| Hình công tắc | Hình | `bizon-bieu-tuong-*.svg` (vector) + `-1024.png` | ✅ Đủ ảnh vector |
| BizOn + hình (kết hợp) | Kết hợp | `bizon-logo-mau-2400.png` · `-den-trang-2400.png` | PNG 2400px dùng làm mẫu được; SVG chữ chờ thiết kế |

- **Việc bắt buộc TRƯỚC tiên** (hồ sơ §0.1): *tra cứu khả năng đăng ký nhãn hiệu* — làm trước mọi việc khác, kể cả trước khi in tài liệu có logo. Thành tố "Biz" mang tính mô tả → phải tra trùng.
- Nội dung tờ khai (chủ đơn, mô tả, danh mục Nice 9/41/42) đã có sẵn trong `bohososhtt.html` Phần 2.

## Còn thiếu: SVG phần CHỮ

Phần **chữ "BizOn"** dùng kiểu chữ riêng nên **không vector hoá ngược từ PNG** (mất nét). Bản `bizon-logo-mau.svg` / `bizon-logo-den-trang.svg` (chữ + hình) cần lấy **SVG gốc từ khâu thiết kế**. Trong lúc chờ, **PNG 2400px** dùng làm mẫu nhãn cho tờ khai được (mẫu in ở kích thước cố định).

> Lưu ý: `assets/brand/` chứa bộ wordmark/app-icon SVG của giao diện web (thiết kế cũ, đơn giản hơn). Bộ trong `logo/` mới là bộ nhận diện chính thức cho hồ sơ.
