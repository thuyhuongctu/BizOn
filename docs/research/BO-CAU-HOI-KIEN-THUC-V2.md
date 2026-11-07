# Bộ câu hỏi kiến thức Bật Nghiệp – bản 2 (`batnghiep2`)

**Soạn:** 07/11/2026, sau đợt thử 10/2026 (`docs/research/KET-QUA-TRUOC-SAU-2026-10.md`). **Trạng thái:** chờ chị duyệt và thử trước trên một lớp.
**Mã bộ:** `instrument = 'batnghiep2'` (link giảng viên: `khao-sat-online.html?lop=…&phieu=truoc&bo=batnghiep2`; phiếu in: `khao-sat.html?bo=batnghiep2`).
**Mã nguồn câu hỏi:** `js/khao-sat-bo2.js` (một nguồn cho bản online và bản in).

## 1. Vì sao phải đổi

Bộ 1 (15 câu) đã chạm trần ở hai lớp KTM330HM01/02: trung bình phiếu trước 14,22/15, 28/67 phiếu đạt 15/15. Tỷ lệ đúng từng câu ở phiếu trước
(n = 67, truy từ `answers_a` trên production ngày 07/11/2026, chỉ đọc):

| Câu | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| % đúng | 94 | 99 | 99 | 90 | 96 | 99 | 93 | **60** | 99 | 99 | 99 | 97 | 97 | 99 | 100 |

Chỉ câu 8 (phương thức thâm nhập ít vốn nhất) còn phân biệt được sinh viên. Thiết kế nghiên cứu (`thiet-ke-nghien-cuu.html`, mục «Sửa phiếu
khảo sát», dòng 4) đã quy định: **giữ 10 câu neo, thay 5 câu có tỷ lệ đúng cao nhất bằng câu vận dụng cần tính toán hoặc đánh đổi; độ khó
mục tiêu 0,40–0,70; thử trước trên một lớp.**

## 2. Câu nào bị thay

Quy tắc: trong mỗi cụm chuẩn đầu ra (3 câu) thay đúng một câu có tỷ lệ đúng cao nhất; đồng hạng thì thay câu thuần định nghĩa. Nhờ vậy mỗi cụm
vẫn 3 câu và điểm `out_*` vẫn so sánh được về cấu trúc.

| Cụm (`out_*`) | Câu trong cụm | Thay | Lý do |
|---|---|---|---|
| marketing | 2, 7, 9 | **2** (99 %) | «giá tăng → cầu giảm» ai cũng biết; thay bằng tính doanh thu khi có co giãn |
| taichinh | 1, 3, 5 | **3** (99 %) | nhận diện chi phí biến đổi; thay bằng tính điểm hòa vốn từ số cho sẵn |
| vanhanh | 6, 10, 11 | **10** (99 %) | định nghĩa OEE; thay bằng tìm nút nghẽn nhân công – máy |
| kdqt | 8, 12, 13 | **13** (97 %) | liên doanh khi nào; thay bằng chọn phương thức thâm nhập khi biết tiền mặt |
| chienluoc | 4, 14, 15 | **15** (100 %) | «vì sao nhiều góc nhìn»; thay bằng biên lời sau khi giảm giá |

10 câu neo giữ nguyên: 1, 4, 5, 6, 7, 8, 9, 11, 12, 14. Điểm neo /10 của đợt 10/2026 (tính lại từ `answers_a`) dùng làm mốc so sánh giữa hai bộ.

## 3. Năm câu mới (đáp án in đậm)

Tham số lấy đúng từ `js/engine.js`: giá tham chiếu 150 nghìn ₫, chi phí biến đổi 45 nghìn ₫/sản phẩm, chi phí cố định 30 triệu ₫/vòng, lương
1 triệu ₫/người/vòng, 70 sản phẩm/người/vòng, hệ số co giãn giá ≈ 2.

### Câu 2 (marketing · Analyze) – doanh thu khi tăng giá
Một đội đang bán 2.000 sản phẩm mỗi vòng ở giá 150 nghìn ₫ (doanh thu 300 triệu ₫). Với khách của thị trường này, giá tăng 10% thì lượng bán
giảm khoảng 20%. Nếu đội tăng giá lên 165 nghìn ₫, doanh thu vòng tới ước tính gần nhất với:
a. 330 triệu ₫ – tăng đúng 10% theo giá · b. 300 triệu ₫ – giá tăng bù cho lượng giảm · **c. 264 triệu ₫ – lượng giảm 20% lấn át mức tăng giá 10%** · d. 240 triệu ₫ – giảm 20% theo lượng
*Lời giải:* 2.000 × 0,8 = 1.600 sản phẩm × 165 nghìn = 264 triệu. *Bẫy:* a chỉ nhìn giá; b tưởng bù trừ bằng nhau; d chỉ nhìn lượng.

### Câu 3 (taichinh · Apply) – điểm hòa vốn
Một vòng chơi có chi phí cố định 30 triệu ₫ (mặt bằng, điện nước) và lương 45 công nhân × 1 triệu ₫. Giá bán 150 nghìn ₫, chi phí biến đổi
45 nghìn ₫ mỗi sản phẩm. Đội phải bán ít nhất bao nhiêu sản phẩm để hòa vốn?
**a. Khoảng 715 sản phẩm** · b. Khoảng 500 sản phẩm · c. Khoảng 290 sản phẩm · d. Khoảng 1.670 sản phẩm
*Lời giải:* (30 + 45) triệu ÷ (150 − 45) nghìn = 75.000 ÷ 105 ≈ 714,3 → 715. *Bẫy:* b chia cho giá bán; c quên lương; d chia cho chi phí biến đổi.

### Câu 10 (vanhanh · Apply) – nút nghẽn năng lực
Đội có 40 công nhân, mỗi người làm tối đa 70 sản phẩm mỗi vòng; máy móc có công suất 3.500 sản phẩm. COO đặt kế hoạch sản xuất 3.200 sản
phẩm. Sản lượng thực tế cao nhất có thể đạt là bao nhiêu, vì sao?
a. 3.200 – máy vẫn còn dư công suất · **b. 2.800 – nhân công chỉ đủ cho 40 × 70 sản phẩm** · c. 3.500 – chạy hết công suất máy · d. 2.450 – nhân công bị trừ thêm 12% do quá tải
*Lời giải:* min(kế hoạch, 40 × 70, 3.500) = 2.800; engine cắt kế hoạch về `workers × 70`. *Bẫy:* a và c chỉ nhìn máy; d áp OEE sai chỗ.

### Câu 13 (kdqt · Evaluate) – phương thức thâm nhập khi tiền mặt có hạn
Cuối vòng 4, đội còn 180 triệu ₫ tiền mặt; vòng tới cần khoảng 140 triệu ₫ cho sản xuất và lương trong nước. Ba cách vào thị trường Thái Lan:
xuất khẩu qua nhà phân phối (bỏ ra 30 triệu ₫, biên lợi nhuận thấp, ít kiểm soát); liên doanh (góp 120 triệu ₫, chia lợi nhuận, cùng kiểm
soát); tự lập chi nhánh (300 triệu ₫, toàn quyền). Nếu không vay thêm, lựa chọn hợp lý nhất cho vòng tới là:
a. Tự lập chi nhánh – kiểm soát cao nhất · b. Liên doanh – cân bằng kiểm soát và rủi ro · c. Làm đồng thời xuất khẩu và liên doanh · **d. Xuất khẩu qua nhà phân phối – giữ đủ tiền cho vận hành**
*Lời giải:* 180 − 30 = 150 ≥ 140; liên doanh còn 60 < 140; chi nhánh vượt tiền mặt. *Bẫy:* b là «câu trả lời sách vở» của bộ 1 (liên doanh cân bằng), đúng về lý thuyết nhưng sai với ràng buộc tiền mặt.

### Câu 15 (chienluoc · Analyze) – biên lời sau khi giảm giá
Sản phẩm bán 150 nghìn ₫, chi phí biến đổi 45 nghìn ₫ (lãi gộp 105 nghìn ₫ mỗi sản phẩm). Đối thủ phá giá, CEO định giảm giá 20% xuống
120 nghìn ₫. Để tổng lãi gộp không giảm, lượng bán phải tăng ít nhất:
**a. Khoảng 40%** · b. Khoảng 20% – bằng mức giảm giá · c. Khoảng 25% · d. Không cần tăng – giá rẻ hơn tự bán nhiều hơn
*Lời giải:* lãi gộp mới 75 nghìn; 105 ÷ 75 = 1,4 → +40%. *Bẫy:* b cân bằng theo giá; c lấy 1 ÷ 0,8; d bỏ qua biên lời.

**Đáp án bộ 2 (15 câu):** a c a b b b b c b b a a d a a. Cụm chuẩn đầu ra giữ nguyên: marketing [2, 7, 9], taichinh [1, 3, 5], vanhanh [6, 10, 11], kdqt [8, 12, 13], chienluoc [4, 14, 15].

## 4. Năm câu dự phòng (chưa đưa vào phiếu)

Dùng nếu sau lớp thử bộ 2 vẫn có trên 15 % phiếu trước đạt ≥ 14/15, thay tiếp cho các câu neo dễ nhất (6, 9, 11, 14, 12 theo thứ tự).

1. **Marketing (thay 9):** Chi marketing tăng từ 60 lên 80 triệu ₫ làm doanh thu tăng từ 300 lên 318 triệu ₫; lãi gộp 70 %. Khoản chi thêm này: a. có lời vì doanh thu tăng 18 triệu · **b. lỗ, vì lãi gộp thêm 12,6 triệu nhỏ hơn 20 triệu chi thêm** · c. hòa · d. không đủ dữ liệu.
2. **Tài chính (thay 6):** Tồn kho 1.500 sản phẩm, giá vốn 45 nghìn ₫, phí lưu kho 5 nghìn ₫/sản phẩm/vòng. Vốn đọng và phí lưu kho một vòng là: **a. 67,5 triệu đọng + 7,5 triệu phí** · b. 7,5 triệu đọng + 67,5 triệu phí · c. 75 triệu phí · d. 0 vì hàng chưa bán chưa tốn gì.
3. **Vận hành (thay 11):** Kế hoạch 3.000 sản phẩm với công suất máy 3.000 (chạy 100 %); OEE giảm 25 điểm cho mỗi 100 % vượt ngưỡng 90 %. So với chạy 2.700, OEE giảm khoảng: a. 0 · **b. 2,5 điểm** · c. 10 điểm · d. 25 điểm.
4. **KDQT (thay 12):** Hai thị trường cùng quy mô: Lào (gần, cùng thói quen tiêu dùng, thủ tục nhập khẩu đơn giản, thu nhập thấp) và Hàn Quốc (xa, chứng nhận bắt buộc, thu nhập cao). Theo khung CAGE, khoảng cách nhỏ hơn với doanh nghiệp Cần Thơ nhỏ là: **a. Lào** · b. Hàn Quốc · c. như nhau · d. CAGE không áp dụng cho doanh nghiệp nhỏ.
5. **Chiến lược (thay 14):** Đội có thương hiệu mạnh (độ trung thành 80 %) nhưng chi phí đơn vị cao hơn đối thủ 15 %. Chiến lược Porter phù hợp hơn: a. dẫn đầu chi phí · **b. khác biệt hóa** · c. đua giảm giá · d. rút khỏi thị trường.

## 5. Thử trước trên một lớp (bắt buộc trước khi dùng đại trà)

1. Phát bộ 2 cho một lớp (phiếu trước), n ≥ 30. Xuất gói dữ liệu, chạy `node scripts/research/phan-tich-truoc-sau.mjs <thư mục> --md`.
2. Tính cho 5 câu mới: tỷ lệ đúng (mục tiêu 0,40–0,70) và tương quan câu–tổng (≥ 0,20). Câu ngoài khoảng thì thay bằng câu dự phòng cùng cụm.
3. Kiểm trần: tỷ lệ phiếu trước ≥ 14/15 phải dưới 15 %. Nếu vẫn vượt, thay tiếp bằng câu dự phòng.
4. Chỉ đổi bộ **giữa** hai lượt lớp; một lớp dùng một bộ từ phiếu trước tới phiếu sau. Script phân tích ghép cặp theo (bộ, mã), nên phiếu bộ 1 và bộ 2 không bao giờ bị ghép với nhau.
5. Không xóa bộ 1: dữ liệu 10/2026 vẫn so sánh được qua 10 câu neo.

## 6. Việc kỹ thuật đã làm trong PR này

- `js/khao-sat-bo2.js`: dữ liệu 5 câu mới + hàm ghép với bộ 1.
- `khao-sat-online.html`: lựa chọn «Khởi nghiệp – bộ 2», `?bo=batnghiep2`, chấm tự động theo đáp án bộ 2, lưu `instrument = 'batnghiep2'`.
- `khao-sat.html?bo=batnghiep2`: phiếu in thay 5 câu, nhãn «BỘ 2» trên cả phiếu trước và sau.
- Instructor Studio: chọn bộ 2 khi tạo link lớp; đếm phiếu bộ 2 vào nhóm Khởi nghiệp.
- `scripts/research/phan-tich-truoc-sau.mjs`: ghép cặp theo (bộ, mã) và báo bộ nào có trong dữ liệu.
- Không cần migration: cột `survey_responses.instrument` là `text`, không có ràng buộc giá trị.
