# Gói hồ sơ đăng ký quyền tác giả — tháng 8–9/2026

Ba bộ hồ sơ đăng ký quyền tác giả (loại hình: chương trình máy tính), mỗi bộ một thư mục:

| Thư mục | Tác phẩm | Bản đóng băng (commit) | Số tệp |
|---|---|---|---|
| `bizon/` | BizOn – Bật Nghiệp: Hệ thống phần mềm mô phỏng kinh doanh phục vụ đào tạo khởi nghiệp | `f38c47e` (03/8/2026) | 458 |
| `enquiz/` | EnQuiz: Ứng dụng ôn thi trắc nghiệm Khởi sự doanh nghiệp — kho [EnQuiz](https://github.com/thuyhuongctu/EnQuiz) | `8723b1e` (08/9/2026) | 150 |
| `we-create-tomorrow/` | Phần mềm karaoke ca khúc Trường Kinh tế – Đại học Cần Thơ — kho [we-create-tomorrow](https://github.com/thuyhuongctu/we-create-tomorrow) | `c8067d0` (08/9/2026) | 44 |

Mỗi thư mục gồm bốn tệp:

- `THONG_TIN_HO_SO_BAN_QUYEN_*.docx` — thông tin sáu mục theo phiếu của đơn vị soạn hồ sơ, điền sẵn từ kho mã nguồn.
- `PHIEU_DIEN_THONG_TIN_NHAN_THAN_*.docx` — phiếu để hai tác giả điền thông tin nhân thân (phần duy nhất còn thiếu).
- `BANG_KE_DIA_*_SHA256.xlsx` — bảng kê toàn bộ tệp của bản đóng băng, mỗi tệp một mã băm SHA-256, kèm trang tổng hợp.
- `BAN_IN_MA_NGUON_*_15-20trang.pdf` — bản in mã nguồn tiêu biểu đúng 20 trang: trang bìa + mã nguồn nguyên văn có số dòng, số trang, chỗ ký nháy từng trang và mã băm SHA-256 của từng tệp.

Riêng hồ sơ We Create Tomorrow còn ba tài liệu đã soạn sẵn trong kho riêng tư
`School-of-Economics` (thư mục `chuong-trinh/`): `ma-nguon.pdf` (bản in 20 trang lập
24/8/2026, đã dùng làm căn cứ công bố), `giao-dien-chuong-trinh.pdf` (6 trang, đã gỡ logo)
và `mo-ta-chuc-nang.pdf` (4 trang).

## Tạo lại hai tệp bảng kê và bản in

Bảng kê và bản in được sinh tự động bằng `scripts/release/build_copyright_filing_package.py`,
lấy nội dung tại đúng commit đóng băng nên chạy lại luôn cho cùng kết quả. Ví dụ cho BizOn
(chạy tại thư mục gốc kho mã):

```bash
python3 scripts/release/build_copyright_filing_package.py
```

Cho hai tác phẩm còn lại, chỉ định `--repo-dir`, `--commit`, `--title`, `--repo-url`,
`--name` và `--print-files` (xem phần đầu của script).
