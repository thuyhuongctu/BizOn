# Bốc thăm 2 Trường hợp — thiết kế nội dung v1 (CHƯA nối code)

**Ngày:** 2026-09-16
**Trạng thái:** Chỉ thiết kế/viết nội dung. Chưa sửa `game.html`, `js/app.js`, `js/engine.js`.
Mùa 1 (KT330H-M01/M02) đang chơi dở Vòng 1–2 tuần này — không đụng gì tới game
đang chạy cho tới khi Hương duyệt nội dung dưới đây và quyết định thời điểm áp
dụng (việc nối code là một bước riêng, làm sau khi có go-ahead).

## 1. Vấn đề cần giải quyết

SV thấy vòng chơi hiện tại chưa kịch tính — về bản chất mỗi vòng chỉ là kéo 6
thanh trượt (giá, marketing, sản lượng, nhân sự, đào tạo, R&D) rồi bấm khóa.
Biến cố thị trường (`MARKET_EVENTS_LIST`, `js/engine.js:18-66`) đã có kịch bản
(icon, mô tả, lời khuyên của Lumina) nhưng **giống hệt nhau cho mọi đội, mọi
lớp, mọi mùa** — chơi lại Mùa 2 là đoán trước được y hệt Mùa 1.

## 2. Cơ chế đề xuất: bốc thăm 1 trong 2 Trường hợp ở đầu mùa

Ở Vòng 0 (buổi kỹ thuật/chuẩn bị), sau khi vào đội cố định, mỗi đội **bốc thăm**
để nhận **Trường hợp A** hoặc **Trường hợp B** — 6 vòng vẫn y hệt về cấu trúc
(`ROUNDS_TOTAL = 6` không đổi) nhưng câu chuyện thị trường khác hẳn.

**Nguyên tắc công bằng (quan trọng nhất):** hai trường hợp phải **giống hệt
nhau về mọi con số ảnh hưởng đến kết quả tài chính** (`demand`, `costMul`,
`elasticityMul`, `rdBoost`, `oeeHit`, `fulfillMul`, `wageMul`, `brandPow`,
`mktBoost`) theo từng vòng — chỉ khác **câu chuyện, tên gọi, lời thoại
Lumina, icon**. Vì điểm BizOn tournament (15% học phần) so bảng tổng sắp giữa
các đội, nếu một trường hợp "dễ ăn điểm" hơn thì không công bằng. Bảng đối
chiếu ở mục 5 cho thấy A và B khớp 100% về số.

**Bốc thăm bằng cơ chế đã có sẵn, chưa dùng tới:** `js/core/seed-engine.js`
đã định nghĩa `createSeed(classId, teamId, scenarioId, engineVersion)` và hàm
`pick(seed, namespace, items)` — đúng thứ cần cho "bốc thăm không thể bốc lại"
(xác định 1 lần từ `classId:teamId`, không đổi dù SV refresh trang). Việc nối
mảng này vào game thật là bước triển khai sau, chưa làm ở đây.

**Trải nghiệm bốc thăm (Vòng 0):** dùng lại đúng khung modal biến cố toàn màn
hình đã có (`maybeShowEventIntro`, `js/app.js:685-737` — rung màn hình, âm
thanh sting, thẻ tác động, lời Lumina) thay vì làm mới: SEC bấm "Bốc thăm" →
2 phong bì lật úp → phong bì của đội tự lật mở (xác định bởi seed, không phải
random thật) → hiện tên + ảnh bìa Trường hợp A/B đội mình trúng → Lumina giới
thiệu bối cảnh 6 vòng sắp tới.

## 3. Trường hợp A — "Giữ Sân Nhà" (= nội dung hiện có, không đổi)

Giữ nguyên 100% `MARKET_EVENTS_LIST()` hiện tại trong `js/engine.js:18-66`.
Tóm tắt mạch truyện: khởi động ổn định → gói kích cầu chính phủ (Vòng 2) →
đối thủ nội giảm giá châm ngòi chiến tranh giá (Vòng 3) → khủng hoảng năng
lượng toàn cầu (Vòng 4) → khủng hoảng chuỗi cung ứng (Vòng 5) → Việt Nam hóa
rồng (Vòng 6). Không có đối thủ ngoại cụ thể nào được nhắc tên — thị trường
là một "bối cảnh chung" trừu tượng.

## 4. Trường hợp B — "Sóng Ngoại Nhập" (nội dung mới)

Mạch truyện xuyên suốt 6 vòng: một đối thủ ngoại nhập cụ thể — tái dùng
**Star Clay Co.** (đã có sẵn trong `COMPETITORS`, `js/engine.js:87`, style
`premium` — đúng chất "hàng ngoại cao cấp", không cần thêm đối thủ mới vào
engine) — làm "phản diện" xuyên suốt mùa, tạo cảm giác đối đầu rõ ràng thay
vì chỉ số liệu trừu tượng. Toàn bộ số (`demand`, `costMul`, …) **giống hệt**
Trường hợp A theo từng vòng — xem bảng đối chiếu mục 5.

```
Vòng 1 — id: EV_STABLE_B · tone: good · icon: 🌤️
name (vi): Thị trường ổn định — nhưng có tin đồn
name (en): Stable Market — But a Rumor Is Spreading
tag (vi/en): VÒNG KHỞI ĐỘNG / KICKOFF ROUND
desc (vi): Vòng khởi động — nhu cầu thị trường ở mức chuẩn. Nhưng có tin đồn
  Star Clay Co., hãng đất sét cao cấp từ nước ngoài, đang âm thầm khảo sát
  thị trường Việt Nam.
desc (en): The kickoff round — market demand at baseline. But rumor has it
  Star Clay Co., a premium overseas clay brand, is quietly scouting the
  Vietnamese market.
demand: 1.0, costMul: 1.0   (giống hệt A Vòng 1)
impacts: [{icon:📈, label: Nhu cầu thị trường/Market demand, value: Chuẩn/Baseline, dir: flat},
          {icon:👀, label: Tín hiệu đối thủ ngoại/Foreign rival signal, value: Tin đồn/Rumor, dir: flat}]
luminaImg: lumina-vest-thumbsup
luminaMsg (vi): Chào cả đội! Vòng đầu vẫn là lúc xây nền tảng — nhưng nghe
  đâu Star Clay Co. đang để mắt tới Việt Nam. Cứ vững vàng, đội mình xây móng
  cho chắc trước đã!
luminaMsg (en): Hi team! The first round is still about building the
  foundation — but word is Star Clay Co. has its eye on Vietnam. Stay
  steady, let's build a solid base first!
cta (vi/en): 🎯 Nhập quyết định ngay / 🎯 Enter decisions now

Vòng 2 — id: EV_GOLDEN_B · tone: good · icon: 🌟
name (vi): Làn Sóng Hội Nhập
name (en): The Integration Wave
tag (vi/en): SỰ KIỆN ĐẶC BIỆT / SPECIAL EVENT
desc (vi): Hiệp định thương mại tự do mới vừa có hiệu lực, thuế nhập khẩu
  nguyên liệu giảm mạnh. Đồng thời, Star Clay Co. chính thức tuyên bố gia
  nhập thị trường Việt Nam với chiến dịch ra mắt rầm rộ — cơ hội và thách
  thức đến cùng lúc.
desc (en): A new free-trade agreement just took effect, slashing import
  tariffs on raw materials. At the same time, Star Clay Co. officially
  announces its entry into Vietnam with a loud launch campaign — opportunity
  and threat arrive together.
demand: 1.35, costMul: 1.0, rdBoost: 1.5   (giống hệt A Vòng 2)
impacts: [{icon:🧾, label: Thuế nhập nguyên liệu/Material import tariff, value: -35%, dir: down-good},
          {icon:🌊, label: Đối thủ ngoại/Foreign rival, value: Chính thức gia nhập/Officially enters, dir: up-bad}]
luminaImg: lumina-ao-dai-clap
luminaMsg (vi): Cơ hội lớn đây! FTA giúp CFO tiết kiệm chi phí nguyên liệu
  đáng kể. Nhưng đừng lơ là — Star Clay Co. vừa tuyên bố vào cuộc, CMO nên
  chuẩn bị tinh thần cho vòng sau!
luminaMsg (en): Big opportunity! The FTA saves the CFO real money on
  materials. But don't get comfortable — Star Clay Co. just announced its
  entry, CMO should brace for next round!
cta (vi/en): 🏭 Tăng công suất ngay / 🏭 Ramp up capacity now

Vòng 3 — id: EV_PRICEWAR_B · tone: warn · icon: ⚔️
name (vi): Ra Mắt Rầm Rộ
name (en): The Big Launch
tag (vi/en): CẢNH BÁO THỊ TRƯỜNG / MARKET WARNING
desc (vi): Star Clay Co. tung chiến dịch ra mắt: định vị cao cấp nhưng giá
  mở màn thấp bất ngờ để giành thị phần nhanh — khách hàng cực nhạy cảm về
  giá trong vòng này.
desc (en): Star Clay Co. launches its campaign: premium positioning but a
  surprisingly low opening price to grab share fast — customers are
  extremely price-sensitive this round.
demand: 1.0, costMul: 1.0, elasticityMul: 1.4   (giống hệt A Vòng 3)
impacts: [{icon:🏷️, label: Giá ra mắt của Star Clay Co./Star Clay Co. launch price, value: -15%, dir: down},
          {icon:💔, label: Độ nhạy giá của khách/Customer price sensitivity, value: CAO/HIGH, dir: up-bad}]
luminaImg: lumina-vest-worried
luminaMsg (vi): Thưa CMO, Star Clay Co. vừa châm ngòi chiến tranh giá ngay
  từ màn ra mắt! Ta có 2 lối đi: Bundling hoặc tăng Value-Added — đừng lao
  vào giảm giá sâu kẻo mất biên lợi nhuận.
luminaMsg (en): CMO, Star Clay Co. just sparked a price war right at launch!
  We have 2 paths: a Bundling tactic or adding more Value-Added — don't dive
  into deep discounts or we'll lose our margin.
cta (vi/en): 🤖 Xem giải pháp từ Lumina / 🤖 See Lumina's solution

Vòng 4 — id: EV_RECESSION_B · tone: bad · icon: 💱
name (vi): Khủng Hoảng Tỷ Giá
name (en): Currency Crisis
tag (vi/en): CẢNH BÁO KHẨN CẤP / URGENT WARNING
desc (vi): Đồng nội tệ mất giá mạnh trong lúc Star Clay Co. đổ tiền quảng
  cáo áp đảo toàn ngành. Chi phí nhập nguyên liệu leo thang, sức mua chung
  suy giảm.
desc (en): The local currency drops sharply just as Star Clay Co. floods
  the industry with ad spend. Import material costs climb, overall
  purchasing power falls.
demand: 0.7, costMul: 1.3, shake: true, oeeHit: 10   (giống hệt A Vòng 4)
impacts: [{icon:📈, label: Chi phí nguyên liệu nhập/Import material cost, value: +30%, dir: up-bad},
          {icon:🏭, label: Hiệu suất (OEE)/Efficiency (OEE), value: -10%, dir: down}]
luminaImg: lumina-ao-dai-alert
luminaMsg (vi): Cảnh báo khẩn cấp! Tỷ giá biến động mạnh đúng lúc đối thủ
  ngoại đang mạnh tay nhất. COO hãy rà soát lịch chạy máy, CFO cần dự phòng
  thêm vốn ngay!
luminaMsg (en): Urgent warning! The exchange rate is swinging hard right
  when the foreign rival is spending hardest. COO, review the machine
  schedule, and CFO, set aside extra reserve capital right away!
cta (vi/en): ⚡ Tối ưu năng lượng ngay / ⚡ Optimize energy now
  (giữ nguyên tab 'reports'/'energy' để không phải thêm route mới)

Vòng 5 — id: EV_SUPPLY_B · tone: bad · icon: 🚚
name (vi): Cảng Tắc Nghẽn Vì Hàng Ngoại
name (en): Port Congestion from the Import Surge
tag (vi/en): CẢNH BÁO KHẨN CẤP / URGENT WARNING
desc (vi): Làn sóng hàng nhập khẩu — trong đó có lô hàng lớn của Star Clay
  Co. — khiến cảng biển quá tải nghiêm trọng, dây chuyền sản xuất của BizOn
  bị đình trệ theo.
desc (en): The import surge — including a large Star Clay Co. shipment —
  overwhelms the seaport, stalling BizOn's production line along with it.
demand: 1.0, costMul: 1.25, fulfillMul: 0.85, shake: true   (giống hệt A Vòng 5)
impacts: [{icon:💰, label: Giá thành đơn vị/Unit cost, value: +25%, dir: up-bad},
          {icon:📦, label: Tỷ lệ đáp ứng đơn hàng/Order fulfillment rate, value: -15%, dir: down}]
luminaImg: lumina-ao-dai-alert
luminaMsg (vi): Thưa CEO, tình hình rất khẩn cấp! Cảng tắc nghẽn vì làn
  sóng hàng ngoại nhập, dây chuyền của ta bị vạ lây. Cần quyết định ngay:
  tăng ngân sách vận chuyển hay đàm phán lại thời gian giao hàng?
luminaMsg (en): CEO, this is extremely urgent! Port congestion from the
  import surge is dragging our line down with it. We need to decide now:
  raise the shipping budget or renegotiate delivery times?
cta (vi/en): 👥 Họp khẩn cấp toàn đội / 👥 Emergency team meeting

Vòng 6 — id: EV_MILESTONE_B · tone: good · icon: 🏮
name (vi): Người Việt Ưu Tiên Hàng Việt
name (en): Vietnamese Consumers Come Home
tag (vi/en): VÒNG CHUNG KẾT · KỊCH BẢN GIẢ ĐỊNH / FINAL ROUND · HYPOTHETICAL SCENARIO
desc (vi): Kịch bản giả định: sau một mùa cạnh tranh khốc liệt với hàng
  ngoại, người tiêu dùng dần quay về ủng hộ những thương hiệu nội địa đã
  chứng minh được chất lượng suốt mùa qua — tầng lớp trung lưu mở rộng, ít
  nhạy cảm về giá, ưu tiên thương hiệu đáng tin. (Tham số minh họa, không
  phải số liệu thống kê thực.)
desc (en): A hypothetical scenario: after a season of fierce competition
  with imports, consumers gradually return to domestic brands that proved
  their quality all season — the middle class expands, less price-sensitive,
  favoring trusted brands. (Illustrative simulation parameters, not real
  statistics.)
demand: 1.25, costMul: 1.0, elasticityMul: 0.85, wageMul: 1.1, brandPow: 1.5, mktBoost: 1.2
  (giống hệt A Vòng 6)
impacts: [{icon:🇻🇳, label: Niềm tin hàng nội địa/Trust in domestic brands, value: +25%, dir: up},
          {icon:🏷️, label: Độ nhạy giá của khách/Customer price sensitivity, value: -15%, dir: down-good},
          {icon:👷, label: Chi phí nhân công/Labor cost, value: +10%, dir: up-bad},
          {icon:✨, label: Trọng số thương hiệu/Brand weight, value: ×1.5, dir: up}]
luminaImg: lumina-ao-dai-clap
luminaMsg (vi): Vòng chung kết, thưa đội ngũ điều hành! Sau một mùa đối đầu
  với Star Clay Co., người tiêu dùng đã chọn đứng về phía những thương hiệu
  nội địa bản lĩnh như đội mình. Đây là cơ hội vàng để CMO nâng tầm thương
  hiệu thành dòng Premium và CEO mở rộng quy mô phục vụ làn sóng tin dùng
  mới!
luminaMsg (en): The final round, executive team! After a season facing off
  against Star Clay Co., consumers have chosen to stand behind resilient
  domestic brands like yours. This is a golden chance for the CMO to
  elevate the brand into a Premium line and for the CEO to scale up for
  this new wave of loyal customers!
cta (vi/en): 🐉 Bứt phá về đích / 🐉 Sprint to the finish
```

## 5. Bảng đối chiếu công bằng A ↔ B (kiểm tra nhanh)

| Vòng | demand | costMul | khác |
|---|---|---|---|
| 1 | 1.0 = 1.0 | 1.0 = 1.0 | — |
| 2 | 1.35 = 1.35 | 1.0 = 1.0 | rdBoost 1.5 = 1.5 |
| 3 | 1.0 = 1.0 | 1.0 = 1.0 | elasticityMul 1.4 = 1.4 |
| 4 | 0.7 = 0.7 | 1.3 = 1.3 | oeeHit 10 = 10, shake = shake |
| 5 | 1.0 = 1.0 | 1.25 = 1.25 | fulfillMul .85 = .85, shake = shake |
| 6 | 1.25 = 1.25 | 1.0 = 1.0 | elasticityMul .85=.85, wageMul 1.1=1.1, brandPow 1.5=1.5, mktBoost 1.2=1.2 |

100% khớp — điểm số 2 trường hợp không lệch nhau vì lý do cơ học, chỉ lệch
vì năng lực ra quyết định thật của từng đội.

## 6. Việc CHƯA làm (để chị duyệt trước)

1. Nối `EV_*_B` này vào `js/engine.js` (thêm hàm `MARKET_EVENTS_LIST_B()`
   song song, không sửa hàm A hiện có).
2. Thêm bước "bốc thăm" ở Vòng 0 (`game.html` + `js/app.js`), dùng
   `BizOnSeedEngine.pick` để chọn A/B theo `classId:teamId`.
3. Lưu `S.caseId` vào state đội, đổi `currentEvent(s)` để đọc đúng danh sách
   theo `caseId`.
4. Quyết định thời điểm áp dụng (Mùa 2 tuần 6, hay lớp/học kỳ sau) — **chị
   chưa chốt, để sau**.

## 7. Ý tưởng "kịch tính hơn" khác — không cần đợi cơ chế 2 trường hợp

Ghi lại để cân nhắc riêng, không phụ thuộc việc trên:
- Âm thanh đếm ngược gấp gáp hơn trong 3 phút "khóa quyết định" (đã có bước
  này trong `CYCLE_STEPS`, plan-data.ts) — tăng cảm giác gấp rút thật.
- Câu "khiêu khích" của đối thủ AI xuất hiện ngay sau khi công bố kết quả
  (dùng đúng 3 cái tên trong `COMPETITORS`, `js/engine.js:85-89`), theo style
  từng đối thủ (aggressive/balanced/premium) — không cần đổi luật, chỉ thêm
  flavor text.
