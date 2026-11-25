# Kế hoạch triển khai: Phòng luyện pitch gọi vốn «Hội đồng đầu tư»

**Nhánh**: `claude/pitch-goi-von` | **Ngày**: 2026-11-25 | **Đặc tả**: [spec.md](spec.md)

## Tóm tắt
Trang tĩnh mới `lab/pitch-goi-von.html`, cùng hệ BizOn Lab (CMR, CVP, FDI Lab).
- **Bản phẳng (PR 1–2):**
  - đồng hồ 7 phút theo 5 vai;
  - Hội đồng 3 người hỏi từ bộ câu hỏi soạn sẵn, rút tất định theo mã lượt;
  - tự chấm 4 × 2,5;
  - kiểm ba con số;
  - lưu trong trình duyệt, in hoặc xuất CSV.
- **Phòng 3D (PR 3):** dựng từ sa bàn văn phòng có sẵn; máy yếu tự về bản phẳng.

## Bối cảnh kỹ thuật
- **Công nghệ:** JavaScript chạy thẳng trên trình duyệt, không build; three.js có sẵn (`js/vendor/three.min.js`) chỉ dùng ở PR 3.
- **Tệp:**
  - `lab/pitch-goi-von.html` (giao diện);
  - `lab/pitch-goi-von-core.js` (đồng hồ, rút câu hỏi, điểm, ba con số; hàm thuần, chạy được trong Node để test);
  - `lab/pitch-goi-von-data.js` (bộ câu hỏi VI/EN, luật theo kịch bản).
- **Đồng hồ:** tính từ `performance.now()` (giờ thật), không đếm khung hình; test dùng đồng hồ giả.
- **Rút câu hỏi:** mulberry32 theo mã lượt; mỗi thành viên hỏi đúng phần PASTOR của mình; không lặp câu.
- **Ba con số:**
  - Kiểm `vốn xin ≥ lỗ lũy kế đến tháng hòa vốn` khi đội nhập chi phí cố định, biên đóng góp và doanh thu tháng.
  - Kiểm `lợi nhuận mục tiêu ≤ (doanh thu − BEP) × biên đóng góp`.
  - Chỉ báo lệch, có công thức.
- **Lưu:** `localStorage` khóa `bizon-pitch-v1`; CSV 1 dòng mỗi lượt.

## Kiểm theo hiến chương
| Nguyên tắc | Cách giữ |
|---|---|
| I. Học là chính | Theo đúng kịch bản «Đại hội Cổ đông» đã kiểm nghiệm; nối CLO-E, CLO-B; câu hỏi không kèm đáp án. |
| II. Nói thật | Lumina và Hội đồng là «cố vấn chạy theo luật»; trang ghi rõ câu hỏi soạn sẵn, không có AI. |
| III. Trang tĩnh | Không máy chủ, không fetch lúc chơi; thêm vào precache `sw.js`; 360 px; vùng chạm 44 px; VI/EN. |
| IV. Có test | Test hàm thuần (đồng hồ, phạt, rút câu, điểm, ba con số) và Playwright (luồng đầy đủ, 360 px, EN). |
| V. Dữ liệu tối thiểu | Không ghi âm, ghi hình; không gửi máy chủ; tên đội tự đặt. |
| Hồ sơ quyền tác giả | Trang mới, không chạm tệp đang thẩm định. `lop-hoc.html` chỉ thêm một liên kết. |

## Theo dõi độ phức tạp
Không có vi phạm hiến chương.
