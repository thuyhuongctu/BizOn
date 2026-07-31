# Hồ sơ đăng ký quyền sở hữu trí tuệ tại Việt Nam
## Hệ sinh thái BizOn Bật Nghiệp

**Chủ thể:** Đỗ Thùy Hương · Phan Anh Tú
**Ngày lập:** 31/07/2026 · **Bản kiểm kê tính đến commit:** `5a52038`
**Kho mã:** github.com/thuyhuongctu/BizOn · **Trang công bố:** thuyhuongctu.github.io/BizOn/

> ⚠️ Tài liệu này do nhóm phát triển lập để chuẩn bị hồ sơ, **không phải ý kiến pháp lý**. Mức phí và biểu mẫu thay đổi theo thông tư hiện hành – phải đối chiếu lại với Cục Bản quyền tác giả và Cục Sở hữu trí tuệ trước khi nộp. Với phần rủi ro ở **Mục F**, nên hỏi ý kiến luật sư sở hữu trí tuệ.

---

# PHẦN A · KIỂM KÊ TÀI SẢN

Số liệu đếm trực tiếp từ kho mã, không ước lượng.

| Nhóm tài sản | Số lượng | Ghi chú |
|---|---|---|
| Trang giao diện HTML | 24 trang | 9.503 dòng |
| Mã nguồn JavaScript | 10 tệp · 8.469 dòng | Engine mô phỏng, cố vấn, dữ liệu lớp học |
| Tệp ảnh nhân vật | 93 tệp | 6 thư mục phân nhóm |
| Tranh minh họa & bối cảnh | 21 tệp | |
| Biểu tượng thương hiệu | 3 tệp | |
| Ảnh sản phẩm quà tặng | 2 tệp | Cài áo lapel pin |
| Bản thu âm nhạc | 34 bản | Thuộc 14 tác phẩm âm nhạc |
| Tệp giọng nói nhân vật | 4 tệp | Giọng cố vấn Lumina |
| Tài liệu kỹ thuật & giảng dạy | 9 tài liệu | Định dạng Markdown |
| Lịch sử phát triển | 271 commit | 26/07/2026 → 31/07/2026 |

**Ý nghĩa của 271 commit:** đây là chứng cứ mạnh về quá trình sáng tạo và mốc thời gian. Mỗi commit có dấu thời gian, tên tác giả và nội dung thay đổi cụ thể. Nên **xuất toàn bộ nhật ký này ra PDF** làm phụ lục chứng minh (xem Mục E).

---

# PHẦN B · ĐĂNG KÝ QUYỀN TÁC GIẢ

**Cơ quan:** Cục Bản quyền tác giả – Bộ Văn hóa, Thể thao và Du lịch
**Căn cứ:** Luật Sở hữu trí tuệ số 50/2005/QH11 (sửa đổi 2009, 2019, 2022) · Nghị định 17/2023/NĐ-CP
**Bản chất:** Quyền tác giả **phát sinh tự động** từ khi tác phẩm được định hình, không phụ thuộc đăng ký (Điều 6). Giấy chứng nhận có giá trị là **bằng chứng khi tranh chấp** – bên có giấy chứng nhận không phải chứng minh quyền của mình (Điều 49).

Nhóm nên nộp **4 đơn riêng biệt** theo 4 loại hình. Không gộp chung được vì mỗi loại hình có tờ khai, mẫu bản sao và mức phí khác nhau.

---

## B1 · Chương trình máy tính

**Loại hình:** Chương trình máy tính – điểm m khoản 1 Điều 14 Luật SHTT

### Tên tác phẩm đề nghị ghi trên giấy chứng nhận

> **«BizOn Bật Nghiệp – Hệ thống phần mềm mô phỏng kinh doanh phục vụ đào tạo khởi nghiệp»**

Tên tiếng Anh kèm theo: *BizOn – Business Simulation Software for Entrepreneurship Education*

### Mô tả tác phẩm (dùng cho mục «Tóm tắt nội dung» trong tờ khai)

Phần mềm chạy trên trình duyệt, kiến trúc ứng dụng web tiến bộ (PWA), gồm các thành phần do nhóm tác giả tự thiết kế và viết mã:

1. **Engine mô phỏng kinh doanh xác định** – tính doanh thu, thị phần, dòng tiền, khấu hao và điểm hòa vốn qua 6 vòng chơi từ các quyết định giá bán, sản lượng, marketing và đầu tư của người học. Cùng một trạng thái đầu vào luôn cho ra cùng một kết quả, phục vụ chấm điểm công bằng.
2. **Hệ thống biến cố thị trường** – thư viện tình huống kinh doanh có trọng số và sắc thái, tác động lên hệ số co giãn cầu và hiệu quả marketing.
3. **Mô-đun cố vấn Lumina** – bộ luật «nếu – thì» đọc trạng thái ván chơi để chọn kịch bản tư vấn kèm mức rủi ro, có giới hạn lượt hỏi mang dụng ý sư phạm.
4. **Mô-đun mô phỏng «Nếu – Thì»** – dự báo thị phần và điểm hòa vốn theo thông số giả định trước khi người học chốt quyết định.
5. **Hạ tầng dữ liệu lớp học** – ghi nhận kết quả từng vòng theo mã lớp, bảng điều khiển giảng viên, xuất dữ liệu chấm điểm.
6. **Hệ thống giao diện đất nặn 3D (claymorphism)** – bộ thành phần giao diện, hoạt ảnh và quy tắc thiết kế riêng.
7. **Cơ chế song ngữ Việt – Anh** – từ điển đối chiếu và cơ chế chuyển ngữ tại chỗ.
8. **Các game chiến lược phái sinh** – Hộ Chiếu Thương Hiệu, BizOn Go Global, BizOn Arcade.

**Ngôn ngữ lập trình:** JavaScript · HTML · CSS · SQL
**Quy mô:** 8.469 dòng JavaScript và 9.503 dòng HTML do nhóm tác giả viết

### Hồ sơ nộp

| Tài liệu | Số bản | Lưu ý |
|---|---|---|
| Tờ khai đăng ký quyền tác giả (mẫu theo Nghị định 17/2023/NĐ-CP) | 01 | Ghi rõ đồng tác giả và tỷ lệ đồng sở hữu |
| Bản in mã nguồn | 02 | In hai mặt, đánh số trang liên tục, ký nháy từng trang hoặc ký giáp lai |
| Đĩa CD/DVD chứa mã nguồn và ảnh chụp giao diện | 02 | Ghi nhãn đĩa: tên tác phẩm, tác giả, ngày |
| Giấy cam đoan của tác giả về việc tự sáng tạo | 01 | Có chữ ký của cả hai tác giả |
| Văn bản thỏa thuận giữa các đồng tác giả về tỷ lệ quyền | 01 | **Xem Mục F2 – phải làm trước** |
| Bản sao chứng thực CCCD của từng tác giả | mỗi người 01 | |
| Giấy ủy quyền | 01 | Chỉ khi nộp qua tổ chức đại diện |

**Về bản in mã nguồn:** thực tế Cục thường chấp nhận in **trang đầu và trang cuối của mỗi tệp** kèm bản đầy đủ trên đĩa, thay vì in trọn 18.000 dòng. Nên gọi hỏi trước để tránh in thừa.

**Phí đăng ký:** 600.000 đồng (Thông tư 211/2016/TT-BTC – cần đối chiếu mức hiện hành)

### ⚠️ Phải loại trừ khỏi phần khai

Kho mã có chứa thành phần của bên thứ ba. **Không được kê khai những phần này là do nhóm sáng tạo:**

| Thành phần | Nguồn | Cách xử lý |
|---|---|---|
| `css/tw.css` (44 KB) | Bản dựng rút gọn từ Tailwind CSS – giấy phép MIT | Ghi chú trong tờ khai là thư viện bên thứ ba theo giấy phép MIT; **không tính vào phần mã do nhóm viết** |
| Phông chữ Manrope, Plus Jakarta Sans | Google Fonts – giấy phép SIL Open Font | Nạp từ máy chủ ngoài, không nằm trong tác phẩm |
| Giao thức truy vấn cơ sở dữ liệu | Dịch vụ Supabase | Nhóm chỉ viết phần gọi dữ liệu, không sở hữu dịch vụ |

Khai đúng phần của mình **làm hồ sơ mạnh hơn**, không yếu đi – vì tránh được nguy cơ bị phản đối sau này.

---

## B2 · Tác phẩm mỹ thuật ứng dụng

**Loại hình:** Tác phẩm mỹ thuật ứng dụng – điểm g khoản 1 Điều 14 Luật SHTT

### Tên tác phẩm đề nghị

> **«Bộ tạo hình nhân vật và hệ thống nhận diện đất nặn 3D BizOn Bật Nghiệp»**

### Phạm vi (119 tệp)

| Nhóm | Số lượng | Nội dung |
|---|---|---|
| Nhân vật cố vấn | 21 tệp | Lumina AI (nhiều tạo hình, trang phục và tư thế) |
| Nhân vật chính | 33 tệp | Người dẫn chuyện, cố vấn học thuật |
| Đội chơi mẫu | 14 tệp | 5 vai trò C-Suite |
| Doanh nghiệp trong game | 8 tệp | 4 thương hiệu giả tưởng |
| Đối thủ AI | 17 tệp | Trong nước và quốc tế |
| Tranh minh họa & bối cảnh | 21 tệp | Bản đồ, sự kiện, bối cảnh |
| Biểu tượng thương hiệu | 3 tệp | Logo, splash |
| Sản phẩm quà tặng | 2 tệp | Cài áo lapel pin |

### Đặc điểm cần nêu trong tờ khai (điểm mạnh của hồ sơ)

- **Chuẩn kỹ thuật thống nhất:** toàn bộ 21 tạo hình dàn nhân vật game Hộ Chiếu Thương Hiệu dựng trên khung chuẩn **760 × 1100 px**, chiều cao nhân vật thống nhất, cùng một đường chân, nền trong suốt. Đây là bằng chứng của một **hệ thống thiết kế có chủ đích**, không phải tập hợp ảnh rời.
- **Bảng tạo hình (character sheet):** đã có sẵn hai bảng tổng hợp – mã nội bộ `VN-BIZON-BP-CAST-001` (21 nhân vật) và `VN-HƯƠNG-CLAY-001` (bảng turnaround 3 góc nhìn). **Nộp hai bảng này làm bản sao tác phẩm chính**, kèm đĩa chứa 119 tệp gốc.
- **Ngôn ngữ tạo hình riêng:** phong cách đất nặn 3D (claymorphism) với bảng màu, kết cấu bề mặt và tỷ lệ nhân vật nhất quán.

### Hồ sơ nộp

| Tài liệu | Số bản |
|---|---|
| Tờ khai đăng ký | 01 |
| Bản in màu bảng tạo hình (khổ A3 hoặc A4) | 02 |
| Đĩa CD chứa 119 tệp gốc, phân theo thư mục | 02 |
| Giấy cam đoan tự sáng tạo | 01 |
| Văn bản thỏa thuận đồng tác giả | 01 |
| Bản sao chứng thực CCCD | mỗi người 01 |

**Phí đăng ký:** 400.000 đồng

---

## B3 · Tác phẩm âm nhạc

**Loại hình:** Tác phẩm âm nhạc – điểm d khoản 1 Điều 14 Luật SHTT

### Cách nộp: 14 tác phẩm, có thể gộp thành một đơn tuyển tập

Kho nhạc gồm **14 tác phẩm âm nhạc riêng biệt** với **34 bản thu**. Có hai cách:

- **Cách 1 – Một đơn tuyển tập:** tên tác phẩm «Tuyển tập ca khúc BizOn Bật Nghiệp» gồm 14 ca khúc. Rẻ hơn, nhanh hơn, nhưng giấy chứng nhận chỉ ghi tên tuyển tập.
- **Cách 2 – 14 đơn riêng:** mỗi ca khúc một giấy chứng nhận. Tốn phí gấp 14 lần nhưng bảo vệ từng bài mạnh hơn khi có tranh chấp riêng lẻ.

**Khuyến nghị:** nộp **Cách 1** trước để có mốc thời gian sớm, sau đó tách riêng những bài có giá trị khai thác cao – «Bật Nghiệp», «Hương on Return», «Brand Passport».

### Danh mục 14 tác phẩm

| # | Tên tác phẩm | Số bản thu | Ngôn ngữ lời |
|---|---|---|---|
| 1 | «Hương on Return» | 2 | Việt |
| 2 | «Journey on the Golden Silt» | 4 | Anh – Pháp – Việt |
| 3 | «Je m'appelle Hương sans frontières» | 4 | Việt · Anh · Pháp · giọng nam |
| 4 | «Đội Phù Sa» | 3 | Việt |
| 5 | «Brand Passport» | 4 | Anh |
| 6 | «Stamps Beyond Borders» | 4 | Anh |
| 7 | «Golden Silt Route» | 1 | Anh |
| 8 | Tổ khúc «Hộ Chiếu Thương Hiệu» – Phần I «Từ dòng Mekong» | 1 | Việt |
| 9 | Tổ khúc – Phần II «Qua Những Thị Trường» | 1 | Việt |
| 10 | Tổ khúc – Phần III «Việt Nam ra thế giới» | 4 | Việt · Anh |
| 11 | «Bật Nghiệp» | 1 | Instrumental |
| 12 | «Vừa Đủ Để Bay Cao» | 1 | Việt |
| 13 | «And The World Say Hello!» | 1 | Anh |
| 14 | «Mekong Compass» · «Mon histoire» · «BizOn Theme» | 3 | Anh · Pháp · Instrumental |

*(Ba bài ở dòng 14 nên tách thành ba tác phẩm riêng khi khai chi tiết – gộp ở đây chỉ để bảng gọn.)*

### Hồ sơ nộp

| Tài liệu | Số bản | Lưu ý |
|---|---|---|
| Tờ khai đăng ký | 01 | |
| **Bản nhạc hoặc lời bài hát in giấy** | 02 | Bắt buộc. Xem cảnh báo dưới |
| Đĩa CD chứa các bản thu | 02 | |
| Giấy cam đoan tự sáng tạo | 01 | |
| Văn bản thỏa thuận đồng tác giả | 01 | |

> ⚠️ **Việc cần làm ngay:** Cục yêu cầu **bản nhạc hoặc lời bài hát trên giấy**, không nhận riêng tệp âm thanh. Kho hiện có tài liệu `docs/loi-bai-hat.md` nhưng **chỉ chép lời đầy đủ của hai ca khúc**. Phải chép đủ lời **cả 14 bài** trước khi nộp. Nếu có bản ký âm (sheet music) thì càng tốt – không bắt buộc nhưng làm hồ sơ mạnh hơn nhiều.

**Phí đăng ký:** 100.000 đồng/tác phẩm

---

## B4 · Tác phẩm viết

**Loại hình:** Tác phẩm văn học, khoa học, sách giáo khoa, giáo trình – điểm a khoản 1 Điều 14

### Tên tác phẩm đề nghị

> **«Bộ tài liệu thiết kế sư phạm và kịch bản trò chơi BizOn Bật Nghiệp»**

### Phạm vi

| Tài liệu | Nội dung |
|---|---|
| `docs/lumina-ai-mentor.md` | Thiết kế mô-đun cố vấn: API, cấu trúc dữ liệu, logic «nếu – thì» |
| `docs/loi-thoai-lumina.md` | 49 câu thoại tiếng Việt của nhân vật cố vấn |
| `docs/loi-bai-hat.md` | Lời ca khúc |
| `docs/huong-dan-giang-vien.md` | Hướng dẫn tổ chức buổi học |
| `docs/design-system.md` | Quy tắc hệ thống thiết kế |
| `docs/database-schema.md` · `docs/api-structure.md` | Kiến trúc dữ liệu |
| `docs/chuan-dau-ra-va-rubric.md` | **Bộ công cụ thiết kế và đánh giá học tập** – ma trận chuẩn đầu ra 2 game, rubric 4 mức, hướng dẫn vận dụng, bản đồ đối chiếu chuẩn đầu ra học phần, giới hạn diễn giải, tài liệu tham khảo |
| Bộ 30 câu khảo sát trước – sau | Trong `khao-sat-online.html` – nội dung đã mô tả trong tài liệu trên |

**Đây là phần có giá trị học thuật cao nhất** – ma trận chuẩn đầu ra, rubric và bộ công cụ đo lường là sản phẩm nghiên cứu sư phạm, không phải phần mềm.

**Phí đăng ký:** 100.000 đồng

---

# PHẦN C · ĐĂNG KÝ NHÃN HIỆU

**Cơ quan:** Cục Sở hữu trí tuệ – Bộ Khoa học và Công nghệ
**Căn cứ:** Luật SHTT, phần thứ ba · Thông tư 263/2016/TT-BTC về phí, lệ phí

## C1 · Các dấu hiệu nên đăng ký

| Ưu tiên | Nhãn hiệu | Dạng | Lý do |
|---|---|---|---|
| **1** | **BizOn** | Chữ | Tên thương hiệu chính, dùng trong mọi sản phẩm |
| **2** | **BizOn Bật Nghiệp** | Chữ | Tên đầy đủ tiếng Việt |
| **3** | Logo «Bo» đất nặn | Hình + chữ | Nhận diện thị giác |
| 4 | **Hộ Chiếu Thương Hiệu** / Brand Passport | Chữ | Tên game phái sinh |
| 5 | **Lumina AI** | Chữ | Tên nhân vật cố vấn |

## C2 · Nhóm sản phẩm/dịch vụ theo Bảng phân loại Nice

| Nhóm | Nội dung đăng ký |
|---|---|
| **Nhóm 9** | Phần mềm máy tính; phần mềm trò chơi điện tử tải xuống được; ứng dụng di động; phần mềm mô phỏng phục vụ giáo dục; xuất bản phẩm điện tử tải xuống được |
| **Nhóm 41** | Dịch vụ giáo dục; đào tạo; tổ chức hội thảo và tập huấn; cung cấp trò chơi điện tử trực tuyến không tải xuống; xuất bản tài liệu giảng dạy; dịch vụ giải trí |
| **Nhóm 42** | Thiết kế và phát triển phần mềm máy tính; cung cấp phần mềm như một dịch vụ (SaaS); nghiên cứu và phát triển công nghệ giáo dục |

**Khuyến nghị:** đăng ký **Nhóm 9 và Nhóm 41 trước** – đây là hai nhóm cốt lõi. Nhóm 42 bổ sung sau khi có nguồn lực.

## C3 · Chi phí ước tính (nhãn hiệu «BizOn», 2 nhóm, mỗi nhóm 6 sản phẩm)

| Khoản | Mức |
|---|---|
| Lệ phí nộp đơn | 150.000 đ |
| Phí phân loại quốc tế | 100.000 đ × 2 nhóm |
| Phí công bố đơn | 120.000 đ |
| Phí tra cứu phục vụ thẩm định nội dung | 180.000 đ × 2 nhóm |
| Phí thẩm định nội dung | 550.000 đ × 2 nhóm |
| Phí đăng bạ + cấp giấy chứng nhận | 240.000 đ |
| **Tổng ước tính** | **≈ 2.170.000 đ** |

*Chưa gồm phí dịch vụ nếu thuê tổ chức đại diện (thường 3–6 triệu đồng/đơn). Mức phí theo Thông tư 263/2016/TT-BTC – phải đối chiếu mức hiện hành.*

## C4 · Thời gian xử lý

| Giai đoạn | Theo luật | Thực tế |
|---|---|---|
| Thẩm định hình thức | 1 tháng | 1–2 tháng |
| Công bố đơn | 2 tháng | 2–3 tháng |
| Thẩm định nội dung | 9 tháng | 18–30 tháng |

**Ngày nộp đơn là ngày ưu tiên** – nộp sớm quan trọng hơn nộp hoàn hảo.

## C5 · ⚠️ Phải tra cứu trước khi nộp

**«BizOn» là từ ghép từ «Business» và «On» – khả năng trùng hoặc tương tự với nhãn hiệu đã có là có thật.** Trước khi nộp phải:

1. Tra cứu miễn phí tại **wipopublish.ipvietnam.gov.vn** – cơ sở dữ liệu nhãn hiệu Việt Nam
2. Tra cứu thêm tại **Madrid Monitor** cho nhãn hiệu quốc tế chỉ định Việt Nam
3. Cân nhắc trả phí tra cứu chuyên sâu qua tổ chức đại diện (~500.000 đ) – rẻ hơn nhiều so với mất 2 năm rồi bị từ chối

Nếu «BizOn» đơn thuần bị vướng, **«BizOn Bật Nghiệp»** dạng kết hợp chữ + hình có khả năng được chấp nhận cao hơn vì tính phân biệt mạnh hơn.

---

# PHẦN D · KHÔNG ĐĂNG KÝ / PHẢI LOẠI TRỪ

## D1 · «Gánh Hàng Khởi Nghiệp: Bến Phù Sa» – TUYỆT ĐỐI KHÔNG ĐƯA VÀO HỒ SƠ

Trang `food-truck.html` là **phương án bản địa hóa phục vụ giảng dạy, xây dựng dựa trên cấu trúc mô phỏng «The Food Truck Challenge»** của Michael A. Roberto – Harvard Business Publishing · Forio.

- Đây là **tác phẩm phái sinh** từ tác phẩm của bên thứ ba
- Đăng ký quyền tác giả cho nó sẽ là **khai báo sai sự thật**, có thể dẫn tới hủy giấy chứng nhận và trách nhiệm pháp lý
- Trang này đã được ghi rõ «Nguyên mẫu nghiên cứu – không phát hành, đã rút khỏi danh mục game của BizOn»

**Khi in mã nguồn nộp Cục, phải loại bỏ tệp `food-truck.html` khỏi bản in và khỏi đĩa.**

## D2 · Không đăng ký sáng chế cho phần mềm

Theo khoản 2 Điều 59 Luật SHTT, **chương trình máy tính không được bảo hộ dưới danh nghĩa sáng chế**. Đừng tốn thời gian và chi phí cho hướng này. Phần mềm được bảo hộ bằng **quyền tác giả** (Mục B1).

## D3 · Không tuyên bố quá phạm vi

Hai điều **không được ghi** trong hồ sơ vì chưa có căn cứ:

- ❌ «Toàn bộ mã nguồn được công bố công khai» – nhóm giữ riêng một số tài liệu nội bộ
- ❌ «Kết quả nghiên cứu đã được kiểm chứng và tái lập» – chưa có nghiên cứu hiệu quả học tập nào được công bố

---

# PHẦN E · CHỨNG CỨ CẦN CHUẨN BỊ

Ngoài hồ sơ chính thức, nên chuẩn bị bộ chứng cứ sau. Khi có tranh chấp, đây mới là thứ quyết định.

| Chứng cứ | Cách lấy | Giá trị |
|---|---|---|
| **Nhật ký phát triển 271 commit** | `git log --format="%H %ad %an %s" --date=iso > nhat-ky.txt` rồi in ra PDF | Chứng minh mốc thời gian và quá trình sáng tạo từng bước |
| **Bản lưu trang web theo thời gian** | Lưu URL trên web.archive.org | Bên thứ ba độc lập xác nhận nội dung tồn tại vào ngày nào |
| **DOI trên Zenodo** | Đã có hồ sơ Zenodo – tạo bản phát hành gắn DOI | Mốc thời gian có tổ chức quốc tế xác nhận, miễn phí |
| **Bản ghi màn hình quá trình dựng nhạc** | Ghi lại một phiên làm việc | Chứng minh đóng góp sáng tạo của con người – xem Mục F1 |
| **Bản thảo viết tay lời bài hát** | Chụp ảnh bản nháp nếu còn | Chứng cứ mạnh về tác quyền phần lời |
| **Email/tin nhắn trao đổi giữa hai tác giả** | Kết xuất theo thời gian | Chứng minh quá trình đồng sáng tạo |

**Zenodo DOI nên làm ngay** – miễn phí, mất 15 phút, và cho mốc thời gian được một tổ chức quốc tế xác nhận. Hồ sơ ORCID và Zenodo đã có sẵn trên trang Đội ngũ.

---

# PHẦN E-bis · CÔNG BỐ CÔNG KHAI TRƯỚC KHI ĐĂNG KÝ

Ở Việt Nam ít nhóm tác giả công bố sản phẩm trước khi nộp hồ sơ. Thói quen đó bắt nguồn từ **tư duy sáng chế** và bị áp dụng nhầm sang quyền tác giả. Bảng dưới phân định rõ.

| Loại quyền | Công bố trước có hại không? | Áp dụng cho BizOn |
|---|---|---|
| **Sáng chế** | **Có** – công bố làm mất tính mới, không còn được cấp bằng | **Không liên quan** – phần mềm không được bảo hộ dưới danh nghĩa sáng chế (khoản 2 Điều 59) |
| **Quyền tác giả** | **Không.** Quyền phát sinh tự động từ khi tác phẩm được định hình (Điều 6), không phụ thuộc công bố hay đăng ký | **Có lợi** – xem dưới |
| **Nhãn hiệu** | **Có rủi ro thật** – Việt Nam theo nguyên tắc nộp đơn trước được quyền trước | **Đây là rủi ro duy nhất cần xử lý gấp** |

## E-bis.1 · Vì sao kho GitHub công khai là tài sản, không phải rủi ro

Kho `github.com/thuyhuongctu/BizOn` ở chế độ công khai từ **26/07/2026**, tới nay có **271 commit** đều mang dấu thời gian và tên người thực hiện.

Nhóm tác giả giữ kín sản phẩm tới lúc nộp hồ sơ chỉ có **lời khai của chính mình** về thời điểm sáng tạo. Nhóm công bố sớm có thêm:

- **Nhật ký có dấu thời gian do bên thứ ba lưu giữ** – GitHub, không phải nhóm tác giả, giữ bản ghi này
- **Bản lưu độc lập** – web.archive.org lưu được nội dung trang theo từng mốc
- **Truy vết từng bước sáng tạo** – không chỉ chứng minh «có tác phẩm vào ngày X» mà còn chứng minh **quá trình hình thành**, thứ rất khó ngụy tạo

Khi tranh chấp, bên nào chứng minh được mốc thời gian sớm hơn bằng chứng cứ khách quan sẽ có lợi thế. **Công bố sớm làm hồ sơ mạnh lên.**

## E-bis.2 · Công khai không có nghĩa là cho dùng miễn phí

Kho mã đã có tệp `LICENSE` ghi rõ **«GIẤY PHÉP ĐỘC QUYỀN – PROPRIETARY LICENSE · Bảo lưu mọi quyền»**. Đây là điểm phải giữ: mã nguồn để công khai cho người đọc kiểm chứng, **không phải mã nguồn mở**. Hai khái niệm này khác nhau hoàn toàn và tệp `LICENSE` là thứ phân định.

## E-bis.3 · ⚠️ Rủi ro thật: nhãn hiệu bị người khác nộp đơn trước

**Việt Nam theo nguyên tắc «nộp đơn trước được quyền trước» (first-to-file), không phải «dùng trước được quyền trước».**

Hệ quả cụ thể:

- Tên **«BizOn»** đang hiển thị công khai trên GitHub và trên trang web chạy thật từ 26/07/2026
- Bất kỳ ai nhìn thấy đều có thể nộp đơn đăng ký nhãn hiệu trước nhóm tác giả
- Nếu điều đó xảy ra, **nhóm mất quyền dùng chính tên mình đặt ra**, dù đã dùng trước và có bằng chứng dùng trước

Việc đã dùng trước chỉ giúp phản đối đơn của người khác trong một số trường hợp hẹp, thủ tục dài và tốn kém hơn nhiều so với nộp đơn sớm.

**Đây chính là lý do trong [Phần G](#phần-g--trình-tự-thực-hiện-đề-xuất) nhãn hiệu xếp thứ tự 1, trước cả phần mềm** – không phải vì quan trọng hơn, mà vì đó là thứ duy nhất có thể **mất hẳn** do chậm trễ. Quyền tác giả thì không mất đi đâu cả, vì nó đã phát sinh tự động rồi.

## E-bis.4 · Có nên chuyển kho sang riêng tư không?

**Không.** Ba lý do:

1. Kho đã công khai từ 26/07 – chuyển sang riêng tư bây giờ không xóa được việc đã công bố
2. Chuyển sang riêng tư **làm mất bằng chứng công khai có ngày tháng**, thứ đang là điểm mạnh nhất của hồ sơ
3. Không giải quyết được rủi ro nhãn hiệu – rủi ro đó chỉ giải quyết bằng cách **nộp đơn sớm**

Việc nên làm là ngược lại: **giữ kho công khai và nộp đơn nhãn hiệu ngay**.

---

# PHẦN F · BA RỦI RO PHẢI XỬ LÝ TRƯỚC KHI NỘP

## F1 · ⚠️ Vấn đề tác giả là con người đối với phần có công cụ AI tham gia

**Đây là rủi ro lớn nhất của hồ sơ này.**

Điều 12a Luật SHTT (bổ sung năm 2022) định nghĩa **tác giả là người trực tiếp sáng tạo tác phẩm**. Luật Việt Nam hiện chưa có quy định riêng về tác phẩm do AI tạo ra, nhưng nguyên tắc chung là **quyền tác giả chỉ phát sinh cho cá nhân con người**.

Thực tế của dự án:
- Phần **hòa âm và giọng hát** của kho nhạc được dựng bằng công cụ sản xuất nhạc có hỗ trợ AI
- Phần **hình ảnh nhân vật** được tạo bằng công cụ tạo ảnh AI, sau đó nhóm biên tập và tách nền

**Rủi ro cụ thể:**
1. Nếu bên thứ ba chứng minh được tác phẩm chủ yếu do AI tạo, giấy chứng nhận có thể bị **yêu cầu hủy bỏ** theo Điều 55
2. Trong tờ khai có mục cam đoan tự sáng tạo – khai không đúng có thể bị coi là **cung cấp thông tin sai lệch**

**Cách xử lý – ba lựa chọn:**

| Phương án | Ưu | Nhược |
|---|---|---|
| **A. Khai rõ mức độ tham gia của công cụ** và nhấn mạnh đóng góp sáng tạo của con người (ý tưởng, lời, thể loại, nhịp độ, chọn bản, biên tập, sàng lọc) | Trung thực, an toàn về pháp lý, vẫn được bảo hộ phần con người sáng tạo | Có thể bị hỏi thêm, xử lý chậm hơn |
| **B. Không nhắc tới công cụ** | Nộp nhanh | **Rủi ro pháp lý thật** nếu sau này bị phát hiện |
| **C. Chỉ đăng ký phần thuần con người** – lời bài hát (tác phẩm viết), mã nguồn, ma trận sư phạm; tạm gác phần bản thu và hình ảnh | An toàn tuyệt đối | Bỏ trống mảng nhạc và mỹ thuật |

**Khuyến nghị của tôi: phương án A.** Đóng góp của nhóm là thật và đủ lớn để được bảo hộ – ý tưởng ca khúc gắn với từng màn chơi, viết lời tiếng Việt và các bản chuyển ngữ, quyết định thể loại và sắc thái, nghe chọn duyệt qua nhiều vòng, sàng lọc vào tuyển tập theo game. Đây là **sự sáng tạo có chủ đích của con người**, không phải bấm nút lấy kết quả.

> 📌 Trang web đã gỡ các dòng ghi công cụ AI theo yêu cầu. Việc đó không sai – website là kênh truyền thông. Nhưng **hồ sơ nộp cơ quan nhà nước là văn bản pháp lý, chuẩn mực khác hẳn.** Nên hỏi luật sư sở hữu trí tuệ trước khi chốt phương án.

## F2 · Thỏa thuận đồng tác giả – phải có trước khi nộp

Hồ sơ có hai đồng tác giả. **Bắt buộc phải có văn bản thỏa thuận** ghi rõ:

1. **Tỷ lệ quyền của mỗi người** trên từng loại tác phẩm – có thể khác nhau giữa phần mềm, mỹ thuật, âm nhạc và tài liệu
2. **Ai đứng tên nộp đơn** và ai là người liên hệ
3. **Cơ chế quyết định khi khai thác thương mại** – bán, cấp phép, chuyển nhượng
4. **Xử lý khi một bên rút** khỏi dự án
5. **Quyền nhân thân** – quyền đứng tên, quyền bảo vệ sự toàn vẹn tác phẩm – luật quy định không được chuyển giao

Không có văn bản này thì Cục sẽ trả hồ sơ. Nên công chứng để tránh tranh chấp về sau.

## F3 · Lời bài hát chưa đủ

Như đã nêu ở Mục B3: cần lời đầy đủ của **cả 14 ca khúc**, hiện mới có 2. Đây là việc phải làm thủ công trước khi nộp đơn âm nhạc.

---

# PHẦN G · TRÌNH TỰ THỰC HIỆN ĐỀ XUẤT

## Giai đoạn 1 – Trong tuần này (chi phí gần bằng 0)

- [ ] Tạo bản phát hành gắn **DOI trên Zenodo** – mốc thời gian quốc tế, miễn phí
- [ ] Xuất **nhật ký 271 commit** ra PDF, lưu bản cứng
- [ ] Lưu trang web lên **web.archive.org**
- [ ] **Tra cứu nhãn hiệu «BizOn»** tại wipopublish.ipvietnam.gov.vn
- [ ] Soạn và ký **thỏa thuận đồng tác giả** (Mục F2)

## Giai đoạn 2 – Trong tháng này

- [ ] Quyết định phương án xử lý vấn đề AI (Mục F1) – **nên hỏi luật sư trước**
- [ ] Chép đủ **lời 14 ca khúc**
- [ ] Chuẩn bị bản in mã nguồn, **đã loại bỏ `food-truck.html`**
- [ ] In bảng tạo hình nhân vật khổ A3

## Giai đoạn 3 – Nộp hồ sơ

Thứ tự ưu tiên theo giá trị bảo vệ trên mỗi đồng chi phí:

| Thứ tự | Đơn | Phí | Vì sao trước |
|---|---|---|---|
| 1 | **Nhãn hiệu «BizOn» – Nhóm 9 + 41** | ~2,2 tr | Thời gian xử lý dài nhất (18–30 tháng), ngày nộp là ngày ưu tiên |
| 2 | **Chương trình máy tính** | 600 k | Tài sản cốt lõi, khó chứng minh nhất nếu tranh chấp |
| 3 | **Mỹ thuật ứng dụng** | 400 k | Dễ bị sao chép nhất |
| 4 | **Tác phẩm viết** | 100 k | Giá trị học thuật, chi phí thấp |
| 5 | **Tuyển tập âm nhạc** | 100 k | Sau khi giải quyết xong Mục F1 và F3 |

**Tổng chi phí nhà nước ước tính: ≈ 3,4 triệu đồng.** Nếu thuê tổ chức đại diện làm trọn gói, cộng thêm khoảng 10–20 triệu.

---

# PHẦN H · ĐỊA CHỈ LIÊN HỆ

**Cục Bản quyền tác giả**
33 Ngô Quyền, Hoàn Kiếm, Hà Nội
Văn phòng đại diện phía Nam: 170 Nguyễn Đình Chiểu, Quận 3, TP.HCM
Văn phòng đại diện tại Đà Nẵng: 58 Phan Chu Trinh, Hải Châu

**Cục Sở hữu trí tuệ**
386 Nguyễn Trãi, Thanh Xuân, Hà Nội
Văn phòng đại diện tại TP.HCM: 17–19 Tôn Thất Tùng, Quận 1
Văn phòng đại diện tại Đà Nẵng: 135 Minh Mạng, Ngũ Hành Sơn

**Cổng dịch vụ công trực tuyến:** dichvucong.gov.vn – cả hai Cục đều nhận hồ sơ trực tuyến, thường nhanh hơn nộp trực tiếp.

---

*Tài liệu lập ngày 31/07/2026 phục vụ nội bộ nhóm tác giả BizOn Bật Nghiệp.*
*© 2026 Đỗ Thùy Hương & Phan Anh Tú.*
