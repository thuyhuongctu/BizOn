# Bộ công cụ thiết kế và đánh giá học tập
## Hệ sinh thái mô phỏng kinh doanh BizOn Bật Nghiệp

**Tác giả:** Đỗ Thùy Hương · Phan Anh Tú
**Phiên bản:** 1.0 · **Ngày lập:** 31/07/2026
**Loại tài liệu:** Tác phẩm viết – công cụ thiết kế sư phạm và đánh giá kết quả học tập

> Tài liệu này tách ra từ trang `hoc-thuat.html` để dùng độc lập trong ba việc: (1) giảng viên thiết kế buổi học và chấm điểm, (2) hồ sơ kiểm định chương trình đào tạo, (3) hồ sơ đăng ký quyền tác giả loại hình tác phẩm viết.

---

## Mục lục

- [1 · Khung lý thuyết và nguyên tắc thiết kế](#1--khung-lý-thuyết-và-nguyên-tắc-thiết-kế)
- [2 · Ma trận chuẩn đầu ra – Game mô phỏng chính](#2--ma-trận-chuẩn-đầu-ra--game-mô-phỏng-chính)
- [3 · Ma trận chuẩn đầu ra – Hộ Chiếu Thương Hiệu](#3--ma-trận-chuẩn-đầu-ra--hộ-chiếu-thương-hiệu)
- [4 · Rubric chấm thảo luận sau ván chơi](#4--rubric-chấm-thảo-luận-sau-ván-chơi)
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
| **BP-1** | So sánh và lựa chọn thị trường quốc tế dựa trên đặc điểm cầu, thể chế và cạnh tranh | Phân tích | 6 thị trường giả tưởng với hồ sơ ẩn khác nhau |
| **BP-2** | Giải thích quan hệ giữa mức cam kết của phương thức thâm nhập với kiểm soát, lợi nhuận và rủi ro | Hiểu / Vận dụng | 3 phương thức: nền tảng số · xuất khẩu trực tiếp · đối tác địa phương |
| **BP-3** | Đánh giá độ tin cậy và độ thiên lệch của các nguồn thông tin thị trường trước khi ra quyết định | Đánh giá | Sương mù thị trường + 6 nguồn tin có chi phí, độ chính xác và thiên lệch riêng |
| **BP-4** | Phân tích đánh đổi chuẩn hóa – thích nghi và tuân thủ thể chế khi vào thị trường khó tính | Phân tích | Chứng nhận Bắc Phong · hồ sơ bền vững Lục Đảo · sự kiện thể chế |
| **BP-5** | Nhận diện hệ quả dài hạn của chuỗi quyết định quản trị (path dependence) | Phân tích / Đánh giá | Dấu chân quyết định · nhiệm vụ đàm phán «Cánh cửa Bắc Phong» |
| **BP-6** | Ra quyết định theo mục tiêu đa tiêu chí thay vì tối đa hóa một chỉ số duy nhất | Sáng tạo | Điểm 5 chiều công khai 30/20/20/15/15 + 4 danh hiệu |

## 3.1 · Vì sao đặt BP-3 vào bậc Đánh giá

BP-3 là chuẩn đầu ra **khó dạy nhất bằng phương pháp truyền thống**. Cơ chế game đặt người học vào tình huống phải trả tiền để mua thông tin, trong đó có nguồn cố ý thiên lệch – dữ liệu mạng xã hội thổi phồng mức quan tâm, tin từ đối tác địa phương thiên vị kênh phân phối của chính họ. Người học chỉ phát hiện ra sự thiên lệch sau khi đã ra quyết định và nhận hậu quả. Đây là trải nghiệm mà một bài giảng về «đánh giá nguồn thông tin» khó tạo ra được.

---

# 4 · Rubric chấm thảo luận sau ván chơi

**Thang 4 mức** · Áp dụng cho buổi thảo luận sau khi hoàn thành ván chơi Hộ Chiếu Thương Hiệu

| Tiêu chí | 1 · Chưa đạt | 2 · Đạt | 3 · Khá | 4 · Xuất sắc |
|---|---|---|---|---|
| **Lập luận chọn thị trường và phương thức**<br>*(BP-1, BP-2)* | Kể lại lựa chọn, không nêu lý do | Nêu được 1 lý do phù hợp | So sánh ít nhất 2 phương án bằng dữ liệu trong ván | Gắn lựa chọn với khung lý thuyết – mức cam kết, khoảng cách thể chế |
| **Đánh giá nguồn thông tin**<br>*(BP-3)* | Tin mọi nguồn như nhau | Nhận ra có nguồn không đáng tin | Chỉ ra đúng nguồn thiên lệch và giải thích vì sao | Đề xuất chiến lược kết hợp nguồn theo cân đối chi phí – độ tin cậy |
| **Phân tích dấu chân quyết định**<br>*(BP-5)* | Chỉ nhìn kết quả cuối ván | Nêu được 1 hệ quả dài hạn | Truy vết được chuỗi quyết định dẫn tới hệ quả | Đề xuất điểm can thiệp sớm nhất có thể đổi kết cục |
| **Bài học chuyển giao**<br>*(BP-6)* | Không rút ra bài học | Bài học chung chung | Bài học gắn với tình huống cụ thể trong ván | Liên hệ được với doanh nghiệp Việt Nam thực tế, có ví dụ |

## 4.1 · Cách quy đổi điểm

Bốn tiêu chí có trọng số bằng nhau. Điểm rubric = trung bình cộng 4 tiêu chí, thang 1–4.

| Điểm rubric | Xếp loại | Quy đổi thang 10 |
|---|---|---|
| 3,5 – 4,0 | Xuất sắc | 9,0 – 10 |
| 2,5 – 3,4 | Khá | 7,0 – 8,9 |
| 1,5 – 2,4 | Đạt | 5,0 – 6,9 |
| 1,0 – 1,4 | Chưa đạt | dưới 5,0 |

## 4.2 · Lưu ý khi chấm

- **Chấm phần lập luận, không chấm kết quả ván chơi.** Một đội thua nhưng phân tích được vì sao mình thua có thể đạt mức 4; một đội thắng nhờ may mắn mà không giải thích được có thể chỉ ở mức 2.
- **Yêu cầu dẫn chứng bằng số liệu trong ván.** Từ mức 3 trở lên bắt buộc phải trích được con số cụ thể từ báo cáo hoặc dấu chân quyết định.
- **Chấm theo đội hay theo cá nhân** tuỳ mục tiêu buổi học. Nếu chấm cá nhân, kết hợp với kết quả đánh giá đồng đẳng (CLO-E).

---

# 5 · Công cụ đo lường trước – sau

## 5.1 · Cấu trúc

Bộ trắc nghiệm gồm **30 câu hỏi**, dùng cả trước và sau buổi học để đo mức chênh lệch kiến thức.

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
| **Đầy đủ** | 2 buổi | Đo trước – chơi – thảo luận – đo sau | Rubric + bộ 30 câu trước–sau + đánh giá đồng đẳng |

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

5. **Bộ 30 câu trước – sau chưa qua kiểm định độ tin cậy.** Trước khi dùng cho công bố khoa học cần chạy thử trên mẫu đủ lớn, tính hệ số Cronbach's alpha và phân tích độ phân biệt của từng câu.

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
| **Rubric cho game mô phỏng chính** | Chưa có – mới có ma trận chuẩn đầu ra và bộ chỉ số quan sát | Soạn rubric 4 mức cho CLO-A đến CLO-E, theo cấu trúc của [Mục 4](#4--rubric-chấm-thảo-luận-sau-ván-chơi) |
| **Kiểm định bộ 30 câu trước – sau** | Đã soạn, chưa kiểm định | Chạy thử, tính Cronbach's alpha, phân tích độ phân biệt từng câu |
| **Kiểm định độ tin cậy giữa giám khảo của rubric** | Chưa làm | Chấm song song trên cùng mẫu, tính hệ số đồng thuận |
| **Bộ câu hỏi riêng cho kinh doanh quốc tế** | Chưa có | Soạn bộ đo riêng cho BP-1 đến BP-6 |
| **Bản tiếng Anh của rubric** | Chưa có | Cần dịch có đối dịch ngược nếu dùng cho lớp quốc tế |

---

## Bản quyền

© 2026 Đỗ Thùy Hương và Phan Anh Tú. Bảo lưu mọi quyền.

Tài liệu phục vụ mục đích giáo dục và nghiên cứu. Giảng viên được phép sử dụng trong lớp học của mình; mọi hình thức xuất bản lại, chỉnh sửa hoặc khai thác thương mại cần có sự đồng ý bằng văn bản của nhóm tác giả.
