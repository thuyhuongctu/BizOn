# Đặc tả tính năng: Bến BizOn – bảng nhiệm vụ và điều khiển trên điện thoại

**Nhánh**: `claude/ben-bizon-nhiem-vu` (thư mục đặc tả `003-ben-bizon-nhiem-vu`)

**Ngày tạo**: 2026-11-11

**Trạng thái**: Bản nháp, chờ chị trả lời phần làm rõ

**Đầu vào**: Chị gửi hai video quay một game khám phá thành phố 3D (tác giả Hoàng Phan, Nha Trang) và nói «Bạn tham
khảo thêm các video này». Em đề xuất học hai cơ chế: **(1) bảng nhiệm vụ** có danh sách việc tích ô và «việc tiếp
theo», **(5) điều khiển trên điện thoại**. Chị trả lời ngày 11/11/2026: «2 theo đề xuất». Chỉ học **cơ chế**; không
chép giao diện, tên, hình hay bối cảnh của game đó; giữ phong cách đất nặn, tranh gốc và bến sông miền Tây của BizOn.

## Hiện trạng (đo ngày 11/11/2026)

**Mẫu tham khảo (hai video, 68 giây và 132 giây):** góc trái trên có bản đồ tròn, giờ và thời tiết, thanh năng lượng;
dưới đó là bảng nhiệm vụ: tên điểm đến, «Hành trình 1/3 · Quan sát 0/8», mục «Tiếp theo: Trả lời câu hỏi 1/6» và nút
«Xem nhiệm vụ». Tới một công trình thì bảng đổi thành danh sách tích ô (trả lời câu hỏi 0/6, tìm chi tiết đặc trưng 0/7,
chụp ảnh lưu niệm 0/1). Điện thoại: cần gạt ảo tròn ở góc trái dưới; góc phải dưới có nút đổi đi bộ/chạy, nút chụp
ảnh, nút góc nhìn. Phía trên có ví tiền, mảnh ghép sưu tập, sổ tay, bản đồ.

**Bến BizOn hiện nay** (`hub-3d.html`, đo bằng Playwright, chọn vai CEO, sau khi cảnh tải xong):

| Khổ | Khung 3D | Nút đang có (vị trí, cỡ px) | Bảng nhiệm vụ |
|---|---|---|---|
| iPhone 13 (390 × 664) | toàn màn hình 390 × 664 | «✕ Thoát» trái trên 75 × 46; «🎥 Góc nhìn» trái trên 106 × 44; «🧭 Đi tới…» phải trên 111 × 46; cần gạt trái dưới 116 × 116 | Không có |
| Pixel 7 (412 × 839) | toàn màn hình 412 × 839 | như trên; cần gạt ở y = 705 | Không có |
| Máy tính (1280 × 800) | toàn màn hình | «Thoát», «Góc nhìn», «Đi tới…»; không có cần gạt (dùng WASD, mũi tên, Shift) | Không có |

- Không tràn ngang ở cả ba khổ.
- **Chạy hay đi**: chỉ có cách đẩy cần gạt hết cỡ (hoặc thả Shift trên máy tính) là chạy, đẩy nhẹ là đi
  (`js/di-chuyen-3d.js`, ngưỡng 0,75). Không có nút chạy/đi riêng, người dùng điện thoại không biết có hai nhịp.
- **Góc nhìn**: nút «Góc nhìn» ở góc **trái trên**, xa tay phải cầm máy.
- Bến có **11 điểm**: 6 điểm game (Hành trình 3 bậc, Bến Phù Sa, Hộ Chiếu Thương Hiệu, Bật Nghiệp, Hộ Chiếu Sầu
  Riêng, BizOn Arcade), 2 cố vấn (Lumina, thầy Tu Phan), Máy hát, Bảng tin, Bảng thành tích.
- Đã có ghi nhớ trên máy: game nào đã ghé (Bảng thành tích đọc lại), vai đã chọn, góc nhìn đã chọn. Chưa có gì
  cho biết người mới **nên làm gì trước**: lời nhắc duy nhất là dòng «Kéo để đi · tới gần rồi nhấn Enter» lúc đầu.

## Làm rõ

*(Chờ chị trả lời; xem các câu hỏi ở cuối thư em gửi kèm. Chỗ chưa rõ đang đánh dấu `[CẦN LÀM RÕ]`.)*

**Thuật ngữ**: «nhiệm vụ» là một nhóm việc nhỏ có tên; «việc» là một dòng tích ô trong nhiệm vụ; «việc tiếp theo» là
việc đầu tiên chưa xong của nhiệm vụ đang theo.

## Kịch bản người dùng và kiểm thử *(bắt buộc)*

### Câu chuyện 1 – Người mới vào bến biết phải làm gì: nhiệm vụ «Làm quen Bến BizOn» (Ưu tiên: P1)

Sinh viên mở Bến BizOn lần đầu trong giờ học. Góc trái trên hiện bảng nhiệm vụ «Làm quen Bến BizOn» với vài việc tích
ô (ví dụ: hỏi đường Lumina, đọc Bảng tin, ghé một bậc game, hỏi thầy Tu Phan, xem Bảng thành tích)
`[CẦN LÀM RÕ: danh sách việc chính thức]`. Bảng luôn ghi «việc tiếp theo» và tiến độ (ví dụ 2/5), kèm nút «Dẫn
đường» đưa tới đúng điểm của việc đó (dùng lối tắt «Đi tới…» đã có). Làm xong việc nào thì dòng đó được tích; xong
cả nhiệm vụ thì hiện lời chúc và gợi ý bước kế tiếp là vào Bậc 1 (Bến Phù Sa).

**Vì sao P1**: trả lời đúng điều giờ học cần nhất: người mới vào biết làm gì trong vài phút đầu, giảng viên không phải
hướng dẫn từng người. Tự nó đã dùng được, không cần câu chuyện 2 hay 3.

**Cách thử độc lập**: xóa dữ liệu trang, mở Bến BizOn ở 390 px, làm lần lượt từng việc theo «việc tiếp theo» → mỗi
việc được tích, tiến độ tăng, cuối cùng hiện lời chúc; tải lại trang thì tiến độ vẫn còn.

**Kịch bản chấp nhận**:

1. **Cho** sinh viên lần đầu vào bến (chưa có tiến độ), **khi** chọn xong nhân vật, **thì** bảng nhiệm vụ hiện ở góc
   trái trên với tên nhiệm vụ, tiến độ «0/N» và «việc tiếp theo».
2. **Cho** «việc tiếp theo» là «Hỏi đường Lumina», **khi** bấm «Dẫn đường», **thì** nhân vật được đưa tới chỗ Lumina và
   hiện thẻ «Hỏi» của Lumina (như lối tắt «Đi tới…»).
3. **Cho** sinh viên mở hội thoại với Lumina, **khi** hội thoại mở, **thì** việc đó được tích, tiến độ tăng 1, «việc
   tiếp theo» chuyển sang việc chưa xong kế tiếp.
4. **Cho** sinh viên làm các việc không theo thứ tự (ví dụ đọc Bảng tin trước), **khi** làm xong, **thì** việc đó vẫn
   được tích; «việc tiếp theo» luôn là việc chưa xong đầu tiên trong danh sách.
5. **Cho** sinh viên đã làm 2 việc, **khi** tải lại trang hay mở lại hôm sau trên cùng máy, **thì** 2 việc đó vẫn đã tích.
6. **Cho** sinh viên làm xong việc cuối, **khi** việc được tích, **thì** hiện lời chúc ngắn và nút đi tới Bến Phù Sa;
   bảng thu gọn thành một dòng «Đã xong · Làm quen Bến BizOn» và không che màn hình nữa.
7. **Cho** bảng đang mở trên điện thoại, **khi** bấm nút thu gọn, **thì** bảng chỉ còn một dòng (tên và tiến độ);
   bấm lại thì mở ra; trạng thái mở/gọn được nhớ.
8. **Cho** người dùng bật đổi ngôn ngữ VI/EN, **khi** đổi, **thì** bảng nhiệm vụ đổi theo ngôn ngữ.

---

### Câu chuyện 2 – Điều khiển dễ trên điện thoại: nút chạy/đi và góc nhìn cho tay phải (Ưu tiên: P2)

Trên điện thoại, tay trái giữ cần gạt ở góc trái dưới như hiện nay. Góc phải dưới có hai nút tròn: **đổi đi bộ/chạy**
(bấm một lần là chuyển, biểu tượng cho biết đang ở nhịp nào) và **đổi góc nhìn** (sau lưng ↔ trên cao, chuyển từ góc
trái trên xuống). Các nút không chồng lên bảng nhiệm vụ, thẻ «Vào», hay hộp hội thoại.

**Vì sao P2**: bến đã đi được trên điện thoại, nên đây là làm dễ hơn chứ không phải mở khóa; nhưng giờ học chủ yếu
dùng điện thoại, và người dùng hiện không biết có nhịp chạy.

**Cách thử độc lập**: mở Bến BizOn trên khổ iPhone 13 và Pixel 7, đo các nút; bấm nút chạy rồi đẩy nhẹ cần gạt → nhân
vật chạy; bấm nút góc nhìn → đổi sang nhìn từ trên cao.

**Kịch bản chấp nhận**:

1. **Cho** điện thoại 360–412 px, **khi** vào bến, **thì** góc phải dưới có nút «chạy/đi» và nút «góc nhìn», mỗi nút
   ≥ 44 × 44 px, không chồng lên cần gạt, bảng nhiệm vụ, thẻ «Vào» hay hộp hội thoại; không tràn ngang.
2. **Cho** đang ở nhịp đi bộ, **khi** bấm nút «chạy/đi», **thì** chuyển sang nhịp chạy: đẩy cần gạt bất kỳ mức nào cũng
   chạy; bấm lại thì về nhịp cũ (đẩy nhẹ là đi, đẩy hết là chạy). Nhịp đã chọn được nhớ.
3. **Cho** máy tính, **khi** dùng bàn phím, **thì** mọi cách cũ vẫn chạy (WASD, mũi tên, Shift để đi chậm); nút
   «chạy/đi» cũng dùng được bằng chuột và phím Tab, Enter.
4. **Cho** người dùng chọn «giảm chuyển động», **khi** vào bến, **thì** nút «chạy/đi» vẫn có, không có hiệu ứng
   chuyển động ở các nút.
5. **Cho** hộp hội thoại hoặc danh sách «Đi tới…» đang mở, **khi** nhìn hai nút, **thì** chúng ẩn hoặc nằm dưới lớp đó
   và không bấm nhầm được.

---

### Câu chuyện 3 – Mỗi điểm game có một câu hỏi nhanh (Ưu tiên: P3)

Tới thẻ của một điểm game (Bến Phù Sa, Bật Nghiệp, Hộ Chiếu Thương Hiệu, Hộ Chiếu Sầu Riêng, Arcade, Hành trình 3 bậc),
ngoài nút «Vào» còn có «Câu hỏi nhanh»: một câu trắc nghiệm 3 lựa chọn về game đó (game dạy gì, bậc mấy, chơi bao
lâu), trả lời đúng thì tích việc của nhiệm vụ «Một vòng quanh bến». Trả lời sai thì được gợi ý chỗ đọc lại (mô tả trên
thẻ) và thử lại; không bị trừ gì.

**Vì sao P3**: giúp sinh viên nắm bức tranh ba bậc trước khi chọn game, nhưng cần nội dung câu hỏi được duyệt
`[CẦN LÀM RÕ: ai soạn và duyệt câu hỏi]`, nên đi sau.

**Cách thử độc lập**: tới thẻ Bến Phù Sa, mở «Câu hỏi nhanh», chọn sai rồi chọn đúng → lần sai hiện gợi ý, lần đúng
tích việc «Bến Phù Sa» trong nhiệm vụ «Một vòng quanh bến».

**Kịch bản chấp nhận**:

1. **Cho** thẻ một điểm game đang hiện, **khi** bấm «Câu hỏi nhanh», **thì** hiện câu hỏi 3 lựa chọn bằng ngôn ngữ đang
   chọn, có nút đóng.
2. **Cho** câu hỏi đang mở, **khi** chọn sai, **thì** hiện gợi ý chỉ chỗ đọc lại, không lộ đáp án, cho chọn lại.
3. **Cho** câu hỏi đang mở, **khi** chọn đúng, **thì** tích việc của điểm đó trong nhiệm vụ «Một vòng quanh bến» và
   đóng câu hỏi.
4. **Cho** nhiệm vụ «Làm quen» chưa xong, **khi** mở bảng, **thì** bảng vẫn theo nhiệm vụ «Làm quen»; nhiệm vụ «Một vòng
   quanh bến» mở sau khi «Làm quen» xong.

---

### Trường hợp biên

- Trình duyệt chặn lưu trên máy (chế độ ẩn danh nghiêm ngặt): bảng vẫn chạy trong lượt chơi đó, chỉ không nhớ khi tải
  lại; không báo lỗi.
- Người đã ghé game trước khi có tính năng: những việc kiểu «ghé một bậc game» tính luôn theo dữ liệu đã ghé có sẵn.
- Màn hình rất thấp (điện thoại xoay ngang, cao < 420 px): bảng tự thu gọn thành một dòng.
- Đang ở góc nhìn trên cao: «Dẫn đường» vẫn đưa nhân vật tới đúng điểm.
- Cảnh 3D không tải được (máy yếu, lỗi WebGL): bảng nhiệm vụ không hiện, không chặn màn hình báo lỗi đã có.
- Người dùng chỉ dùng bàn phím và trình đọc màn hình: bảng đọc được (tên, tiến độ, việc tiếp theo), nút «Dẫn đường»
  và «Thu gọn» bấm được bằng Tab, Enter.

## Yêu cầu *(bắt buộc)*

### Yêu cầu chức năng

- **FR-001**: Bến BizOn PHẢI hiện một bảng nhiệm vụ ở góc trái trên khi người chơi đã vào cảnh, gồm tên nhiệm vụ, tiến
  độ «đã xong/tổng số việc», «việc tiếp theo», nút «Dẫn đường» và nút thu gọn.
- **FR-002**: Nhiệm vụ đầu tiên là «Làm quen Bến BizOn» gồm 4–6 việc, mỗi việc gắn với một điểm có sẵn trên bến và một
  hành động đo được (mở hội thoại, đọc bảng, đứng ở thẻ, mở bảng thành tích, vào game).
- **FR-003**: Một việc PHẢI được tích ngay khi hành động của nó xảy ra, bất kể thứ tự; «việc tiếp theo» là việc chưa
  xong đầu tiên trong danh sách.
- **FR-004**: «Dẫn đường» PHẢI đưa người chơi tới đúng điểm của «việc tiếp theo» bằng cùng cơ chế với «Đi tới…».
- **FR-005**: Tiến độ và trạng thái mở/gọn của bảng PHẢI được lưu trên máy người dùng và đọc lại khi mở trang; không gửi
  đi đâu `[CẦN LÀM RÕ: có gửi tiến độ cho giảng viên khi có mã lớp không]`.
- **FR-006**: Xong nhiệm vụ thì hiện lời chúc và gợi ý bước kế tiếp; bảng thu gọn thành một dòng.
- **FR-007**: Trên điện thoại, góc phải dưới PHẢI có nút «chạy/đi» và nút «góc nhìn», mỗi nút ≥ 44 × 44 px; nút
  «Góc nhìn» cũ ở góc trái trên được chuyển xuống đây (không để hai nút cùng việc).
- **FR-008**: Nút «chạy/đi» chuyển giữa hai nhịp: «tự động» (như hiện nay: đẩy nhẹ đi, đẩy hết chạy) và «luôn chạy»;
  nhịp đã chọn được nhớ. Bàn phím giữ nguyên cách cũ.
- **FR-009**: Bảng nhiệm vụ, cần gạt, hai nút mới, thẻ «Vào», hộp hội thoại và danh sách «Đi tới…» KHÔNG ĐƯỢC chồng lên
  nhau ở khổ 360–412 px (cả dọc lẫn ngang) và 1280 px.
- **FR-010**: Mọi chữ mới có bản tiếng Anh, đổi theo nút VI/EN của trang.
- **FR-011**: Mỗi điểm game có một câu hỏi nhanh 3 lựa chọn; trả lời sai chỉ hiện gợi ý chỗ đọc lại, không lộ đáp án;
  trả lời đúng tích việc trong nhiệm vụ «Một vòng quanh bến» (câu chuyện 3).
- **FR-012**: Tính năng KHÔNG ĐƯỢC đổi luật, điểm hay dữ liệu của bất kỳ game nào; không đụng ba game thuộc hồ sơ quyền
  tác giả (Bật Nghiệp 3D, Bến Phù Sa 3D, Hộ Chiếu Thương Hiệu 3D).
- **FR-013**: Người dùng chọn «giảm chuyển động» vẫn dùng được đầy đủ; không có hiệu ứng nhấp nháy hay trượt ở bảng và nút.

### Thực thể chính

- **Nhiệm vụ**: mã, tên (VI/EN), danh sách việc theo thứ tự, lời chúc khi xong, gợi ý bước kế tiếp, điều kiện mở
  (ví dụ: mở sau khi nhiệm vụ khác xong).
- **Việc**: mã, nhãn (VI/EN), điểm trên bến gắn với nó, loại hành động làm nó được tích.
- **Tiến độ**: tập các việc đã xong, nhiệm vụ đang theo, trạng thái mở/gọn của bảng; lưu trên máy người dùng.
- **Câu hỏi nhanh** (câu chuyện 3): điểm game, câu hỏi, 3 lựa chọn, lựa chọn đúng, gợi ý khi sai (VI/EN).

## Tiêu chí thành công *(bắt buộc)*

### Kết quả đo được

- **SC-001**: Người mới vào bến lần đầu thấy «việc tiếp theo» trong vòng 3 giây sau khi chọn nhân vật, không cần ai
  hướng dẫn.
- **SC-002**: Làm theo «Dẫn đường», một người xong nhiệm vụ «Làm quen» trong dưới 4 phút trên điện thoại.
- **SC-003**: Trong buổi chơi thử trên lớp, ít nhất 80% sinh viên xong nhiệm vụ «Làm quen» trong 10 phút đầu
  (đếm qua câu hỏi giơ tay hoặc ảnh chụp màn hình, không thu dữ liệu).
- **SC-004**: Ở khổ 360, 390, 412 px (dọc và ngang) và 1280 px: không tràn ngang; mọi nút mới ≥ 44 × 44 px; không có
  hai phần tử điều khiển nào chồng lên nhau.
- **SC-005**: Tải lại trang giữ đúng 100% việc đã tích.
- **SC-006**: Không game nào đổi kết quả hay điểm số; mọi test hiện có của Bến BizOn và các game vẫn đạt.
- **SC-007**: Người dùng điện thoại đổi được sang nhịp chạy bằng một lần chạm.

## Chuẩn đầu ra liên quan

Bến BizOn là phần **định hướng**, không trực tiếp dạy một chuẩn đầu ra nào (như đặc tả 002). Nhiệm vụ «Làm quen»
phục vụ gián tiếp: giúp sinh viên nắm **lộ trình ba bậc** (Bến Phù Sa → Bật Nghiệp → Hộ Chiếu) trước khi vào game,
nên vào đúng bậc của buổi học. Câu hỏi nhanh (câu chuyện 3) chỉ hỏi về **game dạy gì và thuộc bậc nào**, không hỏi
kiến thức kinh doanh chấm điểm, để không trùng với rubric của từng game (`docs/chuan-dau-ra-va-rubric.md` mục 2–3c).
Cố vấn Lumina và thầy Tu Phan vẫn chỉ gợi hướng, không chọn giúp (hiến chương, nguyên tắc I).

## Giả định

- Chỉ áp dụng cho **Bến BizOn** (`hub-3d.html`); không đổi các game 3D khác.
- Tiến độ chỉ lưu trên máy (giống «đã ghé» và «vai đã chọn» hiện nay), cho tới khi chị quyết khác.
- Nhiệm vụ «Làm quen» (đề xuất, chờ chị duyệt): (1) Hỏi đường Lumina; (2) Đọc Bảng tin; (3) Ghé Hành trình 3 bậc;
  (4) Hỏi thầy Tu Phan game dựng trên mô hình nào; (5) Xem Bảng thành tích. Bước kế tiếp sau khi xong: vào Bến Phù Sa.
- Không học các phần khác trong video: ví tiền, năng lượng, mảnh ghép, taxi, ảnh 360°, thời tiết (có thể làm đặc tả
  riêng sau).
- Câu hỏi nhanh (câu chuyện 3) dùng 3 lựa chọn, không giới hạn số lần thử, không tính điểm.
- Tên gọi trên giao diện: «Nhiệm vụ», «Việc tiếp theo», «Dẫn đường», «Thu gọn» (EN: Quest, Next, Guide me, Collapse).
