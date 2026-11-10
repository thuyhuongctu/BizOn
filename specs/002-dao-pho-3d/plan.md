# Kế hoạch: Dạo phố 3D cho các game BizOn

**Đặc tả**: [spec.md](spec.md) · **Làm rõ**: chị trả lời 10/11/2026 · **Trạng thái**: chờ chị duyệt, chưa viết mã

**Phạm vi lượt này**: câu chuyện 1, 2, 3 (Phố BizOn và Hộ Chiếu Sầu Riêng 3D). Câu chuyện 4, 5 (ba game thuộc hồ sơ
quyền tác giả) hoãn tới khi có giấy chứng nhận.

## Bối cảnh kỹ thuật

- Trang tĩnh, không build. Thư viện 3D đã có sẵn trong kho: three.js bản mô-đun r184 (`js/vendor/three.module.js`),
  bộ nạp mô hình (`js/vendor/GLTFLoader.js`, `SkeletonUtils.js`). Không thêm thư viện mới.
- Nhân vật: `bizon-characters.js` đã có ba lớp tạo hình (mô hình có xương → tranh dựng đứng → khối đất sét) và hàm
  chuyển động tác đứng / nói / đi. Phố BizOn bật mô hình bằng cờ `window.BIZON_CHAR_GLB = true` có sẵn; **không sửa
  tệp này** (Bật Nghiệp 3D đang dùng).
- Sảnh 3D hiện chạy bằng `js/hub3d.js` (three.js bản toàn cục r160, tranh dựng đứng). Hai bản three.js không trộn
  được trong một cảnh, nên Phố BizOn chuyển sang bản mô-đun; `js/hub3d.js` giữ nguyên trong kho, trang không nạp nữa.
- Hộ Chiếu Sầu Riêng 3D là trang đóng gói (mã nằm trong một chuỗi bên trong tệp, three.js riêng của gói). Tiền lệ:
  `js/clay-truck.js` là tệp ngoài được trang nạp bằng một thẻ `<script src>`. Phần dạo phố đi theo đúng cách đó.
- Ngoại tuyến: `sw.js` đã lưu tệp cùng nguồn khi tải lần đầu, nên mô hình dùng được khi mất mạng từ lần mở thứ hai;
  không đưa 6,96 MB mô hình vào danh sách tải trước.
- Test: Playwright với WebGL phần mềm; phần dạo phố lộ một cửa đọc trạng thái (`window.BizOnDaoPho.state()`) để
  test đọc vị trí, địa điểm đang gần, động tác hiện tại mà không phải so ảnh.

## Kiểm theo hiến chương

- **I. Học là chính**: dạo phố không dạy trực tiếp chuẩn đầu ra nên bị ràng buộc ngược: luôn có lối tắt «Đi tới…»
  (FR-006), không đổi luật, điểm, dữ liệu (FR-011, SC-006), theo dõi thời gian tới quyết định đầu tiên (SC-009).
  Người qua lại và cố vấn chỉ gợi hướng, không chọn giúp (FR-010). ✔
- **II. Nói thật**: thẻ «Vào» ghi đúng «miễn phí» / «dùng thử» (FR-017); người qua lại là «nhân vật BizOn», không gọi
  là AI. ✔
- **III. Trang tĩnh (không thương lượng)**: không build, không máy chủ; toàn màn hình ở 360–390 px, vùng chạm ≥ 44 px,
  tương phản ≥ 4,5, song ngữ `data-en`; có trạng thái đang tải, lỗi, mất mạng; quay về kiểu cũ khi không có 3D
  (FR-012). ✔
- **IV. Có test**: mỗi PR có test viết trước và thấy hỏng; html-validate 0 lỗi; nâng `CACHE`. ✔
- **V. Dữ liệu tối thiểu**: không gửi gì lên máy chủ; chỉ nhớ nhân vật đã chọn trong `localStorage` như Sảnh 3D hiện
  nay. Không có migration. ✔
- **Hồ sơ quyền tác giả**: không chạm `BizOn Game 3D.html`, `ben-phu-sa*.html`, `Ho Chieu Thuong Hieu 3D.html`, cũng
  không chạm `js/clay-hub.js`, `js/office-scene.js`, `bizon-characters.js`, `js/bps-hub.js`, `js/bp-hub.js` (các tệp
  mã mà hồ sơ liệt kê là thành phần của ba game). Test canh điều này (SC-008). ✔
- **Nhân vật lấy từ ảnh game có sẵn**: 7 mô hình dựng từ tranh gốc; Sầu Riêng 3D giữ nhân vật của chính nó. ✔
- **Bên thứ ba**: vspeak chỉ là mẫu tham khảo cách tương tác, không chép mã hay hình nên không ghi vào
  `THIRD-PARTY-NOTICES.md`; ghi một dòng nguồn cảm hứng trong chú thích đầu tệp. ✔

## Thiết kế

### Phần dùng chung: `js/dao-pho.js` (mới)

Một tệp, không phụ thuộc bản three.js nào: trang truyền `THREE` của mình vào. Không biết gì về luật chơi.

`BizOnDaoPho.create({ THREE, camera, canvas, host, player, places, blocks, bounds, lang, onEnter, reduceMotion })`
trả về `{ update(dt), goTo(id), state(), setPlaces(list), dispose() }`. Gồm năm khối nhỏ:

| Khối | Việc | Ghi chú |
|---|---|---|
| Điều khiển | Cần điều khiển (chạm, góc trái dưới, đường kính ≥ 112 px), WASD, mũi tên; hướng đi tính **theo máy quay** (đẩy lên là đi ra xa máy quay) | Thả tay hoặc chuyển thẻ trình duyệt thì dừng |
| Di chuyển | Gia tốc, giảm tốc, quay mặt theo hướng đi; chặn bởi `blocks` (hình chữ nhật, hình tròn) và `bounds` | Báo động tác `idle` / `walk` cho trang đổi clip |
| Máy quay sau lưng | Đứng sau và trên vai nhân vật, xoay dần về sau lưng khi đi; kéo lại gần khi vướng `blocks`; kéo ngang màn hình để nhìn quanh | «Giảm chuyển động»: bỏ trễ và lắc, chuyển cảnh tức thì |
| Thẻ «Vào» | Tìm địa điểm gần nhất trong tầm; hiện thẻ (tên, mô tả, nhãn, nút «Vào» ≥ 44 px); E / Enter bấm nút | `aria-live="polite"`; một thẻ mỗi lúc |
| «Đi tới…» | Nút mở danh sách mọi địa điểm; chọn thì đặt nhân vật trước địa điểm và hiện thẻ | Dùng được bằng Tab / Enter; là đường lui khi không có WebGL |

Địa điểm: `{ id, ten: {vi, en}, moTa: {vi, en}, bieuTuong, nhan: {vi, en}, x, z, tam, cua: {x, z, huong} }`.

Bản đồ nhỏ và người qua lại (câu chuyện 2) thêm vào cùng tệp ở PR 2:

- **Bản đồ nhỏ**: một `<canvas>` 2D ở góc phải dưới (≥ 96 px, không che thẻ và cần điều khiển ở 360 px), vẽ `bounds`,
  `blocks`, biểu tượng địa điểm, mũi tên người chơi; bấm biểu tượng thì bật mũi tên chỉ đường trên phố.
- **Người qua lại**: mỗi người một vòng điểm mốc; tới gần thì dừng, quay lại, hiện bong bóng một câu (VI/EN) lấy từ
  danh sách soạn sẵn. Mô hình của họ tải sau nhân vật người chơi; lỗi tải thì dùng tranh dựng đứng.

### Câu chuyện 1 – Phố BizOn (`hub-3d.html`, `js/pho-bizon.js` mới)

- `hub-3d.html`: giữ địa chỉ và `noindex`; đổi tiêu đề thành «Phố BizOn»; cảnh 3D chiếm toàn màn hình khi đã chọn
  nhân vật (thanh điều hướng thu lại, có nút «Thoát»). Nạp bản three.js mô-đun qua `importmap` như Bật Nghiệp 3D.
- Màn chọn nhân vật: 5 vai đội, hiện bằng ảnh gốc có sẵn (`assets/character/team/…`), nhớ lựa chọn trong
  `localStorage`. Hai đại diện áo dài của Sảnh cũ thôi dùng làm người chơi (không có mô hình 3D).
- Cảnh: một quảng trường và hai dãy phố kiểu đất sét dựng bằng khối cơ bản; mỗi game một toà nhà có bảng hiệu là ảnh
  bìa game đã có trong kho. Địa điểm: Bến Phù Sa, Bật Nghiệp, Hộ Chiếu Thương Hiệu, Hộ Chiếu Sầu Riêng, Arcade,
  Hành trình 3 bậc; cộng máy hát, bảng tin, bảng thành tích của Sảnh cũ.
- Lumina và thầy Tu Phan đứng ở quảng trường (mô hình có xương, động tác đứng / nói), giữ lời thoại của Sảnh cũ.
- Tên nhân vật: nhãn chữ HTML bám theo đầu nhân vật (FR-008).
- Đường lui: không có WebGL thì hiện danh sách «Đi tới…» dạng liên kết thường; mô hình lỗi thì `bizon-characters.js`
  tự dùng tranh dựng đứng và trang báo một dòng.
- Nhãn chính sách trên thẻ lấy từ một bảng nhỏ trong `js/pho-bizon.js`, test đối chiếu với trang Chính sách. Game
  nào trang Chính sách chưa nói rõ (Hộ Chiếu Sầu Riêng, Hành trình 3 bậc) thì thẻ **không ghi nhãn**, không tự đoán.
- Sau khi PR 1 dùng trên lớp, ghi thời gian tới quyết định đầu tiên vào báo cáo chơi thử (lệnh `/playtest-report`)
  để theo dõi SC-009.

### Câu chuyện 3 – Hộ Chiếu Sầu Riêng 3D

- Trang nạp thêm `../js/dao-pho.js`. Trong mã của trang chỉ sửa ba chỗ: (1) giao máy quay cho phần dạo phố khi đang
  đi bộ (chế độ «Toàn cảnh» và sa bàn giữ nguyên), (2) thay lời nhắc «bấm E» bằng thẻ «Vào» gọi đúng hàm mở hội thoại
  / bảng việc hiện có, (3) thêm bản đồ nhỏ và «Đi tới…» từ danh sách trạm và người có việc đang có.
- Không đụng `lab/ho-chieu-sau-rieng-engine.js`, `-data.js`, `-core.js`: luật, điểm, ván lưu không đổi. Bản 2D và bản
  gọn không nạp phần dạo phố; chạy lại bộ test của cả ba bản.
- Thẻ «Việc tiếp theo» và nút dẫn đường hiện có giữ nguyên; «Đi tới…» bổ sung chứ không thay.

### Rủi ro và cách xử lý

| Rủi ro | Xử lý |
|---|---|
| Mặt mô hình nhòe (lý do PR #1024) | Máy quay ở sau lưng; nhãn tên bằng chữ; màn chọn nhân vật dùng ảnh gốc. Chị xem bản thử trên điện thoại trước khi «Gộp» PR 1 |
| Điện thoại yếu không đủ 30 khung hình | Giới hạn độ phân giải vẽ, tắt bóng đổ trên máy yếu, người qua lại tối đa 4; có lối tắt «Đi tới…» |
| CI không đo được khung hình thật | Test chỉ kiểm vòng vẽ chạy và trạng thái đúng; SC-005 đo tay trên điện thoại của chị, ghi vào PR |
| Sửa trang đóng gói Sầu Riêng 3D dễ vỡ | Mã mới nằm ở tệp ngoài; trong gói chỉ ba điểm nối; chạy đủ test ba bản |
| Tải mô hình chậm trên 4G | Chỉ tải mô hình người chơi trước (khoảng 1 MB), còn lại tải sau; có dòng «Đang tải nhân vật…» |

## Tệp sẽ chạm

| PR | Tệp |
|---|---|
| 1 | `js/dao-pho.js` (mới), `js/pho-bizon.js` (mới), `hub-3d.html`, `test/dao-pho-pho-bizon.test.js` (mới), `test/dao-pho-ho-so.test.js` (mới), `sw.js` |
| 2 | `js/dao-pho.js`, `js/pho-bizon.js`, `test/dao-pho-ban-do-nho.test.js` (mới), `sw.js` |
| 3 | `lab/ho-chieu-sau-rieng-3d.html`, `js/dao-pho.js` (nếu cần tham số thêm), `test/dao-pho-sau-rieng-3d.test.js` (mới), `sw.js` |

Không chạm: ba trang game thuộc hồ sơ và tệp mã của chúng; `bizon-characters.js`; engine và dữ liệu Sầu Riêng;
`index.html` / `academia3d-v2.html`; Supabase.
