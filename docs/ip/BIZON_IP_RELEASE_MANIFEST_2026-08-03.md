# BizOn IP Release Manifest — 03/08/2026

## 1. Mục đích và giới hạn

Tài liệu này điều phối việc chuẩn bị hồ sơ sở hữu trí tuệ cho BizOn. Tài liệu không tự xác lập quyền, không thay thế ý kiến chuyên môn pháp lý và không được dùng để tuyên bố đã có văn bằng khi cơ quan có thẩm quyền chưa cấp.

Mỗi bộ hồ sơ phải gắn với:

- một commit hoặc nhánh snapshot bất biến;
- gói chứng cứ SHA-256 tạo bởi `scripts/release/build-ip-evidence-manifest.mjs`;
- danh sách tác giả và chủ sở hữu đã ký xác nhận;
- bảng loại trừ thư viện, phông chữ, dịch vụ và nội dung bên thứ ba;
- ảnh chụp giao diện, tệp nguồn và tài liệu mô tả khớp mã băm trong manifest.

## 2. Mốc kỹ thuật đã đóng băng

| Thành phần | Trạng thái ngày 03/08/2026 |
|---|---|
| Release commit | `f38c47e45bd87a13d543d5c8df8a28f8358c26da` |
| Snapshot branch | `release/bizon-academia3d-ip-2026-08-03` |
| Academia 3D V2 | Đã được QA và dùng làm homepage trên `main` |
| Giao diện cũ | Giữ tại `classic-home.html` để rollback |
| Instructor Studio | Đã tích hợp chọn lọc; không nhập staging gate lỗi thời từ PR #296 |
| Supabase staging | Tự tìm project/key, áp migration và chạy smoke suite; production bị chặn |
| Zenodo DOI | Không thay đổi bởi lần phát hành giao diện này |
| Android package/signing | Không thay đổi bởi PR phát hành giao diện |
| Gói chứng cứ ban đầu | 458 tệp theo dõi, SHA-256, tách thành phần bên thứ ba và loại đường dẫn có dấu hiệu secret |

Snapshot branch dùng để bảo toàn cây mã nguồn của bản phát hành. Không tiếp tục phát triển trực tiếp trên nhánh snapshot.

## 3. Nhóm tài sản đề nghị xử lý

### 3.1. Chương trình máy tính

**Tên làm việc:** `BizOn Bật Nghiệp — Hệ thống phần mềm mô phỏng kinh doanh và học tập dựa trên quyết định`.

Phạm vi dự kiến:

- deterministic simulation engine và state/persistence;
- Bật Nghiệp, Brand Passport, AIBIS/IE Lab và Arcade;
- Lumina ở vai trò giải thích và phản tư, không thay engine tính kết quả;
- Decision Trace và dữ liệu học tập có consent;
- Instructor Studio và chức năng xuất dữ liệu;
- Web/PWA/Android TWA integration;
- migration SQL, RLS, RPC và retention.

**Không kê khai là mã tự sáng tạo:** framework/thư viện bên thứ ba, bản dựng Tailwind, font, Supabase, GitHub Actions marketplace actions, Playwright và API/dịch vụ ngoài.

### 3.2. Tác phẩm mỹ thuật ứng dụng và thiết kế giao diện

Có thể lập một hoặc nhiều bộ riêng:

1. Hệ thống nhận diện và logo `BizOn / BizOn Bật Nghiệp`;
2. Design system clay 3D và Academia 3D;
3. Bộ tạo hình Lumina, Hương AI, Tú Phan và dàn nhân vật trò chơi;
4. Bộ bản đồ, hộ chiếu thương hiệu, dấu mộc, huy hiệu và vật phẩm giao diện;
5. Bộ màn hình sản phẩm tiêu biểu desktop/mobile.

Mỗi bộ phải có character sheet hoặc screen sheet, tệp nguồn, ngày tạo, người tạo/chỉnh sửa, lịch sử phiên bản và bảng mô tả đóng góp sáng tạo của con người.

### 3.3. Tác phẩm âm nhạc và bản ghi âm

Lập chain of title riêng cho từng ca khúc:

- tác giả lời;
- tác giả nhạc/giai điệu;
- người biểu diễn hoặc quyền sử dụng giọng tổng hợp;
- chủ sở hữu bản ghi;
- tệp master và SHA-256;
- công cụ/dịch vụ AI đã dùng và điều khoản sử dụng tại thời điểm tạo.

Không gộp “tác phẩm âm nhạc” và “bản ghi âm” thành một đối tượng quyền duy nhất.

### 3.4. Tác phẩm viết và tài liệu giáo dục

Ứng viên gồm:

- luật chơi, kịch bản lớp học và rubric;
- model cards, governance notes và tài liệu kỹ thuật;
- nội dung song ngữ VI–EN;
- lời ca khúc và nội dung giới thiệu sản phẩm;
- bộ tình huống/biến cố kinh doanh có cách diễn đạt nguyên gốc.

### 3.5. Nhãn hiệu

Dấu hiệu ưu tiên tra cứu:

1. `BIZON`;
2. `BIZON BẬT NGHIỆP`;
3. logo kết hợp chữ–hình BizOn;
4. `BRAND PASSPORT`/`HỘ CHIẾU THƯƠNG HIỆU` chỉ sau khi đánh giá khả năng phân biệt và xung đột.

Danh mục hàng hóa/dịch vụ cần được phân nhóm theo Bảng phân loại Nice đang có hiệu lực tại ngày nộp. Các lĩnh vực cần đánh giá gồm phần mềm, SaaS, giáo dục/đào tạo, mô phỏng kinh doanh và truyền thông/giải trí; không tự động nộp mọi nhóm nếu chưa có chiến lược khai thác thực tế.

## 4. Chain of title — điều kiện bắt buộc trước khi nộp

| Câu hỏi | Bằng chứng cần có | Trạng thái |
|---|---|---|
| Ai là tác giả từng phần mã nguồn? | Git history, commit, bảng phân công, cam đoan | Chưa chốt toàn bộ |
| Ai là chủ sở hữu quyền tài sản? | Thỏa thuận đồng tác giả/đồng chủ sở hữu/chuyển giao | Cần ký |
| CTU có quyền hoặc lợi ích nào không? | Hợp đồng lao động, nhiệm vụ được giao, quy chế KHCN–SHTT, văn bản xác nhận | Cần CTU rà soát |
| Tỷ lệ của Đỗ Thùy Hương và Phan Anh Tú? | Biên bản theo từng nhóm tác phẩm | Cần ký |
| Tài sản do cộng tác viên tạo? | Hợp đồng chuyển giao hoặc giấy phép sử dụng | Cần kiểm kê |
| Tài sản AI-assisted có đóng góp sáng tạo của con người? | Prompt log, bản nháp, lựa chọn, chỉnh sửa, character sheet, tuyên bố quy trình | Cần lập hồ sơ |
| Nhạc/giọng có quyền thương mại? | Điều khoản dịch vụ và đồng ý của người có giọng | Cần lưu chứng cứ |
| Thành phần bên thứ ba đã được loại trừ? | SBOM/license inventory và nhóm `third-party-component` | Tự động + rà soát |

Theo dõi quyết định pháp lý tại issue #305. Việc merge mã nguồn không đồng nghĩa với việc chủ sở hữu pháp lý đã được xác định.

## 5. Thứ tự triển khai đề xuất

1. Chốt tác giả, chủ sở hữu và quyền/lợi ích của CTU theo từng nhóm tác phẩm.
2. Đóng băng release commit/branch và tạo gói SHA-256.
3. Nộp chương trình máy tính với bản in/trích mã và bản điện tử khớp manifest.
4. Nộp bộ mỹ thuật ứng dụng sau khi chú thích rõ phần AI-assisted và bên thứ ba.
5. Nộp tác phẩm âm nhạc/bản ghi theo chain of title riêng.
6. Tra cứu và nộp nhãn hiệu BizOn theo chủ thể đã thống nhất.
7. Chỉ cập nhật website bằng đúng trạng thái: `đã nộp đơn`, `đang thẩm định` hoặc `đã được cấp`.

## 6. Căn cứ và biểu mẫu phải kiểm tra tại ngày nộp

### 6.1. Quyền tác giả và quyền liên quan

- Áp dụng Luật Sở hữu trí tuệ hiện hành, bao gồm **Luật số 131/2025/QH15**, có hiệu lực từ ngày 01/04/2026.
- Áp dụng **Nghị định 17/2023/NĐ-CP** cùng các nội dung đã được **Nghị định 134/2026/NĐ-CP** sửa đổi, bổ sung.
- Dùng mẫu văn bản hiện hành theo **Thông tư 08/2026/TT-BVHTTDL ngày 22/04/2026**; không dùng tờ khai cũ chỉ vì hồ sơ trước đã soạn sẵn.
- Người nộp hồ sơ có thể là tác giả, chủ sở hữu quyền tác giả hoặc chủ sở hữu quyền liên quan; vì vậy phải chốt chain of title trước khi ghi chủ thể trong tờ khai.

### 6.2. Nhãn hiệu

- Dùng bộ mẫu sở hữu công nghiệp hiện hành do Cục Sở hữu trí tuệ công bố theo **Thông tư 10/2026/TT-BKHCN**, đã được cập nhật bởi **Thông tư 20/2026/TT-BKHCN** có hiệu lực đối với mẫu tờ khai từ ngày 01/07/2026, cùng các văn bản liên quan hiện hành.
- Trong bộ mẫu cập nhật được Cục Sở hữu trí tuệ công bố, **Tờ khai đăng ký nhãn hiệu là Mẫu số 04, Phụ lục I**. Không lấy số mẫu từ trang hướng dẫn cũ hoặc bản lưu trữ đã hết hiệu lực mà không đối chiếu bộ mẫu mới nhất.
- Danh mục hàng hóa/dịch vụ và phân nhóm Nice phải được kiểm tra lại đúng ngày nộp.
- Phí, lệ phí, phương thức nộp trực tuyến và ưu đãi nếu có phải được xác minh tại thời điểm nộp; không ghi số phí cũ như một giá trị cố định trong hồ sơ nội bộ.

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

Manifest là chứng cứ kỹ thuật về nội dung, mã băm và thời điểm; không tự chứng minh tác giả hoặc chủ sở hữu nếu thiếu hợp đồng, nhiệm vụ giao việc, cam đoan và thỏa thuận đồng tác giả.

## 8. Tiêu chí Go/No-Go cho hồ sơ

**Go khi:**

- mốc release và gói SHA-256 đã đóng băng;
- homepage mới, rollback, Instructor Studio và staging đều đạt QA;
- danh sách tác giả/chủ sở hữu đã được ký;
- CTU đã có ý kiến bằng văn bản;
- tài sản AI-assisted, nhạc, giọng và thành phần bên thứ ba có hồ sơ nguồn gốc;
- tờ khai đúng mẫu hiện hành tại ngày nộp;
- website không tuyên bố đã có văn bằng trước khi được cấp.

**No-Go khi:**

- có tranh chấp hoặc chưa thống nhất tác giả/chủ sở hữu;
- asset không rõ nguồn hoặc không lưu điều khoản AI/stock;
- gói chứng cứ chứa credential, khóa ký hoặc `.env`;
- dùng tờ khai đã hết hiệu lực;
- trộn staging với production;
- tài liệu công khai mô tả sai trạng thái pháp lý.

## 9. Nguồn chính thức phải đối chiếu

- Cục Bản quyền tác giả: Luật SHTT sửa đổi 2025, Nghị định 134/2026 và thông báo áp dụng Thông tư 08/2026.
- Cổng Văn bản Chính phủ: văn bản gốc và tình trạng hiệu lực của Nghị định 17/2023, Nghị định 134/2026 và văn bản liên quan.
- Cục Sở hữu trí tuệ: bộ tờ khai sở hữu công nghiệp cập nhật theo Thông tư 10/2026 và Thông tư 20/2026; thủ tục và phân nhóm nhãn hiệu hiện hành.
