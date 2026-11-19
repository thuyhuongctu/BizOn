# Đặc tả tính năng: Công cụ giảng viên sau buổi UMK

**Nhánh**: `claude/cong-cu-giang-vien` (thư mục đặc tả `007-cong-cu-giang-vien`)

**Ngày tạo**: 2026-11-19

**Trạng thái**: Bản nháp, chờ chị trả lời phần làm rõ

**Đầu vào**:
- Kiểm tra trước buổi UMK (19/11/2026): Màn hình lớp học chưa có tab Bật Nghiệp, nên kế hoạch dạy phải dùng Trang Giảng viên → «Tiến độ 6 vòng».
- Góp ý của thầy Tú (19/11/2026):
  - «Toàn bộ quá trình chơi của 1 đứa, nó sẽ ra quyết định dựa vào cái gì, cần được ghi nhận lại.»
  - «Nếu mở lớp tập huấn cho GV thì mình cũng phải làm rất rõ các bước, vì tương lai sẽ mở rộng toàn trường cho các cuộc thi khởi nghiệp.»

## Hiện trạng (đọc mã ngày 19/11/2026, main ở `bizon-v898`)

- **Màn hình lớp học** (`man-hinh-lop-hoc.html`, `js/man-hinh-lop-hoc.js`, `js/man-hinh-lop-hoc-data.js`):
  - có ba tab Bến Phù Sa, Hộ Chiếu Thương Hiệu, Hộ Chiếu Sầu Riêng (`GAMES` trong `man-hinh-lop-hoc-data.js`, dòng 15–19);
  - mỗi tab có một sa bàn 3D riêng và bảng 10 nhóm đầu;
  - tiến độ trực tiếp lấy từ `live_progress`, nhưng Bật Nghiệp **không** gửi `live_progress` (chỉ năm trang khác nạp `js/live-progress.js`).
- **Dữ liệu Bật Nghiệp sẵn có**: RPC `bizon_submissions_v2` (giảng viên đã đăng nhập) trả từng lượt nộp theo đội và vòng. Trang Giảng viên xếp đội theo lợi nhuận (`js/bizon-grading.js`, dòng 31). Không cần bảng hay migration mới để vẽ tiến độ 6 vòng.
- **Ghi quá trình ra quyết định** (`js/member-log.js`, `js/decision-log.js`):
  - đã ghi đề xuất theo vai (CFO, CMO, COO), biên bản vòng của SEC, quyết định CEO chốt và mỗi lần chạy thử «Nếu–Thì»;
  - **chưa** ghi lý do («vì sao») của từng quyết định;
  - `decision-log.js` (dữ liệu nghiên cứu) đang **tắt** sau cờ đồng thuận;
  - giảng viên chưa có màn xem lại dòng thời gian của từng đội hay từng sinh viên.
- **Hướng dẫn giảng viên**: có `truong-giang-vien.html` («Năm bước mở lớp», bộ công cụ, chấm trên số liệu đã chốt, yêu cầu kỹ thuật, câu hỏi thường gặp) và `giang-vien.html`. Chưa có tài liệu tập huấn **theo đúng trình tự một buổi dạy** kèm ảnh chụp từng bước và bản in.
- Hồ sơ quyền tác giả: không sửa `js/engine.js`, `js/app.js`, `js/backend.js`. Luồng chốt quyết định nằm trong `js/app.js`, nên mọi phần thêm vào lúc chốt phải là mô-đun móc ngoài, theo kiểu `js/market-dynamic.js`.

## Làm rõ

*(chờ chị trả lời, xem cuối tài liệu)*

## Kịch bản người dùng và kiểm thử *(bắt buộc)*

### Câu chuyện 1 – Tab Bật Nghiệp trên Màn hình lớp học (Ưu tiên: P1)

Giảng viên chiếu Màn hình lớp học trong buổi Bật Nghiệp. Tab «Bật Nghiệp» cho thấy mỗi đội là một xe tải đất sét trên tuyến Cần Thơ → TP. Hồ Chí Minh → Khánh Hòa → Đà Nẵng → Thanh Hóa → Hà Nội, đứng ở chặng ứng với vòng đã chốt. Bên cạnh là bảng xếp hạng theo tiêu chí ở câu làm rõ 1, tự làm mới mỗi 20 giây.

**Vì sao ưu tiên này**: buổi UMK đã thiếu đúng màn này. Dữ liệu đã có sẵn, không cần migration.

**Cách thử độc lập**: mở `man-hinh-lop-hoc.html?game=bn&demo=1` (dữ liệu minh họa) và bản lớp thật khi giảng viên đã đăng nhập. Đổi VI/EN, 1280 và 390 px.

**Kịch bản nghiệm thu**:
1. **Cho** lớp có 32 đội nộp tới vòng 3, **khi** mở tab Bật Nghiệp, **thì** sa bàn đặt từng đội ở chặng 3, bảng hiện 10 đội đầu và số «32 đội đã nộp vòng 3».
2. **Cho** một đội vừa chốt vòng 4, **khi** tới lượt làm mới, **thì** xe của đội tiến sang chặng 4 mà không phải tải lại trang.
3. **Cho** chế độ EN, **khi** mở tab, **thì** không còn chữ Việt ngoài tên riêng (theo `test/man-hinh-lop-hoc-en.test.js`).
4. **Cho** giảng viên chưa đăng nhập, **khi** mở, **thì** hiện màn đăng nhập như ba tab kia, không lộ dữ liệu lớp.

### Câu chuyện 2 – Tài liệu tập huấn giảng viên theo trình tự một buổi dạy (Ưu tiên: P2)

Giảng viên mới (sau này là giảng viên toàn trường) mở trang «Tập huấn giảng viên» và đi theo các bước của một buổi dạy:
1. tạo lớp;
2. gửi mã hoặc link cho sinh viên;
3. chiếu Màn hình lớp học;
4. theo dõi tiến độ;
5. chốt số liệu và chấm;
6. xuất kết quả và chứng nhận.

Mỗi bước có một ảnh chụp màn hình thật, một việc cần làm, một lỗi hay gặp và cách xử lý. Có bản in (PDF) và bản tiếng Anh.

**Vì sao ưu tiên này**: thầy Tú cần lớp tập huấn rõ từng bước trước khi mở rộng toàn trường.

**Cách thử độc lập**: một người chưa từng mở lớp đọc tài liệu và mở được lớp demo, chiếu được Màn hình lớp học trong ≤ 10 phút.

**Kịch bản nghiệm thu**:
1. **Cho** trang tập huấn, **khi** in, **thì** ra bản A4 gọn, mỗi bước một khối, ảnh không vỡ.
2. **Cho** ảnh chụp từng bước, **khi** giao diện đổi (câu chuyện 1 của đặc tả 006), **thì** có script chụp lại ảnh tự động, không chụp tay.
3. **Cho** chế độ EN, **khi** mở, **thì** toàn bộ chữ bằng tiếng Anh.

### Câu chuyện 3 – Lý do ra quyết định và dòng thời gian từng đội (Ưu tiên: P3)

Khi CEO bấm Chốt, đội chọn nhanh 1–2 lý do có sẵn, ví dụ «giá đối thủ», «tồn kho», «dòng tiền», «biến cố vòng này», «Lumina gợi ý», kèm một dòng ghi chú không bắt buộc. Trang Giảng viên có dòng thời gian theo đội: đề xuất theo vai → chạy thử «Nếu–Thì» → lý do → quyết định chốt → kết quả.

**Vì sao ưu tiên này**: đáp ý thầy Tú về «ra quyết định dựa vào cái gì». Nhưng đây là thêm dữ liệu người học và làm chậm lúc chốt, nên làm sau, theo câu làm rõ 3.

**Cách thử độc lập**: chơi một ván lớp demo, chọn lý do ở mỗi vòng, mở Trang Giảng viên thấy đủ dòng thời gian.

**Kịch bản nghiệm thu**:
1. **Cho** đội đang chốt vòng, **khi** chọn lý do, **thì** việc chọn tốn ≤ 2 lần chạm và có thể bỏ qua (theo câu làm rõ 3).
2. **Cho** ván chơi thử không có mã lớp, **khi** chốt, **thì** không gửi gì lên máy chủ (nguyên tắc V).
3. **Cho** cùng hạt giống và cùng quyết định, **khi** chơi, **thì** kết quả trùng từng con số với bản hiện nay.

### Trường hợp biên

- Lớp đông (160–200 sinh viên, 32–40 đội): sa bàn hiện 10 đội đầu, các đội còn lại chỉ đếm (giống ba tab kia).
- Đội nộp lại một vòng: chỉ tính bản mới nhất.
- Mất mạng giữa buổi: Màn hình lớp học giữ số liệu lần cuối, ghi giờ cập nhật.

## Yêu cầu *(bắt buộc)*

### Yêu cầu chức năng

- **FR-001**: Màn hình lớp học có tab thứ tư «Bật Nghiệp / Bat Nghiep», đọc `bizon_submissions_v2`, vẽ tuyến 6 thành phố với mỗi đội ở chặng bằng vòng đã chốt, bảng 10 đội đầu xếp theo câu làm rõ 1. Có dữ liệu minh họa khi `demo=1`.
- **FR-002**: Tab Bật Nghiệp tự làm mới mỗi 20 giây, có trạng thái chưa đăng nhập, trống, lỗi và mất mạng như ba tab kia. VI/EN đủ.
- **FR-003**: Có trang tập huấn giảng viên theo 6 bước của một buổi dạy, mỗi bước có ảnh chụp thật, việc cần làm và lỗi hay gặp, kèm bản in A4 và bản EN. Ảnh chụp sinh bằng script Playwright, dùng lớp demo.
- **FR-004** (P3, phụ thuộc câu làm rõ 3): lúc chốt vòng có chọn nhanh lý do (danh sách cố định, VI/EN) và một dòng ghi chú. Lý do đi theo dữ liệu nộp vòng hiện có khi có mã lớp. Không gửi gì khi chơi thử.
- **FR-005** (P3): Trang Giảng viên có dòng thời gian theo đội (đề xuất, chạy thử, lý do, quyết định, kết quả). Chỉ chủ lớp xem được.
- **FR-006**: Không sửa `js/engine.js`, `js/app.js`, `js/backend.js`. Không đổi luật hay điểm. Mỗi PR nâng `CACHE` trong `sw.js`, html-validate 0 lỗi.

### Thực thể chính

- **Lý do quyết định** (chỉ P3): mã lý do (danh sách cố định), ghi chú ≤ 140 ký tự, vòng, đội. Nếu không đi được theo dữ liệu nộp vòng hiện có, cần migration mới, đưa thành câu hỏi cho chị trước khi làm.

## Tiêu chí thành công *(bắt buộc)*

- **SC-001**: Buổi Bật Nghiệp sau chiếu được tiến độ cả lớp trên Màn hình lớp học, không phải mở Trang Giảng viên.
- **SC-002**: Một giảng viên mới mở được lớp demo và chiếu Màn hình lớp học trong ≤ 10 phút chỉ nhờ tài liệu tập huấn.
- **SC-003** (P3): ≥ 80% lượt chốt vòng trong lớp có lý do; lúc chốt chậm thêm không quá 10 giây (đo ở buổi thử).

## Giả định

- Vòng ứng với thành phố theo đúng thứ tự trong game: Cần Thơ, TP. Hồ Chí Minh, Khánh Hòa, Đà Nẵng, Thanh Hóa, Hà Nội.
- Trang tập huấn viết cho Bật Nghiệp trước. Các game khác thêm sau theo cùng khuôn.
- «Toàn bộ quá trình của một sinh viên»: trong game, quyết định là của đội, còn đề xuất theo vai đã gắn với từng sinh viên qua `member-log`. Dòng thời gian vì thế xem theo đội, mỗi dòng ghi vai nào đề xuất.

## Câu hỏi làm rõ (chờ chị trả lời)

1. **Bảng xếp hạng tab Bật Nghiệp xếp theo gì?**
   - **A (đề xuất)**: lợi nhuận lũy kế, giống Trang Giảng viên (`bizon-grading.js`), để hai màn khớp nhau.
   - B: doanh thu lũy kế.
   - C: điểm tổng game tính ở cuối ván. Trước vòng 6, xếp theo lợi nhuận.
2. **Trang tập huấn đặt ở đâu?**
   - **A (đề xuất)**: viết lại `truong-giang-vien.html` theo 6 bước của một buổi dạy, giữ địa chỉ cũ (đã có liên kết «Lần đầu? Hướng dẫn 5 bước»).
   - B: trang mới `tap-huan-giang-vien.html`, giữ nguyên trang cũ.
3. **Phần «vì sao ra quyết định» (câu chuyện 3)**
   - **A (đề xuất)**: làm sau câu chuyện 1 và 2, lý do **không bắt buộc** (có nút bỏ qua), chỉ dùng chấm trong lớp; muốn dùng cho nghiên cứu thì cần phiếu đồng thuận riêng.
   - B: bắt buộc chọn lý do mới chốt được.
   - C: chưa làm, chờ báo cáo rút kinh nghiệm buổi UMK.
