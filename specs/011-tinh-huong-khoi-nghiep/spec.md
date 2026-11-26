# Đặc tả tính năng: Tình huống khởi nghiệp «Kiểm định ý tưởng» và «Ra thị trường» (không dùng AI)

**Nhánh**: `claude/tinh-huong-khoi-nghiep` (thư mục đặc tả `011-tinh-huong-khoi-nghiep`)

**Ngày tạo**: 2026-11-25

**Trạng thái**: Đã làm rõ (25/11/2026), có kế hoạch và danh sách việc; chờ Hương duyệt trước khi làm PR 1.

**Đầu vào**: Hương duyệt ngày 25/11/2026 ba gợi ý rút từ repo `awesome-ai-apps`. Gợi ý thứ ba là «Startup Idea Validator»: làm thành bộ tình huống kiểm định ý tưởng và chiến lược ra thị trường cho thư viện tình huống, không dùng AI.

## Hiện trạng (đọc kho ngày 25/11/2026, main ở `880670ed`)

- **Thư viện tình huống** (`thu-vien-tinh-huong.html`, `js/cham-library.js`) có **3 case thật**:
  - CHAM Homestay: đầy đủ 4 bước, bậc 2;
  - Bến Phù Sa: có mô phỏng, bậc 1;
  - Hộ Chiếu Sầu Riêng: có mô phỏng, bậc 3.
- Ngoài ra có 12 «Case mẫu» chỉ để minh họa quy mô, chỉ hiện khi thêm `?mau=1`. Đây không phải nội dung thật.
- **Chưa có tình huống nào** dạy riêng hai việc:
  - kiểm định ý tưởng: vấn đề có thật không, hỏi khách thế nào cho đúng, thử rẻ trước khi làm lớn;
  - chọn đường ra thị trường: phân khúc đầu tiên, kênh, giá, thị trường nước ngoài đầu tiên.
- Bến Phù Sa có «thử nhanh hay nhân rộng», nhưng đó là quyết định trong trò chơi, không phải tình huống có phân tích.
- **Bộ đo trước – sau `ct-v1`** (`js/case-task-data.js`) là công cụ nghiên cứu. Nó đo các cơ chế Uppsala, outsidership, khoảng trống thể chế và effectuation bằng tình huống cá tra sang Nhật, xoài sấy Hàn Quốc… **Không được sửa** bộ này. Tình huống mới cũng **không được lặp bề mặt câu chuyện** của nó, để không làm hỏng phép đo.

## Làm rõ

Hương trả lời ngày 25/11/2026:

| # | Câu hỏi | Hương chọn | Ảnh hưởng |
|---|---|---|---|
| 1 | Nội dung lấy từ đâu | **Giả định, ghi rõ** | FR-005: mọi tình huống ghi «tình huống giả định, dựng từ các mẫu thường gặp ở ĐBSCL» trên thẻ thư viện và trong trang; không gắn tên doanh nghiệp có thật. |
| 2 | Phản hồi sau lựa chọn | **Không chấm, chỉ hệ quả** | FR-002: không có điểm, không gắn «đáp án đúng» trên màn hình; chỉ hệ quả, «Vì sao?», câu hỏi phản biện. Nhãn logic từng phương án chỉ dùng khi phân tích CSV. |
| 3 | Ghi lý do | **Bắt buộc một câu** | Kịch bản nghiệm thu 1.2: chưa có lý do (dưới 10 ký tự) thì chưa mở được hệ quả. |
| 4 | Đặt ở đâu | **Trang mới + thẻ thư viện** | FR-006: trang `lab/khoi-nghiep-tinh-huong.html`; thẻ trong thư viện trỏ sang, như Bến Phù Sa; không đổi luồng 4 bước của CHAM. |

## Kịch bản người dùng và kiểm thử *(bắt buộc)*

### Câu chuyện 1 – Bộ «Kiểm định ý tưởng» (Ưu tiên: P1)

**Người dùng:** sinh viên cá nhân hoặc đội, trên lớp hoặc ở nhà, bằng điện thoại hoặc máy chiếu.

**Hành trình:**
- Mở bộ tình huống từ thư viện (thẻ mới, bậc 1, ngành Khởi nghiệp).
- Gặp lần lượt khoảng 4 tình huống ngắn. Mỗi tình huống có bối cảnh ở ĐBSCL, một quyết định và 3–4 phương án.
- Chọn phương án, ghi một câu lý do, rồi xem điều xảy ra tiếp theo luật soạn sẵn.
- Phần «Vì sao?» nêu khung lý thuyết và câu hỏi phản biện.
- Cuối bộ có bảng tổng kết các lựa chọn và lý do.

**Bốn tình huống:**
- vấn đề có thật không (problem–solution fit);
- hỏi khách đúng cách: hỏi chuyện đã xảy ra, không hỏi «bạn có mua không»;
- thử rẻ trước: trang đặt trước, lô nhỏ, bán thử ở chợ;
- đọc tín hiệu để đổi hướng hay đi tiếp.

**Vì sao ưu tiên này:** đây là bước đầu của mọi ý tưởng khởi nghiệp, và thư viện đang thiếu. Làm riêng bộ này đã dùng được cho buổi Khởi đầu.

**Cách thử độc lập:** mở trang, chơi hết bộ bằng một chuỗi lựa chọn mẫu. Mỗi lựa chọn hiện đúng hệ quả đã soạn; tổng kết ghi đủ lựa chọn và lý do; không có dữ liệu nào gửi đi.

**Kịch bản nghiệm thu:**
1. **Cho** sinh viên ở tình huống «hỏi khách», **Khi** chọn «hỏi 20 người quen: bạn có mua không?», **Thì** trang hiện hệ quả (nhiều lời khen, ít đơn hàng thật) và «Vì sao?» về lời khen và bằng chứng hành vi, kèm câu hỏi phản biện.
2. **Cho** sinh viên chưa ghi lý do, **Khi** bấm xem hệ quả, **Thì** trang nhắc ghi một câu lý do trước. Lý do bắt buộc, ít nhất 10 ký tự (làm rõ 3).
3. **Cho** sinh viên đã chơi hết bộ, **Khi** mở tổng kết, **Thì** thấy từng tình huống, lựa chọn, lý do. Có nút in và xuất tệp.

---

### Câu chuyện 2 – Bộ «Ra thị trường» (Ưu tiên: P2)

**Hành trình:** cùng khuôn với Câu chuyện 1, khoảng 4 tình huống:
- chọn phân khúc đầu tiên (beachhead);
- chọn kênh;
- định giá ra mắt;
- chọn thị trường nước ngoài đầu tiên.

Tình huống cuối nối sang Go Global và Hộ Chiếu Sầu Riêng để chơi tiếp.

**Cách thử độc lập:** như Câu chuyện 1. Tình huống thị trường nước ngoài có liên kết đúng sang game.

**Kịch bản nghiệm thu:**
1. **Cho** sinh viên ở tình huống «định giá ra mắt», **Khi** chọn giá thấp hơn biến phí để «chiếm thị phần», **Thì** hệ quả cho thấy càng bán càng lỗ, kèm công thức biên đóng góp.
2. **Cho** sinh viên ở tình huống «thị trường nước ngoài đầu tiên», **Khi** xem «Vì sao?», **Thì** có liên kết sang `global.html` và giải thích khoảng cách tâm lý, rủi ro và cam kết theo từng bước.

---

### Câu chuyện 3 – Ghi chú giảng viên và kết quả lớp (Ưu tiên: P3)

**Hành trình:**
- Giảng viên mở ghi chú cho từng tình huống: mục tiêu, thời lượng, câu hỏi thảo luận, phương án nào thường gặp.
- Giảng viên nhận tệp CSV mà các đội xuất, rồi gộp nhiều tệp để xem phân bố lựa chọn của lớp.

**Cách thử độc lập:** nạp 3 tệp CSV mẫu; bảng phân bố đếm đúng.

### Trường hợp biên

- 360 px: bối cảnh, phương án và hệ quả đọc được, không tràn ngang; nút ≥ 44 px.
- Đổi ngôn ngữ giữa chừng không mất lựa chọn đã làm.
- Tải lại trang thì giữ tiến độ trong trình duyệt; có nút làm lại từ đầu.
- Ngoại tuyến sau lần mở đầu; VI/EN đủ; không gọi dịch vụ ngoài.

## Yêu cầu *(bắt buộc)*

### Yêu cầu chức năng

- **FR-001:** Mỗi bộ có khoảng 4 tình huống, mỗi tình huống có 3–4 phương án. Mỗi phương án có hệ quả, phần «Vì sao?» và câu hỏi phản biện soạn sẵn, VI/EN, trong một tệp dữ liệu tĩnh.
- **FR-002:** Phản hồi theo luật soạn sẵn, không dùng AI. Lumina (nếu xuất hiện) là cố vấn chạy theo luật, không chọn thay sinh viên. Không chấm điểm, không hiện «đáp án đúng» (làm rõ 2).
- **FR-003:** Mọi khung lý thuyết trong «Vì sao?» có trích dẫn APA, DOI kiểm được bằng `scripts/research/kiem-trich-dan.mjs` khi có.
- **FR-004:** Không sửa `js/case-task-data.js` (`ct-v1`). Không dùng lại bề mặt câu chuyện của bộ đo; test kiểm điều này.
- **FR-005:** Tình huống giả định, ghi rõ trên thẻ và trong trang; không gắn tên doanh nghiệp có thật; số liệu là số minh họa (làm rõ 1).
- **FR-006:** Bộ tình huống có thẻ trong thư viện (bậc, ngành, vùng, trạng thái). Thẻ không đổi gì ở 3 case hiện có.
- **FR-007:** Kết quả lưu trong trình duyệt; in và xuất CSV. Không gửi máy chủ, không migration.

### Thực thể chính

- **Tình huống:** mã, bộ, bối cảnh VI/EN, câu hỏi quyết định, phương án.
- **Phương án:** mã, nhãn VI/EN, hệ quả VI/EN, «Vì sao?» VI/EN, câu hỏi phản biện, nhãn logic dùng khi phân tích.
- **Lượt chơi:** bộ, thời điểm, lựa chọn, lý do.

## Tiêu chí thành công *(bắt buộc)*

- **SC-001:** Một sinh viên chơi hết một bộ trong 20–30 phút, không cần giảng viên giải thích luật.
- **SC-002:** 100 % phương án có hệ quả, «Vì sao?» và câu hỏi phản biện ở cả hai thứ tiếng.
- **SC-003:** Mọi trích dẫn qua `kiem-trich-dan.mjs` không lỗi.
- **SC-004:** 360 px không tràn ngang; `html-validate` 0 lỗi; không lỗi JS; không gọi mạng ngoài.

## Nối chuẩn đầu ra

| Câu chuyện | Chuẩn đầu ra | Cách nối |
|---|---|---|
| 1 | CLO-A «Quyết định Giá & Marketing», mức Phân tích | Hiểu khách hàng trước khi định giá và tiếp thị |
| 2 | CLO-A; CLO-D «BizOn Go Global», mức Đánh giá | Định giá ra mắt, kênh; thị trường nước ngoài đầu tiên và phương thức |
| 1, 2 | CLO-E «ra quyết định dưới áp lực» khi chơi theo đội | Đội thống nhất lựa chọn và lý do |

## Giả định

- Bối cảnh ngành hàng ĐBSCL: nông sản, thực phẩm chế biến, du lịch, thủ công.
- Một bộ khoảng 4 tình huống, đủ cho một buổi 30 phút.
- Nằm ở trang mới trong `lab/`, có thẻ trong thư viện, giống cách Bến Phù Sa và Hộ Chiếu Sầu Riêng đang trỏ ra trang mô phỏng.

## Câu hỏi gửi Hương

Gửi trong tin nhắn ngày 25/11/2026; câu trả lời sẽ ghi vào mục «Làm rõ».
