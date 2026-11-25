# Kế hoạch triển khai: Rủi ro khí hậu (ND-GAIN) khi chọn thị trường trong Go Global

**Nhánh**: `claude/go-global-nd-gain` | **Ngày**: 2026-11-25 | **Đặc tả**: [spec.md](spec.md)

## Tóm tắt

- Thêm hồ sơ khí hậu cho 7 thị trường Go Global, lấy theo nước trung tâm: điểm ND-GAIN 2026, điểm dễ tổn thương, điểm sẵn sàng, thứ hạng, năm số liệu.
- **P1:** hiện trên thẻ thị trường, kèm đoạn giải thích và trích dẫn. Không đổi điểm.
- **P2:** khi link có `?khihau=1`, thêm một khoản «chi phí rủi ro khí hậu» mỗi quý. Khoản này tăng theo mức dễ tổn thương của thị trường và mức cam kết tài sản của phương thức, giảm theo điểm ESG. Biến cố thiên tai sẵn có cũng mạnh lên theo mức dễ tổn thương.
- **P3:** câu hỏi thảo luận và hai cột CSV.
- Không dùng cơ sở dữ liệu, không thêm thư viện; dữ liệu là tệp JS tĩnh.

## Bối cảnh kỹ thuật

- **Ngôn ngữ:** JavaScript chạy thẳng trên trình duyệt (ES2019), HTML tĩnh. Không có bước build (hiến chương III).
- **Phụ thuộc:** không thêm. Trang dùng CSS Tailwind đã biên dịch sẵn, nên **chỉ dùng lớp CSS đã có** trong `global.html`; kiểu mới (nếu cần) viết trong khối `<style>` của trang.
- **Lưu trữ:** tệp tĩnh `js/go-global-khi-hau.js`; nhật ký vẫn ở `localStorage` (`bizon-global-log`) như hiện tại.
- **Kiểm thử:** `node scripts/run-tests.mjs` (Playwright cho phần trình duyệt), `html-validate@8.24.1`.
- **Nền tảng:** GitHub Pages, PWA ngoại tuyến (`sw.js` đang precache `./global.html`; tệp JS mới phải vào danh sách precache).
- **Ràng buộc:** 360–390 px không tràn ngang; vùng chạm ≥ 44 px; song ngữ.
- **Quy mô:** 7 thị trường, 7 phương thức, 4 quý mỗi ván.

## Nghiên cứu (giai đoạn 0)

| Quyết định | Chọn | Lý do | Phương án đã bỏ |
|---|---|---|---|
| Nguồn số liệu | ND-GAIN Country Index, bản 2026; chị tải tay tệp `ndgain_countryindex_2026.zip` | Nguồn công khai, miễn phí, cập nhật hằng năm; Oh et al. (2026) cũng dùng ND-GAIN | Tự tải bằng script: trang chặn (HTTP 403), không vượt chặn |
| Lưu số liệu trong kho | Hai tệp: bảng trích CSV 7 nước (`docs/research/du-lieu/nd-gain-2026-nuoc-trung-tam.csv`, có cột năm) và tệp JS dùng trong game | CSV để đối chiếu và test tự động; JS để chạy ngoại tuyến không cần fetch | Chép cả bộ dữ liệu (quá lớn, không cần) |
| Năm số liệu | Năm mới nhất có số trong tệp 2026 cho cả 7 nước. Nước nào thiếu năm đó thì dùng năm gần nhất có số và ghi riêng năm ấy | Theo đặc tả, trường hợp biên «thiếu số liệu» | Nội suy tay |
| Thang hiển thị | ND-GAIN 0–100 (một chữ số thập phân); dễ tổn thương và sẵn sàng 0–1 (hai chữ số); thứ hạng trên tổng số nước của bản 2026 | Đúng thang của nguồn, không đổi thang | Quy về sao hay màu đơn thuần (mất thông tin) |
| Mức cam kết tài sản của phương thức | `a = cost0 / 180`, dùng vốn ban đầu đang có trong `MODES`: FDI 1,00; liên doanh 0,44; liên minh 0,31; xuất khẩu 0,17; nhượng quyền 0,14; nền tảng số 0,11; cấp phép 0,08 | Vốn ban đầu là đại lượng sẵn có gần nhất với tài sản đặt ở nước sở tại; không phải tự đặt thêm số | Dùng `control` (kiểm soát): nền tảng số có kiểm soát 0,6 nhưng gần như không có tài sản cố định |
| Mức dễ tổn thương tương đối | `s = (v − v_min) / (v_max − v_min)` trên 7 nước trung tâm, thuộc [0, 1] | Giữ nguyên thứ tự của nguồn, nên tương quan hạng = 1 (SC-003) | Dùng thẳng `v` (chênh lệch giữa 7 nước nhỏ, tác động gần như không thấy) |
| Giảm nhờ ESG | `m = 1 − 0,4 × min(1, max(0, (esg − 35) / 65))`, nên ESG 35 → 1,00 và ESG 100 → 0,60 | ESG trong game nằm trong [35, 100]; trần giảm 40 % để ESG không xóa hẳn rủi ro (FR-006) | Không có trần |
| Chi phí rủi ro khí hậu mỗi quý (khi bật) | `C = 12 × s × a × m` (nghìn USD); FDI ở thị trường dễ tổn thương nhất, ESG thấp nhất: 12 mỗi quý, tức khoảng 27 % chi phí cố định quý của FDI (45) | Cỡ đủ thấy nhưng không lấn các lựa chọn khác. **Minh họa**, ghi rõ trên trang | Gắn vào mọi phương thức như nhau (mất bài học về cam kết) |
| Biến cố thiên tai khi bật | Chi phí thêm mỗi sản phẩm `1,2 × (0,5 + s) × (0,5 + 0,5a) × m`; cầu `1 − 0,08 × (0,5 + s)` | Không bật thì giữ 1,2 và 0,92. Khi bật, tác động tăng theo `s`, theo `a`, giảm theo ESG | Đổi lịch biến cố (phá tính tất định và so sánh giữa các đội) |
| Cách bật | `?khihau=1` trên URL, đọc một lần khi tải trang | Làm rõ 3; không cần cơ sở dữ liệu | — |
| Kiểm cân bằng khi bật | Với 2 bộ quyết định chuẩn, không phương thức nào thắng ở cả 7 thị trường; FDI vẫn là lựa chọn tốt nhất ở ít nhất một thị trường ít tổn thương | Theo skill `balance-check`: tránh tạo chiến lược áp đảo | — |

Mọi hệ số ở trên nằm trong một đối tượng `KHI_HAU_HE_SO` trong tệp JS, có chú thích «minh họa» (FR-007).

## Kiểm theo hiến chương

| Nguyên tắc | Ảnh hưởng | Cách giữ |
|---|---|---|
| I. Học là chính | Thêm tiêu chí chọn địa điểm cho CLO-D; P2 đổi luật | P2 chỉ chạy với `?khihau=1`. Không bật thì kết quả trùng khít (test FR-003); nhật ký ghi `climate_mode` để tách dữ liệu. Câu hỏi thảo luận không chứa đáp án. |
| II. Nói thật | Số liệu thật, hệ số minh họa, suy rộng từ MNE lớn sang doanh nghiệp nhỏ | Thẻ ghi nguồn và năm. Đoạn giải thích nói rõ hai điều: số là của nước trung tâm (Singapore không đại diện cả Đông Nam Á), và hệ số là minh họa. Lumina gọi là cố vấn chạy theo luật. |
| III. Trang tĩnh (không thương lượng) | Thêm một tệp JS tĩnh | Không fetch lúc chơi; tệp vào precache của `sw.js`; kiểm 360 px bằng Playwright. |
| IV. Có test | — | Test viết trước, thấy hỏng; `html-validate` 0 lỗi; nâng `CACHE`. |
| V. Dữ liệu tối thiểu | Không thêm dữ liệu người học; hai cột CSV mới là thuộc tính thị trường và chế độ chơi | Không gửi máy chủ; CSV vẫn tải về máy như hiện tại. |
| Ràng buộc hồ sơ quyền tác giả | `global.html` trong danh sách «không đổi tên, xóa, chuyển hướng» | Chỉ sửa khối script và phần thẻ thị trường (chị chọn ở làm rõ 1). Không đụng `IP_MARKETS`/`ipPerf` (test `ie-lab.test.js` so từng byte). Ghi vào PR rằng bản nháp hồ sơ Go Global sẽ có thêm ngày thay đổi. |
| Bên thứ ba | Dữ liệu ND-GAIN | Ghi trích dẫn theo cách ND-GAIN đề xuất; thêm một mục vào `THIRD-PARTY-NOTICES.md` (dữ liệu, không phải mã). Kiểm điều khoản dùng trên trang ND-GAIN trước PR 1. |

## Cấu trúc

### Tài liệu

```text
specs/009-khi-hau-go-global/
├── spec.md
├── plan.md          # tệp này (gồm phần nghiên cứu và mô hình dữ liệu)
├── tasks.md
└── checklists/requirements.md
```

### Tệp sẽ chạm

```text
js/go-global-khi-hau.js                              # mới: dữ liệu 7 nước, ánh xạ thị trường, hệ số, hàm tính thuần
docs/research/du-lieu/nd-gain-2026-nuoc-trung-tam.csv # mới: bảng trích từ tệp ND-GAIN 2026 (chị gửi)
global.html                                          # thẻ thị trường, đoạn giải thích, gCalc (nhánh khí hậu), câu hỏi, CSV
sw.js                                                # nâng CACHE, thêm tệp JS mới vào precache
THIRD-PARTY-NOTICES.md                               # ghi nguồn dữ liệu ND-GAIN
test/go-global-khi-hau.test.js                       # mới
```

Không chạm: `lab/ie-lab.*` (lõi khác), `js/app.js`, `js/engine.js` và các tệp trong danh sách cấm sửa logic.

### Mô hình dữ liệu

```js
// js/go-global-khi-hau.js (dạng dự kiến; số thật điền ở PR 1 từ tệp ND-GAIN 2026)
const KHI_HAU = {
  nguon: { vi: '…', en: '…', trich: 'Notre Dame Global Adaptation Initiative Country Index (ND-GAIN). (2026). University of Notre Dame.', tongSoNuoc: 0 },
  nuoc: { SGP: { vi: 'Singapore', en: 'Singapore', nam: 0, gain: 0, vul: 0, ready: 0, hang: 0 }, /* JPN, DEU, USA, ARE, KOR, KEN */ },
  thiTruong: { sea: 'SGP', eas: 'JPN', eu: 'DEU', na: 'USA', me: 'ARE', kr: 'KOR', af: 'KEN' },
  heSo: { chiPhiQuy: 12, capitalRef: 180, esgMin: 35, esgRange: 65, esgTran: 0.4, thienTaiCogs: 1.2, thienTaiCau: 0.08 },  // minh họa
};
// Hàm thuần: kh.s(marketId), kh.a(mode), kh.m(esg), kh.chiPhiQuy(marketId, mode, esg), kh.thienTai(marketId, mode, esg)
```

## Theo dõi độ phức tạp

Không có vi phạm hiến chương cần biện minh.
