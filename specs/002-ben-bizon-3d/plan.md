# Kế hoạch: Bến BizOn – đi bộ và chèo xuồng 3D cho các game BizOn

**Đặc tả**: [spec.md](spec.md) · **Làm rõ**: chị trả lời 10/11/2026 (hai lượt) · **Trạng thái**: chờ chị duyệt, chưa viết mã

**Phạm vi lượt này**: câu chuyện 1 đến 4 (Bến BizOn: đi bộ, chèo xuồng, bản đồ nhỏ và người qua lại; Hộ Chiếu Sầu
Riêng 3D). Câu chuyện 5, 6 (ba game thuộc hồ sơ quyền tác giả) hoãn tới khi có giấy chứng nhận.

**Nguyên tắc chị đặt ra**: lấy *cách di chuyển* của mẫu vspeak, **không lấy bối cảnh phố xá**. Nét riêng của BizOn nằm
ở ba thứ: bối cảnh bến sông miền Tây bằng đất sét, nhân vật của chính BizOn, và chiếc xuồng.

## Bối cảnh kỹ thuật

- Trang tĩnh, không build. Thư viện 3D đã có sẵn trong kho: three.js bản mô-đun r184 (`js/vendor/three.module.js`),
  bộ nạp mô hình (`js/vendor/GLTFLoader.js`, `SkeletonUtils.js`). Không thêm thư viện mới.
- Nhân vật: `bizon-characters.js` đã có ba lớp tạo hình (mô hình có xương → tranh dựng đứng → khối đất sét) và hàm
  chuyển động tác đứng / nói / đi. Bến BizOn bật mô hình bằng cờ `window.BIZON_CHAR_GLB = true` có sẵn; **không sửa
  tệp này** (Bật Nghiệp 3D đang dùng).
- Xuồng, ghe, cây: đã có trong kho từ trang Ra Khơi Cùng Lớp 3D (`assets/models/kenney-thuyen/`: xuồng chèo, ghe
  câu, ghe nhà; `assets/models/kenney-cay/`: dừa, lục bình…), giấy phép CC0, đã ghi ở `assets/models/SOURCES.md`.
  Không thêm tài sản bên thứ ba mới; tô lại màu cho hợp tông đất sét như Ra Khơi đã làm.
- Sảnh 3D hiện chạy bằng `js/hub3d.js` (three.js bản toàn cục r160, tranh dựng đứng). Hai bản three.js không trộn
  được trong một cảnh, nên Bến BizOn chuyển sang bản mô-đun; `js/hub3d.js` giữ nguyên trong kho, trang không nạp nữa.
- Hộ Chiếu Sầu Riêng 3D là trang đóng gói (mã nằm trong một chuỗi bên trong tệp, three.js riêng của gói). Tiền lệ:
  `js/clay-truck.js` là tệp ngoài được trang nạp bằng một thẻ `<script src>`. Phần di chuyển mới đi theo cách đó.
- Ngoại tuyến: `sw.js` đã lưu tệp cùng nguồn khi tải lần đầu, nên mô hình dùng được khi mất mạng từ lần mở thứ hai;
  không đưa 6,96 MB mô hình nhân vật vào danh sách tải trước.
- Test: Playwright với WebGL phần mềm; phần di chuyển lộ một cửa đọc trạng thái (`window.BizOnDiChuyen.state()`) để
  test đọc vị trí, đang đi bộ hay trên xuồng, địa điểm đang gần, mà không phải so ảnh.

## Kiểm theo hiến chương

- **I. Học là chính**: kiểu sau lưng không dạy trực tiếp chuẩn đầu ra nên bị ràng buộc ngược: luôn có lối tắt «Đi
  tới…» (FR-006, FR-019), không đổi luật, điểm, dữ liệu (FR-011, SC-006), theo dõi thời gian tới quyết định đầu tiên
  (SC-009). Người qua lại và cố vấn chỉ gợi hướng, không chọn giúp (FR-010). ✔
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
- **Tài sản gốc**: không ghi đè tệp nào; mô hình xuồng dùng nguyên tệp, chỉ đổi màu lúc nạp. ✔
- **Bên thứ ba**: vspeak chỉ là mẫu tham khảo cách tương tác, không chép mã hay hình nên không ghi vào
  `THIRD-PARTY-NOTICES.md`; ghi một dòng nguồn cảm hứng trong chú thích đầu tệp. Bộ Kenney đã được ghi nguồn. ✔

## Thiết kế

### Phần dùng chung: `js/di-chuyen-3d.js` (mới)

Một tệp, không phụ thuộc bản three.js nào (trang truyền `THREE` của mình vào), **không mang bối cảnh nào** (FR-020) và
không biết gì về luật chơi.

`BizOnDiChuyen.create({ THREE, camera, canvas, host, player, places, blocks, bounds, water, lang, onEnter, reduceMotion })`
trả về `{ update(dt), goTo(id), state(), setPlaces(list), dispose() }`.

| Khối | Việc | PR |
|---|---|---|
| Điều khiển | Cần điều khiển (chạm, góc trái dưới, đường kính ≥ 112 px), WASD, mũi tên; hướng tính **theo máy quay**; thả tay hoặc chuyển thẻ trình duyệt thì dừng | 1 |
| Đi bộ | Gia tốc, giảm tốc, quay mặt theo hướng đi; chặn bởi `blocks`, `bounds` và mép nước; báo động tác `idle` / `walk` | 1 |
| Máy quay sau lưng | Đứng sau và trên vai nhân vật, xoay dần về sau lưng khi đi; kéo lại gần khi vướng vật cản; kéo ngang màn hình để nhìn quanh; «giảm chuyển động» thì bỏ trễ và lắc | 1 |
| Thẻ «Vào» | Tìm địa điểm gần nhất trong tầm; hiện thẻ (tên, mô tả, nhãn, nút ≥ 44 px); E / Enter bấm nút; `aria-live="polite"` | 1 |
| «Đi tới…» | Nút mở danh sách mọi địa điểm; chọn thì đặt nhân vật trước địa điểm và hiện thẻ; dùng được bằng Tab / Enter; là đường lui khi không có WebGL | 1 |
| Xuồng | Chế độ thứ hai của cùng bộ điều khiển: quay mũi theo tốc độ góc giới hạn, có đà và lực cản nước, chỉ ở trong vùng `water`; thẻ «Xuống xuồng» / «Lên bờ» tại bến xuồng; máy quay lùi ra sau xuồng | 2 |
| Bản đồ nhỏ | `<canvas>` 2D góc phải dưới (≥ 96 px): bờ, nước, cầu tàu, biểu tượng địa điểm, mũi tên người chơi; bấm biểu tượng thì bật mũi tên chỉ đường | 3 |
| Người qua lại | Vòng điểm mốc; tới gần thì dừng, quay lại, hiện bong bóng một câu soạn sẵn (VI/EN) | 3 |

Địa điểm: `{ id, ten: {vi, en}, moTa: {vi, en}, bieuTuong, nhan: {vi, en}, x, z, tam, tren: 'bo' | 'nuoc', cua: {x, z, huong} }`.
Vùng nước và bờ khai bằng hình đơn giản (chữ nhật, đa giác) do cảnh truyền vào; phần dùng chung chỉ hỏi «điểm này
là bờ hay nước».

### Câu chuyện 1 – Bến BizOn (`hub-3d.html`, `js/ben-bizon.js` mới)

- `hub-3d.html`: giữ địa chỉ và `noindex`; đổi tiêu đề thành «Bến BizOn»; cảnh 3D chiếm toàn màn hình khi đã chọn
  nhân vật (thanh điều hướng thu lại, có nút «Thoát»). Nạp bản three.js mô-đun qua `importmap` như Bật Nghiệp 3D.
- **Bối cảnh**: một khúc sông miền Tây bằng đất sét. Bờ phù sa có hàng dừa và nhà sàn; một cầu tàu gỗ chạy ra sông;
  mặt nước màu phù sa có lục bình trôi. Không có đường nhựa, vạch kẻ, cao ốc.
- **Địa điểm** (mỗi game một hình đúng chất của nó, bảng hiệu là ảnh bìa game có sẵn trong `assets/covers/`):

  | Địa điểm | Hình trong cảnh | Ở đâu |
  |---|---|---|
  | Bến Phù Sa | Ghe chợ nổi treo cây bẹo, cập cầu tàu | Cầu tàu |
  | Bật Nghiệp | Trụ sở đất sét của đội ở Cần Thơ | Trên bờ |
  | Hộ Chiếu Thương Hiệu | Con tàu chở hàng ở cuối cầu cảng, có thùng hàng | Cầu tàu |
  | Hộ Chiếu Sầu Riêng | Một góc vườn sầu riêng có sọt trái | Trên bờ |
  | Arcade | Nhà sàn nhỏ có đèn lồng | Trên bờ |
  | Hành trình 3 bậc | Cột mốc ba bậc ở đầu cầu tàu | Trên bờ |
  | Máy hát, bảng tin, bảng thành tích | Giữ từ Sảnh cũ, đặt dưới mái nhà sàn | Trên bờ |

- Màn chọn nhân vật: 5 vai đội, hiện bằng ảnh gốc có sẵn (`assets/character/team/…`), nhớ lựa chọn trong
  `localStorage`. Hai đại diện áo dài của Sảnh cũ thôi dùng làm người chơi (không có mô hình 3D).
- Lumina và thầy Tu Phan đứng ở sân bến (mô hình có xương, động tác đứng / nói), giữ lời thoại của Sảnh cũ.
- Tên nhân vật: nhãn chữ HTML bám theo đầu nhân vật (FR-008).
- Đường lui: không có WebGL thì hiện danh sách «Đi tới…» dạng liên kết thường; mô hình lỗi thì `bizon-characters.js`
  tự dùng tranh dựng đứng và trang báo một dòng.
- Nhãn chính sách trên thẻ lấy từ một bảng nhỏ trong `js/ben-bizon.js`, test đối chiếu với trang Chính sách. Game
  nào trang Chính sách chưa nói rõ (Hộ Chiếu Sầu Riêng, Hành trình 3 bậc, Ra Khơi) thì thẻ **không ghi nhãn**.

### Câu chuyện 2 – Chèo xuồng

- Hai bến xuồng (một ở chân cầu tàu, một ở bờ bên vườn) để lúc nào cũng có chỗ lên bờ gần.
- Xuồng: mô hình xuồng chèo có sẵn, tô màu gỗ đất sét; mái chèo là hai thanh dựng bằng mã, tự khua theo tốc độ.
  Nhân vật **đứng** trên xuồng với động tác đứng (kiểu chèo đứng miền Tây); tay chưa cử động theo mái chèo vì mô
  hình không có động tác chèo. Ghi rõ giới hạn này trong mô tả PR.
- Điểm trên nước: khu chợ nổi giữa sông (cùng thẻ «Vào» Bến Phù Sa), phao «Ra Khơi Cùng Lớp 3D» ở cửa sông, và một
  bãi lục bình có bảng kể một điều về chợ nổi (đọc cho vui, không tính điểm).
- «Đi tới…» chọn điểm trên nước thì đặt người chơi lên xuồng ngay cạnh điểm đó; chọn điểm trên bờ khi đang ở xuồng thì
  đưa lên bờ. Tải lại trang luôn bắt đầu trên bờ.
- «Giảm chuyển động»: tắt bập bềnh của xuồng, của lục bình và của máy quay.

### Câu chuyện 3 – Bản đồ nhỏ và người qua lại

- Bản đồ nhỏ vẽ bờ, sông, cầu tàu và biểu tượng địa điểm; người chơi là mũi tên (đi bộ) hoặc hình xuồng (trên nước).
- Người qua lại: bốn vai đội còn lại đi dọc bờ và cầu tàu; một ghe hàng trôi chậm trên sông. Mô hình tải sau người
  chơi; lỗi thì dùng tranh dựng đứng. Tối đa 4 người và 1 ghe để giữ khung hình.

### Câu chuyện 4 – Hộ Chiếu Sầu Riêng 3D

- Giữ nguyên bối cảnh riêng của game (vườn, 8 chặng, cảng) và nhân vật nông dân đội nón lá. Không có xuồng.
- Trang nạp thêm `../js/di-chuyen-3d.js`. Trong mã của trang chỉ sửa ba chỗ: (1) giao máy quay cho phần di chuyển mới
  khi đang đi bộ (chế độ «Toàn cảnh» và sa bàn giữ nguyên), (2) thay lời nhắc «bấm E» bằng thẻ «Vào» gọi đúng hàm mở
  hội thoại / bảng việc hiện có, (3) thêm bản đồ nhỏ và «Đi tới…» từ danh sách trạm và người có việc đang có.
- Không đụng `lab/ho-chieu-sau-rieng-engine.js`, `-data.js`, `-core.js`: luật, điểm, ván lưu không đổi. Bản 2D và bản
  gọn không nạp phần di chuyển mới; chạy lại bộ test của cả ba bản.
- Thẻ «Việc tiếp theo» và nút dẫn đường hiện có giữ nguyên; «Đi tới…» bổ sung chứ không thay.

### Rủi ro và cách xử lý

| Rủi ro | Xử lý |
|---|---|
| Mặt mô hình nhòe (lý do PR #1024) | Máy quay ở sau lưng; nhãn tên bằng chữ; màn chọn nhân vật dùng ảnh gốc. Chị xem bản thử trên điện thoại trước khi «Gộp» PR 1 |
| Xuồng, cây của bộ Kenney là kiểu khối góc cạnh, lệch tông đất sét | Tô lại màu, bo bóng mềm như Ra Khơi đã làm; nếu chị thấy chưa hợp thì thay bằng xuồng dựng bằng mã ở PR 2 |
| Nhân vật đứng yên trên xuồng trông cứng | Xuồng nghiêng nhẹ khi quay mũi, mái chèo khua, gợn nước sau đuôi; ghi rõ giới hạn «chưa có động tác chèo» |
| Điện thoại yếu không đủ 30 khung hình | Giới hạn độ phân giải vẽ, tắt bóng đổ trên máy yếu, mặt nước là một tấm phẳng có vân chuyển động nhẹ (không phản chiếu), người qua lại tối đa 4; có lối tắt «Đi tới…» |
| CI không đo được khung hình thật | Test chỉ kiểm vòng vẽ chạy và trạng thái đúng; SC-005 đo tay trên điện thoại, ghi vào PR |
| Sửa trang đóng gói Sầu Riêng 3D dễ vỡ | Mã mới nằm ở tệp ngoài; trong gói chỉ ba điểm nối; chạy đủ test ba bản |
| Tải mô hình chậm trên 4G | Chỉ tải mô hình người chơi trước (khoảng 1 MB), còn lại tải sau; có dòng «Đang tải nhân vật…» |

Sau khi PR 1 dùng trên lớp, ghi thời gian tới quyết định đầu tiên vào báo cáo chơi thử (lệnh `/playtest-report`) để
theo dõi SC-009.

## Tệp sẽ chạm

| PR | Tệp |
|---|---|
| 1 | `js/di-chuyen-3d.js` (mới), `js/ben-bizon.js` (mới), `hub-3d.html`, `test/ben-bizon-di-bo.test.js` (mới), `test/di-chuyen-3d-ho-so.test.js` (mới), `sw.js` |
| 2 | `js/di-chuyen-3d.js`, `js/ben-bizon.js`, `test/ben-bizon-cheo-xuong.test.js` (mới), `sw.js` |
| 3 | `js/di-chuyen-3d.js`, `js/ben-bizon.js`, `test/ben-bizon-ban-do-nho.test.js` (mới), `sw.js` |
| 4 | `lab/ho-chieu-sau-rieng-3d.html`, `js/di-chuyen-3d.js` (nếu cần tham số thêm), `test/sau-rieng-3d-sau-lung.test.js` (mới), `sw.js` |

Không chạm: ba trang game thuộc hồ sơ và tệp mã của chúng; `bizon-characters.js`; `ra-khoi-3d.html`; engine và dữ liệu
Sầu Riêng; `index.html` / `academia3d-v2.html`; Supabase.
