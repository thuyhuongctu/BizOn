# Hiến chương BizOn

<!-- Spec Kit đọc tệp này trước khi đặc tả, lập kế hoạch và chia việc. Rút từ CLAUDE.md của kho và các quyết định
     của chủ kho; CLAUDE.md vẫn là bản đầy đủ và thắng khi hai bên khác nhau. Sửa bằng lệnh /speckit-constitution. -->

## Nguyên tắc cốt lõi

### I. Học là chính, game phục vụ chuẩn đầu ra
Mỗi tính năng phải nói rõ sinh viên tự rút ra được điều gì và nối với chuẩn đầu ra nào
(`docs/chuan-dau-ra-va-rubric.md`). Cơ chế phải dạy đúng điều tài liệu hứa, không thưởng cho đoán mò.
Nhân vật và cố vấn (Lumina, thầy Tu Phan) gợi hướng và đặt câu hỏi, **không chọn giúp, không đưa đáp án**.
Đổi luật giữa học kỳ phải ghi lại vì làm hỏng so sánh dữ liệu giữa các lớp.

### II. Nói thật về công cụ và về luật chơi
Đối thủ trong game là «đối thủ ảo chạy theo luật»; Lumina là «cố vấn học tập, chạy theo luật», không gọi là AI.
Câu chữ trên trang phải khớp đúng mã đang chạy (luật xếp hạng, số vòng, mục tiêu). Chính sách miễn phí theo
trang Chính sách: Arcade và Bến Phù Sa miễn phí; Bật Nghiệp và Hộ Chiếu Thương Hiệu dùng thử một học kỳ,
dùng tiếp cần giấy phép. Không công khai chữ ký thật; chứng nhận chỉ in chữ ký in.

### III. Trang tĩnh, chạy được ở lớp học thật (KHÔNG THƯƠNG LƯỢNG)
Không có bước build cho trang web; trang chạy thẳng trên GitHub Pages, dùng được ngoại tuyến (PWA) và trên điện
thoại 360–390 px: không tràn ngang, vùng chạm ≥ 44 px (cho phép lớp chạm vô hình khi chỗ chật), tương phản
chữ ≥ 4,5. Song ngữ VI/EN bằng `data-en`; có trạng thái đang tải, trống, lỗi, mất mạng.

### IV. Có test thì mới xong
Mỗi tính năng hay lỗi đã sửa có test trong `test/*.test.js` (Playwright cho phần trình duyệt) và phải thấy test
**hỏng trước khi sửa**. Trước khi đẩy: `html-validate@8.24.1` 0 lỗi trên tệp đã đổi; `index.html` trùng byte với
`academia3d-v2.html`; nâng `CACHE` trong `sw.js` thêm 1; migration có test SQL chạy trên Postgres cục bộ.

### V. Dữ liệu người học tối thiểu và có kiểm soát
Không bắt buộc danh tính; chỉ gửi dữ liệu khi có mã lớp, như trang Chính sách mô tả. Bảng mới bật RLS, khách chỉ
gọi RPC được cấp. **Không thay đổi cơ sở dữ liệu thật khi chưa hỏi chủ kho**: migration nằm trong
`supabase/migrations/`, chủ kho tự áp bằng workflow «Supabase – áp migration lên production».

## Ràng buộc thêm

- **Hồ sơ quyền tác giả đang thẩm định:** không đổi tên, xóa, chuyển hướng hay sửa logic các tệp ghi trong
  `docs/roadmap/KE-HOACH-DON-HE-SINH-THAI-2026-11.md` (Giai đoạn 3) cho tới khi có giấy chứng nhận.
- **Tài sản gốc:** không ghi đè ảnh, video, nhạc gốc; bản sửa lưu tệp mới có hậu tố `-v2`, `-v3`…
- **Nhân vật:** lấy từ ảnh game có sẵn, không tự dựng nhân vật mới.
- **Tệp sinh tự động** (`css/bizon-clay-chrome.css`, `van-phong-*.html`, `sitemap.xml` theo quy ước) sửa ở nguồn rồi sinh lại.
- **Bên thứ ba:** mã hay hướng dẫn phỏng theo kho khác ghi nguồn và giấy phép trong `THIRD-PARTY-NOTICES.md`.

## Quy trình làm việc

- Mỗi việc một nhánh `claude/<tên-việc>`, một **PR nháp**, tiêu đề và mô tả bằng tiếng Việt; thư mục `specs/NNN-tên/`
  của Spec Kit đi cùng PR ấy.
- Trả lời chủ kho bằng tiếng Việt, xưng «em», gọi «chị»; nói rõ việc đã làm và việc còn chờ chị.
- **Chỉ gộp khi chị nói «Gộp»**, CI xanh, không xung đột; squash-merge kèm dòng
  `Co-authored-by: Phan Anh Tú <patu@ctu.edu.vn>`. Tác giả commit chỉ là thuyhuongctu; không ghi tên hay mã mô hình AI.
- Quyết định thuộc về chủ kho (câu chữ chính sách, chức danh, chọn bản chính…) thì hỏi, không tự chọn.

## Quản trị

Hiến chương đứng trên các mẫu của Spec Kit; `CLAUDE.md` của kho là bản đầy đủ và thắng khi hai bên khác nhau.
Mọi kế hoạch (`/speckit-plan`) phải có mục «Kiểm theo hiến chương» liệt kê nguyên tắc nào bị ảnh hưởng.
Sửa hiến chương bằng `/speckit-constitution`, nâng phiên bản và ghi ngày.

**Phiên bản**: 1.0.0 | **Thông qua**: 2026-11-07 | **Sửa lần cuối**: 2026-11-07
