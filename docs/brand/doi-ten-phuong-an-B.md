# Kế hoạch đổi tên — Phương án B (song ngữ), chờ duyệt

> Bản kế hoạch để **duyệt trước khi chạy**. Chưa thực hiện đổi tên hàng loạt.
> Phương án B: **Bật Nghiệp** = tên chính tiếng Việt; **BizOn** = giữ làm tên tiếng Anh/quốc tế và mọi định danh kỹ thuật.

## Vì sao không “tìm-thay” toàn bộ

Khảo sát kho mã: **233 tệp** có chuỗi “BizOn”. Trong đó phần lớn là **định danh phải giữ nguyên**:

| Chuỗi | Số lần | Xử lý |
|---|---|---|
| `thuyhuongctu.github.io/BizOn` (URL) | 152 | **GIỮ** — đổi là hỏng liên kết, PWA, deep link |
| `BizOn Go Global` (tên tính năng) | 76 | **GIỮ** — tên sản phẩm quốc tế |
| `zenodo` / DOI `…21592241` | 35 | **GIỮ** — bản ghi lưu trữ, không đổi được |
| `BizOn Arcade` (tên tính năng) | 29 | **GIỮ** — tên sản phẩm |

Một lệnh thay thế mù sẽ phá URL, DOI, tên gói CH Play và các tên tính năng đã công bố. Vì vậy đổi tên phải theo **quy tắc**, không theo chuỗi.

## Quy tắc đổi tên (phương án B)

**ĐỔI → “Bật Nghiệp”** (hoặc “Bật Nghiệp (BizOn)” ở lần xuất hiện đầu mỗi trang):

- Tiêu đề trang hiển thị cho người dùng Việt (thẻ `<title>`, `<h1>` thương hiệu, `og:title`, `og:site_name`).
- Tên thương hiệu trong nội dung văn xuôi tiếng Việt (câu giới thiệu, footer bản quyền).
- Nhãn cài đặt ứng dụng: `manifest.webmanifest` → `name` và `short_name` (cân nhắc `short_name: "Bật Nghiệp"`).
- Tên hiển thị trong các trang thể chế/giảng viên (bản tiếng Việt).

**GIỮ NGUYÊN “BizOn”:**

- Mọi URL, đường dẫn tệp, tên nhánh, tên gói, `id`/`class` CSS, khóa localStorage, tên biến/hàm trong JS.
- Tên tính năng đã công bố: **BizOn Go Global**, **BizOn Arcade**.
- DOI, trích dẫn Zenodo, `CITATION.cff`, metadata học thuật (để không phá liên kết học thuật đã công bố).
- Tên kho GitHub và địa chỉ GitHub Pages.

**SONG NGỮ ở nơi trang trọng** (trang chủ, giới thiệu, hồ sơ nhãn hiệu): ghi **“Bật Nghiệp — BizOn”** để bắc cầu tên cũ sang tên mới trong giai đoạn chuyển tiếp.

## Cách chạy khi được duyệt

1. Chốt danh sách tệp mục tiêu = các trang `.html` hiển thị cho người Việt + `manifest.webmanifest` (không đụng `js/`, `css/`, `config/`, `docs/` học thuật).
2. Đổi **theo ngữ cảnh** (không `sed` toàn cục): chỉ trong `<title>`, `<h1 class="brand…">`, `og:title`, `og:site_name`, và câu giới thiệu — bằng chỉnh sửa có rà từng chỗ.
3. Kiểm tra sau khi đổi: `grep` lại các token phải giữ để chắc không lỡ tay; mở thử vài trang chính; chạy trình kiểm HTML sẵn có của dự án.
4. Cập nhật logo/biểu tượng theo mẫu đã duyệt (xem lưu ý về mẫu logo bên dưới).

## Lưu ý: mẫu logo đang bàn

Kế hoạch đổi **tên** ở trên độc lập với việc chọn **mẫu logo**. Khi mẫu logo được chốt (mẫu công tắc rút gọn, mẫu măng-thuyền, hay hệ hai tầng), phần thay ảnh/biểu tượng sẽ gộp vào cùng đợt triển khai này. Trước khi chốt, nên kiểm mẫu logo ở **kích thước app icon/favicon** và **bản đen trắng một màu** (yêu cầu bắt buộc của hồ sơ nhãn hiệu).

---

*Bản kế hoạch — chưa thực thi. Sau khi Thầy/nhóm duyệt quy tắc và mẫu logo, một đợt chỉnh sửa có rà soát sẽ được đẩy lên cùng PR này.*
