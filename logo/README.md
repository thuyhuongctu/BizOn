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
- **Gói nộp đơn đầy đủ** (chủ đơn, mô tả, danh mục Nice 9/41/42, mẫu nhãn theo từng dấu hiệu, thứ tự nộp): [`docs/ip/NHAN-HIEU-GOI-NOP-2026.md`](../docs/ip/NHAN-HIEU-GOI-NOP-2026.md) — gom từ `bohososhtt.html` Phần 2.

## Còn thiếu: SVG phần CHỮ

Phần **chữ "BizOn"** dùng kiểu chữ riêng nên **không vector hoá ngược từ PNG** (mất nét). Bản `bizon-logo-mau.svg` / `bizon-logo-den-trang.svg` (chữ + hình) cần lấy **SVG gốc từ khâu thiết kế**. Trong lúc chờ, **PNG 2400px** dùng làm mẫu nhãn cho tờ khai được (mẫu in ở kích thước cố định).

> Lưu ý: `assets/brand/` chứa bộ wordmark/app-icon SVG của giao diện web (thiết kế cũ, đơn giản hơn). Bộ trong `logo/` mới là bộ nhận diện chính thức cho hồ sơ.

---

## Bộ Bật Nghiệp (đổi tên BizOn → Bật Nghiệp)

Ba biến thể biểu tượng công tắc cho tên mới **Bật Nghiệp** — hình học kế thừa nguyên vẹn từ bộ BizOn ở trên (chỉ đổi tên tệp), để giữ liên tục vốn thương hiệu.

| Tệp | Biến thể | Dùng khi |
|---|---|---|
| `bat-nghiep-bieu-tuong-mau.svg` | **Màu** — viền mực `#0E2135`, chấm lục ngọc `#0F5C4E` | Nền sáng · bản màu chính |
| `bat-nghiep-bieu-tuong-den-trang.svg` | **Đơn sắc** — một màu mực | Tờ khai nhãn hiệu · in một màu |
| `bat-nghiep-bieu-tuong-am-ban.svg` | **Âm bản** — viền ngọc trai, chấm champagne `#D8BE87` | Nền tối · slide, bìa |

Bộ nhận diện đầy đủ (wordmark, hệ màu, kiểu chữ, quy tắc dùng, quyết định đặt tên, lưu ý nhãn hiệu): [`docs/brand/bat-nghiep-nhan-dien.md`](../docs/brand/bat-nghiep-nhan-dien.md).

> **Chưa** đổi tên hàng loạt trên các trang HTML. Việc đó chờ chốt hướng đặt tên (thay hẳn vs song ngữ) — xem §7 tài liệu nhận diện.
