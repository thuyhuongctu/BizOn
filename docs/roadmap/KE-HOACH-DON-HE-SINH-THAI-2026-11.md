# Kế hoạch dọn và củng cố hệ sinh thái bizonland.com (11/2026)

**Lập ngày:** 06/11/2026 · **Căn cứ:** đợt rà toàn kho 06/11/2026 (danh mục sản phẩm, sư phạm, kỹ thuật, UX thật bằng Playwright trên 11 trang ở 1366 px và 390 px).
**Người quyết định:** Đỗ Thùy Hương. Mỗi bước là một PR riêng, chỉ gộp khi chị nói «Gộp».

## 0. Vùng cấm trong thời gian thẩm định sở hữu trí tuệ

Ba hồ sơ quyền tác giả (chương trình máy tính) đã nộp cho **Bật Nghiệp, Bến Phù Sa, Hộ Chiếu Thương Hiệu**, bản 3D, khóa ở commit `afbacd2` (07/10/2026). Hộ Chiếu Sầu Riêng **không** nằm trong hồ sơ. Cơ quan thẩm định có thể đối chiếu bản nộp với trang đang chạy, nên cho tới khi có giấy chứng nhận:

| Không làm | Lý do |
|---|---|
| Đổi tên, xóa, chuyển hướng bất kỳ tệp nào hồ sơ nhắc tới: `BizOn Game 3D.html`, `game.html`, `ben-phu-sa.html`, `ben-phu-sa-v8.html`, `ben-phu-sa-3d.html`, `brand-passport.html`, `Ho Chieu Thuong Hieu 3D.html`, `games.html`, `universe.html`, `global.html`, `classic-home.html`, `gioi-thieu.html`, `doi-ngu.html`, `am-nhac.html`, `bohososhtt.html` | Địa chỉ công bố ghi trong Tờ khai |
| Sửa logic trong `js/engine.js`, `js/backend.js`, `js/app.js`, `js/aibis/*`, khối script của `brand-passport.html` và `ben-phu-sa*.html` | Bản trích mã nguồn nộp kèm lấy nguyên văn từ các tệp này |
| Xóa hay ghi đè ảnh nhân vật, logo, minh họa, nhạc, video (`assets/character`, `logo`, `assets/illustrations`, `assets/audio`, `assets/video`) | Tác phẩm mỹ thuật ứng dụng và âm nhạc trong hồ sơ; bản cũ là bằng chứng quá trình sáng tạo |
| Gộp hai thư mục three.js (`js/vendor/three*` và `vendor/three/*`) | `ben-phu-sa-3d.html` và `-v8.html` đang nạp `vendor/three/`, đổi đường dẫn là sửa tệp đã nộp |
| Giảm dung lượng `BizOn Game 3D.html` (10,4 MB, 116 request) bằng cách tách tài nguyên | Là tệp giao diện chính của tác phẩm đã nộp |
| Chuyển video, nhạc ra CDN | Địa chỉ tệp đang ghi trong hồ sơ bằng chứng (`ip-evidence-manifest`) |

Những việc trên gom vào **Giai đoạn 3 (sau khi có giấy chứng nhận)**. Các bước dưới đây chỉ chạm vào điều hướng, sitemap, CI, tài liệu, trang không thuộc hồ sơ và hạ tầng dùng chung (thanh điều hướng, cơ chế ngôn ngữ), là phần hồ sơ đã ghi rõ **không kê khai** (`docs/ip/bat-nghiep/README.md`: «đã loại sw.js và hạ tầng dùng chung site-ui, site-nav»).

## 1. Thứ tự các PR

| # | PR | Nội dung | Chạm vào | Ước lượng |
|---|---|---|---|---|
| 1 | Kế hoạch | Tài liệu này | `docs/roadmap/` | 1 ngày |
| 2 | Dọn điều hướng | Một bản mặc định cho mỗi game trên trang chủ; bản v2/v8/Mini/.dc vào mục «Bản khác» của trang chọn bản; lối vào «sinh viên» và thẻ game dẫn cùng một bản; sitemap thêm 52 trang công khai còn thiếu và bỏ các bản trùng; trang trùng (`academia3d-v2` giữ vì là quy ước kho; `lab/ie-lab` ↔ `global` chỉ ghi chú, không chuyển hướng) | `index.html` = `academia3d-v2.html`, `sitemap.xml`, `ho-chieu-*.html` (trang chọn bản), `js/site-nav.js` bỏ `hub-3d`, `classic-home` khỏi menu (tệp vẫn giữ) | 2 ngày |
| 3 | Điện thoại | Thanh điều hướng chung cao ≥ 44 px; thanh nav phụ có dấu hiệu cuộn (mờ hai mép); thanh «Xem bằng tiếng Việt?» không đè nút; `game.html` thêm `h1` ẩn thị giác; `lang` của trang khớp với ngôn ngữ đang hiện | `js/site-nav.js`, `js/bizon-lang.js`, `css/`, `game.html` (chỉ thêm một thẻ `h1`, không đụng script) | 2 ngày |
| 4 | CI gọn | Gộp 29 workflow chạy lại `node test/X.test.js` mà `tests.yml` đã chạy: giữ `tests.yml`, `homepage-release-gate`, `academia3d-quality`, `existing-assets-inventory`, `ip-evidence-manifest`, `supabase-*`, `android-*`; các workflow còn lại chuyển sang `workflow_dispatch` hoặc xóa, ghi lại trong `docs/BRANCH-POLICY.md`. Bộ test trên CI xong trong 10–13 phút nên giữ `timeout-minutes: 25`. Đưa 4 tệp SQL lạc ngoài `supabase/migrations` vào đúng chỗ **chỉ khi chị xác nhận đã áp trên production** | `.github/workflows/`, `supabase/` | 1 ngày |
| 5 | Tài liệu sư phạm khớp nhau | Sửa bốn chỗ lệch: bộ đo trước–sau 30 hay 15 câu; thang 45/35/20 hay B1–B6 trong tệp Excel; `adEff` có xuất CSV không; rubric bỏ dòng «bản nháp v0.1». Đổi cơ cấu điểm cho khớp tuyên bố «chấm lập luận» (đề xuất 50 lập luận / 30 kết quả / 20 phản tư, chị chốt). Lumina: lời khuyên bỏ con số cụ thể, chỉ nêu hướng và câu hỏi; **phần này chạm `js/engine.js` nên hoãn sang Giai đoạn 3**, PR này chỉ sửa tài liệu và kịch bản lời thoại | `docs/chuan-dau-ra-va-rubric.md`, `docs/cham-diem-*.md`, `bang-chung.html`, `thiet-ke-nghien-cuu.html`, `docs/loi-thoai-lumina*.md` | 3 ngày, cần chị chốt thang điểm |
| 6 | Chuẩn đầu ra cho Bến Phù Sa và Hộ Chiếu Sầu Riêng | Ma trận chuẩn đầu ra (CLO) gắn vai, cơ chế game, bậc Bloom như §2–§3 hiện có; rubric theo vòng đếm được; bản EN | `docs/chuan-dau-ra-va-rubric.md` §6–§7 mới, `docs/huong-dan-ho-chieu-sau-rieng.md` | 3 ngày |
| 7 | Phân tích 130 phiếu đợt 10/2026 | Script `scripts/research/phan-tich-truoc-sau.mjs` đọc gói ZIP ẩn danh (`surveys.csv` theo `docs/research/TU-DIEN-BIEN.md`): ghép trước–sau theo `student_code`, Wilcoxon và d Cohen, bảng theo lớp; kết quả vào `bang-chung.html` và `thiet-ke-nghien-cuu.html` đúng trạng thái. **Cần chị xuất gói dữ liệu từ Trang Giảng Viên** | `scripts/research/`, `bang-chung.html`, `thiet-ke-nghien-cuu.html` | 2 ngày sau khi có dữ liệu |
| 8 | Trang giảng viên song ngữ | `Trang Giang Vien.dc.html` và `man-hinh-lop-hoc.html` thêm `data-en`; vào sitemap | 2 tệp đó | 2 ngày |

## 2. Giai đoạn 3, sau khi có giấy chứng nhận

1. Chốt một bản chơi cho mỗi game, các bản còn lại chuyển hướng 301 (v2, v8, Mini, `global.html` → `lab/ie-lab.html`, `universe.html` → `index.html`).
2. Gộp logic inline của 4 bản Bến Phù Sa và 3 bản Hộ Chiếu Thương Hiệu vào module dùng chung.
3. `BizOn Game 3D.html`: tải tài nguyên 3D theo nhu cầu, nén GLB và texture, thanh tiến độ tải.
4. Three.js về một thư mục, một định dạng (module); bỏ `three.min.js`.
5. `bp3d-explainer.html` 21 MB và `lab/ho-chieu-sau-rieng-3d.html` 1,4 MB: tách tài nguyên base64 ra tệp.
6. Video, nhạc sang CDN hoặc YouTube; kho chỉ giữ bản mới nhất, bản cũ lưu Drive.
7. Lumina: bỏ con số cụ thể trong lời khuyên (`luminaAdvice` trong `js/engine.js`).
8. Đổi tên cũ của thầy («Thầy T.») thành «Thầy Tu Phan» trong 7 tệp hồ sơ còn giữ nguyên (07/11/2026): `doi-ngu.html`, `ben-phu-sa.html`, `ben-phu-sa-3d.html`, `Ho Chieu Thuong Hieu 3D.html`, ba tệp `docs/ip/ben-phu-sa/`.

## 3. Việc chị cần làm (không phụ thuộc PR)

- Bấm «Delete branch» trên GitHub sau mỗi lần gộp.
- PR 5: ~~chốt cơ cấu điểm~~ đã chốt 50/30/20 ngày 07/11/2026; số câu bộ đo trước–sau đã sửa thành 15 + 8.
- PR 7: ~~xuất gói dữ liệu~~ đã nhận hai gói KTM330HM01/02 ngày 07/11/2026; kết quả ở `docs/research/KET-QUA-TRUOC-SAU-2026-10.md` (PR 7b).
- PR 4: ~~xác nhận 4 tệp SQL~~ đã kiểm trên production 07/11/2026: cả bốn đã áp (bảng, hàm, cột, ràng buộc đều có), chuyển vào `supabase/da-ap-tay/`.

## 4. Theo dõi

| PR | Nhánh | Trạng thái |
|---|---|---|
| 1 | #1026 | đã gộp 07/11/2026 |
| 2 | #1027 | đã gộp 07/11/2026 |
| 3 | #1028 | đã gộp 07/11/2026 |
| 4 | #1029 | đã gộp 07/11/2026 |
| 5 | #1030 | đã gộp 07/11/2026; cơ cấu điểm chốt 50/30/20 ở PR sau |
| 6 | #1031 | đã gộp 07/11/2026 |
| 7 | #1033 | đã gộp 07/11/2026; chờ gói ZIP đợt 10/2026 |
| 8 | #1034 | đã gộp 07/11/2026 |
| 5b | #1035 | đã gộp 07/11/2026: cơ cấu điểm 50/30/20, bốn tệp SQL đã áp chuyển vào `supabase/da-ap-tay/` |
| 7b | #1038 | kết quả 125 phiếu (49 cặp) hai lớp đợt 10/2026 vào Bằng chứng, Thiết kế nghiên cứu; bộ 15 câu bị trần, cần làm khó hơn |
| 7c | #1039 | bộ câu hỏi kiến thức bản 2 (`batnghiep2`): 10 câu neo + 5 câu vận dụng; `docs/research/BO-CAU-HOI-KIEN-THUC-V2.md`; chờ thử trên một lớp |
| 7d | `huong-dan-thu-bo-2` | hướng dẫn giảng viên thử bộ 2 trên một lớp: `docs/research/HUONG-DAN-THU-BO-2-TREN-LOP.md` |
