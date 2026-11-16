---
name: localize
description: "Rà song ngữ VI/EN của một trang hay game BizOn: chữ viết cứng chưa có bản dịch, khóa dịch thiếu một bên, chỗ giữ chỗ ({n}, %s) lệch nhau, chữ tiếng Anh dài tràn khung ở 360 px, tên riêng tiếng Việt bị dịch nhầm. Có chế độ soạn bản giao việc cho người dịch."
argument-hint: "[tên-trang.html | thư-mục] [scan | validate | qa | brief]"
user-invocable: true
---

<!-- Phỏng theo skill localize của «Claude Code Game Studios» (Donchitos, giấy phép MIT – xem THIRD-PARTY-NOTICES.md mục 6),
     Việt hóa và chỉnh cho cách BizOn làm song ngữ (data-en, bảng L/T trong trang, «bizon-lang»); bỏ phần lồng tiếng, RTL, đóng băng chuỗi. -->

# Rà song ngữ VI/EN

Trả lời bằng tiếng Việt, xưng «em», gọi chị. Tiếng Việt là ngôn ngữ gốc; tiếng Anh dành cho lớp quốc tế (ví dụ UM Kendari).

## Cách BizOn làm song ngữ (đọc trước khi rà)

- Trang chủ và trang tĩnh: chữ tiếng Việt trong thẻ, bản tiếng Anh ở thuộc tính `data-en` (và `data-en-aria`, `data-en-placeholder` nếu có).
- Trang `.dc.html` và game: bảng chữ trong mã (`t('vi', 'en')`, `L.k01`, `T(...)`), chữ trong khung `{{ ... }}`.
- Ngôn ngữ lưu ở localStorage `bizon-lang`; `?lang=en` trên URL ghi đè.
- Tên riêng giữ nguyên tiếng Việt có dấu trong bản tiếng Anh: Bật Nghiệp, Bến Phù Sa, Hộ Chiếu Sầu Riêng, Cần Thơ, tên nhân vật.
  Tên game có thể kèm tên tiếng Anh lần đầu (Brand Passport, Durian Passport) theo cách trang chủ đang dùng.

## Chế độ

**scan** (mặc định): tìm chữ hiển thị chưa có bản kia.
- Thẻ có chữ tiếng Việt (có dấu) mà không có `data-en`; chuỗi tiếng Việt trong JS gán vào `textContent`/`innerHTML`/`alert` không qua hàm dịch.
- `aria-label`, `title`, `placeholder`, `alt` chỉ có một thứ tiếng.
- Chữ trong ảnh, video, PDF: ghi riêng thành mục «cần bản thứ hai» (không tự làm).
- Mỗi kết quả ghi `tệp:dòng` và chữ gốc. Không tự sửa.

**validate**: so hai bên.
- Khóa có bên VI mà thiếu EN (hoặc ngược lại), bản EN còn dấu tiếng Việt do chép nhầm.
- Chỗ giữ chỗ lệch (`{n}`, `{{ x }}`, `%s`, `${...}`), số và đơn vị khác nhau (triệu ₫ ↔ million VND phải đúng giá trị).
- Thuật ngữ không thống nhất giữa các trang (CEO/CFO/CMO/COO/Thư ký, vòng/round, vụ/season...).

**qa**: mở trang thật bằng Playwright ở 360×760 và 1280×860, `?lang=vi` rồi `?lang=en`.
- Không lỗi JS; không còn `{{` trong chữ hiển thị; không tràn ngang (`scrollWidth - innerWidth ≤ 1`); nút không bị cắt chữ.
- Đổi ngôn ngữ giữa chừng (nút VI/EN) thì mọi chữ đổi theo, không cần tải lại.
- Chụp màn mỗi ngôn ngữ, để trong scratchpad.

**brief**: soạn bản giao việc cho người dịch (thầy Tú hoặc cộng tác viên): giọng văn (thân thiện, học thuật vừa phải, gọi người
chơi «you»), bảng thuật ngữ, danh sách không dịch, chỗ giữ chỗ, giới hạn độ dài cho nút và tiêu đề trên điện thoại.

## Báo cáo

Bảng: mức độ (Chặn: chữ sai nghĩa hoặc mất chữ / Nên sửa: thiếu bản dịch / Gợi ý: văn phong), `tệp:dòng`, chữ hiện tại, đề xuất.
Kết luận **ĐẠT / ĐẠT CÓ ĐIỀU KIỆN / CHƯA ĐẠT**, hoặc **CHƯA ĐÁNH GIÁ** nếu không mở được trang hay không đọc được tệp.

Sửa thì làm nhánh riêng, thêm test (như `test/giang-vien-song-ngu.test.js`) để chữ một thứ tiếng không quay lại, và chạy
`html-validate` 0 lỗi. Trang chủ sửa thì chép sang `academia3d-v2.html` cho giống hệt.
