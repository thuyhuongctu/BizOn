# Hiện thân nhân vật bằng thư viện clip tất định

Trạng thái: **hướng thiết kế đã chốt, thuộc giai đoạn sau.** Không phải cam kết đã triển khai. Ghi lại ở đây vì đây là hướng hình ảnh mạnh nhất dự án đang có, và cần được truy vết như mọi quyết định thiết kế khác.

Ngày ghi nhận: 2026-08-04.

## Bối cảnh

Xuất phát từ một clip claymation 10 giây, 1280×720, phong cách noir: nhân vật đất sét mặc vest xanh có phù hiệu **CEO**, đứng trong hẻm mưa đêm, đen trắng chỉ chừa màu xanh trên áo, có lớp chữ "CAM 2 / CAM 3" gợi cảm giác bị quan sát. Khoảnh khắc một người đang gánh áp lực của vai trò mình chọn.

Câu hỏi đặt ra: làm sao để **nhân vật của người chơi phản ứng theo cảnh, có cảm giác hóa thân**, mà không phá vỡ các nguyên tắc lõi?

## Nguyên tắc bị đe dọa nếu sinh video theo từng người chơi

Sinh video riêng cho mỗi người chơi (kiểu Gemini/Veo trong vòng chơi) sẽ phá **bốn** thứ cùng lúc — đúng những lý do đã loại mô hình ngôn ngữ khỏi vòng lặp chấm điểm:

1. **Tính xác định** — cùng đầu vào phải ra cùng kết quả.
2. **Chi phí bằng không mỗi lớp** — giảng viên mở lớp không phát sinh chi phí suy luận.
3. **Hoạt động ngoại tuyến** — chạy khi mạng yếu.
4. **Khả năng tái lập cho nghiên cứu** — kết quả kiểm chứng được.

## Cách đúng: cùng mẫu đã dùng cho hồ sơ neo

**Dựng ngoại tuyến → đóng băng → chọn xác định.**

- Dựng một **thư viện clip hữu hạn** (vài chục clip, không nhiều), mỗi clip chất lượng cao như đoạn 10 giây nói trên.
- **Engine chọn clip theo trạng thái bằng hàm số**, không sinh mới trong lúc chơi.
- Người chơi thấy nhân vật của mình phản ứng đúng lúc; hệ thống vẫn xác định, vẫn offline, vẫn miễn phí mỗi lớp.
- Mỗi clip **dựng một lần, dùng mãi** cho mọi khóa sau.

Đây chính xác là mẫu đã áp dụng cho hồ sơ neo (asset đóng băng, chọn tất định) — không phải cơ chế mới, chỉ là mở rộng sang lớp hình ảnh nhân vật.

## Ba trục tạo cảm giác hóa thân (không cần sinh video)

1. **Tạo nhân vật ở đầu** — vài lựa chọn về dáng, trang phục, phụ kiện. Tổ hợp đủ để mỗi đội thấy nhân vật là của mình.

2. **Phù hiệu đổi theo bậc** — *ý mạnh nhất, cần khai thác kỹ.* Thang bốn tầng hiện ngay trên ngực áo nhân vật:

   > Gánh hàng rong → Chủ hộ → Giám đốc → CEO

   Người chơi **nhìn thấy mình lên bậc** ngay trên nhân vật, không cần bảng số.

3. **Nhân vật biến đổi theo quyết định** — mệt mỏi khi lỗ liên tiếp, chỉnh tề khi thắng. Bốn trạng thái là đủ, không cần nhiều.

## Ngôn ngữ hình ảnh: đổi noir Hollywood sang noir đồng bằng

Hẻm mưa, đèn đường, noir đen trắng là **từ vựng Hollywood** — đẹp nhưng không phải của dự án.

Khoảnh khắc tương đương ở đồng bằng mạnh hơn nhiều:

> **Mưa đêm bến sông, đèn vàng quán vỉa hè, nước đọng trên nền xi măng, tiếng ghe xa.**

Cùng cảm xúc — cô độc, áp lực, quyết định phải tự mình gánh — nhưng bằng từ vựng không ai lẫn được. **Giữ nguyên thủ pháp đen trắng chừa một màu (xanh ngọc); chỉ đổi bối cảnh.**

## Phân kỳ — vì sao là giai đoạn sau

Thư viện clip là thứ làm khi **hai trụ đã có bằng chứng và doanh thu**. Hiện tại:

- Instructor Studio **chưa nghiệm thu**.
- Hồ sơ đạo đức **chưa nộp**.
- Bậc 1 (Bến Phù Sa) **vừa mới nối vào trang đích**.

Ghi hướng này lại ngay để không mất, nhưng **không khởi công trước khi hai trụ có bằng chứng và doanh thu.**

## Việc có thể chuẩn bị sớm mà không phạm phân kỳ

- Định nghĩa **thang phù hiệu** (Gánh hàng rong → Chủ hộ → Giám đốc → CEO) như một khái niệm dùng chung, để khi tới lúc chỉ việc gắn hình.
- Ghi chú bảng ánh xạ **trạng thái → clip** dưới dạng hàm tất định (chưa cần clip thật), giống cách hồ sơ neo được đặc tả trước khi có asset.
