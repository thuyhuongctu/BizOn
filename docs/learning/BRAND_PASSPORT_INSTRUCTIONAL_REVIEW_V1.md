# Brand Passport Learning Edition — Instructional Review V1

## 1. Mục đích

Tài liệu này là ma trận duyệt học thuật cho lớp **Lumina Coach–Critic–Reflection** trong Brand Passport. Nó không xác nhận hiệu quả nhân quả của AI coach và không thay thế pilot có đối chứng. Mục tiêu là bảo đảm mọi prompt:

- phục vụ quyết định hoặc phản tư cụ thể;
- không tiết lộ đáp án tối ưu;
- không sửa deterministic engine;
- không tự chấm reflection;
- có thể truy vết tới learning outcome;
- tránh diễn giải outcome delta như quan hệ nhân quả.

## 2. Chu trình hỗ trợ

```text
Observe → Diagnose → Coach → Critic → Human decision
        → Deterministic consequence → Explanation → Reflection → Evidence
```

Lumina chỉ hoạt động trong các ô Coach, Critic, Explanation và Reflection prompt. Quyết định và kết quả vẫn do người học và deterministic engine tạo ra.

## 3. Ma trận prompt theo phase

| Phase | Mục tiêu nhận thức | Coach nên làm | Critic nên làm | Không được làm |
|---|---|---|---|---|
| Observe | Nhận diện khoảng trống thông tin và thiên lệch nguồn | yêu cầu xác định dữ liệu còn thiếu, độ tin cậy và cách kiểm tra chéo | chất vấn việc suy diễn từ một nguồn, hỏi bằng chứng phản bác | khẳng định nguồn nào chắc chắn đúng hoặc tiết lộ hidden market fit |
| Decide | Buộc người học nêu mục tiêu, nguồn lực và trade-off | yêu cầu liên hệ lựa chọn với thanh khoản, kiểm soát, tốc độ, học hỏi và tính chính danh | yêu cầu nêu kịch bản bất lợi, opportunity cost và điều kiện làm quyết định sai | chọn market/entry mode thay người học hoặc nói “đây là lựa chọn tốt nhất” |
| Event | Phân biệt phản ứng ngắn hạn với năng lực dài hạn | yêu cầu tách tác động tức thời khỏi tác động tích lũy | hỏi lựa chọn xử lý nguyên nhân gốc hay chỉ triệu chứng | dự báo chính xác biến cố tiếp theo hoặc sửa event outcome |
| Debrief | So sánh giả định với kết quả và nhận diện path dependence | yêu cầu chỉ ra giả định đúng/sai và dữ liệu cần thu thêm | cảnh báo hindsight bias, outcome bias và attribution error | tuyên bố một quyết định gây ra toàn bộ outcome chỉ từ delta quan sát được |

## 4. Prompt V1 được chấp nhận

### Observe — Coach

> Xác định một khoảng trống thông tin quan trọng trước khi mua thêm nguồn tin. Nguồn nào đang chi phối nhận định của nhóm và bạn sẽ kiểm tra chéo bằng dữ liệu hoặc hành vi thị trường nào?

### Observe — Critic

> Nguồn tin này có thể thiên lệch vì lợi ích, mẫu quan sát hoặc độ trễ không? Bằng chứng nào có thể bác bỏ kết luận hiện tại?

### Decide — Coach

> Nêu mục tiêu của quý, nguồn lực phải cam kết và chỉ báo cho thấy quyết định thành công. Liên hệ lựa chọn với tiền mặt, kiểm soát, tốc độ học hỏi và mức hiểu biết thị trường.

### Decide — Critic

> Trade-off lớn nhất là gì: kiểm soát, tốc độ, vốn, tri thức thị trường hay rủi ro đối tác? Điều gì có thể khiến lựa chọn này sai?

### Event — Coach

> Tách tác động ngắn hạn của sự kiện khỏi năng lực dài hạn. Phương án nào bảo vệ khả năng phục hồi mà không che khuất nguyên nhân gốc?

### Event — Critic

> Phương án đang xử lý nguyên nhân hay chỉ triệu chứng? Tác dụng phụ nào có thể xuất hiện ở quý sau?

### Debrief — Reflection

> Quyết định dựa trên giả định nào? Kết quả nào ủng hộ hoặc bác bỏ giả định đó? Bạn sẽ thay đổi dữ liệu cần thu, tiêu chí quyết định hoặc mức cam kết như thế nào ở lần tiếp theo?

## 5. Mapping CLO đề xuất

Các CLO dưới đây là **mã nội bộ của Learning Edition** và phải được đối chiếu với đề cương học phần thật trước pilot.

| Mã | Learning outcome | Evidence tối thiểu trong trace |
|---|---|---|
| CLO 1 | Đánh giá mức hấp dẫn và mức hiểu biết thị trường | market selected/not selected; knowledge snapshot; lý do của nhóm |
| CLO 2 | Lựa chọn và biện minh phương thức thâm nhập | entry mode; control–capital–learning trade-off; counterargument |
| CLO 3 | Đánh giá độ tin cậy và thiên lệch thông tin | nguồn đã mua; reliability/bias reflection; evidence used |
| CLO 4 | Quản trị nguồn lực và thanh khoản trong quốc tế hóa | cash before/after; commitment; contingency plan |
| CLO 5 | Nhận diện path dependence và hệ quả chuỗi quyết định | round history; prior commitments; changed options |
| CLO 6 | Ra quyết định đa tiêu chí và giải thích trade-off | priority, budget, mode, market, reflection và adverse scenario |

Không được coi việc một record “có gắn CLO” là bằng chứng người học đã đạt CLO. Việc đạt chuẩn cần rubric và đánh giá của giảng viên.

## 6. Rubric phản tư gợi ý

Rubric này dành cho giảng viên; V1 không để AI tự chấm.

| Mức | Tiêu chí |
|---|---|
| 0 — Không có | trống, lặp lại mô tả quyết định hoặc không có lý do |
| 1 — Mô tả | nêu quyết định và một lý do nhưng không có bằng chứng/trade-off |
| 2 — Phân tích | liên hệ bằng chứng với lựa chọn và nêu ít nhất một rủi ro |
| 3 — Phản biện | nêu bằng chứng phản bác, điều kiện làm quyết định sai và phương án dự phòng |
| 4 — Tái cấu trúc | so sánh giả định với outcome, nhận diện bias/path dependence và đề xuất cách quyết định tốt hơn |

## 7. Guardrails ngôn ngữ

### Từ nên dùng

- “gợi ý khung phân tích”;
- “bằng chứng nào có thể bác bỏ”;
- “đánh đổi”;
- “kết quả được ghi nhận sau khi engine xử lý”;
- “một cách diễn giải có thể kiểm tra”.

### Từ không nên dùng

- “đáp án đúng”;
- “chắc chắn thành công”;
- “AI dự báo”;
- “quyết định này gây ra…” nếu chỉ dựa vào delta;
- “đã đạt CLO” nếu chưa có rubric/human review.

## 8. Acceptance criteria học thuật trước pilot

- [ ] Giảng viên phụ trách xác nhận CLO khớp đề cương học phần.
- [ ] Mỗi prompt có mục tiêu nhận thức và phase rõ ràng.
- [ ] Không prompt nào chọn đáp án hoặc tiết lộ hidden state.
- [ ] Explanation ghi rõ deterministic engine là nguồn outcome.
- [ ] Reflection không được AI chấm điểm hoặc dùng làm điểm chính thức trong V1.
- [ ] Rubric và hướng dẫn debrief được giảng viên duyệt.
- [ ] Có kế hoạch đo perceived usefulness, engagement, self-regulation và learning outcome riêng biệt.
- [ ] Có quy trình xử lý prompt gây hiểu nhầm hoặc tạo lệ thuộc vào AI.

## 9. Quyết định đối với PR #264

PR #264 có ý tưởng hữu ích là phân phase `Observe / Decide / Event`, nhưng sử dụng polling 900 ms và tạo schema trace cạnh tranh. PR #263 giữ ma trận phase trong tài liệu học thuật này, đồng thời duy trì hook theo sự kiện và schema canonical duy nhất.
