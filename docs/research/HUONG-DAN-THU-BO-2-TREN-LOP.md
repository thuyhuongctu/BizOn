# Hướng dẫn thử bộ câu hỏi kiến thức bản 2 trên một lớp (dành cho giảng viên)

**Áp dụng:** lớp dùng game Bật Nghiệp, học kỳ 1 năm học 2026–2027 trở đi. **Mục đích:** kiểm tra bộ 2 (`batnghiep2`) có đo được thay đổi
kiến thức hay không trước khi dùng cho mọi lớp. Bộ 1 đã chạm trần ở đợt 10/2026 (trung bình 14,2/15 ngay từ phiếu trước).
**Nội dung bộ 2 và đáp án:** `docs/research/BO-CAU-HOI-KIEN-THUC-V2.md`. **Thời gian giảng viên bỏ ra thêm:** khoảng 20 phút cho cả đợt.

## 1. Điều kiện của lớp thử

| Điều kiện | Yêu cầu | Vì sao |
|---|---|---|
| Sĩ số | ≥ 30 sinh viên có mặt cả hai buổi | Dưới 30 thì tỷ lệ đúng từng câu dao động quá lớn để kết luận |
| Chưa chơi Bật Nghiệp | Sinh viên chưa chơi game trong học phần nào trước đó | Phiếu trước phải đo kiến thức «chưa qua game» |
| Một mã lớp duy nhất | Giảng viên đăng ký mã lớp ở Instructor Studio và chỉ dùng mã đó trong cả đợt | Đợt 10/2026 mất 27 phiếu vì gõ mã lớp lệch nhau |
| Một bộ câu hỏi cho cả đợt | Phiếu trước và phiếu sau cùng dùng bộ 2 | Phiếu khác bộ không ghép được với nhau |

## 2. Chuẩn bị (10 phút, trước buổi học đầu)

1. Mở **Instructor Studio** (`app/instructor-studio.html`) → đăng nhập → ô «Mã lớp» → đăng ký mã lớp (viết hoa, không dấu cách, ví dụ `KTM330HM03`).
2. Tab **Khảo sát** → ô «Bộ câu hỏi» chọn **Bộ Khởi nghiệp 2 (từ 11/2026)** → bấm **Chép link phiếu TRƯỚC** và **Chép link phiếu SAU**, dán hai link vào ghi chú riêng.
   Link có dạng `khao-sat-online.html?lop=KTM330HM03&phieu=truoc&bo=batnghiep2`; mã lớp và bộ câu hỏi đã được khóa sẵn, sinh viên không gõ gì thêm.
3. Lớp không có điện thoại hoặc mạng yếu: in phiếu từ `khao-sat.html?bo=batnghiep2` (nhãn «BỘ 2» hiện trên phiếu, câu 2, 3, 10, 13, 15 đã thay). Sau buổi, giảng viên nhập lại phiếu giấy qua link online, mỗi phiếu một lần.
4. Chuẩn bị bảng mã sinh viên: mỗi sinh viên **một mã tự đặt 2 chữ cái + 2 số** (ví dụ `HT25`) ghi vào sổ của mình; giảng viên nhắc: «Dùng lại đúng mã này ở phiếu sau». Lớp đông thì giảng viên phát mã sẵn theo danh sách để tránh trùng.

## 3. Buổi 1: phiếu TRƯỚC (10 phút, trước khi giới thiệu game)

1. Chiếu link phiếu TRƯỚC (hoặc mã QR); sinh viên làm trên điện thoại, 10 phút.
2. Nói với lớp đúng ba ý: phiếu ẩn danh, không lấy điểm; **được dùng máy tính** cho các câu có số; trả lời theo hiểu biết hiện tại, không tra cứu, không hỏi nhau.
3. Không giải thích câu hỏi, không chữa đáp án sau khi nộp (đáp án sẽ lộ sang phiếu sau).
4. Kiểm tra ngay: Instructor Studio → tab Khảo sát → **Tải khảo sát**; số phiếu trước phải xấp xỉ sĩ số. Thiếu nhiều thì nhắc nộp trước khi bắt đầu chơi.

## 4. Chơi game như bình thường

Tối thiểu 4 vòng, tốt nhất đủ 6 vòng, có phần «Vì sao?» sau mỗi vòng và buổi tổng kết (debrief). Không nhắc lại nội dung các câu hỏi trong lúc chơi hay tổng kết.

## 5. Buổi cuối: phiếu SAU (12 phút, sau tổng kết)

1. Chỉ gửi link phiếu SAU **sau khi tổng kết xong** và **cách phiếu trước ít nhất 60 phút** (phiếu nộp sớm hơn sẽ bị loại khi phân tích).
2. Sinh viên gõ đúng mã tự đặt đã dùng, chọn vai trong đội và số vòng đã chơi, rồi làm 15 câu kiến thức, 8 câu tự tin, 5 câu trải nghiệm, điểm giới thiệu và hai câu mở.
3. Kiểm tra: Tải khảo sát → số «cặp ghép» (có cả phiếu trước và sau cùng mã) nên ≥ 80 % sĩ số. Nếu thấp, hỏi lớp ngay trong buổi xem ai quên mã; sinh viên nộp lại với đúng mã, phân tích sẽ lấy phiếu mới nhất.

## 6. Xuất dữ liệu và gửi (3 phút)

1. Mở **Trang Giảng viên** (`Trang Giang Vien.dc.html`) → đăng nhập → mở bảng điều khiển lớp → khối «Bài tình huống» ở cuối trang → bấm **📦 Gói dữ liệu nghiên cứu (ZIP)**.
2. Tệp tải về tên `BizOn-<MÃ LỚP>-goi-du-lieu-nghien-cuu.zip`, đã ẩn danh (không email, không họ tên, không câu trả lời mở). Gửi tệp này cho nhóm nghiên cứu.
3. Nhóm nghiên cứu chạy `node scripts/research/phan-tich-truoc-sau.mjs <thư mục ZIP đã giải nén> --md` và tính thêm tỷ lệ đúng từng câu từ `answers_a`.

## 7. Đọc kết quả thử và quyết định

| Chỉ số | Đạt | Chưa đạt → việc cần làm |
|---|---|---|
| Tỷ lệ đúng từng câu mới (2, 3, 10, 13, 15) ở phiếu trước | 0,40–0,70 | Trên 0,80: thay bằng câu dự phòng cùng cụm (mục 4 của tài liệu bộ 2). Dưới 0,25: xem lại câu chữ, có thể sinh viên hiểu sai đề |
| Tương quan câu–tổng của câu mới | ≥ 0,20 | Dưới 0,20: câu không phân biệt được sinh viên giỏi–yếu, thay |
| Phiếu trước đạt ≥ 14/15 | < 15 % số phiếu | Vượt: thay tiếp câu neo dễ nhất (6, 9, 11, 14, 12) bằng câu dự phòng |
| Cặp ghép được | ≥ 80 % sĩ số | Thấp: lần sau phát mã sẵn theo danh sách thay vì tự đặt |

Đạt cả bốn dòng thì bộ 2 thành bộ mặc định cho các lớp Bật Nghiệp; kết quả lớp thử được báo cáo ở trang Bằng chứng như đợt 10/2026, ghi rõ là lớp thử công cụ, không phải bằng chứng hiệu quả.

## 8. Những điều không làm

- Không chữa đáp án giữa hai phiếu; không chiếu bảng điểm phiếu trước cho lớp.
- Không đổi bộ câu hỏi giữa chừng; không để một nửa lớp làm bộ 1, nửa làm bộ 2.
- Không dùng điểm phiếu làm điểm học phần (phiếu đã ghi «không lấy điểm» trong phần đồng thuận).
- Không gửi gói ZIP kèm danh sách sinh viên hay bảng đối chiếu mã; hai thứ đó giảng viên giữ ngoại tuyến.

## 9. Hỏi nhanh

- **Sinh viên vắng buổi 1 nhưng có mặt buổi cuối?** Vẫn làm phiếu sau; phiếu không ghép được vẫn tính cho phần trải nghiệm và điểm giới thiệu.
- **Thiết bị báo «đã nộp phiếu này rồi»?** Mỗi thiết bị chỉ nộp một lần cho mỗi phiếu và mã; sinh viên dùng thiết bị khác hoặc nhờ giảng viên nhập.
- **Mất mạng lúc nộp?** Phiếu được giữ trong trình duyệt và tự gửi khi có mạng; dặn sinh viên không xóa dữ liệu trình duyệt.
- **Muốn dùng lại bộ 1 để so sánh với đợt 10/2026?** Mười câu neo (1, 4, 5, 6, 7, 8, 9, 11, 12, 14) giống hệt bộ 1, nhóm nghiên cứu tính điểm neo /10 cho cả hai đợt.
