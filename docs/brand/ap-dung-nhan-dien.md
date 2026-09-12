# Áp dụng nhận diện Bật Nghiệp — danh mục triển khai (chờ duyệt)

> Danh mục **thao tác cụ thể** để chuyển sản phẩm đang chạy sang nhận diện **Bật Nghiệp**.
> **Chưa thực hiện.** Chỉ chạy sau khi chốt **(a) hướng đặt tên** (A thay hẳn / B song ngữ — xem [`doi-ten-phuong-an-B.md`](doi-ten-phuong-an-B.md)) và **(b) mẫu logo** (công tắc / măng-thuyền / hệ hai tầng).
> Mục tiêu của trang này: khi có quyết định, việc triển khai chỉ là làm theo danh mục, không phải thiết kế lại.

## 0. Tài sản đã sẵn trong kho (PR này)

| Loại | Tệp | Trạng thái |
|---|---|---|
| Biểu tượng công tắc (3 sắc độ) | `logo/bat-nghiep-bieu-tuong-{mau,den-trang,am-ban}.svg` | ✅ vector, sẵn |
| Biểu tượng ứng dụng vuông | `logo/bat-nghiep-app-icon.svg`, `logo/bat-nghiep-app-icon-jade.svg` | ✅ vector 512px, bo góc `rx=112` |
| Tài liệu nhận diện | `docs/brand/bat-nghiep-nhan-dien.md` | ✅ |
| Kế hoạch đổi tên (song ngữ) | `docs/brand/doi-ten-phuong-an-B.md` | ✅ chờ duyệt |

## 1. Xuất PNG cho biểu tượng ứng dụng

Từ `logo/bat-nghiep-app-icon.svg`, xuất các cỡ chuẩn (giữ nền vuông bo góc):

```
512×512  → assets/icons/icon-512.png      (thay tệp cũ)
192×192  → assets/icons/icon-192.png      (thay tệp cũ)
180×180  → assets/icons/apple-touch-icon.png
 32×32   → favicon PNG (nếu cần bản PNG)
```

Gợi ý công cụ (bất kỳ cái nào có sẵn trên máy): `cairosvg`, `rsvg-convert`, hoặc Inkscape.
Ví dụ: `cairosvg logo/bat-nghiep-app-icon.svg -o assets/icons/icon-512.png -W 512 -H 512`.

## 2. Thay favicon

- `index.html` (và mọi trang có `<link rel="icon">`): trỏ favicon SVG sang biểu tượng mới.
  - Hiện tại: `assets/brand/bizon-favicon.svg` (dòng ~19), `assets/icons/icon-192.png` (dòng ~20).
  - Cách ít rủi ro nhất: **thay nội dung** hai tệp đích đó bằng biểu tượng Bật Nghiệp (giữ nguyên đường dẫn) để không phải sửa từng trang.

## 3. Cập nhật manifest (nhãn cài đặt ứng dụng)

Hai tệp: `manifest.webmanifest` (gốc) và `app/manifest.webmanifest`.

- `icons[]`: giữ nguyên đường dẫn `assets/icons/icon-192.png` / `icon-512.png` (đã thay ảnh ở bước 1).
- `name` / `short_name`: đổi **theo hướng đặt tên đã chốt**:
  - **Phương án A:** `name` = "Bật Nghiệp", `short_name` = "Bật Nghiệp".
  - **Phương án B (song ngữ):** `name` = "Bật Nghiệp – BizOn …", `short_name` = "Bật Nghiệp".
  - *(Hiện `name` đã là "BizOn Bật Nghiệp …" — chỉ cần chỉnh thứ tự/short_name theo phương án.)*
- `theme_color` / `background_color`: cân nhắc đưa về hệ màu nhận diện (mực `#0E2135`, ngọc trai `#F5F8FC`) nếu muốn đồng bộ — **tùy chọn**, không bắt buộc.

## 4. Đổi tên hiển thị trên trang (theo phương án đặt tên)

Làm **theo quy tắc ngữ cảnh** trong [`doi-ten-phuong-an-B.md`](doi-ten-phuong-an-B.md) §"Cách chạy khi được duyệt" — **không** `sed` toàn cục.
Chỉ đụng: `<title>`, `<h1 class="brand…">`, `og:title`, `og:site_name`, câu giới thiệu tiếng Việt, footer bản quyền, và nhãn thương hiệu ở thanh điều hướng (`index.html` dòng ~138 `<span>BizOn…`).

**Giữ nguyên** (đã liệt kê trong kế hoạch đổi tên): URL GitHub Pages, DOI Zenodo `10.5281/zenodo.21592241`, tên tính năng **BizOn Go Global** / **BizOn Arcade**, mọi `id`/`class`/khóa localStorage/tên biến.

## 5. Kiểm tra sau khi áp dụng

- [ ] `grep -rn "zenodo\|21592241"` — DOI còn nguyên.
- [ ] `grep -rn "thuyhuongctu.github.io/BizOn"` — URL Pages còn nguyên.
- [ ] `grep -rn "BizOn Go Global\|BizOn Arcade"` — tên tính năng còn nguyên.
- [ ] Mở trang chủ + 2–3 trang chính: favicon mới hiện đúng, không vỡ layout.
- [ ] Cài PWA thử: nhãn ứng dụng và biểu tượng đúng mẫu mới.
- [ ] Chạy trình kiểm HTML sẵn có của dự án (nếu có) — không lỗi mới.

## 6. Nhãn hiệu (nhắc lại, làm song song)

Trước khi in tài liệu có logo hay nộp đơn: **tra cứu khả năng đăng ký nhãn hiệu** cho "Bật Nghiệp" + biểu tượng công tắc (hồ sơ IP §0.1). Phần chữ cần chuyển thành đường nét (outline) trước khi nộp.

---

*Danh mục triển khai — chưa thực thi. Thứ tự an toàn: chốt tên (A/B) + mẫu logo → xuất PNG (bước 1) → thay favicon/manifest (2–3) → đổi tên hiển thị (4) → kiểm tra (5). Mọi bước đều đảo ngược được bằng git.*
