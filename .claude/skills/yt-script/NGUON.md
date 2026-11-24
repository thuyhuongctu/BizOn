# Nguồn bộ skill YouTube (yt-*)

- Kho gốc: https://github.com/Jakeschincariol/youtube-agent-skill
- Commit chép: `a2feb2104981a375ffd4f87ee04f4f5344ac43c6` (16/9/2026)
- Giấy phép: MIT, © 2026 Jake Schincariol (toàn văn: `LICENSE` trong thư mục này).
- Ngày chép vào BizOn: 24/11/2026.
- Đã chép: 11 thư mục `skills/yt-*` (SKILL.md, công cụ Python, `hooks.json`) và `templates/voice.md` (đổi tên `voice-template.md`).
  Không chép `.claude-plugin/`, `README.md`.
- Thay đổi duy nhất: bước 1 «Before you write» ở 6 skill đọc thêm `docs/youtube/giong-kenh.md` (hồ sơ giọng kênh của BizOn,
  nằm trong kho) trước `~/.claude/youtube/voice.md`, vì máy đám mây mất thư mục `~` sau mỗi phiên.
- Đã đọc toàn bộ trước khi chép: công cụ Python chỉ dùng thư viện chuẩn, chỉ đọc tệp do người dùng đưa vào, không gọi mạng,
  không ghi tệp. Skill không đăng video, không đăng nhập YouTube.
- Giới hạn khi dùng cho tiếng Việt: `title.py` và `hookscore.py` được hiệu chỉnh cho tiếng Anh. Kiểm độ dài (40/60 ký tự) vẫn đúng;
  kiểm «trùng chữ» và điểm câu mở đầu với câu tiếng Việt chỉ để tham khảo (tách từ có dấu chưa đúng).
