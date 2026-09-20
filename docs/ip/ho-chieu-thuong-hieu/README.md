# Mã nguồn & giao diện nộp kèm — Hộ Chiếu Thương Hiệu (chương trình máy tính)

Thư mục gom hai tài liệu nộp kèm cho hồ sơ đăng ký quyền tác giả của Hộ Chiếu Thương
Hiệu (loại hình: chương trình máy tính) — mô tả tác phẩm chính nằm ở
`../HO-CHIEU-THUONG-HIEU-MO-TA-TAC-PHAM-DRAFT-2026-09-17.md`. Cùng khuôn mẫu đã dùng
cho Bến Phù Sa (`../ben-phu-sa/`) và Bật Nghiệp (`../bat-nghiep/`).

| Tệp / thư mục | Nội dung |
|---|---|
| [`ma-nguon-dac-trung/`](ma-nguon-dac-trung/) | Bản trích mã nguồn để in kèm: `js/aibis/entry-mode-models.js` + `entry-mode-engine.js` (engine chọn phương thức thâm nhập 8 chiều, có trích dẫn học thuật) + toàn bộ khối `<script>` chính của `brand-passport.html` (dữ liệu doanh nghiệp/thị trường/nguồn tin, hồ sơ ẩn theo seed, hệ thống sự kiện, vòng lặp trò chơi, tính điểm 5 chiều) — 745 dòng ≈ 14 trang. Không lược hằng số nào — engine dùng công thức công khai, không phải dữ liệu ẩn cần giấu như Bến Phù Sa. |
| [`anh-giao-dien/`](anh-giao-dien/) | Ảnh 5 màn hình chính (mở đầu · mua thông tin thị trường · quyết định (điểm AIBIS) · sự kiện phát sinh theo quý · kết quả cuối 5 chiều). Chơi thử một lượt thật (6 quý) qua Playwright để lấy đúng ảnh kết quả cuối. Kèm [`ho-chieu-thuong-hieu-giao-dien-chuong-trinh.pdf`](anh-giao-dien/ho-chieu-thuong-hieu-giao-dien-chuong-trinh.pdf) — bản in gộp 5 trang (mỗi ảnh 1 trang + chú thích "Hình N." + số trang). |

## Cần lưu ý
- **Không đưa dữ liệu cá nhân** (CCCD, ngày sinh, địa chỉ, SĐT) vào bất kỳ tệp nào ở đây — repo công khai.
- Ảnh giao diện chụp qua Playwright ngày 20/09/2026, chơi một ván thật (chọn doanh nghiệp Mộc Nhiên, ưu tiên "Thăm dò thị trường", mức vận hành "Cân bằng") để có ảnh kết quả cuối thật, không dựng giả.
- Đây là **tài liệu làm việc chuẩn bị**, không phải tư vấn pháp lý; nộp qua INVESTIP (bên đại diện) — theo bộ hồ sơ Tờ khai/Cam đoan/GUQ đã gửi riêng.

## Liên kết hồ sơ liên quan
- `../HO-CHIEU-THUONG-HIEU-MO-TA-TAC-PHAM-DRAFT-2026-09-17.md` — mô tả tác phẩm chính (mục ①-⑥), gửi INVESTIP soạn Tờ khai.
- `../bat-nghiep/` · `../ben-phu-sa/` — gói tương ứng cho hai game còn lại trong hệ sinh thái BizOn.
