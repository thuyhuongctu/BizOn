# Hồ sơ bản quyền tác giả — thông tin soạn sẵn
## Hệ sinh thái BizOn Bật Nghiệp

**Ngày soạn:** 31/07/2026 · **Soạn theo biểu mẫu:** «Thông tin cần để soạn hồ sơ bản quyền tác giả»
**Dùng kèm:** `docs/ho-so-so-huu-tri-tue.md`

> Tài liệu này điền sẵn **sáu mục thông tin** mà đơn vị làm hồ sơ yêu cầu, cho cả bốn tác phẩm. Phần in **`[…]`** là chỗ hai tác giả phải tự điền hoặc tự chuẩn bị.

---

## Bốn tác phẩm nộp riêng bốn hồ sơ

| # | Tên tác phẩm | Loại hình | Phí nhà nước |
|---|---|---|---|
| **1** | BizOn Bật Nghiệp – Hệ thống phần mềm mô phỏng kinh doanh phục vụ đào tạo khởi nghiệp | Chương trình máy tính | 600.000 đ |
| **2** | Bộ tạo hình nhân vật và hệ thống nhận diện đất nặn 3D BizOn Bật Nghiệp | Mỹ thuật ứng dụng | 400.000 đ |
| **3** | Tuyển tập ca khúc BizOn Bật Nghiệp | Âm nhạc | 100.000 đ |
| **4** | Bộ tài liệu thiết kế sư phạm và kịch bản trò chơi BizOn Bật Nghiệp | Tác phẩm viết | 100.000 đ |

---
---

# TÁC PHẨM 1 · CHƯƠNG TRÌNH MÁY TÍNH

## ① Tên tác phẩm và bản mô tả

### Tên tác phẩm

> **BizOn Bật Nghiệp – Hệ thống phần mềm mô phỏng kinh doanh phục vụ đào tạo khởi nghiệp**
>
> Tên tiếng Anh: *BizOn – Business Simulation Software for Entrepreneurship Education*

### Mục đích

Phần mềm được tạo lập nhằm giải quyết một khoảng trống trong đào tạo quản trị kinh doanh tại Việt Nam: sinh viên học lý thuyết về giá, dòng tiền, vận hành và quốc tế hóa nhưng **không có cơ hội ra quyết định thật và chịu hậu quả của quyết định đó** trước khi ra trường. Các phần mềm mô phỏng quốc tế thì đắt, bằng tiếng Anh và đặt trong bối cảnh doanh nghiệp nước ngoài.

Phần mềm cung cấp một môi trường mô phỏng **bằng tiếng Việt, đặt trong bối cảnh doanh nghiệp Việt Nam**, để người học điều hành một doanh nghiệp ảo qua sáu vòng kinh doanh, ra quyết định trong điều kiện thiếu thông tin và có ràng buộc thời gian, sau đó đối chiếu kết quả với khung lý thuyết trong buổi thảo luận.

### Nội dung

Phần mềm chạy trên trình duyệt theo kiến trúc ứng dụng web tiến bộ (PWA), gồm tám thành phần chính:

1. **Engine mô phỏng kinh doanh xác định** — tính doanh thu, thị phần, dòng tiền, khấu hao, chỉ số hiệu quả thiết bị và điểm hòa vốn qua sáu vòng chơi, từ các quyết định giá bán, sản lượng, marketing, nhân sự và đầu tư của người học. Cùng một trạng thái đầu vào luôn cho ra cùng một kết quả, phục vụ chấm điểm công bằng và giải thích được.

2. **Hệ thống biến cố thị trường** — thư viện tình huống kinh doanh có trọng số và sắc thái, tác động lên hệ số co giãn cầu và hiệu quả marketing của từng vòng.

3. **Mô-đun cố vấn Lumina** — bộ luật «nếu – thì» đọc trạng thái ván chơi để chọn kịch bản tư vấn kèm mức rủi ro, có giới hạn ba lượt hỏi mỗi vòng mang dụng ý sư phạm: buộc người học tự phân tích trước, hỏi cố vấn sau.

4. **Mô-đun mô phỏng «Nếu – Thì»** — cho phép dự báo thị phần và điểm hòa vốn theo thông số giả định trước khi chốt quyết định.

5. **Hạ tầng dữ liệu lớp học** — ghi nhận kết quả từng vòng theo mã lớp, bảng điều khiển cho giảng viên theo dõi trực tiếp trong buổi học, xuất dữ liệu chấm điểm ra tệp CSV.

6. **Hệ thống giao diện đất nặn ba chiều** — bộ thành phần giao diện, hoạt ảnh và quy tắc thiết kế riêng, có chế độ sáng và tối.

7. **Cơ chế song ngữ Việt – Anh** — từ điển đối chiếu và cơ chế chuyển ngữ tại chỗ, không cần tải lại trang.

8. **Ba game chiến lược trong cùng hệ sinh thái** — Hộ Chiếu Thương Hiệu (mô phỏng quốc tế hóa doanh nghiệp qua sáu quý), BizOn Go Global (bản đồ thâm nhập thị trường quốc tế), BizOn Arcade (các trò rèn phản xạ ra quyết định).

**Ngôn ngữ lập trình:** JavaScript · HTML · CSS · SQL
**Quy mô phần do nhóm tác giả tạo lập:** 8.469 dòng JavaScript, 9.503 dòng HTML

### Ý nghĩa

- **Về đào tạo:** cho phép tổ chức một buổi học 90 phút hoặc trọn buổi ba tiết trong đó 45–50 sinh viên chia thành 9–10 đội cùng điều hành doanh nghiệp ảo, có công cụ chấm điểm dựa trên dữ liệu thay vì cảm tính.
- **Về nghiên cứu:** engine xác định và công khai công thức cho phép nghiên cứu về hiệu quả học tập dựa trên trò chơi mô phỏng, một hướng còn ít công trình tại Việt Nam.
- **Về bản địa hóa:** toàn bộ bối cảnh, nhân vật, tình huống và ngôn ngữ đặt trong môi trường kinh doanh Việt Nam, giải quyết vấn đề khoảng cách văn hóa của các phần mềm mô phỏng nhập khẩu.

---

## ② Ngày hoàn thành tác phẩm

> `[…/…/2026]`
>
> *Gợi ý: có thể lấy ngày commit cuối cùng của bản hoàn chỉnh. Bản kiểm kê này tính đến ngày **31/07/2026**.*

---

## ③ Ngày công bố và nơi công bố

| Mục | Nội dung |
|---|---|
| Đã công bố | **Có** |
| Ngày công bố | **26/07/2026** |
| Hình thức | Đăng tải công khai trên mạng Internet |
| Nơi công bố | `github.com/thuyhuongctu/BizOn`<br>`thuyhuongctu.github.io/BizOn/` |
| Quốc gia công bố | Việt Nam |

**Chứng cứ kèm theo:** kho mã lưu **271 phiên bản có dấu thời gian** từ 26/07/2026 đến 31/07/2026. Nên xuất nhật ký này ra PDF làm phụ lục — đây là chứng cứ khách quan do bên thứ ba lưu giữ, mạnh hơn lời khai của chính tác giả.

---

## ④ Thông tin tác giả

**Tác giả thứ nhất**

| Mục | Nội dung |
|---|---|
| Họ và tên | **Đỗ Thùy Hương** |
| Bút danh (nếu có) | `[…]` |
| Quốc tịch | Việt Nam |
| Ngày tháng năm sinh | `[…]` |
| Số CCCD · ngày cấp · nơi cấp | `[…]` |
| Địa chỉ thường trú | `[…]` |
| Điện thoại | `[…]` |
| Email | thuyhuongctu@gmail.com |

**Tác giả thứ hai**

| Mục | Nội dung |
|---|---|
| Họ và tên | **Phan Anh Tú** |
| Bút danh (nếu có) | `[…]` |
| Quốc tịch | Việt Nam |
| Ngày tháng năm sinh | `[…]` |
| Số CCCD · ngày cấp · nơi cấp | `[…]` |
| Địa chỉ thường trú | `[…]` |
| Điện thoại | `[…]` |
| Email | patu@ctu.edu.vn |

> 📎 **Kèm theo:** bản sao **y chứng thực** căn cước công dân của **từng tác giả**. Bản photo thường không được chấp nhận — phải có chứng thực của UBND phường/xã hoặc phòng công chứng.

---

## ⑤ Thông tin chủ sở hữu

☒ **Chủ sở hữu đồng thời là tác giả** — Đỗ Thùy Hương và Phan Anh Tú đồng sở hữu.

**Tỷ lệ đồng sở hữu:** `[…]% : […]%`

**Cơ sở phát sinh quyền:** tác giả tự sáng tạo bằng thời gian và chi phí của mình, **không theo hợp đồng thuê** và **không theo nhiệm vụ được giao** bởi cơ quan công tác.

> ⚠️ **Điểm cần lưu ý về nơi công tác.** Nếu tác phẩm được tạo ra trong thời gian và bằng phương tiện của cơ quan, hoặc thuộc nhiệm vụ được giao, thì theo Điều 39 Luật SHTT quyền tài sản có thể thuộc về cơ quan chứ không thuộc tác giả. Hai tác giả cần **tự xác nhận rõ** điều này trước khi khai — nếu có bất kỳ nghi ngại nào, nên xin **văn bản xác nhận của cơ quan** rằng cơ quan không có quyền đối với tác phẩm.
>
> Đây là lỗi phổ biến khiến hồ sơ bị tranh chấp về sau, đặc biệt với giảng viên và nghiên cứu sinh.

**Nếu sau này chuyển quyền sở hữu cho một công ty:** cần cung cấp Giấy chứng nhận đăng ký kinh doanh sao y chứng thực và hợp đồng chuyển nhượng quyền tác giả.

---

## ⑥ Tác phẩm nộp kèm

| Hạng mục | Yêu cầu | Trạng thái |
|---|---|---|
| Đĩa chạy chương trình | **02 đĩa** | `[cần ghi]` |
| Giao diện chương trình in ra giấy | Đã loại bỏ logo, hình ảnh của chủ thể khác | ⚠️ **xem cảnh báo dưới** |
| Mã nguồn in ra giấy | **Khoảng 15–20 trang** | `[cần chọn phần in]` |

### ⚠️ Cảnh báo 1 — Ảnh giao diện phải loại bỏ dấu hiệu của bên thứ ba

Rà soát giao diện hiện tại phát hiện **các dấu hiệu của chủ thể khác đang hiển thị trên màn hình**. Phải xử lý trước khi chụp ảnh giao diện in nộp:

| Dấu hiệu | Xuất hiện ở | Cách xử lý |
|---|---|---|
| **Logo GitHub** dạng hình vẽ nhúng thẳng trong trang | `index.html` · `gioi-thieu.html` · `global.html` · `games.html` | Che hoặc cắt bỏ khỏi ảnh chụp |
| Nút chia sẻ **Facebook · X · GitHub** trong thanh tiện ích | Toàn bộ trang | Đóng thanh tiện ích trước khi chụp |
| Chữ **GitHub** trong đường dẫn hiển thị | 22 vị trí | Cắt bỏ khỏi ảnh, hoặc chụp phần không chứa |
| Chữ **ORCID · OSF** | `doi-ngu.html` · `gioi-thieu.html` | Không chụp mục Hồ sơ học thuật |
| Chữ **Zenodo** | 5 trang: hai trang trên, thêm `classic-home.html` · `du-an.html` · `lien-he.html` | Không chụp phần trích dẫn và DOI |
| Chữ **Supabase** | `doi-ngu.html` · `chinh-sach.html` · `giang-vien.html`, và tài liệu kỹ thuật | Không chụp phần liệt kê công nghệ |
| ~~Chữ **Harvard Business Publishing · Forio**~~ | ~~`food-truck.html`~~ | **ĐÃ THAY THẾ 05/08/2026** — trang không chứa dấu hiệu HBP/Forio; xem Cảnh báo 2 |

**Cách làm gọn nhất:** chụp ảnh giao diện các màn hình **bên trong game** (màn đăng nhập, bảng điều khiển, màn quyết định, báo cáo, kết quả cuối ván) — những màn này không chứa dấu hiệu bên thứ ba. Tránh chụp trang chủ và trang Đội ngũ.

### Cảnh báo 2 — ĐÃ THAY THẾ 05/08/2026 (Bến Phù Sa là tác phẩm độc lập)

> **Cập nhật:** Theo *Thuyết minh phân định tài sản trí tuệ* (05/08/2026), bậc 1 **«Bến Phù Sa» là tác phẩm ĐỘC LẬP** (Nhóm B — tài sản có trước, đăng ký được), KHÔNG phải phái sinh. Trang trò chơi **không chứa dấu hiệu HBP/Forio nào** (đã kiểm). Tệp đã đổi tên `food-truck.html → ben-phu-sa.html`; URL cũ chuyển hướng. **Không còn phải loại khỏi đĩa/bản in.** Cần luật sư SHTT xác nhận trước khi nộp.

<sub>— Cảnh báo cũ, ĐÃ THAY THẾ (giữ để truy vết) —</sub>

~~Trang này là phương án bản địa hóa xây dựng dựa trên cấu trúc mô phỏng **«The Food Truck Challenge»** của Michael A. Roberto — Harvard Business Publishing · Forio. Đây là tác phẩm phái sinh từ tác phẩm của bên thứ ba. Phải loại khỏi cả đĩa nộp lẫn bản in mã nguồn.~~

### Gợi ý chọn 15–20 trang mã nguồn để in

Yêu cầu chỉ 15–20 trang, trong khi kho có gần 18.000 dòng. Nên chọn phần **thể hiện rõ nhất tính sáng tạo riêng**, không nên in phần giao diện lặp lại:

| Ưu tiên | Tệp | Nội dung | Số dòng | Ước tính trang |
|---|---|---|:-:|:-:|
| 1 | `js/engine.js` | Toàn bộ engine mô phỏng — công thức tính doanh thu, thị phần, dòng tiền, chỉ số OEE, bộ luật cố vấn | 688 | 13 |
| 2 | `sw.js` | Cơ chế chạy ngoại tuyến | 174 | 4 |
| 3 | `js/quiz-bank.js` | Ngân hàng câu hỏi kiểm tra | 117 | 3 |
| 4 | `js/backend.js` | Cơ chế ghi nhận dữ liệu lớp học | 91 | 2 |
| | **Tổng** | | **1.070** | **20 trang** |

*Ước tính theo 55 dòng một trang, khổ A4, cỡ chữ 10.*

**Đúng trần 20 trang.** Nếu đơn vị làm hồ sơ muốn gọn hơn, **bỏ `sw.js`** trước — còn 16 trang mà vẫn giữ nguyên phần lõi. **Không bỏ `js/engine.js`**: đây là tệp chứa toàn bộ công thức mô phỏng, là phần thể hiện rõ nhất tính sáng tạo riêng của tác phẩm.

**Không in:** `css/tw.css` (thư viện bên thứ ba, giấy phép MIT) · `js/site-ui.js` (phần lớn là từ điển đối chiếu, ít giá trị thể hiện sáng tạo kỹ thuật).

**Quy cách in:** in hai mặt, đánh số trang liên tục, **ký nháy từng trang hoặc ký giáp lai** toàn tập.

---
---

# TÁC PHẨM 2 · MỸ THUẬT ỨNG DỤNG

## ① Tên tác phẩm và bản mô tả

### Tên tác phẩm

> **Bộ tạo hình nhân vật và hệ thống nhận diện đất nặn 3D BizOn Bật Nghiệp**

### Mục đích

Xây dựng một **ngôn ngữ tạo hình riêng** cho hệ sinh thái phần mềm mô phỏng, nhằm ba việc: tạo nhận diện thương hiệu phân biệt được với các sản phẩm cùng loại; giúp người học ghi nhớ vai trò và tính cách của từng nhân vật trong trò chơi; và tạo cảm giác thân thiện, giảm áp lực cho môi trường học tập vốn nhiều con số.

### Nội dung

Bộ tác phẩm gồm **119 tệp hình ảnh** theo phong cách đất nặn ba chiều (claymorphism), chia thành chín nhóm:

| Nhóm | Số tệp | Nội dung |
|---|:-:|---|
| Nhân vật cố vấn | 21 | Nhân vật Lumina — nhiều tạo hình, trang phục và tư thế |
| Nhân vật chính | 33 | Người dẫn chuyện và cố vấn học thuật |
| Đội chơi mẫu | 14 | Năm vai trò trong ban điều hành doanh nghiệp |
| Doanh nghiệp trong game | 8 | Bốn thương hiệu giả tưởng |
| Đối thủ trong nước | 3 | Ba nhân vật đối thủ |
| Đối thủ quốc tế | 14 | Nhân vật đối thủ thị trường quốc tế |
| Tranh minh họa và bối cảnh | 21 | Bản đồ, sự kiện, bối cảnh |
| Biểu tượng thương hiệu | 3 | Logo và màn hình khởi động |
| Sản phẩm quà tặng | 2 | Thiết kế cài áo |
| **Tổng** | **119** | |

### Ý nghĩa

- **Tính hệ thống, không phải tập hợp ảnh rời:** toàn bộ **21 tạo hình dàn nhân vật** game Hộ Chiếu Thương Hiệu dựng trên **khung chuẩn thống nhất 760 × 1100 điểm ảnh**, chiều cao nhân vật thống nhất, cùng một đường chân, nền trong suốt. Đây là bằng chứng của một hệ thống thiết kế có chủ đích.
- **Bản sắc văn hóa:** trang phục áo dài, cài áo bản đồ Việt Nam, bối cảnh sông nước miền Tây — đưa yếu tố văn hóa Việt vào một thể loại sản phẩm thường mang hình ảnh phương Tây.
- **Ứng dụng thực tế:** hình ảnh gắn trực tiếp vào phần mềm, không phải tác phẩm mỹ thuật độc lập — đúng định nghĩa mỹ thuật ứng dụng.

## ② Ngày hoàn thành · ③ Ngày công bố

Giống Tác phẩm 1. Nơi công bố cụ thể: `thuyhuongctu.github.io/BizOn/thu-vien.html`

## ④ ⑤ Thông tin tác giả và chủ sở hữu

Giống Tác phẩm 1.

## ⑥ Tác phẩm nộp kèm

| Hạng mục | Nội dung |
|---|---|
| **Bản in màu** | Hai bảng tạo hình tổng hợp khổ A3: `VN-BIZON-BP-CAST-001` (21 nhân vật trên cùng khung chuẩn) và `VN-HƯƠNG-CLAY-001` (bảng ba góc nhìn: trước · nghiêng 45° · sau) |
| **02 đĩa** | 119 tệp gốc, phân theo chín thư mục nêu trên |

> ⚠️ **Kiểm tra trước khi in:** bảo đảm không có tệp nào chứa logo hoặc hình ảnh của chủ thể khác. Các nhân vật, doanh nghiệp và bối cảnh trong bộ đều là **giả tưởng** — cần rà lại để chắc chắn không tệp nào vô tình chứa nhãn hiệu có thật.

---
---

# TÁC PHẨM 3 · ÂM NHẠC

## ① Tên tác phẩm và bản mô tả

### Tên tác phẩm

> **Tuyển tập ca khúc BizOn Bật Nghiệp** — 13 ca khúc, 33 bản thu

### Mục đích

Tạo nhạc nền và nhạc chủ đề riêng cho từng màn chơi trong hệ sinh thái, thay vì dùng nhạc có sẵn. Mỗi ca khúc **sinh ra để phục vụ một màn chơi hoặc một chủ đề sư phạm cụ thể**, không phải nhạc đặt ngoài rồi lắp vào.

Lý do có nhiều bản thu cho cùng một ca khúc: buổi học ba quý và buổi chạy trọn sáu quý cần độ dài nhạc khác nhau; lớp tiếng Việt, lớp quốc tế và tuyến Pháp ngữ cần bản lời khác nhau; màn tổng kết cần nhịp dày hơn màn mở đầu.

### Nội dung — danh mục 13 ca khúc

| # | Tên ca khúc | Bản thu | Ngôn ngữ lời | Gắn với |
|---|---|:-:|---|---|
| 1 | Hương on Return | 2 | Việt | Ca khúc chủ đề hệ sinh thái |
| 2 | Journey on the Golden Silt | 4 | Anh · Pháp · Việt | BizOn Go Global |
| 3 | Je m'appelle Hương sans frontières | 4 | Việt · Anh · Pháp | BizOn Go Global |
| 4 | Đội Phù Sa | 3 | Việt | Bài hát đội chơi |
| 5 | Brand Passport | 4 | Anh | Hộ Chiếu Thương Hiệu |
| 6 | Stamps Beyond Borders | 4 | Anh | Hộ Chiếu Thương Hiệu |
| 7 | Golden Silt Route | 1 | Anh | Hộ Chiếu Thương Hiệu |
| 8 | Tổ khúc — Phần I «Từ dòng Mekong» | 1 | Việt | Hộ Chiếu Thương Hiệu |
| 9 | Tổ khúc — Phần II «Qua Những Thị Trường» | 1 | Việt | Hộ Chiếu Thương Hiệu |
| 10 | Tổ khúc — Phần III «Việt Nam ra thế giới» | 4 | Việt · Anh | Hộ Chiếu Thương Hiệu |
| 11 | Bật Nghiệp | 1 | Không lời | Game mô phỏng chính |
| 12 | Vừa Đủ Để Bay Cao | 1 | Việt | Game mô phỏng chính |
| 13 | And The World Say Hello! | 1 | Anh | BizOn Arcade |
| 14 | Mekong Compass · BizOn Theme | 2 | Anh · không lời | Nhiều game |
| | **Tổng cộng** | **33** | | |

*Dòng 14 gồm hai ca khúc riêng biệt, khi khai chi tiết nên tách thành hai dòng.*

### Ý nghĩa

Chủ đề xuyên suốt: **hành trình khởi nghiệp từ đồng bằng sông Cửu Long ra thị trường quốc tế**. Ba ngôn ngữ lời cho phép dùng chung bộ nhạc cho lớp trong nước, lớp quốc tế và tuyến Pháp ngữ.

## ② Ngày hoàn thành · ③ Ngày công bố

Giống Tác phẩm 1. Nơi công bố cụ thể: `thuyhuongctu.github.io/BizOn/am-nhac.html`

## ④ ⑤ Thông tin tác giả và chủ sở hữu

Giống Tác phẩm 1.

## ⑥ Tác phẩm nộp kèm

| Hạng mục | Nội dung |
|---|---|
| **Bản in giấy** | **Lời bài hát của cả 13 ca khúc** — hoặc bản ký âm nếu có |
| **02 đĩa** | 34 tệp âm thanh |

> 🚧 **Việc phải làm trước khi nộp đơn này.** Cục yêu cầu **bản nhạc hoặc lời bài hát trên giấy**, không nhận riêng tệp âm thanh. Tài liệu `docs/loi-bai-hat.md` hiện mới có lời đầy đủ của **2 trong 14 ca khúc**. Phải chép đủ 12 bài còn lại.
>
> Bốn tệp giọng nói nhân vật cố vấn **không thuộc đơn này** — nằm trong đơn chương trình máy tính.

---
---

# TÁC PHẨM 4 · TÁC PHẨM VIẾT

## ① Tên tác phẩm và bản mô tả

### Tên tác phẩm

> **Bộ tài liệu thiết kế sư phạm và kịch bản trò chơi BizOn Bật Nghiệp**

### Mục đích

Cung cấp cho giảng viên bộ công cụ hoàn chỉnh để **đưa trò chơi mô phỏng vào một buổi học thật và chấm điểm được**: từ chuẩn đầu ra học tập, rubric chấm, sổ điểm, bộ đo trước – sau, tới kịch bản tổ chức lớp theo từng mức thời lượng và quy mô.

### Nội dung

| Tài liệu | Nội dung |
|---|---|
| **Bộ công cụ thiết kế và đánh giá học tập** | Ma trận chuẩn đầu ra theo thang Bloom cho hai game (11 chuẩn đầu ra có mã); hai bộ rubric chấm thang 4 mức; sổ điểm in được; bộ 30 câu đo trước – sau; bản đồ đối chiếu chuẩn đầu ra học phần; ba kịch bản thời lượng và ba mức quy mô lớp |
| **Thiết kế mô-đun cố vấn** | Kiến trúc, cấu trúc dữ liệu và logic «nếu – thì» của nhân vật cố vấn |
| **Kho lời thoại nhân vật** | 49 câu thoại tiếng Việt của nhân vật cố vấn Lumina |
| **Lời ca khúc** | Lời các ca khúc trong hệ sinh thái |
| **Hướng dẫn tổ chức buổi học** | Kịch bản lớp học chi tiết cho giảng viên |
| **Quy tắc hệ thống thiết kế** | Bảng màu, kiểu chữ, thành phần giao diện |
| **Kiến trúc dữ liệu** | Lược đồ cơ sở dữ liệu và cấu trúc giao tiếp |

### Ý nghĩa

Đây là **phần có giá trị học thuật cao nhất** của dự án và là phần thuần túy do con người sáng tạo. Ma trận chuẩn đầu ra, rubric và bộ công cụ đo lường là sản phẩm nghiên cứu sư phạm, dùng được độc lập với phần mềm — giảng viên có thể áp dụng khung đánh giá này cho các hoạt động mô phỏng khác.

## ② Ngày hoàn thành · ③ Ngày công bố

Giống Tác phẩm 1. Nơi công bố cụ thể: `github.com/thuyhuongctu/BizOn/tree/main/docs`

## ④ ⑤ Thông tin tác giả và chủ sở hữu

Giống Tác phẩm 1.

## ⑥ Tác phẩm nộp kèm

| Hạng mục | Nội dung |
|---|---|
| **Bản in giấy** | Toàn bộ tài liệu, in hai mặt, đánh số trang liên tục |
| **02 đĩa** | Bản điện tử định dạng PDF và Markdown |

---
---

# BẢNG TỔNG HỢP VIỆC PHẢI LÀM

## Hai tác giả tự chuẩn bị

| # | Việc | Áp dụng cho |
|---|---|---|
| 1 | **Bản sao y chứng thực CCCD** của từng người | Cả 4 hồ sơ |
| 2 | Điền ngày sinh, số CCCD, địa chỉ, điện thoại | Cả 4 hồ sơ |
| 3 | **Chốt tỷ lệ đồng sở hữu** — có thể khác nhau giữa 4 tác phẩm | Cả 4 hồ sơ |
| 4 | **Ký văn bản thỏa thuận đồng tác giả** — không có thì Cục trả hồ sơ | Cả 4 hồ sơ |
| 5 | Xác nhận tác phẩm **không thuộc nhiệm vụ cơ quan giao** | Cả 4 hồ sơ |
| 6 | Chốt **ngày hoàn thành tác phẩm** | Cả 4 hồ sơ |
| 7 | **Chép đủ lời 12 ca khúc còn lại** | Hồ sơ 3 |

## Việc kỹ thuật

| # | Việc | Ghi chú |
|---|---|---|
| 8 | Chụp ảnh giao diện **đã loại bỏ dấu hiệu bên thứ ba** | Chụp màn hình bên trong game, tránh trang chủ và trang Đội ngũ |
| 9 | In 15–20 trang mã nguồn theo danh sách gợi ý | Ưu tiên `js/engine.js` |
| 10 | ~~**Loại tệp `food-truck.html`** khỏi đĩa và bản in~~ | **ĐÃ THAY THẾ 05/08/2026** — Bến Phù Sa là tác phẩm độc lập (Nhóm B), giữ lại; xem Cảnh báo 2 |
| 11 | Ghi 02 đĩa cho mỗi hồ sơ — 8 đĩa tổng cộng | Ghi nhãn: tên tác phẩm, tác giả, ngày |
| 12 | Xuất nhật ký 271 phiên bản ra PDF làm phụ lục | Chứng cứ mốc thời gian |

## Việc cần hỏi luật sư trước

| # | Việc | Vì sao |
|---|---|---|
| 13 | **Cách khai về công cụ hỗ trợ AI** trong Giấy cam đoan | Luật Việt Nam chưa có quy định dứt khoát — xem Mục F1 của `docs/ho-so-so-huu-tri-tue.md` |
| 14 | Xác nhận quyền sở hữu không thuộc cơ quan công tác | Điều 39 Luật SHTT — lỗi phổ biến với giảng viên và nghiên cứu sinh |

---

*© 2026 Đỗ Thùy Hương & Phan Anh Tú. Tài liệu nội bộ phục vụ chuẩn bị hồ sơ.*
