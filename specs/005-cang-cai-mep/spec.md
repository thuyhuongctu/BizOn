# Đặc tả tính năng: Cảng Cái Mép trong Bật Nghiệp 3D

**Nhánh**: `claude/cang-cai-mep` (thư mục đặc tả `005-cang-cai-mep`)

**Ngày tạo**: 2026-11-16

**Trạng thái**: Đã làm rõ ngày 16/11/2026, chờ chị duyệt kế hoạch

**Đầu vào**: Ngày 16/11/2026 chị nhắn «Hộ chiếu thương hiệu và thử đề xuất làm cảng cái Mép trong game bật nghiệp».
Em đề xuất hai bước. Chị trả lời cùng ngày: «Cảng cái mép là cả 2 bước».
- **Bước 1**: khu cảng 3D có thẻ kiến thức, không đổi luật chơi.
- **Bước 2**: biến cố vụ 5 thành một quyết định thật của đội ở cảng.

## Hiện trạng (đọc mã ngày 16/11/2026, nhánh main ở `bizon-v884`)

**Cảnh 3D** (`BizOn Game 3D.html`, 1.876 dòng):
- Toàn bộ cảnh là một tầng trụ sở hình chữ L, chia thành các góc phòng ban: Tài chính, Pháp chế, phòng CEO có bàn quyết định, Marketing, «Vận hành · Hậu cần · Gốm», phòng R&D và sảnh cờ.
- Nền nhà chỉ trải từ x −8 đến 8 và z −6 đến 6 (dòng 477).
- Góc Vận hành đã có kệ pallet, bàn đóng gói, xe nâng tay và thùng hàng xuất khẩu (dòng 524–525).
- Dải nút bay máy quay `ZONES` có 10 nút (dòng 641–643), từ «Toàn cảnh» đến «Sảnh cờ · Chinh phục».
- Ngoài ra có các phòng riêng (cảnh `RM`, `BUILD[...]`, dòng 1016–1864) như cửa hàng, quyết định, báo cáo, thị trường.
- **Chưa có cảng, tàu hay hải quan.**

**Luật chơi** (`game.html` nạp `js/engine.js`; trang 3D bọc `game.html` trong iframe):
- Một ván có 6 vụ. Mỗi đội bốc thăm một trong ba trường hợp A, B, C; ở vụ 5 trường hợp nào cũng có một biến cố hậu cần:

| Trường hợp | Mã | Tên | `costMul` | `fulfillMul` | Dòng |
|---|---|---|---|---|---|
| A | `EV_SUPPLY` | Khủng hoảng chuỗi cung ứng (tàu hàng chính bị mắc kẹt) | 1,25 | 0,85 | engine.js 50–57 |
| B | `EV_SUPPLY_B` | Cảng tắc nghẽn vì hàng ngoại | 1,25 | 0,85 | engine.js 107–114 |
| C | `EV_SUPPLY_C` | Kho hàng quá tải (mùa sale livestream) | 1,25 | 0,85 | engine.js 166–173 |

- Lumina hỏi CEO «tăng ngân sách vận chuyển hay đàm phán lại thời gian giao hàng?», nhưng **engine không có lựa chọn này**. Nút hành động chỉ mở bảng Quyết định, và đội nào cũng chịu cùng một tác động.
- `fulfillMul` cắt số hàng bán được (engine.js 768). `costMul` nhân vào giá thành đơn vị và chi phí cố định (engine.js 774, 785).
- Khiên bảo hiểm `INS_SHIELD_01` giảm một nửa phần bất lợi (engine.js 669–679).
- `js/market-dynamic.js` đã có sẵn cách «móc» vào `currentEvent` bằng một mô-đun riêng, không sửa engine (dòng 112–122).

**Hồ sơ quyền tác giả**: Bật Nghiệp bản 3D đã nộp hồ sơ, khóa ở commit `afbacd2` (07/10/2026). Kế hoạch `docs/roadmap/KE-HOACH-DON-HE-SINH-THAI-2026-11.md` mục 0 ghi:
- không đổi tên, xóa hay chuyển hướng `BizOn Game 3D.html` và `game.html`;
- không «sửa logic trong `js/engine.js`» cho tới khi có giấy chứng nhận.

Từ 08/10/2026 đến nay đã có 41 commit sửa `BizOn Game 3D.html` và 5 commit sửa `js/engine.js` (gần nhất #1109). Bước 2 có đi vào vùng này hay không là câu hỏi 1.

**Lịch dùng thật**: lớp UM Kendari (KT330H, 160 sinh viên, 32 đội) chơi Bật Nghiệp 3D ngày 19/11/2026.

## Làm rõ

Chị trả lời ngày 16/11/2026 («1a, 2b, 3a, 4.a (tìm minh chứng cho số liệu nếu được), 5.a»):

1. **Cách làm Bước 2 (1A)**: luật cảng viết trong mô-đun riêng `js/cang-cai-mep.js`, móc vào `currentEvent` và
   `simulateRound` giống `js/market-dynamic.js`; **không sửa dòng nào** trong `js/engine.js` và `js/app.js`. Gỡ một thẻ
   `<script>` là trở lại luật cũ.
2. **Thời điểm (2B)**: câu chuyện 1 (khu cảng, không đổi luật) gộp **trước** buổi UMK 19/11/2026 nếu CI xanh; câu chuyện 2
   (đổi luật) gộp **sau** 19/11/2026.
3. **Phạm vi (3A)**: áp cho cả ba biến cố vụ 5 (`EV_SUPPLY`, `EV_SUPPLY_B`, `EV_SUPPLY_C`), câu chữ theo từng trường hợp.
4. **Số liệu (4A)**: em đặt số nháp, chạy `/balance-check`, gửi chị và thầy Tú bảng số duyệt trong PR câu chuyện 2;
   mỗi số có minh chứng (mục «Nguồn số liệu» trong `plan.md`).
5. **Điểm (5A)**: lựa chọn ở cảng không tính điểm riêng, chỉ dùng khi thảo luận sau ván.

## Kịch bản người dùng và kiểm thử *(bắt buộc)*

### Câu chuyện 1 – Ghé Cảng Cái Mép, hiểu vì sao cảng nước sâu quan trọng với hàng xuất khẩu (Ưu tiên: P1)

Đội đang chơi Bật Nghiệp 3D bấm nút «🚢 Cảng Cái Mép» trong dải nút chuyển cảnh. Máy quay bay tới khu cảng đất sét
cạnh trụ sở. Khu cảng có:
- cần cẩu bờ;
- một tàu container lớn đang cập cầu;
- bãi container nhiều màu;
- trạm hải quan có rào chắn;
- biển tên «CẢNG CÁI MÉP – THỊ VẢI».

Chạm vào từng chỗ mở một thẻ kiến thức ngắn (VI/EN):
- **Cầu cảng nước sâu**: cảng nhận tàu mẹ cỡ lớn, đi thẳng sang Mỹ và châu Âu không phải chuyển tải ở cảng khác, nên rút ngắn thời gian và chi phí.
- **Tàu container**: một container 40 feet (FEU) bằng 2 TEU; vì sao tàu càng lớn thì chi phí mỗi container càng thấp.
- **Bãi container và Incoterms**: FOB và CIF khác nhau ở chỗ ai trả cước biển và bảo hiểm, rủi ro chuyển sang người mua ở đâu.
- **Hải quan**: bộ hồ sơ xuất khẩu, gồm hóa đơn, phiếu đóng gói, vận đơn, C/O, kiểm dịch.
- **Khi cảng tắc**: tàu chờ cầu, phí lưu container và lưu bãi tăng, hàng giao trễ (nối với biến cố vụ 5).

Thẻ không thay đổi bất kỳ con số nào trong ván.

**Vì sao P1**: tự nó đã có giá trị học tập, vì sinh viên thấy được chặng cảng và hải quan mà trụ sở chưa có. Câu chuyện này không chạm luật chơi nên không làm lệch điểm của lớp đang học. Câu chuyện 2 cần nó làm nơi diễn ra quyết định.

**Cách thử độc lập**: mở Bật Nghiệp 3D ở 390 px và 1280 px, bấm «🚢 Cảng Cái Mép», chạm từng chỗ. Kỳ vọng:
- mỗi chỗ mở đúng thẻ, đổi VI/EN được;
- chơi tiếp một vụ thì kết quả trùng từng con số với bản chưa có cảng.

**Kịch bản chấp nhận**:

1. **Cho** đội đang ở trụ sở, **khi** bấm «🚢 Cảng Cái Mép», **thì** máy quay bay tới khu cảng trong ≤ 1,5 giây, có biển tên cảng.
2. **Cho** khu cảng đang hiện, **khi** chạm cần cẩu, tàu, bãi container, trạm hải quan hoặc biển «Khi cảng tắc», **thì** mở đúng thẻ của chỗ đó, có nút đóng, chữ theo ngôn ngữ đang chọn.
3. **Cho** một thẻ đang mở, **khi** đổi VI ↔ EN, **thì** thẻ vẽ lại bằng ngôn ngữ mới, không đóng.
4. **Cho** hai ván cùng hạt giống và cùng quyết định, một ván có ghé cảng và một ván không, **khi** chốt vụ, **thì** mọi chỉ số (doanh thu, lợi nhuận, tồn kho, điểm) trùng nhau.
5. **Cho** máy yếu (chế độ nhẹ `LOWHIDE`), **khi** vào cảnh, **thì** các vật trang trí phụ của cảng được ẩn, nút và thẻ vẫn dùng được.
6. **Cho** điện thoại 360–390 px, **khi** bấm nút cảng và mở thẻ, **thì** không tràn ngang; vùng chạm ≥ 44 px (cho phép lớp chạm vô hình); thẻ không che nút đóng.

---

### Câu chuyện 2 – Vụ 5: đội chọn cách xử lý tắc nghẽn ở cảng (Ưu tiên: P2)

Ở vụ 5, khi biến cố hậu cần xảy ra, bảng Quyết định có thêm ô «🚢 Xử lý hàng kẹt ở Cái Mép» với ba lựa chọn. COO đề xuất, CEO chốt cùng lúc chốt vụ:

| Lựa chọn | Câu chữ cho người chơi | Tác động (số nháp, chốt sau `/balance-check`) |
|---|---|---|
| (a) Trả phí ưu tiên | Thuê cầu cảng ưu tiên và vận tải nhanh, giao đủ hàng | `fulfillMul` = 1,0; hệ số chi phí vụ **Ca** thay cho 1,25 (nháp 1,40) |
| (b) Chờ hoặc đổi cảng | Chờ cầu trống hoặc chuyển cảng, không tốn thêm phí | Như luật hiện nay: `costMul` 1,25, `fulfillMul` 0,85 |
| (c) Đàm phán lùi ngày giao | Xin khách lùi hạn, giữ phần lớn đơn nhưng mất uy tín | `fulfillMul` = 0,95; uy tín thương hiệu `brand` giảm **U** (nháp: 0,05–0,08), ảnh hưởng vụ 6 |

- Không lựa chọn nào luôn thắng:
  - (a) tốt khi biên lợi nhuận cao và hàng sẵn;
  - (b) tốt khi tồn kho thừa hoặc tiền mặt mỏng;
  - (c) tốt khi đội không định dựa vào thương hiệu ở vụ cuối.
- Đội không chọn thì tính là (b), tức đúng như luật hiện nay.
- Khiên bảo hiểm vẫn giảm một nửa phần bất lợi của lựa chọn đã chọn.
- Lumina chỉ gợi câu hỏi («Biên lợi nhuận mỗi sản phẩm của ta là bao nhiêu? Vụ 6 ta cần thương hiệu đến mức nào?»), **không chọn giúp**.

**Vì sao P2**: biến lời Lumina thành quyết định thật, dạy đánh đổi chi phí, mức đáp ứng đơn và uy tín (CLO-C, CLO-E). Câu chuyện này đổi luật chơi nên cần làm rõ và cân bằng trước.

**Cách thử độc lập**: chạy engine không cần trình duyệt với cùng hạt giống và cùng quyết định cho vụ 1–5, lần lượt chọn (a), (b), (c) và «không chọn». Kỳ vọng:
- «không chọn» trùng từng con số với (b) và với luật hiện nay;
- (a) giao đủ hàng nhưng chi phí vụ cao hơn (Ca);
- (c) giao 95% hàng và `brand` thấp hơn ở vụ 6;
- `/balance-check` không thấy lựa chọn nào thắng ở mọi kịch bản.

**Kịch bản chấp nhận**:

1. **Cho** đội ở vụ 5 với biến cố A, B hoặc C, **khi** mở bảng Quyết định (2D, 3D, v2), **thì** thấy ô «Xử lý hàng kẹt ở Cái Mép» với ba lựa chọn, mặc định (b).
2. **Cho** đội ở vụ khác vụ 5, **khi** mở bảng Quyết định, **thì** không thấy ô này.
3. **Cho** đội chọn (a) và chốt vụ, **thì** số hàng bán không bị cắt 15%, hệ số chi phí vụ là Ca thay cho 1,25, báo cáo vụ ghi một dòng «Phí ưu tiên cảng».
4. **Cho** đội chọn (c) và chốt vụ, **thì** số hàng bán = 95% số bán được, `brand` giảm U trước khi tính vụ 6, báo cáo vụ ghi «Lùi ngày giao – uy tín giảm».
5. **Cho** đội không chạm vào ô, **khi** chốt vụ, **thì** kết quả trùng từng con số với luật hiện nay.
6. **Cho** đội có khiên bảo hiểm, **khi** chọn bất kỳ lựa chọn nào, **thì** phần bất lợi giảm một nửa như với các biến cố khác.
7. **Cho** lớp nộp kết quả lên Supabase, **khi** chốt vụ 5, **thì** lựa chọn ở cảng được lưu trong ván (để thảo luận và chấm), không cần bảng mới hay migration.
8. **Cho** đội ở khu cảng 3D trong vụ 5, **khi** chạm trạm hải quan, **thì** thẻ có thêm nút «Ra quyết định» mở thẳng ô lựa chọn này.

---

### Trường hợp biên

- Ván cũ lưu trước khi có tính năng, đang dở ở vụ 5: mở lại thì ô hiện với mặc định (b); kết quả không đổi nếu đội không chọn.
- Đội tải lại trang sau khi đã chọn (a) nhưng chưa chốt: lựa chọn được giữ như các ô quyết định khác.
- Tiền mặt không đủ trả phần chi phí tăng thêm của (a): phần thiếu đi vào thấu chi và tính lãi 8,5% như luật vay hiện có, không chặn lựa chọn.
- Chế độ thi đấu với đối thủ ảo: đối thủ ảo không chọn, giữ như luật hiện nay.
- Bản 2D (`game.html`), bản gọn v2 (nếu có ô Quyết định riêng) và bản 3D phải hiện cùng một ô, cùng mặc định.
- Cảnh 3D không tải được (lỗi WebGL): nút cảng ẩn; ô quyết định ở bảng 2D vẫn dùng được.

## Yêu cầu *(bắt buộc)*

### Yêu cầu chức năng

- **FR-001**: Bật Nghiệp 3D PHẢI có khu «Cảng Cái Mép – Thị Vải» đất sét gồm cần cẩu, tàu container, bãi container, trạm hải quan và biển tên. Mở bằng một nút mới trong `ZONES`, bay máy quay như các khu khác.
- **FR-002**: Mỗi chỗ chạm được mở một thẻ kiến thức VI/EN, nội dung như câu chuyện 1. Mọi con số về cảng (cỡ tàu, tuyến đi thẳng) PHẢI có nguồn ghi trong `plan.md` và được kiểm lại ngày làm.
- **FR-003**: Câu chuyện 1 KHÔNG ĐƯỢC đổi bất kỳ con số nào trong mô phỏng, lượt chơi hay dữ liệu gửi đi.
- **FR-004**: Ở vụ 5, khi biến cố là `EV_SUPPLY`, `EV_SUPPLY_B` hoặc `EV_SUPPLY_C`, bảng Quyết định PHẢI có ô ba lựa chọn (a)/(b)/(c), mặc định (b).
- **FR-005**: Lựa chọn (b) và «không chọn» PHẢI cho kết quả trùng từng con số với luật hiện nay.
- **FR-006**: Lựa chọn (a) bỏ phần cắt đơn (`fulfillMul` về 1) và nâng hệ số chi phí lên Ca. Lựa chọn (c) đặt `fulfillMul` 0,95 và giảm `brand` U. Ca và U chốt bằng `/balance-check`, chị duyệt bảng số trong PR.
- **FR-007**: Khiên bảo hiểm áp lên lựa chọn đã chọn theo cùng công thức `shieldedEvent`.
- **FR-008**: Lumina và thầy Tu Phan chỉ đặt câu hỏi gợi ý, không chọn giúp, không nói lựa chọn nào tốt hơn.
- **FR-009**: Lựa chọn ở cảng PHẢI nằm trong trạng thái ván (lưu, nộp, xuất Excel của giảng viên). Không thêm bảng hay RPC Supabase.
- **FR-010**: Mọi chữ mới có bản tiếng Anh; tên riêng «Cái Mép – Thị Vải» giữ nguyên dấu trong bản tiếng Anh.
- **FR-011**: Không đổi tên, xóa hay chuyển hướng tệp nào thuộc hồ sơ quyền tác giả. Cách chạm vào `js/engine.js` theo câu trả lời câu hỏi 1.
- **FR-012**: Đổi luật (câu chuyện 2) PHẢI được ghi ngày áp dụng vào tài liệu chấm điểm. Lớp nào chơi trước ngày đó thì so sánh dữ liệu ghi rõ là theo luật cũ (hiến chương I).

### Thực thể chính

- **Khu cảng**: các vật thể 3D, mỗi chỗ chạm gắn với một thẻ kiến thức (mã, tiêu đề VI/EN, nội dung VI/EN, nguồn).
- **Quyết định ở cảng**: một trường mới trong quyết định vụ 5, giá trị `a` | `b` | `c`, mặc định `b`.
- **Tham số cảng**: Ca (hệ số chi phí của (a)), U (mức giảm uy tín), `fulfillMul` của (c). Đặt ở đầu `js/cang-cai-mep.js` để chỉnh cân bằng.

## Tiêu chí thành công *(bắt buộc)*

- **SC-001**: Từ trụ sở tới khu cảng chỉ cần một lần bấm. Mọi thẻ mở được ở 360, 390 và 1280 px, không tràn ngang.
- **SC-002**: Sau câu chuyện 1, kết quả 6 vụ với cùng hạt giống và cùng quyết định trùng 100% với trước khi có cảng (test so từng con số).
- **SC-003**: Sau câu chuyện 2, `/balance-check` trên ít nhất 3 kiểu đội (biên cao/tồn kho thấp, tiền mỏng/tồn kho thừa, dựa vào thương hiệu) cho thấy mỗi lựa chọn (a), (b), (c) thắng ở ít nhất một kiểu.
- **SC-004**: Trong buổi thảo luận sau ván, giảng viên dẫn được lựa chọn ở cảng của từng đội từ bản xuất Excel và hỏi «vì sao đội chọn vậy?» (CLO-C, CLO-E).
- **SC-005**: Mọi test hiện có đạt, gồm `bn3d-onboarding`, `bn3d-upgrades`, `engine`, `market-shock-lumina`, `bn2-grade` và `ip-ma-nguon-afbacd2`.

## Nối chuẩn đầu ra

- **CLO-C · Quản trị vận hành (COO)**: cân đối chi phí hậu cần, tỷ lệ đáp ứng đơn và tồn kho khi chuỗi cung ứng đứt gãy.
- **CLO-E · Hợp tác 5 vai**: COO đề xuất, CFO so phần chi phí tăng của (a) với doanh thu mất, CMO cân nhắc uy tín, CEO chốt dưới áp lực thời gian.
- **CLO-D (gián tiếp)**: thẻ Incoterms và hải quan chuẩn bị cho Bậc 3 «Quốc tế hóa», chưa đổi điểm CLO-D.

## Giả định

- Khu cảng đặt **ngoài** nền trụ sở hiện có (thêm nền riêng, ví dụ phía x > 8), để không xê dịch đồ đạc và các test đang đếm vật thể.
- Nút «🚢 Cảng Cái Mép» thêm vào `ZONES`, không thêm vào dải nút bên (rail), vì `bn3d-onboarding` đang đếm đúng 24 nút ở rail.
- Không thêm ảnh hay nhân vật mới. Tàu, cần cẩu, container dựng bằng khối đất sét của `bizon-hq-kit.js`.
- Không dùng logo hay tên thương mại của các bến cảng cụ thể (TCIT, Gemalink, CMIT), chỉ dùng tên địa danh «Cái Mép – Thị Vải».
- Số nháp Ca và U chỉ là điểm khởi đầu. Số chính thức chốt sau `/balance-check` và chị duyệt.

## Câu hỏi gửi chị

Đã trả lời ngày 16/11/2026, xem mục «Làm rõ».
