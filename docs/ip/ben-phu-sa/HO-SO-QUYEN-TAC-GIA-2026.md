# Hồ sơ bản quyền tác giả — Game "BẾN PHÙ SA"

> **Tài liệu làm việc nội bộ.** Soạn theo checklist của luật sư (bản gốc: hai file Word do nhóm cung cấp, 20/08/2026). Đưa vào repo để có bản có version.
>
> **Chỉ phần QUYỀN TÁC GIẢ nằm trong repo.** Quyền tác giả phát sinh tự động nên công bố bản chuẩn bị không tạo rủi ro. **Phần NHÃN HIỆU (phương án nộp, nhóm Nice, mốc thời gian nộp) đã tách khỏi repo công khai** — Việt Nam theo nguyên tắc *nộp trước được trước*, công bố kế hoạch nộp nhãn trước khi nộp là tự tạo cơ hội cho người khác nộp chặn. Phần nhãn hiệu giữ ngoài repo, chỉ đưa vào sau khi đã có **số đơn**.
>
> **Các ô cá nhân (CCCD, ngày sinh, địa chỉ, SĐT, hash commit) để TRỐNG — đồng tác giả tự điền trên máy mình và KHÔNG đưa dữ liệu cá nhân lên repo công khai.**

---

## ⚠️ Trạng thái đã chốt (đọc trước)

**1. Khớp mô tả ↔ build — đã chọn hướng (a).** Bản build đang chạy (`ben-phu-sa.html`) là game **thăm dò–khai thác thị trường** (Phương thức × Món × Địa điểm, 5 tuần), *không* phải cơ chế chính thức hoá hộ kinh doanh (đăng ký/vay/thu giữ). Nhóm đã xác nhận qua mã + ảnh giao diện. **Quyết định: đăng ký bản build hiện tại như `v1.0`, dùng bản mô tả đã hiệu chỉnh ở Phần B.** Lý do chiến lược: hồ sơ bản quyền có *ngày hoàn thành sớm* là bằng chứng mốc thời gian cho vấn đề xung đột lợi ích MekSim; chờ hoàn thiện cơ chế chính thức hoá sẽ lùi mốc đó vô thời hạn. Phiên bản chính thức hoá về sau đăng ký bổ sung như `v2` hoặc **tác phẩm phái sinh**.

> **Điều kiện của hướng (a) — Hương tự xác nhận:** game `v1.0` phải **chơi được đầu-cuối thật sự** (đủ 5 tuần → ra bảng kết quả hoàn chỉnh). Hương **tự chơi thử một lượt** để xác nhận trước khi chốt ngày hoàn thành. Công cụ AI không xác nhận thay điểm này.
>
> ✅ **Đã xác nhận — 24/08/2026:** Hương tự chơi thử đầu-cuối, đủ 5 tuần, ra bảng kết quả hoàn chỉnh. Điều kiện hướng (a) đã thoả. *(Lưu ý: đây là ngày Hương xác nhận điều kiện chơi được — khác với "Ngày hoàn thành tác phẩm" ở mục A.2, vẫn giữ nguyên `08/08/2026` theo ngày commit, không đổi theo ngày xác nhận này.)*

**2. Vênh ở trang công khai — cần sửa qua pipeline QA → promote.** Bản mô tả Phần B (bản gốc của nhóm) được viết dựa trên *chính phần giới thiệu công khai* — hiện nằm ở **`universe.html` dòng 319**: *"Ở lại phi chính thức hay bước lên chính danh. Đăng ký hay không, vay nóng hay vay ngân hàng, chịu rủi ro thu giữ hàng…"*. Đây là **mô tả một game chưa tồn tại**. Dù chọn hướng nào, copy công khai này cũng phải sửa cho khớp build. Đề xuất copy thay thế ở cuối tài liệu (§Copy-cong-khai). **Không sửa trực tiếp trang public** — đổi qua pipeline QA → promote như mọi thay đổi trang công khai.

---

## Tóm tắt các quyết định cần đưa ra trước khi nộp

1. **Ký thỏa thuận đồng sở hữu (17 điều) TRƯỚC** khi nộp — thỏa thuận ghi rõ Bến Phù Sa (mã nguồn, hình ảnh, âm thanh) nằm trong tài sản chung, theo **tỷ lệ đã chốt**.
2. **Chốt phạm vi tác phẩm:** đăng ký Bến Phù Sa như **chương trình máy tính độc lập** (khuyến nghị) hay như một phần của BizOn Bật Nghiệp — hai lựa chọn dẫn đến bộ mã nguồn in kèm khác nhau.
3. **Chốt ngày hoàn thành gắn với một commit cụ thể.** Hương **tự chạy `git log`** để lấy hash — không dùng hash do công cụ AI báo cáo.
4. *(Quyết định nhãn hiệu — xử lý ở tài liệu riêng ngoài repo; không đặt ở đây vì lý do nộp-trước-được-trước.)*

---

## Phần A — Thông tin hồ sơ bản quyền tác giả (theo checklist luật sư)

| Mục | Nội dung |
|---|---|
| **1. Tên tác phẩm** | PHẦN MỀM TRÒ CHƠI MÔ PHỎNG THỊ TRƯỜNG "BẾN PHÙ SA" (bản `v1.0`).<br>Tên tiếng Anh (nếu luật sư yêu cầu): *Ben Phu Sa — An Explore-Exploit Street-Market Simulation Game*.<br>Nên đăng ký loại hình **"chương trình máy tính"**. Muốn bảo hộ thêm phần mỹ thuật (nhân vật, bối cảnh đất sét/xuồng ghe) có thể cân nhắc đăng ký bổ sung **"tác phẩm mỹ thuật ứng dụng"** cho bộ hình ảnh — hỏi luật sư về chi phí. |
| **2. Ngày hoàn thành** | Ngày: **08/08/2026** · Gắn với commit: **`b387b3b61e6868f7fb78c41c80cec9eb965871a0`** (#396 "mở khoá Đội Phù Sa 2 người" — commit gần nhất sửa `ben-phu-sa.html`).<br>✅ **Hash/ngày đã được Hương tự xác nhận** — xem trực tiếp trang "History for ben-phu-sa.html" trên GitHub (`https://github.com/thuyhuongctu/BizOn/commits/main/ben-phu-sa.html`): commit gần nhất là #396 (08/08/2026), lịch sử file dừng ở #377 (05/08/2026, đổi tên `food-truck.html`→`ben-phu-sa.html`) — khớp đúng số AI báo cáo. Không còn là số "AI điền tạm" nữa.<br>⚠️ **Vẫn còn thiếu điều kiện khác của hướng (a):** Hương phải **tự chơi thử một lượt thật** (đủ 5 tuần ra bảng kết quả hoàn chỉnh) trước khi chốt — đây là điểm riêng, xác nhận hash không thay thế được. |
| **3. Ngày công bố / nơi công bố** | **Hương xác nhận: chưa công bố chính thức** — game vẫn nằm trong hệ sinh thái nội bộ BizOn, chưa được công bố/quảng bá ra công chúng như một sản phẩm độc lập. Khai mục này là **"chưa công bố"**.<br>⚠️ **Lưu ý kỹ thuật cần luật sư xác nhận cách khai:** `ben-phu-sa.html` **có thể truy cập được về mặt kỹ thuật** tại `https://thuyhuongctu.github.io/BizOn/ben-phu-sa.html` — repo GitHub công khai, GitHub Pages tự động deploy mỗi lần push lên `main` (từ commit đầu tiên tạo file, 04/08/2026, dưới tên `food-truck.html`), không có `robots.txt` chặn index, không có tường xác thực. Trang được dẫn link "Vào chơi →" từ `universe.html`. Luật Sở hữu trí tuệ định nghĩa "công bố" là hành vi *đưa tác phẩm đến công chúng*, không chỉ là khả năng kỹ thuật truy cập được — nhưng ranh giới giữa "triển khai nội bộ chưa quảng bá" và "đã công bố" nên hỏi luật sư xác nhận trước khi khai, để tránh khai sai ảnh hưởng hiệu lực giấy chứng nhận. |
| **4. Thông tin tác giả** | Đồng tác giả 1: **Đỗ Thùy Hương** — CCCD: ……… *(Hương điền)*.<br>Đồng tác giả 2: **Phan Anh Tú** — CCCD: ……… *(Hương điền)*.<br>Kèm bản sao y chứng thực CCCD của cả hai. Bốn trường cá nhân (ngày sinh, CCCD, địa chỉ, SĐT) thu thập một lần dùng cho cả bản quyền lẫn nhãn hiệu. **Không đưa lên repo.** |
| **5. Thông tin chủ sở hữu** | Chủ sở hữu là **hai cá nhân đồng sở hữu** (không phải công ty), theo cấu trúc khuyến nghị cho viên chức: đồng sở hữu cá nhân + hợp đồng li-xăng khi khai thác thương mại. Không cần Giấy chứng nhận đăng ký kinh doanh.<br>**Tỷ lệ sở hữu: 50% / 50%** (Đỗ Thùy Hương / Phan Anh Tú) — **cả hai đồng tác giả đã trao đổi và thống nhất**, không còn là xác nhận một chiều. ⚠️ Vẫn phải khớp với thỏa thuận đồng sở hữu **đã ký bằng văn bản** — thỏa thuận hiện mới ở dạng nháp, **chưa ký**, phải ký chính thức trước khi nộp. |
| **6. Tài liệu tác phẩm nộp kèm** | (a) **Bản chạy chương trình:** checklist ghi "02 đĩa mềm" — thực tế nay thường nộp **02 đĩa CD/USB** chứa bản build; xác nhận định dạng với luật sư.<br>(b) **Giao diện in ra giấy:** ảnh các màn hình chính — xem `anh-giao-dien/` (mở đầu · vòng quyết định · kết quả). **Bắt buộc loại logo/hình bên thứ ba;** kiểm font có giấy phép, icon thư viện ngoài, ảnh nền nếu tạo bằng AI thì rà điều khoản thương mại.<br>(c) **Mã nguồn in 15–20 trang:** bản trích đặc trưng — xem `ma-nguon-dac-trung/`. Chỉ gồm engine mô phỏng riêng của Bến Phù Sa; đã loại hạ tầng dùng chung. **Hai điểm Hương tự xác minh trước khi nộp — xem §Tự-xác-minh.** |

---

## Phần B — Bản mô tả tác phẩm (bản `v1.0`, khớp build — hướng (a))

> Đây là bản mô tả **để nộp** (khớp `ben-phu-sa.html` đang chạy). Bản gốc do nhóm soạn (mô tả cơ chế chính thức hoá) **được giữ ở cuối làm ghi chú lịch sử** — không dùng để nộp.

**1. Mục đích:** trò chơi mô phỏng thị trường chạy trên trình duyệt, dạy tư duy **thăm dò–khai thác (explore/exploit)** trong khởi sự kinh doanh ẩm thực đường phố, phục vụ giảng dạy khởi sự kinh doanh bậc đại học. Người học vào vai nhà sáng lập ở thị trấn giả tưởng **Bến Phù Sa** (cảm hứng chợ nổi miền Tây), học cách **thử nghiệm nhỏ để dò thị trường rồi nhân rộng đúng lúc**.

**2. Nội dung:** qua **5 tuần**, mỗi tuần chọn **Phương thức** (⛵ ghe hàng bông ×3 doanh thu · 🧺 gánh hàng rong ×1 nhiều thông tin · 📋 khảo sát chợ), **Món hàng** (bánh mì / chè bưởi / cà phê phin — mỗi món một mô hình vận hành) và **Địa điểm** (6 khu, mỗi khu một chân dung khách). Engine mô phỏng **nhu cầu ẩn** theo cặp món×địa điểm (sinh ngẫu nhiên có seed nên mỗi ván một thị trường riêng), **hệ số tuần**, **luật chia khách khi đụng độ** đối thủ, và **3 AI đối thủ** mỗi "nhà" một chiến lược. Kết thúc: xếp hạng 4 đội + **hiệu suất so với kịch bản hoàn hảo** + câu hỏi tổng kết để debrief; tùy chọn nộp kết quả cho giảng viên. Nhật ký quyết định mỗi tuần phục vụ thảo luận lớp. Phần mềm gồm engine mô phỏng; giao diện song ngữ Việt–Anh; hệ thống ghi nhật ký quyết định.

**3. Ý nghĩa:** giáo dục (đưa mô-típ thăm dò–khai thác và bối cảnh kinh tế đường phố Việt Nam vào lớp học); nghiên cứu (dữ liệu quyết định theo quy trình đồng thuận + phê duyệt đạo đức); văn hóa (chất liệu thị giác, ngôn ngữ miền Tây Nam Bộ). **Bối cảnh/nhân vật/dữ liệu/giao diện/lời thoại đều nguyên bản**, không dùng tài liệu hay cấu trúc của bất kỳ mô phỏng thương mại nào (ghi chú này đã in ngay trên trang game).

---

## Phần D — Tách Bến Phù Sa thành game độc lập: trình tự khuyến nghị

1. **Pháp lý trước:** ký thỏa thuận đồng sở hữu; ghi rõ Bến Phù Sa (mã nguồn, hình ảnh, âm thanh) thuộc tài sản chung theo tỷ lệ đã chốt.
2. **Chốt phiên bản:** xác nhận game `v1.0` chơi được đầu-cuối (Hương tự chơi thử); Hương tự lấy hash commit bằng `git log`.
3. **Nộp bản quyền tác giả** cho phần mềm (Phần A–B).
4. **Nhãn hiệu:** xử lý theo tài liệu riêng ngoài repo (tra cứu + nộp). *Chi tiết không đặt trong repo công khai.*
5. **Tách kỹ thuật:** nếu tách repo/tách trang, làm **sau** khi đã chốt hash để mốc thời gian IP không bị xáo trộn; mọi thay đổi trang public đi qua pipeline **QA → promote**, không sửa trực tiếp.

### Ba điểm rủi ro
- **Xung đột lợi ích MekSim:** sản phẩm độc lập càng làm rõ vùng chồng lấn chức năng với MekSim Lab. Hồ sơ bản quyền (ngày + commit hash) là bằng chứng mốc thời gian Bến Phù Sa ra đời độc lập — nhưng cũng là lý do **Thầy Tú cần hoàn tất khai báo xung đột lợi ích trước khi thương mại hóa**. *(Đây là lý do chính chọn hướng (a): khóa mốc thời gian sớm.)*
- **Trùng với Harvard Food Truck Challenge:** chỉ trùng **ý tưởng cơ chế** (không được bảo hộ bản quyền) → không cản đăng ký; bản mô tả nhấn **bối cảnh/nhân vật/dữ liệu Việt Nam nguyên bản** làm điểm khác biệt (đối chiếu `../BEN-PHU-SA-CHINH-DANH-HOA-VA-KHAC-BIET-HBP-DRAFT-2026-08-04.md`).
- **Nội dung do AI tạo:** nếu hình ảnh trong game (đất sét, xuồng ghe) tạo bằng AI, hỏi luật sư cách khai trong hồ sơ — phạm vi bảo hộ nội dung AI chưa rõ, và ảnh giao diện nộp kèm sẽ chứa các hình đó.

---

## §Tự-xác-minh — Hai điểm Hương tự kiểm trước khi gộp #413

Theo nguyên tắc *không dựa vào khẳng định của công cụ AI cho hồ sơ công khai*, hai điểm sau **Hương tự chạy lệnh xác minh**, không lấy kết quả công cụ báo làm bằng:

1. **IB-CI = 0 trong bản trích mã.** Chạy: `grep -ni "IB-CI\|IBCI\|ib_ci" docs/ip/ben-phu-sa/ma-nguon-dac-trung/*.txt`. Kỳ vọng: 0 dòng. Nếu ra >0 → gỡ khỏi bản trích trước khi nộp.
2. **Không in tham số ẩn (đáp án game) ra hồ sơ.** ⚠️ **Đính chính khẳng định trước:** kiểm lại cho thấy bản trích *có* chứa nội dung tiết lộ chiến lược — **luật chia khách `share(n)=1/(1+0.4(n−1))`**, **cá tính món hàng** (`+15%` / `25%→−12%` / `+18%→−7%`), **dải nhu cầu** `1.0–3.4` và **hệ số tuần** `0.8–1.25`, cùng **kế hoạch 5 tuần của 3 AI đối thủ**. (Bảng nhu cầu `D` thì sinh ngẫu nhiên mỗi ván nên không có đáp án cố định.) Các hằng số này **cũng đang công khai trong `ben-phu-sa.html`** (bản web) rồi.
   - **Hai bản, hai chế độ (đừng lẫn):**
     - **Bản trong repo (công khai):** lược hằng số là **đúng** — đã áp dụng (xem đầu tệp `ma-nguon-dac-trung/…txt`, mục "ĐÃ LƯỢC"). Repo ai cũng đọc được nên không in đáp án ra đây.
     - **Bản in nộp Cục Bản quyền (KHÔNG công bố ra công chúng):** hồ sơ nộp cho cơ quan nhà nước, không phát hành ra công chúng → **rủi ro lộ đáp án gần như bằng 0**. Ngược lại, nộp mã **đã bị lược** có thể bị xem là **bản trích không phản ánh đúng tác phẩm**. Vì vậy bản nộp nhiều khả năng nên dùng **mã đầy đủ** (lấy trực tiếp từ `ben-phu-sa.html`), *không* dùng bản lược của repo.
     - **Hỏi luật sư trước khi in nộp:** bản trích mã nộp kèm **có được phép lược phần bí mật kinh doanh** (hằng số cân bằng) hay không. Có xác nhận rồi mới chốt: bản nộp là mã đầy đủ hay mã lược.

---

## §Copy-cong-khai — Đề xuất sửa `universe.html` dòng 319 (chờ duyệt, qua QA → promote)

Copy hiện tại mô tả cơ chế chính thức hoá (chưa tồn tại). Đề xuất thay bằng mô tả khớp build:

- **VI (đề xuất):** *"Dò thị trường bằng thử nghiệm nhỏ rồi nhân rộng đúng lúc: mỗi tuần chọn phương thức, món hàng và địa điểm; đọc nhu cầu ẩn và né đụng độ để tối đa doanh thu sau 5 tuần."*
- **EN (đề xuất):** *"Probe the market with small bets, then scale at the right moment: each week pick your method, product and location; read hidden demand and dodge clashes to maximize five-week revenue."*

Không sửa trực tiếp `universe.html` trong PR này — đổi qua pipeline QA → promote. (PR #413 chỉ gồm tài liệu IP.)

---

### Việc cần Hương làm ngay
- [x] Tự chơi thử một lượt `v1.0` (đủ 5 tuần ra kết quả) để xác nhận điều kiện hướng (a) — **đã xác nhận 24/08/2026**.
- [ ] Điền bốn trường cá nhân (cả hai đồng tác giả) + chuẩn bị bản sao y CCCD *(không đưa lên repo)*.
- [x] Hash + ngày: **`b387b3b…` / 08/08/2026** — Hương đã tự xác nhận qua GitHub "History for ben-phu-sa.html".
- [x] Grep IB-CI = 0 dòng thực (chỉ 2 dòng ghi chú về việc loại trừ) — đã chạy lại, kết quả đúng như kỳ vọng. Duyệt phần lược hằng số: đã đối chiếu `share(n)`, `D`, `W`, `menuAdj` trong bản trích khớp đúng cấu trúc bản đầy đủ ở `ben-phu-sa.html` (chỉ ẩn giá trị). ⚠️ Hương vẫn nên tự chạy lại lệnh grep một lần trên máy/session của mình trước khi nộp, theo đúng nguyên tắc không lấy kết quả AI báo làm bằng cuối cùng.
- [ ] Xác nhận với luật sư cách khai mục A.3 (chưa công bố chính thức, dù kỹ thuật đã live trên GitHub Pages).
- [x] Tỷ lệ sở hữu: **50% / 50%** — cả hai đồng tác giả đã thống nhất. Còn lại: **ký thỏa thuận đồng sở hữu bằng văn bản** (hiện mới là bản nháp) trước khi nộp.
- [ ] Hỏi luật sư: định dạng đĩa/USB; cách khai hình ảnh AI tạo.
- [ ] Định tuyến sửa copy `universe.html` qua QA → promote.
- [ ] **Tìm đúng mẫu Tờ khai cho "chương trình máy tính"** — bản Hương gửi (`Mẫu số 01`, Thông tư 08/2026/TT-BVHTTDL) chỉ dùng cho tác phẩm dạng chữ viết (văn học/khoa học/bài giảng/báo chí...), không có lựa chọn "chương trình máy tính" ở mục loại hình. Bộ 14 mẫu của thông tư này có mẫu riêng cho phần mềm — cần tìm đúng mẫu đó trước khi điền.

---

*Nguồn: hai file Word "Bến Phù Sa — Hồ sơ bản quyền và nhãn hiệu" và "Thông tin cần để soạn hồ sơ bản quyền tác giả" (nhóm cung cấp, 20/08/2026). Tài liệu này là bản làm việc để đối chiếu và version-hoá; không phải tư vấn pháp lý — các điểm pháp lý do luật sư SHTT xác nhận.*

---

## Phụ lục — Bản mô tả gốc của nhóm (KHÔNG dùng để nộp; giữ làm ghi chú lịch sử)

> Bản dưới mô tả cơ chế **chính thức hoá hộ kinh doanh** (đăng ký/vay nóng/thu giữ). Nó **không khớp** build `v1.0` và được thay bằng Phần B ở trên. Giữ lại chỉ để truy vết vì sao có độ vênh (nó bắt nguồn từ copy công khai ở `universe.html`).

**1. Mục đích (gốc):** đặt người học vào vai hộ bán hàng rong ở ĐBSCL, trước lựa chọn tiếp tục phi chính thức hay bước lên chính danh (đăng ký hộ kinh doanh); hiểu bằng trải nghiệm các đánh đổi kinh tế của quá trình chính thức hóa.
**2. Nội dung (gốc):** đăng ký hay không (chi phí tuân thủ vs quyền tiếp cận tín dụng); vay nóng hay vay ngân hàng; rủi ro thu giữ hàng hay trả chi phí tuân thủ; quản lý dòng tiền, tồn kho, giá bán.
**3. Ý nghĩa (gốc):** như Phần B hiện hành.
