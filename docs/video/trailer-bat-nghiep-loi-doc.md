# Trailer Bật Nghiệp · lời đọc tiếng Anh (bản v3, 27/10/2026)

Tệp: `assets/video/bizon-trailer-v3.mp4` (90 s, 1920×1080, H.264 level 4.0, AAC stereo 48 kHz). Hình **giữ nguyên** bản v2;
chỉ thay lời đọc. Bản v2 (`bizon-trailer-v2.mp4`) giữ nguyên trong kho.

## Vì sao làm lại
Lời đọc bản v2 phát âm sai tên riêng tiếng Việt (nghe bằng Whisper): «Bật Nghiệp» → «Bajnip», «Cần Thơ» → «Thunder»,
«Khánh Hòa» → «Khen Ho», «Thanh Hóa» → «Than Ho», «Hương» → «Hung»; câu sáu tỉnh thiếu **Hà Nội** dù bản đồ trên hình có đủ sáu cờ.

## Cách làm
1. Tách tiếng nói khỏi nhạc nền của bản v2 bằng Demucs (htdemucs, `--two-stems=vocals`) → giữ nguyên **nhạc nền gốc**.
2. Đọc lại toàn bộ lời bằng giọng thần kinh `en-US-AvaMultilingualNeural` (Microsoft, qua dịch vụ đọc của Edge), cùng giờ bắt đầu
   từng câu như bản gốc. Mỗi **tên riêng tiếng Việt** (in đậm bên dưới) được chính giọng đó đọc **trong một câu đệm tiếng Việt**
   (ví dụ «Chúng tôi đến Đà Nẵng hôm qua.») rồi cắt đúng từ theo mốc WordBoundary và ghép vào câu tiếng Anh, để tên được đọc theo
   âm tiếng Việt mà giọng không đổi. Câu đệm của từng tên được chọn bằng cách cho Whisper medium nghe lại và giữ câu nghe đúng tên.
3. Cân độ to giọng mới bằng giọng cũ (LUFS tích hợp), trộn với nhạc nền, ghép với hình bản v2 (không mã hoá lại hình).
   Tổng độ to: v2 −11,1 LUFS, v3 −11,2 LUFS.

Kiểm bằng Whisper medium (tiếng Việt) trên đoạn sáu tỉnh của bản v3: «Cần Thơ, Hồ Chí Minh City, Khánh Hòa, Đà Nẵng, Thanh Hóa,
and finally Hà Nội». Máy nhận dạng không thay được tai người: nghe lại trước khi phát hành.

## Lời đọc

| Bắt đầu (s) | Lời |
|---|---|
| 0.20 | BizOn **Bật Nghiệp**. A 3D clay business simulation. |
| 5.40 | Welcome to the clay HQ in **Cần Thơ**. |
| 8.36 | Tap a department or a teammate to get to work. |
| 13.96 | Meet your team. |
| 25.00 | At the CEO's decision table, |
| 26.92 | drag the clay knobs for price, marketing and output. |
| 30.42 | Meet as a team, then commit. |
| 35.02 | Three AI rivals push back, |
| 37.02 | and market events shake things up. |
| 39.02 | Keep your margin and stay profitable. |
| 43.98 | Win the top market share with a profit, |
| 46.36 | and your flag goes up. |
| 47.92 | Six rounds: |
| 49.12 | **Cần Thơ**, **Hồ Chí Minh** City, **Khánh Hòa**, **Đà Nẵng**, **Thanh Hóa**, and finally **Hà Nội**. |
| 55.40 | Chat with Lumina AI, your mentor **Hương**, |
| 58.38 | for what-if advice, and let **Rồng Xanh** check your numbers. |
| 63.96 | Between rounds, play Clay Factory Frenzy, |
| 67.34 | visit the shop, grow your skill tree and complete missions. |
| 71.92 | Data tells us the past; |
| 73.76 | today's decisions write the future. |
| 79.88 | Finish the season, lift the trophy and earn your certificate. |
| 83.68 | BizOn **Bật Nghiệp**. Play the 3D HQ today. |

## Nguồn và quyền
- Hình, kịch bản, nhạc nền: của trailer gốc BizOn.
- Giọng đọc: tổng hợp bằng giọng thần kinh của Microsoft qua dịch vụ đọc của trình duyệt Edge. Đây là nội dung có công cụ AI
  tham gia (xem `THIRD-PARTY-NOTICES.md` Mục 7). Điều khoản dùng dịch vụ đọc của Edge cho sản phẩm phát hành chưa được rà; nếu
  cần chắc chắn về quyền, thu lại lời bằng giọng thật (thu âm) hoặc dùng Azure AI Speech có hợp đồng, theo đúng kịch bản trên.
