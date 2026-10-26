# Hành trình 3 bậc «Từ Phù Sa ra Thế giới» – thiết kế kỹ thuật

Trạng thái: đã duyệt 26/10/2026 (ba câu hỏi ở mục 11 đã chốt); J2 có mã trong `js/core/journey.js`. Phiên bản: 2026-10-26b. Người viết: Đỗ Thùy Hương & Phan Anh Tú.

Mục tiêu: cho một đội chơi liền mạch Bậc 1 (Bến Phù Sa) → Bậc 2 (Bật Nghiệp) → Bậc 3 (Hộ Chiếu Thương Hiệu hoặc Hộ Chiếu Sầu Riêng), trong đó kết quả bậc trước để lại **hành trang** có giới hạn, minh bạch và tất định cho bậc sau, còn luật chơi từng bậc giữ nguyên. Một ván của bậc nào cũng vẫn chơi độc lập được như hiện nay.

## Mục lục

1. Nguyên tắc
2. Hiện trạng ba bậc (những gì mã nguồn đang có)
3. Hộ chiếu hành trình – cấu trúc dữ liệu
4. Hành trang chuyển tiếp – công thức và trần
5. Lưu trữ, đồng bộ và quyền
6. Giao diện: trang Hành trình và thẻ Hành trang
7. Debrief xuyên suốt và dữ liệu nghiên cứu
8. Model card của hàm `journeyCarry`
9. Kiểm thử
10. Lộ trình PR
11. Rủi ro và câu hỏi cần quyết

---

## 1 · Nguyên tắc

| # | Nguyên tắc | Hệ quả kỹ thuật |
|---|---|---|
| N1 | **Không đổi luật từng bậc.** Engine của Bến Phù Sa, Bật Nghiệp, hai Hộ Chiếu giữ nguyên công thức. | Hành trang chỉ đi vào **trạng thái khởi đầu** (vốn, vài chỉ số, một ít thông tin), không chạm hàm mô phỏng vòng/vụ. |
| N2 | **Tất định và giải thích được.** | Hành trang = hàm thuần `journeyCarry(passport, tier)`; cùng hộ chiếu → cùng hành trang; mỗi khoản có dòng giải thích hiện cho người chơi. |
| N3 | **Có trần.** Hành trang không được quyết định thắng thua bậc sau. | Mỗi khoản bị kẹp; tổng ảnh hưởng tiền ≤ ±15 % vốn khởi điểm của bậc sau. |
| N4 | **Chơi độc lập vẫn được.** | Không có hộ chiếu → `journeyCarry` trả về hành trang rỗng; màn hình và điểm y như hiện tại. |
| N5 | **Công bằng khi chấm.** | Giảng viên tắt hành trang cho lớp chấm điểm bằng `class_controls` (đã có bảng); kết quả nộp luôn ghi rõ hành trang đã áp dụng. |
| N6 | **2D trước, 3D sau.** | Nối các bản gọn (`ben-phu-sa.html`, Bật Nghiệp `game.html`, `brand-passport-v2.html`, `lab/ho-chieu-sau-rieng-v2.html`) trước; bản 3D nhận cùng mô-đun sau. |

## 2 · Hiện trạng ba bậc

Bảng dưới lấy từ mã trên `main` (10/2026). Đây là «điểm nối» mà thiết kế phải bám.

| Bậc | Tệp / engine | Trạng thái ván (những trường liên quan) | Kết quả cuối | Lưu / nộp hiện có |
|---|---|---|---|---|
| 1 · Bến Phù Sa | `ben-phu-sa-3d.html`, `ben-phu-sa.html` (luật trong trang) | `S = { week 0–4, total (triệu ₫), budget 1,5, sel{m,menu,loc}, knownPairs{'menu-loc'}, items, shopSpent, history[{w,m,menu,loc,net}] }` | `S.result = { eff 0–100 = total/maxRev, rank 1–4 }` | Không lưu ván; nộp `bizon_submit_ft_result` (bảng `ft_results`, `p_app_version` = `bizon-bps3d-v2`, `p_detail_json`) |
| 2 · Bật Nghiệp | `js/engine.js` (`newGameState`, `simulateRound`), `js/app.js`, `js/bn2-ui.js` | `balance` (khởi điểm 500 triệu), `round` 1–6, `history[]` (báo cáo tài chính từng vòng), `brand`, `oee`, `quickRatio`, `machineCapacity`, `rdCumulative`, `competitors[]`, `xp`, `skills`, `caseId` A/B, `loan`, `whatIfUsed`, `advisorHistory` | KPI cuối: `netProfit`, `share`, `oee`, `quickRatio` (xem `docs/cham-diem-bat-nghiep.md`) | `team_saves` qua `upsert_team_save/get_team_save` (`state_json`); `bizon_submit_round` → `round_submissions`; `bizon_save_score` → `class_scores`; khung `js/core/game-state.js` (GameState v1, seed `CLASS:TEAM:SCENARIO:ENGINE`) |
| 3a · Hộ Chiếu Thương Hiệu | `brand-passport.html`, `brand-passport-v2.html`, điểm trong `js/bp-core.js` | `S = { q, firm, cash 8 (tỷ), rep 50, capab 40, resil 50, know[7], net[7] (vị thế mạng lưới), entered[7], cust[7], flags, usedEv }` | `BPCore.scoreOf` theo `WEIGHTS` | `bizon_submit_bp_result` (`bp_results`), `bizon_submit_learning_trace` (`bp_learning_traces`) |
| 3b · Hộ Chiếu Sầu Riêng | `lab/ho-chieu-sau-rieng-engine.js` (`newGame(data, roleId, seed)`, `playSeason`, `summary`) | `cash` = 12 tỷ + `cashAdj` theo vai; `assets{area, pack, test, trace, freezer}`; `rep 50, adapt 40, sus 60, resil 50`; `treeHealth`; `linkedBonus`; `history[]` | `summary()` → `parts{profit, reputation, capability, adaptation, sustainability}`, `total`, `badges` | Nộp dùng chung RPC Hộ Chiếu; ván lưu cục bộ của bản v2/3D |

Nhận xét: ba engine đã có đủ «ổ cắm» (vốn khởi điểm, chỉ số 0–100, thông tin đã biết) để nhận hành trang mà không sửa công thức.

## 3 · Hộ chiếu hành trình – cấu trúc dữ liệu

Một bản ghi JSON có phiên bản, gọi là **hộ chiếu hành trình** (`JourneyPassport`), đi theo đội qua ba bậc.

```json
{
  "schemaVersion": 1,
  "journeyId": "J-<classCode>-<teamSlug>-<ngày>",
  "classCode": "QTKD-K48",
  "teamName": "Đội Phù Sa",
  "seed": "QTKD-K48:DOI-PHU-SA:journey-v1:j1",
  "createdAt": "2026-11-03T02:10:00Z",
  "carryEnabled": true,
  "tiers": {
    "t1": {
      "status": "done", "appVersion": "bizon-bps3d-v2", "finishedAt": "…",
      "total": 4.2, "eff": 71, "rank": 2,
      "weeks": [{ "w": 1, "m": 1, "menu": 0, "loc": 2, "net": 1.0 }],
      "knownPairs": ["0-2", "1-4"],
      "style": { "exploreWeeks": 3, "exploitWeeks": 2, "surveyWeeks": 1 }
    },
    "t2": {
      "status": "done", "appVersion": "bizon-bn-v2", "finishedAt": "…",
      "balanceEnd": 612, "netProfitTotal": 96, "shareEnd": 31.5,
      "oeeEnd": 88, "quickRatioEnd": 1.3, "brandEnd": 1.22, "loanEnd": 0,
      "rdCumulative": 60, "profitableRounds": 5, "whatIfUsed": 4, "caseId": "A"
    },
    "t3": {
      "status": "pending", "variant": "durian", "roleId": "packer",
      "carryApplied": { "cash": 1.2, "rep": 4, "resil": 3, "linkedBonus": 0.05 }
    }
  },
  "carry": { "t2": { "balanceBonus": 28, "brand": 1.05, "marketBrief": true },
             "t3": { "cashMul": 1.10, "rep": 4, "resil": 3, "net": 5 } },
  "summary": { "effectuationIndex": 0.6, "causationIndex": 0.7, "intlPattern": "near-first" }
}
```

Quy ước:
- `tiers.tX.status` ∈ `pending | playing | done`; chỉ bậc `done` mới sinh hành trang cho bậc sau.
- `carry.tX` là **kết quả đã tính** của `journeyCarry`, lưu lại để bậc sau không tính lại khác đi khi mô-đun đổi phiên bản.
- Mọi số tiền giữ đơn vị của từng bậc (triệu ₫ ở Bậc 1–2, tỷ ₫ ở Bậc 3); hàm chuyển đổi ghi rõ hệ số.
- `summary` là chỉ số nghiên cứu, không vào điểm.

## 4 · Hành trang chuyển tiếp – công thức và trần

Tất cả trong một mô-đun thuần `js/core/journey.js` (chạy cả trình duyệt lẫn Node, theo kiểu `js/core/*` hiện có).

### 4.1 Bậc 1 → Bậc 2 (Bến Phù Sa → Bật Nghiệp)

| Hành trang | Công thức | Trần | Lý do sư phạm |
|---|---|---|---|
| Vốn khởi điểm | `balance = 500 + round(0.4 × eff) + (rank == 1 ? 10 : 0)` | +0…+50 triệu (≤ 10 % của 500) | Hiệu quả thử nghiệm giai đoạn effectuation thành vốn giai đoạn kế hoạch; không phạt đội thua để không «đuổi» người học sớm. |
| Thương hiệu địa phương | `brand = rank ≤ 2 ? 1.05 : 1.00` | +5 % | Danh tiếng chợ nổi theo sang thị trấn. |
| Bản tin thị trường vòng 1 | `marketBrief = knownPairs.length ≥ 3` → mở sẵn màn «Quan sát thị trường» vòng 1 (thông tin, không tiền) | — | Tri thức thị trường tích lũy (Uppsala): thông tin, không phải tiền. |
| Hồ sơ phong cách | `style.exploreWeeks / 5` → `effectuationIndex` | — | Chỉ để debrief và lời chào của Lumina ở vòng 1; không vào số. |

### 4.2 Bậc 2 → Bậc 3 (Bật Nghiệp → Hộ Chiếu)

Gọi `k = clamp((balanceEnd − 500) / 500, −0.15, +0.15)`.

| Hành trang | Thương Hiệu (`cash0` = 8 tỷ) | Sầu Riêng (`cash0` = 12 tỷ + `cashAdj`) | Trần |
|---|---|---|---|
| Vốn | `cash = 8 × (1 + k)` | `cash = (12 + cashAdj) × (1 + k)` | ±15 % |
| Uy tín | `rep += round(5 × clamp((brandEnd − 1) / 0.5, 0, 1))` | như bên | 0…+5 |
| Chống chịu | `resil += quickRatioEnd ≥ 1.2 ? 3 : 0`; `loanEnd > 0 ? −3 : 0` | như bên; thêm `creditLimit −1` tỷ nếu `loanEnd > 0` | −3…+3 |
| Năng lực / ứng phó | `capab += min(5, round(rdCumulative / 20))` | `adapt += min(5, round(rdCumulative / 20))` (ứng phó biến cố; **không** chuyển tài sản kiểm nghiệm – xem ghi chú) | +5 / +5 |
| Vị thế mạng lưới | `net[i] += 5` cho hai thị trường gần nhất về khoảng cách tâm lý nếu `profitableRounds ≥ 4` | `linkedBonus = 0.05` (một hợp đồng liên kết nhỏ) nếu `profitableRounds ≥ 4` | +5 / 5 % |

Ghi chú (quét cân bằng 26/10, `test/journey-balance.test.js`): bản nháp định chuyển «một bậc kiểm nghiệm» sang Sầu Riêng, nhưng tài sản này là **mở khóa kênh** (Nhật Bản cần kiểm nghiệm, qua kiểm toán, giảm rủi ro gian lận) nên cùng hạt giống và cùng quyết định, điểm cuối lệch tới +42/100. Khoản đó bị thay bằng «ứng phó biến cố +0…+5» (liên tục, có trần); sau khi thay, chênh lớn nhất trên 24 ván × 4 vai ≤ 8/100. Các khoản tiền, uy tín, chống chịu, liên kết mỗi khoản lệch ≤ 1 điểm.

Lệ thuộc đường đi (path dependence): đội kết thúc Bậc 2 với nợ vào Bậc 3 yếu hơn một chút; đội có lãi đều vào Bậc 3 với vài mối quan hệ sẵn. Đây là hệ quả dài hạn mà các mô-đun rời không cho thấy.

### 4.3 Điều không chuyển

Không chuyển vật phẩm, kỹ năng, điểm XP, huy hiệu, hay bất cứ thứ gì làm thay đổi xác suất biến cố. Biến cố của mỗi bậc vẫn rút từ hạt giống của bậc đó.

## 5 · Lưu trữ, đồng bộ và quyền

| Lớp | Cách làm | Ghi chú |
|---|---|---|
| Cục bộ | `localStorage['bizon-journey']` = hộ chiếu (JSON, có `schemaVersion`) + `bizon-journey-backup`; mô-đun riêng `js/journey-store.js` (cùng kiểu `persistence.js`: storage tiêm được, kiểm tra lược đồ khi đọc/ghi, phục hồi từ sao lưu, gói xuất `bizon-journey-export` v1) | Không đụng khóa cũ nào. |
| Máy chủ | Bảng mới `journey_passports(class_code, team_name, student_id, passport jsonb, updated_at)` + RPC `bizon_journey_get(p_class_code, p_team_name)` và `bizon_journey_upsert(p_class_code, p_team_name, p_passport)`; yêu cầu phiên sinh viên như `require_student_login`; dọn theo `retention_purge` | Một migration; **chỉ áp dụng lên dự án thật sau khi được xác nhận**. |
| Kết quả từng bậc | Giữ nguyên `ft_results`, `round_submissions` / `class_scores`, `bp_results`; thêm `p_detail_json.journey = { journeyId, tier, carryApplied }` | Không đổi lược đồ bảng kết quả; bảng giáo viên lọc được ván có hành trang. |
| Khóa lớp | `class_controls` thêm cờ `journey_carry` (mặc định bật cho tự học, giảng viên tắt khi chấm) | Khi tắt, hộ chiếu vẫn ghi kết quả, chỉ không áp hành trang. |

## 6 · Giao diện: trang Hành trình và thẻ Hành trang

1. **Trang `hanh-trinh.html`** (VI/EN, phong cách đất sét như `lop-hoc.html`): ba thẻ bậc với trạng thái khóa / đang chơi / xong, dòng tóm tắt kết quả, nút «Tiếp tục hành trình». Chọn biến thể Bậc 3 (Thương Hiệu hay Sầu Riêng) ngay tại đây.
2. **Liên kết sâu** `?journey=<journeyId>`: mỗi game đọc tham số, nạp hộ chiếu, gọi `journeyCarry`, rồi hiện **thẻ Hành trang** trước màn mở đầu: từng khoản, con số, một câu giải thích («Hiệu quả 71/100 ở Bến Phù Sa → +28 triệu vốn khởi điểm»). Người chơi bấm «Nhận hành trang» hoặc «Chơi độc lập».
3. **Cuối ván**: game ghi `tiers.tX` vào hộ chiếu và hiện nút «Sang Bậc tiếp theo» (về `hanh-trinh.html`).
4. **Bảng giảng viên** (`giang-vien.html`): cột «Hành trình» với ba trạng thái và hành trang đã áp.

## 7 · Debrief xuyên suốt và dữ liệu nghiên cứu

Trang Hành trình, sau Bậc 3, hiện dòng thời gian 5 tuần + 6 vòng + 6 quý/vụ với ba chỉ số nghiên cứu:

| Chỉ số | Cách tính | Khung lý thuyết |
|---|---|---|
| `effectuationIndex` | tỷ lệ tuần gánh/khảo sát trên 5 tuần Bậc 1 | Sarasvathy (2001) |
| `causationIndex` | tỷ lệ vòng có dùng dự báo/what-if (`whatIfUsed`) và không bị khóa vòng ở Bậc 2 | chuyển sang lập kế hoạch |
| `intlPattern` | thứ tự vào thị trường theo khoảng cách tâm lý (`entered[]` Thương Hiệu) hoặc thứ tự mở kênh (Sầu Riêng): `near-first`, `leapfrog`, `mixed` | Johanson & Vahlne (1977, 2009) |

Xuất CSV ẩn danh (journeyId băm, không email) phục vụ thiết kế nghiên cứu trong `thiet-ke-nghien-cuu.html`.

## 8 · Model card của hàm `journeyCarry`

- **Đầu vào**: hộ chiếu (`schemaVersion` 1), bậc đích, biến thể Bậc 3, vai Sầu Riêng. **Đầu ra**: đối tượng hành trang + danh sách dòng giải thích VI/EN.
- **Tham số** (xem mục 4): `T1_CASH_PER_EFF = 0.4`, `T1_RANK1_BONUS = 10`, `T1_BRAND = 1.05`, `T1_BRIEF_MIN_PAIRS = 3`, `T2_CASH_CAP = 0.15`, `T2_REP_MAX = 5`, `T2_RESIL = ±3`, `T2_CAPAB_MAX = 5`, `T2_ADAPT_PER_RD = 20`, `T2_ADAPT_MAX = 5`, `T2_NET = 5`, `T2_LINKED = 0.05`, `T2_PROFITABLE_MIN = 4`.
- **Giới hạn**: tham số là minh họa, chưa có dữ liệu lớp học để hiệu chỉnh; sẽ công bố cùng bảng tham số trên trang Học thuật và cập nhật sau pilot.
- **Không làm**: không đổi xác suất biến cố, không mở khóa phương thức/kênh, không ảnh hưởng điểm rubric thảo luận.

## 9 · Kiểm thử

| Kiểm thử | Nội dung |
|---|---|
| `test/journey-carry.test.js` | Hàm thuần: hộ chiếu rỗng → hành trang rỗng; ba hồ sơ mẫu (yếu / trung bình / mạnh) → đúng trần; tất định (hai lần gọi giống nhau); đơn vị tiền đúng theo bậc. |
| `test/journey-passport.test.js` | Lược đồ: `schemaVersion`, trạng thái bậc, không nhảy cóc, từ chối JSON hỏng (J2); ghi/đọc qua `persistence.js` bổ sung ở J3. |
| Quét cân bằng | `test/journey-balance.test.js` (J2): engine Sầu Riêng, 4 vai × 6 hạt giống, cùng quyết định, có và không có hành trang cực đại → chênh điểm cuối ≤ 8/100; kèm đối chứng tài sản kiểm nghiệm phải lệch > 8 (để không ai thêm lại). Bậc 2 (`simulateRound`, ≤ 10 % lợi nhuận) và Thương Hiệu bổ sung ở J5/J6 khi engine chạy được ngoài trang. |
| Playwright | Đi hết ba bậc trên bản 2D với `?journey=`, kiểm tra thẻ Hành trang hiện đúng số và `p_detail_json.journey` trong payload nộp (mock RPC). |

## 10 · Lộ trình PR

| PR | Nội dung | Phụ thuộc | Ước lượng |
|---|---|---|---|
| J1 | Tài liệu này + bảng tham số trên trang Học thuật | — | 0,5 ngày |
| J2 | `js/core/journey.js` (hàm thuần, VI/EN) + `test/journey-carry.test.js`, `test/journey-passport.test.js` + workflow `journey-core.yml` – **đã làm** | J1 | 1 ngày |
| J3 | Hộ chiếu cục bộ (`js/journey-store.js`: `localStorage['bizon-journey']` + bản sao lưu, xuất/nhập JSON), trang `hanh-trinh.html` (+ `js/hanh-trinh.js`), thẻ Hành trang dùng chung (`js/journey-card.js`, `css/journey.css`) – **đã làm** | J2 | 2 ngày |
| J4 | Bến Phù Sa (`ben-phu-sa.html`, bản gọn `ben-phu-sa-v2.html` chuyển tham số, và `ben-phu-sa-3d.html`) đọc `?journey=`, băng ở màn mở đầu, ghi `tiers.t1` cuối ván qua `js/journey-link.js`, khối «Sang Bậc 2» với xem trước hành trang – **đã làm** | J3 | 1 ngày |
| J5 | Bật Nghiệp (`game.html`, `bat-nghiep-v2.html`, bản 3D chuyển tham số) hỏi nhận hành trang trước màn mở đầu (`offerCarry`, lớp có mã thật theo cờ `journey_carry` đọc một lần qua `BizOnClassSync.fetchControls`), `applyToTier2`, Lumina chào theo phong cách Bậc 1 + bản tin thị trường ở thẻ biến cố vòng 1, ghi `tiers.t2` khi xong 6 vòng, khối «Sang Bậc 3» trên báo cáo mùa – **đã làm** | J3 | 2 ngày |
| J6 | Hộ Chiếu Sầu Riêng v2 (`js/dp2-ui.js`: vai chọn sẵn, hộp thoại hành trang, `applyToDurian`, engine đọc `journey.creditLimitAdj`, ghi `tiers.t3` với thứ tự mở kênh) và Hộ Chiếu Thương Hiệu (engine `brand-passport.html` + bản gọn `js/bp2-ui.js`: `bpApplyCarry`, `applyToBrand`, ghi `tiers.t3` với `entered[]` ở `bpEnd`); biến thể không khớp → chơi độc lập; trang Hành trình thêm «Nhìn lại cả hành trình» và CSV ẩn danh một dòng – **đã làm** | J3 | 2–3 ngày |
| J7 | Migration `journey_passports` + 2 RPC + cờ `class_controls.journey_carry` + cột trên bảng giảng viên; kịch bản kiểm thử Postgres cục bộ trước khi áp dụng thật | J4–J6 | 2 ngày + xác nhận |
| J8 | Bản 3D của ba bậc nhận cùng mô-đun; quét cân bằng; cập nhật model card sau pilot | J7 | 2 ngày |

Mỗi PR một nhánh từ `main`, một tệp test, tăng `CACHE` trong `sw.js`, gộp theo lệnh.

## 11 · Rủi ro và câu hỏi cần quyết

Rủi ro:
- **Trôi cân bằng**: trần ±15 % và quét cân bằng ở J2/J8 là chốt chặn; nếu lệch, hạ `T2_CASH_CAP` trước khi hạ các khoản khác.
- **Công bằng khi chấm**: cờ lớp tắt hành trang; kết quả nộp luôn ghi `carryApplied`.
- **Phức tạp lưu ván**: hộ chiếu tách khỏi ván từng bậc; mất hộ chiếu chỉ mất hành trang, không mất ván.
- **Khớp câu chuyện**: Bậc 1 bán bánh mì, chè bưởi, cà phê; Bậc 3 Sầu Riêng là nông sản. Cầu nối kể chuyện («vốn và uy tín từ chợ nổi») đủ cho giai đoạn đầu; thêm món «sầu riêng» cho Bậc 1 là việc riêng, không cần cho J1–J8.

Ba câu hỏi đã chốt (26/10/2026):

| # | Câu hỏi | Quyết định | Thể hiện trong mã |
|---|---|---|---|
| 1 | Biến thể Bậc 3 mặc định | **Sầu Riêng** (nông sản ĐBSCL); Thương Hiệu vẫn chọn được trên trang Hành trình | `DEFAULT_T3_VARIANT = 'durian'`; `setTier3Variant()` |
| 2 | Hành trang trong lớp chấm điểm | **Mặc định tắt**: lớp có mã thật chỉ áp hành trang khi `class_controls.journey_carry === true`; tự học (không mã lớp / `DEMO-2026`) theo cờ hộ chiếu | `resolveCarryEnabled(passport, classControls)` |
| 3 | Bỏ qua bậc | **Không**: chỉ chơi được bậc kế tiếp bậc đã xong; muốn chơi riêng một bậc thì mở game đó như hiện nay, không qua hành trình | `nextTier()`, `canPlay()`, `validatePassport()` từ chối hộ chiếu nhảy cóc (`tier_order_t2/t3`) |

Giả định còn mở (đổi tham số là đủ, không đổi cấu trúc): «hai thị trường gần nhất về khoảng cách tâm lý» của Hộ Chiếu Thương Hiệu tạm lấy Tân Cảng (5) và Kim Sa (2) – `PARAMS.T2_NET_MARKETS`; dữ liệu thị trường hiện chưa có trường khoảng cách tâm lý.
