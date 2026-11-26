# Đặc tả tính năng: Nâng cấp Phòng luyện pitch gọi vốn: Hội đồng cả lớp, rubric nghiên cứu, Hội đồng 3D sống động, Lumina góp ý

**Nhánh**: `claude/pitch-nang-cap` (thư mục đặc tả `012-pitch-nang-cap`)

**Ngày tạo**: 2026-11-26

**Trạng thái**: Đã làm rõ (26/11/2026), có kế hoạch và danh sách việc; chờ Hương duyệt trước khi làm PR 1.

**Đầu vào**: Ngày 26/11/2026 Hương nhận xét «Phòng gọi vốn rất có tiềm năng, sẽ xem xét đầu tư để có sự thu hút, đột phá học thuật». Hương chọn cả bốn hướng:
1. Hội đồng nhà đầu tư cả lớp.
2. Công cụ nghiên cứu.
3. Hội đồng 3D sống động hơn.
4. Lumina góp ý sau pitch.

## Hiện trạng (đọc kho ngày 26/11/2026, main ở `1d8c641c`)

- **Phòng pitch** (đặc tả 010, đã xong ba PR) gồm bốn tệp, tổng 1.002 dòng:
  - `lab/pitch-goi-von.html`: 533 dòng.
  - `-data.js`: 120 dòng. Có 40 câu hỏi PASTOR VI/EN do Hương duyệt, 4 tiêu chí tự chấm × 2,5 điểm, 5 ngành.
  - `-core.js`: 170 dòng. Đồng hồ 7 phút theo 6 đoạn, phạt quá giờ, rút câu theo mã lượt, tự chấm, kiểm ba con số, CSV.
  - `-3d.js`: 179 dòng. Phòng họp 3D dựng bằng ảnh gốc; làm nổi bật người hỏi; **chưa có phản ứng nào khác**.
- **Chấm điểm:** chỉ đội tự chấm, theo kịch bản Đại hội Cổ đông. Không có người chấm thứ hai, nên chưa đo được độ tin cậy.
- **Cam kết đang in ở chân trang:** «Trang không dùng AI, không ghi âm, không ghi hình và không gửi dữ liệu đi đâu. Lumina và Hội đồng … không chấm nội dung câu trả lời». Hướng 1 sẽ gửi dữ liệu góp vốn qua mạng, nên câu này phải sửa cho đúng.
- **Hạ tầng có sẵn, dùng lại được:**
  - `js/phong-realtime.js`: phòng nhiều người qua Supabase Realtime (broadcast và presence), **không cần bảng, không cần migration**. Đang dùng cho Ra Khơi 3D. Tên kênh đang viết cố định là `bizon-ra-khoi-`, phải tách thành tham số.
  - `js/vendor/qrcode.js`: tạo mã QR ngay trên máy, đang dùng ở trang tổng hợp CHAM.
  - Cờ lớp `explain_hidden` (`js/explain-mode.js`, bảng `class_controls`): nhánh nghiên cứu «có / không có giải thích». Đây chính là so sánh «có / không có Lumina» trong `docs/research/THIET-KE-DOT-KHAO-SAT-SAU.md`.
  - Web Speech API (`speechSynthesis`): đã dùng đọc lời ở Hộ Chiếu Thương Hiệu (`js/bp-signature.js`); máy không có giọng thì im lặng.
- **Nghiên cứu:**
  - `docs/research/ISAGA-2027-DAN-Y-BAI.md` hứa một «trang chấm mù tính Cohen's κ và ICC», nhưng trang này **chưa có**.
  - Ngưỡng đã chọn: ICC(2,k) ≥ 0,75.
  - Script phân tích có sẵn: `scripts/research/phan-tich-truoc-sau.mjs`.

## Làm rõ

Hương trả lời ngày 26/11/2026:

| # | Câu hỏi | Hương chọn | Ảnh hưởng |
|---|---|---|---|
| 1 | Dữ liệu góp vốn và chấm điểm lưu ở đâu | **Chỉ Realtime + CSV** | FR-001, FR-003: máy chủ không lưu gì, không migration; màn chiếu giữ dữ liệu và xuất CSV; giảng viên tự lưu tệp. |
| 2 | Rubric nghiên cứu so với thang 4 × 2,5 | **Song song, giữ 4 × 2,5** | FR-004: 4 × 2,5 vẫn là điểm lớp theo kịch bản Đại hội Cổ đông; rubric 6 tiêu chí chỉ dùng cho chấm cặp và nghiên cứu. |
| 3 | Vốn ảo của mỗi quỹ | **1 tỷ đồng cả buổi, tối đa 50 % cho một đội** | Câu chuyện 1, FR-001: không rót cho chính mình; vốn không dùng hết vẫn hiện trên bảng danh mục. |
| 4 | Chia nhánh thí nghiệm Lumina | **Cờ lớp `explain_hidden`** | FR-008: cả lớp chung một nhánh, cùng nhánh R1 với game; cần mã lớp `?lop=` để đọc cờ, không có mã lớp thì Lumina hiện. |

Giọng đọc câu hỏi: Hương đồng ý tạm dùng giọng sẵn của trình duyệt (Web Speech API), có nút tắt/mở. Nếu sau này ghi âm người thật thì thay nguồn giọng, không đổi luật.

## Kịch bản người dùng và kiểm thử *(bắt buộc)*

### Câu chuyện 1 – Hội đồng nhà đầu tư cả lớp (Ưu tiên: P1)

**Người dùng:** giảng viên điều khiển màn chiếu; các đội trong lớp, mỗi đội dùng một điện thoại.

**Hành trình:**
1. Giảng viên mở phòng pitch ở chế độ lớp. Màn chiếu hiện mã phòng và mã QR.
2. Mỗi đội quét QR và trở thành một «quỹ đầu tư», có **1 tỷ đồng vốn ảo cho cả buổi**; rót cho một đội tối đa 50 % (500 triệu đồng), theo bậc 50 triệu đồng.
3. Khi một đội pitch xong phần hỏi đáp, các quỹ khác có 60 giây để rót vốn. Không quỹ nào rót được cho chính đội mình.
4. Màn chiếu hiện ngay tổng vốn đội đó gọi được, số quỹ đã rót, và một thanh tiến tới «mục tiêu gọi vốn» đội đã nêu.
5. Cuối buổi có bảng xếp hạng gọi vốn và bảng danh mục của từng quỹ. Giảng viên xuất CSV.

**Vì sao ưu tiên này:** biến buổi pitch thành giải đấu cả lớp cùng tham gia, không còn chỉ một đội nói và cả lớp ngồi nghe. Đây là phần «thu hút» rõ nhất. Hạ tầng Realtime đã có sẵn.

**Cách thử độc lập:** mở màn chiếu trên một trình duyệt và ba «quỹ» trên ba thẻ trình duyệt khác. Một đội pitch xong thì ba quỹ rót vốn, màn chiếu cộng đúng, CSV có đủ lượt rót.

**Kịch bản nghiệm thu:**
1. **Cho** 6 đội đã vào phòng, đội 2 đang pitch, **Khi** 5 quỹ còn lại rót vốn trong cửa sổ 60 giây, **Thì** màn chiếu cập nhật tổng vốn và số quỹ trong vòng 2 giây sau mỗi lượt rót.
2. **Cho** quỹ của đội 2, **Khi** đội 2 đang pitch, **Thì** nút rót vốn của quỹ này bị khóa, kèm dòng giải thích.
3. **Cho** mạng của lớp rớt giữa buổi, **Khi** giảng viên tiếp tục, **Thì** phòng pitch vẫn chạy như bản một máy (đồng hồ, câu hỏi, tự chấm). Các lượt rót đã nhận vẫn còn trên màn chiếu.
4. **Cho** buổi đã xong, **Khi** giảng viên bấm xuất, **Thì** CSV ghi mỗi lượt rót trên một dòng gồm: mã buổi, quỹ, đội nhận, số vốn, thời điểm. Không có tên thật.

---

### Câu chuyện 2 – Rubric nghiên cứu và chấm cặp (Ưu tiên: P2)

**Người dùng:** giảng viên và các quỹ (bạn học) chấm cùng một lượt pitch; nhóm nghiên cứu phân tích.

**Hành trình:**
- Phần tự chấm 4 × 2,5 giữ nguyên làm điểm lớp. Song song có một rubric nghiên cứu 6 tiêu chí, mỗi tiêu chí thang 1–5 có mô tả neo. Các tiêu chí dựa trên tài liệu về đánh giá pitch:
  - mức chuẩn bị (Chen, Yao & Kotha, 2009);
  - nhiệt huyết thể hiện, tách riêng để kiểm phát hiện của Chen, Yao & Kotha (2009);
  - logic tài chính, khớp với ba con số;
  - vấn đề và giải pháp rõ (Clingingsmith & Shane, 2018);
  - đội ngũ đáng tin;
  - cách trả lời câu hỏi.

  Biến kết quả là quyết định đầu tư: số vốn các quỹ rót ở Câu chuyện 1 và một câu «ý định đầu tư» 1–5. Ý định này được so với 6 tiêu chí để xem «cảm giác» của nhà đầu tư dựa vào đâu (Huang & Pearce, 2015).
- Giảng viên chấm trên màn riêng (`?gv=1`); mỗi quỹ chấm trên điện thoại. Không ai thấy điểm của người khác trước khi nộp, tức là chấm mù.
- Một script đọc CSV, tính độ tin cậy giữa giảng viên và bạn học: ICC(2,1), ICC(2,k), α Krippendorff. Script báo theo ngưỡng ICC(2,k) ≥ 0,75 đã chọn.

**Vì sao ưu tiên này:** đây là phần «đột phá học thuật». Có dữ liệu chấm cặp thì có bài cho ISAGA 2027 và *Simulation & Gaming*, đồng thời thực hiện được «trang chấm mù» đã hứa trong dàn ý bài.

**Cách thử độc lập:** nạp CSV mẫu có điểm của 2 người chấm cho 10 lượt pitch. Script tính ICC khớp với kết quả tính tay hoặc một gói thống kê chuẩn, sai số dưới 0,01.

**Kịch bản nghiệm thu:**
1. **Cho** giảng viên và 4 quỹ chấm cùng một lượt pitch, **Khi** một người chưa nộp, **Thì** không ai thấy điểm của người khác. Sau khi tất cả đã nộp, màn chiếu hiện trung bình của từng tiêu chí.
2. **Cho** tệp CSV của 3 buổi, **Khi** chạy script, **Thì** script in ICC(2,1), ICC(2,k), α kèm khoảng tin cậy 95 %, và cảnh báo khi số lượt pitch dưới 30.

---

### Câu chuyện 3 – Hội đồng 3D sống động hơn (Ưu tiên: P3)

**Người dùng:** đội đang pitch và cả lớp nhìn màn chiếu.

**Hành trình:**
- Mỗi nhà đầu tư có một tính cách riêng, ghi trong tệp dữ liệu:
  - **Thầy Tu Phan:** học thuật, hay hỏi «vì sao», chú ý lập luận.
  - **Victor Lâm:** tài chính, chú ý ba con số.
  - **Minh Khang:** thị trường và khách hàng.
- Hội đồng phản ứng **theo luật**, chỉ dựa trên tín hiệu trang đo được. Trang không ghi âm, không dùng AI, không hiểu nội dung câu trả lời. Các tín hiệu gồm:
  - thời gian còn lại trong đoạn;
  - đội bấm «Trả lời xong» sớm hay quá giờ;
  - nút «tự tin / chưa chắc» đội tự bấm;
  - kết quả kiểm ba con số: lệch thì Victor Lâm cau mày và hỏi vặn câu tài chính;
  - nhóm PASTOR của câu hỏi.
- Phản ứng hiện ra bằng động tác: gật đầu, cau mày, nghiêng người, ghi chép. Kèm một câu nói ngắn soạn sẵn, VI/EN.
- Câu hỏi của Hội đồng có thể được đọc to bằng giọng VI/EN của trình duyệt (Web Speech API), như Hộ Chiếu Thương Hiệu. Có nút bật/tắt; máy không có giọng thì im lặng, không lỗi.

**Cách thử độc lập:** chạy kịch bản tín hiệu định sẵn, ví dụ «ba con số lệch» và «quá giờ 20 giây». Hội đồng phản ứng đúng như bảng luật; chế độ giảm chuyển động thì không chạy hoạt ảnh.

**Kịch bản nghiệm thu:**
1. **Cho** kiểm ba con số báo lệch điểm hòa vốn, **Khi** tới phần hỏi đáp, **Thì** Victor Lâm cau mày và hỏi một câu thuộc nhóm tài chính.
2. **Cho** đội trả lời quá giờ, **Khi** hết giờ, **Thì** Lumina gõ chuông, người hỏi ghi chép, và dòng chữ nói rõ phản ứng dựa trên thời gian chứ không dựa trên nội dung.

---

### Câu chuyện 4 – Lumina góp ý sau pitch (Ưu tiên: P4)

**Người dùng:** đội vừa pitch xong; nhóm nghiên cứu khi chạy nhánh có / không có Lumina.

**Hành trình:**
- Sau bảng tổng kết, Lumina đưa ra tối đa ba góp ý **theo luật**, dựa trên:
  - đoạn nào quá giờ;
  - con số nào lệch;
  - khoảng cách giữa điểm tự chấm và điểm giảng viên hoặc bạn học (nếu có Câu chuyện 2);
  - nhóm PASTOR nào đội trả lời chậm.
- Lumina gợi ý ba câu hỏi nên luyện lại, rút từ ngân hàng cùng nhóm PASTOR. Kèm nút «Luyện lại ba câu này».
- Nhánh nghiên cứu: khi lớp bật nhánh ẩn giải thích, Lumina chỉ nói lời kết chung, không góp ý cụ thể. Cờ là `explain_hidden` của lớp, đọc qua mã lớp `?lop=` như game (làm rõ 4). CSV có cột ghi nhánh, `lumina=hien` hoặc `lumina=an`.

**Cách thử độc lập:** cho một lượt pitch quá giờ ở đoạn «Tài chính» và lệch điểm hòa vốn. Lumina nêu đúng hai điều đó và gợi ý ba câu thuộc nhóm tài chính. Bật nhánh ẩn thì không còn góp ý cụ thể.

**Kịch bản nghiệm thu:**
1. **Cho** lượt pitch quá giờ 40 giây ở đoạn Tài chính và lệch điểm hòa vốn 12 %, **Khi** mở tổng kết, **Thì** Lumina nêu đúng hai điểm đó và gợi ý 3 câu trong nhóm tài chính.
2. **Cho** lớp bật nhánh ẩn, **Khi** mở tổng kết, **Thì** Lumina không đưa góp ý cụ thể, và CSV ghi `lumina=an`.

### Trường hợp biên

- 360 px: mọi màn đọc được, không tràn ngang; nút ≥ 44 px. Màn chiếu tối ưu cho 1280–1920 px.
- Lớp 60 sinh viên, khoảng 12 đội: một phòng Realtime chịu được 12 quỹ và 1 màn chiếu. Tin trùng hoặc đến muộn không làm cộng vốn hai lần.
- Hai máy cùng mở màn chiếu: chỉ một máy giữ vai chủ phòng.
- Không có mạng: chế độ lớp tắt; bản một máy vẫn đủ như đặc tả 010.
- Giảm chuyển động: Hội đồng 3D chỉ đổi biểu cảm tĩnh, không nhún hay nghiêng.
- VI/EN đủ ở mọi màn, kể cả lời Hội đồng và Lumina.

## Yêu cầu *(bắt buộc)*

### Yêu cầu chức năng

- **FR-001:** Chế độ lớp dùng `js/phong-realtime.js`, tách tên kênh thành tham số và giữ nguyên Ra Khơi 3D. Màn chiếu là nơi tổng hợp duy nhất; mỗi lượt rót có mã riêng để không cộng hai lần. Mỗi quỹ có 1 tỷ đồng cho cả buổi, rót theo bậc 50 triệu, tối đa 500 triệu cho một đội, không rót cho chính đội mình; màn chiếu kiểm lại các luật này và bỏ tin sai luật. Máy chủ không lưu gì; màn chiếu xuất CSV (làm rõ 1).
- **FR-002:** QR và mã phòng tạo ngay trên máy bằng `js/vendor/qrcode.js`. Không dùng dịch vụ QR bên ngoài.
- **FR-003:** Dữ liệu gửi qua mạng chỉ gồm mã buổi, mã quỹ (tên đội do lớp đặt), số vốn, điểm rubric, thời điểm. Không tên thật, không âm thanh, không hình ảnh. Câu chân trang sửa cho đúng việc gửi dữ liệu.
- **FR-004:** Rubric nghiên cứu 6 tiêu chí, thang 1–5, có mô tả neo VI/EN, kèm trích dẫn APA kiểm bằng `scripts/research/kiem-trich-dan.mjs`. Chấm mù: điểm chỉ hiện khi đủ người nộp hoặc khi giảng viên mở.
- **FR-005:** Script `scripts/research/do-tin-cay-pitch.mjs` tính ICC(2,1), ICC(2,k), α Krippendorff (khoảng) từ CSV. Có test bằng bộ số liệu mẫu với kết quả biết trước.
- **FR-006:** Hội đồng 3D phản ứng theo bảng luật trong tệp dữ liệu (tín hiệu → động tác và câu nói). Không suy luận từ nội dung câu trả lời; trang ghi rõ điều này.
- **FR-007:** Giọng đọc câu hỏi tắt/mở được, im lặng khi máy không hỗ trợ, không chặn luồng chơi.
- **FR-008:** Lumina góp ý theo luật, tối đa 3 ý và 3 câu luyện lại. Ẩn theo nhánh nghiên cứu; CSV ghi nhánh.
- **FR-009:** Bản một máy của đặc tả 010 vẫn chạy đủ khi không bật chế độ lớp, các test cũ vẫn đạt.

### Thực thể chính

- **Buổi pitch:** mã buổi, danh sách đội, thứ tự pitch, mục tiêu gọi vốn của từng đội.
- **Quỹ:** đội, vốn còn lại, danh mục (đội nhận, số vốn).
- **Lượt chấm:** người chấm (giảng viên hoặc mã quỹ), đội được chấm, 6 điểm, thời điểm.
- **Luật phản ứng:** tín hiệu, nhà đầu tư, động tác, câu nói VI/EN.

## Tiêu chí thành công *(bắt buộc)*

- **SC-001:** Một lớp 6–12 đội chạy trọn buổi gọi vốn trong 60–90 phút. Màn chiếu cập nhật dưới 2 giây và không cộng vốn hai lần, kiểm bằng test giả lập 12 quỹ.
- **SC-002:** Script độ tin cậy cho kết quả khớp số liệu mẫu, sai số dưới 0,01. Mọi trích dẫn của rubric qua `kiem-trich-dan.mjs` không lỗi.
- **SC-003:** 100 % luật phản ứng và góp ý của Lumina có câu VI/EN và có test.
- **SC-004:** 360 px không tràn ngang; `html-validate` 0 lỗi; không lỗi JS; ngoài Supabase Realtime khi bật chế độ lớp, không gọi mạng ngoài nào khác.

## Nối chuẩn đầu ra

| Câu chuyện | Chuẩn đầu ra | Cách nối |
|---|---|---|
| 1 | CLO-E «Hợp tác C-Suite», mức Sáng tạo / Vận dụng | Trình bày và ra quyết định đầu tư dưới áp lực thời gian, trước cả lớp |
| 1, 4 | CLO-B «Quản trị Dòng tiền», mức Đánh giá | Ba con số (hòa vốn, lợi nhuận mục tiêu, vốn xin) bị Hội đồng và Lumina soi |
| 2 | Nghiên cứu (ISAGA 2027) | Rubric có cơ sở, chấm cặp, độ tin cậy |

## Giả định

- Chế độ lớp chạy trên kênh công khai của Supabase Realtime với khóa publishable có sẵn, như Ra Khơi 3D. Máy chủ không lưu gì; màn chiếu giữ và xuất dữ liệu (làm rõ 1). Kênh công khai nên ai có mã phòng cũng gửi tin được: màn chiếu kiểm luật và chỉ nhận quỹ đã được giảng viên duyệt vào phòng.
- Mỗi đội dùng đúng một điện thoại làm quỹ; giảng viên tự đặt tên đội, không dùng tên thật.
- Ba nhà đầu tư giữ đúng nhân vật và ảnh gốc của đặc tả 010; không thêm nhân vật mới.
- Các nguồn trích dẫn (Chen, Yao & Kotha, 2009; Clingingsmith & Shane, 2018; Huang & Pearce, 2015) sẽ được kiểm DOI trên Crossref trước khi đưa vào rubric.
