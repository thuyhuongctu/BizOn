# Đặc tả tính năng: Phòng luyện pitch gọi vốn «Hội đồng đầu tư» (không dùng AI)

**Nhánh**: `claude/pitch-goi-von` (thư mục đặc tả `010-phong-pitch-goi-von`)

**Ngày tạo**: 2026-11-25

**Trạng thái**: Đã làm rõ (25/11/2026), có kế hoạch và danh sách việc; chờ chị duyệt trước khi làm PR 1.

**Đầu vào**: chị nhắn ngày 25/11/2026, sau khi em xem repo `awesome-ai-apps` (mục «Shark Tank Pitch Practice»): «Phòng 3D cho sinh viên luyện thuyết trình gọi vốn. Có thể thành một màn chơi «gọi vốn» với câu hỏi theo kịch bản soạn sẵn, không cần AI. Có kịch bản pitching trên bizonland.com».

## Hiện trạng (đọc kho ngày 25/11/2026, main ở `f99c0774`)

- **Kịch bản sẵn có.** Trang Kịch bản lớp học (`lop-hoc.html`, dữ liệu `js/lop-hoc-data.js` và bản EN `js/lop-hoc-data-en.js`) có «Kịch bản sự kiện: Đại hội Cổ đông & Pitch xin vốn (150 phút)». Chị thiết kế và đã kiểm nghiệm ở HK2 2025–26.
  - Mỗi nhóm pitch 7 phút rồi trả lời Hội đồng. Quá giờ 30 giây bị trừ 5 điểm, đồng hồ reo và phần trình bày bị ngắt.
  - Pitch chia theo 5 vai: CEO 30 giây, CMO 90, CFO 90 (chiếu Excel hòa vốn), COO 60, SEC 60, CEO chốt 90.
  - Nội dung theo khung PASTOR: Problem, Answer, Story, Traction, Offer, Response.
  - Sau pitch, nhóm tự chấm 4 tiêu chí × 2,5 điểm: khả thi tài chính, độc đáo, đội ngũ, trình bày.
  - Mỗi thành viên thuộc 3 con số: vốn xin, BEP/tháng, lợi nhuận mục tiêu. Có checklist 12 mục trước pitch.
  - Hội đồng cấp vốn giả định 50–250 triệu đồng. Giảng viên nạp số vốn vào game bằng mục thưởng vốn của Chế độ giảng viên.
- **Chưa có công cụ tương tác nào** cho phần pitch. Mọi thứ hiện nằm trên giấy và trong tay giảng viên.
- **3D sẵn có:** sa bàn văn phòng (`js/van-phong-doi-3d.js`, three.js) ở các trang Văn phòng đội. Nhân vật là ảnh gốc của game.
- **Nhân vật có thể ngồi Hội đồng** (chỉ dùng nhân vật có sẵn, `assets/character/advisors/`): thầy Tu Phan, Victor Lâm, Minh Khang, Bà Sáu Lành, An Nhiên, Lina Park. Lumina làm người dẫn và giữ giờ.
- Hiến chương:
  - Lumina và cố vấn là «chạy theo luật», không gọi là AI, không chọn giúp;
  - trang tĩnh, chạy ngoại tuyến, 360–390 px;
  - dữ liệu người học tối thiểu.

## Làm rõ

Chị trả lời ngày 25/11/2026:

| # | Câu hỏi | Chị chọn | Ảnh hưởng |
|---|---|---|---|
| 1 | Làm bản nào trước | **Bản phẳng trước, 3D sau** | Câu chuyện 1–2 là bản phẳng; Câu chuyện 3 (phòng 3D) là PR cuối. Máy yếu tự về bản phẳng. |
| 2 | Hội đồng gồm ai | **Thầy Tu Phan, Victor Lâm, Minh Khang** | FR-003: thầy Tu Phan (chủ tịch, chiến lược: Problem, Response), Victor Lâm (thị trường, quốc tế hóa: Answer, Story), Minh Khang (tài chính: Traction, Offer). Lumina dẫn và giữ giờ. |
| 3 | Lưu kết quả ở đâu | **Trên máy, kèm in hoặc xuất tệp** | FR-008: lưu trong trình duyệt; in bảng tổng kết và xuất tệp CSV. Không gửi máy chủ, không cần migration. |
| 4 | Bộ câu hỏi lấy từ đâu | **Em soạn, chị duyệt** | Khoảng 40 câu VI/EN phủ 6 chữ PASTOR × 5 vai. Chị duyệt trong PR 1 trước khi lên trang. |

## Kịch bản người dùng và kiểm thử *(bắt buộc)*

### Câu chuyện 1 – Đội tập pitch 7 phút với đồng hồ theo vai và câu hỏi soạn sẵn của Hội đồng (Ưu tiên: P1)

**Người dùng:** đội sinh viên (5 vai), tập ở nhà hoặc trên lớp, một máy chiếu hoặc một điện thoại.

**Hành trình:**
- Đội nhập tên, chọn ngành hàng.
- Lumina đọc luật: 7 phút, 5 vai, PASTOR, quá 30 giây bị trừ điểm.
- Đồng hồ chạy theo từng đoạn vai, báo khi còn 10 giây và khi quá giờ.
- Hết pitch, Hội đồng (nhân vật có sẵn) hỏi 3–5 câu, rút từ bộ câu hỏi soạn sẵn theo PASTOR và theo vai.
- Đội trả lời miệng, có giờ cho từng câu.

**Vì sao ưu tiên này:** đây là phần đội cần tập nhiều nhất và đang chưa có công cụ. Làm riêng phần này đã dùng được ngay cho buổi «Đại hội Cổ đông».

**Cách thử độc lập:** mở trang, chạy hết một lượt pitch giả lập (tua nhanh đồng hồ trong test). Từng đoạn vai đổi đúng giờ; quá giờ bị trừ đúng 5 điểm; Hội đồng hỏi đúng số câu, không lặp câu.

**Kịch bản nghiệm thu:**
1. **Cho** đội bắt đầu pitch, **Khi** đoạn CMO chạy hết 90 giây, **Thì** đồng hồ chuyển sang CFO và báo «đến lượt CFO».
2. **Cho** tổng thời gian vượt 7 phút 30 giây, **Khi** đồng hồ chạm mốc ấy, **Thì** chuông reo, phần trình bày dừng và bảng điểm ghi −5.
3. **Cho** phần pitch đã xong, **Khi** sang phần hỏi đáp, **Thì** Hội đồng hỏi số câu đã định, mỗi câu gắn một chữ của PASTOR và một vai. Câu hỏi không kèm đáp án.

---

### Câu chuyện 2 – Đội tự chấm và nhận bảng tổng kết để sửa pitch (Ưu tiên: P2)

**Hành trình:**
- Sau phần hỏi đáp, đội tự chấm 4 tiêu chí × 2,5 điểm như kịch bản; điểm phạt quá giờ trừ tự động.
- Kiểm 3 con số: vốn xin, BEP/tháng, lợi nhuận mục tiêu. Đội nhập 3 số; trang kiểm chúng có nhất quán với nhau không, ví dụ vốn xin có đủ trang trải đến điểm hòa vốn không. Trang chỉ báo chỗ lệch, không sửa giúp.
- Bảng tổng kết: thời gian từng vai, câu hỏi đã gặp, điểm tự chấm.
- Đội in hoặc lưu bảng này, rồi tập lại để so hai lượt.

**Cách thử độc lập:** nhập điểm và ba con số mẫu; tổng điểm và cảnh báo nhất quán đúng; tập lượt 2 thì hiện so sánh với lượt 1.

**Kịch bản nghiệm thu:**
1. **Cho** đội chấm 2 / 2,5 / 2 / 1,5 và bị phạt 5 điểm (thang 100), **Khi** xem tổng kết, **Thì** điểm ghi đúng theo quy đổi đã chốt.
2. **Cho** vốn xin nhỏ hơn số tiền cần để chạm điểm hòa vốn, **Khi** kiểm ba con số, **Thì** trang báo lệch kèm cách tính, không tự sửa số.

---

### Câu chuyện 3 – Phòng Hội đồng 3D (Ưu tiên: P3)

**Hành trình:** cùng luồng như Câu chuyện 1, nhưng đặt trong một phòng họp 3D. Các thành viên Hội đồng ngồi bàn, ai hỏi thì người đó nổi bật. Phòng dựng lại từ sa bàn văn phòng sẵn có, nhân vật dùng ảnh gốc của game. Máy yếu thì trang tự về bản phẳng (Câu chuyện 1).

**Cách thử độc lập:** mở trên máy có WebGL thì thấy phòng 3D, người hỏi nổi bật. Tắt WebGL thì về bản phẳng, không lỗi.

### Trường hợp biên

- Điện thoại 360 px: đồng hồ, tên vai và câu hỏi đọc được, không tràn ngang. Nút ≥ 44 px.
- Màn hình bị khóa, hoặc người dùng chuyển tab giữa pitch: đồng hồ tính theo giờ thật, không tính theo số khung hình.
- Giảm chuyển động (`prefers-reduced-motion`): không dùng hiệu ứng nhấp nháy.
- Ngoại tuyến: chạy được sau lần mở đầu tiên.
- Song ngữ VI/EN cho mọi chữ và câu hỏi.

## Yêu cầu *(bắt buộc)*

### Yêu cầu chức năng

- **FR-001:** Trang MUST chạy đồng hồ pitch 7 phút chia theo 5 vai, đúng thời lượng của kịch bản, có báo trước 10 giây và báo quá giờ.
- **FR-002:** Quá 30 giây so với 7 phút MUST trừ 5 điểm và dừng phần trình bày, như luật của kịch bản.
- **FR-003:** Hội đồng MUST hỏi từ bộ câu hỏi soạn sẵn, mỗi câu gắn một chữ của PASTOR và một vai. Bộ câu hỏi nằm trong một tệp dữ liệu tĩnh, VI/EN. Không câu nào kèm đáp án. Thành viên Hội đồng: thầy Tu Phan, Victor Lâm, Minh Khang (làm rõ 2).
- **FR-004:** Cách rút câu hỏi MUST tất định khi có mã lượt (cùng mã thì cùng bộ câu), để giảng viên cho các đội gặp câu hỏi công bằng.
- **FR-005:** Tự chấm MUST theo 4 tiêu chí × 2,5 của kịch bản; điểm phạt trừ tự động.
- **FR-006:** Kiểm ba con số MUST chỉ báo chỗ không nhất quán, kèm cách tính; không đề xuất con số thay.
- **FR-007:** Không gọi dịch vụ AI hay dịch vụ ngoài nào. Không ghi âm, không ghi hình sinh viên.
- **FR-008:** Kết quả lưu trong trình duyệt; đội in bảng tổng kết hoặc xuất CSV để nộp. Không gửi máy chủ (làm rõ 3).
- **FR-009:** Lumina dẫn và giữ giờ, gọi là cố vấn chạy theo luật; không nhận xét nội dung pitch là đúng hay sai.

### Thực thể chính

- **Bộ câu hỏi Hội đồng:** mã câu, chữ PASTOR, vai, thành viên hỏi, câu VI, câu EN.
- **Lượt pitch:** tên đội, ngành hàng, mốc thời gian từng vai, điểm phạt, câu hỏi đã gặp, điểm tự chấm, ba con số.

## Tiêu chí thành công *(bắt buộc)*

- **SC-001:** Một đội chạy trọn một lượt (pitch, hỏi đáp, tự chấm) trong ≤ 15 phút, không cần giảng viên hướng dẫn thêm ngoài màn luật đầu trang.
- **SC-002:** Đồng hồ lệch ≤ 1 giây sau 7 phút (đo trong test bằng đồng hồ giả lập), kể cả khi chuyển tab.
- **SC-003:** Bộ câu hỏi phủ đủ 6 chữ PASTOR × 5 vai, mỗi ô ít nhất 1 câu; 100 % câu có bản EN.
- **SC-004:** 360 px không tràn ngang; `html-validate` 0 lỗi; không lỗi JS.

## Nối chuẩn đầu ra

| Câu chuyện | Chuẩn đầu ra | Cách nối |
|---|---|---|
| 1 | **CLO-E** «Hợp tác C-Suite (5 vai): giao tiếp liên chức năng, ra quyết định dưới áp lực thời gian» | Pitch chia vai, giữ giờ, trả lời Hội đồng |
| 1, 2 | **CLO-B** «Quản trị dòng tiền» (vai CFO) | Ba con số và câu hỏi Traction về BEP, biên an toàn |
| 2 | Rubric **E** «Hợp tác liên chức năng» | Bảng tổng kết thời gian từng vai, tự chấm |

## Giả định

- Thang điểm: 4 tiêu chí × 2,5 = 10 điểm, như kịch bản. Điểm phạt 5 điểm hiểu theo thang 100 của buổi sự kiện, tức 0,5 điểm trên thang 10. Cách quy đổi sẽ hỏi chị nếu khác.
- Không nạp vốn vào game tự động ở bản đầu. Giảng viên vẫn nạp tay như kịch bản hiện hành.
- Bộ câu hỏi do em soạn, chị duyệt trước khi lên trang.

## Câu hỏi gửi chị

Các câu hỏi gửi trong tin nhắn ngày 25/11/2026. Câu trả lời sẽ ghi vào mục «Làm rõ».
