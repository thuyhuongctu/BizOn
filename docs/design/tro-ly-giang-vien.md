# Trợ lý giảng viên: duyệt nhận xét cuối vòng (Bật Nghiệp)

> Bản thiết kế 0.2: chị duyệt ngày 06/11/2026, đã làm theo bản này. Những chỗ lúc làm phải chốt khác bản 0.1 ghi ở §12.
> Ý tưởng mượn từ cách làm «kế hoạch → duyệt → biên nhận» của OpenMuse (CopilotKit, MIT),
> viết lại gọn trên Supabase sẵn có. Không dùng mã hay dịch vụ nào của OpenMuse.

## 1. Tổng quan

Cuối mỗi vòng của **BizOn Bật Nghiệp** (6 vòng, mỗi vòng ≈ một quý), giảng viên chủ lớp mở trang
**💬 Nhận xét cuối vòng** (`nhan-xet-vong.html?lop=MÃ`, nút ở tab «🎛 Điều khiển lớp» của Trang Giảng viên) và thấy một bảng **bản nháp nhận xét**: mỗi đội một bản, soạn sẵn từ chính kết quả vòng mà
đội đã nộp (`round_submissions.result_json`). Giảng viên đọc, sửa, duyệt hoặc bỏ từng bản. Chỉ bản đã duyệt
mới đến tay đội, hiện trong game thành thẻ «Nhận xét của giảng viên · vòng N». Mỗi lần gửi được lưu lại thành
**biên nhận**: ai duyệt, lúc nào, gửi chữ gì, dựa trên số liệu nào.

- **Cho ai:** giảng viên chủ lớp (đã có `instructor_class_access`); sinh viên chỉ đọc nhận xét của đội mình.
- **Thời lượng:** mục tiêu ≤ 5 phút cho một lớp 8 đội, trong khoảng nghỉ giữa hai vòng (khuyến nghị 8–12 phút
  mỗi vòng, `docs/huong-dan-giang-vien.md` §2).
- **Trợ lý là luật, không phải mô hình ngôn ngữ.** Bản nháp ghép từ mẫu câu cố định theo ngưỡng số liệu, cùng
  cách `luminaAdvice()` trong `js/engine.js` đang làm. Không gửi dữ liệu sinh viên ra dịch vụ ngoài, không tốn
  tiền gọi API, chạy được khi phòng lab mạng yếu.

## 2. Mục tiêu học tập

`result_json` là **bản rút gọn** do `submitRound()` (`js/backend.js`) dựng, không phải nguyên báo cáo vòng của
engine: không có `adEff`, `rivals`, `loanInterest`, `overdraft`. Luật dưới đây chỉ dùng trường có thật trong bản
rút gọn, trừ một trường mới `rivalTopShare` (xem §7).

Nhận xét neo vào đúng năm tiêu chí của rubric Bật Nghiệp (`docs/chuan-dau-ra-va-rubric.md` §4.1):

| Tiêu chí | Chỉ số neo trong `result_json` | Nhận xét hướng sinh viên tự rút ra |
|---|---|---|
| CLO-A · giá – marketing – cầu | `share`, `lostSales`, `sold`, `decisions.price`, `decisions.marketing` | vì sao thị phần đổi khi giá và chi marketing đổi |
| CLO-B · dòng tiền | `quickRatio`, `balance`, `roi`, `netProfit` | nguyên nhân thiếu tiền mặt |
| CLO-C · vận hành | `oee`, `defect`, `sold`, `inventory` | quan hệ công suất – phế phẩm – chi phí đơn vị |
| CLO-D · thâm nhập quốc tế | phần Go Global (chưa có trong `result_json` mọi vòng) | **ngoài phạm vi bản 0.1** |
| CLO-E · hợp tác | Nhật ký đội | **ngoài phạm vi bản 0.1**: không có số liệu đáng tin để tự soạn |

Giữ đúng nguyên tắc «quyết định trước, lý thuyết sau» và «Lumina không chọn giúp» (§1.2 rubric): nhận xét
**không bao giờ** nói đội nên đặt giá bao nhiêu. Mỗi bản chỉ gồm:

1. **Một điểm ghi nhận**, có dẫn số (ví dụ «thị phần lên 31,2% từ 26,8%»).
2. **Một câu hỏi gợi mở**, cũng có dẫn số (ví dụ «quick ratio 0,84: khoản nào trong chi phí vòng này làm tiền
   mặt hụt?»).

Nhờ vậy sinh viên quen việc trích số liệu khi trả lời, đúng điều rubric đòi ở mức 3–4.

## 3. Trải nghiệm mong muốn

- **Giảng viên:** «à, đội 5 hụt hàng 1 240 đơn mà mình chưa để ý». Bảng nháp xếp **đội cần chú ý lên trước**
  (có cờ rủi ro cao), không xếp theo tên.
- **Sinh viên:** thấy thầy cô đọc đúng số của đội mình, không phải lời chung chung. Câu hỏi đủ cụ thể để cả đội
  bàn trong vòng sau.

## 4. Luật chi tiết

### 4.1 Trạng thái một bản nhận xét

```
(chưa có) ──soạn──▶ nhap ──duyệt──▶ da_gui ──sửa sau khi gửi──▶ da_gui (phiên bản mới)
                      │                 └──thu hồi──▶ thu_hoi
                      └──bỏ──▶ bo
```

- Khoá duy nhất: (`class_code`, `team_name`, `round_number`, `phien_ban`).
- **Soạn** chạy trên máy giảng viên khi mở tab, cho mọi đội đã có `round_submissions` ở vòng N mà chưa có bản
  `da_gui` hay `bo` cho vòng ấy. Bản nháp **không lưu lên máy chủ** cho tới khi giảng viên bấm duyệt hoặc bỏ.
  Mở lại tab thì soạn lại, ra đúng chữ cũ, vì luật là tất định.
- **Duyệt** gửi một lần cả nội dung đã sửa lẫn số liệu căn cứ lên RPC `bizon_feedback_send`. RPC kiểm quyền chủ
  lớp và ghi một dòng `da_gui`.
- **Sửa sau khi gửi**: tạo dòng mới `phien_ban + 1`, dòng cũ giữ nguyên làm biên nhận. Đội chỉ thấy phiên bản
  mới nhất, kèm dòng «đã sửa lúc hh:mm».
- **Thu hồi**: đổi trạng thái dòng mới nhất sang `thu_hoi`; đội không thấy nữa. Không xoá dòng.
- **Duyệt hàng loạt:** có nút «Duyệt tất cả bản chưa sửa», nhưng phải bấm xác nhận một lần và chỉ áp cho bản
  đang hiện trên màn hình.

### 4.2 Luật soạn bản nháp

Dùng bản ghi vòng N (`r`) và vòng N−1 (`p`, nếu có). Duyệt danh sách tín hiệu theo thứ tự ưu tiên, lấy **tín
hiệu rủi ro đầu tiên** làm câu hỏi và **tín hiệu tốt đầu tiên** làm điểm ghi nhận. Không có tín hiệu tốt thì dùng
câu ghi nhận trung tính G0 «Đội đã nộp kết quả vòng N». Không có tín hiệu rủi ro thì câu hỏi là Q0: dẫn thị phần và
lợi nhuận ròng của vòng, hỏi đội muốn giữ quyết định nào và số liệu nào cho thấy điều đó.

| Mã | Loại | Điều kiện | CLO |
|---|---|---|---|
| R1 | rủi ro | `r.quickRatio < NGUONG.quick` | B |
| R2 | rủi ro | `r.lostSales > NGUONG.hutHang × r.sold` | A, C |
| R3 | rủi ro | `r.netProfit < 0` và `r.rivalTopShare` có mặt và `r.share ≥ r.rivalTopShare` | A |
| R4 | rủi ro | `r.defect > NGUONG.pheTram` | C |
| R5 | rủi ro | có `p`, `r.decisions.marketing > p.decisions.marketing × 1,3` và `r.share − p.share < 1` | A |
| G1 | tốt | có `p`, `r.share − p.share ≥ 2` | A |
| G2 | tốt | `r.netProfit > 0` và có `p` với `p.netProfit ≤ 0` | B |
| G3 | tốt | `r.oee ≥ NGUONG.oeeTot` và `r.defect ≤ NGUONG.pheTram / 2` | C |

R3 trùng với cảnh báo ⚠️ «thị phần cao nhất mà lỗ» của luật cắm cờ (`docs/huong-dan-giang-vien.md` §4), nên câu
chữ phải dùng cùng thuật ngữ ấy.

**Mức chú ý** để xếp bảng: số tín hiệu rủi ro (0–5); hoà thì đội có `quickRatio` thấp hơn đứng trước.

Mỗi mẫu câu có bản `vi` và `en`, khai trong một tệp dữ liệu riêng (`js/tro-ly-mau-cau.js`), với chỗ trống điền
số: `{share}`, `{shareTruoc}`, `{quick}`, `{lost}`… Số in theo `toLocaleString('vi-VN')` hoặc `en-US`, đúng
cách engine đang làm.

### 4.3 Số liệu căn cứ (biên nhận)

Khi gửi, lưu kèm `can_cu` (jsonb): mã tín hiệu đã chọn, giá trị các chỉ số đã điền vào câu, `result_hash` của
bản `round_submissions` đã dùng, và `mau_phien_ban` (phiên bản bộ mẫu câu). Nhờ có `result_hash`, sau này đối
chiếu được nhận xét dựa trên đúng lần nộp nào.

## 5. Công thức và ngưỡng

| Tham số | Mặc định | Khoảng hợp lệ | Lý do |
|---|---|---|---|
| `NGUONG.quick` | 1,0 | 0,5–1,5 | engine đã cảnh báo ở `quickRatio < 1` (`js/engine.js` dòng ~417) |
| `NGUONG.hutHang` | 0,10 | 0,02–0,5 | hụt quá 10% số bán được mới đáng hỏi |
| `NGUONG.pheTram` | 4,0 (%) | 1–10 | khởi điểm `defect` là 2,0 |
| `NGUONG.oeeTot` | 85 (%) | 60–95 | khởi điểm `oee` là 85 |

Giá trị biên:

- `r.sold = 0`: R2 thành `lostSales > 0` (tránh nhân với 0 ra luôn đúng).
- Thiếu trường (bản nộp kiểu cũ trước 10/2026, `js/backend.js` dòng ~51): tín hiệu nào thiếu dữ liệu thì bỏ qua.
  Thiếu hết thì không soạn, chỉ hiện «Chưa đủ số liệu để soạn, giảng viên tự viết».
- Số không hữu hạn (`NaN`, `Infinity`): coi như thiếu.
- Vòng 1 không có `p`: R5, G1, G2 tự bỏ qua.

## 6. Trường hợp biên

- **Đội nộp lại vòng N sau khi đã có nhận xét:** dùng bản nộp mới nhất (đúng như `bizon_submissions_v2`). Nếu
  `result_hash` khác với hash trong `can_cu` của bản đã gửi, gắn nhãn «số liệu đã đổi sau khi nhận xét» ở bảng
  giảng viên. Không tự gửi lại.
- **Hai giảng viên cùng mở tab:** một lớp chỉ có một chủ (`unique (class_code)`), nên không xảy ra. Cùng một
  người mở hai tab: RPC từ chối dòng `da_gui` thứ hai cùng phiên bản (khoá duy nhất), tab sau tải lại.
- **Mất mạng lúc bấm duyệt:** nút chuyển «Chưa gửi được, thử lại». Không xếp hàng ngầm: biên nhận chỉ có khi máy
  chủ đã ghi.
- **Đổi ngôn ngữ giữa chừng:** bản nháp vẽ lại theo `lang` hiện tại. Bản đã gửi lưu **chữ đã duyệt** (một thứ
  tiếng, đúng chữ giảng viên thấy lúc duyệt) cùng mã ngôn ngữ; sinh viên thấy đúng chữ ấy.
- **Lớp quốc tế:** giảng viên chọn ngôn ngữ soạn ở đầu bảng, mặc định theo `lang` của trang.
- **Đội đổi tên giữa ván:** nhận xét gắn `team_name` lúc gửi; đổi tên là đội mới, như mọi bảng khác hiện nay.
- **Chế độ thi** (`class_exam`) đang bật: ẩn nút gửi, vì nhận xét giữa giờ thi là gợi ý ngoài luồng.

## 7. Phụ thuộc

- **Đọc:** `bizon_submissions_v2` (đã có).
- **Thêm một trường vào `submitRound()`:** `rivalTopShare` = thị phần cao nhất của ba đối thủ ảo trong vòng
  (`max(report.rivals[].share)`), cần cho R3. Chỉ thêm, không đổi trường cũ; bản nộp trước thay đổi không có
  trường này nên R3 tự bỏ qua (§5).
- **Mới (một migration, chỉ thêm):**
  - bảng `class_feedback` (`id`, `class_code`, `team_name`, `round_number`, `phien_ban`, `trang_thai`
    `da_gui|bo|thu_hoi`, `ngon_ngu`, `noi_dung` ≤ 1 200 ký tự, `can_cu` jsonb ≤ 4 000 ký tự, `da_sua` bool,
    `created_by`, `created_at`); RLS bật, không cấp quyền trực tiếp;
  - `bizon_feedback_send(...)`, `bizon_feedback_set_state(...)`: kiểm `bizon_owns_class`;
  - `bizon_feedback_class(p_class_code)`: chủ lớp đọc mọi dòng, kể cả biên nhận cũ;
  - mở rộng `bizon_class_feed` thêm khoá `feedback`: chỉ phiên bản mới nhất `da_gui` của đúng đội hỏi.
- **Trang:** `nhan-xet-vong.html` (bảng nháp, xem §12), `js/instructor-api.js` (ba hàm mới, có nhánh `demo`), trang Bật Nghiệp
  (thẻ nhận xét). Nếu thẻ đặt trong `index.html` thì chép y nguyên sang `academia3d-v2.html`.
- **Không đụng:** engine mô phỏng, điểm số, luật cắm cờ.

## 8. Dữ liệu và quyền riêng tư

- Lên máy chủ: chữ nhận xét đã duyệt và số liệu căn cứ, đều là số của đội vốn đã nằm trong `round_submissions`.
  **Không có email**, không có tên sinh viên.
- Ai đọc được: chủ lớp (mọi dòng); đội (chỉ phiên bản mới nhất `da_gui` của đội mình, qua `bizon_class_feed`,
  giống cách đội đang nhận vốn thưởng).
- Giữ bao lâu: **365 ngày** (chị chọn 06/11/2026), khớp với `round_submissions` (12 tháng) mà nhận xét dựa vào.
  Mỗi lần gửi, `bizon_feedback_send` xoá các dòng cũ hơn 365 ngày, như `live_progress` tự dọn sau 30 ngày.
- Không gửi gì ra ngoài Supabase.

## 9. Tham số chỉnh được

`NGUONG` (§5) và bộ mẫu câu nằm trong `js/tro-ly-mau-cau.js`, có `MAU_PHIEN_BAN`. Đổi ngưỡng giữa học kỳ thì
tăng phiên bản, để dữ liệu nghiên cứu còn tách được lớp nào dùng bộ nào.

## 10. Tiêu chí nghiệm thu

1. Với 12 bản `result_json` mẫu (`test/fixtures/tro-ly/*.json`, phủ đủ R1–R5, G1–G3, vòng 1, bản kiểu cũ thiếu
   trường, `sold = 0`), hàm soạn cho ra đúng mã tín hiệu kỳ vọng ở cả 12 bản.
2. Không bản nháp nào chứa chữ số kèm «nên», «hãy đặt», «should set» (test quét toàn bộ mẫu câu cả hai thứ
   tiếng). Mục đích: trợ lý không đưa đáp án.
3. Mọi chỗ trống `{…}` trong mẫu câu đều được điền; chuỗi kết quả không còn dấu `{`.
4. Test SQL (`test/sql/class_feedback_smoke.sql`):
   - người không phải chủ lớp gọi `bizon_feedback_send` thì bị từ chối;
   - đội A gọi `bizon_class_feed` không thấy nhận xét của đội B;
   - dòng `thu_hoi` không hiện cho đội;
   - sửa sau khi gửi tạo `phien_ban = 2`, dòng 1 còn nguyên.
5. Playwright ở bề rộng 360 và 390 px: bảng nháp 8 đội không tràn ngang; mỗi nút ≥ 44 px; `html-validate` 0 lỗi.
6. Đo tay ở buổi chơi thử: giảng viên duyệt xong 8 đội trong ≤ 5 phút. Ghi lại trong báo cáo `playtest-report`.

## 11. Ngoài phạm vi bản 0.1

- Hộ Chiếu Thương Hiệu và Sầu Riêng: cấu trúc vòng khác, làm sau khi bản Bật Nghiệp chạy thử xong.
- CLO-D, CLO-E (lý do ở §2).
- Soạn bằng mô hình ngôn ngữ. Nếu sau này cần thì vẫn giữ nguyên luồng duyệt và biên nhận, chỉ thay bước soạn.

## 12. Đã làm (bản 0.2) và chỗ khác bản 0.1

Tệp: `js/tro-ly-mau-cau.js` (luật + mẫu câu, `MAU_PHIEN_BAN = 1`), `nhan-xet-vong.html` (bảng nháp),
`js/instructor-api.js` (`feedbackClass`, `feedbackSend`, `feedbackSetState`, có nhánh dùng thử),
`js/class-sync.js` (thẻ nhận xét phía đội), `js/backend.js` (`rivalTopShare`),
`supabase/migrations/20261106000000_class_feedback.sql`, `test/tro-ly-giang-vien.test.js`, `test/sql/class_feedback_smoke.sql`.

- **Trang riêng thay vì một tab trong `giang-vien.html`.** `giang-vien.html` chỉ là trang giới thiệu; bảng điều khiển
  thật là `Trang Giang Vien.dc.html` (trang x-dc). Làm trang riêng như `man-hinh-lop-hoc.html`, dùng chung phiên
  đăng nhập, nên không đụng bộ khuôn của trang x-dc.
- **`result_hash` lấy trên máy chủ.** `bizon_feedback_send` tự đọc hash lần nộp mới nhất trong `round_submissions`,
  không nhận từ máy khách, nên biên nhận không bị khai sai. Đội chưa nộp vòng ấy thì không gửi được.
  `bizon_feedback_class` trả kèm hash mới nhất của mỗi đội để bảng giảng viên gắn nhãn «số liệu đã đổi».
- **Hai thẻ cùng mở** được chặn bằng tham số `p_phien_ban_truoc`: máy chủ từ chối nếu phiên bản mới nhất đã khác
  phiên bản thẻ đang thấy, báo «tải lại», thay vì chỉ dựa vào khoá duy nhất.
- **Chế độ thi** chặn cả ở máy chủ (`class_exam.active`), không chỉ ẩn nút.
- **Bỏ** cũng ghi một dòng (`trang_thai = 'bo'`, chữ rỗng) để bản nháp ấy không hiện lại; «Soạn lại» tạo phiên bản kế.
- **Vòng mặc định** là vòng gần nhất mà nhiều đội đã nộp nhất, để một đội chạy trước không kéo cả bảng sang vòng
  các đội khác chưa xong.
- Tiêu chí 6 (≤ 5 phút cho 8 đội) còn chờ đo tay ở buổi chơi thử.
