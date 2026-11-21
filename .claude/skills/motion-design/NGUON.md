# Nguồn của skill motion-design

Chép từ kho **LottieFiles/motion-design-skill** (<https://github.com/LottieFiles/motion-design-skill>), commit `d77a9fc8cb371cab1ba5420df5bfd232cd14c9bb` (19/11/2026), © 2025 LottieFiles, giấy phép **MIT** (toàn văn ở `LICENSE` cùng thư mục).

Lấy nguyên thư mục `skills/motion-design/` của kho gốc: `SKILL.md`, `director/`, `patterns/`, `reference/`. Chỗ duy nhất sửa trong tệp gốc: thêm một khối ghi chú «BizOn» ngay sau phần đầu của `SKILL.md`, trỏ tới tệp này. Muốn cập nhật thì chép lại bản mới, giữ khối ghi chú và đổi commit ở đây.

Đã rà trước khi đưa vào kho (19/11/2026): skill chỉ gồm tệp Markdown hướng dẫn, không có script, không gọi mạng.

## Quy tắc BizOn khi làm chuyển động (thêm 19/11/2026)

Quy tắc ở đây thắng phần hướng dẫn chung của skill khi hai bên khác nhau.

- **Không dùng Creator MCP hay dịch vụ xuất tệp bên ngoài** mà skill gợi ý (mục «Rendered File Exports» và `reference/export-and-render.md`). Cần tệp MP4 hay GIF thì dùng công cụ có sẵn trong kho: skill `ffmpeg-skill`, `video-ngan`, `huashu-design` (nhánh HyperFrames) và `scripts/kiem-video.mjs`. Không tải ảnh, video hay mã của BizOn lên dịch vụ ngoài.
- **Giảm chuyển động là bắt buộc.** Mọi animation mới có nhánh `@media (prefers-reduced-motion: reduce)`: tắt chuyển động trang trí và lặp vô hạn, giữ lại thay đổi trạng thái tức thì (hiện ngay cảnh cuối). Trong three.js đọc `matchMedia('(prefers-reduced-motion: reduce)')` và bỏ qua phần nảy, rung, hạt.
- **Điện thoại trước.** Chỉ animate `transform` và `opacity` (không animate `width`, `height`, `top`, `left`, `box-shadow` lớn) để máy yếu không giật. Không quá 3 thứ chuyển động cùng lúc trên một màn 360–390 px.
- **Cảm giác đất sét.** Vật thể đất sét có quán tính: vào cảnh bằng easing ra mềm có nảy nhẹ (ví dụ `cubic-bezier(.34,1.56,.64,1)` cho phần tử nhỏ, vượt đích không quá ~10 %), ra khỏi cảnh nhanh và không nảy (`cubic-bezier(.4,0,1,1)`). Tránh chuyển động tuyến tính đều tăm tắp, trừ vòng quay liên tục.
- **Thời lượng gợi ý cho BizOn:** phản hồi bấm nút 100–150 ms; mở thẻ, ngăn kéo 200–300 ms; chuyển màn 300–450 ms; cảnh kể chuyện trong game (cắm cờ, công bố kết quả) 1,5–3,5 giây và luôn có cách bỏ qua. Lặp vô hạn (trôi nổi, thở) chậm, biên độ nhỏ (vài px), chu kỳ ≥ 4 giây.
- **Chuyển động phục vụ việc học.** Animation phải giúp người chơi hiểu điều vừa xảy ra (số tiền tăng, đội nào thắng vòng, vì sao bị phạt), không che số liệu hay câu chữ lâu hơn cần thiết. Không dùng chuyển động nhấp nháy nhanh (> 3 lần mỗi giây).
- **Không sửa tệp trong hồ sơ quyền tác giả** (`js/engine.js`, `js/app.js`, `js/backend.js`); với `BizOn Game 3D.html` chỉ đổi phần trình bày.
- **Kiểm trước khi gộp:** có test kiểm nhánh giảm chuyển động (Playwright `reducedMotion: 'reduce'`), html-validate 0 lỗi, không tràn ngang ở 360–390 px.
