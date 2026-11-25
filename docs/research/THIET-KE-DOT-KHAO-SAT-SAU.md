# Thiết kế đợt thu dữ liệu tiếp theo (học kỳ 2, năm học 2026–2027)

**Lập ngày 25/11/2026.** Tài liệu này sửa các điểm yếu đo lường của đợt thí điểm 10/2026 (`KET-QUA-TRUOC-SAU-2026-10.md`). Nó dùng thêm hai bài mới trong bản tin ngày 24–25/11/2026 (Jirásek, 2026; Salapi et al., 2026).

Tài liệu không thay giả thuyết H1–H3 và phân tích chính đã ghi trước trong `thiet-ke-nghien-cuu.html`. Mọi bổ sung ở đây là **thước đo phụ** hoặc **thủ tục**.

## 1. Năm điểm yếu và cách sửa

| # | Điểm yếu của đợt 10/2026 | Thay đổi | Trạng thái |
|---|---|---|---|
| 1 | 27 phiếu (18 trước, 9 sau) không ghép được vì gõ mã lớp lệch nhau | Link phiếu khóa sẵn mã lớp và bộ câu hỏi (Instructor Studio). Giảng viên **phát mã sinh viên theo danh sách**, không để sinh viên tự đặt. Mục tiêu: ghép được ≥ 80 % sĩ số. | Link khóa mã: đã có. Phát mã: thủ tục mới (mục 4) |
| 2 | Bộ kiến thức chạm trần: 42 % phiếu trước đạt 15/15 | Dùng bộ 2 (`batnghiep2`), có 5 câu vận dụng khó hơn | Đã có (`BO-CAU-HOI-KIEN-THUC-V2.md`) |
| 3 | Câu c_3 hỏi hai thứ trong một câu («cuộc họp đội **và** gợi ý của cố vấn AI»), nên điểm thấp (3,41) không cho biết thấp vì đội hay vì AI | Giữ nguyên c_3 để so được với đợt 10/2026. Thêm **c_7** đo riêng việc trao đổi trong đội. Vai trò của cố vấn AI được kiểm bằng **thực nghiệm** (cờ ẩn giải thích, mục 2), không bằng một câu tự đánh giá. | Mới: c_7 |
| 4 | Không đo mức «tốn công» khi chơi, nên chưa phân biệt được tham gia chủ động với chơi thụ động (Jirásek, 2026) | Thêm **c_6** «tốn công suy nghĩ». Cách đọc ở mục 3. | Mới: c_6 |
| 5 | Chỉ có thước đo tự đánh giá; lĩnh vực cũng đang thiếu thước đo khác (Salapi et al., 2026) | Thêm phân tích phụ: **chấm so sánh từng cặp mù** (Pollitt, 2012) cho phần lý do (`why`) của bài tình huống SAU, bên cạnh rubric rb-v1. Rubric vẫn là phân tích chính. | Thiết kế; công cụ chấm làm ở PR sau nếu chị đồng ý |

## 2. Vì sao không thêm nhánh «không có Lumina» riêng

Cờ lớp `explain_hidden` (R1, `docs/architecture/NHANH-HOP-DEN.md`) đã ẩn đúng phần của cố vấn: lời Lumina trong thẻ biến cố, dòng gợi ý trên bảng điều khiển, khung hỏi cố vấn, hộp mô phỏng «Nếu – Thì» và dự báo. So sánh «có Lumina / không Lumina» vì thế **chính là** so sánh hai nhánh hiện và ẩn giải thích đã thiết kế.

Thêm một nhánh thứ ba sẽ làm mỗi nhánh nhỏ đi và chỉ còn phát hiện được hiệu ứng lớn. Ước tính gần đúng cho phép so sánh hai nhóm (α = 0,05 hai phía, lực 0,80; chưa tính hiệp biến điểm trước, chưa tính hiệu ứng cụm theo lớp), d nhỏ nhất phát hiện được = 2,80 × √(2/n), với n là số sinh viên mỗi nhánh:

| Tổng mẫu | Hai nhánh: n mỗi nhánh → d nhỏ nhất | Ba nhánh: n mỗi nhánh → d nhỏ nhất |
|---|---|---|
| 60 | 30 → 0,72 | 20 → 0,89 |
| 100 | 50 → 0,56 | 33 → 0,69 |

Hiệu chỉnh theo điểm trước làm các số này nhỏ đi một chút; hiệu ứng cụm theo lớp làm chúng lớn lên. Kết luận vẫn giữ: **giữ hai nhánh**.

## 3. Hai câu mới ở Phần C (phiếu sau)

| Mã | Tiếng Việt | Tiếng Anh |
|---|---|---|
| c_6 | Khi chơi, tôi phải suy nghĩ, cân nhắc nhiều trước mỗi quyết định. | While playing, I had to think hard and weigh options before each decision. |
| c_7 | Các bạn trong đội trao đổi, tranh luận với nhau trước khi chốt quyết định. | My teammates and I discussed and debated with each other before finalizing decisions. |

**Quy tắc để không phá số liệu cũ:**
- c_1–c_5 giữ nguyên chữ và vị trí. Hai câu mới thêm ở cuối Phần C.
- «Mức tham gia» vẫn là trung bình c_1–c_5, như đợt 10/2026. c_6 và c_7 **báo cáo riêng từng câu**, không cộng vào.
- Phiếu nộp trước khi có hai câu này để trống c_6 và c_7 trong tệp xuất. Không coi ô trống là 0.

**Cách đọc c_6:**
- c_6 là một câu đơn, chưa phải thang đo đã kiểm định.
- Mức tốn công cao có hai nghĩa trái nhau. Nó có thể là tham gia chủ động, như Jirásek (2026) diễn giải. Nó cũng có thể là quá tải hoặc khó hiểu: trong nghiên cứu tải nhận thức, mức nỗ lực tinh thần là chỉ báo của tải (Paas, 1992).
- Vì vậy c_6 luôn được đọc **cùng** c_1 (cuốn hút) và c_4 (giải thích «Vì sao?» giúp rút bài học), và đọc cùng câu mở «điều gì còn khó hiểu».
- Không kết luận «tốn công là tốt».

**Phân tích dự kiến cho c_6 và c_7:**
- Mô tả: trung bình, trung vị, phân bố 1–5.
- So hai nhánh hiện và ẩn bằng kiểm định Mann–Whitney, báo cáo r.
- Tương quan Spearman của c_6 với c_1 và c_4.
- Không suy diễn nhân quả: hai câu này không phải biến kết quả của H1–H3.

## 4. Thủ tục mới cho giảng viên (bổ sung `HUONG-DAN-THU-BO-2-TREN-LOP.md`)

1. **Trước buổi 1:** lập danh sách mã sinh viên (2 chữ cái + 2 số, không trùng) và phát cho từng sinh viên. Bảng đối chiếu tên – mã giảng viên giữ ngoại tuyến, không gửi kèm dữ liệu.
2. **Đặt cờ giải thích trước tuần 1** theo nhánh của lớp, và không đổi giữa chừng.
3. **Phiếu sau:** chỉ gửi sau buổi tổng kết. Phiếu đã có 7 câu trải nghiệm.
4. **Bài tình huống SAU:** thu trong vòng hai tuần sau buổi tổng kết, như điều kiện biên đã ghi trước.

## 5. Chấm so sánh từng cặp mù (phân tích phụ)

- **Dữ liệu:** cột `why` của `case_tasks.csv` trong gói dữ liệu nghiên cứu, phase = SAU. Đã có sẵn, không cần thu thêm.
- **Cách chấm:**
  - Người chấm thấy hai câu trả lời cho cùng một tình huống, không biết nhóm và pha, rồi chọn câu lập luận tốt hơn.
  - Từ các lượt chọn, ước lượng điểm từng bài bằng mô hình Bradley–Terry, như phương pháp so sánh có thích ứng (Pollitt, 2012).
  - Báo cáo độ tin cậy tách (scale separation reliability).
- **Vai trò:** kiểm tra độ vững cho điểm WHY của rubric rb-v1. Nếu hai cách chấm cho kết luận khác nhau về H1, báo cáo cả hai.
- **Chưa làm:** trang chấm theo cặp. Việc này cần một PR riêng; nó dùng lại trang chấm mù `cham-tinh-huong.html` và gói dữ liệu.

## Tài liệu tham khảo

Jirásek, M. (2026). Distant Futures: Developing future scenarios through a board game. *Simulation & Gaming*. Advance online publication. https://doi.org/10.1177/10468781261509429

Paas, F. G. W. C. (1992). Training strategies for attaining transfer of problem-solving skill in statistics: A cognitive-load approach. *Journal of Educational Psychology, 84*(4), 429–434. https://doi.org/10.1037/0022-0663.84.4.429

Pollitt, A. (2012). The method of Adaptive Comparative Judgement. *Assessment in Education: Principles, Policy & Practice, 19*(3), 281–300. https://doi.org/10.1080/0969594X.2012.665354

Salapi, C. E., Orias, M. C., & Sarsale, M. (2026). Gamification in business education: A Scopus-based systematic mapping review. *Entrepreneurship Education*. Advance online publication. https://doi.org/10.1007/s41959-026-00205-9

DOI của cả bốn mục đã đối chiếu trên Crossref ngày 25/11/2026. Jirásek (2026) và Salapi et al. (2026) mới đọc abstract.
