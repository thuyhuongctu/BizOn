# Đặc tả tính năng: Video ngắn dọc 3D với nhân vật đất sét BizOn

**Nhánh**: `claude/video-ngan-3d` (thư mục đặc tả `004-video-ngan-3d`)

**Ngày tạo**: 2026-11-12

**Trạng thái**: **Đã dừng** ngày 12/11/2026. Chị xem video thử và quyết định bỏ vì hình chưa đạt («Bỏ video vì xấu»). Bộ dựng của PR 1 (#1076) đã gỡ khỏi kho; PR 2 và PR 3 không làm. Muốn xem lại mã thì lấy từ commit 9f982c91 trong lịch sử git.

**Đầu vào**: Chị gửi kho `thuann-vn/claude-3d-animated-shorts` (MIT). Em đề xuất học kỹ thuật dựng và render của kho
đó để làm video ngắn dọc 3D với nhân vật đất sét có sẵn của BizOn, và làm thử một video về sầu riêng. Chị trả lời
«Ok» ngày 12/11/2026. Chỉ học **kỹ thuật** (dựng cảnh three.js, render tất định từng khung bằng Chrome, kế hoạch cảnh
quay, phụ đề từng chữ). **Không** lấy phong cách nhân vật của kho đó (đầu trắng, mặt lạnh, mô phỏng một kênh YouTube),
không lấy mô hình Xbot hay đồ nội thất của kho đó vào video này.

## Hiện trạng (đo ngày 12/11/2026)

**Video ngắn hiện có của BizOn** (`assets/video/`): các trailer và video giới thiệu, đều khổ ngang. Riêng video sầu
riêng làm theo skill `video-ngan`:

| Hạng mục | Hiện trạng |
|---|---|
| Kịch bản | `docs/video/kich-ban-sau-rieng-ma-so-vung-trong.md` «Một trái sầu riêng, cả vùng cùng sầu»: 14 câu VI và 14 câu EN, 15 nguồn đã xác minh, mục «Chưa xác minh – không dùng», dòng «Trong BizOn» |
| Giọng đọc | Giọng tác giả đã thu: `assets/video/src/sau-rieng-ma-so/vi/01…14.mp3`, tổng 84,7 giây (câu ngắn nhất 3,8 giây, dài nhất 8,8 giây); có bản EN |
| Bộ dựng | `scripts/video/dung-sau-rieng.mjs` mở `scripts/video/sau-rieng/canh.html` trong Chromium (Playwright), vẽ **2D** từng khung (ảnh đất sét `assets/hc/durian/*.webp`, người là ảnh dựng đứng), ghép bằng ffmpeg |
| Thành phẩm | `sau-rieng-ma-so-vi.mp4`: **1920 × 1080 (ngang)**, 87,3 giây; bản 720p; poster; phụ đề `.vtt` VI/EN. Đang dùng làm video mở đầu ở `lab/ho-chieu-sau-rieng.html` |
| Kiểm thành phẩm | `scripts/kiem-video.mjs` (khung đen, khung hỏng, âm lượng, tờ khung hình) |

**Nhân vật 3D đất sét có sẵn** (`assets/models/nhan-vat/`, có xương, đo số clip trong tệp):

| Tệp | Cỡ | Clip động tác |
|---|---|---|
| `ceo-v3.glb`, `tu-v3.glb` | 2,3 MB mỗi tệp | Idle, Talk, Wave, Think, Cheer, Sit, Walk, Run |
| `ceo.glb`, `cfo.glb`, `cmo.glb`, `coo.glb`, `sec.glb`, `lumina.glb`, `tu.glb` | 1,0–1,1 MB | Idle, Talk, Walk |
| `dong-tac-v1.glb` | 0,1 MB | Wave, Cheer, Run (chỉ bộ xương và clip, ghép được cho các nhân vật trên) |

- Nhân vật đều mặc đồ công sở hoặc áo dài; **chưa có nhân vật nông dân** (anh Tư trong kịch bản là nhân vật minh họa).
- Bến BizOn đã có cảnh bến sông đất sét bằng three.js (`js/ben-bizon-canh.js`) và mô-đun nạp nhân vật (`bizon-characters.js`,
  thuộc hồ sơ quyền tác giả của Bật Nghiệp 3D: **chỉ đọc, không sửa**).
- **Chưa có** bộ dựng video 3D nào, chưa có video dọc 9:16 nào, chưa có phụ đề đốt vào hình.
- Trong hồ sơ kịch bản, mục «Chưa xác minh» ghi rõ: **không tìm thấy vụ có thật nào** trong đó «một mã sai làm cả
  container bị trả về». Tiêu đề chị nêu («container bị trả về chỉ vì một con số») vì thế chỉ dùng được nếu diễn đạt đúng
  sự thật đã có nguồn (câu 7: «Hai tuần, hàng trăm công-te-nơ bị trả lại», nguồn #6–#8).

## Làm rõ

### Phiên 12/11/2026 (chị chọn cả bốn phương án đề xuất)

1. **Kịch bản video thử?** → Dùng kịch bản có sẵn «Một trái sầu riêng, cả vùng cùng sầu» (đã kiểm nguồn, giọng đã thu).
   Không dùng tiêu đề «container bị trả về chỉ vì một con số» vì chưa có vụ có thật làm nguồn.
2. **Độ dài?** → Bản khoảng 45 giây: giữ câu **1, 3, 4, 7, 10, 12, 14** của kịch bản (tổng giọng thô 45,5 giây trước khi
   cắt khoảng lặng). Danh sách câu gửi chị duyệt lại trong PR của câu chuyện 2.
3. **Anh Tư?** → Dùng một nhân vật GLB có sẵn đủ động tác (`ceo-v3.glb` hoặc `tu-v3.glb`), đội **nón lá đất sét** dựng
   bằng khối 3D trong bộ dựng; không tạo mô hình mới, không tốn phí.
4. **Phụ đề?** → **Đốt chữ từng chữ** vào hình (câu chuyện 3 giữ nguyên) **và** xuất `.vtt` VI/EN.
5. **Giọng đọc?** (chị nhắn sau khi xem kế hoạch, 12/11/2026: «Giọng tôi sẽ chèn vào») → Lời đọc là **giọng của chị**,
   chị tự thu và chèn vào. Bộ dựng nhận một thư mục giọng (mỗi câu một tệp `NN.mp3` hoặc `NN.wav`) và **tự canh độ dài
   từng cảnh theo độ dài câu đọc**. Khi chưa có giọng mới, em dựng bản xem trước bằng giọng chị đã thu
   (`assets/video/src/sau-rieng-ma-so/vi/`); khi chị gửi giọng mới chỉ cần chạy lại một lệnh. Không tổng hợp giọng máy.

## Kịch bản người dùng và kiểm thử *(bắt buộc)*

### Câu chuyện 1 – Giảng viên có một bộ dựng video dọc 3D chạy trên máy (Ưu tiên: P1)

Giảng viên (hoặc em, theo yêu cầu của giảng viên) viết một **kế hoạch cảnh quay** bằng một tệp dữ liệu: các cảnh, mỗi
cảnh có thời lượng, nhân vật đất sét nào, đứng đâu, làm động tác gì, máy quay đi từ đâu đến đâu. Một lệnh duy nhất dựng
thành video dọc 1080 × 1920, 30 khung/giây, khớp từng khung với giọng đọc, không gọi dịch vụ tạo video AI nào và không
tốn phí theo clip.

**Vì sao ưu tiên này**: không có bộ dựng thì không có video nào. Bộ dựng dùng lại được cho mọi bài học sau.

**Cách thử độc lập**: dựng một cảnh thử 10 giây (hai nhân vật, một chuyển động máy quay) → có tệp mp4 đúng khổ, đúng
số khung, dựng hai lần cho ra cùng khung hình, qua `scripts/kiem-video.mjs` không lỗi.

**Kịch bản nghiệm thu**:

1. **Cho** một kế hoạch cảnh quay hợp lệ, **khi** chạy lệnh dựng, **thì** có tệp mp4 1080 × 1920, 30 khung/giây, dài đúng
   tổng thời lượng các cảnh (lệch ≤ 1 khung).
2. **Cho** cùng kế hoạch, **khi** dựng hai lần, **thì** khung hình ở cùng một mốc giống nhau (tất định, không phụ thuộc tốc
   độ máy).
3. **Cho** một cảnh có nhân vật đi hay vẫy tay, **khi** dựng, **thì** động tác lấy từ clip có sẵn trong tệp GLB (hoặc kho
   `dong-tac-v1.glb`), phát đúng nhịp theo thời gian của video, không theo đồng hồ máy.
4. **Cho** kế hoạch tham chiếu một nhân vật hay tệp không có, **khi** dựng, **thì** lệnh dừng với thông báo tiếng Việt
   chỉ rõ cảnh và tên sai, không ra video hỏng.
5. **Cho** mọi cảnh, **khi** dựng, **thì** không cảnh nào đứng hình quá 0,5 giây (máy quay luôn đẩy vào hoặc lia chầm
   chậm, theo skill `video-ngan` mục 4).

---

### Câu chuyện 2 – Video thử «Một trái sầu riêng, cả vùng cùng sầu» bản dọc 3D (Ưu tiên: P2)

Sinh viên xem trên điện thoại một video dọc khoảng 45 giây (7 câu: 1, 3, 4, 7, 10, 12, 14) về mã số vùng trồng sầu riêng: nhân vật đất sét 3D trong
cảnh vườn, nhà đóng gói, phòng kiểm nghiệm, cảng container; lời đọc là giọng tác giả đã thu; nội dung đúng các sự thật
đã có nguồn trong hồ sơ kịch bản. Giảng viên dùng làm video mở đầu buổi học về Hộ Chiếu Sầu Riêng.

**Vì sao ưu tiên này**: là bằng chứng bộ dựng dùng được cho bài học thật, và cho chị xem trước khi đầu tư thêm.

**Cách thử độc lập**: mở tệp mp4 thành phẩm trên điện thoại; chạy `scripts/kiem-video.mjs` → không lỗi; đối chiếu từng câu
lời đọc với bảng nguồn.

**Kịch bản nghiệm thu**:

1. **Cho** video thành phẩm, **khi** kiểm bằng `scripts/kiem-video.mjs`, **thì** không có lỗi (khung đen chen giữa, khung
   hỏng, tiếng vỡ); âm lượng −14 đến −16 LUFS, đỉnh thật ≤ −1 dBTP.
2. **Cho** mỗi câu lời đọc, **khi** đối chiếu, **thì** câu đó có trong kịch bản đã duyệt và có nguồn; không câu nào nói như
   sự thật điều nằm trong mục «Chưa xác minh».
3. **Cho** mỗi câu, **khi** xem, **thì** hình minh họa đúng câu đó (theo cột «Hình minh họa gợi ý»), nhân vật phản ứng 0–3
   khung trước chữ tương ứng.
4. **Cho** nhân vật trên hình, **khi** xem, **thì** là nhân vật đất sét của BizOn, không dùng nhân vật hay phong cách của kho
   tham khảo.

---

### Câu chuyện 3 – Phụ đề từng chữ cho khổ dọc (Ưu tiên: P3)

Người xem lướt mạng xã hội thường tắt tiếng. Video dọc có phụ đề hiện **từng chữ** theo giọng đọc, đặt ở vùng không che
mặt nhân vật và không bị giao diện ứng dụng che; vẫn xuất kèm tệp `.vtt` VI/EN như các video hiện có.

**Vì sao ưu tiên này**: khổ dọc trên mạng xã hội gần như bắt buộc có chữ; nhưng video vẫn dùng được trên trang web với
`.vtt` nếu chưa có phần này.

**Cách thử độc lập**: dựng lại video thử có bật phụ đề; chụp khung ở mốc từng chữ → chữ đang đọc được tô; không chữ nào
nằm ngoài vùng an toàn.

**Kịch bản nghiệm thu**:

1. **Cho** mốc thời gian từng từ, **khi** dựng, **thì** chữ đang đọc hiện đúng lúc (lệch ≤ 3 khung).
2. **Cho** khổ 1080 × 1920, **khi** dựng, **thì** phụ đề nằm trong vùng an toàn (cách mép trên 15 %, mép dưới 20 %).
3. **Cho** video thành phẩm, **khi** xuất, **thì** có kèm `.vi.vtt` và `.en.vtt` cùng mốc câu.

---

### Trường hợp biên

- Câu lời đọc dài hơn cảnh dự kiến: cảnh kéo dài theo giọng đọc, không cắt chữ.
- Máy không có GPU (máy đám mây, máy thử): dựng bằng SwiftShader, chậm hơn nhưng ra cùng khung hình.
- Mô hình GLB tải lỗi: dừng và báo, không thay bằng hình khác một cách âm thầm.
- Giảm chuyển động không áp dụng cho video (đã dựng sẵn); nhưng không có cảnh nhấp nháy nhanh (> 3 lần/giây).

## Yêu cầu *(bắt buộc)*

### Yêu cầu chức năng

- **FR-001**: Bộ dựng nhận một kế hoạch cảnh quay (tệp dữ liệu) và giọng đọc; xuất mp4 1080 × 1920, 30 khung/giây, H.264,
  âm thanh AAC.
- **FR-002**: Khung hình tất định: thời gian của cảnh, động tác và máy quay tính theo số khung, không theo đồng hồ máy.
- **FR-003**: Nhân vật là các tệp GLB đất sét có sẵn trong `assets/models/nhan-vat/`; động tác lấy từ clip trong tệp hoặc
  `dong-tac-v1.glb`.
- **FR-004**: Mỗi cảnh có ít nhất một chuyển động máy quay (đẩy vào, lia, nâng); cắt cứng khi đổi chỗ lớn.
- **FR-005**: Lời đọc chỉ dùng câu đã có trong kịch bản đã duyệt (video thử: câu 1, 3, 4, 7, 10, 12, 14) và là giọng của
  chị; bộ dựng nhận thư mục giọng qua tham số `--giong <thư mục>`, mặc định là giọng đã thu; không tổng hợp giọng máy.
- **FR-012**: Anh Tư là nhân vật GLB có sẵn đội nón lá đất sét dựng bằng khối 3D trong bộ dựng (không sửa tệp GLB gốc).
- **FR-006**: Thành phẩm qua `scripts/kiem-video.mjs` không lỗi; âm lượng −14 đến −16 LUFS, đỉnh thật ≤ −1 dBTP.
- **FR-007**: Xuất kèm poster (jpg, webp) và phụ đề `.vtt` VI/EN.
- **FR-008**: Không sửa tệp thuộc hồ sơ quyền tác giả (Bật Nghiệp 3D, Bến Phù Sa 3D, Hộ Chiếu Thương Hiệu 3D và JS của
  chúng, `bizon-characters.js`); bộ dựng chỉ đọc tài sản dùng chung.
- **FR-009**: Không chép mã, mô hình, đồ nội thất hay phong cách nhân vật của kho tham khảo; nếu học thuật toán nào thì ghi
  nguồn (MIT) trong `THIRD-PARTY-NOTICES.md`.
- **FR-010**: Trang web không đổi trong PR của câu chuyện 1 (bộ dựng là công cụ trong `scripts/`, không chạy trên trang).
- **FR-011**: Phụ đề từng chữ (câu chuyện 3) nằm trong vùng an toàn của khổ dọc và khớp mốc từng từ.

### Thực thể chính

- **Kế hoạch cảnh quay**: danh sách cảnh; mỗi cảnh có số câu lời đọc, thời lượng, bối cảnh, các nhân vật (tệp GLB, vị trí,
  hướng, động tác, mốc bắt đầu), máy quay (điểm đầu, điểm cuối, tiêu cự, kiểu chuyển động).
- **Mốc lời đọc**: thời điểm bắt đầu, kết thúc của từng câu (và từng từ cho câu chuyện 3).
- **Thành phẩm**: mp4, bản 720p, poster, `.vtt`.

## Tiêu chí thành công *(bắt buộc)*

- **SC-001**: Dựng một video 45 giây trên máy đám mây (không GPU) trong ≤ 30 phút, không tốn phí dịch vụ nào.
- **SC-002**: Dựng lại cùng kế hoạch cho ra khung hình giống hệt (so 5 mốc ngẫu nhiên, khác biệt điểm ảnh = 0).
- **SC-003**: Video thử qua `scripts/kiem-video.mjs` với 0 lỗi; 100 % câu lời đọc có nguồn.
- **SC-004**: Chị xem bản thử và chấm «dùng được cho buổi học» (đánh giá của người, không tự động).

## Gắn với chuẩn đầu ra

Hồ sơ kịch bản ghi: `docs/chuan-dau-ra-va-rubric.md` chưa có mã chuẩn đầu ra riêng cho Hộ Chiếu Sầu Riêng; mã gần nhất là
**BP-4** (phân tích đánh đổi chuẩn hóa – thích nghi). Video là học liệu mở đầu buổi học, không chấm điểm, không thay
rubric của game.

## Giả định

- Video thử là bản **tiếng Việt**; bản tiếng Anh (giọng EN đã thu) để sau.
- Video thử chưa đưa lên trang web trong đặc tả này; chị xem tệp trước rồi mới quyết đặt ở đâu.
- Cảnh nền (vườn, nhà đóng gói, cảng) dựng bằng khối 3D đơn giản kiểu đất sét và ảnh đất sét có sẵn `assets/hc/durian/*.webp`
  làm phông; không tạo ảnh hay mô hình mới bằng dịch vụ trả phí khi chưa hỏi chị.
- Máy dựng là máy đám mây của Claude Code hoặc máy của chị (Node 22, Chromium của Playwright, ffmpeg đều đã có).
