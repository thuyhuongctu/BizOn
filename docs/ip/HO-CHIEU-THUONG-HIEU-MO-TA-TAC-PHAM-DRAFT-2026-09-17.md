# Hộ Chiếu Thương Hiệu — bản mô tả tác phẩm (nháp, gửi INVESTIP soạn Tờ khai)

> **Đây không phải tư vấn pháp lý.** Bản nháp để chuyển cho INVESTIP (hoặc luật sư SHTT)
> lên thành Tờ khai/Cam đoan/GUQ chính thức, theo đúng khuôn mẫu đã dùng cho ba hồ sơ
> "Bizon" (nay đổi thành "Bật Nghiệp"), EnQuiz, We Create Tomorrow. Phần `[…]` cần hai
> tác giả tự chốt trước khi gửi.
>
> **Vì sao tách hồ sơ riêng khỏi "Bật Nghiệp":** kế hoạch soạn ngày 31/07/2026
> (`docs/bieu-mau-dang-ky-quyen-tac-gia.md`) từng gộp Hộ Chiếu Thương Hiệu vào chung
> một hồ sơ "chương trình máy tính" với game chính (mục 8 trong phần Nội dung). Theo
> quyết định ngày 17/09/2026, hai tác giả chọn tách riêng — hồ sơ "Bật Nghiệp" giờ chỉ
> mô tả game mô phỏng kinh doanh chính (6 chu kỳ), không còn nhắc tới Hộ Chiếu TH.

---

## 1. Tên tác phẩm

**Tên tiếng Việt:** Hộ Chiếu Thương Hiệu – Hệ thống phần mềm mô phỏng chiến lược quốc tế hóa doanh nghiệp

**Tên tiếng Anh:** Brand Passport: From Vietnam to the World — Business Internationalization Strategy Simulation Software

**Loại hình đăng ký:** Chương trình máy tính

## 2. Nêu tóm tắt về tác phẩm

**Chức năng:**

Chương trình mô phỏng chiến lược quốc tế hóa doanh nghiệp qua sáu quý kinh doanh, cho
phép người chơi tiếp quản một trong bốn doanh nghiệp Việt Nam giả tưởng và đưa thương
hiệu ra sáu thị trường quốc tế giả tưởng. Mỗi quý, người chơi mua thông tin thị trường
từ sáu nguồn có chi phí, độ chính xác và độ thiên lệch khác nhau ("sương mù thông
tin"), chọn ưu tiên chiến lược, chọn một trong ba phương thức thâm nhập thị trường
(nền tảng số, xuất khẩu trực tiếp, đối tác địa phương), chọn mức ngân sách vận hành,
rồi xử lý sự kiện phát sinh. Chương trình tính điểm tổng theo năm chiều (lợi nhuận, uy
tín, năng lực, thích ứng, bền vững), ghi nhận "dấu chân quyết định" ảnh hưởng tới các
quý sau, và cho phép thua sớm khi cạn tiền hai quý liên tiếp hoặc uy tín rơi xuống mức
khủng hoảng. Kết thúc ván, chương trình đưa ra bảng điểm chi tiết, câu hỏi tổng kết để
thảo luận trên lớp, và chức năng tùy chọn nộp kết quả cho giảng viên theo mã lớp.

**Thành phần:**

Chương trình gồm: engine chọn phương thức thâm nhập thị trường xác định (tính điểm
tương thích theo tám chiều: kiểm soát, tốc độ, học hỏi, hiệu quả vốn, mức tương thích
rủi ro, bảo vệ tri thức, mức độ gắn kết địa phương, khả năng mở rộng số); bộ dữ liệu
bốn doanh nghiệp, sáu thị trường, ba phương thức thâm nhập, sáu nguồn thông tin, năm
mức ưu tiên chiến lược và ba mức ngân sách; bộ tạo hồ sơ ẩn của thị trường theo hạt
giống ngẫu nhiên (mỗi ván một bộ điều kiện thị trường riêng, có thể cố định qua tham
số `?seed=` để cả lớp chơi cùng một bộ điều kiện); ban cố vấn năm nhân vật với quan
điểm khác nhau; hệ thống tính điểm và xếp hạng năm chiều; chức năng ghi nhật ký hành
trình và nộp kết quả theo mã lớp.

**Cấu tạo:**

Chương trình được cấu tạo theo kiến trúc trang web một tệp, gồm phần giao diện (màn
giới thiệu và chọn doanh nghiệp, màn chơi theo từng quý, màn kết thúc và bảng điểm) và
phần mã nguồn (engine chọn phương thức thâm nhập dùng chung với mô-đun AIBIS của hệ
sinh thái BizOn, bộ sinh hồ sơ ẩn thị trường theo hạt giống, bộ tính điểm năm chiều, bộ
xử lý sự kiện và ngân sách theo quý).

**Ngôn ngữ lập trình:** JavaScript, HTML, CSS

**Sử dụng mã nguồn mở để sáng tạo chương trình máy tính:** Không sử dụng (không có
thư viện/CDN bên thứ ba nào được nạp trong trang; toàn bộ mã nguồn do nhóm tác giả tự
viết)

**Sử dụng hệ thống trí tuệ nhân tạo trong quá trình sáng tạo tác phẩm:** theo đúng cách
khai của hồ sơ "Bật Nghiệp"/EnQuiz/We Create Tomorrow — có bản mô tả và cam đoan kèm
theo (điền theo hướng dẫn chung).

## 3. Ngày hoàn thành tác phẩm

> `[…/…/2026]` — **cần Cô và Thầy tự chốt**, không dùng ngày AI đề xuất làm bằng cuối.
>
> Gợi ý đối chiếu (tự xác nhận lại qua trang "History" của từng tệp trên GitHub, theo
> đúng cách đã làm với Bến Phù Sa):
> - Game ra mắt (nội dung game chính, 4 doanh nghiệp, 6 thị trường, đủ luật chơi):
>   commit `e4a1ed0`, 30/07/2026.
> - Thay đổi kỹ thuật gần nhất trong mã nguồn game (nối engine AIBIS tất định): commit
>   `d43dfa1`, 05/08/2026.
> - Thay đổi gần nhất chạm vào trang (chỉ đổi nhạc nền, không đổi luật chơi/engine):
>   commit `78598b2`, 13/09/2026.

## 4. Ngày công bố và nơi công bố

| Mục | Nội dung |
|---|---|
| Đã công bố | Có |
| Ngày công bố | *(khớp với Ngày hoàn thành đã chốt ở mục 3, theo đúng cách ba hồ sơ kia đã khai)* |
| Hình thức công bố | Đăng tải công khai trên mạng Internet |
| Nơi công bố | `https://thuyhuongctu.github.io/BizOn/brand-passport.html` |
| Quốc gia công bố | Việt Nam |

## 5. Thông tin tác giả / chủ sở hữu quyền tác giả

Giống hồ sơ "Bật Nghiệp" — Đỗ Thùy Hương và Phan Anh Tú, đồng tác giả đồng thời đồng
chủ sở hữu quyền tác giả, tỷ lệ đồng sở hữu theo đúng tỷ lệ đã chốt cho các hồ sơ khác
(xem cảnh báo mục 6 bên dưới — áp dụng y hệt).

## 6. Bên được ủy quyền nộp hồ sơ

Giống ba hồ sơ kia — CÔNG TY CỔ PHẦN SỞ HỮU CÔNG NGHIỆP INVESTIP (nếu vẫn dùng INVESTIP
làm hồ sơ này).

---

## ⚠️ Lưu ý khi gửi INVESTIP lên Tờ khai chính thức

1. **Không lặp lại lỗi đã gặp ở hồ sơ "Bizon" ban đầu** — phần "Đường link địa chỉ
   trên trang thông tin điện tử" phải là
   `https://thuyhuongctu.github.io/BizOn/brand-passport.html`, không phải link của
   game khác trong cùng hệ sinh thái (đã xảy ra ở hồ sơ We Create Tomorrow: link ghi
   nhầm sang BizOn).
2. **Điểm cần lưu ý về nơi công tác** (Điều 39 Luật SHTT) áp dụng y hệt như đã nêu ở
   ba hồ sơ kia — Cô công tác tại VLUTE, Thầy công tác tại Trường Kinh tế ĐHCT; nên
   xem lại quyết định đã chốt cho EnQuiz (`docs` trong repo `thuyhuongctu/enquiz`,
   file `CAM_KET_TAC_GIA.md`) có áp dụng chung cho cả bốn tác phẩm hay cần lặp lại
   riêng cho từng hồ sơ.
3. Mô-đun "engine chọn phương thức thâm nhập" (`js/aibis/entry-mode-engine.js`,
   `entry-mode-models.js`) dùng chung với ứng dụng nội bộ khác của BizOn
   (`app/aibis`) — vẫn là mã nguồn tự viết của cùng nhóm tác giả, không phải mã của
   bên thứ ba, nhưng nên khai rõ nếu luật sư hỏi tại sao mã nguồn "dùng chung" giữa
   hai tác phẩm.

---

*Soạn 17/09/2026, theo yêu cầu đối chiếu cùng lúc với việc sửa hồ sơ "Bật Nghiệp".
Không phải tư vấn pháp lý — các điểm pháp lý do luật sư SHTT/INVESTIP xác nhận.*
