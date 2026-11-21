# Đặc tả tính năng: Giao diện «3 cửa»

**Nhánh**: `claude/giao-dien-3-cua` (thư mục đặc tả `006-giao-dien-3-cua`)

**Ngày tạo**: 2026-11-19

**Trạng thái**: Đã làm xong câu chuyện 1 (#1144) và câu chuyện 2 (#1150). Câu chuyện 3 bỏ khỏi phạm vi (3C). Câu chuyện 4, buổi thử 5 phút, hoãn đến khi chị có thời gian; phiếu thử ở `docs/thu-nghiem/thu-5-phut.md`. Cập nhật 21/11/2026.

**Đầu vào**: góp ý của thầy Tú qua Zalo sau buổi chạy thử với lớp UM Kendari (19/11/2026):
- «Thầy nghĩ giao diện cần có tính thân thiện và đơn giản để tiện người dùng, vì quá nhiều thông tin nên không biết vào đâu.»
- «Nếu mở lớp tập huấn cho GV thì mình cũng phải làm rất rõ các bước, vì tương lai sẽ mở rộng toàn trường cho các cuộc thi khởi nghiệp.»

Chị chuyển góp ý ngày 19/11/2026 và yêu cầu làm lần lượt các việc còn dở. Em đề xuất màn đầu chỉ còn ba cửa: **Sinh viên**, **Giảng viên**, **Khách xem thử**.

## Hiện trạng (đo bằng Playwright ngày 19/11/2026, main ở `bizon-v898`)

| Trang | Bề rộng | Nút và liên kết thấy được | Trong màn đầu | Mục menu | Chiều cao trang |
|---|---|---|---|---|---|
| Trang chủ `index.html` | 390 px | 98 | 17 | 9 (+ VI/EN, tối, «Bắt đầu») | 15.964 px (≈ 19 màn) |
| Trang chủ | 1280 px | 99 | 19 | 9 | 8.635 px |
| Trung tâm trò chơi `games.html` | 390 px | 79 | 20 | 9 | 11.544 px |
| Trang Giảng viên `giang-vien.html` | 390 px | 65 | 21 | 9 | 11.241 px |
| Bật Nghiệp 3D (màn vào) | 390 px | 10 | 6 | 0 | 1 màn |

Quan sát thêm:
- **Trang chủ ở 390 px**: màn đầu là dòng giới thiệu, ô «TIN MỚI», tiêu đề lớn và một đoạn văn 7 dòng. Nút hành động chính «Bắt đầu với Bến Phù Sa →» nằm **dưới màn đầu**. Không có lối nào ghi «Sinh viên» hay «Giảng viên» ngoài mục menu «Giảng viên» nằm trong dải menu cuộn ngang.
- **Menu chung** (`js/bizon-clay-nav.js`): 9 mục Vũ trụ, Trò chơi, Hành trình, Giảng viên, Lớp học, Học thuật, Bằng chứng, Pilot, Đội ngũ. Lối của sinh viên và giảng viên nằm chung với lối cho hội đồng, báo chí, nghiên cứu.
- **Màn vào Bật Nghiệp 3D ở 390 px**: phải điền Email, Tên đội, Mã lớp và chọn vai **trước** nút «Bắt đầu ▶». Nút này, cùng «Chơi thử với Đội Demo» và «Trang Giảng viên», nằm **dưới màn đầu**, phải cuộn mới thấy.
- Liên kết `?lop=` hiện chỉ được `js/live-progress.js` đọc (Bến Phù Sa, Hộ Chiếu Thương Hiệu, Hộ Chiếu Sầu Riêng). **Bật Nghiệp 3D chưa đọc `?lop=`**: sinh viên UMK phải tự gõ mã lớp.
- Mã lớp **không gắn với một game** (bảng lớp chỉ có `class_code`). Trang chủ vì thế không tự biết lớp của sinh viên chơi game nào.
- Hồ sơ quyền tác giả: `BizOn Game 3D.html`, `game.html`, `games.html`, `universe.html`… **không được đổi tên, xóa hay chuyển hướng**. `BizOn Game 3D.html` không được sửa logic (`docs/roadmap/KE-HOACH-DON-HE-SINH-THAI-2026-11.md`).

## Làm rõ

Chị trả lời ngày 19/11/2026 («1. A, 2. A, 3. C, 4. Có thể phát triển nếu người thẩm định mở được giao diện cũ, 5. C sẽ làm khi có thời gian»):

1. **Cửa Sinh viên (1A)**: dẫn tới trang mới «Vào lớp» (`vao-lop.html`) có bốn thẻ game. Sinh viên chọn game giảng viên đã dặn, có thể gõ sẵn mã lớp để mang theo vào game. Không thêm dữ liệu hay migration.
2. **Cửa Khách (2A)**: mở Bến Phù Sa (miễn phí theo Chính sách), kèm video giới thiệu Bật Nghiệp 3D.
3. **Menu (3C)**: giữ nguyên 9 mục. **Câu chuyện 3 bỏ khỏi phạm vi**; chỉ làm câu chuyện 1 và 2.
4. **Màn vào Bật Nghiệp 3D (4)**: được đổi trên `BizOn Game 3D.html` **với điều kiện người thẩm định vẫn mở được giao diện cũ**. Cách giữ: liên kết `?giao-dien=goc` hiện màn vào đúng như bản đã nộp hồ sơ (không đổi chữ, bố cục, thứ tự ô), và màn mới có lối nhỏ «Giao diện bản hồ sơ» trỏ tới đó. Chỉ đổi HTML/CSS và phần hiện/ẩn ô, không đổi logic game.
5. **Buổi thử 5 phút (5C)**: chưa làm bây giờ; chị sẽ làm khi có thời gian. **Câu chuyện 4 hoãn**; phiếu thử vẫn soạn sẵn trong PR 1 để dùng sau. SC-002 đo khi có buổi thử.

## Kịch bản người dùng và kiểm thử *(bắt buộc)*

### Câu chuyện 1 – Ba cửa ở màn đầu trang chủ (Ưu tiên: P1)

Người mới (sinh viên, giảng viên hay khách) mở bizonland.com. Ngay màn đầu, không cần cuộn, họ thấy ba thẻ lớn «Tôi là sinh viên», «Tôi là giảng viên», «Tôi muốn xem thử». Mỗi thẻ ghi một câu nói rõ sẽ làm gì. Bấm một thẻ là tới đúng việc tiếp theo.

**Vì sao ưu tiên này**: đây chính là điều thầy Tú than phiền («không biết vào đâu»). Mọi người dùng đều đi qua trang chủ.

**Cách thử độc lập**: mở `index.html` ở 360, 390 và 1280 px, VI và EN. Ba thẻ nằm trọn trong màn đầu. Bấm từng thẻ và kiểm trang đích.

**Kịch bản nghiệm thu**:
1. **Cho** trang chủ ở 390 px, **khi** vừa tải xong, **thì** cả ba thẻ nằm trọn trong 844 px đầu, mỗi thẻ cao ≥ 44 px, chữ đọc được (tương phản ≥ 4,5).
2. **Cho** thẻ «Tôi là sinh viên», **khi** bấm, **thì** sinh viên tới bước vào lớp theo phương án ở câu làm rõ 1. Có lối «Chưa có mã lớp? Chơi thử».
3. **Cho** thẻ «Tôi là giảng viên», **khi** bấm, **thì** tới trang hướng dẫn mở lớp từng bước, kèm nút «Thử lớp demo (không cần đăng nhập)».
4. **Cho** thẻ «Tôi muốn xem thử», **khi** bấm, **thì** tới game demo theo câu làm rõ 2, kèm video giới thiệu.
5. **Cho** chế độ EN, **khi** tải trang, **thì** ba thẻ và câu mô tả đều bằng tiếng Anh, không tràn ngang ở 360 px.
6. **Cho** người dùng cũ mở liên kết cũ (`?lang=en`, `?lop=…` trên trang game, các mục menu cũ), **khi** truy cập, **thì** vẫn chạy như trước.

### Câu chuyện 2 – Màn vào Bật Nghiệp 3D: chọn đường trước, điền sau (Ưu tiên: P2)

Sinh viên mở Bật Nghiệp 3D trên điện thoại. Màn đầu có hai nút lớn: «Tôi có mã lớp» và «Chơi thử với Đội Demo», cùng lối nhỏ «Tôi là giảng viên». Chọn «Tôi có mã lớp» thì mới hiện các ô Mã lớp, Email trường, Tên đội, Vai. Nút «Bắt đầu ▶» luôn thấy được mà không phải cuộn.

**Vì sao ưu tiên này**: buổi UMK chơi đúng màn này. Ở 390 px, nút bắt đầu và nút chơi thử hiện nằm dưới màn đầu.

**Cách thử độc lập**: mở `BizOn Game 3D.html` ở 390 px. Đo vị trí hai nút, chọn từng đường, vào được game. Liên kết `?lop=UMK-2026` (mới hỗ trợ ở bản 3D) điền sẵn mã lớp và mở thẳng đường «Tôi có mã lớp». `?giao-dien=goc` hiện đúng màn vào cũ.

**Kịch bản nghiệm thu**:
1. **Cho** màn vào ở 390 px, **khi** tải xong, **thì** «Tôi có mã lớp» và «Chơi thử với Đội Demo» nằm trong 844 px đầu.
2. **Cho** đường «Tôi có mã lớp», **khi** điền đủ, **thì** nút «Bắt đầu ▶» thấy được (dính đáy hoặc trong màn) và vào game đúng như hiện nay.
3. **Cho** liên kết `?lop=…`, **khi** mở, **thì** đường «Tôi có mã lớp» mở sẵn, mã lớp đã điền.
5. **Cho** liên kết `?giao-dien=goc`, **khi** mở, **thì** màn vào giống hệt bản đã nộp hồ sơ (cùng chữ, cùng thứ tự ô, cùng nút).
4. **Cho** cùng hạt giống và cùng quyết định, **khi** chơi, **thì** kết quả trùng từng con số với bản hiện nay (không đổi luật).

### Câu chuyện 3 – Menu gọn và «Khám phá thêm» (Ưu tiên: P3) · **ngoài phạm vi theo câu làm rõ 3C**

Menu chung còn ít mục, theo câu làm rõ 3. Các trang nghiên cứu, bằng chứng, pilot, báo chí, hồ sơ, đội ngũ, vũ trụ gom vào một trang hoặc một ngăn «Khám phá thêm». Không xóa trang nào; liên kết cũ vẫn mở được.

**Vì sao ưu tiên này**: đỡ rối cho mọi trang, nhưng đụng nhiều trang hơn câu 1 và 2, nên làm sau khi đã thấy hiệu quả của câu 1.

**Cách thử độc lập**: đếm mục menu ở 390 và 1280 px. Mỗi trang cũ vẫn tới được trong ≤ 2 lần bấm từ trang chủ.

**Kịch bản nghiệm thu**:
1. **Cho** bất kỳ trang nào dùng menu chung, **khi** tải, **thì** menu có đúng số mục đã chốt ở câu làm rõ 3.
2. **Cho** một trang đã rời khỏi menu (ví dụ «Bằng chứng»), **khi** mở «Khám phá thêm», **thì** thấy liên kết tới trang đó kèm một dòng mô tả.
3. **Cho** `sitemap.xml`, **khi** kiểm, **thì** không trang nào bị bỏ.

### Câu chuyện 4 – Buổi thử 5 phút với người mới · **hoãn theo câu làm rõ 5C** (phiếu thử soạn sẵn)

Trước khi gộp câu chuyện 1, 3–5 người chưa từng dùng BizOn thử bản hiện tại trong 5 phút với ba nhiệm vụ: (a) vào được một lớp bằng mã lớp; (b) với vai giảng viên, tìm cách mở lớp demo; (c) với vai khách, chơi thử một game. Ghi thời gian và chỗ kẹt. Sau khi làm xong câu 1–2, cũng nhóm ấy (hoặc nhóm tương tự) thử lại cùng nhiệm vụ.

**Vì sao ưu tiên này**: để sửa đúng chỗ kẹt thật thay vì đoán, và có số đo trước/sau để trả lời thầy Tú.

**Cách thử độc lập**: phiếu thử `docs/thu-nghiem/thu-5-phut.md` (ba nhiệm vụ, cột thời gian, chỗ kẹt, câu người thử nói). Kết quả ghi bằng `/playtest-report`, không ghi tên người thử.

**Kịch bản nghiệm thu**:
1. **Cho** phiếu thử, **khi** một người thử làm xong ba nhiệm vụ, **thì** có thời gian từng nhiệm vụ và chỗ kẹt.
2. **Cho** bảng trước/sau, **khi** so, **thì** thấy được thời gian trung bình và số người kẹt ở mỗi nhiệm vụ.

### Trường hợp biên

- Người dùng đã đăng nhập (sinh viên hoặc giảng viên): thẻ tương ứng có thể ghi «Tiếp tục lớp …» thay cho lời mời chung.
- Trình duyệt tắt JavaScript hoặc đang ngoại tuyến (PWA): ba thẻ là liên kết HTML thường, vẫn bấm được.
- Người dùng đến từ liên kết sâu (`giang-vien.html#nguon-mo`, `BizOn Game 3D.html?lop=`): không bị đẩy về màn ba cửa.
- Chế độ tối: thẻ giữ tương phản ≥ 4,5.

## Yêu cầu *(bắt buộc)*

### Yêu cầu chức năng

- **FR-001**: Màn đầu trang chủ ở 360, 390 và 1280 px có ba thẻ Sinh viên, Giảng viên, Khách nằm trọn trong màn, mỗi thẻ ≥ 44 px, có tiêu đề và một câu mô tả, VI/EN.
- **FR-002**: Thẻ Sinh viên dẫn tới bước vào lớp theo câu làm rõ 1, có lối chơi thử khi chưa có mã lớp.
- **FR-003**: Thẻ Giảng viên dẫn tới hướng dẫn mở lớp từng bước, kèm lối vào lớp demo không cần đăng nhập.
- **FR-004**: Thẻ Khách dẫn tới game demo theo câu làm rõ 2 và video giới thiệu.
- **FR-005**: Các khối nội dung hiện có của trang chủ vẫn còn, nằm dưới ba thẻ hoặc chuyển sang «Khám phá thêm». Không xóa trang, không đổi địa chỉ trang.
- **FR-006**: Màn vào Bật Nghiệp 3D (`BizOn Game 3D.html`) hiện hai nút «Tôi có mã lớp» và «Chơi thử với Đội Demo» trong màn đầu ở 390 px. Các ô nhập chỉ hiện sau khi chọn đường có mã lớp. Nút «Bắt đầu ▶» thấy được mà không phải cuộn. `?lop=` điền sẵn mã lớp; `?giao-dien=goc` giữ nguyên màn vào cũ cho người thẩm định.
- **FR-007**: Liên kết `?lop=` và `?lang=` chạy như trước. Không đổi luật chơi, điểm số hay dữ liệu gửi đi. Không sửa `js/engine.js`, `js/app.js`, `js/backend.js`.
- **FR-008** *(ngoài phạm vi, 3C)*: Menu chung còn số mục theo câu làm rõ 3. Có trang hoặc ngăn «Khám phá thêm» liệt kê các trang rời menu, kèm một dòng mô tả mỗi trang.
- **FR-009**: Có phiếu thử 5 phút (soạn sẵn; buổi thử hoãn theo 5C) và bảng kết quả trước/sau, không chứa tên hay dữ liệu cá nhân của người thử.
- **FR-010**: `index.html` trùng byte `academia3d-v2.html`. html-validate 0 lỗi. Mỗi PR nâng `CACHE` trong `sw.js`.

### Thực thể chính

Không có dữ liệu mới. Không có bảng, RPC hay migration Supabase.

## Tiêu chí thành công *(bắt buộc)*

- **SC-001**: Ở 390 px, số việc phải làm để thấy lối vào đúng vai giảm từ «cuộn và tìm trong 98 nút» xuống **0 lần cuộn, 1 lần bấm**.
- **SC-002** *(đo khi có buổi thử, 5C)*: Trong buổi thử sau khi làm, ít nhất 4/5 người hoàn thành mỗi nhiệm vụ trong **≤ 60 giây**, không cần hỏi.
- **SC-003**: Ở màn vào Bật Nghiệp 3D (390 px), nút chơi thử và nút bắt đầu thấy được ngay, không cuộn.
- **SC-004**: Bộ test hiện có của trang chủ, menu và Bật Nghiệp 3D vẫn đạt. Kết quả mô phỏng không đổi.

## Giả định

- Bến Phù Sa vẫn là game miễn phí theo trang Chính sách, nên hợp làm game demo cho khách nếu chị không chọn khác (câu làm rõ 2).
- «Hướng dẫn mở lớp từng bước» của thẻ Giảng viên dùng trang `truong-giang-vien.html` («Lần đầu? Hướng dẫn 5 bước») hiện có. Trang tập huấn giảng viên đầy đủ là việc riêng (đặc tả công cụ giảng viên).
- Màn vào `BizOn Game 3D.html` thuộc hồ sơ quyền tác giả. Câu chuyện 2 chỉ đổi bố cục (HTML/CSS và phần hiện/ẩn các ô), không đổi logic game. Nếu chị thấy vẫn chạm vùng cấm, câu chuyện 2 có thể làm trên bản gọn `bat-nghiep-v2.html` trước (câu làm rõ 4).
- Người thử 5 phút do chị hoặc thầy Tú mời. Em soạn phiếu và tổng hợp kết quả.

## Câu hỏi làm rõ

Đã trả lời ngày 19/11/2026, xem mục «Làm rõ» ở đầu tài liệu.
