# Bộ công cụ thiết kế và đánh giá học tập
## Hệ sinh thái mô phỏng kinh doanh BizOn Bật Nghiệp

**Tác giả:** Đỗ Thùy Hương · Phan Anh Tú
**Phiên bản:** 1.3 · **Ngày lập:** 31/07/2026 · **Cập nhật gần nhất:** 23/09/2026 (thêm cơ cấu điểm học phần cho cả game chính – Bật Nghiệp và Hộ Chiếu Thương Hiệu, bản song ngữ cho Hộ Chiếu Thương Hiệu dùng cho lớp quốc tế)
**Loại tài liệu:** Tác phẩm viết – công cụ thiết kế sư phạm và đánh giá kết quả học tập

> Tài liệu này tách ra từ trang `hoc-thuat.html` để dùng độc lập trong ba việc: (1) giảng viên thiết kế buổi học và chấm điểm, (2) hồ sơ kiểm định chương trình đào tạo, (3) hồ sơ đăng ký quyền tác giả loại hình tác phẩm viết.

---

## Mục lục

- [1 · Khung lý thuyết và nguyên tắc thiết kế](#1--khung-lý-thuyết-và-nguyên-tắc-thiết-kế)
- [2 · Ma trận chuẩn đầu ra – Game mô phỏng chính](#2--ma-trận-chuẩn-đầu-ra--game-mô-phỏng-chính)
- [3 · Ma trận chuẩn đầu ra – Hộ Chiếu Thương Hiệu](#3--ma-trận-chuẩn-đầu-ra--hộ-chiếu-thương-hiệu)
- [3b · Ma trận chuẩn đầu ra – Bến Phù Sa](#3b--ma-trận-chuẩn-đầu-ra--bến-phù-sa)
- [3c · Ma trận chuẩn đầu ra – Hộ Chiếu Sầu Riêng](#3c--ma-trận-chuẩn-đầu-ra--hộ-chiếu-sầu-riêng)
- [4 · Rubric chấm thảo luận sau ván chơi](#4--rubric-chấm-thảo-luận-sau-ván-chơi)
  - [4.1 · Rubric game mô phỏng chính](#41--rubric-game-mô-phỏng-chính--clo-a-đến-clo-e)
  - [4.2 · Rubric Hộ Chiếu Thương Hiệu](#42--rubric-game-hộ-chiếu-thương-hiệu--bp-1-đến-bp-6)
  - [4.5 · Sổ điểm mẫu](#45--sổ-điểm-mẫu)
- [5 · Công cụ đo lường trước – sau](#5--công-cụ-đo-lường-trước--sau)
- [6 · Hướng dẫn vận dụng](#6--hướng-dẫn-vận-dụng)
- [7 · Giả định và giới hạn diễn giải](#7--giả-định-và-giới-hạn-diễn-giải)
- [8 · Cơ sở khoa học tham khảo](#8--cơ-sở-khoa-học-tham-khảo)
- [9 · Phần còn phát triển](#9--phần-còn-phát-triển)

---

# 1 · Khung lý thuyết và nguyên tắc thiết kế

## 1.1 · Thang phân loại Bloom

Toàn bộ chuẩn đầu ra trong tài liệu được gắn với thang Bloom (bản sửa đổi Anderson & Krathwohl). Thiết kế có chủ đích đặt trọng tâm ở **ba bậc cao** – Phân tích, Đánh giá, Sáng tạo – vì bậc Nhớ và Hiểu đã được giáo trình và bài giảng truyền thống đảm nhiệm. Trò chơi mô phỏng có lợi thế riêng ở chỗ buộc người học **ra quyết định trong điều kiện thiếu thông tin và có ràng buộc thời gian**, là tình huống mà bài kiểm tra viết khó tái tạo.

## 1.2 · Bốn nguyên tắc thiết kế

| Nguyên tắc | Diễn giải | Thể hiện trong sản phẩm |
|---|---|---|
| **Quyết định trước, lý thuyết sau** | Người học ra quyết định rồi mới đối chiếu với khung lý thuyết trong buổi thảo luận | Thảo luận sau ván là bắt buộc, không phải phần thêm |
| **Không có đáp án đúng duy nhất** | Mọi lựa chọn đều có đánh đổi; điểm số đa tiêu chí thay vì một chỉ số | Điểm 5 chiều công khai từ đầu ván |
| **Engine giải thích được** | Người học truy được vì sao kết quả ra như vậy | Công thức tính công bố trong Model Card |
| **Sai lầm có chi phí nhưng không kết thúc** | Thất bại là dữ liệu học tập, không phải hình phạt | Dấu chân quyết định cho phép truy vết và rút bài học |

## 1.3 · Quan hệ giữa cạnh tranh và hợp tác

Thiết kế đặt **cạnh tranh giữa các doanh nghiệp** và **hợp tác trong nội bộ đội C-Suite** cùng lúc. Đây là lựa chọn có căn cứ: tổng hợp bằng chứng của Sailer & Homner (2020) cho thấy sự kết hợp hai yếu tố này hỗ trợ tốt cho kết quả hành vi và động lực học tập, tốt hơn so với chỉ cạnh tranh hoặc chỉ hợp tác.

---

# 2 · Ma trận chuẩn đầu ra – Game mô phỏng chính

Ký hiệu: **CLO-A** đến **CLO-E**

| Mã | Cơ chế mô phỏng | Cấp độ Bloom | Chuẩn đầu ra – sau khi chơi và thảo luận, sinh viên có thể… |
|---|---|---|---|
| **CLO-A** | Quyết định Giá & Marketing (vai CMO) | Analyze – Phân tích | Phân tích quan hệ giữa độ co giãn giá, chi phí tiếp thị và tổng cầu thị trường |
| **CLO-B** | Quản trị Dòng tiền (vai CFO) | Evaluate – Đánh giá | Tối ưu vốn lưu động, đòn bẩy tài chính và thanh khoản ngắn hạn |
| **CLO-C** | Quản trị Vận hành (vai COO) | Apply – Vận dụng | Cân đối năng lực sản xuất, chi phí khấu hao, bảo trì và mục tiêu năng lượng ESG |
| **CLO-D** | BizOn Go Global | Evaluate – Đánh giá | So sánh rủi ro, chi phí và mức độ kiểm soát giữa các phương thức thâm nhập quốc tế |
| **CLO-E** | Hợp tác C-Suite (5 vai) | Create / Apply – Sáng tạo / Vận dụng | Thực hành giao tiếp liên chức năng và ra quyết định dưới áp lực thời gian |

## 2.1 · Chỉ số quan sát và phương pháp đánh giá

| Mã | Chỉ số quan sát được | Phương pháp đánh giá |
|---|---|---|
| CLO-A | Hệ số co giãn thực hiện; tỷ lệ doanh thu trên chi phí marketing (ROI) | Báo cáo phân tích thị trường sau vòng chơi |
| CLO-B | Số dư dòng tiền; tỷ lệ nợ trên vốn chủ; giá trị tồn kho | Đánh giá báo cáo tài chính và lưu chuyển tiền tệ |
| CLO-C | Sản lượng trên công suất; chi phí khấu hao và năng lượng; chỉ số OEE | Chỉ số hiệu quả vận hành trong báo cáo cuối ván |
| CLO-D | Điểm rủi ro quốc gia; tỷ suất lợi nhuận biên xuất khẩu | Bản thu hoạch chiến lược quốc tế hóa (reflection memo) |
| CLO-E | Tần suất chỉnh sửa quyết định; nội dung Nhật ký đội do vai Thư ký ghi | Đánh giá đồng đẳng trong đội (peer-assessment) |

**Điểm mạnh của bộ chỉ số này:** cả năm chỉ số đều **lấy tự động từ dữ liệu ván chơi**, không phụ thuộc vào cảm nhận chủ quan của giảng viên. Bảng điều khiển giảng viên xuất được dữ liệu này ra tệp CSV để chấm.

---

# 3 · Ma trận chuẩn đầu ra – Hộ Chiếu Thương Hiệu

Ký hiệu: **BP-1** đến **BP-6** · Game mô phỏng quốc tế hóa doanh nghiệp, 6 quý kinh doanh

| Mã | Chuẩn đầu ra – sau khi chơi và thảo luận, sinh viên có thể… | Bloom | Cơ chế game tương ứng |
|---|---|---|---|
| **BP-1** | So sánh và lựa chọn thị trường quốc tế dựa trên đặc điểm cầu, thể chế và cạnh tranh | Phân tích | 7 thị trường giả tưởng với hồ sơ ẩn khác nhau |
| **BP-2** | Giải thích quan hệ giữa mức cam kết của phương thức thâm nhập với kiểm soát, lợi nhuận và rủi ro | Hiểu / Vận dụng | 3 phương thức: nền tảng số · xuất khẩu trực tiếp · đối tác địa phương |
| **BP-3** | Đánh giá độ tin cậy và độ thiên lệch của các nguồn thông tin thị trường trước khi ra quyết định | Đánh giá | Sương mù thị trường + 6 nguồn tin có chi phí, độ chính xác và thiên lệch riêng |
| **BP-4** | Phân tích đánh đổi chuẩn hóa – thích nghi và tuân thủ thể chế khi vào thị trường khó tính | Phân tích | Chứng nhận Bắc Phong · hồ sơ bền vững Lục Đảo · sự kiện thể chế |
| **BP-5** | Nhận diện hệ quả dài hạn của chuỗi quyết định quản trị (path dependence) | Phân tích / Đánh giá | Dấu chân quyết định · nhiệm vụ đàm phán «Cánh cửa Bắc Phong» |
| **BP-6** | Ra quyết định theo mục tiêu đa tiêu chí thay vì tối đa hóa một chỉ số duy nhất | Sáng tạo | Điểm 5 chiều công khai 30/20/20/15/15 + 4 danh hiệu |

## 3.1 · Vì sao đặt BP-3 vào bậc Đánh giá

BP-3 là chuẩn đầu ra **khó dạy nhất bằng phương pháp truyền thống**. Cơ chế game đặt người học vào tình huống phải trả tiền để mua thông tin, trong đó có nguồn cố ý thiên lệch – dữ liệu mạng xã hội thổi phồng mức quan tâm, tin từ đối tác địa phương thiên vị kênh phân phối của chính họ. Người học chỉ phát hiện ra sự thiên lệch sau khi đã ra quyết định và nhận hậu quả. Đây là trải nghiệm mà một bài giảng về «đánh giá nguồn thông tin» khó tạo ra được.

---

# 3b · Ma trận chuẩn đầu ra – Bến Phù Sa

Ký hiệu: **BPS-1** đến **BPS-5** · Game bậc 1 (khởi sự kinh doanh đường phố), 5 tuần, cùng 3 đối thủ AI. Bổ sung 06/11/2026 theo kế hoạch dọn hệ sinh thái; cơ chế lấy từ `ben-phu-sa.html` và hồ sơ `docs/ip/ben-phu-sa/HO-SO-NOP-2026.md`; chỉ số theo gói dữ liệu `docs/research/TU-DIEN-BIEN.md` (nhóm Bậc 1).

| Mã | Chuẩn đầu ra – sau khi chơi và thảo luận, sinh viên có thể… | Bloom | Cơ chế game tương ứng |
|---|---|---|---|
| **BPS-1** | Phân biệt quyết định *thăm dò* (gánh hàng rong, khảo sát chợ) với quyết định *khai thác* (ghe hàng bông) và giải thích khi nào nên đổi | Hiểu / Vận dụng | 3 phương thức: ghe ×3 doanh thu · gánh ×1 nhiều thông tin · khảo sát không bán |
| **BPS-2** | Suy ra nhu cầu ẩn của một cặp món hàng × địa điểm từ dữ liệu bán hàng vài tuần, thay vì đoán theo cảm tính | Phân tích | Nhu cầu ẩn theo cặp món×khu, sinh theo seed; 6 khu với chân dung khách khác nhau |
| **BPS-3** | Dự đoán tác động của đụng độ đối thủ lên doanh thu và chọn địa điểm tránh hoặc chấp nhận cạnh tranh | Vận dụng | Luật chia khách khi đụng độ; 3 AI mỗi «nhà» một chiến lược |
| **BPS-4** | Đánh giá kết quả của mình so với kịch bản hoàn hảo, nhận ra phần do may rủi và phần do quyết định | Đánh giá | Hiệu suất so với kịch bản hoàn hảo (`t1_eff` 0–100) và xếp hạng 4 đội |
| **BPS-5** | Rút ra một bài học có thể kiểm chứng ở tuần sau từ kết quả tuần trước (vòng lặp ra quyết định – quan sát – điều chỉnh) | Sáng tạo | Câu hỏi tổng kết để debrief; `t1_explain` |

## 3b.1 · Chỉ số quan sát và phương pháp đánh giá

| Mã | Chỉ số quan sát được (tự động) | Phương pháp đánh giá |
|---|---|---|
| BPS-1 | `t1_explore_weeks`, `t1_exploit_weeks`, `t1_survey_weeks`; `effectuation_index` = (tuần thử + khảo sát) ÷ 5 | Đối chiếu lời giải thích của sinh viên với chuỗi phương thức 5 tuần |
| BPS-2 | Doanh thu theo tuần của cặp món × khu đã chọn; số lần đổi món hoặc khu | Sinh viên chỉ ra tuần nào dữ liệu đủ để kết luận về nhu cầu |
| BPS-3 | Tuần có đụng độ đối thủ và doanh thu tuần đó so với tuần không đụng độ | Thảo luận «Bảng Giáo Viên» Bến Phù Sa (`Bang Giao Vien.dc.html`) |
| BPS-4 | `t1_eff` (0–100), `t1_rank` (1–4), `t1_total` | Sinh viên tự ước lượng rồi so với `t1_eff` thật |
| BPS-5 | `t1_explain` (câu giải thích cuối ván); bài tình huống `case_tasks.csv` (`aligned`, `why`) | Rubric lập luận 4 mức như Mục 4 |

**Tiêu chí đạt theo tuần (đếm được):** tuần 1–2 có ít nhất một tuần thăm dò (gánh hoặc khảo sát); từ tuần 3 có ít nhất một lần giữ nguyên cặp món × khu đã cho doanh thu cao nhất; câu giải thích cuối ván nêu được một con số của chính ván chơi.

# 3c · Ma trận chuẩn đầu ra – Hộ Chiếu Sầu Riêng

Ký hiệu: **SR-1** đến **SR-6** · Game bậc 3 (xuất khẩu nông sản), 6 vụ, đội 5 vai, 7 CEO đối thủ của Go Global. Bổ sung 06/11/2026; cơ chế và điểm tổng lấy từ `docs/huong-dan-ho-chieu-sau-rieng.md` và `lab/ho-chieu-sau-rieng-engine.js` (điểm 0–100 = 30% lợi nhuận + 20% uy tín + 20% năng lực + 15% thích ứng + 15% bền vững). Hộ Chiếu Sầu Riêng **không** nằm trong hồ sơ đăng ký quyền tác giả 2026, nên ma trận này có thể chỉnh tự do.

| Mã | Chuẩn đầu ra – sau khi chơi và thảo luận, sinh viên có thể… | Bloom | Cơ chế game tương ứng |
|---|---|---|---|
| **SR-1** | Giải thích rào cản TBT/SPS của Nghị định thư sầu riêng Việt Nam – Trung Quốc 2022: mã vùng trồng, mã cơ sở đóng gói, lấy mẫu, tạm dừng mã | Hiểu | Nguồn hàng «vùng liên kết có mã» đắt hơn; biến cố kiểm tra Hải quan và cảnh báo cadimi (vụ 4) |
| **SR-2** | So sánh biên lợi nhuận, rủi ro và yêu cầu năng lực giữa tiểu ngạch, chính ngạch, đông lạnh, thị trường cao cấp và nội địa | Phân tích | Chia sản lượng cho 6 kênh mỗi vụ; nghị định thư đông lạnh (vụ 6) |
| **SR-3** | Đánh giá đánh đổi giữa chi phí tuân thủ và rủi ro bị chặn hàng, giữa lợi nhuận ngắn hạn và uy tín ngành | Đánh giá | Vụ «dán nhãn Thái»; điểm uy tín `rep` và bền vững `sus` công khai |
| **SR-4** | Nhận diện nguồn tin thiên lệch và quyết định có đáng trả tiền mua tin hay không | Đánh giá | Mỗi vụ mua tối đa 2 nguồn tin, có nguồn thiên lệch; «Nếu – Thì» tối đa 2 lần |
| **SR-5** | Phối hợp 5 vai để chốt một phiếu quyết định đúng hạn khi khuyến nghị của các vai mâu thuẫn | Vận dụng / Sáng tạo | Họp đội 4 khuyến nghị (có thể chưa tối ưu), đồng hồ vụ, ghi «trễ hạn» |
| **SR-6** | Lập luận về nâng cấp chuỗi giá trị khi Việt Nam có thị phần lớn nhưng giá thấp hơn Thái Lan | Sáng tạo | Ưu tiên đầu tư mỗi vụ; điểm năng lực `capability`; so sánh với 7 nhà buôn nước ngoài |

## 3c.1 · Chỉ số quan sát và phương pháp đánh giá

| Mã | Chỉ số quan sát được (tự động, bảng đội–vụ CSV) | Phương pháp đánh giá |
|---|---|---|
| SR-1 | Tỷ lệ mua từ vùng liên kết có mã; kết quả kiểm tra (`audit`) vụ 4 | Sinh viên giải thích vì sao đội bị hoặc không bị chặn hàng |
| SR-2 | Phân bổ 6 kênh (`byChannel`) và lãi theo kênh từng vụ | Bản thu hoạch: kênh nào lãi nhất, vì sao không dồn hết vào đó |
| SR-3 | `rep`, `sus` cuối ván; phản ứng với biến cố «dán nhãn Thái» | Rubric lập luận 4 mức như Mục 4 |
| SR-4 | Số nguồn tin đã mua, nguồn nào thiên lệch; số lần «Nếu – Thì» | Đối chiếu dự báo của đội với kết quả thật |
| SR-5 | Số vụ chốt đúng hạn; nhật ký sự kiện (`event_id, timestamp`) | Đánh giá đồng đẳng trong đội |
| SR-6 | `capability` cuối ván; chuỗi ưu tiên đầu tư 6 vụ; thứ hạng so với 7 đối thủ | Thảo luận 4 câu hỏi ở màn báo cáo |

**Tiêu chí đạt theo vụ (đếm được):** ít nhất 4/6 vụ chốt đúng hạn; từ vụ 2 có mua tin và nêu được nguồn nào thiên lệch; vụ 4 giải thích được kết quả kiểm tra bằng tỷ lệ nguồn hàng có mã; bản thu hoạch cuối ván dẫn ít nhất hai trong năm điểm thành phần.

## 3b–3c · English summary

- **Bến Phù Sa (BPS-1…5):** tell exploration from exploitation; infer hidden demand per product × place from sales data; anticipate rival collisions; judge one's own result against the perfect-play benchmark (`t1_eff`); turn last week's result into a testable lesson.
- **Durian Passport (SR-1…6):** explain the 2022 Viet Nam – China durian protocol (orchard and packing-house codes, sampling, code suspension); compare export channels; weigh compliance cost against shipment rejection and industry reputation; detect biased market intelligence; coordinate five roles to a deadline; argue for value-chain upgrading.

---

# 4 · Rubric chấm thảo luận sau ván chơi

Hai bộ rubric, cùng thang 4 mức, dùng cho hai game khác nhau. Cả hai đều **chấm phần lập luận, không chấm kết quả ván chơi**.

---

## 4.1 · Rubric game mô phỏng chính — CLO-A đến CLO-E

> 🚧 **Bản nháp phiên bản 0.1 – chờ hai tác giả rà soát.** Rubric này do nhóm phát triển dựng từ các chỉ số mà engine thực sự ghi lại sau mỗi vòng chơi. Mức mô tả và ngưỡng phân biệt cần được người có chuyên môn sư phạm hiệu chỉnh, và phải chấm thử trước khi dùng chính thức.

**Điểm khác biệt so với rubric Hộ Chiếu Thương Hiệu:** mỗi tiêu chí ở đây đều **neo vào một chỉ số cụ thể trong báo cáo cuối ván**, nên giảng viên có căn cứ số liệu để bảo vệ điểm đã cho, và người học biết trước mình cần dẫn chứng bằng gì.

| Tiêu chí | 1 · Chưa đạt | 2 · Đạt | 3 · Khá | 4 · Xuất sắc |
|---|---|---|---|---|
| **A · Phân tích giá – marketing – cầu**<br>*(CLO-A, vai CMO)*<br>Chỉ số neo: `adEff`, `share`, `lostSales`, chi marketing | Kể lại đã đặt giá bao nhiêu, không giải thích | Nêu được quan hệ giá tăng → cầu giảm ở mức định tính | Dẫn số liệu hiệu quả quảng cáo và thị phần của ít nhất 2 vòng để giải thích một quyết định | Chỉ ra được vòng nào chi marketing kém hiệu quả và tính được ngưỡng chi hợp lý từ dữ liệu ván chơi |
| **B · Quản trị dòng tiền và thanh khoản**<br>*(CLO-B, vai CFO)*<br>Chỉ số neo: `quickRatio`, `balance`, `roi`, lãi vay | Chỉ nhìn số dư cuối ván | Nhận ra có vòng thiếu tiền mặt | Truy được nguyên nhân thiếu hụt – tồn kho, lãi vay hay chi phí cố định | Đề xuất phương án cơ cấu vốn thay thế và ước lượng được tác động lên thanh khoản |
| **C · Cân đối vận hành và ESG**<br>*(CLO-C, vai COO)*<br>Chỉ số neo: `oee`, `defect`, sản lượng trên công suất, khấu hao | Chỉ báo cáo sản lượng | Nhận ra chạy quá công suất làm giảm hiệu quả | Giải thích được quan hệ giữa OEE, tỷ lệ phế phẩm và chi phí đơn vị | Cân đối được ba ràng buộc công suất – nhân lực – năng lượng và lượng hóa đánh đổi |
| **D · So sánh phương thức thâm nhập quốc tế**<br>*(CLO-D)*<br>Chỉ số neo: dữ liệu phần Go Global | Chọn theo cảm tính | Nêu được 1 tiêu chí so sánh | So sánh ít nhất 2 phương thức trên ba trục kiểm soát – lợi nhuận – rủi ro | Gắn lựa chọn với đặc điểm nguồn lực của chính doanh nghiệp mình trong ván |
| **E · Hợp tác liên chức năng**<br>*(CLO-E, cả 5 vai)*<br>Chỉ số neo: Nhật ký đội, tần suất sửa quyết định, đánh giá đồng đẳng | Một người quyết tất cả | Có phân vai nhưng ai làm việc nấy | Nhật ký ghi được ít nhất một lần xung đột quan điểm và cách giải quyết | Chỉ ra được quyết định nào tốt lên nhờ tranh luận liên chức năng, có dẫn chứng trong nhật ký |

### Vì sao neo vào chỉ số

Engine ghi lại **hơn 20 chỉ số mỗi vòng chơi**. Bản `result_json` gửi lên lớp là bản rút gọn (xem `docs/design/tro-ly-giang-vien.md` §2), nên tệp Excel/CSV từ bảng điều khiển giảng viên chỉ có **`share`, `quickRatio`, `oee`, `defect`** và lợi nhuận; **`adEff`, `lostSales`, `roi` chỉ hiện trong báo cáo vòng trên màn hình của đội**, người học phải tự trích khi trình bày (đối chiếu 06/11/2026):

| Chỉ số | Ý nghĩa | Báo cáo chứa nó |
|---|---|---|
| `adEff` | Hiệu quả quảng cáo trên mỗi đồng chi | Báo cáo thị trường (chỉ trên màn hình đội) |
| `share` · `lostSales` | Thị phần và số đơn hụt do thiếu hàng | Báo cáo thị trường (`share` có trong tệp xuất; `lostSales` chỉ trên màn hình đội) |
| `quickRatio` | Chỉ số thanh khoản nhanh | Báo cáo dòng tiền (có trong tệp xuất) |
| `roi` | Tỷ suất sinh lời trên tổng chi phí | Báo cáo lãi lỗ (chỉ trên màn hình đội) |
| `oee` · `defect` | Hiệu quả thiết bị tổng thể và tỷ lệ phế phẩm | Báo cáo vận hành (có trong tệp xuất) |

**Hệ quả thực tế:** giảng viên chấm mức 3 và mức 4 **bắt buộc phải yêu cầu người học trích số cụ thể**. Nếu người học không dẫn được số, cao nhất chỉ đạt mức 2. Đây là cách giữ cho rubric không trôi về cảm tính.

### Cơ cấu điểm học phần

| Thành phần | Trọng số | Nguồn |
|---|:-:|---|
| Điểm game B1–B6, thang 10 đã công bố cho sinh viên (B1 lợi nhuận /2 · B2 thị phần /2 · B3 vận hành /2 · B4 thành tựu /1,5 · B5 đóng góp cá nhân /1,5 · B6 ứng biến /1) | **50%** | Tự động – Excel «Tổng /10» từ bảng điều khiển giảng viên; B5 theo Nhật ký thành viên |
| Rubric lập luận CLO-A…E (Mục 4.1, thang 4 mức, quy đổi /10 theo Mục 4.3) | **30%** | Giảng viên chấm bài thảo luận hoặc bản thu hoạch sau ván |
| Hợp tác vai trò & Bài học rút ra (Nhánh A thảo luận vai trò 60% + Nhánh B bài học 40%) | **20%** | Giảng viên chấm từ Nhật ký đội và đánh giá đồng đẳng |

> ✅ **Quyết định 07/11/2026** (sau đợt rà 06/11/2026), thay cho cơ cấu cũ 45 · 35 · 20: giữ nguyên thang B1–B6 đã phát cho sinh viên (`Thang Diem Bat Nghiep - Sinh Vien.dc.html`, đã dùng ở lớp KT330H-M02) làm phần kết quả 50%; 50% còn lại do giảng viên chấm lập luận và hợp tác, khớp tuyên bố «chấm phần lập luận, không chấm kết quả ván chơi». Không cần đổi tệp Excel hay cơ sở dữ liệu. Lớp đang học giữa kỳ theo cơ cấu cũ thì giữ tới hết kỳ.

**Rubric tiêu chí "Hợp tác vai trò & Bài học rút ra" (20%)** — chia 2 nhánh nội bộ: Nhánh A – thảo luận vai trò xuyên suốt 6 vòng (60% × 20% = 12%) và Nhánh B – bài học rút ra cuối ván (40% × 20% = 8%).

*Nhánh A · Thảo luận vai trò — chấm theo từng vòng:*

| Vòng | Bản đồ | Đạt (✓) nếu |
|---|---|---|
| 1 | Cần Thơ | ≥4/5 vai có ý kiến ghi lại trong Nhật ký |
| 2 | TP.HCM | Nhật ký ghi ≥1 ý kiến trái chiều về biến cố "Cơ Hội Vàng" |
| 3 | Khánh Hòa | Số lần sửa quyết định trước Commit ≥2 (phản ứng Price War) |
| 4 | Đà Nẵng | Nhật ký nêu được vai COO đề xuất gì (khủng hoảng năng lượng) |
| 5 | Thanh Hóa | Nhật ký ghi rõ ai đề xuất, ai phản đối (siết tín dụng) |
| 6 | Hà Nội | Nhật ký có đoạn tổng kết tranh luận, nêu quyết định cuối và ai nhượng bộ |

| Số vòng đạt ✓ (trên 6) | Mức | Điểm |
|---|---|---|
| 0–1 | Chưa đạt | 1 |
| 2–3 | Đạt | 2 |
| 4–5 | Khá | 3 |
| 6, và ≥1 vòng chỉ ra quyết định thay đổi tốt lên rõ rệt nhờ tranh luận (có số liệu trước/sau) | Xuất sắc | 4 |

*Nhánh B · Bài học rút ra cuối ván (chấm 1 lần):*

| Mức | Mô tả | Điểm |
|---|---|---|
| Chưa đạt | Không rút bài học, hoặc chỉ chép lại kết quả | 1 |
| Đạt | Bài học chung chung, không gắn dữ liệu ván chơi cụ thể | 2 |
| Khá | Bài học gắn với 1 tình huống cụ thể — trích được vòng nào, quyết định gì, giải thích nguyên nhân–kết quả | 3 |
| Xuất sắc | Như mức Khá, cộng liên hệ được với doanh nghiệp Việt Nam thực tế và nêu điều sẽ làm khác nếu chơi lại | 4 |

**Quy đổi:** Điểm tiêu chí (1–4) = 0,6 × Nhánh A + 0,4 × Nhánh B → quy đổi thang 10 theo bảng ở [§4.3](#43--cách-quy-đổi-điểm) → đóng góp vào tổng học phần = (điểm thang 10 ÷ 10) × 20%.

### Sổ điểm mẫu — Bật Nghiệp

**Đội: ……………………………  ·  Lớp: …………  ·  Ngày: …………**

| Vòng | 1 | 2 | 3 | 4 | 5 | 6 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Nhánh A – đạt ✓? | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

| Thành phần | Điểm | Trọng số | Quy đổi /10 |
|---|:-:|:-:|:-:|
| Điểm game B1–B6 (Excel «Tổng /10») | …/10 | 50% | …… |
| Rubric lập luận CLO-A…E (…/4 → …/10 theo Mục 4.3) | …/4 | 30% | …… |
| Nhánh A (…/4) × 0,6 + Nhánh B (…/4) × 0,4 = …/4 | | 20% | …… |
| **Điểm học phần** | | **100%** | **…… /10** |

> 🚧 Bản nháp đầu tiên — chưa chấm thử thực tế, xem [Mục 9](#9--phần-còn-phát-triển).

---

## 4.2 · Rubric game Hộ Chiếu Thương Hiệu — BP-1 đến BP-6

| Tiêu chí / Criterion | 1 · Chưa đạt / Not yet | 2 · Đạt / Pass | 3 · Khá / Good | 4 · Xuất sắc / Excellent |
|---|---|---|---|---|
| **Lập luận chọn thị trường và phương thức** / *Market & entry-mode reasoning*<br>*(BP-1, BP-2)* | Kể lại lựa chọn, không nêu lý do / Recounts the choice, no reason given | Nêu được 1 lý do phù hợp / States one relevant reason | So sánh ít nhất 2 phương án bằng dữ liệu trong ván / Compares ≥2 options using in-game data | Gắn lựa chọn với khung lý thuyết – mức cam kết, khoảng cách thể chế / Ties the choice to theory – commitment level, institutional distance |
| **Đánh giá nguồn thông tin** / *Source evaluation*<br>*(BP-3)* | Tin mọi nguồn như nhau / Trusts every source equally | Nhận ra có nguồn không đáng tin / Recognizes an unreliable source | Chỉ ra đúng nguồn thiên lệch và giải thích vì sao / Correctly identifies the biased source and explains why | Đề xuất chiến lược kết hợp nguồn theo cân đối chi phí – độ tin cậy / Proposes a source-mix strategy balancing cost and reliability |
| **Phân tích dấu chân quyết định** / *Decision-footprint analysis*<br>*(BP-5)* | Chỉ nhìn kết quả cuối ván / Looks only at the final outcome | Nêu được 1 hệ quả dài hạn / Names one long-term consequence | Truy vết được chuỗi quyết định dẫn tới hệ quả / Traces the decision chain leading to it | Đề xuất điểm can thiệp sớm nhất có thể đổi kết cục / Proposes the earliest point that could have changed the outcome |
| **Bài học chuyển giao** / *Transferable lesson*<br>*(BP-6)* | Không rút ra bài học / Draws no lesson | Bài học chung chung / Generic lesson | Bài học gắn với tình huống cụ thể trong ván / Lesson tied to a specific in-game situation | Liên hệ được với doanh nghiệp Việt Nam thực tế, có ví dụ / Connects to a real Vietnamese business, with an example |

### Cơ cấu điểm học phần cho lớp quốc tế / Course-grade structure for international classes

> Bổ sung theo nhu cầu thực tế: PGS.TS. Phan Anh Tú dùng Hộ Chiếu Thương Hiệu dạy học phần có sinh viên trao đổi quốc tế (song ngữ Việt–Anh). Bảng dưới gắn rubric ở trên vào một công thức điểm học phần cụ thể. / Added for a real teaching need: PGS.TS. Phan Anh Tú uses Brand Passport to teach a course with international exchange students (bilingual VI–EN). The table below ties the rubric above to a concrete course-grade formula.

**Công thức / Formula** (thang điểm 10 / out of 10):

```
Điểm học phần = 40% × (điểm game tự động ÷ 10)
              + 40% × band(TB 4 tiêu chí rubric ở trên)
              + 20% × band(điểm thảo luận cuối ván)

Course grade  = 40% × (auto game score ÷ 10)
              + 40% × band(mean of the 4 rubric criteria above)
              + 20% × band(end-of-game debrief score)
```

| Thành phần / Component | Trọng số / Weight | Nguồn / Source |
|---|:-:|---|
| Điểm game tự động / Auto game score | **40%** | Điểm tổng 0–100 game tự tính cuối ván: 30% Lợi nhuận + 20% Uy tín + 20% Năng lực + 15% Thích ứng + 15% Bền vững / The game's own 0–100 total at game-end: 30% Profit + 20% Reputation + 20% Capability + 15% Adaptation + 15% Sustainability |
| Rubric lập luận BP-1→BP-6 / Reasoning rubric | **40%** | Trung bình cộng 4 tiêu chí ở trên, giảng viên chấm dựa trên «Dấu chân quyết định» cuối ván / Mean of the 4 criteria above, instructor-graded from the end-of-game "decision footprint" |
| Thảo luận & bài học cuối ván / Debrief & lessons | **20%** | 1 điểm thang 1–4 dựa trên 4 câu hỏi tổng kết ở màn kết thúc game / One 1–4 score based on the game's 4 end-screen wrap-up questions |

`band(x)` dùng đúng bảng quy đổi ở [§4.3](#43--cách-quy-đổi-điểm) ngay dưới đây, nội suy tuyến tính trong từng khoảng (ví dụ x=3,0 → 7,9/10). / `band(x)` uses the exact conversion bands in [§4.3](#43--cách-quy-đổi-điểm) right below, linearly interpolated within each band (e.g. x=3.0 → 7.9/10).

> 🚧 Cơ cấu trọng số 40/40/20 là đề xuất ban đầu, chưa chấm thử thực tế — điều chỉnh sau buổi thí điểm đầu tiên (dự kiến 01/10/2026, lớp FDI, thầy Phan Anh Tú). / The 40/40/20 weighting is an initial proposal, not yet field-tested — expect to adjust after the first pilot session (planned 2026-10-01, FDI class, Prof. Phan Anh Tú).

### Sổ điểm mẫu — Hộ Chiếu Thương Hiệu / Sample scoring sheet — Brand Passport

**Sinh viên / Student: ……………… · Doanh nghiệp / Firm: ……………… · Lớp / Class: ……………… · Ngày / Date: ………**

| Thành phần / Component | Điểm / Score | Trọng số / Weight | Quy đổi /10 / Out of 10 |
|---|:-:|:-:|:-:|
| Điểm game tự động / Auto game score | …… /100 | 40% | …… |
| Lập luận chọn thị trường & phương thức / Market & entry-mode reasoning | ☐1 ☐2 ☐3 ☐4 | ↓ | |
| Đánh giá nguồn thông tin / Source evaluation | ☐1 ☐2 ☐3 ☐4 | ↓ | |
| Phân tích dấu chân quyết định / Decision-footprint analysis | ☐1 ☐2 ☐3 ☐4 | ↓ | |
| Bài học chuyển giao / Transferable lesson | ☐1 ☐2 ☐3 ☐4 | ↓ | |
| → TB rubric / Rubric mean | …… /4 | 40% | …… |
| Thảo luận cuối ván / Debrief | ☐1 ☐2 ☐3 ☐4 | 20% | …… |
| **Điểm học phần / Course grade** | | **100%** | **…… /10** |

Nhận xét / Comments: ……………………………………………………………………………………………

## 4.3 · Cách quy đổi điểm

Bốn tiêu chí có trọng số bằng nhau. Điểm rubric = trung bình cộng 4 tiêu chí, thang 1–4.

| Điểm rubric | Xếp loại | Quy đổi thang 10 |
|---|---|---|
| 3,5 – 4,0 | Xuất sắc | 9,0 – 10 |
| 2,5 – 3,4 | Khá | 7,0 – 8,9 |
| 1,5 – 2,4 | Đạt | 5,0 – 6,9 |
| 1,0 – 1,4 | Chưa đạt | dưới 5,0 |

## 4.4 · Lưu ý khi chấm

- **Chấm phần lập luận, không chấm kết quả ván chơi.** Một đội thua nhưng phân tích được vì sao mình thua có thể đạt mức 4; một đội thắng nhờ may mắn mà không giải thích được có thể chỉ ở mức 2.
- **Yêu cầu dẫn chứng bằng số liệu trong ván.** Từ mức 3 trở lên bắt buộc phải trích được con số cụ thể từ báo cáo hoặc dấu chân quyết định.
- **Chấm theo đội hay theo cá nhân** tuỳ mục tiêu buổi học. Nếu chấm cá nhân, kết hợp với kết quả đánh giá đồng đẳng (CLO-E).

## 4.5 · Sổ điểm mẫu

In một bản cho mỗi đội. Cột «Dẫn chứng» là chỗ giảng viên ghi số liệu người học đã trích – **nếu ô này trống thì không cho quá mức 2**.

**Đội: ……………………………  ·  Lớp: …………  ·  Ngày: …………**

| Tiêu chí | 1 | 2 | 3 | 4 | Dẫn chứng người học trích |
|---|:-:|:-:|:-:|:-:|---|
| A · Phân tích giá – marketing – cầu | ☐ | ☐ | ☐ | ☐ | |
| B · Quản trị dòng tiền và thanh khoản | ☐ | ☐ | ☐ | ☐ | |
| C · Cân đối vận hành và ESG | ☐ | ☐ | ☐ | ☐ | |
| D · So sánh phương thức thâm nhập | ☐ | ☐ | ☐ | ☐ | |
| E · Hợp tác liên chức năng | ☐ | ☐ | ☐ | ☐ | |

**Điểm rubric = tổng ÷ 5 = ………  ·  Quy đổi thang 10 = ………**

Nhận xét cho đội:

……………………………………………………………………………………………

……………………………………………………………………………………………

### Chuẩn bị trước buổi chấm

1. Vào bảng điều khiển giảng viên, lọc theo mã lớp, **xuất tệp CSV** kết quả từng vòng của tất cả các đội
2. In hoặc mở sẵn tệp CSV khi chấm để đối chiếu ngay số liệu người học trích – phát hiện được đội nói số không khớp dữ liệu. Với `adEff`, `lostSales`, `roi` (không có trong tệp xuất) yêu cầu đội chụp màn hình báo cáo vòng kèm bài trình bày
3. Với tiêu chí E, thu **Nhật ký đội** do vai Thư ký ghi và phiếu đánh giá đồng đẳng trước khi vào buổi thảo luận

---

# 5 · Công cụ đo lường trước – sau

## 5.1 · Cấu trúc

Phiếu đang dùng (`khao-sat.html`, bản in và `khao-sat-online.html`) gồm **15 câu kiến thức (Phần A)** và **8 phát biểu tự tin thang 1–5 (Phần B)**, dùng cả trước và sau buổi học để đo mức chênh lệch kiến thức và tự tin. Bản 30 câu nêu ở các phiên bản trước của tài liệu này đã rút gọn (06/11/2026, khớp `bang-chung.html` và `thiet-ke-nghien-cuu.html`).

| Miền kiến thức | Nội dung kiểm tra | Liên hệ CLO |
|---|---|---|
| Kế toán quản trị | Điểm hòa vốn, phân biệt chi phí cố định và biến đổi | CLO-B |
| Kinh tế vi mô | Quan hệ giá – lượng cầu, độ co giãn | CLO-A |
| Quản trị tài chính | Chỉ số thanh khoản nhanh, đòn bẩy | CLO-B |
| Quản trị vận hành | Hệ quả của sản xuất vượt lượng bán, tồn kho | CLO-C |
| Marketing | Quan hệ giữa ngân sách marketing và lợi nhuận | CLO-A |
| Kinh doanh quốc tế | Phương thức thâm nhập và mức vốn đầu tư ban đầu | CLO-D, BP-2 |
| Ra quyết định cạnh tranh | Phản ứng trước cuộc chiến giá | CLO-A, BP-1 |

## 5.2 · Nguyên tắc thiết kế câu hỏi

- Câu hỏi đo **hiểu bản chất**, không đo thuộc lòng định nghĩa – ví dụ hỏi «phản ứng nào rủi ro nhất» thay vì «định nghĩa chiến tranh giá là gì»
- Có **câu nhận định sai cố ý** để phát hiện ngộ nhận phổ biến – ví dụ *«Tăng ngân sách marketing luôn làm tăng lợi nhuận»*
- **Ẩn danh hoàn toàn**, không dùng để chấm điểm, để người học trả lời trung thực

## 5.3 · Cách dùng để đo hiệu quả

1. Phát bài trước buổi học – ghi nhận điểm nền
2. Tổ chức buổi chơi và thảo luận
3. Phát lại **cùng bộ câu hỏi** sau buổi học
4. So sánh cặp trước – sau trên từng người học

> ⚠️ **Giới hạn:** bộ công cụ này đo được **mức chênh lệch trước – sau**, nhưng chưa đủ để kết luận nhân quả nếu không có nhóm đối chứng. Xem [Mục 7](#7--giả-định-và-giới-hạn-diễn-giải).

---

# 6 · Hướng dẫn vận dụng

## 6.1 · Bản đồ đối chiếu với chuẩn đầu ra học phần

Cách gắn tài liệu này vào đề cương học phần:

| Chuẩn đầu ra học phần điển hình | CLO của BizOn tương ứng | Minh chứng thu được |
|---|---|---|
| Phân tích môi trường kinh doanh và cạnh tranh | CLO-A, BP-1, BP-3 | Báo cáo phân tích thị trường + rubric tiêu chí 1, 2 |
| Vận dụng công cụ tài chính trong ra quyết định | CLO-B | Dữ liệu dòng tiền xuất từ bảng điều khiển giảng viên |
| Đánh giá phương án chiến lược đa tiêu chí | BP-6, CLO-D | Reflection memo + rubric tiêu chí 4 |
| Làm việc nhóm và giao tiếp chuyên môn | CLO-E | Nhật ký đội + đánh giá đồng đẳng |
| Nhận thức trách nhiệm xã hội của doanh nghiệp | CLO-C (phần ESG), BP-4 | Chỉ số năng lượng và hồ sơ bền vững trong ván |

## 6.2 · Ba kịch bản thời lượng

| Kịch bản | Thời lượng | Phạm vi | Công cụ đánh giá dùng được |
|---|---|---|---|
| **Ngắn** | 90 phút | 3 quý chơi + thảo luận nhanh | Rubric tiêu chí 1 và 4 |
| **Chuẩn** | 1 buổi 3–4 tiết | 6 quý chơi trọn ván + thảo luận đầy đủ | Toàn bộ rubric 4 tiêu chí |
| **Đầy đủ** | 2 buổi | Đo trước – chơi – thảo luận – đo sau | Rubric + phiếu trước–sau (15 câu kiến thức + 8 câu tự tin) + đánh giá đồng đẳng |

## 6.3 · Quy mô lớp

| Sĩ số | Số đội | Ghi chú |
|---|---|---|
| 45–50 sinh viên | 9–10 đội × 5 vai | Đủ 5 vai mỗi đội, cấu hình lý tưởng |
| 55–60 sinh viên | 11–12 đội × 5 vai | Cần thêm trợ giảng theo dõi |
| Dưới 25 sinh viên | 5 đội | Có thể ghép vai, giảm còn 3–4 vai mỗi đội |

---

# 7 · Giả định và giới hạn diễn giải

Nêu ra để người dạy biết trước khi đưa vào buổi học, và để người đọc hồ sơ kiểm định đánh giá đúng phạm vi.

1. **Các quốc gia và thị trường trong game là giả tưởng.** Mọi tham số là minh họa sư phạm, không phải dự báo hay số liệu thống kê thực.

2. **Đàm phán với nhân vật là kịch bản hóa có trọng số** – dựa trên uy tín, tri thức và lịch sử cam kết – không phải mô hình ngôn ngữ sinh lời thoại tự do.

3. **Kết quả game dùng cho thảo luận và đánh giá quá trình học.** Không dùng để tư vấn quyết định kinh doanh thực tế.

4. **Chưa có nghiên cứu hiệu quả được công bố.** Bộ công cụ này là thiết kế sư phạm có căn cứ lý thuyết, chưa phải bằng chứng đã kiểm định. Việc đo hiệu quả học tập cần thiết kế nghiên cứu riêng có nhóm đối chứng.

5. **Phiếu trước – sau (15 câu kiến thức + 8 câu tự tin) chưa qua kiểm định độ tin cậy.** Trước khi dùng cho công bố khoa học cần chạy thử trên mẫu đủ lớn, tính hệ số Cronbach's alpha và phân tích độ phân biệt của từng câu.

6. **Rubric chưa qua kiểm định độ tin cậy giữa các giám khảo.** Nếu nhiều giảng viên cùng chấm, nên chấm thử song song trên cùng một mẫu và tính hệ số đồng thuận trước khi áp dụng chính thức.

---

# 8 · Cơ sở khoa học tham khảo

Lamb, R. L., Annetta, L. A., Firestone, J. B., & Etopio, E. (2018). A meta-analysis with examination of moderators of student cognition, affect, and learning outcomes while using serious educational games, serious games, and simulations. *Computers in Human Behavior, 80*, 158–167.

Sailer, M., & Homner, L. (2020). The gamification of learning: A meta-analysis. *Educational Psychology Review, 32*, 77–112.

**Diễn giải:** bằng chứng tổng hợp từ hai nghiên cứu trên cho thấy gamification có tác động tích cực đến kết quả nhận thức, động lực và hành vi học tập. Riêng Sailer & Homner (2020) chỉ ra rằng sự kết hợp giữa yếu tố cạnh tranh và hợp tác cho kết quả tốt hơn so với chỉ dùng một trong hai – đây là căn cứ cho lựa chọn thiết kế nêu ở [Mục 1.3](#13--quan-hệ-giữa-cạnh-tranh-và-hợp-tác).

---

# 9 · Phần còn phát triển

Ghi rõ để tài liệu không bị hiểu là đã hoàn chỉnh.

| Hạng mục | Hiện trạng | Cần làm |
|---|---|---|
| **Rubric cho game mô phỏng chính** | **Đã có bản nháp v0.1** tại [Mục 4.1](#41--rubric-game-mô-phỏng-chính--clo-a-đến-clo-e), cơ cấu điểm học phần 50/30/20 chốt 07/11/2026 – dựng từ chỉ số engine ghi lại | Hai tác giả rà soát mức mô tả và ngưỡng phân biệt; chấm thử trên 2–3 đội trước khi dùng chính thức |
| **Kiểm định phiếu trước – sau (15 + 8 câu)** | Đã soạn, đã thu khoảng 130 phiếu đợt 10/2026, chưa phân tích | Chạy thử, tính Cronbach's alpha, phân tích độ phân biệt từng câu |
| **Chuẩn đầu ra Bến Phù Sa và Hộ Chiếu Sầu Riêng** | Đã có ma trận (Mục 3b, 3c, 06/11/2026) và tiêu chí đạt đếm được | Hai tác giả rà soát; chấm thử một lớp; bản EN đầy đủ |
| **Kiểm định độ tin cậy giữa giám khảo của rubric** | Chưa làm | Chấm song song trên cùng mẫu, tính hệ số đồng thuận |
| **Bộ câu hỏi riêng cho kinh doanh quốc tế** | Chưa có | Soạn bộ đo riêng cho BP-1 đến BP-6 |
| **Bản tiếng Anh của rubric** | §4.2 (Hộ Chiếu Thương Hiệu) đã có bản song ngữ, kèm cơ cấu điểm học phần 40/40/20 | §4.1 (game mô phỏng chính) vẫn chỉ có tiếng Việt – cần dịch có đối dịch ngược nếu dùng chính thức cho lớp quốc tế |
| **Cơ cấu điểm học phần Hộ Chiếu Thương Hiệu (song ngữ)** | Bản nháp đầu tiên tại [§4.2](#42--rubric-game-hộ-chiếu-thương-hiệu--bp-1-đến-bp-6) – chưa chấm thử thực tế | Chấm thử ở buổi thí điểm 01/10/2026 (lớp FDI, thầy Phan Anh Tú), điều chỉnh trọng số 40/40/20 nếu cần |

---

## Bản quyền

© 2026 Đỗ Thùy Hương và Phan Anh Tú. Bảo lưu mọi quyền.

Tài liệu phục vụ mục đích giáo dục và nghiên cứu. Giảng viên được phép sử dụng trong lớp học của mình; mọi hình thức xuất bản lại, chỉnh sửa hoặc khai thác thương mại cần có sự đồng ý bằng văn bản của nhóm tác giả.
