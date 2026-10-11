# Thiết kế: chọn phương thức thâm nhập + vận chuyển bằng tương tác 3D (Hộ Chiếu Thương Hiệu)

*Tài liệu thiết kế — chưa code. Cần duyệt trước khi đụng vào `bp3d.js` (141KB, không có test Playwright).*

## 0. Vấn đề cần giải

Trang 3D thật là **`Ho Chieu Thuong Hieu 3D.html`** (không phải `brand-passport.html` — file đó không có 3D). Hiện tại bấm vào một đảo thị trường (tương tác 3D thật) sẽ mở ra **một panel HTML liệt kê 6 nút chữ** (`openAct()` trong `bp3d.js:689-703`) để chọn phương thức thâm nhập — về bản chất vẫn là "tick chọn", chỉ là cổng vào bằng 3D. Bước chọn **vận chuyển** (`bpShip`) hiện còn không qua 3D chút nào — chỉ có ở "thẻ Quyết định" HTML bên dưới canvas (`Ho Chieu Thuong Hieu 3D.html:1364-1366`).

Yêu cầu: quyết định được **thực hiện trong cảnh 3D** — chạm đúng vật thể đại diện cho lựa chọn — không phải đọc danh sách chữ rồi bấm nút.

## 1. Nguyên tắc giữ nguyên

- **Không đổi logic/game state.** `window.bpEnter(m, md)`, `window.bpShip(sm)`, `window.bpIntel(i, m)` đã tồn tại sẵn và được `openAct()`'s buttons gọi thẳng (`bp3d.js:707-708`). Thiết kế này chỉ đổi **nguồn gọi** các hàm đó — từ "bấm nút HTML trong panel" sang "bấm vật thể 3D" — không viết lại cân bằng, không đổi state shape, không đụng `Ho Chieu Thuong Hieu 3D.html`'s `S`/`MODES`/`SHIP_MODES`.
- **Chỉ sửa `bp3d.js`** (lớp trình bày) + có thể thêm vài dòng CSS nhỏ nếu cần ẩn/hiện panel chữ cũ.
- **Giữ nguyên hoàn toàn** `js/bp-hub.js` + `js/clay-hub.js` (hub "Văn phòng" CSS riêng biệt) và `bp3d-streets.js` (Phố Thị Trường) — ngoài phạm vi.

## 2. Trạm thâm nhập quanh đảo (thay panel chữ cho bước chọn entry mode)

### 2.1 Bố cục

Tái dùng đúng bán kính vòng chọn đã có (`ring` tại `IR * 1.45`, `bp3d.js:346-347`, IR=2.6). Khi một đảo đang "focus" (`userKey === 'm'+m`) VÀ đang ở đúng điều kiện `openAct` hiện yêu cầu (`S.phase==='dec' && S.entered[m]===null`), sinh ra 6 "trạm" nhỏ xếp vòng quanh đảo ở bán kính đó, cách đều 60°, mỗi trạm cao ~0.9 đơn vị, quay mặt vào tâm đảo.

### 2.2 Hình khối từng trạm (dùng `GE` primitives + `M()` material cache đã có sẵn, không cần model mới)

Thứ tự đúng `MODES` thật (`Ho Chieu Thuong Hieu 3D.html:538-544`), màu/icon lấy nguyên từ `MODE_HEX`/`MODE_ICON` đã định nghĩa (`bp3d.js:68-69`):

| # | Mode | Icon/màu có sẵn | Hình khối đề xuất | Build từ |
|---|---|---|---|---|
| 0 | Nền tảng số (digital entry) | 🛒 `#2f8fcf` | Cột ăng-ten nhỏ + đĩa tròn phát sóng nhấp nháy | `GE.cyl` (cột) + `GE.cone` lật ngược (đĩa) + vòng sóng mở rộng (giống hiệu ứng `duelFx`'s ring, dùng `RingGeometry` opacity giảm dần) |
| 1 | Xuất khẩu trực tiếp | 🚢 `#e8762d` | Chồng 2-3 thùng hàng (container) | `GE.box` × 3, xếp lệch như kiện hàng |
| 2 | Liên minh chiến lược | 🤝 `#3f8f4a` | Hai cọc gỗ nghiêng vào nhau như bắt tay + biểu ngữ nhỏ | `GE.cyl` × 2 nghiêng + `flagGeo`/`emojiTex` (tái dùng pattern cờ đã có ở `makeFlag`) |
| 3 | Nhượng quyền (licensing) | 📜 `#8a5fc9` | Cuộn giấy dựng đứng + con dấu tròn nổi bên trên | `GE.cyl` mảnh (cuộn) + `GE.sph` dẹt (con dấu) |
| 4 | Liên doanh (JV) | 🏗️ `#1f8f8a` | Cần cẩu mini (cột + tay ngang + móc) | `GE.cyl` (cột) + `GE.box` mảnh (tay cẩu) + dây (đường line mảnh) |
| 5 | FDI sở hữu toàn bộ | 🏭 `#b0473f` | Nhà máy nhỏ (khối hộp + 2 ống khói) | `GE.box` (thân) + `GE.cyl` × 2 (ống khói) + khói nhẹ (tái dùng `GE.puff` pattern từ `smoke` ở Hỏa Sơn, `bp3d.js:218-220`) |

Mỗi trạm có một **biển hiệu nổi phía trên** dùng lại `emojiTex(icon, color)` (đã dùng cho cờ ở `makeFlag`, `bp3d.js:350-354`) — chỉ icon, không chữ dài, để không lặp lại vấn đề "chữ phải đọc".

### 2.3 Raycast & tương tác

- Mỗi trạm (nhóm `Group`) có một mesh "vùng chạm" lớn hơn hình thật một chút (dễ bấm trên mobile) — gắn `userData.m = m; userData.mode = modeIdx` rồi `hits.push(hitMesh)`, đúng pattern `bp3d.js:141` đã dùng cho đảo.
- Trong handler `pointerup` hiện tại (`bp3d.js:664-679`), thêm nhánh kiểm tra `h.object.userData.mode !== undefined` **trước** nhánh xử lý đảo thường: nếu trúng trạm → gọi thẳng `window.bpEnter(m, mode)` (giữ logic khóa FDI cần `capab>=55` đã có sẵn trong `bpEnter`, `Ho Chieu Thuong Hieu 3D.html:1329` — không cần kiểm tra lại ở lớp 3D) → phát `sfx('pop')` → hiện toast `say()` xác nhận → dọn 6 trạm (đã chọn xong, trạm biến mất, nhường chỗ cho `makeFlag` cắm cờ như cũ).
- Click lại vào một trạm đã chọn = bỏ chọn (match `bpEnter`'s toggle behaviour dòng 1328 đã có sẵn).
- **Giữ nguyên `openAct()` panel chữ làm phương án dự phòng/desktop phụ** (ẩn mặc định, có nút nhỏ "☰ Xem dạng danh sách" để bật lại) — an toàn hơn là xoá hẳn, đề phòng trạm 3D khó bấm trên thiết bị yếu/màn nhỏ. Có thể bỏ hẳn panel chữ ở một đợt sau khi đã test thực tế ổn.

### 2.4 Thông tin giá/mô tả (giữ information parity với panel chữ cũ)

Panel chữ cũ hiện mỗi mode kèm `<small>giá · ghi chú</small>`. Khi hover (desktop) hoặc chạm giữ (mobile) một trạm, hiện `say()` toast: `"{icon} {tên mode} · {giá} tỷ · {ghi chú}"` — đúng nội dung cũ, chỉ đổi kênh hiển thị từ panel sang toast theo trạm.

## 3. Bến vận chuyển tại Vàm Thịnh (thay bước chọn `bpShip` trong "thẻ Quyết định" HTML)

- Model thuyền (`kind:'sea'`) và máy bay (`kind:'air'`) **đã có sẵn** — chính là `car` được build trong `makeRoute()` (`bp3d.js:383-385`). Chỉ cần đặt 2 bản tĩnh (không animate theo curve) cạnh bến Vàm Thịnh, làm vật chọn.
- Vị trí: hai bên cầu tàu đã dựng sẵn ở Vàm Thịnh (`home` group, `bp3d.js:246-267`), ví dụ thuyền bên trái cầu, máy bay (đậu trên bệ nhỏ) bên phải.
- Raycast tương tự mục 2.3: `userData.ship = 'sea'|'air'`, push vào `hits`, bấm gọi thẳng `window.bpShip(shipId)`.
- **Chỉ hiện** khi `S.sel.enter !== null && S.sel.shipMode === null` (đã chọn entry mode cho một đảo, chưa chọn vận chuyển) — đúng đúng thứ tự game yêu cầu hiện tại (`bpEnter` tự reset `S.sel.shipMode = null` mỗi khi đổi đảo/mode, `Ho Chieu Thuong Hieu 3D.html:1330`). Khi cả hai bến hiện, thêm viền sáng nhấp nháy để người chơi biết đây là bước tiếp theo cần làm (tái dùng `ring` pattern).
- Click xong → toast xác nhận, ẩn bến chọn, cờ/route trên đảo đã chọn cập nhật bình thường qua `sync()` hiện có.

## 4. Luồng tương tác đầy đủ (trước/sau)

**Trước:** Bấm đảo → panel chữ hiện 6 nút → bấm 1 nút → panel đóng → cuộn xuống "thẻ Quyết định" HTML bên dưới canvas → bấm 1 trong 2 nút vận chuyển → xác nhận.

**Sau:** Bấm đảo (focus đảo, camera lại gần) → 6 trạm vật lý hiện quanh đảo → bấm đúng trạm muốn chọn (vd. nhà máy nhỏ cho FDI) → trạm biến mất, cờ cắm lên đảo → 2 bến (thuyền/máy bay) tại Vàm Thịnh sáng lên mời chọn → bấm đúng phương tiện → xác nhận, route 3D chạy giữa Vàm Thịnh và đảo. **Không còn bước nào bắt buộc phải rời khỏi canvas 3D để tick chọn.**

Bước mua tin (`bpIntel`) **giữ nguyên qua panel chữ** ở đợt này — ít quan trọng về mặt "cảm giác nhập vai" hơn chọn entry mode/vận chuyển, và việc chuyển nó sang 3D (vd. bấm vào từng "cố vấn tin tức" khác nhau quanh đảo) là một phần mở rộng hợp lý cho đợt sau, không bắt buộc phải làm cùng lúc.

## 5. Rủi ro & việc cần cẩn trọng

- **Không đụng độ raycast**: trạm mới và mesh đảo gốc đều trong `hits` — phải đảm bảo thứ tự ưu tiên đúng (trạm mode/ship được thêm/xóa động, không che khuất vĩnh viễn mesh đảo khi đã ẩn).
- **Dọn dẹp bộ nhớ GPU**: trạm sinh ra/mất theo focus đảo và theo quý — phải `dispose()` geometry/material tạm thời (hoặc dùng pool tái sử dụng 6 trạm cố định, chỉ ẩn/hiện + đổi vị trí theo đảo đang focus) để tránh rò rỉ bộ nhớ qua 6 quý chơi liên tục. **Khuyến nghị: dùng pool cố định (6 trạm dùng chung, dịch chuyển theo đảo focus)** thay vì tạo mới mỗi lần — đỡ phức tạp quản lý vòng đời hơn.
- **Kích thước chạm trên mobile**: vùng raycast phải đủ lớn (tối thiểu ~44px chiếu lên màn hình ở khoảng cách camera thường dùng) — cần test thật trên viewport nhỏ, không chỉ desktop.
- **Không có test Playwright cho `bp3d.js`** (xác nhận qua khảo sát trước đó) — bắt buộc test thủ công kỹ theo kịch bản ở mục 6, và nên viết **một** bài Playwright mới tối thiểu (mirror style của `test/brand-passport.test.js`) nhắm vào `Ho Chieu Thuong Hieu 3D.html` trước khi mở PR, phủ ít nhất luồng: bấm đảo → bấm trạm mode → bấm bến vận chuyển → xác nhận `S.entered[m]` đúng giá trị.
- **Khóa FDI (capab≥55)**: `bpEnter` đã tự chặn + `alert()` khi chưa đủ năng lực (`Ho Chieu Thuong Hieu 3D.html:1329`) — giữ nguyên hành vi này khi gọi từ trạm 3D, không cần kiểm tra lại, nhưng cần test riêng kịch bản "click trạm 🏭 khi capab<55" để chắc `alert()` không bị kẹt dưới canvas WebGL.

## 6. Kế hoạch test thủ công (trước khi viết test Playwright)

1. Chơi một ván mới, tới quý có ≥1 đảo chưa thâm nhập → bấm đảo → xác nhận 6 trạm hiện đúng vị trí, không chồng lên đảo/cờ cũ.
2. Bấm từng trạm trong 6 trạm lần lượt (ván test riêng mỗi lần) → xác nhận đúng `window.bpEnter` được gọi với đúng `md`, panel chữ cũ (nếu còn bật) phản ánh đúng lựa chọn.
3. Bấm trạm 🏭 (FDI) khi `capab<55` → xác nhận `alert()` hiện đúng, không kẹt UI.
4. Sau khi chọn mode → xác nhận 2 bến vận chuyển ở Vàm Thịnh sáng lên → bấm từng bến → xác nhận `window.bpShip` gọi đúng, "thẻ Quyết định" HTML (nếu vẫn hiện) phản ánh đúng.
5. Bấm lại đúng trạm đã chọn → xác nhận bỏ chọn đúng (toggle), bến vận chuyển ẩn lại đúng lúc `S.sel.enter===null`.
6. Test trên viewport di động thật (hoặc giả lập 390×844) — xác nhận chạm trúng trạm dễ dàng, không cần zoom.
7. Chơi hết 6 quý một lượt, theo dõi hiệu năng khung hình — xác nhận không tụt theo thời gian (kiểm tra rò rỉ bộ nhớ từ việc sinh/xoá trạm nhiều lần).
8. Không có lỗi console/page trong toàn bộ quá trình.

## 7. Phạm vi KHÔNG làm trong đợt này

- **Không** dựng hoạt cảnh thuyền/máy bay di chuyển thật theo thời gian (Phương án B đã bị hoãn ở bước chọn hướng trước đó) — route vẫn chỉ là hiệu ứng trang trí chạy liên tục như hiện tại sau khi chọn xong.
- **Không** đổi bước mua tin (`bpIntel`) sang 3D — vẫn qua panel chữ.
- **Không** đụng vào `js/bp-hub.js`/`js/clay-hub.js` (hub Văn phòng CSS riêng) hay `bp3d-streets.js` (Phố Thị Trường).
- **Không** đổi cân bằng game (giá/margin/risk của các mode) — chỉ đổi cách chọn.
