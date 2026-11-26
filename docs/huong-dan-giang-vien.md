# 📖 Hướng dẫn Giảng viên / Người quản lý – BizOn Bật Nghiệp

> Tài liệu dành cho giảng viên và người quản lý lớp học sử dụng BizOn làm công cụ giảng dạy khởi nghiệp / quản trị kinh doanh.
> © 2026 Đỗ Thùy Hương & Phan Anh Tú – Đại học Cần Thơ.

---

## 1. Tổng quan trò chơi

- **BizOn Bật Nghiệp** là game mô phỏng kinh doanh: mỗi đội điều hành một công ty đồ chơi đất sét tại Việt Nam 2026, qua **6 vòng chơi** (mỗi vòng ≈ một quý kinh doanh).
- Mỗi vòng đội ra quyết định: **giá bán, marketing, R&D, sản lượng, nhân công, đào tạo, nguồn vốn (vốn chủ / vay), bảo trì** – sau đó thị trường mô phỏng phản ứng và sinh báo cáo.
- Chơi trên web hoặc cài như app (PWA): https://thuyhuongctu.github.io/BizOn/ – dữ liệu lưu cục bộ trên máy từng đội (localStorage), không cần máy chủ.

## 2. Tổ chức lớp học

| Bước | Việc cần làm |
|---|---|
| 1 | Phát **Class ID** thống nhất (VD: `QTKD-2026-A`) – các đội nhập khi đăng nhập |
| 2 | Mỗi đội 5 sinh viên ứng với 5 vai trò: **CEO · CFO · CMO · COO · SEC** (một máy/đội; người cầm máy chọn vai của mình, các vai còn lại thảo luận ngoài đời) |
| 3 | Đội mới có thể bấm **"👥 Chơi thử với Đội Demo"** để xem cấu trúc đội mẫu 5 nhân vật |
| 4 | Quy định thời gian mỗi vòng (khuyến nghị 8–12 phút thảo luận + chốt) |
| 5 | Dùng tab **🧑‍🏫 Giảng viên** trong game: khóa vòng chơi, cấp vốn thưởng, xem nhật ký cấp vốn |
| 6 | Cuối buổi: so sánh các đội bằng ảnh chụp tab **Xếp hạng**, **Bản đồ chinh phục** (số cờ 🚩) và **báo cáo P&L** |

### Lớp đông (trên 60 sinh viên, một mã lớp)

Hệ thống không giới hạn số sinh viên hay số đội trong một mã lớp. Từ 12/11/2026 các trần hiển thị và tần suất đã nâng cho lớp 160–200 sinh viên (migration `20261112000000_gioi_han_lop_dong.sql`): phiếu khảo sát 500 phiếu/phút cho một mã lớp, bảng xếp hạng công khai 500 dòng, trang Giảng viên đọc tới 1000 lượt nộp. Việc cần làm trước buổi học:

| Việc | Vì sao |
|---|---|
| Chia đội 5 người từ trước, dán danh sách (STT, họ tên, mã SV, email, đội) vào trang Giảng viên | Hệ thống không tự chia đội; danh sách dán chỉ lưu trên trình duyệt của máy đó |
| Kiểm tên miền email của sinh viên đã được duyệt (quản trị thêm bằng `bizon_admin_set_student_domain`) | Email ngoài danh sách thì chơi được nhưng không nộp được kết quả lên lớp |
| Cho sinh viên đăng ký tài khoản **trước buổi học ít nhất một ngày** | Email xác nhận gửi khoảng 100 thư/giờ; cả lớp đăng ký cùng lúc sẽ có bạn không nhận được thư |
| Mỗi đội một máy thì chỉ người cầm máy cần tài khoản (32 đội = 32 tài khoản) | Giảm số email xác nhận và số máy cần mạng ổn định |
| In chứng nhận theo đợt 40–50 tờ | Cả lớp dồn vào một cửa sổ in thì nặng máy |

**Chấm điểm (chốt 07/11/2026):** 50% điểm game B1–B6 (Excel từ bảng điều khiển) · 30% rubric lập luận CLO-A…E · 20% hợp tác vai trò & bài học rút ra (Nhật ký đội) — chi tiết rubric, cách chấm theo từng vòng và sổ điểm mẫu: xem `docs/chuan-dau-ra-va-rubric.md` §4.1 hoặc bản trích gọn `docs/cham-diem-bat-nghiep.md`.

## 3. Ba đối thủ ảo – hành vi chính xác

Mỗi vòng, 3 đối thủ ảo tự quyết định **giá** và **marketing** quanh mức đặc trưng, nhân với hệ số dao động ngẫu nhiên **±12%** (jitter 0,9–1,15, tất định theo seed của đội – cùng một đội chơi lại sẽ ra đúng kết quả cũ, tiện đối chiếu):

| Đối thủ | Phong cách | Giá cơ sở | Marketing cơ sở | Ý nghĩa sư phạm |
|---|---|---|---|---|
| 🐺 **Alpha Dynamics** | Giá rẻ tốc chiến (aggressive) | ~125 nghìn ₫ | ~90 tr₫/vòng | Dạy về cạnh tranh giá & giữ biên lợi nhuận |
| 🐘 **Mekong Ventures** | Cân bằng (balanced) | ~150 nghìn ₫ | ~60 tr₫/vòng | Chuẩn so sánh "trung tính" của thị trường |
| 🦚 **Star Clay Co.** | Cao cấp (premium) | ~195 nghìn ₫ | ~75 tr₫/vòng | Dạy về định vị phân khúc & thương hiệu |

**Cách thị phần được tính:** sức hút của mỗi công ty = `(giá tham chiếu 150k / giá)^độ_co_giãn × (1 + √marketing_hiệu_quả/18) × thương_hiệu^trọng_số`. Thị phần = sức hút của công ty / tổng sức hút 4 công ty. Ở **vòng 6** (cột mốc thu nhập trung bình cao), trọng số thương hiệu tăng **×1,5** – đội đầu tư thương hiệu dài hạn bứt phá.

**Độ co giãn giá** thay đổi theo biến cố (Price War làm thị trường nhạy giá hơn – lợi cho Alpha; Cơ Hội Vàng tăng tổng cầu...).

## 4. Sáu vòng chơi = Hành trình chinh phục Việt Nam

Mỗi vòng gắn với một tỉnh/thành (bản đồ mới sau sáp nhập). **Đội có thị phần cao nhất vòng đó (≥ đối thủ ảo cao nhất) VÀ có lãi** cắm cờ 🚩; thị phần cao nhất mà lỗ thì chỉ hiện cảnh báo ⚠️ (chưa cắm được cờ) – tránh việc phá giá/đổ hết ngân sách marketing để "thắng thị phần" trong khi âm vốn; thua cả hai điều kiện thì AI cắm cờ 🏴:

Vòng 1 **Cần Thơ** → 2 **TP. Hồ Chí Minh** → 3 **Khánh Hòa** → 4 **Đà Nẵng** → 5 **Thanh Hóa** → 6 **Hà Nội**

Bản đồ chinh phục hiển thị trên Trang chủ của mỗi đội – dùng làm bảng thành tích trực quan khi tổng kết.

## 5. Biến cố thị trường theo vòng

| Vòng | Biến cố | Tác động chính |
|---|---|---|
| 1 | Khởi động thị trường | Cơ bản |
| 2 | Cơ Hội Vàng | Tổng cầu tăng |
| 3 | Price War | Độ co giãn giá tăng – thị trường nhạy giá |
| 4 | Khủng hoảng năng lượng | Chi phí cố định & OEE bị ảnh hưởng (Pin Mặt Trời giảm nhẹ tác động) |
| 5 | Siết tín dụng | Lãi vay & thanh khoản căng |
| 6 | Việt Nam Hóa Rồng (cột mốc) | Cầu ×1,25 · thương hiệu ×1,5 · lương ×1,1 – vòng quyết định |

## 6. Công cụ hỗ trợ học tập trong game

- **Lumina** (Lumina Áo Dài / Lumina Vest Trắng): cố vấn theo vai trò, mô phỏng "Nếu – Thì" trước khi chốt, chúc mừng KPI và cảnh báo rủi ro theo đúng kịch bản sư phạm.
- **Sổ tay 📖**: luật chơi, vai trò, đối thủ ảo, mẹo, xử lý sự cố – sinh viên tự tra cứu.
- **7 báo cáo chuẩn giáo trình**: P&L, dòng tiền 3 hoạt động, CVP hòa vốn, nhân sự, BMC, khấu hao, kiểm toán năng lượng.
- **BizOn Monitor** (tab Thị trường sống): sparkline chỉ số đội + 3 đối thủ theo vòng – dạy đọc dashboard.
- **IE Lab – Phòng thí nghiệm Khởi nghiệp quốc tế** (trang riêng `lab/ie-lab.html`, vào từ BizOn Go Global): công cụ mô phỏng số liệu quan hệ quốc tế hóa – hiệu quả hoạt động kinh doanh của doanh nghiệp (chữ U ngược với điểm ngoặt minh họa ≈43% FSTS, kịch bản đảo nhỏ, "lá chắn số") – dùng cho học phần Khởi nghiệp/Kinh doanh quốc tế; toàn bộ là tham số mô phỏng giáo dục. Trang có kèm khối "Bối cảnh thực: Việt Nam trong Sustainable Trade Index 2025" – số liệu thật (FDI ròng, hiệp định thương mại, hạ tầng số, GDP đầu người) trích từ Hinrich Foundation & IMD World Competitiveness Center, *Sustainable Trade Index 2025 – Vietnam Economy Profile*, để sinh viên đối chiếu với các thanh trượt mô phỏng FSTS/TCI/DAI.
- **Cuộc họp đội (Đội Demo)**: 4 thành viên ảo đề xuất số liệu theo vai mỗi vòng – đề xuất tất định theo seed đội + vòng, nên hai đội cùng seed nghe cùng lời khuyên; dùng để dạy phân vai C-Suite ngay cả khi sinh viên chơi một mình.
- **Đấu trường**: sau mỗi Commit, 4 công ty so tài trực quan (thanh thị phần chạy hoạt hình) trước khi hiện bảng số – tăng động lực, không đổi kết quả tính toán.
- **Hỗ trợ người mới**: băng "Cách thắng vòng này", dự báo thị phần sống theo thanh trượt, chế độ Cơ bản/Nâng cao (vòng 1–2 chỉ hiện 3 quyết định cốt lõi), ô "Vì sao?" sau mỗi vòng và mục Thuật ngữ trong Sổ tay.
- **Nhật ký quyết định Go Global (CSV)**: game tự ghi lại từng quý – hồ sơ doanh nghiệp, thị trường, phương thức, thế đàm phán, giá/marketing/bản địa hóa, thị phần, lợi nhuận, ESG, rủi ro, DOI, kết quả thắng/thua. Sinh viên bấm «📥 Xuất nhật ký quyết định (CSV)» ở màn kết quả và nộp file – dùng để chấm điểm hoặc làm dữ liệu nghiên cứu (thực nghiệm giáo dục, SEM). Nhật ký lưu trong máy người chơi (localStorage, tối đa 400 dòng gần nhất). Từ 11/2026 nhật ký có thêm hai cột cuối: `ndgain` (điểm ND-GAIN của nước trung tâm) và `climate_mode` (`on`/`off`).
- **Go Global – rủi ro khí hậu (đặc tả 009):** mỗi thẻ thị trường hiện điểm ND-GAIN 2026 (số liệu năm 2024) của nước trung tâm, chỉ để tham khảo, không đổi điểm. Muốn rủi ro khí hậu có hậu quả, giảng viên gửi lớp link `global.html?khihau=1`: mỗi quý có chi phí rủi ro khí hậu (tăng theo mức dễ tổn thương và số vốn đặt tại chỗ, giảm theo điểm ESG), biến cố thiên tai nặng hơn ở nơi dễ tổn thương hơn. Độ lớn là minh họa. Lớp dùng link thường và lớp dùng `?khihau=1` không so điểm trực tiếp với nhau; tách bằng cột `climate_mode` trong CSV. Màn kết quả có hai câu hỏi thảo luận về rủi ro khí hậu.

## 7. Xử lý sự cố thường gặp

- **Không thấy bản cập nhật mới:** đóng hẳn app/tab rồi mở lại (service worker đổi cache).
- **Muốn chơi lại từ đầu:** Cài đặt → ♻️ Chơi lại từ đầu (Reset) – xóa save cục bộ của đội.
- **Hai đội dùng chung một máy:** dữ liệu sẽ ghi đè nhau – mỗi đội một máy/trình duyệt riêng (hoặc hồ sơ trình duyệt riêng).
- **Cần "trọng tài":** hành vi AI tất định theo seed đội – kết quả tái lập được, không có yếu tố may rủi giữa các lần chơi lại cùng quyết định.

## 8. Đo lường hiệu quả lớp thử nghiệm

Bộ phiếu khảo sát trước–sau in được trên khổ A4 (kèm đáp án và hướng dẫn chấm cho giảng viên):
**https://thuyhuongctu.github.io/BizOn/khao-sat.html**

- **Phiếu trước** (đầu buổi, 10 phút): 15 câu kiến thức (Phần A) + 8 câu tự tin ra quyết định (Phần B, Likert 1–5)
- **Phiếu sau** (cuối buổi, 12 phút): lặp lại A + B để đo chênh lệch, thêm phần C về trải nghiệm (5 câu), điểm giới thiệu 0–10 và 2 câu mở
- Ẩn danh bằng mã tự đặt; bản online `khao-sat-online.html` tự chấm và lưu về lớp qua link giảng viên tạo ở Instructor Studio (tab Khảo sát)
- **Lớp sinh viên quốc tế:** ở tab Khảo sát chọn «Phiếu tiếng Anh (lớp quốc tế)» trước khi chép link (link có thêm `lang=en`). Khi đó cả câu hỏi, phần đồng thuận và thông báo đều bằng tiếng Anh; đáp án, cách chấm và dữ liệu lưu về không đổi. Link không có `lang=en` luôn ra câu hỏi tiếng Việt, kể cả khi máy sinh viên để tiếng Anh, nên đừng trộn hai loại link trong cùng một lớp. Bản dịch nằm ở `js/khao-sat-en.js`.
- **Từ 11/2026 có bộ câu hỏi 2** (`batnghiep2`, 5 câu vận dụng thay cho 5 câu quá dễ của bộ 1): đang thử trên một lớp trước khi dùng chung. Hướng dẫn từng bước cho lớp thử: `docs/research/HUONG-DAN-THU-BO-2-TREN-LOP.md`; nội dung và đáp án: `docs/research/BO-CAU-HOI-KIEN-THUC-V2.md`

Dữ liệu trước–sau từ 2–3 lớp (~100 sinh viên) chính là bằng chứng hiệu quả học tập quan trọng nhất của dự án.

### Tình huống khởi nghiệp (lab/khoi-nghiep-tinh-huong.html) và đợt đo

- Trang có hai bộ tình huống giả định, mỗi bộ 4 tình huống, khoảng 30 phút: «Kiểm định ý tưởng» và «Ra thị trường». Sinh viên chọn phương án, ghi một câu lý do, xem hệ quả, «Vì sao?» và câu hỏi phản biện. Trang không chấm điểm, không dùng AI.
- **Thu kết quả lớp:** mỗi đội bấm «Xuất CSV» ở màn tổng kết và nộp tệp (qua LMS, Zalo hay email). Giảng viên mở `lab/khoi-nghiep-tinh-huong.html?gv=1`, bấm «Chọn tệp CSV» và chọn cùng lúc nhiều tệp. Trang đếm lựa chọn của lớp theo từng tình huống và hiện ghi chú giảng dạy (mục tiêu, thời lượng, câu hỏi thảo luận). Tệp chỉ được đọc trên máy giảng viên, không tải lên máy chủ. Một đội nộp hai lần thì trang giữ lần mới nhất.
- **Lưu ý đợt đo trước – sau:** bộ «Ra thị trường» dạy khoảng cách tâm lý và cam kết theo bước, cùng nhóm cơ chế quốc tế hóa với bộ đo `ct-v1`. Nếu lớp đang ở giữa hai lần đo mà dùng bộ này, **ghi ngày dùng vào nhật ký lớp** để khi phân tích còn tách được. Bộ «Kiểm định ý tưởng» không đụng các cơ chế đó.

### Phòng luyện pitch: chế độ lớp và chấm mù (lab/pitch-goi-von.html)

- **Bật chế độ lớp:** trên máy chiếu, mở Phòng luyện pitch và bấm «👥 Chế độ lớp». Màn chiếu hiện mã phòng 6 ký tự và mã QR. Mỗi đội quét QR bằng một điện thoại, nhập tên đội, rồi giảng viên bấm «Duyệt». Mỗi đội là một quỹ 1 tỷ đồng ảo.
- **Rót vốn:** sau phần pitch của một đội, chọn đội đó và bấm «Mở rót vốn 60 giây». Các quỹ khác rót theo bậc 50 triệu, tối đa 500 triệu cho một đội, không rót cho chính mình. Bảng góp vốn và bảng xếp hạng cập nhật ngay trên màn chiếu.
- **Chấm mù (nghiên cứu):** mở rót vốn cho đội nào thì vòng chấm của đội đó cũng bắt đầu. Các quỹ khác chấm 6 tiêu chí, thang 1–5, cùng câu «ý định đầu tư». Giảng viên chấm trên máy riêng: mở đường dẫn trang quỹ, thêm `&gv=1`, nhập tên hiển thị như «GV 1». Màn chiếu chỉ hiện số phiếu đã nộp; đủ phiếu thì tự hiện trung bình, còn muốn xem sớm thì bấm «Mở điểm sớm». Rubric này chạy song song, không thay điểm lớp 4 × 2,5.
- **Cuối buổi:** bấm «Xuất CSV của buổi» (sổ góp vốn) và «Xuất CSV chấm điểm» trước khi đóng tab, vì máy chủ không lưu gì. Tính độ tin cậy giữa giảng viên và bạn học bằng `node scripts/research/do-tin-cay-pitch.mjs <tệp CSV chấm>`; cách đọc kết quả xem `docs/research/DO-TIN-CAY-PITCH.md`.
- **Hội đồng phản ứng và giọng đọc:** trong phần hỏi đáp, ba nhà đầu tư gật đầu, cau mày, nghiêng tới hay ghi chép theo bảng luật: thời gian trả lời, nút «Tự tin / Chưa chắc» đội tự bấm, và kết quả kiểm ba con số (đội nhập ở mục «Ba con số» trên màn chuẩn bị). Hội đồng không nghe, không chấm nội dung câu trả lời. Nút «Đọc câu hỏi» dùng giọng có sẵn của trình duyệt; máy không có giọng thì nút ẩn.
- **Lumina góp ý và nhánh nghiên cứu:** sau bảng tổng kết, Lumina nêu tối đa 3 góp ý theo luật (con số lệch, câu trả lời quá 1 phút, pitch quá 7 phút) và gợi ý 3 câu nên luyện lại. Lớp nào bật «ẩn giải thích» (cờ `explain_hidden` ở trang Giảng viên) và mở trang bằng `?lop=MÃ-LỚP` thì Lumina chỉ nói lời kết chung; đây là nhánh Lumina ẩn của nghiên cứu, cùng nhánh với game. CSV ghi cột `lumina` (`hien` hoặc `an`). Nhắc sinh viên rằng số liệu ẩn danh có thể dùng cho nghiên cứu về dạy học, theo phiếu đồng thuận của lớp.
- **Thử trước trên một máy:** mở `lab/pitch-goi-von.html?hoidong=1&kenh=local`, rồi mở đường dẫn trang quỹ (đã có sẵn `&kenh=local`) ở vài thẻ trình duyệt khác. Cách này không cần mạng.

## 9. Liên hệ & mã nguồn

- Mã nguồn: https://github.com/thuyhuongctu/BizOn
- Trang giới thiệu: https://thuyhuongctu.github.io/BizOn/gioi-thieu.html
- Liên hệ hợp tác: bricoleur@bizonland.com
