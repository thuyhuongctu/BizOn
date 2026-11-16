# Kế hoạch thực hiện: Cảng Cái Mép trong Bật Nghiệp 3D

**Nhánh**: `claude/cang-cai-mep` | **Ngày**: 2026-11-16 | **Đặc tả**: [spec.md](spec.md)

## Tóm tắt

Có hai PR:
- **PR 1** (câu chuyện 1, gộp trước 19/11/2026): thêm khu cảng 3D đất sét và các thẻ kiến thức vào Bật Nghiệp 3D. Không đổi một con số nào của mô phỏng.
- **PR 2** (câu chuyện 2, gộp sau 19/11/2026): thêm mô-đun `js/cang-cai-mep.js` móc vào `currentEvent` và `simulateRound`. Mô-đun này cho đội chọn (a)/(b)/(c) ở vụ 5. Không sửa `js/engine.js` hay `js/app.js`.

## Bối cảnh kỹ thuật

- Trang tĩnh, không có bước build.
- Cảnh 3D (`BizOn Game 3D.html`) là một `<script type="module">` (dòng 416) dùng three.js qua importmap. Mô-đun khác không đọc được biến trong đó, nên khu cảng viết thành **ES module riêng** `js/cang-cai-mep-3d.js`, xuất `buildPort(ctx)`. Trang chỉ thêm ba thứ:
  - một dòng `import`;
  - một lời gọi `buildPort({ THREE, hq, world, sign, LOWHIDE, T, TL })`;
  - một mục mới trong `ZONES`.
- Luật chơi chạy trong `game.html` (iframe `#gf` của trang 3D) và `bat-nghiep-v2.html`. Cả hai nạp `js/engine.js` rồi `js/market-dynamic.js`. Mô-đun luật cảng nạp **sau** `market-dynamic.js` và móc theo đúng cách tệp đó đang làm (dòng 112–122).
- `simulateRound` gọi `currentEvent(s)` rồi áp `shieldedEvent` khi có khiên (engine.js 711–713). Vì luật cảng chỉ đổi biến cố trả về, khiên bảo hiểm tự áp lên lựa chọn đã chọn (FR-007) mà không cần thêm mã.
- Kiểm thử:
  - Node `vm` chạy engine không cần trình duyệt, theo cách `test/engine.test.js` đang làm;
  - Playwright cho cảnh 3D và bảng Quyết định.

## Kiểm theo hiến chương

| Nguyên tắc | Ảnh hưởng | Cách giữ |
|---|---|---|
| I. Học là chính | Câu chuyện 2 đổi luật vụ 5 | Ghi ngày áp dụng vào `docs/chuan-dau-ra-va-rubric.md` (mục sổ điểm Bật Nghiệp) và `bang-chung.html` nếu có số liệu lớp. Lumina chỉ hỏi gợi mở, không chọn giúp (FR-008). |
| II. Nói thật | Thẻ kiến thức có số liệu cảng | Mỗi con số có nguồn (mục «Nguồn số liệu» dưới đây). Không nói «AI»; đối thủ ảo không chọn ở cảng. |
| III. Trang tĩnh (không thương lượng) | Thêm hai tệp JS | Không bước build; chạy ngoại tuyến (thêm cả hai tệp vào `sw.js`). Kiểm 360/390/1280 px; vùng chạm ≥ 44 px; VI/EN bằng `T()`/`data-en`. |
| IV. Có test | Mỗi PR có test viết trước và thấy hỏng | PR 1 dùng `test/cang-cai-mep-3d.test.js`; PR 2 dùng `test/cang-cai-mep-luat.test.js`. html-validate 0 lỗi. sw.js lấy số lớn nhất + 1. |
| V. Dữ liệu tối thiểu | Lựa chọn lưu trong `state` | Không thêm bảng, RPC hay migration. Lựa chọn đi theo `state_json` đang nộp. |
| Hồ sơ quyền tác giả | `BizOn Game 3D.html`, `game.html` thuộc hồ sơ | Không đổi tên, xóa hay chuyển hướng tệp. Không sửa dòng nào trong `js/engine.js`, `js/app.js`, `js/backend.js` (chị chọn 1A). Hai trang hồ sơ chỉ thêm thẻ `<script>`, một mục `ZONES` và một lời gọi. Test `ip-ma-nguon-afbacd2` phải đạt. |

## Tệp sẽ chạm

| Tệp | PR | Thay đổi |
|---|---|---|
| `js/cang-cai-mep-3d.js` (mới) | 1 | Dựng khu cảng (nền riêng ở x > 8, cần cẩu, tàu, bãi container, trạm hải quan, biển tên), các điểm chạm, thẻ kiến thức VI/EN |
| `BizOn Game 3D.html` | 1 | Một dòng `import`, một lời gọi `buildPort(...)`, một mục `ZONES` «🚢 Cảng Cái Mép / Cái Mép Port» |
| `js/cang-cai-mep.js` (mới) | 2 | Tham số Ca, U, `fulfillMul` của (c); móc `currentEvent` và `simulateRound`; chèn ô lựa chọn vào `#tab-decisions`; câu hỏi gợi mở của Lumina |
| `game.html`, `bat-nghiep-v2.html` | 2 | Mỗi trang thêm một thẻ `<script src="js/cang-cai-mep.js">` sau `market-dynamic.js` |
| `js/cang-cai-mep-3d.js` | 2 | Thẻ trạm hải quan có thêm nút «Ra quyết định» trong vụ 5 (mở tab `decisions` qua cầu nối có sẵn) |
| `Trang Giang Vien.dc.html` | 2 | Bản xuất Excel thêm cột «Lựa chọn ở cảng (vụ 5)», đọc `state.portChoice` |
| `docs/chuan-dau-ra-va-rubric.md` | 2 | Ghi ngày áp dụng luật cảng; gợi ý câu hỏi thảo luận (không tính điểm, theo câu 5A) |
| `sw.js` | 1, 2 | Thêm tệp mới vào SHELL, nâng `CACHE` |
| `test/cang-cai-mep-3d.test.js`, `test/cang-cai-mep-luat.test.js` (mới) | 1, 2 | Viết trước, thấy hỏng |

Bản 2D (`game.html`), bản gọn (`bat-nghiep-v2.html`) và bản 3D (qua iframe `game.html`) dùng cùng mô-đun luật, nên cùng một ô và cùng một mặc định.

## Thiết kế luật cảng (PR 2)

- Lựa chọn lưu ở `s.portChoice` (`'a' | 'b' | 'c'`), mặc định `'b'`. UI ghi giá trị trước khi đội chốt vụ.
- Mô-đun móc `currentEvent(s)`. Khi `ev.round === 5`, `evBase(ev.id) === 'EV_SUPPLY'` và ván chưa xong:
  - `'a'`: trả `{ ...ev, fulfillMul: undefined, costMul: ev.costMul × (Ca / 1,25), port: 'a' }`. Hệ số thành phố của `market-dynamic.js` được giữ vì nhân theo tỉ lệ. Để `undefined` thay cho `1` vì `js/app.js:3073` coi mọi giá trị khác rỗng là «85% (khủng hoảng cung ứng)».
  - `'c'`: trả `{ ...ev, fulfillMul: 0,95, port: 'c' }`.
  - `'b'` hoặc thiếu: trả nguyên `ev`.
- Mô-đun móc `simulateRound(s, d)`. Sau khi hàm gốc chạy, nếu vừa chốt vụ 5:
  - với `'a'`: ghi dòng «Phí ưu tiên cảng» vào nhật ký/báo cáo vụ;
  - với `'c'`: đặt `s.brand = max(0,5, s.brand − U)` và ghi dòng «Lùi ngày giao – uy tín giảm».
- Đối thủ ảo dùng `ev` chung nhưng không có `portChoice`; engine không áp `fulfillMul` cho đối thủ (engine.js 757), nên đối thủ không bị ảnh hưởng.
- Số nháp: **Ca = 1,40**, **U = 0,06**, `fulfillMul(c)` = **0,95**. Số chốt sau `/balance-check` với ba kiểu đội (SC-003), rồi chị và thầy Tú duyệt bảng số trong PR 2.

## Nguồn số liệu (câu 4A, tra ngày 16/11/2026)

**Thẻ kiến thức (PR 1):**
- Cảng Gemalink (cụm Cái Mép – Thị Vải) đón tàu OOCL Spain **24.188 TEU** tháng 3/2023, tàu container lớn nhất từng cập cảng Việt Nam. Tàu chạy tuyến Á – Âu, ghé Singapore, Piraeus, Hamburg, Rotterdam. Nguồn: [VOV](https://vov.vn/en/economy/cai-mep-thi-vai-port-receives-giant-container-vessel-845409.vov), [SGGP](https://en.sggp.org.vn/cai-mep-thi-vai-receives-one-of-worlds-largest-container-ships-post101204.html).
- Cụm cảng có **hơn 20 tuyến tàu mẹ đi thẳng** sang châu Âu, bờ Đông và bờ Tây Hoa Kỳ. Nguồn: [Vietnamnet](https://vietnamnet.vn/en/seaport-growth-accelerates-on-stronger-infrastructure-connectivity-2495395.html), [VTV](https://english.vtv.vn/news/ssit-welcomes-lng-powered-mega-container-ship-on-new-trans-pacific-route-2026053001151104.htm) (SSIT, tuyến bờ Đông Hoa Kỳ, 2026).
- Thẻ ghi «hơn 20 tuyến đi thẳng» và «tàu trên 24.000 TEU» kèm năm. Không ghi tên doanh nghiệp bến cảng ngoài tên địa danh. Trước khi gộp PR 1 em kiểm lại hai con số này.

**Tham số luật (PR 2), dùng để định mức, không đưa nguyên số vào game:**
- **Chờ cảng tốn tiền (b)**: phí lưu container và lưu bãi (demurrage & detention) sau thời gian miễn phí khoảng **75–300 USD/container/ngày** theo bảng giá hãng tàu và các nhà giao nhận. Nguồn: [biểu phí D&D của hãng ONE, hiệu lực 01/01/2025](https://ca.one-line.com/sites/canada/files/2024-11/Detention%20and%20Demurrage%20Rate%20Schedule%20%20-%20Effective%20Jan%201%2C%202025.pdf), [nVision Global](https://corporate.nvisionglobal.com/the-perils-of-port-congestion-how-to-mitigate-demurrage-and-detention-fees/). Đây là căn cứ giữ `costMul` 1,25 hiện có cho (b).
- **Ưu tiên tốn hơn chờ (a)**: tắc cảng đẩy cước và phụ phí lên cao. Ca = 1,40 nghĩa là chi phí vụ cao hơn (b) khoảng 12% để đổi lấy giao đủ 15% đơn. Nguồn định tính: [ExFreight – port congestion and freight rates](https://www.exfreight.com/how-port-congestion-capacity-constraints-impact-freight-rates/). Số chốt bằng mô phỏng cân bằng, không lấy từ một nguồn duy nhất.
- **Giao trễ mất uy tín (c)**:
  - khảo sát Sendcloud 2025 (8.000 người mua, 8 nước châu Âu): giao trễ làm **31,9%** khách giảm lòng tin;
  - khảo sát Voxware 2014: **14%** khách bỏ hẳn nhà bán sau một lần giao trễ;
  - nguồn: [Sendcloud](https://www.sendcloud.com/how-delivery-frustrations-impact-repeat-purchases/), [SupplyChainBrain](https://www.supplychainbrain.com/articles/20501-customers-unforgiving-when-deliveries-late-incorrect-especially-during-holidays-study-says);
  - U = 0,06 làm sức hút thương hiệu giảm khoảng 6% ở vụ 6, nằm trong khoảng giữa hai khảo sát khi quy ra phần khách bỏ đi.
- Các khảo sát này do doanh nghiệp giao nhận thực hiện, không phải nghiên cứu bình duyệt. Thẻ kiến thức và tài liệu ghi rõ điều đó.

## Rủi ro

- **Cảnh 3D nặng thêm**: khu cảng chỉ dùng khối đất sét có sẵn trong `bizon-hq-kit.js`, không thêm ảnh hay mô hình GLB. Vật trang trí phụ được đưa vào `LOWHIDE`.
- **Test đếm vật thể và nút**: `bn3d-onboarding` đếm đúng 24 nút ở rail. Nút cảng đặt trong `ZONES`, không đặt ở rail. Chạy lại `bn3d-onboarding`, `bn3d-upgrades`, `nhan-vat-3d-ceo`, `bat-nghiep-3d-tranh-dong`, `chan-trang-game-3d`.
- **Thứ tự móc hàm**: nếu `market-dynamic.js` bị tắt (`enabled(s)` sai) thì luật cảng vẫn chạy vì móc độc lập. Test chạy cả hai trường hợp.
- **Ván cũ**: thiếu `portChoice` thì tính như `'b'`, trùng luật cũ (FR-005).

## Đối chiếu (theo `/speckit-analyze`, 16/11/2026)

- **Độ phủ**: FR-001 đến FR-012 đều có việc tương ứng:
  - FR-001: T003, T005;
  - FR-002: T002, T004;
  - FR-003: T001;
  - FR-004: T011;
  - FR-005 và FR-007: T009;
  - FR-006: T010, T016;
  - FR-008: T012;
  - FR-009: T010 (lưu `state.portChoice`), T015;
  - FR-010: T004, T011;
  - FR-011: T007, T018;
  - FR-012: T017.
  - Kịch bản 8 của câu chuyện 2 có T014.
- **Đã sửa**: kịch bản 3 của câu chuyện 2 đòi dòng báo cáo cho (a), nhưng bản đầu của kế hoạch chỉ ghi cho (c). Đã thêm vào mục «Thiết kế luật cảng» và T010.
- **Thuật ngữ**: «phí P» trong bản đặc tả đầu đã đổi hết thành hệ số chi phí **Ca**, vì cách móc biến cố không cộng được một khoản phí riêng mà không sửa engine (1A).
- **Còn để ý (mức thấp)**:
  - Ca và U mới là số nháp; chốt ở T016.
  - Hai số liệu cảng cần kiểm lại ngày làm (T002).
- **Mức CRITICAL**: không có.
