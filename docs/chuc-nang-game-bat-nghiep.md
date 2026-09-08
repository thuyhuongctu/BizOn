# 🎮 Tài liệu chức năng đầy đủ – BizOn Bật Nghiệp (`game.html`)

> Tài liệu tham chiếu kỹ thuật + chức năng, liệt kê **toàn bộ màn hình, cơ chế, công thức và hằng số** hiện có trong game mô phỏng kinh doanh BizOn Bật Nghiệp. Dùng khi cần tra cứu nhanh "tính năng X hoạt động thế nào", khác với `huong-dan-giang-vien.md` (hướng dẫn tổ chức lớp học – đọc file đó trước nếu bạn là giảng viên mới bắt đầu dùng game).
>
> Nguồn: `game.html`, `js/app.js` (3101 dòng – điều khiển UI/trạng thái), `js/engine.js` (692 dòng – công thức mô phỏng thuần), `js/backend.js` + `js/backend-config.js` (đồng bộ Supabase), `js/tutorial.js` (tour hướng dẫn), `sw.js` + `manifest.webmanifest` (PWA/offline).
> © 2026 Đỗ Thùy Hương & Phan Anh Tú.

---

## Mục lục

1. [Luồng khởi động](#1-luồng-khởi-động)
2. [Khung ứng dụng (App shell)](#2-khung-ứng-dụng-app-shell)
3. [Vòng lặp gameplay cốt lõi](#3-vòng-lặp-gameplay-cốt-lõi)
4. [16 tab chức năng – chi tiết từng tab](#4-16-tab-chức-năng--chi-tiết-từng-tab)
5. [Cơ chế mô phỏng (Engine)](#5-cơ-chế-mô-phỏng-engine)
6. [Cửa hàng – 6 vật phẩm](#6-cửa-hàng--6-vật-phẩm)
7. [Cây kỹ năng – 5 kỹ năng](#7-cây-kỹ-năng--5-kỹ-năng)
8. [Thành tựu – 10 mục](#8-thành-tựu--10-mục)
9. [Nhiệm vụ – 9 mục](#9-nhiệm-vụ--9-mục)
10. [9 loại báo cáo](#10-9-loại-báo-cáo)
11. [Kết thúc game & Chứng nhận](#11-kết-thúc-game--chứng-nhận)
12. [Hạ tầng backend (Supabase)](#12-hạ-tầng-backend-supabase)
13. [PWA / hoạt động offline](#13-pwa--hoạt-động-offline)
14. [Trải nghiệm liên kết ngoài](#14-trải-nghiệm-liên-kết-ngoài)
15. [Bảng tra nhanh hằng số](#15-bảng-tra-nhanh-hằng-số)

---

## 1. Luồng khởi động

```
#screen-splash (logo + spinner)
      ↓
#screen-login  →  toggleLang() / toggleTheme() để đổi ngôn ngữ & giao diện trước khi vào
      │
      ├─ doLogin()      → nhập Email, Tên đội (= tên doanh nghiệp), Mã lớp (tùy chọn), chọn vai (CEO/CFO/CMO/COO/SEC)
      └─ doLoginDemo()  → vào ngay với "Đội Demo" 5 nhân vật dựng sẵn, không cần nhập gì
      ↓
#app-shell (game chính) + tự động: showIntro() (6 slide cốt truyện, chỉ lần đầu) → playHuongIntro() (giọng chào thật) → startMusic()
      ↓
BizonTour (tour hướng dẫn 8 bước, tự chạy lần đầu – xem mục 1.1)
```

- **Mã lớp (Class ID)** là ranh giới quan trọng: có mã lớp → kết quả gửi lên Supabase, tính vào bảng xếp hạng lớp và **được cấp chứng nhận** khi hoàn thành; không có mã lớp → chơi "thử" (`isTrial()`), mọi thứ vẫn chơi được trọn 6 vòng nhưng không đồng bộ server, không có chứng nhận.
- `#dash-trial` (badge trên tab Tổng quan) nhắc người chơi biết họ đang ở chế độ thử.

### 1.1. Tour hướng dẫn tự động (`js/tutorial.js`)

- `window.BizonTour.start()/stop()` – tour **spotlight** (làm tối toàn màn hình, khoét một khung sáng quanh phần tử thật đang cần chỉ), không phải modal chung chung.
- Tự chạy lần đầu (`localStorage['bizon-tour-seen']`) sau khi `#app-shell` hiện và không có overlay nào khác đang mở (đợi tối đa 90 giây).
- 8 bước cố định, mỗi bước chuyển tab tương ứng rồi khoanh vùng: đếm vòng (`#dash-round`) → 3 KPI → thẻ Lumina → nút "Nhập quyết định" → 3 slider giá/marketing/sản lượng → nút Commit → khung chat cố vấn → thanh điều hướng dưới.
- Có thể replay bất kỳ lúc nào qua nút "❓ Hướng dẫn" trên Trang chủ – hữu ích cho giảng viên dạy lớp 40–60 sinh viên mà không cần cầm tay từng em.
- Hoàn tất tour → pháo giấy `createConfetti()`.

## 2. Khung ứng dụng (App shell)

- **Header**: avatar (→ tab Hồ sơ), tên đội, cấp độ/XP, nút đổi theme/ngôn ngữ/nhạc nền, số dư tiền mặt.
- **Thanh điều hướng dưới** (5 nút cố định): Tổng quan · Ra quyết định · Lumina · Báo cáo · Cửa hàng. 11 chức năng còn lại (Nhiệm vụ, Mini-game, Kỹ năng, Xếp hạng, Thành tựu, Advisor Pro, Giảng viên, Thị trường sống, Nhật ký, Cài đặt, Sổ tay) truy cập qua lưới "Truy cập nhanh" ở Trang chủ.
- **`#huong-caption-box`**: khung phụ đề nổi cố định, hiện câu thoại đang phát (giọng thật hoặc TTS) của Lumina/Hương – dùng chung cho mọi màn hình, không riêng tab Cố vấn.

## 3. Vòng lặp gameplay cốt lõi

Mỗi trong **6 vòng** (mỗi vòng ≈ 1 quý kinh doanh, 5–7 phút) đi qua trình tự:

1. **Biến cố thị trường xuất hiện** (`maybeShowEventIntro`) – overlay toàn màn hình giới thiệu biến cố của vòng (xem bảng ở [mục 5.4](#54-6-biến-cố-thị-trường-theo-vòng)), kèm lời khuyên của Lumina theo đúng biến cố.
2. **Ra quyết định** (tab Decisions) – 4–7 slider theo vai trò, có dự báo thị phần & dòng tiền sống, có thể hỏi "Nếu – Thì" (tối đa 2 lượt/vòng) và nghe gợi ý Cuộc họp đội trước khi chốt.
3. **Commit (khóa quyết định)** – không thể sửa sau khi khóa; nếu giảng viên đã khóa vòng (`toggleRoundLock`) thì bị chặn.
4. **Engine mô phỏng xử lý** (~2.3 giây, có màn loading) – tính thị phần, doanh thu, chi phí, các chỉ số vận hành, đồng thời 3 đối thủ AI cũng ra quyết định của họ.
5. **Đấu trường** (`showArena`) – 4 công ty (bạn + 3 AI) hiện trên bản đồ Việt Nam, thanh thị phần chạy hoạt hình, ai cao nhất "thắng vòng" và cắm cờ 🚩 lên tỉnh/thành tương ứng trên **bản đồ chinh phục** (Cần Thơ → TP.HCM → Khánh Hòa → Đà Nẵng → Thanh Hóa → Hà Nội).
6. **Kết quả vòng** – modal tổng kết số liệu + thành tựu/nhiệm vụ mới mở; nếu đạt đỉnh mới (thị phần ≥30% và có lãi) → màn `showVictory`; nếu lên cấp → `showLevelUp`.
7. Vòng 6 kết thúc → tự chuyển sang báo cáo "🏁 Tổng kết mùa giải" + pháo hoa + nhạc nền đổi sang bản remix chủ đề.

## 4. 16 tab chức năng – chi tiết từng tab

### 4.1. `tab-home` – Tổng quan

Màn hình trung tâm: banner biến cố đang diễn ra, 3 KPI (tiền mặt, thị phần %, điểm thương hiệu), **bản đồ chinh phục** (số cờ đã cắm/6, danh sách 6 tỉnh + trạng thái thắng/thua), thẻ đội hình, thẻ 3 đối thủ AI (xem [4.1.1](#411-3-đối-thủ-ai)), gợi ý nhanh từ Lumina, và lưới "Truy cập nhanh" 12 nút tới mọi tab/khu vực khác. Nút chính "Nhập quyết định vòng này" đưa thẳng sang tab Decisions.

#### 4.1.1. 3 đối thủ AI

| Đối thủ | Phong cách | Giá cơ sở | Marketing cơ sở | Điểm yếu (khắc chế) |
|---|---|---|---|---|
| 🐺 Alpha Dynamics | Giá rẻ tốc chiến | ~125k₫ | ~90tr₫/vòng | Biên lợi nhuận mỏng – đừng đua giá đáy, giữ thương hiệu |
| 🐘 Mekong Ventures | Cân bằng chắc chắn | ~150k₫ | ~60tr₫/vòng | Phản ứng chậm với biến động – tận dụng biến cố tốt trước |
| 🦚 Star Clay Co. | Cao cấp thương hiệu | ~195k₫ | ~75tr₫/vòng | Sản xuất thủ công khó mở rộng – chiếm phân khúc phổ thông họ bỏ ngỏ |

Giá/marketing thực tế mỗi vòng dao động ±12–25% quanh mức cơ sở bằng một PRNG **tất định theo seed đội** (`seed = seed*1103515245+12345 mod 2^31`) – cùng một đội chơi lại từ đầu sẽ ra đúng kết quả cũ (giúp giảng viên đối chiếu, không có yếu tố may rủi giữa các lần chấm lại). Chạm vào một đối thủ trên Trang chủ mở hồ sơ tình báo (`showRivalDetail`) với ảnh chân dung, chiến lược, điểm yếu và cách khắc chế.

### 4.2. `tab-decisions` – Ra quyết định kinh doanh

Chia theo 5 vai trò, mỗi vai một khối input:

| Vai | Input | Khoảng giá trị | Mặc định |
|---|---|---|---|
| CMO | Giá bán (`in-price`) | 80–300 (nghìn ₫), bước 5 | 150 |
| CMO | Ngân sách marketing (`in-mkt`) | 0–200 (triệu ₫), bước 5 | 50 |
| COO | Sản lượng sản xuất (`in-prod`) | 200–4000 (sp), bước 100 | 1200 |
| COO | Số nhân viên (`in-workers`)* | 20–100, bước 5 | 45 |
| COO | Ngân sách đào tạo/người (`in-train`)* | 0–10 (triệu ₫), bước 1 | – |
| CFO | R&D (`in-rd`) | 0–150 (triệu ₫), bước 5 | 30 |
| CFO | Kỳ hạn thanh toán (`in-term`)* | 30 / 60 / 90 ngày | 30 |
| CFO | Nguồn vốn | Vốn chủ (`equity`) / Vay ngân hàng (`loan`) | equity |

`*` = nhóm "Nâng cao", ẩn ở vòng 1–2, tự hiện từ vòng 3 (`syncAdvDecisions`) để người mới không bị ngợp.

Công cụ hỗ trợ trước khi chốt:
- **Dự báo Thị phần sống** (`mf-share`/`mf-bar`/`mf-verdict`) – cập nhật realtime theo slider, so với ước tính trung bình 3 đối thủ.
- **Dự báo Dòng tiền/CVP** (CFO) – lợi nhuận ròng ước tính, tiền vào/ra, điểm hòa vốn.
- **Cuộc họp đội** – 4 gợi ý tất định theo seed đội+vòng (từ góc nhìn CFO/CMO/COO/SEC), bấm "Nghe theo" để tự điền slider (tính vào thành tựu *A_TEAM* khi dùng ≥3 lần).
- **Mô phỏng "Nếu – Thì"** (`runWhatIf`, CEO/CFO) – tối đa **2 lượt/vòng**.
- **Commit** (`commitDecisions`) – khóa vòng, không sửa được nữa; bị chặn nếu giảng viên đã khóa vòng hoặc thanh khoản không đủ (chọn vốn chủ mà chi vượt số dư + 300tr₫ đệm).

### 4.3. `tab-advisor` – Lumina AI

- Ảnh + trạng thái "MARKET VOLATILITY" (thấp/trung bình/cao theo tông biến cố hiện tại).
- 🔊 Nút nghe **giọng thật** của Hương AI chào hỏi (`playHuongIntro`, có phụ đề đồng bộ).
- Khung chat: 3 câu hỏi dựng sẵn (giá/marketing/rủi ro) + ô nhập tự do + nút mic (giọng nói) — giới hạn **3 lượt hỏi/vòng** (`AI_QUOTA_PER_ROUND`, tăng +2 nếu có kỹ năng *SK_AI1*).
- Bật/tắt giọng đọc (TTS), chọn giọng nam/nữ.
- "Phân tích chuyên sâu theo vai trò" – thẻ riêng cho từng vai C-Suite.
- "Bộ nhớ doanh nghiệp" – lịch sử các lần hỏi/đáp trước đó (vai trò SEC "ghi biên bản").

### 4.4. `tab-reports` – Báo cáo & Phân tích

9 tab con, xem chi tiết công thức ở [mục 10](#10-9-loại-báo-cáo): P&L, Dòng tiền, CVP & Chi phí, 🕵️ Chi phí đối thủ, 🏁 Tổng kết mùa giải, 👥 Nhân sự, 🧩 BMC, Khấu hao, ⚡ Năng lượng.

### 4.5. `tab-shop` – Cửa hàng

Mua vật phẩm bằng tiền mặt trong game (6 món – [mục 6](#6-cửa-hàng--6-vật-phẩm)), xem "Kho đồ" lọc theo Tất cả/Vật phẩm/Bản thiết kế, chọn 1 món để xem mô tả chi tiết và bấm "Sử dụng 🚀" (với vật phẩm tiêu hao).

### 4.6. `tab-skills` – Cây kỹ năng

Dùng XP tích lũy mở khóa 5 kỹ năng vĩnh viễn, không thể hoàn tác ([mục 7](#7-cây-kỹ-năng--5-kỹ-năng)).

### 4.7. `tab-leaderboard` – Bảng xếp hạng (trong game)

So sánh 4 "công ty" trong **chính ván đang chơi** (bạn + 3 AI) theo tổng lợi nhuận lũy kế, huy chương 🥇🥈🥉4️⃣. **Lưu ý:** đây hoàn toàn cục bộ/offline, không phải bảng xếp hạng liên-đội-liên-lớp – bảng xếp hạng thật giữa các đội trong lớp nằm ở trang riêng `giang-vien.html` (đọc server), xem [mục 12](#12-hạ-tầng-backend-supabase).

### 4.8. `tab-achievements` – Thành tựu

Lưới huy hiệu ([mục 8](#8-thành-tựu--10-mục)) + khung **Chứng nhận hoàn thành** (chỉ hiện khi đã tốt nghiệp 6 vòng), xem [mục 11](#11-kết-thúc-game--chứng-nhận).

### 4.9. `tab-missions` – Nhiệm vụ

9 nhiệm vụ ([mục 9](#9-nhiệm-vụ--9-mục)) thưởng thêm tiền + XP ngoài luồng chơi chính, có huy hiệu số lượng nhiệm vụ sẵn sàng nhận trên nút Trang chủ.

### 4.10. `tab-minigame` – "Clay Factory Frenzy" 🏭

Mini-game gõ nhịp: băng chuyền cuộn vật phẩm, gõ đúng vật phẩm mục tiêu trong **30 giây**, tối đa **3 lượt/vòng**, quy đổi điểm → tiền (2tr₫/điểm, tối đa 60tr₫/lượt). Có cửa hàng đổi thưởng riêng và bảng xếp hạng minigame. Đạt ≥15 điểm mở nhiệm vụ *M_MINIGAME*.

### 4.11. `tab-instructor` – "Giảng viên" (trong game)

⚠️ **Khác với trang `giang-vien.html`** (dashboard ngoài, đọc dữ liệu thật từ server, xem mục 12). Tab này là công cụ **cục bộ, trên máy đang chơi**:
- Khóa/mở khóa vòng hiện tại (`toggleRoundLock`) – ép các đội dừng chỉnh sửa, dùng để giới hạn thời gian thảo luận.
- Danh sách đội (kể cả 3 AI) kèm lợi nhuận lũy kế.
- Nút cấp vốn nhanh "+100tr₫" (`grantFunds`) – ghi vào nhật ký cấp vốn hiển thị ngay bên dưới.
- Link ra hướng dẫn giảng viên đầy đủ trên GitHub.

### 4.12. `tab-advisorpro` – Lumina Advisor Pro

Máy tính "Nếu – Thì" **độc lập với ván game** – nhập số liệu doanh thu/chi phí/marketing/tăng trưởng thật (ví dụ của một dự án khởi nghiệp thật ngoài đời) để nhận phân tích kịch bản từ Lumina. Không đụng tới `S` (trạng thái ván chơi).

### 4.13. `tab-market` – "📡 Thị trường sống"

Dashboard giám sát thời gian thực: ticker tin tức cuộn (biến cố, tiếng nói khách hàng, động thái đối thủ), "BizOn Monitor" (sparkline các chỉ số đội + 3 AI theo từng vòng đã qua) – màn hình chỉ xem, không thao tác quyết định ở đây.

### 4.14. `tab-journal` – "📔 Nhật ký đội"

Dòng thời gian tự động ghi lại quyết định + kết quả mỗi vòng (vai trò SEC), dùng làm tư liệu thuyết trình cuối buổi hoặc để SEC tổng kết bài học rút ra.

### 4.15. `tab-profile` – Hồ sơ

Thông tin cá nhân trong ván chơi (tên, email, vai trò, cấp/XP, tổng lợi nhuận, số vòng đã hoàn thành) + mục tĩnh giới thiệu "Đội ngũ sáng lập BizOn" (Đỗ Thùy Hương & Tú Phan).

### 4.16. `tab-settings` – Cài đặt

Bật/tắt nhạc nền, theme sáng/tối, ngôn ngữ VI/EN; lối tắt xem lại Giới thiệu/Sổ tay/Premium; liên kết ra hệ sinh thái BizOn (Arcade, Go Global, Thư viện, Kho âm nhạc…); nút **"♻️ Chơi lại từ đầu"** (xoá toàn bộ tiến trình lưu cục bộ – không thể hoàn tác).

**BizOn Premium** (`showPremium`, mở từ Cài đặt hoặc Trang chủ) – màn quảng bá gói dành cho giảng viên/trường (lớp không giới hạn số đội, xuất báo cáo/chứng chỉ PDF, chế độ giảng viên nâng cao, phân tích hiệu suất từng thành viên, hỗ trợ ưu tiên). Nút "Gửi yêu cầu nâng cấp" hiện **chỉ đánh dấu cờ cục bộ** (`localStorage['bizon-premium']='requested'`) – chưa có thanh toán/backend thật, là màn "xin quyền" chờ duyệt thủ công.

## 5. Cơ chế mô phỏng (Engine)

### 5.1. Công thức thị phần ("sức hấp dẫn")

```
elasticity   = 1.8 × (elasticityMul của biến cố, nếu có)
mktEff       = marketing × (mktBoost biến cố) × hệ_số_kỹ_năng_marketing × (1.3 nếu có Marketing Boost)
sức_hấp_dẫn  = (150 / giá_bán) ^ elasticity × (1 + √mktEff / 18) × thương_hiệu ^ trọng_số_thương_hiệu
thị_phần(%)  = 100 × sức_hấp_dẫn_của_bạn / (sức_hấp_dẫn_của_bạn + Σ sức_hấp_dẫn_3_AI)
```
3 đối thủ AI dùng cùng công thức nhưng thương hiệu và biến động giá/marketing riêng của họ (mục 4.1.1) – không hưởng hệ số kỹ năng/vật phẩm của người chơi.

### 5.2. Sản lượng bán được & tồn kho

```
cầu_thị_trường = 12.000 sp × hệ_số_cầu_biến_cố × hệ_số_cầu_kỳ_hạn_thanh_toán × thị_phần
sold           = min(cầu_thị_trường, sản_lượng + tồn_kho) × hệ_số_đáp_ứng (giảm 15% khi Khủng hoảng chuỗi cung ứng)
đơn_hàng_mất   = cầu_thị_trường − sold
```

### 5.3. Chi phí, lợi nhuận & chỉ số vận hành (đơn vị triệu ₫ trừ khi ghi khác)

```
giá_thành/sp   = 45 nghìn₫ × hệ_số_chi_phí_biến_cố × hệ_số_kỹ_năng × (0.92 nếu có R&D Upgrade)
                 × max(0.8, 1 − R&D_tích_lũy/1500)          ← R&D giảm tối đa 20% giá thành, vĩnh viễn
khấu_hao       = công_suất_máy_tối_đa × 1.5% × (0.8 nếu Lean Ops)
chi_phí_cố_định = 30tr₫/vòng × hệ_số_biến_cố × (0.85 nếu Pin Mặt Trời) × (0.85 nếu Cắt giảm chi phí 1 lần)
lãi_vay_CFO    = dư_nợ_vay × 5%/vòng                         ← khác lãi thấu chi bên dưới
lãi_thấu_chi   = phần_chi_vượt_số_dư(nếu chọn "Vay") × 8.5%
lợi_nhuận_ròng = (doanh_thu − tổng_chi_phí) × hệ_số_kỹ_năng_tài_chính   (SK_FIN1: ×1.05)
```
Các chỉ số vận hành khác: **OEE** = 88 − tác_động_biến_cố − quá_tải_máy×25 − căng_thẳng_nhân_sự×20 + thưởng_bảo_trì + thưởng_đào_tạo (giới hạn 55–96%, thưởng bảo trì phai 2 điểm/vòng); **tỷ lệ phế phẩm** tăng khi OEE thấp; **Brand Loyalty** = min(95, 45 + thương_hiệu×25); **ROI(%)** = 1000×lợi_nhuận/tổng_chi_phí; **Quick Ratio** = số_dư/500 (vốn khởi điểm); **ESG Score** = 50 + tối đa 20 (Pin Mặt Trời) + tối đa 15 (R&D tích lũy) + 5 (Lean Ops).

### 5.4. 6 biến cố thị trường theo vòng

| Vòng | Biến cố | Tông | Tác động chính |
|---|---|---|---|
| 1 | Thị trường ổn định | 🟢 tốt | Chuẩn – vòng làm quen |
| 2 | 🌟 Cơ Hội Vàng | 🟢 tốt | Tổng cầu +35%, R&D được nhân 1.5 lần hiệu quả |
| 3 | ⚔️ Cạnh Tranh Về Giá | 🟡 cảnh báo | Thị trường nhạy giá hơn 40% (elasticityMul 1.4) |
| 4 | ⚡ Khủng Hoảng Năng Lượng | 🔴 xấu | Chi phí +30%, OEE −10 điểm (Pin Mặt Trời giảm nửa tác động) |
| 5 | 🚢 Khủng Hoảng Chuỗi Cung Ứng | 🔴 xấu | Giá thành +25%, tỷ lệ đáp ứng đơn hàng −15% |
| 6 | 🐉 Việt Nam Hóa Rồng (Chung kết) | 🟢 tốt | Cầu +25%, khách ít nhạy giá hơn, lương +10%, **trọng số thương hiệu ×1.5** |

Mỗi biến cố có ảnh Lumina + lời khuyên riêng, và nút hành động gợi ý (ví dụ vòng 4 dẫn thẳng tới báo cáo Năng lượng).

## 6. Cửa hàng – 6 vật phẩm

| Vật phẩm | Loại | Giá | Hiệu ứng |
|---|---|---|---|
| ☀️ Pin Mặt Trời | Bản thiết kế (vĩnh viễn) | 150tr₫ | −15% chi phí cố định mãi mãi, +20 ESG, giảm nửa tác động OEE khi khủng hoảng năng lượng |
| 📣 Marketing Boost | Vật phẩm dùng 1 lần | 80tr₫ | +30% hiệu quả marketing vòng kế tiếp |
| 🔬 R&D Upgrade | Bản thiết kế | 120tr₫ | −8% giá thành sản xuất vĩnh viễn |
| 🏭 Lean Operations | Bản thiết kế | 100tr₫ | −20% khấu hao máy móc |
| 🛡️ Khiên bảo hiểm | Vật phẩm dùng 1 lần | 60tr₫ | Vô hiệu hoàn toàn tác động xấu của 1 biến cố (biến thành biến cố "ổn định") |
| 📊 Gói dữ liệu thị trường | Vật phẩm dùng 1 lần | 50tr₫ | Lumina tiết lộ trước biến cố của vòng sau |

Giá thực trả giảm 10% nếu đã mở kỹ năng *SK_NEG1*.

## 7. Cây kỹ năng – 5 kỹ năng

| Kỹ năng | Chi phí XP | Hiệu ứng |
|---|---|---|
| Quản trị dòng tiền (SK_FIN1) | 50 | +5% lợi nhuận ròng mỗi vòng |
| Marketing số (SK_MKT1) | 80 | +10% hiệu quả marketing |
| Sản xuất tinh gọn (SK_OPS1) | 80 | −5% giá thành sản phẩm |
| Đàm phán chiến lược (SK_NEG1) | 120 | −10% giá vật phẩm Cửa hàng |
| Cộng hưởng Lumina (SK_AI1) | 150 | +2 lượt hỏi Lumina mỗi vòng |

Mở bằng XP tích lũy trừ XP đã tiêu (`spentXp`); **không thể gỡ bỏ/hoàn tác** sau khi mở.

## 8. Thành tựu – 10 mục

| Thành tựu | Điều kiện |
|---|---|
| Khởi nghiệp | Hoàn thành vòng 1 |
| Có lãi! | Bất kỳ vòng nào có lợi nhuận ròng dương |
| Dẫn đầu thị trường | Thị phần ≥30% |
| Vượt bão khủng hoảng | Có lãi đúng vòng Khủng hoảng Năng lượng |
| Két sắt đầy | Số dư ≥1.000tr₫ (1 tỷ) |
| Cắm cờ đầu tiên | Thắng ít nhất 1 chặng trên bản đồ chinh phục |
| Chiến lược gia Nếu–Thì | Dùng mô phỏng "Nếu–Thì" ít nhất 1 lần |
| Lắng nghe đội | Áp dụng gợi ý Cuộc họp đội ≥3 lần |
| Tốt nghiệp BizOn | Hoàn thành đủ 6 vòng |
| Vô địch BizOn | Hoàn thành game với tổng lợi nhuận ≥ mọi đối thủ AI |

## 9. Nhiệm vụ – 9 mục

| Nhiệm vụ | Điều kiện | Thưởng |
|---|---|---|
| Khởi động | Hoàn thành ≥1 vòng | 20tr₫ + 10XP |
| Kinh doanh có lãi | 1 vòng lãi dương | 30tr₫ + 20XP |
| Chiếm lĩnh thị trường | Thị phần ≥30% | 50tr₫ + 30XP |
| Nhà đầu tư thông thái | Mua ≥1 vật phẩm | 20tr₫ + 10XP |
| Người bạn của Lumina | Hỏi Lumina ≥3 lần | 15tr₫ + 10XP |
| Học không ngừng | Mở ≥1 kỹ năng | 25tr₫ + 15XP |
| Thợ đất sét cừ khôi | Đạt ≥15 điểm Mini-game | 25tr₫ + 15XP |
| Thuyền trưởng bão táp | Có lãi đúng vòng Khủng hoảng năng lượng | 60tr₫ + 40XP |
| Tốt nghiệp BizOn | Hoàn thành 6 vòng | 100tr₫ + 50XP |

## 10. 9 loại báo cáo

| Báo cáo | Nội dung chính |
|---|---|
| **P&L** | Bảng kết quả kinh doanh cơ bản theo vòng |
| **Dòng tiền** | 3 dòng: Kinh doanh, Đầu tư (khấu hao), Tài chính (lãi vay) – biểu đồ số dư ví theo vòng |
| **CVP & Chi phí** | Sản lượng/giá hòa vốn, lãi góp/đơn vị, cấu trúc chi phí cố định vs biến đổi, ROS/ROE/ROA, so với chuẩn ngành (biên lợi nhuận ròng 12%) |
| **🕵️ Chi phí đối thủ** | Tổng chi phí + marketing thực chi của bạn vs 3 AI (xếp hạng), ROI marketing so chuẩn ngành ×3.0, lợi thế R&D dài hạn (giá thành AI cố định 45k/sp) |
| **🏁 Tổng kết mùa giải** | Chỉ xuất hiện cuối game: doanh thu/lợi nhuận lũy kế, tăng trưởng thị phần, xếp hạng 4 công ty, danh sách thành tựu, lời nhận xét tổng thể |
| **👥 Nhân sự** | Số nhân viên, năng suất/người, quỹ lương, chi phí đào tạo, lịch sử OEE |
| **🧩 BMC** | Business Model Canvas 8 khối, cập nhật động theo dữ liệu vòng gần nhất |
| **Khấu hao** | Biểu đồ khấu hao máy móc theo vòng |
| **⚡ Năng lượng** | 3 dây chuyền sản xuất, mức tiêu thụ kWh, ngưỡng cảnh báo, nút "Tối ưu dây chuyền" (150tr₫) và "Bảo trì" (60tr₫) |

## 11. Kết thúc game & Chứng nhận

- Game tự đặt `finished = true` ngay khi hoàn thành vòng 6 (trước khi chấm thành tựu, để các thành tựu "Tốt nghiệp"/"Vô địch" mở được đúng lúc).
- Màn kết quả vòng cuối tự chuyển sang tab Báo cáo → "🏁 Tổng kết mùa giải", kèm pháo hoa và nhạc nền đổi sang bản remix chủ đề.
- **Chứng nhận hoàn thành** (tab Thành tựu → `#certificate-box`) **chỉ cấp cho ván có Mã lớp** (không cấp cho ván chơi thử). Nút tải chứng nhận vẽ trực tiếp ra ảnh PNG 1400×990px hoàn toàn ngoại tuyến (canvas), gồm: tên đội, mã lớp, hạng chung cuộc, thị phần, lợi nhuận tích lũy, và chữ ký scan của NCS. Đỗ Thùy Hương & PGS.TS. Phan Anh Tú — có bản Tiếng Việt và English.
- Đỉnh cao tạm thời trong lúc chơi (thị phần ≥30% và có lãi, vượt kỷ lục cũ của chính đội) sẽ trồi ra màn "Chúc mừng chiến thắng" riêng ở giữa ván — không phải màn kết thúc game.

## 12. Hạ tầng backend (Supabase)

Backend "mỏng": **toàn bộ mô phỏng chạy trên máy người chơi**, server chỉ nhận bản sao kết quả để phục vụ chấm điểm/nghiên cứu và cho phép đổi máy giữa chừng. Chi tiết cấu hình & vận hành: `docs/SUPABASE-SETUP.md`.

- **Lưu cục bộ**: `localStorage['bizon2026']` – ghi lại sau **mọi** thay đổi trạng thái (mua đồ, mở kỹ năng, nhận nhiệm vụ, commit vòng...), đồng bộ, không debounce. Đây là nguồn dữ liệu chính khi chơi offline/không mã lớp.
- **Gửi kết quả mỗi vòng** (`BizonBackend.submitRound`, bảng `round_submissions`) – chỉ gửi khi có Mã lớp; kèm mã băm SHA-256 để đối chiếu chống gian lận; mất mạng thì xếp hàng trong `localStorage['bizon-backend-queue']` (tối đa 60 bản ghi) và tự gửi lại khi có mạng.
- **Lưu tiến trình theo đội để đổi máy** (`upsert_team_save` / bảng `team_saves`) – cho phép một đội đăng nhập từ máy khác trong phòng máy dùng chung mà vẫn tiếp tục đúng chỗ đang chơi dở, thay vì bị ghi đè bằng ván mới (Đội Demo không dùng cơ chế này, để tránh nhiều khách lạ ghi đè lẫn nhau).
- **Dashboard giảng viên ngoài game** (`giang-vien.html`, khác hẳn tab "🧑‍🏫 Giảng viên" trong game) – nhập Mã lớp + Khóa giảng viên để xem bảng xếp hạng thời gian thực (làm mới mỗi 10 giây) và xuất CSV chấm điểm, đọc qua 2 hàm RPC bảo mật `bizon_leaderboard`/`bizon_feed` (chỉ trả dữ liệu khi đúng khóa – sinh viên dùng khoá anon-public không đọc được bảng này).
- **Giám sát lỗi tự động** (bảng `client_errors`) – mọi trang BizOn tự báo lỗi JavaScript/tài nguyên tải hỏng về server, không cần sinh viên báo cáo thủ công.

## 13. PWA / hoạt động offline

- Cài được như app (`manifest.webmanifest`, standalone, portrait), tên hiển thị "BizOn Bật Nghiệp".
- Service Worker (`sw.js`) precache toàn bộ trang HTML chính, JS lõi, CSS/font tự host và phần lớn ảnh nhân vật/minh họa — game chơi được **hoàn toàn ngoại tuyến** sau lần tải đầu.
- Chiến lược cache theo loại tài nguyên: điều hướng HTML → network-first (fallback trang cũ/`index.html` khi mất mạng); ảnh → stale-while-revalidate; audio/video → cache theo yêu cầu; JS/CSS/font → cache-first theo phiên bản.
- Đổi tên cache mỗi lần cập nhật nội dung quan trọng (hiện tại `bizon-v246`) để buộc trình duyệt tải bản mới — nếu không thấy cập nhật, đóng hẳn tab/app rồi mở lại.

## 14. Trải nghiệm liên kết ngoài

Từ Trang chủ/Cài đặt, game liên kết sang các trải nghiệm khác trong hệ sinh thái BizOn (không thuộc phạm vi mô phỏng 6 vòng của `game.html`, có tài liệu riêng nếu cần đào sâu):

- **🕹️ BizOn Arcade** (`games.html`) – trung tâm các trò chơi nhỏ khác của hệ sinh thái.
- **🌏 BizOn Go Global** (`global.html`) – mở rộng quốc tế hoá sau khi chinh phục xong Việt Nam: chọn 1 trong 7 thị trường quốc tế, đàm phán đối tác bản địa, 4 phương thức thâm nhập.
- **🛶 Bến Phù Sa** – mô phỏng khởi nghiệp "gánh hàng rong" 5 tuần, cùng vũ trụ nhân vật Lumina.
- **📖 Sổ tay hướng dẫn** (trong game, `showManual()`) – tra cứu nhanh luật chơi, vai trò, đối thủ AI, mẹo chơi, xử lý sự cố ngay trong ứng dụng.

## 15. Bảng tra nhanh hằng số

```
ROUNDS_TOTAL              = 6
BASE_MARKET_UNITS         = 12.000 sp/vòng
UNIT_COST                 = 45 nghìn₫/sp (giá thành gốc)
REF_PRICE                 = 150 nghìn₫ (giá tham chiếu)
PRICE_ELASTICITY          = 1.8
FIXED_COST                = 30 triệu₫/vòng
STARTING_BALANCE          = 500 triệu₫
XP_PER_LEVEL              = 100
AI_QUOTA_PER_ROUND        = 3 lượt hỏi Lumina  (+2 nếu có SK_AI1)
WHAT_IF_LIMIT             = 2 lượt/vòng
CREDIT_INTEREST (thấu chi)= 8.5%/vòng
Lãi vay CFO               = 5%/vòng
WAGE_PER_WORKER           = 1 triệu₫/người/vòng
UNITS_PER_WORKER          = 70 sp/người (năng lực sản xuất)
Mini-game                 = 30 giây/lượt, tối đa 3 lượt/vòng, 2tr₫/điểm (trần 60tr₫/lượt)
```

---

*Tài liệu này mô tả trạng thái mã nguồn tại thời điểm viết (nhánh `claude/brave-feynman-jbffdk`). Khi thêm/sửa tính năng trong `game.html`/`js/app.js`/`js/engine.js`, cập nhật lại các bảng tương ứng ở đây.*
