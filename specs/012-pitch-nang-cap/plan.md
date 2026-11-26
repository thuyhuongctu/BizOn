# Kế hoạch triển khai: Nâng cấp Phòng luyện pitch gọi vốn

**Nhánh**: `claude/pitch-nang-cap` | **Ngày**: 2026-11-26 | **Đặc tả**: [spec.md](spec.md)

## Tóm tắt

Phòng pitch của đặc tả 010 vẫn giữ bản một máy, chạy đủ như cũ. Đặc tả này thêm bốn lớp lên trên:

1. **Chế độ lớp** (P1): màn chiếu làm chủ phòng; mỗi đội dùng điện thoại làm «quỹ», có 1 tỷ đồng vốn ảo, rót vốn qua Supabase Realtime. Máy chủ không lưu gì; màn chiếu tổng hợp và xuất CSV.
2. **Rubric nghiên cứu 6 tiêu chí** (P2): giảng viên và các quỹ chấm mù; một script tính ICC và α Krippendorff.
3. **Hội đồng 3D phản ứng theo luật** (P3), có giọng đọc của trình duyệt.
4. **Lumina góp ý theo luật** (P4): ẩn theo cờ lớp `explain_hidden`.

## Bối cảnh kỹ thuật

- **Công nghệ:** JavaScript chạy thẳng trên trình duyệt, không build. Hàm thuần đặt trong các tệp `-core` để test được trong Node.
- **Tệp mới:**
  - `lab/pitch-goi-von-lop.js`: hàm thuần cho chế độ lớp: sổ góp vốn, kiểm luật (vốn còn, bậc 50 triệu, trần 500 triệu, không rót cho mình, bỏ tin trùng theo mã lượt), bảng xếp hạng, CSV.
  - `lab/pitch-quy.html`: trang điện thoại của quỹ. Quét QR là mở; trang nhẹ, không nạp three.js.
  - `lab/pitch-goi-von-rubric.js` (PR 2): rubric 6 tiêu chí VI/EN có mô tả neo và trích dẫn APA; trạng thái chấm mù.
  - `scripts/research/do-tin-cay-pitch.mjs` (PR 2): đọc CSV và tính ICC(2,1), ICC(2,k) theo Shrout và Fleiss (1979) cùng α Krippendorff (khoảng), có khoảng tin cậy.
- **Tệp sửa:**
  - `js/phong-realtime.js`: thêm tham số tiền tố kênh; giá trị mặc định giữ `bizon-ra-khoi-` để Ra Khơi 3D không đổi.
  - `lab/pitch-goi-von.html`: nút «Chế độ lớp», màn chiếu có QR và bảng góp vốn, màn chấm của giảng viên (`?gv=1`), khối góp ý của Lumina, sửa câu chân trang.
  - `lab/pitch-goi-von-data.js`: tính cách nhà đầu tư, bảng luật phản ứng, luật góp ý của Lumina.
  - `lab/pitch-goi-von-3d.js`: biểu cảm theo luật (gật, cau mày, nghiêng, ghi chép) và bong bóng lời.
  - `lab/pitch-goi-von-core.js`: tín hiệu cho Hội đồng và Lumina (quá giờ theo đoạn, lệch ba con số).
  - `sw.js`, `docs/huong-dan-giang-vien.md`, `docs/research/ISAGA-2027-DAN-Y-BAI.md` (nối «trang chấm mù»).
- **Chuyển tin:** dùng một lớp chuyển tin bọc ngoài, có hai cách:
  - `realtime`: Supabase, khi chạy thật;
  - `local`: `BroadcastChannel`, cho test và thử trên một máy.

  Nhờ vậy test Playwright chạy được nhiều thẻ trình duyệt mà không gọi mạng ngoài.
- **Không chạm:**
  - cơ sở dữ liệu thật; không có migration (làm rõ 1);
  - bộ câu hỏi PASTOR đã duyệt (`pq-v1`);
  - thang 4 × 2,5 (làm rõ 2);
  - luồng của Ra Khơi 3D;
  - `js/case-task-data.js`.

## Cơ sở lý thuyết của rubric (PR 2)

| Tiêu chí | Nguồn | Ghi chú |
|---|---|---|
| Mức chuẩn bị (nội dung có cấu trúc, số liệu sẵn) | Chen, Yao & Kotha (2009), *Academy of Management Journal* | Nhà đầu tư cân nhắc mức chuẩn bị nhiều hơn độ nhiệt huyết |
| Nhiệt huyết thể hiện | Chen, Yao & Kotha (2009) | Tách riêng để kiểm giả thuyết |
| Logic tài chính | ba con số của đặc tả 010 | Khớp với phần kiểm ba con số |
| Vấn đề – giải pháp rõ | Clingingsmith & Shane (2018), *Management Science* | Huấn luyện pitch tập trung nội dung |
| Đội ngũ đáng tin | thang «Đội ngũ» của kịch bản Đại hội Cổ đông | Giữ nối với điểm lớp 4 × 2,5 |
| Trả lời câu hỏi | Clingingsmith & Shane (2018) | |
| *Biến kết quả:* vốn rót và ý định đầu tư 1–5 | Huang & Pearce (2015), *Administrative Science Quarterly* | Không là tiêu chí chấm; dùng để xem «cảm giác» của nhà đầu tư dựa vào tiêu chí nào |

Mọi DOI kiểm bằng `node scripts/research/kiem-trich-dan.mjs --crossref` trong PR 2. Mô tả neo của từng mức 1–5 do Hương duyệt trong PR 2.

## Kiểm theo hiến chương

| Nguyên tắc | Cách giữ |
|---|---|
| I. Học là chính | Góp vốn buộc quỹ cân nhắc danh mục (CLO-E); Hội đồng và Lumina soi ba con số (CLO-B); rubric có cơ sở. |
| II. Nói thật | Hội đồng và Lumina chạy theo luật, trang ghi rõ «phản ứng dựa trên thời gian và con số, không dựa trên nội dung»; câu chân trang sửa lại cho đúng việc gửi dữ liệu khi bật chế độ lớp. |
| III. Trang tĩnh (không thương lượng) | Không máy chủ riêng, không migration; Realtime chỉ chuyển tiếp tin; bản một máy chạy không cần mạng; precache trong `sw.js`; 360 px; chạm 44 px; VI/EN. |
| IV. Có test | Mỗi PR có test viết trước và thấy hỏng: hàm thuần (sổ góp vốn, ICC với số liệu Shrout và Fleiss), Playwright nhiều thẻ qua `BroadcastChannel`. |
| V. Dữ liệu tối thiểu | Tin gửi đi chỉ có mã buổi, tên đội do lớp đặt, số vốn, điểm, thời điểm. CSV không có tên thật. Trang quỹ có một dòng cho biết dữ liệu dùng để làm gì và rằng có thể dùng cho nghiên cứu đã ẩn danh. |
| Hồ sơ quyền tác giả | Không đổi tệp đang thẩm định. |

## Rủi ro và cách giảm

- **Kênh Realtime công khai:** ai biết mã phòng cũng gửi tin được. Cách giảm:
  - mã phòng 6 ký tự, sinh ngẫu nhiên;
  - giảng viên duyệt từng quỹ vào phòng;
  - màn chiếu kiểm mọi luật;
  - tin sai luật bị bỏ và ghi lại trong CSV.
- **Mạng lớp yếu:** quỹ gửi lại tin đến khi màn chiếu xác nhận; mã lượt chống cộng hai lần. Nếu mất mạng, màn chiếu vẫn chạy bản một máy.
- **Dữ liệu nghiên cứu:** cần đơn đồng thuận của lớp (dùng theo quy trình khảo sát đang có). Hướng dẫn giảng viên (PR 4) ghi rõ điều này.
- **Giọng trình duyệt:** chất lượng tùy máy; mặc định tắt trên điện thoại, bật trên màn chiếu khi có giọng VI hoặc EN.

## Theo dõi độ phức tạp

Không vi phạm hiến chương. Phần phức tạp nhất là đồng bộ nhiều máy; giới hạn bằng cách để màn chiếu là nguồn sự thật duy nhất (một chủ phòng), các quỹ chỉ gửi đề nghị.
