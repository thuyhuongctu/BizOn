---
name: video-ngan
description: "Viết kịch bản và lên kế hoạch một video ngắn 45–70 giây giải thích MỘT bài học kinh doanh quốc tế gắn với game BizOn (ví dụ «Một container sầu riêng bị trả về chỉ vì một con số»), theo công thức móc câu → leo thang → «Bạn thấy đấy» → cú lật; rồi kiểm video thành phẩm bằng scripts/kiem-video.mjs. Dùng khi chị muốn làm video ngắn, trailer, video mạng xã hội hay video mở đầu buổi học."
argument-hint: "[chủ đề hoặc game] [vi|en] [doc|ngang]"
user-invocable: true
---

<!-- Công thức kịch bản và quy trình kiểm phỏng theo «Claude Animated Shorts» (Mr omi, giấy phép MIT – xem THIRD-PARTY-NOTICES.md mục 6),
     Việt hóa và chỉnh cho video dạy học của BizOn. Không dùng ảnh tham khảo hay bộ dựng Remotion của kho đó. -->

# Video ngắn một bài học

Trả lời bằng tiếng Việt, xưng «em», gọi chị. Mỗi bước xong thì dừng cho chị duyệt; **kịch bản phải được chị duyệt trước khi
làm lời đọc hay hình**. Câu chuyện, nhân vật và giọng luôn là **của BizOn**: không chép kịch bản, nhân vật hay cảnh của kênh khác.

## 1. Chủ đề và sự thật

- Chọn **một** chuyện có thật, bất ngờ, có nhân–quả nhìn thấy được, nối thẳng với một quyết định trong game BizOn
  (Bật Nghiệp, Bến Phù Sa, Hộ Chiếu Thương Hiệu, Hộ Chiếu Sầu Riêng, Nhà máy FDI) và một chuẩn đầu ra
  (`docs/chuan-dau-ra-va-rubric.md`).
- Ghi **sự thật kèm nguồn** ở đầu kịch bản (văn bản pháp quy, số liệu hải quan, báo chính thống, bài báo khoa học).
  Không có nguồn thì không đưa vào. Con số trong game là **chỉ số mô phỏng**, không được nói như số thật.
- Tìm **một ví dụ đời thường** giải thích được cơ chế (cái xích đu, nồi cơm, hàng quán đầu hẻm…).
- Thận trọng: tôn giáo, chính trị, bản đồ chủ quyền, cờ (cờ đỏ sao vàng chỉ dùng khi đúng là Việt Nam), tên doanh nghiệp thật
  bị nói xấu, thương hiệu của người khác.

## 2. Kịch bản (45–70 giây)

Tốc độ đọc tiếng Việt khoảng **4,5–5,5 âm tiết/giây** (tiếng Anh ~3,7 từ/giây) → 220–380 âm tiết. Câu ngắn, văn nói, không thuật ngữ
trừ khi giải thích ngay câu sau. Khung nhịp:

1. **Móc câu** – nghịch lý nói như sự thật, câu đầu tiên, không rào đón
   («Một container sầu riêng hai tỷ đồng bị trả về chỉ vì một dãy số trên nhãn.»).
2. **Bối cảnh** – một hai câu: năm, nơi, một con người cụ thể, con số.
3. **Leo thang** – 3–4 nhịp, mỗi nhịp lớn hơn; có thể có một câu thoại ngắn của nhân vật.
4. **Điểm vỡ** – khoảnh khắc mọi thứ hỏng.
5. **Câu kép tỉnh bơ** (nếu hợp) – «May mà … / Không may là …».
6. **«Bạn thấy đấy,»** – một ý cơ chế, giải thích bằng ví dụ đời thường. Đây là chỗ bài học kinh doanh nằm.
7. **Hệ quả** – luật, quy trình hay thói quen mới sinh ra từ chuyện này.
8. **Cú lật gọi lại** – một hai câu cuối nối về câu mở đầu; video kết ở chữ cuối cùng.

Quy tắc: không tả lại điều người xem đang thấy trên hình; mỗi câu phải minh họa được bằng một hình cụ thể; câu đùa phải là
**sự thật có nguồn**. Thêm một dòng **«Trong BizOn»** ở cuối kịch bản (không đọc) ghi game, màn và quyết định tương ứng để giảng viên
dùng video mở đầu buổi học hay debrief.

Lưu kịch bản ở `docs/video/kich-ban-[chu-de].md` (hỏi chị trước khi ghi): bảng nguồn, lời đọc, cột hình cho từng câu.

## 3. Lời đọc

- Một giọng, một nhịp, gần như không ngắt quãng dài (khoảng lặng giữa câu ≤ 0,3 s). Giọng nhân bản của hai tác giả chỉ dùng
  theo `THIRD-PARTY-NOTICES.md` mục 7.
- Bản tiếng Anh có tên riêng tiếng Việt: làm như `docs/video/trailer-bat-nghiep-loi-doc.md` (đọc tên trong câu đệm tiếng Việt,
  nghe lại bằng Whisper, **người nghe lại trước khi phát hành**).
- Lấy mốc thời gian từng từ (speech-to-text có word timestamps), sửa tay. Mọi cử động trên hình canh theo mốc này:
  phản ứng trên hình đến **0–3 khung trước** chữ tương ứng.

## 4. Hình

Ưu tiên tài sản sẵn có của BizOn (ảnh đất sét, sa bàn, cảnh 3D, nhân vật) và quay màn hình game thật. Ảnh mới thì lưu tệp mới
(`-v2`, `-v3`…), không ghi đè ảnh gốc; ảnh tạo bằng AI ghi vào `THIRD-PARTY-NOTICES.md` mục 7.

- Khổ: dọc 1080×1920 cho mạng xã hội, ngang 1920×1080 cho trang web và máy chiếu; 30 khung/giây.
- Máy quay: cắt cứng khi đổi chỗ lớn; còn lại lia mượt 18–40 khung; **cảnh giữ yên luôn đẩy vào chầm chậm** (không để hình đứng
  quá vài khung, trừ màn chữ); rung nhẹ tắt dần trong ~7 khung khi có va chạm.
- Phụ đề: dùng tệp `.vtt` VI/EN như các video hiện có (`docs/video/phu-de.md`), không đốt chữ vào hình trừ khi chị muốn.

## 5. Âm thanh

- Nhạc và tiếng động phải là của BizOn hoặc có giấy phép rõ; nhạc **hạ xuống khi có lời** (khoảng −3 dB), nền nhạc thấp hơn lời
  khoảng 10 dB.
- Thành phẩm: **−14 đến −16 LUFS**, đỉnh thật **≤ −1 dBTP**, tiếng và hình dài bằng nhau.
  Mẫu: `ffmpeg -i in.mp4 -af loudnorm=I=-15:TP=-1.5:LRA=7 -c:v copy out.mp4`.

## 6. Kiểm thành phẩm (bắt buộc trước khi đưa lên trang)

```
node scripts/kiem-video.mjs assets/video/<tệp>.mp4 --out <scratchpad>/kiem/<tệp> --sheets
```

- **Lỗi** (mã thoát 1) phải sửa: khung đen chen giữa, khung hỏng một hình (thường do quay màn hình), tiếng vỡ (> 0 dBTP),
  tiếng và hình lệch nhau.
- **Lưu ý** thì đọc và quyết: độ to lệch chuẩn, đỉnh thật > −1 dBTP, khoảng im dài, đứng hình ≥ 3 s, chớp trắng.
  Chớp trắng hay chuyển cảnh cố ý thì khai bằng `--planned a-b,c-d`.
- Mở các tấm ghép (`tam-ghep-*.jpg`, mỗi ô 0,5 s) xem nhanh cả video; gửi chị 2–3 tấm tiêu biểu.

## 7. Đưa lên trang

Theo quy ước của kho: video MP4 H.264 + AAC, faststart; trang chủ dùng bản `-720p` (CRF 24, AAC 112k, xem `test/trailers-720p.test.js`), tệp gốc giữ nguyên; ảnh poster `.webp` + `.jpg`, phụ đề VI/EN, ghi nguồn gốc
vào `THIRD-PARTY-NOTICES.md` mục 7, nhánh riêng, PR nháp, tăng `CACHE` trong `sw.js`, có test giữ đường dẫn video và phụ đề.
