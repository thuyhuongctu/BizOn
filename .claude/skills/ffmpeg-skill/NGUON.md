# Nguồn của skill ffmpeg-skill

Chép nguyên từ kho **kajisho5/ffmpeg-skill** (<https://github.com/kajisho5/ffmpeg-skill>), commit `2cb864c2af4c3d67623132a0ed2974e83619c023` (18/11/2026), © 2026 kajisho5, giấy phép **MIT** (toàn văn ở `LICENSE` cùng thư mục).

Chỉ lấy phần skill cần để chạy: `SKILL.md`, `scripts/`, `references/`, `templates/`. Không lấy tài liệu dài (`docs/`), ảnh thương hiệu, máy chủ MCP hay CI của kho gốc. Không sửa mã; muốn cập nhật thì chép lại bản mới và đổi commit ở đây.

Đã rà trước khi đưa vào kho (19/11/2026): mã Python chỉ dùng thư viện chuẩn, gọi ffmpeg/ffprobe trên máy bằng danh sách đối số (không qua shell), không gọi mạng và từ chối đường dẫn dạng URL; không tự tải mô hình (nhận dạng lời chỉ dùng công cụ đã cài sẵn nếu có).

Cách dùng trong BizOn: `python3 .claude/skills/ffmpeg-skill/scripts/<tên>.py --help`. Cần FFmpeg 6.1 trở lên và Python 3.10 trở lên. Ví dụ kiểm một video trước khi đăng Reels:
`python3 .claude/skills/ffmpeg-skill/scripts/check.py assets/video/ben-phu-sa-cay-beo-ve-tay-vi-720p.mp4 --platform reels`.
Quy tắc của kho vẫn áp dụng: không ghi đè video gốc, bản sửa lưu tệp mới có hậu tố `-v2`, `-v3`…

## Quy tắc BizOn khi sửa video (thêm 19/11/2026)

- Video đặt lên trang: MP4 H.264/AAC, có `+faststart` để điện thoại phát được ngay (`export.py --preset youtube` tự thêm).
- Âm lượng theo lệnh `video-ngan`: −14 đến −16 LUFS, đỉnh thật ≤ −1 dBTP: `loudness.py in.mp4 -I -15 --tp -1.5 -o in-v2.mp4`.
- Phụ đề trên trang là tệp `.vtt` riêng; chỉ đốt chữ vào hình khi chị yêu cầu.
- Sửa xong vẫn chạy `node scripts/kiem-video.mjs` như lệnh `video-ngan`.
- Gọi `scripts/*.py` không kèm `python3 -I`: chế độ cô lập làm hỏng import `_common`.
