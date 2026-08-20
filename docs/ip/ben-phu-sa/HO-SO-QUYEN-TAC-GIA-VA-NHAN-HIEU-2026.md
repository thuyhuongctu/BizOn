# Hồ sơ bản quyền tác giả & phương án nhãn hiệu — Game "BẾN PHÙ SA"

> **Tài liệu làm việc nội bộ.** Soạn theo checklist của luật sư (bản gốc: hai file Word do nhóm cung cấp, 20/08/2026). Đưa vào repo để có bản có version, đối chiếu với các hồ sơ IP đã có trong `docs/ip/`.
>
> **Các ô cá nhân (CCCD, ngày sinh, địa chỉ, SĐT, hash commit) để TRỐNG — đồng tác giả tự điền trên máy mình và KHÔNG đưa dữ liệu cá nhân lên repo công khai.**

---

## ⚠️ GHI CHÚ RÀ SOÁT — khớp bản mô tả với bản build thực tế (đọc trước)

Khi đối chiếu **Phần B (bản mô tả tác phẩm)** trong file gốc với **bản build đang chạy** (`ben-phu-sa.html`, nhãn `app_version = 'bizon-v156'`), có **một điểm không khớp cần chốt trước khi nộp**:

| | File mô tả (Phần B gốc) | Bản build thực tế `ben-phu-sa.html` |
|---|---|---|
| Cơ chế cốt lõi | Chính thức hoá hộ kinh doanh: **đăng ký / không đăng ký**, **vay nóng vs vay ngân hàng**, **rủi ro thu giữ hàng**, chi phí tuân thủ/thuế | **Thăm dò–khai thác thị trường**: mỗi tuần chọn **Phương thức (ghe/gánh/khảo sát) × Món × Địa điểm**; nhu cầu ẩn, đụng độ chia khách, 3 AI đối thủ; tối đa doanh thu sau 5 tuần |
| Đối chiếu | Không tìm thấy các từ khoá "đăng ký hộ kinh doanh / vay nóng / thu giữ / tuân thủ / thuế" trong mã (`grep` = 0) | Xác nhận qua mã + 3 ảnh giao diện đính kèm |

Hồ sơ bản quyền yêu cầu **bản mô tả, ảnh giao diện in kèm và mã nguồn phải mô tả CÙNG một tác phẩm**. Vì vậy phải chọn một trong hai hướng **trước khi nộp**:

- **(a)** Nếu tác phẩm đăng ký chính là bản đang chạy → **viết lại Phần B theo cơ chế thăm dò–khai thác** (bản đã hiệu chỉnh ở §B-thực-tế cuối tài liệu này).
- **(b)** Nếu có một bản build khác đã cài cơ chế chính thức hoá (đăng ký/vay/thu giữ) → chỉ cho tôi đường dẫn bản đó; ảnh + mã nộp kèm phải lấy từ bản đó, không phải `ben-phu-sa.html` hiện tại.

*Đây là ghi chú kỹ thuật để hai đồng tác giả quyết, không phải sửa đổi nội dung của nhóm.*

---

## Tóm tắt các quyết định cần đưa ra trước khi nộp

1. **Ký thỏa thuận đồng sở hữu (17 điều) TRƯỚC** khi nộp bất kỳ hồ sơ nào — bản quyền lẫn nhãn hiệu. Nếu tách Bến Phù Sa thành tác phẩm riêng, thỏa thuận phải ghi rõ Bến Phù Sa nằm trong phạm vi tài sản chung (hoặc lập phụ lục riêng).
2. **Chốt phạm vi tác phẩm:** đăng ký Bến Phù Sa như **chương trình máy tính độc lập** (khuyến nghị) hay như một phần của BizOn Bật Nghiệp. Hai lựa chọn dẫn đến bộ mã nguồn in kèm khác nhau.
3. **Chốt ngày hoàn thành gắn với một commit cụ thể.** Hương **tự chạy `git log`** để lấy hash — không dùng hash do công cụ AI báo cáo.
4. **Quyết định nhãn hiệu:** nộp "Bến Phù Sa" như nhãn riêng, hay để nó là tên bậc chơi dưới nhãn chính "BizOn Bật Nghiệp" (Phần C).
5. **Chốt khớp mô tả ↔ build** (xem ghi chú rà soát ở trên).

---

## Phần A — Thông tin hồ sơ bản quyền tác giả (theo checklist luật sư)

| Mục | Nội dung |
|---|---|
| **1. Tên tác phẩm** | PHẦN MỀM TRÒ CHƠI MÔ PHỎNG KINH TẾ HỘ KINH DOANH "BẾN PHÙ SA".<br>Tên tiếng Anh (nếu luật sư yêu cầu): *Ben Phu Sa — A Street-Vendor Formalization Economics Simulation Game*.<br>Nên đăng ký loại hình **"chương trình máy tính"**. Muốn bảo hộ thêm phần mỹ thuật (nhân vật, bối cảnh đất sét/xuồng ghe) có thể cân nhắc đăng ký bổ sung **"tác phẩm mỹ thuật ứng dụng"** cho bộ hình ảnh — hỏi luật sư về chi phí. |
| **2. Ngày hoàn thành** | Ngày: **……… (Hương điền)** · Gắn với commit: **……… (Hương điền)**.<br>*Quy tắc bắt buộc:* Hương tự chạy `git log` trên máy mình, chọn commit đánh dấu phiên bản hoàn chỉnh của Bến Phù Sa, ghi hash đầy đủ + ngày commit. **Ngày hoàn thành khai không được sớm hơn ngày commit đó.** Nếu game chưa "hoàn chỉnh chơi được đầu-cuối", chỉ đăng ký phiên bản hiện có (ghi số phiên bản, ví dụ v1.0) hoặc lùi ngày nộp. |
| **3. Ngày công bố / nơi công bố** | Nếu Bến Phù Sa đã hiển thị công khai trên trang chủ (ai cũng vào chơi được): khai **ngày đưa lên bản public đầu tiên + URL**. Hương xác minh ngày bằng lịch sử deploy/commit của `index.html`/`ben-phu-sa.html`, không ước lượng.<br>Nếu mới chạy trong lớp hoặc bản QA nội bộ: khai **"chưa công bố"**. Khai sai mục này ảnh hưởng hiệu lực giấy chứng nhận — không chắc thì hỏi luật sư. |
| **4. Thông tin tác giả** | Đồng tác giả 1: **Đỗ Thùy Hương** — CCCD: ……… *(Hương điền)*.<br>Đồng tác giả 2: **Phan Anh Tú** — CCCD: ……… *(Hương điền)*.<br>Kèm bản sao y chứng thực CCCD của cả hai. Đây là bốn trường cá nhân còn trống trong bộ hồ sơ IP chung (ngày sinh, số CCCD, địa chỉ, SĐT) — thu thập một lần dùng cho cả bản quyền lẫn nhãn hiệu. **Không đưa lên repo.** |
| **5. Thông tin chủ sở hữu** | Chủ sở hữu là **hai cá nhân đồng sở hữu** (không phải công ty), theo cấu trúc khuyến nghị cho viên chức: đồng sở hữu cá nhân + hợp đồng li-xăng khi khai thác thương mại. Không cần Giấy chứng nhận đăng ký kinh doanh.<br>**Tỷ lệ sở hữu** khai trong hồ sơ phải khớp thỏa thuận đồng sở hữu đã ký — **phải chốt trước khi nộp.** |
| **6. Tài liệu tác phẩm nộp kèm** | (a) **Bản chạy chương trình:** checklist ghi "02 đĩa mềm" — thực tế nay thường nộp **02 đĩa CD/USB** chứa bản build; xác nhận định dạng với luật sư.<br>(b) **Giao diện in ra giấy:** ảnh các màn hình chính — xem `anh-giao-dien/` (mở đầu · vòng quyết định · kết quả). **Bắt buộc loại logo/hình bên thứ ba;** kiểm font có giấy phép, icon thư viện ngoài, ảnh nền nếu tạo bằng AI thì rà điều khoản thương mại.<br>(c) **Mã nguồn in 15–20 trang:** bản trích đặc trưng đã chuẩn bị — xem `ma-nguon-dac-trung/`. Chỉ gồm engine mô phỏng riêng của Bến Phù Sa; **đã loại hạ tầng dùng chung; không có phần liên quan IB-CI** (đã rà: 0 kết quả). |

---

## Phần B — Bản mô tả tác phẩm (bản gốc do nhóm soạn)

> Giữ nguyên như file gốc. **Xem ghi chú rà soát đầu tài liệu** và §B-thực-tế bên dưới trước khi dùng để nộp.

**1. Mục đích:** Bến Phù Sa là trò chơi mô phỏng kinh tế chạy trên trình duyệt, phục vụ giảng dạy khởi sự kinh doanh và kinh tế phi chính thức bậc đại học. Đặt người học vào vai hộ bán hàng rong ở Đồng bằng sông Cửu Long, trước lựa chọn cốt lõi: tiếp tục phi chính thức hay bước lên chính danh (đăng ký hộ kinh doanh). Mục đích: giúp người học hiểu bằng trải nghiệm các đánh đổi kinh tế của quá trình chính thức hóa.

**2. Nội dung:** người chơi ra quyết định qua các vòng chơi liên tiếp, mỗi vòng có hậu quả kinh tế mô phỏng bởi engine tính toán: đăng ký hay không (chi phí tuân thủ vs quyền tiếp cận tín dụng, giảm rủi ro thu giữ); vay nóng hay vay ngân hàng; chấp nhận rủi ro thu giữ hàng hay trả chi phí tuân thủ (mô hình xác suất); quản lý dòng tiền, tồn kho, giá bán. Phần mềm gồm engine mô phỏng; giao diện song ngữ Việt–Anh; nhân vật AI (Lumina) chỉ giải thích đánh đổi, không đưa đáp án tối ưu, không đổi trạng thái mô phỏng; hệ thống ghi nhật ký quyết định phục vụ debrief.

**3. Ý nghĩa:** giáo dục (đưa bối cảnh kinh tế phi chính thức Việt Nam vào lớp học); nghiên cứu (dữ liệu quyết định theo quy trình đồng thuận + phê duyệt đạo đức); văn hóa (chất liệu thị giác, ngôn ngữ miền Tây Nam Bộ).

### §B-thực-tế — Bản mô tả khớp với build `ben-phu-sa.html` hiện tại (đề xuất dùng nếu chọn hướng (a))

**1. Mục đích:** trò chơi mô phỏng thị trường chạy trên trình duyệt, dạy tư duy **thăm dò–khai thác (explore/exploit)** trong khởi sự kinh doanh ẩm thực đường phố. Người học vào vai nhà sáng lập ở thị trấn giả tưởng **Bến Phù Sa** (cảm hứng chợ nổi miền Tây), học cách **thử nghiệm nhỏ để dò thị trường rồi nhân rộng đúng lúc**.

**2. Nội dung:** qua **5 tuần**, mỗi tuần chọn **Phương thức** (⛵ ghe hàng bông ×3 doanh thu · 🧺 gánh hàng rong ×1 nhiều thông tin · 📋 khảo sát chợ), **Món hàng** (bánh mì / chè bưởi / cà phê phin — mỗi món một mô hình vận hành) và **Địa điểm** (6 khu, mỗi khu một chân dung khách). Engine mô phỏng **nhu cầu ẩn** theo cặp món×địa điểm, **hệ số tuần**, **luật chia khách khi đụng độ** đối thủ, và **3 AI đối thủ** mỗi "nhà" một chiến lược. Kết thúc: xếp hạng 4 đội + **hiệu suất so với kịch bản hoàn hảo** + câu hỏi tổng kết để debrief; tùy chọn nộp kết quả cho giảng viên. Nhật ký quyết định mỗi tuần phục vụ thảo luận lớp.

**3. Ý nghĩa:** giữ nguyên như bản gốc (giáo dục · nghiên cứu · văn hóa), nhấn thêm: cơ chế thăm dò–khai thác là mô-típ sư phạm phổ biến, **bối cảnh/nhân vật/dữ liệu/giao diện/lời thoại đều nguyên bản**, không dùng tài liệu hay cấu trúc của bất kỳ mô phỏng thương mại nào (ghi chú này đã in ngay trên trang game).

---

## Phần C — Phương án nhãn hiệu cho "Bến Phù Sa"

| Phương án | Nội dung & đánh giá |
|---|---|
| **1 · Chỉ đăng ký nhãn chính "BizOn Bật Nghiệp"** (kế hoạch hiện tại) | Bến Phù Sa dùng như tên bậc chơi (sub-brand). Chi phí thấp nhất, hồ sơ đơn giản. **Rủi ro:** nếu tách Bến Phù Sa thành sản phẩm độc lập có trang/kênh riêng thì tên này **không được bảo hộ** — bên khác có thể đăng ký "Bến Phù Sa" cho phần mềm/giáo dục trước. |
| **2 · Nộp thêm nhãn "Bến Phù Sa" riêng** (nhóm 09, 41, 42) | Phù hợp nếu tách game độc lập là chiến lược dài hạn (thương mại hóa riêng, bán li-xăng cho các trường). Nộp cùng đợt "BizOn Bật Nghiệp" **trước 31/12/2026** để hưởng phí ưu đãi. Chi phí: thêm một đơn × ba nhóm — hỏi luật sư báo giá. |

**Việc cần làm trước khi chọn:**
- Tra cứu tại **ipvietnam.gov.vn** cho "Bến Phù Sa" và biến thể (BEN PHU SA, Phù Sa) trong **nhóm 09 (phần mềm), 41 (giáo dục, trò chơi), 42 (dịch vụ phần mềm)**. Tra luôn "BizOn Bật Nghiệp" trong cùng buổi.
- Đánh giá tính phân biệt: "Bến Phù Sa" là tên **gợi tả** (suggestive), về nguyên tắc có khả năng phân biệt; nhưng "phù sa" là từ thông dụng gắn địa lý miền Tây, có thể đã có trong nhãn ngành khác — chỉ đáng ngại nếu **trùng nhóm 09/41/42**.
- **Nhất quán metadata:** nếu nộp nhãn riêng, title + metadata trang Bến Phù Sa phải dùng đúng chuỗi ký tự đăng ký (xem `RA-SOAT-METADATA.md`).

---

## Phần D — Tách Bến Phù Sa thành game độc lập: trình tự khuyến nghị

1. **Pháp lý trước:** ký thỏa thuận đồng sở hữu; ghi rõ Bến Phù Sa (mã nguồn, hình ảnh, âm thanh) thuộc tài sản chung theo tỷ lệ đã chốt.
2. **Chốt phiên bản:** hoàn thiện game đến trạng thái chơi được đầu-cuối; Hương tự lấy hash commit bằng `git log`.
3. **Nộp bản quyền tác giả** cho phần mềm (Phần A–B).
4. **Tra cứu + nộp nhãn hiệu** (một hoặc hai nhãn theo Phần C) **trước 31/12/2026**.
5. **Tách kỹ thuật:** nếu tách repo/tách trang, làm **sau** khi đã chốt hash để mốc thời gian IP không bị xáo trộn; mọi thay đổi trang public đi qua pipeline QA → promote, không sửa trực tiếp.

### Ba điểm rủi ro
- **Xung đột lợi ích MekSim:** sản phẩm độc lập càng làm rõ vùng chồng lấn chức năng với MekSim Lab. Hồ sơ bản quyền (ngày + commit hash) là bằng chứng mốc thời gian Bến Phù Sa ra đời độc lập — nhưng cũng là lý do **Thầy Tú cần hoàn tất khai báo xung đột lợi ích trước khi thương mại hóa**.
- **Trùng với Harvard Food Truck Challenge:** chỉ trùng **ý tưởng cơ chế** (không được bảo hộ bản quyền) → không cản đăng ký; nhưng bản mô tả nên nhấn **bối cảnh chính thức hoá / thị trường Việt Nam** làm điểm khác biệt (đối chiếu `../BEN-PHU-SA-CHINH-DANH-HOA-VA-KHAC-BIET-HBP-DRAFT-2026-08-04.md`).
- **Nội dung do AI tạo:** nếu hình ảnh trong game (đất sét, xuồng ghe) tạo bằng AI, hỏi luật sư cách khai trong hồ sơ — phạm vi bảo hộ nội dung AI chưa rõ, và ảnh giao diện nộp kèm sẽ chứa các hình đó.

### Việc cần Hương làm ngay
- [ ] Điền bốn trường cá nhân (cả hai đồng tác giả) + chuẩn bị bản sao y CCCD.
- [ ] Chạy `git log`, chọn commit phiên bản Bến Phù Sa, ghi hash + ngày.
- [ ] Tra cứu ipvietnam.gov.vn cho cả "BizOn Bật Nghiệp" và "Bến Phù Sa".
- [ ] Gửi Thầy Tú hai câu cần chốt: **tỷ lệ sở hữu** và **có nộp nhãn "Bến Phù Sa" riêng không**.
- [ ] Hỏi luật sư: định dạng đĩa/USB; cách khai hình ảnh AI tạo; báo giá nếu nộp thêm một nhãn ba nhóm.
- [ ] Chốt hướng khớp mô tả ↔ build (ghi chú rà soát đầu tài liệu).

---

*Nguồn: hai file Word "Bến Phù Sa — Hồ sơ bản quyền và nhãn hiệu" và "Thông tin cần để soạn hồ sơ bản quyền tác giả" (nhóm cung cấp, 20/08/2026). Tài liệu này là bản làm việc để đối chiếu và version-hoá; không phải tư vấn pháp lý — các điểm pháp lý do luật sư SHTT xác nhận.*
