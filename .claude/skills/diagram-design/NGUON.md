# Nguồn của skill diagram-design

Chép từ kho **cathrynlavery/diagram-design** (<https://github.com/cathrynlavery/diagram-design>), commit `d74d8c2d0c78a9e1efd43137f6a9a51182a8b5f0` (19/11/2026), © 2025 Cathryn Lavery, giấy phép **MIT** (toàn văn ở `LICENSE` cùng thư mục). Biểu tượng đi kèm lấy từ Tabler Icons (MIT), Simple Icons (CC0), log-z/logos (MIT) và Devicon (MIT), ghi ở `THIRD_PARTY_LICENSES.md`.

Chỉ lấy phần skill cần để vẽ: `SKILL.md`, `references/`, `scripts/` và 7 tệp khuôn trong `assets/` (`template*.html`, `icons.html`, `index.html`). **Không** lấy khoảng 200 tệp ví dụ `assets/example-*.html` (gần 5 MB) để kho nhẹ; khi `SKILL.md` hay `references/` nhắc tới một tệp ví dụ, xem ở kho gốc. Không lấy `docs/`, `prompts/`, `commands/`, ảnh minh họa hay CI của kho gốc.

Chỗ duy nhất sửa trong tệp gốc: thêm một khối ghi chú «BizOn» ngay sau phần đầu của `SKILL.md`, trỏ tới tệp này. Muốn cập nhật thì chép lại bản mới, giữ khối ghi chú và đổi commit ở đây.

Đã rà trước khi đưa vào kho (19/11/2026): các script Python (`scripts/`) chỉ đọc và ghi tệp trên máy, không gọi mạng, không chạy lệnh qua shell. Các khuôn HTML gốc nạp phông từ Google Fonts; trong BizOn thì không dùng đường đó (xem quy tắc bên dưới).

## Quy tắc BizOn khi vẽ sơ đồ (thêm 19/11/2026)

- **Phông:** dùng chế độ phông `system` của skill (không có `<link>` tới `fonts.googleapis.com`). Sơ đồ đặt trong trang BizOn thì dùng phông tự lưu trữ của kho: nạp `css/bizon-clay-fonts.css`, chữ thường `'Be Vietnam Pro', system-ui, sans-serif`, tiêu đề `'Plus Jakarta Sans', system-ui, sans-serif`, chữ kỹ thuật `'IBM Plex Mono', ui-monospace, monospace`. Instrument Serif và Geist không có đủ dấu tiếng Việt nên không dùng. Kiểm bằng `python3 .claude/skills/diagram-design/scripts/self_check.py --offline <tệp>`.
- **Màu:** theo bảng đất sét trong `css/bizon-clay.css`: nền `#FBF4E8`, thẻ `#FFFBF4`, mực `#033337`, chữ phụ `#3E5A5C`, nét chính `#006687`. Giữ **một màu nhấn** cho đúng một thứ cần mắt người xem dừng lại (đường găng, bước quan trọng, kết luận): cam `#E8762D` (chữ trên nền cam dùng `#033337` hoặc trắng cỡ lớn). Hai màu nền phụ nhạt `--clay-c1`…`--clay-c5` chỉ để phân nhóm, không để nhấn. Tương phản chữ ≥ 4,5.
- **Song ngữ:** sơ đồ trên trang có bản VI và EN. Chữ trong SVG đặt trong `<text>` có `data-en="…"` để `js/bizon-clay-i18n.js` đổi; hoặc làm hai tệp `-vi`, `-en`. Tên riêng tiếng Việt (Bến Phù Sa, Cần Thơ, Bật Nghiệp) giữ nguyên trong bản EN.
- **Nơi lưu:** sơ đồ cho trang web để dưới `assets/so-do/` (SVG hoặc HTML tự chứa); sơ đồ cho tài liệu nội bộ để cạnh tài liệu trong `docs/`. Không ghi đè sơ đồ đã đăng: bản sửa lưu tệp mới có hậu tố `-v2`, `-v3`… rồi đổi đường dẫn.
- **Kiểm trước khi gộp:** trang có sơ đồ phải qua `npx --yes html-validate@8.24.1 <tệp>` với 0 lỗi, không tràn ngang ở 360–390 px (SVG có `viewBox`, `width="100%"`, chữ ≥ 12 px khi thu nhỏ), có `role="img"` và `<title>`/`aria-label` mô tả nội dung.
- **Nội dung:** chỉ vẽ điều có thật trong game hay trong dữ liệu đã công bố; số liệu ghi nguồn. Không đưa tên, email hay mã số sinh viên vào sơ đồ.
