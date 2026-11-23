# Đặc tả tính năng: Loạt phim hoạt hình «Đưa trái ra biển», tập 1 «Sà lan hay xe tải?»

**Nhánh**: `claude/phim-dua-trai-ra-bien` (thư mục đặc tả `008-phim-dua-trai-ra-bien`)

**Ngày tạo**: 2026-11-23

**Trạng thái**: Đã làm rõ (23/11/2026), có kế hoạch và danh sách việc; chờ chị duyệt trước khi làm PR 1.

**Đầu vào**: chị nhắn qua nhiều tin, ngày 22–23/11/2026.

1. Chị muốn xây câu chuyện về vùng đất khởi nghiệp, bật nghiệp Bizonland. Hướng tới «phát hành các tập phim hoạt hình có nhân vật Bizon, dạng marketing câu chuyện thương hiệu».
2. Trong năm vấn đề logistics em đề xuất có thể thành quyết định trong game, chị chọn: «Ok triển khai ý 1 làm phim hoạt hình và nhân vật là các nhân vật của bizonland». Ý 1 là: từ Cần Thơ lên Cái Mép, đi sà lan rẻ nhưng chậm, hay xe tải nhanh nhưng đắt.
3. Người kể chuyện: «Chọn giọng tôi lumina». Nghĩa là Lumina kể, giọng chị tự thu.
4. Chị nhờ «suy nghĩ kênh đăng tải để marketing và kiếm được tiền duy trì dự án».
5. Chị nhắn: «Cần có sự hấp dẫn. Mong chờ. Lên kế hoạch sản xuất chi tiết».

## Hiện trạng (đọc kho ngày 23/11/2026, main ở `4d4fd946`, `bizon-v955`)

**Nhân vật có sẵn.** Hiến chương yêu cầu chỉ dùng nhân vật có trong ảnh game, không dựng nhân vật mới.

| Nhân vật | Vai hiện có (theo `js/thu-vien-data.js`, `bp-clay-cast.js`) | Ảnh có sẵn |
|---|---|---|
| Lumina | Cố vấn chạy theo quy tắc, người dẫn chuyện suốt sáu quý chơi | `assets/character/advisors/lumina-*` (9 tư thế), `assets/character/lumina-*` |
| Bà Sáu Lành | Nhà sáng lập, giữ hồn nghề, tay nâng hũ đặc sản gia truyền | `advisors/ba-sau-lanh-*`, `assets/hc/cast/ba-sau-lanh-{vui,lo,v4}-cut*` |
| Minh Khang | Giám đốc tài chính, ly cà phê giữa hai phiên họp | `advisors/minh-khang-*` |
| An Nhiên | Chiến lược và đổi mới, bảng số liệu thị trường; ở Hộ Chiếu Sầu Riêng là người kiểm chất lượng (độ ngọt Brix, đông lạnh) | `advisors/an-nhien-*`, `hc/cast/an-nhien-qa-*` |
| Lina Park | Cố vấn phân phối, bút chỉ và bản đồ tuyến hàng | `advisors/lina-park-*`, `hc/cast/lina-park-{vui,lo}` |
| Kim Long | CEO đối thủ, «Kim Long Exports» | `hc/cast/kim-long-ceo.png` |
| Bác Ba | Hợp tác xã Cai Lậy (vườn sầu riêng) | `hc/cast/bac-ba-*` |
| Tèo Soi | Rồng con của Hộ Chiếu Sầu Riêng, 32 tư thế | `assets/hc/...` (thư viện mục «Tèo Soi & nhân vật») |
| Bạn nón lá | Cậu bé và cô bé nón lá đi cùng Tèo | `hc/cast/ban-non-la-*`, `ban-gai-non-la-*` |
| Victor Lâm | Cố vấn quốc tế hóa | `advisors/victor-lam-*` |

**Quy trình video đã có trong kho:**
- `scripts/video/dung-cang-cai-mep.mjs`: dựng từng khung từ trang cảnh HTML, ghép giọng theo câu, nhạc nền, chuẩn độ to (`loudnorm`), có chế độ xem trước `--nhap`.
- `scripts/video/cat-giong-theo-cau.py`: cắt một tệp giọng thành từng câu theo mốc thời gian.
- `scripts/kiem-video.mjs`: kiểm video thành phẩm. Skill `video-ngan` dùng công thức «móc câu → leo thang → bạn thấy đấy → cú lật».
- Video Cảng Cái Mép (gộp #1186) là tiền lệ gần nhất: 13 câu, có bản VI và EN, phụ đề `.vtt`, gắn vào `huong-dan.html`. Video này là đồ họa chuyển động; nhân vật chưa diễn.
- Các MV 3D (Southern Horizons, Brand Passport, Durian Passport…) do chị dựng ngoài kho. Kho chỉ chứa ảnh bìa và nhúng YouTube bằng `js/am-mv.js`: chỉ tải trình phát khi người xem bấm.
- Kênh YouTube: @jemappellehuong («Thuy Huong Digital Learning»). Nút kênh có ở chân trang (#1187).

**Số liệu logistics có sẵn.** Chị chia sẻ các tài liệu này trên Drive; em đã đọc ngày 22/11/2026.
- Báo cáo Logistics Việt Nam 2024: khoảng 79,7% hàng hóa ở Đồng bằng sông Cửu Long đi đường thủy nội địa; chi phí đường thủy khoảng 30% chi phí đường bộ; cước biển một giai đoạn tăng từ 1.661 lên 3.964 USD/FEU.
- Luận văn về chuỗi cung ứng trái cây tươi: hao hụt sau thu hoạch khoảng 25%. Đây là nguồn thứ cấp, cần đối chiếu.
- Các bản tóm tắt Google Docs trong thư mục là do AI viết. Không dùng số từ đó nếu chưa truy được về tài liệu gốc.

**Chưa có:**
- bộ khung loạt phim (story bible), kịch bản, bảng phân cảnh;
- trang loạt phim trên bizonland.com, lịch phát hành;
- màn chơi «chọn tuyến Cần Thơ → Cái Mép»;
- bộ hồ sơ giới thiệu cho nhà tài trợ.

## Làm rõ

Chị trả lời ngày 23/11/2026: «1 a, 2a, 3 a, 4a, 5 a».

1. **Dựng hình (1A)**: kết hợp hai cách.
   - Chị dựng các cảnh nhân vật diễn bằng công cụ video chị dùng cho MV 3D, từ ảnh đất nặn có sẵn.
   - Em viết mô tả từng cảnh (prompt), dựng các cảnh số liệu, bản đồ, bảng so sánh bằng trang cảnh HTML, rồi ghép tiếng, nhạc, phụ đề.
   - **Mọi chữ trên hình do em chèn ở hậu kỳ.** Cảnh của công cụ video không chứa chữ, để tránh chữ tiếng Việt sai dấu.
2. **Kênh (2A)**: dùng tiếp kênh @jemappellehuong, tạo playlist «Đưa trái ra biển / Fruit to the Sea».
3. **Nhịp (3A)**: mùa 1 có 6 tập, 2 tuần một tập. Giữa hai tập có teaser và 3 đoạn dọc. Lịch cụ thể ở `plan.md`, nghỉ quanh Tết Đinh Mùi (6/2/2027).
4. **Bình chọn (4A)**: dùng thăm dò có sẵn của YouTube (thẻ Cộng đồng, thăm dò trong Shorts) và Facebook. Không thêm bảng hay RPC Supabase. bizonland.com chỉ hiện kết quả do em nhập tay sau khi bình chọn đóng.
5. **Tài trợ (5A)**: tập 1 và tập 2 chưa nhận tài trợ, dùng làm hồ sơ chào.
   - Trước tập 3, chị thống nhất với thầy Tú, và với trường nếu cần, về pháp nhân nhận tiền và cách chia doanh thu.
   - Em soạn bảng giá nháp. Bảng giá **không đăng lên web** cho tới khi chị duyệt và trang Chính sách được cập nhật cho khớp.

## Kịch bản người dùng và kiểm thử *(bắt buộc)*

### Câu chuyện 1 – Người xem xem tập 1 trọn vẹn và muốn biết chuyện gì xảy ra tiếp theo (Ưu tiên: P1)

Một sinh viên lướt thấy tập 1 trên YouTube và xem hết. Phim 4–6 phút, bản VI và bản EN, có phụ đề.

- **Móc câu (0–10 giây).** Container sầu riêng của Bác Ba phải có mặt ở cảng Cái Mép trước giờ tàu chạy. Nếu trễ, cả lô lỡ chuyến và đơn hàng đầu tiên ra thế giới đổ bể. Đồng hồ đếm ngược hiện trên màn hình.
- **Hai phe.** Minh Khang, giám đốc tài chính, muốn đi sà lan: rẻ, theo đúng con đường mà phần lớn hàng miền Tây vẫn đi. Lina Park, người vẽ tuyến phân phối, cùng An Nhiên muốn đi xe tải: nhanh, ít trung chuyển. Tèo Soi ngồi trên nóc container, cổ vũ cả hai phe.
- **Leo thang.** Kim Long Exports cũng nhắm cùng chuyến tàu và cùng người mua. Lumina hiện bảng ba cột chi phí, thời gian, rủi ro. Mọi con số trên bảng đều có nguồn, và Lumina không nói nên chọn bên nào.
- **Cú lật.** Một yếu tố thật của vùng sông nước làm hai lựa chọn đổi chỗ cho nhau: con nước, kẹt xe ở cửa ngõ cảng, hay lịch tàu bị đổi. Yếu tố cụ thể chốt trong kịch bản, phải có nguồn.
- **Kết treo.** Cả đội phải chốt ngay. Màn hình dừng ở khoảnh khắc trước khi chọn. Lumina hỏi: «Còn đội bạn: sông hay đường?» Kèm lời mời bình chọn và đường dẫn sang màn chơi trên bizonland.com.
- **Hậu đoạn (sau chữ chạy cuối phim).** Hé một cảnh 3–5 giây của tập 2: trái tươi hay cấp đông.

**Vì sao P1**: một tập hay là nền của mọi thứ còn lại. Không có tập 1 thì không có gì để quảng bá, tài trợ hay bán giấy phép.

**Cách thử độc lập**: chiếu tập 1 cho 5–10 sinh viên chưa biết BizOn. Hỏi ba câu:
- Em nhớ hai lựa chọn là gì?
- Em chọn gì, vì sao?
- Em có muốn xem tập 2 không?

**Kịch bản chấp nhận**:

1. **Cho** người xem mở tập 1, **khi** xem 10 giây đầu, **thì** đã biết ai đang gặp chuyện gì và hạn chót là gì, chưa cần nghe giới thiệu kênh.
2. **Cho** cảnh Lumina hiện bảng so sánh, **khi** dừng hình, **thì** mỗi con số có chú thích nguồn trên màn hình hoặc trong mô tả video. Không có số mô phỏng của game nào bị đọc như số thật.
3. **Cho** người xem tới phút cuối, **khi** phim kết thúc, **thì** phim **không** nói lựa chọn nào đúng (hiến chương I). Có câu hỏi «sông hay đường?», lời mời bình chọn và đường dẫn sang màn chơi.
4. **Cho** bản EN, **khi** so với bản VI, **thì** cùng hình, cùng nhịp. Tên riêng tiếng Việt (Cần Thơ, Cái Mép, Bà Sáu Lành, Tèo Soi) giữ nguyên dấu.
5. **Cho** mọi khung hình, **khi** soát, **thì** không có logo hay tên thương mại của hãng tàu, bến cảng, công ty vận tải thật. Bản đồ Việt Nam nếu xuất hiện có Hoàng Sa và Trường Sa.
6. **Cho** giọng Lumina do chị thu, **khi** nghe bằng Whisper, **thì** phiên âm khớp kịch bản, không sai dấu tên riêng. Độ to chuẩn khoảng −16 LUFS, như video Cảng Cái Mép.

---

### Câu chuyện 2 – Người xem chờ tập sau vì lựa chọn của mình làm thay đổi câu chuyện (Ưu tiên: P2)

Đây là phần làm khán giả **mong chờ**.

- Ba ngày trước khi phát hành có teaser dọc 15 giây; trên kênh và trên trang loạt phim có lịch phát hành.
- Sau tập 1 có bình chọn «Sà lan hay xe tải?».
- **Lựa chọn của số đông thành chuyện có thật ở tập 2.** Tập 2 mở đầu bằng hậu quả trung thực của lựa chọn ấy, có lời ghi nhận «Theo bình chọn của các bạn: …». Lựa chọn còn lại cũng được kể ngắn: nếu đi đường kia thì sao.
- Mỗi tập có 3 đoạn Shorts/Reels/TikTok dọc 30–45 giây. Đoạn nào cũng dừng ở một câu hỏi.

**Vì sao P2**: biến người xem thành người cùng ra quyết định, đúng tinh thần game. Đó là lý do để quay lại xem tập sau, và là cơ chế giữ chân mạnh nhất cho một kênh mới.

**Cách thử độc lập**: chạy với tập 1. Đếm số phiếu bình chọn, tỷ lệ người xem Shorts bấm sang tập dài, số lượt bấm sang màn chơi trong 14 ngày.

**Kịch bản chấp nhận**:

1. **Cho** tập N sắp phát hành, **khi** còn 3 ngày, **thì** teaser 15 giây đã đăng ở các kênh, trang loạt phim hiện ngày giờ phát hành.
2. **Cho** tập N vừa phát hành, **khi** người xem tới cuối, **thì** có bình chọn với đúng hai lựa chọn của tập, mở ít nhất 7 ngày.
3. **Cho** bình chọn đã đóng, **khi** tập N+1 phát hành, **thì** cảnh mở đầu kể hậu quả của lựa chọn số đông kèm tỷ lệ phiếu thật, không bịa số.
4. **Cho** mỗi tập, **khi** phát hành, **thì** có ít nhất 3 đoạn dọc, mỗi đoạn có đường dẫn về tập dài.

---

### Câu chuyện 3 – Sinh viên và giảng viên tự chơi lại quyết định của tập phim trên bizonland.com (Ưu tiên: P3)

Trên bizonland.com có trang loạt phim. Ở đó có tập 1, nhúng theo cách chỉ tải trình phát YouTube khi bấm. Cạnh tập phim là màn chơi «Chọn tuyến Cần Thơ → Cái Mép».

- Người chơi chọn sà lan hoặc xe tải, rồi chọn thêm một tình huống ngẫu nhiên: con nước, kẹt xe, tàu đổi lịch.
- Màn chơi cho thấy chi phí, thời gian, khả năng kịp tàu và hao hụt.
- Không có đáp án đúng. Người chơi xem lại từng lựa chọn khi đổi mục tiêu: rẻ nhất, nhanh nhất, hay chắc chắn kịp tàu.
- Có một câu hỏi suy ngẫm cho buổi học.

**Vì sao P3**: nối phim với việc học (CLO-C). Giảng viên có sẵn hoạt động 10 phút trên lớp, và có lý do để mua giấy phép trọn gói.

**Cách thử độc lập**: mở trang ở 360, 390 và 1280 px, ở VI và EN. Chơi đủ hai tuyến và ba tình huống. Kết quả khớp bảng số liệu có nguồn trong `plan.md`.

**Kịch bản chấp nhận**:

1. **Cho** trang loạt phim, **khi** mở, **thì** chưa tải trình phát YouTube hay cookie bên thứ ba cho tới khi người xem bấm phát.
2. **Cho** người chơi chọn một tuyến và một tình huống, **khi** bấm «Xem kết quả», **thì** thấy chi phí, thời gian, kịp hay lỡ tàu, hao hụt, kèm nguồn của từng tham số.
3. **Cho** cùng một tuyến, **khi** đổi mục tiêu, **thì** lời nhận xét đổi theo, không lựa chọn nào luôn «thắng» (kiểm bằng `/balance-check`).
4. **Cho** điện thoại 360–390 px, **khi** chơi, **thì** không tràn ngang, vùng chạm ≥ 44 px, chữ tương phản ≥ 4,5.
5. **Cho** mất mạng (PWA), **khi** mở lại trang, **thì** màn chơi vẫn chạy; vùng video báo «cần mạng để xem phim».

---

### Câu chuyện 4 – Nhà tài trợ và nhà trường hiểu ngay cách đồng hành cùng loạt phim (Ưu tiên: P4)

Một bộ hồ sơ VI/EN, gồm:
- một trang giới thiệu loạt phim;
- số liệu người xem thật sau tập 1;
- các gói đồng hành: tài trợ một tập, giấy phép lớp học trọn gói gồm game, phim và câu hỏi thảo luận, đặt hàng phim câu chuyện thương hiệu cho đặc sản và sản phẩm OCOP;
- nguyên tắc nội dung: nhà tài trợ không được sửa số liệu hay đổi kết luận; trong phim ghi rõ «Đồng hành cùng tập này: …».

**Vì sao P4**: giúp dự án tự duy trì. Gói này cần số liệu thật của tập 1 mới có sức thuyết phục, nên làm sau.

**Cách thử độc lập**: gửi bộ hồ sơ cho 3 người (một giảng viên, một doanh nghiệp xuất khẩu, một người ngoài ngành). Hỏi xem họ có trả lời được «loạt phim là gì, đồng hành thế nào, giá bao nhiêu, liên hệ ai» trong 2 phút không.

**Kịch bản chấp nhận**:

1. **Cho** bộ hồ sơ, **khi** đọc, **thì** mọi số người xem là số thật từ YouTube Studio hoặc Meta, có ngày lấy số.
2. **Cho** gói tài trợ, **khi** đọc, **thì** có điều khoản độc lập nội dung và cách ghi nhận nhà tài trợ trong phim.
3. **Cho** các mức giá, **khi** công bố, **thì** đúng như chị duyệt (5A) và khớp trang Chính sách (hiến chương II).

---

### Trường hợp biên

- Bình chọn hòa, hoặc quá ít phiếu (dưới ngưỡng chị chốt, ví dụ 30 phiếu). Tập sau dùng kết quả màn chơi trên web hoặc phiếu của lớp học gần nhất, và nói rõ nguồn.
- Chị chưa kịp thu giọng. Dựng bản nháp bằng giọng máy để duyệt nhịp. Bản phát hành **chỉ** dùng giọng chị, vì đó là quyết định của chị.
- Một số liệu không tìm được nguồn gốc. Bỏ con số, chỉ nói định tính («rẻ hơn nhiều», «chậm hơn»). Không đoán.
- Ảnh nhân vật có chữ tiếng Việt sai dấu, hoặc logo giống hãng thật (như ảnh sa bàn sân bay). Không dùng khung ấy.
- YouTube đánh dấu phim «dành cho trẻ em» vì là hoạt hình. Chủ động chọn «không dành cho trẻ em» vì người xem mục tiêu là sinh viên, và ghi vào quy trình đăng.
- Tập 2 cần lựa chọn của tập 1 nhưng bình chọn chưa đóng. Lịch sản xuất phải để khoảng đệm giữa lúc bình chọn đóng và lúc dựng cảnh mở đầu tập sau (xem kế hoạch).

## Yêu cầu *(bắt buộc)*

### Yêu cầu chức năng

- **FR-001**: PHẢI có bộ khung loạt phim mùa 1 gồm:
  - thế giới Bizonland, vai và giọng của từng nhân vật có sẵn;
  - mục tiêu cả mùa: lô sầu riêng đầu tiên của Bác Ba ra thế giới;
  - đối thủ Kim Long Exports;
  - danh sách tập, mỗi tập một quyết định logistics; tập 1 là «Sà lan hay xe tải?».
- **FR-002**: Kịch bản tập 1 PHẢI theo cấu trúc móc câu (≤ 10 giây) → hai phe → leo thang → cú lật → kết treo bằng câu hỏi, có hậu đoạn hé tập 2. Có bản VI và EN cùng nhịp.
- **FR-003**: Lumina là người kể và cố vấn. Lumina chỉ đặt câu hỏi và trình bày số liệu, **không chọn giúp, không nói lựa chọn nào đúng**; không gọi Lumina là «AI» (hiến chương I, II).
- **FR-004**: Mọi con số đọc hoặc hiện trong phim PHẢI có nguồn gốc ghi trong `plan.md` (tài liệu, trang, ngày tra). Số mô phỏng của game không được trình bày như số thật.
- **FR-005**: Chỉ dùng nhân vật có trong ảnh game. Không logo hay tên thương mại thật. Bản đồ Việt Nam có Hoàng Sa và Trường Sa.
- **FR-006**: Giọng Lumina bản phát hành do chị thu, cả VI và EN. PHẢI có kịch bản thu theo từng câu, đánh dấu ngắt nhịp và từ khó đọc.
- **FR-007**: Mỗi tập phát hành có: bản VI, bản EN, phụ đề `.vtt` hai thứ tiếng, ảnh bìa, 3 đoạn dọc, teaser 15 giây, và mô tả video có nguồn số liệu cùng đường dẫn bizonland.com.
- **FR-008**: Có cơ chế bình chọn sau mỗi tập. Lựa chọn số đông được kể thành hậu quả ở tập sau, kèm tỷ lệ phiếu thật. Bình chọn bằng thăm dò của YouTube và Facebook (4A); kết quả nhập tay vào dữ liệu trang loạt phim.
- **FR-009**: bizonland.com có trang loạt phim gồm:
  - tập phim, nhúng theo cách chỉ tải khi bấm;
  - lịch phát hành;
  - màn chơi chọn tuyến (câu chuyện 3).
  Trang ở trong `sitemap.xml`, có `canonical`, VI/EN bằng `data-en`, chạy ngoại tuyến (trừ video).
- **FR-010**: Màn chơi chọn tuyến không có lựa chọn luôn thắng; tham số đặt ở đầu tệp, có nguồn. Màn chơi không gửi dữ liệu người học lên máy chủ, kể cả số lần chơi (4A).
- **FR-011**: Có bộ hồ sơ tài trợ và giấy phép VI/EN, với điều khoản độc lập nội dung. Theo 5A: chưa nhận tài trợ ở tập 1–2; giá và pháp nhân chốt trước tập 3.
- **FR-012**: Có quy trình đăng tải ghi thành tài liệu, gồm:
  - chọn «không dành cho trẻ em»;
  - giờ đăng, thẻ, chương trong mô tả;
  - màn hình kết thúc trỏ tập sau;
  - cách cắt Shorts;
  - danh sách kiểm trước khi đăng.
- **FR-013**: Có kế hoạch sản xuất mùa 1, ghi rõ:
  - tiền kỳ, sản xuất, hậu kỳ, phát hành;
  - người làm từng việc (chị, em, thầy Tú);
  - việc nào chị phải làm tay (thu giọng, dựng cảnh nhân vật bằng công cụ ngoài kho, đăng video);
  - thời lượng ước tính và mốc ngày.

### Thực thể chính

- **Loạt phim / Mùa**: tên, mục tiêu cả mùa, danh sách tập, lịch phát hành.
- **Tập phim**: số tập, tên VI/EN, quyết định logistics, hai lựa chọn, kịch bản, bảng phân cảnh, liên kết YouTube VI/EN, ảnh bìa, phụ đề, đoạn dọc, kết quả bình chọn.
- **Số liệu có nguồn**: giá trị, đơn vị, tài liệu gốc, trang, ngày tra, dùng ở tập nào.
- **Màn chơi chọn tuyến**: tuyến (sà lan, xe tải), tình huống, tham số chi phí, thời gian, hao hụt, mục tiêu.
- **Gói đồng hành**: loại (tài trợ tập, giấy phép lớp, đặt hàng phim), quyền lợi, giá, điều khoản.

## Tiêu chí thành công *(bắt buộc)*

- **SC-001**: Tập 1 có bản VI và EN, phụ đề và ảnh bìa, đăng đúng ngày trong lịch. Qua `scripts/kiem-video.mjs` và nghe soát bằng Whisper không có lỗi.
- **SC-002**: Khi chiếu thử cho 5–10 sinh viên, ít nhất 80% nhắc đúng hai lựa chọn và nêu được một lý do. Ít nhất 70% nói muốn xem tập 2.
- **SC-003**: 30 ngày sau khi phát hành, tỷ lệ giữ chân trung bình của tập 1 trên YouTube ≥ 40%; ít nhất 30 phiếu bình chọn; ít nhất 100 lượt bấm sang trang loạt phim. Chị có thể chỉnh các ngưỡng này khi duyệt.
- **SC-004**: Màn chơi chọn tuyến qua `/balance-check`: mỗi tuyến tốt nhất ở ít nhất một mục tiêu hoặc tình huống. Trang không tràn ngang ở 360–390 px, html-validate 0 lỗi.
- **SC-005**: Trước tập 3, bộ hồ sơ đồng hành đã gửi ít nhất 3 đơn vị: một trường, một doanh nghiệp xuất khẩu hoặc logistics, một hiệp hội hoặc quỹ.
- **SC-006**: Không có số liệu nào trong phim thiếu nguồn. Không khung hình nào có logo thật hay bản đồ thiếu Hoàng Sa, Trường Sa (soát theo danh sách kiểm trước khi đăng).

## Nối chuẩn đầu ra

- **CLO-C · Quản trị vận hành (COO)**: đánh đổi chi phí, thời gian và rủi ro giữa các phương thức vận tải. Khả năng kịp tàu và hao hụt.
- **CLO-B · Dòng tiền (CFO)**: góc nhìn của Minh Khang. Chi phí vận chuyển tác động biên lợi nhuận mỗi container.
- **CLO-E · Hợp tác 5 vai**: hai phe trong đội tranh luận, CEO chốt dưới áp lực thời gian. Phim là mẫu để thảo luận trên lớp.
- **CLO-D (gián tiếp)**: chặng nội địa ra cảng nước sâu là bước đầu của xuất khẩu. Nối với video Cảng Cái Mép và Hộ Chiếu Sầu Riêng.

## Giả định

- Mùa 1 bám năm vấn đề em đã đề xuất ngày 22/11/2026, mỗi vấn đề một tập, thêm một tập kết ở cảng hoặc nơi nhận hàng:
  1. sà lan hay xe tải;
  2. bán trái tươi hay cấp đông;
  3. chốt cước sớm hay chờ;
  4. tự lập điểm gom;
  5. rẻ nhất, nhanh nhất hay giao đủ 100%.
- Bộ khung truyện mới chỉ là đề xuất; chị duyệt từng tập.
- Phân vai đề xuất:
  - Minh Khang (tài chính) nghiêng về sà lan vì rẻ;
  - Lina Park (tuyến phân phối) và An Nhiên (chất lượng, độ tươi) nghiêng về xe tải;
  - Bà Sáu Lành và Bác Ba là người giữ hàng, hiểu sông nước;
  - Kim Long là đối thủ;
  - Tèo Soi và Bạn nón lá làm phần vui, kéo người xem trẻ.
- Thời lượng tập dài 4–6 phút. Đoạn dọc 30–45 giây.
- Nhạc nền dùng nhạc gốc BizOn đã có trong Kho Âm nhạc (ví dụ «mekong-compass»), không dùng nhạc bên thứ ba.
- Trang loạt phim tuân thủ cam kết không cookie bên thứ ba của trang Chính sách: không đặt quảng cáo trên bizonland.com.
- Số liệu về thời gian và chi phí cụ thể của tuyến Cần Thơ → Cái Mép (quãng đường, giờ chạy sà lan và xe tải, cước mỗi container) **chưa có nguồn**. Đây là việc tra cứu đầu tiên của kế hoạch.

## Câu hỏi gửi chị

Đã trả lời ngày 23/11/2026, xem mục «Làm rõ».
