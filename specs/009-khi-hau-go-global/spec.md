# Đặc tả tính năng: Rủi ro khí hậu khi chọn thị trường trong BizOn Go Global (chỉ số ND-GAIN)

**Nhánh**: `claude/go-global-nd-gain` (thư mục đặc tả `009-khi-hau-go-global`)

**Ngày tạo**: 2026-11-25

**Trạng thái**: Đã làm rõ (25/11/2026), có kế hoạch và danh sách việc; chờ chị duyệt trước khi làm PR 1.

**Đầu vào**: chị nhắn ngày 25/11/2026, sau khi đọc bản tin IB ngày 24 và 25/11: «Ok triển khai lần lượt. Đảm bảo tính khoa học, logic, hiển thị chuẩn quốc tế». Đây là việc thứ 4 trong danh sách em đề xuất: thêm thuộc tính khí hậu ND-GAIN cho thị trường Go Global, lấy cảm hứng từ Oh, Rivera & Oetzel (2026).

## Hiện trạng (đọc kho ngày 25/11/2026, main ở `ff5ec6e7`, `bizon-v984`)

**Game Go Global** nằm trong khối script của `global.html` (dòng 311 trở đi). Trang ghi là «Bậc 3 · Quốc tế hóa (bản thử nghiệm)».

- **Thị trường:** 7 thị trường, phần lớn là **vùng**, mỗi vùng hiện kèm một thành phố trung tâm.

  | Thị trường | Trung tâm |
  |---|---|
  | Đông Nam Á | Singapore |
  | Đông Á | Tokyo |
  | Châu Âu | Berlin |
  | Bắc Mỹ | New York |
  | Trung Đông | Dubai |
  | Hàn Quốc | Seoul |
  | Châu Phi | Nairobi |

  - Thuộc tính mỗi thị trường: quy mô (`size`), giá tham chiếu (`ref`), độ co giãn (`elast`), thuế quan (`tariff`), khoảng cách văn hóa (`cult`), hạ tầng số (`digital`).
  - **Chưa có thuộc tính nào về khí hậu.**
- **Phương thức thâm nhập:** 7 phương thức, gồm Đầu tư mới (FDI, công ty con 100 % vốn): vốn ban đầu 180, chi phí cố định 45 mỗi quý, kiểm soát 1,0, né thuế quan.
- **Biến cố:** 9 biến cố quý (`Q_EVENTS`), chọn tất định theo thị trường và phương thức.
  - Biến cố «Thiên tai gián đoạn chuỗi cung» tác động **như nhau ở mọi thị trường**: chi phí thêm 1,2 USD mỗi sản phẩm, cầu × 0,92.
  - Trong 4 quý, biến cố này rơi vào 21 trên 49 cặp thị trường – phương thức. Với FDI, chỉ có Đông Á và Trung Đông gặp biến cố này.
- **Chỉ số cuối mỗi quý** (hàm `gCalc`):
  - ESG = 35 + 0,7 × bản địa hóa (+10 nếu liên doanh, +5 trong quý có biến cố ESG).
  - Rủi ro = vốn/3 + 30 × khoảng cách văn hóa + 55 × thuế − 0,25 × bản địa hóa.
  - Rủi ro **không phụ thuộc** khí hậu.
- **Nhật ký CSV** gồm 21 cột: `time, market, mode, …, esg, risk, doi, rep, learn, result…`. Chưa có cột khí hậu.
- **Song ngữ:** 51 chỗ `data-en`; chữ trong game đi qua `L(vi, en)`. Test có sẵn: `test/global-tieng-anh.test.js`.

**Ràng buộc sở hữu trí tuệ:**
- `global.html` nằm trong danh sách «không đổi tên, xóa, chuyển hướng» của `docs/roadmap/KE-HOACH-DON-HE-SINH-THAI-2026-11.md` §0, vì Tờ khai ghi địa chỉ này.
- Khối script của `global.html` **không** có trong danh sách «không sửa logic»: danh sách đó chỉ gồm `js/engine.js`, `js/backend.js`, `js/app.js`, `js/aibis/*`, `brand-passport.html`, `ben-phu-sa*.html`.
- Tuy vậy, Go Global có bản nháp hồ sơ quyền tác giả riêng (`docs/ip/BIZON-GO-GLOBAL-MO-TA-TAC-PHAM-DRAFT-2026-09-17.md`), lấy ngày hoàn thành theo lịch sử git của `global.html`.
- `lab/ie-lab.html` là bản kế nhiệm dự kiến; ở Giai đoạn 3, `global.html` sẽ chuyển hướng 301 về đây. Lõi mô phỏng của IE Lab là phần khác (đường cong FSTS – hiệu quả), không có trò chơi chọn thị trường và phương thức.

**Nguồn dữ liệu ND-GAIN** (mở trang ngày 25/11/2026):
- Notre Dame Global Adaptation Initiative công bố bộ dữ liệu bản 2026: hơn 180 quốc gia, cập nhật hằng năm, công cụ mở và miễn phí.
- Gồm điểm ND-GAIN, điểm dễ tổn thương (Vulnerability), điểm sẵn sàng (Readiness) và các thành phần.
- Cách trích dẫn đề xuất: «Notre Dame Global Adaptation Initiative Country Index (ND-GAIN). (Current Year). University of Notre Dame.»
- **Trang chặn tải tự động** (HTTP 403 khi em thử tải tệp zip). Chị cần tải tay tệp `ndgain_countryindex_2026.zip` và gửi em. Em không tìm cách vượt chặn.

**Cơ sở lý thuyết.** Oh, Rivera & Oetzel (2026, *Journal of International Business Studies*, doi:10.1057/s41267-026-00912-4). Bản tin ngày 24/11 đã đọc đến hết phần kiểm định H1.
- Mẫu: 400 doanh nghiệp Fortune Global 500 tại 136 nước, giai đoạn 2003–2017.
- Khả năng chống chịu khí hậu của nước sở tại (đo bằng ND-GAIN) có quan hệ thuận với số công ty con 100 % vốn mới lập: β = 0,0576, p = 0,013.
- Quan hệ này mạnh hơn ở doanh nghiệp có năng lực ESG cao và có kinh nghiệm tại các nước chống chịu tốt; yếu hơn ở doanh nghiệp nhiều nguồn lực dư thừa (financial slack).
- Mẫu là MNE rất lớn, nên áp vào doanh nghiệp nhỏ Việt Nam trong game là **suy rộng có chủ đích**. Trang game phải nói rõ điều này.

## Làm rõ

Chị trả lời ngày 25/11/2026:

| # | Câu hỏi | Chị chọn | Ảnh hưởng tới yêu cầu |
|---|---|---|---|
| 1 | Đặt tính năng ở đâu | **`global.html`** | FR-011: sửa khối script của `global.html`; không đổi tên, xóa hay chuyển hướng tệp. Câu chuyện 1 không đổi điểm; Câu chuyện 2 tắt mặc định. |
| 2 | Quy đổi vùng → nước | **Nước trung tâm** | FR-001, FR-002: mỗi thị trường dùng số của nước trung tâm game đang hiện. Thẻ ghi rõ, ví dụ «Số của Singapore (nước trung tâm của thị trường Đông Nam Á)». |
| 3 | Cách bật kịch bản khí hậu | **Link giảng viên `?khihau=1`** | FR-004 đến FR-006 chỉ chạy khi URL có `khihau=1`. Không đổi cơ sở dữ liệu. `climate_mode` trong CSV là `on` / `off`. |

Bảng nước trung tâm:

| Thị trường game | Nước dùng số ND-GAIN | Mã ISO3 |
|---|---|---|
| Đông Nam Á | Singapore | SGP |
| Đông Á | Nhật Bản | JPN |
| Châu Âu | Đức | DEU |
| Bắc Mỹ | Hoa Kỳ | USA |
| Trung Đông | Các Tiểu vương quốc Ả Rập Thống nhất | ARE |
| Hàn Quốc | Hàn Quốc | KOR |
| Châu Phi | Kenya | KEN |

Với Đông Nam Á, Singapore không đại diện cho cả vùng. Đoạn giải thích trên trang nói rõ điều này, để sinh viên không hiểu nhầm rằng cả Đông Nam Á có mức chống chịu như Singapore.

## Kịch bản người dùng và kiểm thử *(bắt buộc)*

### Câu chuyện 1 – Sinh viên thấy hồ sơ khí hậu của từng thị trường trước khi chọn (Ưu tiên: P1)

**Người dùng:** đội sinh viên ở Bước 1 «Chọn thị trường quốc tế».

**Hành trình:**
- Mỗi thẻ thị trường hiện thêm điểm ND-GAIN, thứ hạng và hai thành phần dễ tổn thương / sẵn sàng, kèm «Nguồn: ND-GAIN 2026, số liệu năm …».
- Bấm vào biểu tượng ⓘ thì mở một đoạn giải thích ngắn: chỉ số đo gì và vì sao nhà đầu tư quan tâm. Đoạn này trích Oh et al. (2026) và nêu rõ giới hạn khi suy rộng.
- **Điểm số ván chơi không đổi.**

**Vì sao ưu tiên này:** thêm thông tin thật mà không đổi luật. Lớp đang chơi giữ được kết quả. Phần này tự đứng được để dạy một ý: rủi ro khí hậu là một tiêu chí chọn địa điểm.

**Cách thử độc lập:**
- Mở `global.html` ở 360 px và 1366 px, VI và EN: 7 thẻ đều có số, nguồn, năm.
- Chơi cùng một chuỗi quyết định trước và sau thay đổi: mọi số cuối quý trùng khít.

**Kịch bản nghiệm thu:**
1. **Cho** một đội mở Bước 1, **Khi** nhìn thẻ Đông Nam Á, **Thì** thấy điểm ND-GAIN của Singapore (ghi rõ là nước trung tâm), thứ hạng, năm số liệu và nguồn.
2. **Cho** trang đang ở tiếng Anh, **Khi** mở đoạn giải thích, **Thì** toàn bộ chữ là tiếng Anh và có trích dẫn APA.
3. **Cho** cùng thị trường, phương thức và quyết định 4 quý, **Khi** so kết quả trước và sau PR, **Thì** thị phần, lợi nhuận, ESG, rủi ro, DOI, danh tiếng và học hỏi trùng khít.

---

### Câu chuyện 2 – Giảng viên bật kịch bản khí hậu để rủi ro khí hậu thật sự có hậu quả (Ưu tiên: P2)

**Người dùng:** giảng viên, rồi đến đội sinh viên trong lớp đó.

**Hành trình:** giảng viên gửi lớp link có `?khihau=1` để bật «kịch bản khí hậu». Khi bật:
- **(a)** Mỗi quý có một khoản «chi phí rủi ro khí hậu», tăng theo mức dễ tổn thương của thị trường. Cần khoản thường xuyên này vì biến cố thiên tai chỉ rơi vào 21 trên 49 cặp thị trường – phương thức (với FDI chỉ 2 trên 7 thị trường), nên nếu chỉ dựa vào biến cố, phần lớn đội không gặp rủi ro khí hậu. Biến cố thiên tai, khi xảy ra, cũng mạnh hơn ở thị trường dễ tổn thương hơn.
- **(b)** Phương thức cam kết tài sản cao (FDI, liên doanh) chịu phần thiệt hại tài sản lớn hơn xuất khẩu hay cấp phép.
- **(c)** Năng lực ESG của đội (điểm ESG đang có) giảm một phần thiệt hại.

Hướng tác động bám đúng Oh et al. (2026): nước chống chịu tốt hấp dẫn hơn với công ty con 100 % vốn; năng lực ESG làm lợi ích ấy lớn hơn. Độ lớn là **minh họa**, ghi rõ như các game khác.

**Không bật** thì luật như cũ, kết quả trùng khít Câu chuyện 1.

**Vì sao ưu tiên này:** biến thông tin thành đánh đổi thật giữa kiểm soát, rủi ro và chi phí (CLO-D). Nhưng nó đổi luật, nên phải bật có chủ đích để không phá số liệu so sánh giữa các lớp (hiến chương nguyên tắc I).

**Cách thử độc lập:**
- Có bật và không bật, cùng thị trường – phương thức – quyết định: không bật thì trùng khít bản cũ.
- Có bật thì thiệt hại của thị trường dễ tổn thương nhất lớn hơn thị trường ít tổn thương nhất.
- FDI chịu thiệt hại lớn hơn xuất khẩu; ESG cao chịu ít hơn ESG thấp.

**Kịch bản nghiệm thu:**
1. **Cho** kịch bản khí hậu đang tắt, **Khi** đội chơi FDI ở Đông Á, **Thì** biến cố thiên tai có tác động như cũ (+1,2 USD mỗi sản phẩm, cầu × 0,92).
2. **Cho** kịch bản khí hậu đang bật, **Khi** hai đội cùng quyết định, một vào thị trường dễ tổn thương hơn, **Thì** đội đó chịu thiệt hại thiên tai lớn hơn. Lời biến cố nói rõ vì sao, kèm số ND-GAIN.
3. **Cho** kịch bản khí hậu đang bật và cùng thị trường, **Khi** một đội chọn FDI, một đội chọn xuất khẩu, **Thì** đội FDI chịu phần thiệt hại tài sản lớn hơn. Đội có ESG cao chịu ít hơn đội ESG thấp.
4. **Cho** kịch bản khí hậu đang bật, **Khi** biến cố thiên tai chưa rơi vào ván của đội, **Thì** thẻ thị trường vẫn hiện mức rủi ro khí hậu, để đội cân nhắc trước khi chọn.

---

### Câu chuyện 3 – Đội nhìn lại lựa chọn qua câu hỏi thảo luận; nhóm nghiên cứu có dữ liệu để phân tích (Ưu tiên: P3)

**Người dùng:** đội sinh viên ở màn kết quả; giảng viên và nhóm nghiên cứu khi xuất CSV.

**Hành trình:**
- Màn kết quả có thêm 1–2 câu hỏi thảo luận về rủi ro khí hậu trong chọn địa điểm và phương thức. Lumina chỉ đặt câu hỏi, không chọn giúp, không đưa đáp án.
- Nhật ký CSV có thêm hai cột: điểm ND-GAIN của thị trường và trạng thái kịch bản khí hậu (bật / tắt).

**Vì sao ưu tiên này:** gắn trải nghiệm với lập luận (rubric D: «Gắn lựa chọn với đặc điểm nguồn lực của chính doanh nghiệp mình»). Nhóm nghiên cứu cũng tách được hai điều kiện khi phân tích.

**Cách thử độc lập:** chơi xong 4 quý, màn kết quả có câu hỏi mới (VI, EN). Tệp CSV có thêm hai cột; 21 cột cũ giữ nguyên tên và thứ tự.

**Kịch bản nghiệm thu:**
1. **Cho** một đội chơi xong, **Khi** xem màn kết quả, **Thì** thấy câu hỏi về rủi ro khí hậu. Câu hỏi không chứa đáp án gợi ý.
2. **Cho** tệp CSV xuất ra, **Khi** mở bằng bảng tính, **Thì** 21 cột đầu như cũ, thêm hai cột `ndgain` và `climate_mode` ở cuối.

### Trường hợp biên

- **Thị trường là vùng nhưng ND-GAIN tính theo nước:** dùng nước trung tâm (làm rõ 2). Chữ trên thẻ ghi đúng tên nước.
- **Nước thiếu số liệu năm mới nhất:** dùng năm gần nhất có số và ghi năm ấy. Không nội suy tay.
- **Ngoại tuyến (PWA):** số liệu nằm trong tệp tĩnh, không gọi mạng lúc chơi.
- **Tiếng Anh:** mọi chữ mới có bản EN. Tên chỉ số giữ nguyên «ND-GAIN».
- **360 px:** thẻ thị trường hiện có lưới `sm:grid-cols-5`. Thêm 2–3 dòng số không được làm tràn ngang hay đẩy nút chọn khỏi tầm chạm 44 px.
- **Lớp đang chơi giữa học kỳ:** Câu chuyện 1 không đổi kết quả. Câu chuyện 2 chỉ chạy khi bật.

## Yêu cầu *(bắt buộc)*

### Yêu cầu chức năng

- **FR-001:** Mỗi thị trường MUST có điểm ND-GAIN, điểm dễ tổn thương, điểm sẵn sàng, thứ hạng và năm số liệu, lấy từ bộ dữ liệu ND-GAIN 2026. Bảng gốc (nước, mã ISO3, năm, ba điểm) lưu trong kho kèm trích dẫn.
- **FR-002:** Thẻ thị trường ở Bước 1 MUST hiện điểm ND-GAIN, năm và nguồn, song ngữ VI/EN. Đoạn giải thích mở bằng một nút, có trích dẫn Oh et al. (2026) và câu nói rõ giới hạn suy rộng sang doanh nghiệp nhỏ.
- **FR-003:** Khi kịch bản khí hậu tắt, mọi số trong `gCalc` và nhật ký MUST trùng khít bản trước PR, với mọi tổ hợp thị trường – phương thức – quyết định trong bộ test.
- **FR-004:** Khi kịch bản khí hậu bật, mỗi quý MUST có một khoản chi phí rủi ro khí hậu tăng theo mức dễ tổn thương của thị trường. Tác động của biến cố thiên tai (khi rơi vào ván) MUST cũng tăng theo mức dễ tổn thương.
- **FR-005:** Khi kịch bản khí hậu bật, phần thiệt hại tài sản MUST lớn hơn ở phương thức kiểm soát cao (FDI, liên doanh) so với phương thức kiểm soát thấp (xuất khẩu, cấp phép).
- **FR-006:** Khi kịch bản khí hậu bật, điểm ESG cao hơn MUST làm giảm thiệt hại. Mức giảm có trần, để ESG không xóa hẳn rủi ro.
- **FR-007:** Mọi hệ số tác động ở FR-004 đến FR-006 MUST nằm ở một chỗ, có chú thích «minh họa». Trang phải nói các độ lớn là minh họa, chỉ hướng tác động lấy từ nghiên cứu.
- **FR-008:** Màn kết quả MUST có 1–2 câu hỏi thảo luận về rủi ro khí hậu, VI và EN, không chứa đáp án.
- **FR-009:** Nhật ký CSV MUST thêm `ndgain` và `climate_mode` ở cuối; 21 cột cũ giữ nguyên tên và thứ tự.
- **FR-010:** Số liệu MUST nằm trong tệp tĩnh của kho, chạy được ngoại tuyến; không gọi dịch vụ ngoài lúc chơi.
- **FR-011:** Tính năng đặt trong khối script của `global.html` (làm rõ 1). Không đổi tên, xóa hay chuyển hướng `global.html`. Lõi `IP_MARKETS`/`ipPerf` mà `lab/ie-lab.js` chép nguyên văn MUST giữ nguyên từng byte.

### Thực thể chính

- **Hồ sơ khí hậu quốc gia:** mã ISO3, tên VI/EN, năm số liệu, điểm ND-GAIN (0–100), dễ tổn thương (0–1, cao là xấu), sẵn sàng (0–1, cao là tốt), thứ hạng.
- **Hồ sơ khí hậu thị trường:** gắn một thị trường của game với một hay nhiều hồ sơ quốc gia theo quy tắc ở câu làm rõ 2, cộng chữ mô tả quy tắc ấy.
- **Kịch bản khí hậu:** bật khi URL có `khihau=1`, tắt trong mọi trường hợp khác. Được ghi vào nhật ký.

## Tiêu chí thành công *(bắt buộc)*

- **SC-001:** 7/7 thẻ thị trường hiện số ND-GAIN, năm và nguồn ở VI và EN, ở 360 px và 1366 px, không tràn ngang.
- **SC-002:** Khi tắt kịch bản, 100 % tổ hợp trong bộ test (7 thị trường × 7 phương thức × ít nhất 2 bộ quyết định) cho kết quả trùng khít bản cũ.
- **SC-003:** Khi bật, xếp hạng chi phí rủi ro khí hậu (và thiệt hại thiên tai) giữa các thị trường trùng với xếp hạng dễ tổn thương ND-GAIN (tương quan hạng Spearman = 1). Có ba bất đẳng thức đúng: FDI > xuất khẩu và ESG thấp > ESG cao, cùng thị trường; thị trường dễ tổn thương hơn > thị trường ít tổn thương hơn, cùng phương thức.
- **SC-004:** Mọi con số ND-GAIN trong game đối chiếu được từng dòng với tệp gốc ND-GAIN 2026 bằng test tự động (sai lệch 0 sau khi làm tròn đến chữ số đã hiện).
- **SC-005:** `html-validate@8.24.1` 0 lỗi; `test/global-tieng-anh.test.js` vẫn đạt; không có chữ Việt trên bản EN.

## Nối chuẩn đầu ra

| Câu chuyện | Chuẩn đầu ra | Cách nối |
|---|---|---|
| 1, 2 | **CLO-D** «So sánh rủi ro, chi phí và mức độ kiểm soát giữa các phương thức thâm nhập quốc tế» (Evaluate) | Rủi ro khí hậu của địa điểm thành một trục so sánh; phương thức kiểm soát cao chịu rủi ro tài sản lớn hơn |
| 2 | **CLO-C** (phần ESG) | Năng lực ESG giảm thiệt hại khi bật kịch bản khí hậu |
| 3 | Rubric **D** mức 4 «Gắn lựa chọn với đặc điểm nguồn lực của chính doanh nghiệp mình» | Câu hỏi thảo luận hỏi đội giải thích lựa chọn theo ESG và mức cam kết |

## Giả định

- Nguồn lực dư thừa (financial slack) trong Oh et al. (2026) **không** đưa vào game. Go Global chỉ có lợi nhuận lũy kế, không có khái niệm nguồn lực dư thừa tách bạch; mô phỏng nó sẽ phải tự đặt luật. Ghi ở phần giới hạn trên trang.
- Kinh nghiệm tại nước chống chịu tốt (điều tiết thứ hai trong bài báo) cũng không mô phỏng riêng. Hồ sơ «Đã từng xuất khẩu» hiện có không phân biệt theo nước.
- Độ lớn tác động khi bật kịch bản là minh họa, như mọi game khác của BizOn. Chỉ hướng tác động lấy từ nghiên cứu.
- Điểm ND-GAIN là chỉ số cấp quốc gia; game dùng nó như một tín hiệu rủi ro địa điểm, không như dự báo thiệt hại.
- Chị tải tệp ND-GAIN 2026 vì trang chặn tải tự động. Số liệu được chép vào kho dưới dạng bảng nhỏ (7–20 nước), kèm trích dẫn. Không chép cả bộ dữ liệu.

## Câu hỏi gửi chị

Đã trả lời cả 3 câu ngày 25/11/2026 (xem mục «Làm rõ»). Còn một việc chị làm tay: tải tệp `ndgain_countryindex_2026.zip` từ trang ND-GAIN và gửi em, trước PR 1.
