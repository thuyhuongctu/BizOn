# Kế hoạch triển khai: Tình huống khởi nghiệp «Kiểm định ý tưởng» và «Ra thị trường»

**Nhánh**: `claude/tinh-huong-khoi-nghiep` | **Ngày**: 2026-11-25 | **Đặc tả**: [spec.md](spec.md)

## Tóm tắt
Trang tĩnh mới `lab/khoi-nghiep-tinh-huong.html` chạy hai bộ tình huống ra quyết định, mỗi bộ khoảng 4 tình huống.
- Sinh viên chọn phương án, ghi một câu lý do, rồi xem hệ quả, «Vì sao?» và câu hỏi phản biện. Phản hồi theo luật soạn sẵn, không chấm điểm, không AI.
- Cuối bộ có bảng tổng kết; kết quả lưu trên máy, in được, xuất CSV.
- Thư viện tình huống thêm một thẻ trỏ sang trang này.
- Câu chuyện 3 thêm ghi chú giảng viên và chỗ gộp nhiều tệp CSV của lớp.

## Bối cảnh kỹ thuật
- **Công nghệ:** JavaScript chạy thẳng trên trình duyệt, không build.
- **Tệp mới:**
  - `lab/khoi-nghiep-tinh-huong.html`: giao diện;
  - `lab/khoi-nghiep-tinh-huong-data.js`: tình huống, phương án, nguồn APA, phiên bản `kn-v1`;
  - `lab/khoi-nghiep-tinh-huong-core.js`: tiến độ, kiểm lý do, tổng kết, CSV, gộp CSV của lớp (hàm thuần, test được trong Node).
- **Tệp sửa:**
  - `js/cham-library.js`: thêm một mục vào `CASES` (kind `sim`, bậc 1, ngành Khởi nghiệp và Marketing, vùng ĐBSCL, `href` trỏ sang trang mới, ghi «Tình huống giả định»);
  - `sw.js`, `sitemap.xml`.
- **Không chạm:** `js/case-task-data.js` (bộ đo `ct-v1`) và luồng 4 bước của CHAM.
- **Lưu:** `localStorage` khóa `bizon-khoi-nghiep-v1`: tiến độ từng bộ, lựa chọn, lý do. Có nút làm lại.

## Nội dung và cơ sở lý thuyết
| Bộ | Tình huống | Khung chính (trích trong «Vì sao?») |
|---|---|---|
| Kiểm định ý tưởng | Vấn đề có thật không | Problem–solution fit; kiểm giả thuyết trước khi đầu tư (Camuffo et al., 2020, *Management Science*) |
| | Hỏi khách đúng cách | Hỏi về hành vi đã xảy ra, không hỏi ý định mua (customer development; phỏng vấn khách hàng) |
| | Thử rẻ trước | Thử nghiệm nhỏ, tổn thất chấp nhận được (Sarasvathy, 2001); MVP |
| | Đổi hướng hay đi tiếp | Đọc tín hiệu so với ngưỡng đặt trước; tránh thiên kiến xác nhận |
| Ra thị trường | Phân khúc đầu tiên | Chọn một nhóm khách hẹp, dễ với tới (beachhead) |
| | Chọn kênh | Chi phí có khách so với biên đóng góp; nối với CMR Lab |
| | Định giá ra mắt | Biên đóng góp, giá dưới biến phí; nối với CVP Lab |
| | Thị trường nước ngoài đầu tiên | Khoảng cách tâm lý, cam kết theo bước (Johanson & Vahlne, 2009); nối sang Go Global và Hộ Chiếu Sầu Riêng |

- Nguồn sách không có DOI (sách Lean Startup, Crossing the Chasm…) ghi đúng APA và chỉ cảnh báo, không lỗi.
- Mọi DOI kiểm bằng `node scripts/research/kiem-trich-dan.mjs --crossref` trong PR có nội dung. Danh mục nguồn nằm ở `docs/research/` hoặc trong tệp dữ liệu, xuất được ra Markdown để kiểm.
- **Bề mặt câu chuyện khác hẳn `ct-v1`.** `ct-v1` dùng cá tra sang Nhật, xoài sấy Hàn Quốc, nhà phân phối ở thị trường X và một số câu chuyện khác. Test so tiêu đề và từ khóa để chặn trùng.

## Kiểm theo hiến chương
| Nguyên tắc | Cách giữ |
|---|---|
| I. Học là chính | Mỗi phương án có hệ quả và «Vì sao?» nối khung lý thuyết; câu hỏi phản biện thay cho điểm số. Nối CLO-A, CLO-D, CLO-E. |
| II. Nói thật | Ghi rõ «tình huống giả định», số liệu minh họa; không dùng AI; Lumina (nếu có) là cố vấn chạy theo luật, không chọn thay sinh viên. |
| III. Trang tĩnh | Không máy chủ, không fetch lúc chơi; precache trong `sw.js`; 360 px; vùng chạm 44 px; VI/EN. |
| IV. Có test | Test hàm thuần và Playwright cho mỗi PR, viết trước, chạy thấy hỏng. |
| V. Dữ liệu tối thiểu | Lưu trên máy; CSV chỉ gồm bộ, lựa chọn, lý do, thời điểm; không tên thật bắt buộc. |
| Hồ sơ quyền tác giả | Không đổi tệp đang thẩm định. Thư viện chỉ thêm một mục dữ liệu. |

## Rủi ro nghiên cứu
Lớp đang trong đợt đo trước – sau có thể dùng bộ «Ra thị trường» giữa hai lần đo. Khi đó bộ này là **một phần can thiệp**, cùng nhóm cơ chế với tình huống `ct-v1` về quốc tế hóa. Hướng dẫn giảng viên (PR 3) ghi rõ: nếu dùng trong đợt đo thì ghi vào nhật ký lớp, để khi phân tích còn tách được.

## Theo dõi độ phức tạp
Không có vi phạm hiến chương.
