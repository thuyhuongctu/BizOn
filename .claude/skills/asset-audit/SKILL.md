---
name: asset-audit
description: "Rà ảnh, video, âm thanh, mô hình 3D trong assets/ của BizOn: tệp quá nặng cho điện thoại, định dạng chưa tối ưu (JPG/PNG lớn thay vì WebP, video chưa faststart), tệp không còn trang nào dùng, đường dẫn hỏng, tệp có trong sw.js mà không tồn tại. Chỉ liệt kê; không xoá, không ghi đè ảnh gốc."
argument-hint: "[assets/thư-mục | video | anh | audio | models | all]"
user-invocable: true
---

<!-- Phỏng theo skill asset-audit của «Claude Code Game Studios» (Donchitos, giấy phép MIT – xem THIRD-PARTY-NOTICES.md mục 6),
     Việt hóa và chỉnh cho trang tĩnh BizOn (assets/, sw.js, quy tắc không ghi đè ảnh gốc). -->

# Rà tài nguyên (ảnh, video, âm thanh, 3D)

Trả lời bằng tiếng Việt, xưng «em», gọi chị. Lệnh này **chỉ đọc và liệt kê**. Theo CLAUDE.md, không ghi đè ảnh hay video gốc:
bản tối ưu là tệp mới (`-v2`, `-720p`...) rồi đổi đường dẫn; việc xoá tệp cũ chỉ đề xuất, chị quyết.

## 1. Đầu vào

Ghi «CÓ» hay «KHÔNG CÓ» cho từng nguồn trước khi kết luận: thư mục `assets/` được chọn, các trang `.html`/`.js`/`.css` ở gốc, `lab/`,
`app/`, `js/`; danh sách lưu sẵn trong `sw.js`; `ffprobe` (đo video/âm thanh). Thiếu nguồn nào thì mục dùng nguồn đó ghi
«CHƯA ĐÁNH GIÁ», không ghi đạt.

## 2. Kiểm

- **Kích cỡ** (ngưỡng gợi ý cho điện thoại, chỉnh nếu chị muốn): ảnh trên trang > 400 KB, ảnh bìa/poster > 150 KB,
  video trang chủ > 25 MB hoặc > 720p, nhạc > 6 MB, mô hình `.glb` > 8 MB, tệp bất kỳ > 50 MB (GitHub cảnh báo).
- **Định dạng**: trang dùng JPG/PNG lớn mà đã có hoặc nên có bản WebP; poster video phải WebP (đã có test); MP4 phải H.264 + AAC
  và faststart (`moov` trước `mdat`); không còn WebM (quy ước từ 11/2026).
- **Tham chiếu hỏng**: đường dẫn `assets/...` trong mã mà tệp không tồn tại (kể cả trong `sw.js`, thuộc tính `data-*`, CSS `url()`).
- **Tệp mồ côi**: tệp trong `assets/` không trang, script, test hay tài liệu nào nhắc tới. Phân loại: bản cũ còn giữ có chủ đích
  (ghi trong commit hay test là «giữ nguyên trong kho», ví dụ trailer v4/v5) — không đề xuất xoá; tệp thật sự không dùng — đề xuất.
- **Tên tệp**: chữ thường, gạch nối, không dấu, không khoảng trắng (tệp cũ có khoảng trắng chỉ ghi chú, không đổi tên ồ ạt vì
  sẽ làm hỏng liên kết).

## 3. Báo cáo

Tóm tắt số tệp đã quét, rồi các mục: Quá nặng · Định dạng · Tham chiếu hỏng · Mồ côi (chia «giữ có chủ đích» / «đề xuất gỡ») ·
Tên tệp · Mục chưa đánh giá. Mỗi dòng: đường dẫn, cỡ, nơi dùng (hoặc «không nơi nào»), đề xuất cụ thể (lệnh ffmpeg/sharp tạo
tệp mới). Ước tính tổng dung lượng tiết kiệm được cho người dùng điện thoại.

Kết luận: **KHÔNG ĐẠT** khi có tham chiếu hỏng hoặc tệp vượt ngưỡng đang được trang chính dùng; **CÓ CẢNH BÁO** khi chỉ còn
định dạng, tên hay mồ côi; **ĐẠT** khi đủ mục và không phát hiện; **CHƯA ĐÁNH GIÁ** khi không quét được tệp nào.

Sửa thì nhánh riêng: tệp mới, đổi đường dẫn, tăng `CACHE` trong `sw.js`, thêm test (như `test/assets-clay-light.test.js`).
