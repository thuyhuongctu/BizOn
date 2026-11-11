# Kế hoạch: Bến BizOn – bảng nhiệm vụ và điều khiển trên điện thoại

**Đặc tả**: [spec.md](spec.md) · **Làm rõ**: chị trả lời 11/11/2026 («1a, 2a, 3a, 4a») · **Trạng thái**: chờ chị duyệt, chưa viết mã

**Phạm vi**: chỉ Bến BizOn (`hub-3d.html`). Ba câu chuyện, ba PR: P1 nhiệm vụ «Làm quen», P2 nút chạy/đi và góc nhìn
cho tay phải, P3 câu hỏi nhanh ở sáu điểm game.

**Nguyên tắc**: học **cơ chế** của game tham khảo (bảng nhiệm vụ có danh sách tích ô, «việc tiếp theo», nút điều khiển
cho tay phải), không chép giao diện, tên, hình. Giao diện dùng đúng màu, chữ và kiểu nút đang có của Bến BizOn.

## Bối cảnh kỹ thuật

- **Trang tĩnh, không build.** Bến BizOn đang chạy bằng `js/ben-bizon.js` (mô-đun ES, three.js mô-đun) và phần di chuyển
  dùng chung `js/di-chuyen-3d.js` (`window.BizOnDiChuyen.create(...)` → `{ update, goTo, dat, state, setPlaces,
  lamMoiChu, dung, mayQuay, tocDo, dispose }`).
- **Đã có sẵn để dùng lại**:
  - 11 điểm trong mảng `NOI` của `js/ben-bizon.js` (mã điểm: `hanh-trinh`, `ben-phu-sa`, `hc-thuong-hieu`,
    `bat-nghiep`, `hc-sau-rieng`, `arcade`, `lumina`, `thay-tu`, `may-hat`, `bang-tin`, `thanh-tich`);
  - lối tắt `dc.goTo(id)` (chính là «Đi tới…»): dùng cho «Dẫn đường»;
  - `moThoai(t, ai)` mở hội thoại (Lumina, thầy Tu Phan, Bảng tin), `vaoNoi(p)` xử lý nút «Vào», `veThanhTich()`
    vẽ Bảng thành tích;
  - `daGhe()` đọc danh sách game đã ghé trong `localStorage` (khóa `KHOA_GHE`), dùng để tính sẵn việc đã làm;
  - nút «Góc nhìn» `#bb-goc` (đang ở trái trên) và hàm `datGoc(g)`, nhớ lựa chọn trong `localStorage`;
  - nhịp đi trong `js/di-chuyen-3d.js`: đẩy cần ≥ 0,75 là chạy, nhẹ hơn là đi; Shift trên máy tính để đi chậm.
- **Chồng lấn hiện có cần xử lý**: dòng nhắc `#bb-hint` (giữa, top 70 px) và dòng báo `#bb-note` (giữa, top 108 px) sẽ
  đụng bảng nhiệm vụ ở góc trái trên trên khổ 360–412 px.
- **Test**: Playwright với WebGL phần mềm (như `test/ben-bizon-*.test.js`), đọc trạng thái qua `window.__benBizon.state()`.
  Thêm vào `state()` một mục `nhiemVu` (đang theo, đã xong, việc tiếp theo, mở/gọn) và `nhip` (tự động/luôn chạy) để
  test đọc mà không so ảnh.

## Kiểm theo hiến chương

- **I. Học là chính**: Bến BizOn là phần định hướng. Nhiệm vụ «Làm quen» dẫn sinh viên qua lộ trình ba bậc trước khi
  chọn game. Câu hỏi nhanh chỉ hỏi «game dạy gì, bậc mấy», không chấm điểm, sai thì chỉ gợi chỗ đọc lại, không lộ đáp
  án (FR-011). Lumina và thầy Tu Phan giữ nguyên lời thoại: gợi hướng, không chọn giúp. ✔
- **II. Nói thật**: chữ trên bảng khớp đúng việc đo được trong mã (mỗi việc gắn một hành động cụ thể, FR-002, FR-003);
  câu hỏi nhanh dùng đúng mô tả và nhãn «miễn phí»/«dùng thử» đang có trên thẻ. ✔
- **III. Trang tĩnh (không thương lượng)**: không build, không máy chủ; 360–412 px không tràn ngang, vùng chạm
  ≥ 44 px, tương phản ≥ 4,5, song ngữ VI/EN; bảng thu gọn được; cảnh 3D hỏng thì bảng không hiện (trường hợp biên). ✔
- **IV. Có test**: mỗi PR có test viết trước và thấy hỏng; `html-validate@8.24.1` 0 lỗi cho `hub-3d.html`; nâng `CACHE`. ✔
- **V. Dữ liệu tối thiểu**: tiến độ chỉ lưu trên máy (chị chọn 3a); không gửi đi đâu, không migration. ✔
- **Hồ sơ quyền tác giả**: không chạm ba game và các tệp mã của chúng; `test/di-chuyen-3d-ho-so.test.js` vẫn canh việc
  này. Sửa `js/di-chuyen-3d.js` (không thuộc hồ sơ) theo cách chung, không mang bối cảnh (FR-020 của đặc tả 002). ✔
- **Nhân vật, tài sản gốc**: không thêm nhân vật, không thêm ảnh; biểu tượng dùng chữ và emoji như các nút hiện có. ✔
- **Bên thứ ba**: game tham khảo chỉ là nguồn ý tưởng cơ chế, không chép mã hay hình nên không ghi vào
  `THIRD-PARTY-NOTICES.md`; ghi một dòng nguồn cảm hứng trong chú thích đầu tệp mới. ✔

## Thiết kế

### Câu chuyện 1 – Nhiệm vụ «Làm quen» (`js/ben-bizon-nhiem-vu.js` mới)

Một mô-đun ES nhỏ, **không biết gì về three.js**: nhận dữ liệu nhiệm vụ, sự kiện từ `js/ben-bizon.js`, vẽ bảng vào một
khung có sẵn trong `hub-3d.html`.

```text
taoNhiemVu({ host, L, goTo, daGhe, luu }) → { bao(suKien), state(), lamMoiChu(), dispose() }
suKien = { loai: 'thoai' | 'gan' | 'xem' | 'vao' | 'cau-hoi', noi: '<mã điểm>' }
```

Dữ liệu (trong cùng tệp, song ngữ):

| Mã việc | Nhãn (VI) | Điểm | Được tích khi |
|---|---|---|---|
| `hoi-lumina` | Hỏi đường Lumina | `lumina` | mở hội thoại với Lumina (`thoai`) |
| `doc-bang-tin` | Đọc Bảng tin | `bang-tin` | mở Bảng tin (`thoai`) |
| `ghe-hanh-trinh` | Ghé Hành trình 3 bậc | `hanh-trinh` | thẻ «Hành trình 3 bậc» hiện (`gan`), hoặc đã ghé trang này từ trước (`daGhe`) |
| `hoi-thay-tu` | Hỏi thầy Tu Phan game dựng trên mô hình nào | `thay-tu` | mở hội thoại với thầy Tu Phan (`thoai`) |
| `xem-thanh-tich` | Xem Bảng thành tích | `thanh-tich` | mở Bảng thành tích (`xem`) |

Xong cả năm việc: lời chúc ngắn và nút «Tới Bến Phù Sa» (gọi `goTo('ben-phu-sa')`); bảng thu thành một dòng «Đã xong ·
Làm quen Bến BizOn».

- **Lưu**: `localStorage` khóa `bizon-ben-nhiem-vu` = `{ xong: [mã việc], gon: bool }`, đọc/ghi trong `try/catch`
  (bị chặn thì vẫn chạy trong lượt chơi).
- **Bố cục**: khung `#bb-nv` ở cột trái trên, ngay dưới nút «Thoát» (vị trí cũ của nút «Góc nhìn» sau khi nút này chuyển
  xuống ở câu chuyện 2; ở PR 1 nút «Góc nhìn» vẫn ở chỗ cũ nên khung xếp dưới nó). Bề rộng tối đa `min(300px,
  100% - 150px)` để không đụng nút «Đi tới…» bên phải. `#bb-hint` được bỏ khi có bảng (bảng đã nói việc tiếp theo);
  `#bb-note` xếp ngay dưới bảng trong cùng cột. Màn thấp (< 420 px) thì tự thu gọn.
- **Hộp thoại đang mở hoặc danh sách «Đi tới…» đang mở**: bảng nằm dưới lớp đó (z-index thấp hơn), không bấm nhầm.
- **Trợ năng**: khung là `<section aria-label>`; tiến độ đọc được; nút «Dẫn đường», «Thu gọn» là `<button type="button">`
  ≥ 44 px; khi một việc được tích thì báo qua vùng `aria-live="polite"`.

Móc vào `js/ben-bizon.js`: gọi `nv.bao(...)` trong `moThoai` (Lumina, thầy Tu Phan, Bảng tin), trong `vaoNoi` (Bảng thành
tích, nút «Vào»), và khi thẻ của điểm `hanh-trinh` hiện (đọc `dc.state().near` trong vòng vẽ). Thêm `nhiemVu` vào
`window.__benBizon.state()`.

### Câu chuyện 2 – Nút chạy/đi và góc nhìn cho tay phải

- `js/di-chuyen-3d.js` thêm một hàm chung `nhip(m)`: `'tu-dong'` (như nay) hoặc `'chay'` (cần gạt đẩy bất kỳ mức nào
  quá ngưỡng chết đều chạy). Bàn phím giữ nguyên. Thêm `nhip` vào `state()`. Không mang bối cảnh nào.
- `hub-3d.html`: hai nút tròn ≥ 48 × 48 px ở góc phải dưới (trên vùng an toàn): `#bb-chay` (🏃/🚶, `aria-pressed`) và
  `#bb-goc` chuyển từ trái trên xuống đây (giữ nguyên `id`, `aria-pressed` và hàm `datGoc`, chỉ đổi chỗ và hình). Nhịp
  nhớ trong `localStorage` khóa `bizon-ben-nhip`.
- Thẻ «Vào» của phần dùng chung đang nằm ở đáy giữa: kiểm không chồng với hai nút mới ở 360 px; nếu chồng thì nâng
  thẻ lên trên hàng nút (sửa CSS của Bến BizOn, không sửa thẻ chung).
- Máy tính (≥ 900 px, chuột): hai nút vẫn hiện (nhỏ gọn) để dùng bằng chuột và Tab.

### Câu chuyện 3 – Câu hỏi nhanh (`js/ben-bizon-cau-hoi.js` mới)

- Dữ liệu 6 câu (một câu cho mỗi điểm game), song ngữ: câu hỏi, 3 lựa chọn, chỉ số đúng, gợi ý khi sai (chỉ về dòng mô
  tả trên thẻ). **Em soạn, chị duyệt câu chữ trong PR 3 trước khi gộp** (chị chọn 2a).
- `js/di-chuyen-3d.js` thêm tùy chọn chung `nutPhu(place) → { nhan, fn } | null` để thẻ có thêm một nút bên cạnh «Vào».
  Bến BizOn dùng nó cho «Câu hỏi nhanh».
- Câu hỏi mở trong hộp thoại có sẵn `#bb-dlg` (3 nút lựa chọn ≥ 44 px). Đúng thì `nv.bao({ loai: 'cau-hoi', noi })`.
- Nhiệm vụ thứ hai «Một vòng quanh bến» (6 việc, mỗi điểm game một việc) mở sau khi «Làm quen» xong.

## Tệp sẽ chạm

| Tệp | PR | Ghi chú |
|---|---|---|
| `js/ben-bizon-nhiem-vu.js` (mới) | 1, 3 | dữ liệu và bảng nhiệm vụ |
| `js/ben-bizon.js` | 1, 2, 3 | móc sự kiện, `state()`, nút chạy/đi |
| `hub-3d.html` | 1, 2 | khung `#bb-nv`, CSS bố cục, hai nút góc phải dưới |
| `js/di-chuyen-3d.js` | 2, 3 | `nhip()`, `nutPhu` (chung, không bối cảnh) |
| `js/ben-bizon-cau-hoi.js` (mới) | 3 | 6 câu hỏi, chị duyệt |
| `sw.js` | 1, 2, 3 | nâng `CACHE`, lưu sẵn tệp mới |
| `test/ben-bizon-nhiem-vu.test.js` (mới) | 1 | |
| `test/ben-bizon-dieu-khien.test.js` (mới) | 2 | |
| `test/ben-bizon-cau-hoi.test.js` (mới) | 3 | |
| `test/ben-bizon-canh.test.js` | 1, 2 | cập nhật chỗ đo `#bb-hint`, `#bb-goc` khi chúng đổi chỗ |

**Không chạm**: Hộ Chiếu Sầu Riêng (2D, v2, 3D), ba game thuộc hồ sơ quyền tác giả, `bizon-characters.js`, trang chủ.

## Rủi ro

- **Màn hình điện thoại chật** (390 × 664): bảng, hai hàng nút và thẻ «Vào» cùng lúc. Giảm rủi ro: bảng thu gọn được,
  tự thu gọn khi màn thấp, test đo chồng lấn ở 360, 390, 412 px dọc và ngang.
- **Sự kiện bị đếm sai** (ví dụ thẻ «Hành trình» hiện thoáng qua khi đi ngang): chấp nhận được với việc «Ghé», vì đúng
  là đã tới nơi; ghi rõ trong nhãn.
- **Đổi chỗ nút «Góc nhìn»**: test cũ đo vị trí nút này; cập nhật test ở cùng PR.
