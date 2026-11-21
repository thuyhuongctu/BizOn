# Kế hoạch thực hiện: Giao diện «3 cửa»

**Nhánh**: `claude/giao-dien-3-cua` | **Ngày**: 2026-11-19 | **Đặc tả**: [spec.md](spec.md)

## Tóm tắt

Có hai PR, làm theo thứ tự:
- **PR 1** (câu chuyện 1): màn đầu trang chủ có ba thẻ «Tôi là sinh viên / Tôi là giảng viên / Tôi muốn xem thử», kèm trang mới `vao-lop.html` có bốn thẻ game và ô mã lớp. Không đổi menu (3C).
- **PR 2** (câu chuyện 2): màn vào Bật Nghiệp 3D chọn đường trước, điền sau. Nút bắt đầu dính đáy. Đọc `?lop=`. Giữ `?giao-dien=goc` cho người thẩm định (câu 4).

Câu chuyện 3 (menu) nằm ngoài phạm vi. Câu chuyện 4 (buổi thử) hoãn; PR 1 chỉ soạn sẵn phiếu thử.

## Bối cảnh kỹ thuật

- Trang tĩnh, không có bước build. `index.html` phải trùng byte `academia3d-v2.html`, nên mọi sửa ở một tệp đều chép sang tệp kia.
- Trang chủ dùng `css/bizon-clay*.css` và menu `js/bizon-clay-nav.js`. Song ngữ bằng `data-en` qua `js/bizon-clay-i18n.js`.
- Phần mở đầu (hero) của trang chủ hiện ở dòng ~170–190 của `index.html`: ô «TIN MỚI», tiêu đề, đoạn giới thiệu 7 dòng, nút «Bắt đầu với Bến Phù Sa →».
- **Đường dẫn game** (giống `GAME_URL` của Màn hình lớp học):
  - Bến Phù Sa: `ben-phu-sa.html`;
  - Bật Nghiệp: `BizOn Game 3D.html`;
  - Hộ Chiếu Thương Hiệu: `brand-passport.html`;
  - Hộ Chiếu Sầu Riêng: `lab/ho-chieu-sau-rieng-v2.html`.
- **Mã lớp**:
  - `?lop=` hiện được `js/live-progress.js` đọc và lưu vào `localStorage` (ba game Bến Phù Sa, Hộ Chiếu Thương Hiệu, Hộ Chiếu Sầu Riêng);
  - Bật Nghiệp 3D chưa đọc `?lop=`; PR 2 thêm phần đọc vào ô mã lớp của màn vào. Đây chỉ là giao diện, không phải logic game;
  - ô mã lớp ở `vao-lop.html` gắn `?lop=MÃ` vào liên kết của cả bốn game.
- **Màn vào 3D**: nằm trong `BizOn Game 3D.html`, khối `#login3d` (CSS dòng 83–124, HTML từ dòng 311). Nút `#l3Go` (Bắt đầu), `#l3Demo` (Đội Demo); Trang Giảng viên và «Giao diện 2D cũ» là liên kết. PR 2 bọc các ô nhập trong một khối hiện/ẩn và thêm hai nút chọn đường. Mọi `id` và trình xử lý sự kiện cũ giữ nguyên. Với `?giao-dien=goc`, trang thêm class `goc` vào `body` và CSS trả về bố cục cũ.

## Kiểm theo hiến chương

| Nguyên tắc | Ảnh hưởng | Cách giữ |
|---|---|---|
| I. Học là chính | Không đổi luật, điểm hay nội dung bài học | Test so kết quả mô phỏng với cùng hạt giống ở PR 2 |
| II. Nói thật | Câu chữ ba thẻ phải đúng việc trang làm | Thẻ Khách ghi Bến Phù Sa miễn phí, khớp trang Chính sách. Thẻ Sinh viên nói rõ «hỏi giảng viên chơi game nào» |
| III. Trang tĩnh (không thương lượng) | Trang chủ, trang mới, màn vào 3D | Ba thẻ và bốn thẻ game là liên kết HTML thường, chạy được khi tắt JS và khi ngoại tuyến (thêm `vao-lop.html` vào `sw.js`). Kiểm 360/390/1280 px, vùng chạm ≥ 44 px, tương phản ≥ 4,5, VI/EN, chế độ tối |
| IV. Có test | Mỗi PR có test viết trước | PR 1: `test/ba-cua-trang-chu.test.js`. PR 2: `test/man-vao-bat-nghiep.test.js`. html-validate 0 lỗi; `index.html` trùng byte `academia3d-v2.html`; `sw.js` lấy số lớn nhất + 1 |
| V. Dữ liệu tối thiểu | Ô mã lớp ở `vao-lop.html` | Chỉ ghép vào liên kết, không gửi đi đâu. Phiếu thử không ghi tên người thử |
| Hồ sơ quyền tác giả | `BizOn Game 3D.html` thuộc hồ sơ | Không đổi tên, xóa hay chuyển hướng. Không sửa logic game. `?giao-dien=goc` hiện đúng màn cũ (câu 4). Test `ip-ma-nguon-afbacd2` phải đạt. `games.html` và `universe.html` không chạm |

## Tệp sẽ chạm

| Tệp | PR | Thay đổi |
|---|---|---|
| `index.html` = `academia3d-v2.html` | 1 | Thêm khối ba thẻ ngay dưới tiêu đề. Đoạn giới thiệu 7 dòng chuyển xuống dưới ba thẻ. Nút «Bắt đầu với Bến Phù Sa» thay bằng thẻ Khách |
| `vao-lop.html` (mới) | 1 | Ô mã lớp (không bắt buộc), bốn thẻ game, lối «Chưa có mã lớp? Chơi thử», `link rel="canonical"`, VI/EN |
| `sitemap.xml` | 1 | Thêm `vao-lop.html` |
| `docs/thu-nghiem/thu-5-phut.md` (mới) | 1 | Phiếu thử ba nhiệm vụ, dùng sau (5C) |
| `BizOn Game 3D.html` | 2 | Hai nút chọn đường; khối ô nhập hiện/ẩn; nút bắt đầu dính đáy ở điện thoại; đọc `?lop=`; `?giao-dien=goc` |
| `sw.js` | 1, 2 | Thêm `vao-lop.html` (PR 1); nâng `CACHE` |
| `test/ba-cua-trang-chu.test.js`, `test/man-vao-bat-nghiep.test.js` (mới) | 1, 2 | Viết trước, thấy hỏng |

Bản 2D (`game.html`) và bản gọn (`bat-nghiep-v2.html`) có màn vào riêng, không nằm trong phạm vi PR 2.

## Rủi ro

- **Test trang chủ đang có** (`homepage-release-gate`, `academia3d-quality`, `trang-chu-*`, `hanh-van-de-hieu`) có thể đếm khối hay kiểm câu chữ cũ. Chạy trước khi đẩy; test nào kiểm điều cố ý đổi thì sửa test cho khớp và ghi lý do.
- **Màn vào 3D** có nhiều test (`bn3d-onboarding`, `bat-nghiep-3d-*`, `dang-nhap-umk*`). Giữ mọi `id` cũ. Chạy lại các test này.
- **Người thẩm định**: `?giao-dien=goc` phải được test so ảnh chụp với màn cũ (chụp ở main trước khi sửa, lưu trong thư mục tạm của test).

## Đối chiếu (theo `/speckit-analyze`, 19/11/2026)

- **Độ phủ**:
  - FR-001 → T001, T003;
  - FR-002 → T002, T004;
  - FR-003 và FR-004 → T001, T003;
  - FR-005 → T003, T007 (khối cũ còn, test trang chủ đạt);
  - FR-006 → T010–T012;
  - FR-007 → T010, T013;
  - FR-009 → T005 (phiếu soạn sẵn);
  - FR-010 → T007, T013.
  - FR-008 ngoài phạm vi (3C).
- **Đã sửa**:
  - hiện trạng ban đầu viết `?lop=` «chạy như trước» ở bản 3D, nhưng mã cho thấy bản 3D chưa đọc `?lop=`;
  - đã ghi lại trong spec, và T012 thêm phần đọc.
- **Còn để ý (mức thấp)**:
  - SC-002 chỉ đo được khi có buổi thử (5C);
  - câu chữ ba thẻ chưa chốt, em đề xuất trong PR 1 kèm ảnh chụp để chị duyệt.
- **Mức CRITICAL**: không có.
