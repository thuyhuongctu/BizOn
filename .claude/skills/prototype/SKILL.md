---
name: prototype
description: "Làm nhanh một game thử cho BizOn từ một ý tưởng: hỏi một lượt câu hỏi (mục tiêu học, khái niệm kinh doanh, vai, vòng chơi, cảm giác), viết bản brief một trang, dựng một trang HTML chơi được trong lab/, tự chạy thử và chụp màn trước khi giao. Kết thúc bằng TIẾP TỤC / ĐỔI HƯỚNG / DỪNG sau khi chị chơi thử."
argument-hint: "[mô tả game] [--tu <trang có sẵn>]"
user-invocable: true
---

<!-- Phỏng theo skill prototype (one-shot) của «Claude Code Game Studios» (Donchitos, giấy phép MIT – xem THIRD-PARTY-NOTICES.md mục 6),
     Việt hóa và chỉnh cho game học kinh doanh quốc tế của BizOn (trang tĩnh, VI/EN, điện thoại, quy ước kho). -->

# Làm game thử

Trả lời bằng tiếng Việt, xưng «em», gọi chị. Đây là bản thử để học xem ý tưởng có đáng làm không, không phải game chính thức:
nếu chị quyết làm tiếp, game thật đi qua `/dac-ta` (Spec Kit) như mọi tính năng cỡ M trở lên.

## 1. Một lượt câu hỏi (dùng công cụ hỏi, tối đa 5 câu, câu nào cũng có đáp án mặc định để chị chọn «em chọn giúp»)

- **Mục tiêu học**: sinh viên phải hiểu điều gì sau 15 phút chơi (ví dụ «chọn phương thức thâm nhập theo khoảng cách thể chế»)?
- **Khái niệm/lý thuyết** gắn vào (Uppsala, OLI, chuỗi giá trị, 4P, dòng tiền...) và học phần dùng.
- **Người chơi**: một người hay đội 5 vai (CEO, CFO, CMO, COO, Thư ký); số vòng; thời lượng một buổi.
- **Cảm giác và hình**: đất sét 3D như các game BizOn, thẻ bài, bản đồ, bảng điều khiển...
- **Độ khó**: phải có lựa chọn đánh đổi thật, không có một lựa chọn luôn thắng.
Ý tưởng mơ hồ («một game xuất khẩu») thì đưa 2–3 hướng một dòng để chị chọn trước.

## 2. Bản brief một trang

Ghi vào `docs/game-thu/<ten>/brief.md`: lời chị (giữ nguyên chữ), mục tiêu học, phút đầu tiên người chơi làm gì, vòng chơi,
đánh đổi chính, tính năng có trong bản thử và để sau, hình. Gửi chị đọc; chị nói «Dựng» (hoặc sửa) rồi mới làm.

## 3. Dựng

- Một trang `lab/<ten>.html` (dữ liệu và tham số tách ra `lab/<ten>-data.js` để chỉnh cân bằng không đụng giao diện), mở thẳng
  bằng trình duyệt, không bước build.
- Quy ước BizOn: VI/EN (nút đổi ngôn ngữ, đọc `bizon-lang`), chạy tốt ở 360–390 px, chạm ≥ 44 px, `type="button"`, `th scope`,
  không `div` trong `button`, `html-validate` 0 lỗi, có `<link rel="canonical">` nếu đưa vào sitemap.
- Hình: vẽ bằng CSS/SVG/canvas hoặc dùng ảnh có sẵn trong `assets/`; **không dùng emoji làm hình nhân vật hay vật thể**,
  không chép hình, tên hay màn của game có sẵn ngoài BizOn. Ảnh mới thì lưu tệp mới, không ghi đè ảnh gốc.
- Không nối Supabase trong bản thử (điểm lưu localStorage); không dữ liệu sinh viên thật.

## 4. Tự kiểm trước khi giao (khoảng 5 phút, không phải chấm độ vui)

- Mở bằng Playwright ở 390×844 và 1280×860: không lỗi JS, không trang trắng, không tràn ngang.
- Bấm thử luồng phút đầu (vào game → một lựa chọn → hết vòng 1): màn hình có đổi theo; chụp màn để trong scratchpad và tự xem
  so với brief (mỗi dòng brief: có / thiếu / hỏng).
- Một test nhỏ `test/<ten>.test.js` (mở trang, chơi vòng 1, không lỗi) để bản thử không hỏng âm thầm.
- Lỗi thì sửa một lượt rồi kiểm lại; còn hỏng thì ghi rõ «còn hỏng: ...» khi giao, không giấu.

## 5. Giao và quyết định

Nhánh `claude/<ten>`, PR nháp (tăng `CACHE` trong `sw.js` nếu thêm trang vào danh sách lưu sẵn). Gửi chị ảnh chụp + link
xem thử, mời chị (và thầy Tú hoặc vài sinh viên) chơi rồi chọn:
**TIẾP TỤC** (sang `/dac-ta` để làm thành game thật) · **ĐỔI HƯỚNG** (sửa brief, dựng lại) · **DỪNG** (đóng PR, giữ brief làm hồ sơ).
Chưa ai chơi thử thì kết luận là **CHƯA ĐÁNH GIÁ**. Ba lần ĐỔI HƯỚNG cùng một ý thì hỏi thẳng có nên dừng không.
Sau buổi chơi thử dùng `/playtest-report` ghi nhận xét; trước khi đổi tham số dùng `/balance-check`.
