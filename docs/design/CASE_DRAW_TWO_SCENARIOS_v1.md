# Bốc thăm 2 Trường hợp — đã BẬT THẬT (mặc định cho mọi ván mới)

**Ngày:** 2026-09-16–17
**Trạng thái:** Đã bật thật — Hương xác nhận chưa lớp nào chơi lấy điểm mùa
nào (Vòng 1–2 tuần này chỉ là chơi thử/làm quen), nên không còn rủi ro công
bằng điểm số. Mọi ván **mới** (SV chưa từng lưu tiến trình cho `classId:teamName`
đó) từ giờ tự động bốc thăm Trường hợp A/B ở Vòng 1. Đội **đã có** tiến trình
lưu (đã chơi Vòng 1–2 tuần này) không bị đụng vào — tải lại đúng dữ liệu cũ,
không bốc lại, tiếp tục y như trước. Đã kiểm chứng bằng Playwright (mục 8),
gồm cả một lỗi thật phát hiện và sửa lúc kiểm thử (mục 9).

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

## 6. Việc CHƯA làm

1. ~~Nối `EV_*_B` vào `js/engine.js`~~ — **Xong**: `MARKET_EVENTS_LIST_B()`
   thêm song song, không sửa `MARKET_EVENTS_LIST()` hiện có.
2. ~~Thêm bước "bốc thăm" ở Vòng 0~~ — **Xong**: `maybeShowCaseDraw()` trong
   `js/app.js`, dùng `BizOnSeedEngine.pick` (nạp qua `js/core/seed-engine.js`,
   thêm 1 dòng `<script>` vào `game.html`) chọn A/B theo `classId:teamName`.
3. ~~Lưu `S.caseId`, đổi `currentEvent(s)`~~ — **Xong**: `newGameState()` thêm
   `caseId: 'A'` (mặc định) + `caseDrawn: false`; `currentEvent()` đọc đúng
   danh sách theo `s.caseId`.
4. ~~Quyết định thời điểm BẬT THẬT~~ — **Xong (17/9/2026)**: Hương xác nhận
   chưa lớp nào chơi lấy điểm mùa nào, nên bật ngay — bỏ cờ `?caseDraw=1`,
   bốc thăm thành mặc định cho mọi ván mới. Xem mục 9 cho lỗi thật phát hiện
   lúc kiểm thử bước này (tour hướng dẫn `js/tutorial.js` từng có thể đè lên
   màn bốc thăm) và cách đã sửa.

## 7. Ý tưởng "kịch tính hơn" khác — không cần đợi cơ chế 2 trường hợp

Ghi lại để cân nhắc riêng, không phụ thuộc việc trên:
- Âm thanh đếm ngược gấp gáp hơn trong 3 phút "khóa quyết định" (đã có bước
  này trong `CYCLE_STEPS`, plan-data.ts) — tăng cảm giác gấp rút thật.
- Câu "khiêu khích" của đối thủ AI xuất hiện ngay sau khi công bố kết quả
  (dùng đúng 3 cái tên trong `COMPETITORS`, `js/engine.js:85-89`), theo style
  từng đối thủ (aggressive/balanced/premium) — không cần đổi luật, chỉ thêm
  flavor text.

## 8. Đã nối code thế nào (bản đầu, gated) — và đã kiểm chứng ra sao

*Ghi lại nguyên trạng bản đầu (16/9) để có lịch sử — xem mục 9 cho những gì
đổi tiếp khi bật thật ngày 17/9 (bỏ cờ `?caseDraw=1`, sửa 1 lỗi thật mới
phát hiện).*

**File đã sửa** (commit riêng, xem lịch sử git):
- `js/engine.js` — thêm `MARKET_EVENTS_LIST_B()` (nguyên văn nội dung mục 4);
  `newGameState()` thêm `caseId: 'A'`, `caseDrawn: false`; `currentEvent(s)`
  đổi 1 dòng để đọc đúng danh sách theo `s.caseId`.
- `game.html` — thêm `<script src="js/core/seed-engine.js"></script>` (trước
  `js/app.js`) để nạp bộ hạt giống đã có sẵn nhưng chưa ai dùng.
- `js/app.js` — `applyStateDefaults()` thêm 2 dòng mặc định cho save cũ;
  `doLogin()` thêm đoạn bốc `S.caseId` (chỉ khi `!restored` — ván mới — và có
  `?caseDraw=1`); thêm `caseDrawFlagOn()`, `CASE_INFO_LIST()`,
  `maybeShowCaseDraw()`; `enterApp()` đổi 1 dòng để gọi
  `maybeShowCaseDraw(() => maybeShowEventIntro())` thay vì gọi thẳng
  `maybeShowEventIntro()`.

**Nguyên tắc an toàn:** mọi đường mới đều rẽ nhánh trên `caseDrawFlagOn()`
(đọc `?caseDraw=1` trên URL, giống hệt cách `?coreV2=1`/`?studentAuth=1` đã
làm trước đó) hoặc trên `s.caseId === 'B'` — cả hai đều mặc định "tắt"/`'A'`.
Không có cờ trên URL, không có ván nào (mới hay cũ) đổi hành vi, kể cả 1 ký
tự hiển thị.

**Đã kiểm chứng bằng Playwright** (chạy `game.html` qua `python3 -m
http.server`, chặn gọi Supabase thật vì sandbox không cho ra ngoài):
1. **Không có `?caseDraw=1`:** không hiện màn bốc thăm; `S.caseId` = `'A'`;
   Vòng 1 hiện đúng "Thị trường ổn định" (nội dung gốc, không đổi 1 ký tự);
   0 lỗi console — xác nhận game mặc định giữ nguyên 100%.
2. **Có `?caseDraw=1`:** bốc thăm ra `'B'` cho một đội thử; màn bốc thăm hiện
   đúng tiêu đề "Trường hợp B · Sóng Ngoại Nhập"; sau khi bấm qua, Vòng 1 hiện
   đúng nội dung Trường hợp B ("Thị trường ổn định — nhưng có tin đồn"); 0 lỗi
   console.
3. Kiểm tra riêng bộ bốc thăm (`js/core/seed-engine.js`) bằng Node: cùng
   `classId:teamId` luôn ra cùng 1 kết quả (không thể "bốc lại" bằng refresh);
   thử với danh sách đội thật của KT330H-M01 (7 đội) và M02 (8 đội) đều ra
   được cả hai trường hợp trong lớp, không lệch hẳn về một phía.

**Giới hạn:** chưa thử trên trình duyệt thật kết nối Supabase thật (cùng hạn
chế đã ghi ở các báo cáo trước — sandbox chặn gọi thẳng `supabase.co`); và
chưa có ai chơi thử một lượt Trường hợp B trọn 6 vòng để tự cảm nhận độ khó
có thực sự cân bằng với A hay không (số trên giấy khớp nhau, nhưng cảm nhận
"kịch tính" là chủ quan — nên tự chơi thử trước khi bật cho lớp thật).

## 9. Bật thật (17/9/2026) — bỏ cờ, và 1 lỗi thật phát hiện + sửa lúc kiểm thử

Hương xác nhận buổi Tuần 2 chỉ là chơi thử/làm quen, chưa lớp nào chơi lấy
điểm mùa nào — nên không còn lý do giữ cờ. Đổi:
- `js/app.js` — bỏ điều kiện `caseDrawFlagOn()` ở cả hai chỗ dùng (gán
  `S.caseId` trong `doLogin()`, và điều kiện hiện màn hình trong
  `maybeShowCaseDraw()`); xóa hẳn hàm `caseDrawFlagOn()` (không còn ai gọi).
  Giờ **mọi ván mới** (đội chưa từng lưu tiến trình cho đúng
  `classId:teamName`) tự động bốc thăm — không cần `?caseDraw=1` nữa. Đội
  **đã có** tiến trình lưu vẫn không bị đụng (nhánh `!restored` giữ nguyên).
- `js/engine.js` — sửa lại chú thích ở `caseId` cho khớp (không còn nhắc cờ).

**Lỗi thật phát hiện lúc kiểm thử lại bằng Playwright (không có cờ nữa):**
tour hướng dẫn tự động cho người chơi mới (`js/tutorial.js`, `autoStart()`)
chỉ đợi màn "Giới thiệu" (`#intro-next`) và màn biến cố (`#ev-close`) đóng lại
rồi mới tự bật lên — **không biết gì về màn bốc thăm mới** (`#case-draw-cta`).
Kết quả: với người chơi lần đầu, tour có thể tự bật đè lên ngay trên màn bốc
thăm, chặn hẳn nút "Vào Vòng 1" (xác nhận bằng `document.elementFromPoint` —
một `<div>` toàn màn hình, `z-index:90`, `pointer-events:auto` của tour nằm
trên màn bốc thăm `z-index:50`). Đây là lỗi thật, không phải lỗi giả lập —
sẽ xảy ra với SV thật lần đầu vào game. Sửa bằng cách thêm đúng 1 điều kiện
vào `autoStart()`: đợi thêm cả khi `#case-draw-cta` đang mở, giống hệt cách
nó đã đợi màn biến cố.

**Kiểm chứng lại bằng Playwright** (không còn `?caseDraw=1` trong URL nào cả,
3 đội tên khác nhau, hồ sơ trình duyệt sạch mỗi lần):
- Cả 3 lượt đều tự hiện màn bốc thăm mặc định (không cần cờ); bốc ra đúng cả
  A lẫn B (không lệch cứng về 1 bên); sau khi bấm qua, Vòng 1 hiện đúng nội
  dung khớp với trường hợp đã bốc; 0 lỗi console ở cả 3 lượt sau khi sửa lỗi
  tour ở trên (trước khi sửa, cả 3 lượt đều bị chặn nút bốc thăm bởi tour).
