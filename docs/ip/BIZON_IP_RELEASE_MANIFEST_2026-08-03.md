# BizOn IP Release Manifest — 03/08/2026

## 1. Mục đích và phạm vi

Tài liệu này là nguồn điều phối hồ sơ sở hữu trí tuệ cho bản BizOn phát hành từ nhánh `release/academia3d-homepage-ip-v1`. Tài liệu không tự xác lập quyền, không thay thế tư vấn pháp lý và không được dùng để tuyên bố đã có văn bằng khi chưa nhận quyết định của cơ quan có thẩm quyền.

Mỗi bộ hồ sơ phải gắn với:

- một commit Git bất biến;
- một gói chứng cứ tạo bởi `scripts/release/build-ip-evidence-manifest.mjs`;
- danh sách tác giả/chủ sở hữu đã ký xác nhận;
- bảng loại trừ thư viện, phông chữ, dịch vụ và nội dung bên thứ ba;
- ảnh chụp giao diện và tệp nguồn khớp mã băm SHA-256 trong gói chứng cứ.

## 2. Ảnh chụp kỹ thuật của bản phát hành

| Thành phần | Trạng thái |
|---|---|
| Academia 3D V2 | Đã gộp bản preview vào `main`; nhánh phát hành dùng làm homepage mới |
| Giao diện cũ | Được lưu thành `classic-home.html` để rollback |
| Instructor Studio | Chỉ tích hợp sáu tệp UI/QA cần thiết; không nhập staging gate cũ từ PR #296 |
| Supabase staging | Đã có pipeline tự tìm đúng project/key, áp migration và chạy smoke suite |
| Production Supabase | Không thuộc phạm vi nhánh phát hành; tiếp tục bị chặn bởi safety contract |
| Zenodo DOI | Giữ nguyên; thay giao diện không tự thay DOI hoặc nội dung bản ghi Zenodo |
| Android package/signing | Không thay đổi trong nhánh này |

Commit cuối cùng để nộp hồ sơ sẽ được ghi sau khi PR phát hành được merge và CI đạt. Không dùng SHA tạm của nhánh làm “bản cuối cùng” trong tờ khai.

## 3. Nhóm tài sản đề nghị xử lý

### 3.1. Chương trình máy tính

**Tên làm việc:** `BizOn Bật Nghiệp — Hệ thống phần mềm mô phỏng kinh doanh và học tập dựa trên quyết định`.

Phạm vi dự kiến:

- deterministic simulation engine và state/persistence;
- Bật Nghiệp, Brand Passport, AIBIS/IE Lab và Arcade;
- Lumina ở vai trò giải thích/phản tư, không thay engine tính kết quả;
- lớp Decision Trace và dữ liệu học tập có consent;
- Instructor Studio và các chức năng xuất dữ liệu;
- Web/PWA/Android TWA integration;
- migration SQL, RLS, RPC và cơ chế retention.

**Không kê khai là mã tự sáng tạo:** thư viện/framework bên thứ ba, bản dựng Tailwind, font, Supabase, GitHub Actions marketplace actions, Playwright và các API/dịch vụ ngoài.

### 3.2. Tác phẩm mỹ thuật ứng dụng và thiết kế giao diện

Có thể lập một hoặc nhiều bộ:

1. Hệ thống nhận diện và logo `BizOn / BizOn Bật Nghiệp`;
2. Design system clay 3D và Academia 3D;
3. Bộ tạo hình Lumina, Hương AI, Tú Phan và dàn nhân vật trò chơi;
4. Bộ bản đồ, hộ chiếu thương hiệu, dấu mộc, huy hiệu và vật phẩm giao diện;
5. Bộ màn hình sản phẩm tiêu biểu desktop/mobile.

Mỗi bộ phải có character sheet/screen sheet, tệp nguồn, ngày tạo, người tạo/chỉnh sửa và bảng xác nhận mức đóng góp sáng tạo của con người.

### 3.3. Tác phẩm âm nhạc và bản ghi âm

Lập danh mục riêng cho từng ca khúc, gồm:

- tên tác phẩm;
- tác giả phần lời;
- tác giả phần nhạc/giai điệu;
- người biểu diễn hoặc giọng tổng hợp được phép sử dụng;
- chủ sở hữu bản ghi;
- tệp master và mã băm;
- công cụ/dịch vụ AI đã dùng và điều khoản sử dụng tại thời điểm tạo.

Không gộp “tác phẩm âm nhạc” và “bản ghi âm” thành một khái niệm quyền duy nhất trong bảng chain of title.

### 3.4. Tác phẩm viết và tài liệu giáo dục

Các ứng viên gồm:

- luật chơi, kịch bản lớp học và rubric;
- model cards, governance notes và tài liệu kỹ thuật;
- nội dung song ngữ VI–EN;
- lời ca khúc và nội dung giới thiệu sản phẩm;
- bộ tình huống/biến cố kinh doanh có cách diễn đạt nguyên gốc.

### 3.5. Nhãn hiệu

Dấu hiệu ưu tiên tra cứu và nộp:

1. `BIZON`;
2. `BIZON BẬT NGHIỆP`;
3. logo kết hợp chữ–hình BizOn;
4. cân nhắc `BRAND PASSPORT`/`HỘ CHIẾU THƯƠNG HIỆU` sau khi tra cứu khả năng phân biệt và xung đột.

Danh mục hàng hóa/dịch vụ dự kiến phải được chuyên gia phân nhóm Nice rà soát. Các nhóm thường cần đánh giá cho mô hình này gồm phần mềm, dịch vụ giáo dục/đào tạo, nền tảng SaaS và sản phẩm truyền thông/giải trí; không tự động nộp tất cả nhóm nếu chưa xác định hoạt động thương mại thực tế.

## 4. Chain of title — các quyết định bắt buộc trước khi nộp

| Câu hỏi | Bằng chứng cần có | Trạng thái |
|---|---|---|
| Ai là tác giả từng phần mã nguồn? | Git history, commit, bảng phân công, cam đoan | Chưa chốt toàn bộ |
| Ai là chủ sở hữu quyền tài sản? | Thỏa thuận đồng tác giả/đồng chủ sở hữu | Cần ký |
| CTU có quyền hoặc lợi ích nào không? | Hợp đồng lao động, nhiệm vụ được giao, quy chế KHCN/SHTT, văn bản xác nhận | Cần CTU rà soát |
| Tỷ lệ của Đỗ Thùy Hương và Phan Anh Tú? | Biên bản thống nhất theo từng nhóm tác phẩm | Cần ký |
| Tài sản do cộng tác viên tạo? | Hợp đồng chuyển giao/quyền sử dụng | Cần kiểm kê |
| Tài sản AI-assisted có đủ đóng góp sáng tạo của con người? | Prompt log, bản nháp, lựa chọn, chỉnh sửa, character sheet, tuyên bố quy trình | Cần lập hồ sơ |
| Nhạc/giọng có quyền thương mại? | Điều khoản dịch vụ và đồng ý của người có giọng | Cần lưu bản chụp |
| Thành phần bên thứ ba đã tách khỏi yêu cầu quyền? | SBOM/license inventory và manifest `third-party-component` | Tự động + rà soát |

## 5. Thứ tự nộp đề xuất

1. **Chốt quyền sở hữu và đồng tác giả với CTU** trước khi ghi tên chủ sở hữu trong đơn.
2. **Đóng băng một release commit**, tạo tag và gói SHA-256.
3. **Nộp chương trình máy tính** với bản in/trích mã và bản điện tử khớp manifest.
4. **Nộp bộ mỹ thuật ứng dụng** sau khi loại bỏ hoặc chú thích rõ phần AI-assisted/bên thứ ba.
5. **Nộp tác phẩm âm nhạc/bản ghi** theo chain of title riêng.
6. **Tra cứu và nộp nhãn hiệu BizOn** theo chủ thể đã thống nhất.
7. Sau khi có số đơn/giấy chứng nhận, chỉ cập nhật website bằng câu chữ chính xác: “đã nộp đơn”, “đang thẩm định” hoặc “đã được cấp”.

## 6. Mẫu và quy định cần dùng tại thời điểm 03/08/2026

- Đăng ký quyền tác giả: dùng mẫu đang được Cục Bản quyền tác giả áp dụng theo **Thông tư 08/2026/TT-BVHTTDL ngày 22/04/2026**, không tiếp tục dùng bản tờ khai cũ chỉ vì đã có sẵn trong hồ sơ trước.
- Khung chi tiết quyền tác giả: **Nghị định 17/2023/NĐ-CP**.
- Đăng ký nhãn hiệu: trang thủ tục của Cục Sở hữu trí tuệ hiện dẫn **Mẫu số 08**, Phụ lục I Nghị định 65/2023/NĐ-CP và mẫu cập nhật theo **Thông tư 10/2026/TT-BKHCN**.
- Phí/lệ phí và ưu đãi nộp trực tuyến/VNeID phải được kiểm tra lại đúng ngày nộp; không ghi số phí cũ như một con số cố định trong hồ sơ nội bộ.

## 7. Gói chứng cứ tự động

Chạy:

```bash
node scripts/release/build-ip-evidence-manifest.mjs
```

Kết quả:

```text
artifacts/ip-evidence/
├── bizon-ip-evidence-manifest.json
├── bizon-ip-evidence-manifest.csv
└── README.md
```

Manifest chỉ là chứng cứ kỹ thuật về nội dung và thời điểm. Quyền tác giả/chủ sở hữu vẫn phải được chứng minh bằng hồ sơ con người, hợp đồng, nhiệm vụ giao việc và thỏa thuận đồng tác giả.

## 8. Tiêu chí Go/No-Go cho merge phát hành

**Go khi:**

- homepage mới và `classic-home.html` đều mở được;
- mọi gateway chính không trả 404;
- mobile, reduced motion, light/dark và VI/EN đạt QA;
- Instructor Studio contract test đạt;
- Supabase staging status là success;
- IP evidence workflow tạo artifact không chứa secret;
- trang công khai không tuyên bố đã có văn bằng khi chưa được cấp.

**No-Go khi:**

- có xung đột tác giả/chủ sở hữu chưa được ghi nhận;
- asset không rõ nguồn hoặc điều khoản AI/stock chưa được lưu;
- staging/production bị trộn project ref hoặc key;
- homepage làm mất đường truy cập sản phẩm chính;
- manifest phát hiện tệp khóa ký, credential hoặc `.env`.

## 9. Nguồn chính thức cần đối chiếu

- Cục Bản quyền tác giả: thông báo áp dụng Thông tư 08/2026/TT-BVHTTDL.
- Cổng văn bản Chính phủ: Nghị định 17/2023/NĐ-CP.
- Cục Sở hữu trí tuệ: thủ tục đăng ký nhãn hiệu và biểu mẫu hiện hành.
- Cục Sở hữu trí tuệ: các thay đổi áp dụng từ năm 2026 và thông báo phí/lệ phí hiện hành.
