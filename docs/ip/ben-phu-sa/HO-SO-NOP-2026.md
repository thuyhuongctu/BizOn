# Hồ sơ nộp — Bản quyền tác giả "BẾN PHÙ SA"

> **Bản nộp sạch**, theo đúng thứ tự checklist luật sư (6 mục). Nội dung rút từ `HO-SO-QUYEN-TAC-GIA-2026.md` (bản làm việc, có phần lý do/quyết định/rủi ro — xem file đó nếu cần đối chiếu).
>
> **Các ô cá nhân để TRỐNG** — Hương tự điền trên máy mình, không đưa dữ liệu cá nhân lên repo công khai.

---

## 1. Tên tác phẩm + Bản mô tả

**Tên tác phẩm:** PHẦN MỀM TRÒ CHƠI MÔ PHỎNG THỊ TRƯỜNG "BẾN PHÙ SA" (bản `v1.0`)
**Tên tiếng Anh** (nếu luật sư yêu cầu): *Ben Phu Sa — An Explore-Exploit Street-Market Simulation Game*
**Loại hình đăng ký:** Chương trình máy tính. *(Có thể cân nhắc đăng ký bổ sung "tác phẩm mỹ thuật ứng dụng" cho bộ hình ảnh nhân vật/bối cảnh — hỏi luật sư về chi phí trước khi quyết định.)*

**Mục đích:** Trò chơi mô phỏng thị trường chạy trên trình duyệt, dạy tư duy **thăm dò–khai thác (explore/exploit)** trong khởi sự kinh doanh ẩm thực đường phố, phục vụ giảng dạy khởi sự kinh doanh bậc đại học. Người học vào vai nhà sáng lập ở thị trấn giả tưởng **Bến Phù Sa** (cảm hứng chợ nổi miền Tây), học cách thử nghiệm nhỏ để dò thị trường rồi nhân rộng đúng lúc.

**Nội dung:** Qua **5 tuần**, mỗi tuần người chơi chọn **Phương thức** (⛵ ghe hàng bông ×3 doanh thu · 🧺 gánh hàng rong ×1 nhiều thông tin · 📋 khảo sát chợ), **Món hàng** (bánh mì / chè bưởi / cà phê phin — mỗi món một mô hình vận hành) và **Địa điểm** (6 khu, mỗi khu một chân dung khách). Engine mô phỏng nhu cầu ẩn theo cặp món×địa điểm (sinh ngẫu nhiên có seed nên mỗi ván một thị trường riêng), hệ số tuần, luật chia khách khi đụng độ đối thủ, và 3 AI đối thủ mỗi "nhà" một chiến lược. Kết thúc: xếp hạng 4 đội + hiệu suất so với kịch bản hoàn hảo + câu hỏi tổng kết để debrief; tùy chọn nộp kết quả cho giảng viên. Phần mềm gồm engine mô phỏng; giao diện song ngữ Việt–Anh; hệ thống ghi nhật ký quyết định.

**Ý nghĩa:** Giáo dục (đưa mô-típ thăm dò–khai thác và bối cảnh kinh tế đường phố Việt Nam vào lớp học); nghiên cứu (dữ liệu quyết định theo quy trình đồng thuận + phê duyệt đạo đức); văn hóa (chất liệu thị giác, ngôn ngữ miền Tây Nam Bộ). Bối cảnh/nhân vật/dữ liệu/giao diện/lời thoại đều nguyên bản, không dùng tài liệu hay cấu trúc của bất kỳ mô phỏng thương mại nào.

---

## 2. Ngày hoàn thành tác phẩm

> **✅ SỬA 19/09/2026:** ngày hoàn thành trước đây ghi 08/08/2026 (commit `b387b3b`) — **sau** ngày công bố đã chốt ở mục 3 (05/08/2026), một mâu thuẫn logic (không thể công bố trước khi hoàn thành). Hương chọn đổi ngày hoàn thành về **05/08/2026** để khớp với ngày công bố, thay vì đẩy ngày công bố muộn hơn. Đã điền vào "1. Tờ khai" và "2. Bản cam đoan" trong gói nộp.

Ngày: **05/08/2026**
Gắn với commit: **`ead6e2d`** (#357 "Bến Phù Sa: xác lập tác phẩm nguyên bản (sửa ghi công HBP) + hồ sơ IP") — cùng ngày và cùng cơ sở với ngày công bố ở mục 3.

✅ Hương đã tự xác nhận hash/ngày qua trang "History for ben-phu-sa.html" trên GitHub.

⚠️ **Lưu ý cho luật sư:** commit `b387b3b` (08/08/2026, #396 "mở khoá Đội Phù Sa 2 người") và lần chơi thử đầu-cuối xác nhận `v1.0` chạy trọn 5 tuần (24/08/2026) đều **sau** ngày hoàn thành mới chọn — đây là các thay đổi/kiểm thử bổ sung sau mốc 05/08, không phải bằng chứng phủ nhận việc tác phẩm đã ở dạng hoàn thiện tại 05/08. Nên cho luật sư xem qua nếu có thể trước khi ký chính thức.

---

## 3. Ngày công bố / nơi công bố (nếu có)

**Khai dự kiến trước đây: "Chưa công bố."** — ⚠️ **KHÔNG CÒN ĐÚNG (rà lại GitHub lần 2, 18/09/2026).**

Lý do ban đầu (08/09/2026) coi là "chưa công bố": game chỉ truy cập được về mặt kỹ thuật qua GitHub Pages, chưa được quảng bá ra công chúng như một sản phẩm độc lập.

⚠️ **Rà lại lần 1 (17/09/2026)** đã phát hiện: cùng PR #416 (08/09/2026) viết dòng "chưa công bố" cũng chính là PR thêm Bến Phù Sa làm nút CTA chính trên trang chủ ("🛶 Bắt đầu với Bến Phù Sa →"); và game đã được gắn nhãn "BẬC 1 · BẮT ĐẦU Ở ĐÂY" ở `games.html` từ sớm hơn — 05/08/2026.

⚠️⚠️ **Rà lại lần 2 (18/09/2026) đi xa hơn về quá khứ, phát hiện việc quảng bá thật ra bắt đầu sớm hơn nhiều — ngay từ ngày ra đời của game:**

- **30/07/2026, commit `fb36c2c`** (game đầu tiên, lúc đó tên "Food Truck Challenge"): cùng một commit đã (1) thêm thẻ game mới vào `games.html` với nhãn **"MỚI · CHIẾN LƯỢC 5 TUẦN"**, (2) thêm **liên kết ở chân trang dùng chung toàn site** (`js/site-footer.js` — vẫn còn liên kết này tới hôm nay, dưới tên "Gánh Hàng Khởi Nghiệp"), và (3) thêm **thẻ Open Graph** (`og:title`, `og:description`...) — tức là được chuẩn bị sẵn cho chia sẻ mạng xã hội. Đây không phải "lên web nhưng chưa ai biết" — đây là commit **chủ động đưa game vào điều hướng công khai của toàn bộ trang** ngay từ đầu.
- Kèm theo commit "Deploy BizOn Bật Nghiệp ..." xuất hiện **ngay sau mỗi commit nội dung** kể từ đó — xác nhận site tự động triển khai lên GitHub Pages liên tục, không có khoảng dừng.
- **Lưu ý phụ, không phải điểm chặn nhưng nên biết:** bản 30/07–05/08/2026 có tên "Food Truck Challenge", công khai ghi là mô phỏng theo *The Food Truck Challenge* của Harvard Business Publishing/Forio (Michael A. Roberto) — một mối lo về **tác phẩm phái sinh**. Commit `ead6e2d` (05/08/2026) đổi tên, đổi biểu tượng và tách bản sắc khỏi hình ảnh "food truck", nhưng chính commit đó vẫn ghi "giữ nguyên... dòng ghi công HBP «The Food Truck Challenge» (công bố nguồn học thuật, **bắt buộc giữ**)" tại thời điểm đó. Dòng ghi công này **không còn trong `ben-phu-sa.html` hiện tại** (đã kiểm tra 18/09/2026, `grep` không ra kết quả) — nhưng việc nó từng tồn tại, từng được coi là "bắt buộc giữ", rồi sau đó biến mất, là chi tiết luật sư nên biết khi đánh giá "tác phẩm độc lập" hay "tác phẩm phái sinh đã chỉnh sửa".

⚠️ *Lưu ý cho luật sư trước khi khai chính thức:* với các chứng cứ trên, **"Đã công bố" gần như chắc chắn đúng hơn "Chưa công bố"**. Ba mốc ngày ứng với ba mức độ quảng bá khác nhau, từ sớm nhất tới muộn nhất:
1. **30/07/2026** — lần đầu vào điều hướng công khai toàn site (chân trang + thẻ Arcade "MỚI" + OG tags), nhưng lúc đó vẫn mang tên/ghi công "Food Truck Challenge" (giai đoạn còn vướng câu hỏi phái sinh).
2. **05/08/2026** — đổi tên, đổi biểu tượng, gắn nhãn "Bậc 1 · Bắt đầu ở đây" — thời điểm được xem là "tác phẩm nguyên bản" theo quyết định nội bộ, và cũng là mốc quảng bá rõ ràng.
3. **08/09/2026** — thêm CTA trang chủ chính, quảng bá mạnh nhất.

Không tự chọn ngày nào trong 3 mốc trên khi nộp — cần luật sư xác nhận cả (a) có tính giai đoạn 30/07–05/08 là "công bố của chính tác phẩm này" hay không (do tên/ghi công lúc đó khác), và (b) chọn ngày công bố chính thức trong 3 mốc.

---

**✅ CHỐT 18/09/2026:** Hương chọn **05/08/2026** làm ngày công bố chính thức (mốc #2 ở trên — thời điểm tác phẩm mang tên/hình ảnh "Bến Phù Sa" hiện tại, tránh giai đoạn 30/07–05/08 còn vướng ghi công HBP/Forio). Đã điền vào file "1. Tờ khai" trong gói nộp. Đây là lựa chọn của chủ sở hữu, không phải xác nhận của luật sư — vẫn nên cho luật sư xem qua trước khi ký chính thức nếu có thể, nhưng không còn là điều kiện chặn để gửi hồ sơ.

---

## 4. Thông tin tác giả

| | Đồng tác giả 1 | Đồng tác giả 2 |
|---|---|---|
| Họ tên | Đỗ Thùy Hương | Phan Anh Tú |
| CCCD | ……… *(điền, không đưa lên repo)* | ……… *(điền, không đưa lên repo)* |
| Ngày sinh | ……… | ……… |
| Địa chỉ | ……… | ……… |
| SĐT | ……… | ……… |

**Kèm nộp:** bản sao y chứng thực CCCD của cả hai đồng tác giả (nộp bản giấy/scan riêng, không đưa lên repo).

---

## 5. Thông tin chủ sở hữu

Chủ sở hữu: **hai cá nhân đồng sở hữu** (Đỗ Thùy Hương + Phan Anh Tú), không phải công ty — không cần Giấy chứng nhận đăng ký kinh doanh.

**Tỷ lệ sở hữu:** 50% / 50% (Đỗ Thùy Hương / Phan Anh Tú) — **cả hai đồng tác giả đã trao đổi và thống nhất**. ⚠️ Vẫn phải khớp với Thỏa thuận đồng sở hữu **đã ký bằng văn bản** trước khi nộp (chưa ký — xem `../BIZON_DRAFT_COOWNERSHIP_AGREEMENT_HUONG_TU_2026-08-03.md`).

---

## 6. Tác phẩm nộp kèm

**(a) Bản chạy chương trình:** 02 đĩa CD/USB chứa bản build `ben-phu-sa.html` *(xác nhận định dạng với luật sư — checklist gốc ghi "đĩa mềm", nay không còn phổ biến)*.

**(b) Giao diện in ra giấy:** 3 ảnh màn hình chính — xem [`anh-giao-dien/`](anh-giao-dien/):
- `01-man-mo-dau.png` — màn mở đầu
- `02-vong-quyet-dinh.png` — vòng quyết định
- `03-ket-qua.png` — màn kết quả

✅ Cả 3 ảnh đã cắt gọn đúng khung game (24/08/2026) — không còn thanh điều hướng/chân trang/nút "Vũ trụ" dùng chung của site.

~~⚠️ Cần chụp lại `01-man-mo-dau.png` trước khi in — màn mở đầu hiển thị học hàm cũ, không khớp giao diện hiện tại.~~

**ĐÍNH CHÍNH 17/09/2026:** phát hiện ban đầu (dựa trên PR #453, "Thầy Tú lên Giáo sư") **sai** — Thầy Tú **chưa** lên Giáo sư, vẫn là Phó Giáo sư. PR #453 tự nó ghi sai học hàm; đã phục hồi lại "PGS.TS. Phan Anh Tú" trên toàn bộ 11 trang bị ảnh hưởng (kể cả `ben-phu-sa.html`). Ảnh `01-man-mo-dau.png` (chụp 24/08/2026, ghi "PGS.TS.") **vẫn đúng**, không cần chụp lại vì lý do này.

✅ Đã gộp thành bản in [`anh-giao-dien/ben-phu-sa-giao-dien-chuong-trinh.pdf`](anh-giao-dien/ben-phu-sa-giao-dien-chuong-trinh.pdf) (24/08/2026) — 3 trang khổ A4, mỗi trang một ảnh kèm chú thích "Hình N." và số trang, sẵn sàng in nộp.

**(c) Mã nguồn in 15–20 trang:** bản trích đặc trưng — xem [`ma-nguon-dac-trung/ben-phu-sa-ma-nguon-dac-trung.txt`](ma-nguon-dac-trung/ben-phu-sa-ma-nguon-dac-trung.txt) (536 dòng, chỉ gồm engine riêng của Bến Phù Sa, đã loại hạ tầng dùng chung).

⚠️ **Quyết định cần luật sư xác nhận trước khi in:** bản trích trong repo đã **lược các hằng số cân bằng** (đáp án game — luật chia khách, cá tính món hàng, dải nhu cầu, kế hoạch AI đối thủ) vì đây là bản công khai. Bản **nộp cho Cục Bản quyền** (không công bố ra công chúng) nhiều khả năng nên dùng **mã đầy đủ** (lấy trực tiếp từ `ben-phu-sa.html`) thay vì bản đã lược — hỏi luật sư xác nhận trước khi in.

---

*Nguồn: hai file Word "Bến Phù Sa — Hồ sơ bản quyền và nhãn hiệu" và "Thông tin cần để soạn hồ sơ bản quyền tác giả" (nhóm cung cấp, 20/08/2026). Đối chiếu chi tiết + lý do quyết định: xem `HO-SO-QUYEN-TAC-GIA-2026.md`. Không phải tư vấn pháp lý — các điểm pháp lý do luật sư SHTT xác nhận.*
