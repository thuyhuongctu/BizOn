# Đặc tả tính năng: Nút kêu gọi hành động trang Giải pháp

**Nhánh**: `claude/giai-phap-cta` (thư mục đặc tả `001-giai-phap-cta`)

**Ngày tạo**: 2026-11-08

**Trạng thái**: Bản nháp, chờ chị duyệt

**Đầu vào**: «Rà lại các nút kêu gọi hành động của trang Giải pháp sau khi đổi chính sách: Arcade và Bến Phù Sa miễn phí;
Bật Nghiệp và Hộ Chiếu Thương Hiệu dùng thử một học kỳ, dùng tiếp cần giấy phép. Mỗi khối một hành động chính rõ ràng
cho đúng người đọc; nút gói giá mang theo gói đã chọn sang trang Liên hệ; câu chữ khớp chính sách; giữ phong cách đất
sét và song ngữ VI/EN.»

## Hiện trạng (đo ngày 08/11/2026)

- Đầu trang có **3 nút ngang hàng**: «Chơi thử ngay →» (vào Bật Nghiệp), «Bản 3D», «Hợp tác cùng nhóm». Người đọc
  chính của trang là giảng viên và lãnh đạo khoa, nhưng hành động nổi bật nhất lại là chơi game.
- Ba gói giá (Pilot Classroom, Instructor Pro, Institution Pass) có ba nút «Đăng ký pilot / Liên hệ / Đặt lịch demo»,
  **cả ba trỏ về cùng một trang Liên hệ trống**, khách phải tự gõ lại mình quan tâm gói nào.
- Khối cuối trang viết «Bắt đầu học kỳ dùng thử ngay hôm nay…» nhưng nút chính ghi **«Bắt đầu chơi»** và dẫn thẳng
  vào game; chữ và nút không khớp nhau, và không có lối nào để *đăng ký* học kỳ dùng thử.
- Trang có 21 liên kết hành động; năm thẻ năng lực mỗi thẻ có 1–2 liên kết phụ «→» (giữ nguyên, ngoài phạm vi).

## Kịch bản người dùng và kiểm thử *(bắt buộc)*

### Câu chuyện 1 – Giảng viên đăng ký học kỳ dùng thử (Ưu tiên: P1)

Giảng viên khởi nghiệp hay kinh doanh quốc tế vào trang Giải pháp, đọc qua và muốn dùng BizOn cho lớp học kỳ tới.
Họ thấy ngay một nút chính là đăng ký học kỳ dùng thử, bấm vào thì sang trang Liên hệ với chủ đề và nội dung thư đã
điền sẵn, chỉ cần thêm tên và gửi.

**Vì sao P1**: đây là hành động chính sách mới mở ra cho giảng viên và là lý do trang tồn tại.

**Kiểm độc lập**: mở trang, bấm nút chính ở đầu trang → trang Liên hệ hiện chủ đề «Hợp tác giảng dạy» và nội dung
thư nhắc «học kỳ dùng thử Bật Nghiệp / Hộ Chiếu Thương Hiệu».

**Kịch bản chấp nhận**:

1. **Khi** khách mở trang Giải pháp ở 390 px, **thì** trong khung nhìn đầu tiên có đúng một nút chính (nổi bật nhất),
   nội dung là đăng ký học kỳ dùng thử; các nút còn lại trông là nút phụ.
2. **Khi** bấm nút chính, **thì** trang Liên hệ mở với chủ đề và lời nhắn điền sẵn đúng việc «học kỳ dùng thử», bằng
   đúng ngôn ngữ khách đang xem.
3. **Khi** khách đang xem tiếng Anh, **thì** chữ trên nút và lời nhắn điền sẵn là tiếng Anh.

---

### Câu chuyện 2 – Lãnh đạo khoa chọn gói triển khai (Ưu tiên: P2)

Trưởng khoa hay cán bộ mua sắm xem ba gói giá, bấm nút của gói mình quan tâm và sang trang Liên hệ với tên gói đã
ghi sẵn trong thư, khỏi phải gõ lại.

**Vì sao P2**: giúp nhóm biết khách hỏi gói nào; không có thì vẫn liên hệ được, chỉ phiền hơn.

**Kiểm độc lập**: bấm nút từng gói → thư điền sẵn nhắc đúng tên gói ấy.

**Kịch bản chấp nhận**:

1. **Khi** bấm nút gói Pilot Classroom, **thì** thư điền sẵn nhắc «Pilot Classroom»; tương tự với Instructor Pro và
   Institution Pass (gói này mở lời hẹn lịch demo).
2. **Khi** khách sửa chủ đề hay lời nhắn trước khi gửi, **thì** phần sửa được giữ, không bị điền đè.
3. **Khi** đường dẫn mang tên gói lạ hoặc bị sửa tay, **thì** trang Liên hệ vẫn mở bình thường với ô trống, không lỗi.

---

### Câu chuyện 3 – Sinh viên hay khách tò mò muốn chơi ngay (Ưu tiên: P3)

Người chỉ muốn chơi vẫn tìm được lối vào game, nhưng lối ấy ghi rõ là bản miễn phí hay bản dùng thử, đúng chính sách.

**Vì sao P3**: người chơi đã có trang Games và trang chủ; ở trang Giải pháp đây là hành động phụ.

**Kiểm độc lập**: nút phụ «chơi» ở đầu trang và cuối trang ghi đúng loại (miễn phí hay dùng thử) và dẫn đúng game.

**Kịch bản chấp nhận**:

1. **Khi** khách bấm nút phụ chơi ngay, **thì** vào Bến Phù Sa (miễn phí) hoặc Bật Nghiệp với chữ «dùng thử»; không
   còn nút nào ghi chung chung «Bắt đầu chơi» dưới câu «học kỳ dùng thử».
2. **Khi** đọc khối cuối trang, **thì** chữ và nút nói cùng một việc.

### Trường hợp biên

- Khách tắt JavaScript: các nút vẫn là liên kết thường, vẫn sang được trang Liên hệ (chỉ không điền sẵn).
- Khách đổi ngôn ngữ trên trang Liên hệ sau khi đã điền sẵn: lời nhắn đã điền không bị xóa.
- Màn hẹp 360 px: nút chính không xuống dòng cắt chữ, các nút không tràn ngang, vùng chạm ≥ 44 px.
- Chế độ tối: nút chính vẫn đủ tương phản (≥ 4,5).
- Ứng dụng thư không có: trang Liên hệ vẫn hiện hộp thư chung để khách tự gửi (như hiện nay).

## Yêu cầu *(bắt buộc)*

### Yêu cầu chức năng

- **FR-001**: Mỗi khối có nút (đầu trang, gói giá, cuối trang) PHẢI có đúng một nút chính nổi bật; các nút khác là
  nút phụ, trông khác hẳn nút chính.
- **FR-002**: Nút chính đầu trang và cuối trang PHẢI là «đăng ký học kỳ dùng thử» cho giảng viên, dẫn sang trang Liên
  hệ với chủ đề và lời nhắn điền sẵn.
- **FR-003**: Nút của mỗi gói giá PHẢI mang tên gói sang trang Liên hệ; trang Liên hệ PHẢI điền tên gói vào lời nhắn.
- **FR-004**: Trang Liên hệ PHẢI bỏ qua tên gói không hợp lệ và không bao giờ điền đè phần khách đã tự gõ.
- **FR-005**: Lối vào game trên trang Giải pháp PHẢI ghi đúng chính sách: Bến Phù Sa / Arcade «miễn phí», Bật Nghiệp
  và Hộ Chiếu Thương Hiệu «dùng thử»; không còn nút «Bắt đầu chơi» chung chung.
- **FR-006**: Mọi chữ mới PHẢI có bản tiếng Việt và tiếng Anh; lời nhắn điền sẵn theo ngôn ngữ đang xem.
- **FR-007**: Giữ nguyên năm thẻ năng lực và liên kết phụ của chúng, bảng giá, khối bằng chứng; chỉ đổi nút hành động
  và câu chữ đi kèm nút.
- **FR-008**: Không thu thập dữ liệu mới: điền sẵn chỉ diễn ra trong trình duyệt của khách, trang vẫn không lưu gì.

### Thực thể chính

- **Ý định liên hệ**: loại việc khách muốn (học kỳ dùng thử, gói Pilot Classroom, Instructor Pro, Institution Pass,
  hợp tác chung), quyết định chủ đề và lời nhắn điền sẵn ở trang Liên hệ.

## Tiêu chí thành công *(bắt buộc)*

### Kết quả đo được

- **SC-001**: Ở 390 px, trong khung nhìn đầu tiên có đúng 1 nút chính; ở 360 px không tràn ngang và mọi nút ≥ 44 px.
- **SC-002**: Từ trang Giải pháp tới thư đã điền sẵn chủ đề và lời nhắn đúng ý định: tối đa 1 lần bấm, cho cả 4 ý
  định (dùng thử và 3 gói).
- **SC-003**: 0 nút trên trang Giải pháp ghi chữ không khớp chính sách (đếm theo danh sách chữ cấm trong test).
- **SC-004**: 100% nút mới có chữ song ngữ; tương phản nút chính ≥ 4,5 ở cả chế độ sáng và tối.
- **SC-005** (sau khi chạy thật, ghi nhận chứ không chặn PR): tỉ lệ thư hỏi có ghi rõ gói hay học kỳ dùng thử tăng
  so với trước, theo hộp thư chung trong một học kỳ.

## Giả định

- Đích của nút đăng ký là trang Liên hệ hiện có (soạn email, không có máy chủ nhận đơn); không làm biểu mẫu mới.
- Chủ đề điền sẵn dùng mục «Hợp tác giảng dạy» sẵn có; tên gói nằm trong lời nhắn, không thêm mục chủ đề mới.
- Giá và quyền lợi các gói giữ nguyên như trang hiện tại (giá dự kiến giai đoạn pilot).
- Nút phụ chơi ngay ở đầu trang dẫn vào Bến Phù Sa (miễn phí) để khách thử không cần đăng ký; Bật Nghiệp vẫn có lối
  trong thẻ năng lực.
- `cta.gallery` chỉ để tham khảo nguyên tắc (một hành động chính mỗi khối, chữ nói kết quả), không chép thiết kế.
- `giai-phap.html` không thuộc hồ sơ quyền tác giả đang thẩm định nên sửa được.
