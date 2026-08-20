# Rà soát metadata trang Bến Phù Sa — đồng bộ với tên đăng ký

> Mục tiêu: nếu nộp **nhãn "Bến Phù Sa" riêng**, chuỗi tên hiển thị trên trang phải khớp đúng chuỗi ký tự đăng ký (nguyên tắc đã áp dụng ở PR #410 cho trang chủ). Đây là **bản rà soát + khuyến nghị** — chưa sửa, vì chuỗi tên cuối phụ thuộc quyết định đặt tên (A/B) và quyết định nhãn hiệu (Phần C).

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

**Nhận xét:** `<title>` và `og:title` **đã nhất quán** với nhau. Tên thương hiệu Việt hiện là chuỗi ghép *"Gánh Hàng Khởi Nghiệp: Bến Phù Sa – BizOn Bật Nghiệp"*.

## Khuyến nghị theo từng quyết định

- **Nếu Phần C chọn Phương án 1** (không nộp nhãn "Bến Phù Sa" riêng): **giữ nguyên**. "Bến Phù Sa" là tên bậc chơi dưới nhãn chính — không cần khớp chuỗi đăng ký riêng.
- **Nếu Phần C chọn Phương án 2** (nộp nhãn "Bến Phù Sa" riêng): chốt **chuỗi ký tự chuẩn** của nhãn (ví dụ `Bến Phù Sa` hoặc `BẾN PHÙ SA`) rồi đảm bảo chuỗi đó xuất hiện **nguyên văn, không dấu ghép lạ** trong `<title>`, `<h1>`, `og:title`. Tránh để tên nhãn bị chèn giữa các cụm khác khiến không khớp mẫu nhãn nộp.
- **Đồng bộ với quyết định đặt tên A/B** (BizOn → Bật Nghiệp): phần `– BizOn Bật Nghiệp` trong title nên theo đúng phương án đã duyệt ở PR nhận diện (xem `docs/brand/ap-dung-nhan-dien.md`). Làm **một lần cùng đợt** để không đổi title hai lần.

## Khi được duyệt — thao tác (chưa làm)

1. Chốt chuỗi tên chuẩn (từ quyết định A/B + Phần C).
2. Sửa **theo ngữ cảnh**, chỉ trong `<title>`, `<h1>`, `og:title`, `og:site_name`, `og:description`, `meta description` của `ben-phu-sa.html`.
3. **Giữ nguyên** `og:url` (`…/BizOn/ben-phu-sa.html`) và mọi định danh kỹ thuật.
4. Kiểm lại: mở trang, xem thẻ title trên tab + preview khi chia sẻ link.

---

*Bản rà soát — chưa sửa file. Gộp cùng đợt áp dụng nhận diện để tránh đổi metadata nhiều lần.*
