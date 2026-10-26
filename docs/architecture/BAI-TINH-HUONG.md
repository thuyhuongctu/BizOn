# Bài tình huống trước – sau (R2, 27/10/2026)

Công cụ đo **kết quả học tập khách quan** cho nghiên cứu đánh giá BizOn (xem thiet-ke-nghien-cuu.html, NHANH-HOP-DEN.md): một bài quyết định tình huống ngoài game, làm một lần **trước** Bậc 1 và một lần **sau** Bậc 3, chấm theo rubric (R3). Không phải phiếu tự cảm nhận.

## 1 · Công cụ
- Trang `bai-tinh-huong.html`, nội dung ở `js/case-task-data.js` (`VERSION = 'ct-v1'`). Hai bản **song song A và B**: cùng 5 cơ chế, cùng cấu trúc phương án, khác bề mặt câu chuyện.
- Mỗi tình huống: chọn 1 trong 4 phương án + lý do (≤ 400 ký tự). Câu cuối: giải thích cơ chế mở (≤ 1500 ký tự, 5–10 câu).

| # | id | Cơ chế | Phương án hợp lý thuyết (`expected`) |
|---|---|---|---|
| 1 | u1 | Uppsala: tăng cam kết theo tri thức thị trường | b · giữ kênh hiện có, học thị trường, văn phòng đại diện trước |
| 2 | o1 | Bất lợi người ngoài cuộc, vị trí mạng lưới (Uppsala 2009) | c · vào mạng lưới qua đối tác đã có quan hệ, chấp nhận biên thấp |
| 3 | v1 | Khoảng trống thể chế (Khanna & Palepu) | c · lô nhỏ trả trước + trung gian uy tín + tăng dần |
| 4 | e1 | Bất định cao → effectuation (Sarasvathy) | b · phương tiện sẵn có, tổn thất chấp nhận được, học qua phản hồi |
| 5 | e2 | Bất định thấp, có số liệu → causation | b · dự báo, hòa vốn, NPV, kế hoạch công suất |
| 6 | x | Giải thích cơ chế (mở) | chấm rubric R3: tri thức → cam kết, outsidership, cách giảm rủi ro |

Mỗi phương án có nhãn `logic` (leap / incremental / insider / intermediary / effectual / causal…) để mã hoá dấu vết (R4). `expected` không hiện cho sinh viên.

## 2 · Phân bản và giai đoạn
- Giai đoạn do máy chủ quyết: chưa nộp gì → `pre`; đã có `pre` → `post`; đã đủ hai → báo xong. `?phase=` và `?form=` trên URL chỉ để xem trước / kiểm thử.
- Bản bài **trước** = A nếu FNV-1a(email thường | mã lớp) chẵn, B nếu lẻ (đổi chỗ cân bằng trong lớp). Bản **sau** = bản còn lại của chính bài trước đã nộp (đọc từ máy chủ, không băm lại).
- Nộp lại cùng giai đoạn chỉ trong 24 giờ (sửa lỗi gõ); sau đó khoá, tránh nhiễm bài trước bằng kiến thức sau.
- Chưa đăng nhập: làm thử, không nộp (không lưu gì).

## 3 · Dữ liệu
Bảng `case_tasks` (migration `20261028000000_case_tasks.sql`; RLS, chỉ qua RPC): một dòng cho mỗi sinh viên × lớp × giai đoạn.

| Trường | Ý nghĩa |
|---|---|
| `phase`, `form` | pre/post; A/B |
| `answers.items[]` | `{id, mech, choice, why}`; câu mở `{id:'x', mech:'explain', text}`; `answers.version`, `answers.lang` |
| `duration_s` | giây từ lúc hiện bài đến lúc nộp |
| `explain` | điều kiện lớp lúc nộp: `hidden` (hộp đen) / `shown` (R1) |
| `journey_id` (khi xuất) | hộ chiếu mới nhất của sinh viên trong lớp → ghép với dấu vết quyết định |

RPC: `bizon_case_task_submit` (sinh viên), `bizon_case_task_mine` (bài của mình), `bizon_case_task_class` (chủ lớp). Dọn sau 12 tháng (`bizon_purge_expired`).

## 4 · Xuất cho phân tích
Trang Giảng viên → thẻ Hành trình → «⬇ CSV bài tình huống»: một dòng mỗi câu trả lời với `student_key` = FNV-1a(email), `journey_hash` = FNV-1a(journey_id) (khớp cột `journey_hash` trong CSV ẩn danh của trang Hành trình), `aligned` = 1 khi chọn đúng phương án hợp lý thuyết, `logic`, `why`/`text`, `explain_condition`. Email thật không có trong tệp.

## 5 · Phân tích dự kiến (R5)
Chỉ số thô trước – sau: tỉ lệ `aligned` trên 5 tình huống; điểm rubric của lý do và câu giải thích (R3, hai người chấm, κ/ICC). So sánh 2×2: giải thích hiện/ẩn × trước/sau; hiệu ứng tương tác là kiểm định chính.

## 6 · Giới hạn
Bộ câu hỏi chưa qua pilot: cần kiểm độ khó tương đương A/B (tỉ lệ `aligned` ở bài trước giữa hai bản) và hiệu chỉnh trước khi thu dữ liệu chính thức. Đổi nội dung = tăng `VERSION`.
