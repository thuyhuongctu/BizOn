# Rà soát metadata trang Bến Phù Sa

> Mục tiêu: chuỗi tên hiển thị trên trang khớp **tên tác phẩm đăng ký** và mô tả trang khớp **build thực tế** (nguyên tắc nhất quán metadata đã áp dụng ở PR #410). Đây là **bản rà soát + khuyến nghị** — chưa sửa; chuỗi tên cuối còn phụ thuộc quyết định đặt tên A/B.
>
> *(Phần đồng bộ tên phục vụ đăng ký nhãn hiệu được bàn ở kênh riêng ngoài repo — không đặt ở đây.)*

## Hiện trạng `ben-phu-sa.html` (đã kiểm)

| Thẻ | Giá trị hiện tại |
|---|---|
| `<title>` | `Gánh Hàng Khởi Nghiệp: Bến Phù Sa – BizOn Bật Nghiệp` |
| `<h1>` | `🧺 Gánh Hàng Khởi Nghiệp: Bến Phù Sa` |
| phụ đề | `Entrepreneurial Street Vendor: Ben Phu Sa` |
| `og:title` | `Gánh Hàng Khởi Nghiệp: Bến Phù Sa – BizOn Bật Nghiệp` |
| `og:site_name` | `BizOn Bật Nghiệp` |
| `og:url` | `https://thuyhuongctu.github.io/BizOn/ben-phu-sa.html` |
| `meta name=description` | mô tả cơ chế thăm dò–khai thác 5 tuần (khớp build) |

**Nhận xét:** `<title>` và `og:title` **đã nhất quán** với nhau. `meta description` **đã mô tả đúng** cơ chế thăm dò–khai thác 5 tuần (khớp build). Tên thương hiệu Việt hiện là chuỗi ghép *"Gánh Hàng Khởi Nghiệp: Bến Phù Sa – BizOn Bật Nghiệp"*.

## ⚠️ Độ vênh copy ở trang công khai — `universe.html` dòng 319

Trang **`ben-phu-sa.html`** mô tả **đúng** build (thăm dò–khai thác). Nhưng phần giới thiệu ở **`universe.html` dòng 319** vẫn mô tả cơ chế **chính thức hoá chưa tồn tại**:

> *"Ở lại phi chính thức hay bước lên chính danh. Đăng ký hay không, vay nóng hay vay ngân hàng, chịu rủi ro thu giữ hàng hay trả chi phí tuân thủ."* (`data-vi` / `data-en`)

Đây chính là nguồn khiến bản mô tả Phần B gốc bị lệch. **Phải sửa cho khớp build, qua pipeline QA → promote** (không sửa trực tiếp trang public). Đề xuất copy thay thế (VI/EN) nằm ở **§Copy-cong-khai** trong hồ sơ chính.

## Khuyến nghị đồng bộ tên (khi có quyết định)

- **Nhất quán tên tác phẩm đăng ký:** khi khai bản quyền, chuỗi tên tác phẩm trong hồ sơ nên khớp chuỗi hiển thị chính trên trang, để ảnh giao diện nộp kèm và tên khai là cùng một tác phẩm.
- **Đồng bộ với quyết định đặt tên A/B** (BizOn → Bật Nghiệp): phần `– BizOn Bật Nghiệp` trong title nên theo đúng phương án đã duyệt ở PR nhận diện (xem `docs/brand/ap-dung-nhan-dien.md`). Làm **một lần cùng đợt** để không đổi title hai lần.

## Khi được duyệt — thao tác (chưa làm)

1. Chốt chuỗi tên chuẩn (từ quyết định đặt tên A/B; phần liên quan nhãn hiệu bàn ở kênh riêng).
2. Sửa **theo ngữ cảnh**, chỉ trong `<title>`, `<h1>`, `og:title`, `og:site_name`, `og:description`, `meta description` của `ben-phu-sa.html`.
3. **Giữ nguyên** `og:url` (`…/BizOn/ben-phu-sa.html`) và mọi định danh kỹ thuật.
4. Kiểm lại: mở trang, xem thẻ title trên tab + preview khi chia sẻ link.

---

*Bản rà soát — chưa sửa file. Gộp cùng đợt áp dụng nhận diện để tránh đổi metadata nhiều lần.*
