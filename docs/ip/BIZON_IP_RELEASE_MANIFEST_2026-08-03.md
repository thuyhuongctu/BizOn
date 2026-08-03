# BizOn IP Release Manifest — 03/08/2026

## 1. Mục đích và giới hạn

Tài liệu này điều phối việc chuẩn bị hồ sơ sở hữu trí tuệ cho BizOn. Tài liệu không tự xác lập quyền, không thay thế ý kiến pháp lý chuyên môn và không được dùng để tuyên bố đã có văn bằng khi cơ quan có thẩm quyền chưa cấp.

Mỗi bộ hồ sơ phải gắn với:

- một commit hoặc nhánh snapshot bất biến;
- gói chứng cứ SHA-256 tạo bởi `scripts/release/build-ip-evidence-manifest.mjs`;
- danh sách tác giả, chủ sở hữu và người nộp hồ sơ đã ký xác nhận;
- bảng loại trừ thư viện, phông chữ, dịch vụ và nội dung bên thứ ba;
- ảnh chụp giao diện, tệp nguồn và tài liệu mô tả khớp mã băm trong manifest.

## 2. Mốc kỹ thuật đã đóng băng

| Thành phần | Trạng thái ngày 03/08/2026 |
|---|---|
| Release commit | `f38c47e45bd87a13d543d5c8df8a28f8358c26da` |
| Snapshot branch | `release/bizon-academia3d-ip-2026-08-03` |
| Academia 3D V2 | Đã QA và dùng làm homepage trên `main` |
| Giao diện cũ | Giữ tại `classic-home.html` để rollback |
| Instructor Studio | Đã tích hợp chọn lọc; không nhập staging gate lỗi thời từ PR #296 |
| Supabase staging | Tự tìm project/key, áp migration và chạy smoke suite; production bị chặn |
| Zenodo DOI | Không thay đổi bởi lần phát hành giao diện này |
| Android package/signing | Không thay đổi bởi PR phát hành giao diện |
| Gói chứng cứ ban đầu | 458 tệp theo dõi, SHA-256, tách thành phần bên thứ ba và loại đường dẫn có dấu hiệu secret |

Snapshot branch chỉ dùng để bảo toàn cây mã nguồn của bản phát hành và không được tiếp tục phát triển trực tiếp.

## 3. Chủ thể quyền và người nộp hồ sơ

### 3.1. Quyết định đã xác nhận

- **Đồng chủ sở hữu quyền tài sản:** Đỗ Thùy Hương và Phan Anh Tú.
- **Người trực tiếp nộp hồ sơ/đại diện thực hiện thủ tục:** Phan Anh Tú.
- **Tác giả chương trình máy tính:** dự kiến Đỗ Thùy Hương, chờ hoàn tất kiểm tra Git history và loại trừ mã bên thứ ba/cộng tác viên.
- **Đóng góp học thuật–chuyên môn:** Phan Anh Tú đối với phần trực tiếp sáng tạo; bổ sung Đỗ Thùy Hương theo từng tài liệu hoặc mô-đun do Hương trực tiếp biên soạn.
- **CTU không phải chủ thể của dự án:** không đầu tư tài sản, không giao nhiệm vụ, không tài trợ, không sở hữu hoặc nhận chuyển giao quyền đối với BizOn theo xác nhận của chủ dự án.
- **Tỷ lệ đồng sở hữu:** chưa xác định; không mặc nhiên ghi 50/50 nếu chưa có thỏa thuận ký.

### 3.2. Nguyên tắc ghi hồ sơ

- Việc Phan Anh Tú nộp hồ sơ không làm thay đổi đồng sở hữu và không làm người nộp trở thành chủ sở hữu duy nhất.
- Đối với quyền tác giả, hồ sơ phải tách rõ `tác giả`, `chủ sở hữu` và `người nộp hồ sơ/đại diện`.
- Đối với nhãn hiệu, nếu muốn quyền nhãn hiệu thuộc cả hai người thì phải ghi **Đỗ Thùy Hương và Phan Anh Tú là đồng chủ đơn**; Phan Anh Tú là người trực tiếp thực hiện thủ tục hoặc đầu mối liên hệ.
- Không ghi riêng Phan Anh Tú ở mục chủ đơn nhãn hiệu chỉ vì thầy là người đi nộp, trừ khi hai bên chủ động quyết định nhãn hiệu chỉ thuộc Phan Anh Tú.
- Khi cơ quan tiếp nhận hoặc biểu mẫu yêu cầu, Đỗ Thùy Hương ký văn bản đồng ý hoặc ủy quyền cho Phan Anh Tú thực hiện thủ tục.

## 4. Nhóm tài sản đề nghị xử lý

### 4.1. Chương trình máy tính

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

### 4.2. Tác phẩm mỹ thuật ứng dụng và thiết kế giao diện

Có thể lập một hoặc nhiều bộ riêng:

1. Hệ thống nhận diện và logo `BizOn / BizOn Bật Nghiệp`;
2. Design system clay 3D và Academia 3D;
3. Bộ tạo hình Lumina, Hương AI, Tú Phan và dàn nhân vật trò chơi;
4. Bộ bản đồ, hộ chiếu thương hiệu, dấu mộc, huy hiệu và vật phẩm giao diện;
5. Bộ màn hình sản phẩm tiêu biểu desktop/mobile.

Mỗi bộ phải có character sheet hoặc screen sheet, tệp nguồn, ngày tạo, người tạo/chỉnh sửa, lịch sử phiên bản và bảng mô tả đóng góp sáng tạo của con người.

### 4.3. Tác phẩm âm nhạc và bản ghi âm

Lập chain of title riêng cho từng ca khúc:

- tác giả lời;
- tác giả nhạc/giai điệu;
- người biểu diễn hoặc quyền sử dụng giọng tổng hợp;
- chủ sở hữu bản ghi;
- tệp master và SHA-256;
- công cụ/dịch vụ AI đã dùng và điều khoản sử dụng tại thời điểm tạo.

Không gộp “tác phẩm âm nhạc” và “bản ghi âm” thành một đối tượng quyền duy nhất.

### 4.4. Tác phẩm viết và tài liệu giáo dục

Ứng viên gồm:

- luật chơi, kịch bản lớp học và rubric;
- model cards, governance notes và tài liệu kỹ thuật;
- nội dung song ngữ VI–EN;
- lời ca khúc và nội dung giới thiệu sản phẩm;
- bộ tình huống/biến cố kinh doanh có cách diễn đạt nguyên gốc.

### 4.5. Nhãn hiệu

Dấu hiệu ưu tiên tra cứu:

1. `BIZON`;
2. `BIZON BẬT NGHIỆP`;
3. logo kết hợp chữ–hình BizOn;
4. `BRAND PASSPORT`/`HỘ CHIẾU THƯƠNG HIỆU` sau khi đánh giá khả năng phân biệt và xung đột.

Danh mục hàng hóa/dịch vụ phải được phân nhóm theo Bảng phân loại Nice đang có hiệu lực tại ngày nộp. Các lĩnh vực cần đánh giá gồm phần mềm, SaaS, giáo dục/đào tạo, mô phỏng kinh doanh và truyền thông/giải trí.

## 5. Chain of title — điều kiện bắt buộc trước khi nộp

| Câu hỏi | Bằng chứng cần có | Trạng thái |
|---|---|---|
| Ai là tác giả từng phần mã nguồn? | Git history, commit map, bảng phân công, cam đoan | Chưa chốt toàn bộ |
| Ai là chủ sở hữu quyền tài sản? | Thỏa thuận đồng sở hữu giữa Đỗ Thùy Hương và Phan Anh Tú | Cần ký |
| Ai trực tiếp nộp hồ sơ? | Quyết định và văn bản đồng ý/ủy quyền khi cần | **Phan Anh Tú — đã xác nhận** |
| CTU có quyền hoặc lợi ích nào không? | Xác nhận nội bộ của chủ dự án; rà lại nếu xuất hiện tài liệu mới | **Không — đã xác nhận** |
| Tỷ lệ của Đỗ Thùy Hương và Phan Anh Tú? | Biên bản/thỏa thuận | Cần ký |
| Tài sản do cộng tác viên tạo? | Hợp đồng chuyển giao hoặc giấy phép sử dụng | Cần kiểm kê |
| Tài sản AI-assisted có đóng góp sáng tạo của con người? | Prompt log, bản nháp, lựa chọn, chỉnh sửa, character sheet | Cần lập hồ sơ |
| Nhạc/giọng có quyền thương mại? | Điều khoản dịch vụ và đồng ý của người có giọng | Cần lưu chứng cứ |
| Thành phần bên thứ ba đã được loại trừ? | SBOM/license inventory và nhóm `third-party-component` | Tự động + rà soát |

Theo dõi quyết định pháp lý tại issue #305 và `docs/ip/BIZON_CHAIN_OF_TITLE_DRAFT_2026-08-03.md`.

## 6. Thứ tự triển khai đề xuất

1. Ký thỏa thuận đồng sở hữu giữa Đỗ Thùy Hương và Phan Anh Tú.
2. Ghi rõ Phan Anh Tú là người trực tiếp nộp hồ sơ/đại diện thủ tục.
3. Ký văn bản đồng ý hoặc ủy quyền của Đỗ Thùy Hương khi biểu mẫu hoặc cơ quan tiếp nhận yêu cầu.
4. Hoàn tất kiểm tra tác giả mã nguồn và bảng loại trừ mã bên thứ ba.
5. Đóng băng release commit/branch và tạo gói SHA-256.
6. Nộp chương trình máy tính với bản in/trích mã và bản điện tử khớp manifest.
7. Nộp bộ mỹ thuật ứng dụng sau khi chú thích rõ phần AI-assisted và bên thứ ba.
8. Nộp tác phẩm âm nhạc/bản ghi theo chain of title riêng.
9. Tra cứu và nộp nhãn hiệu BizOn với đúng chủ đơn đã thống nhất.
10. Chỉ cập nhật website bằng đúng trạng thái: `đã nộp đơn`, `đang thẩm định` hoặc `đã được cấp`.

## 7. Căn cứ và biểu mẫu phải kiểm tra tại ngày nộp

### 7.1. Quyền tác giả và quyền liên quan

- Áp dụng Luật Sở hữu trí tuệ hiện hành, bao gồm **Luật số 131/2025/QH15**, có hiệu lực từ ngày 01/04/2026.
- Áp dụng **Nghị định 17/2023/NĐ-CP** cùng các nội dung đã được **Nghị định 134/2026/NĐ-CP** sửa đổi, bổ sung.
- Dùng mẫu văn bản hiện hành theo **Thông tư 08/2026/TT-BVHTTDL ngày 22/04/2026**.
- Người nộp hồ sơ có thể là tác giả hoặc chủ sở hữu quyền tác giả; nếu nộp thay mặt các đồng chủ sở hữu thì chuẩn bị văn bản đồng ý hoặc ủy quyền phù hợp.

### 7.2. Nhãn hiệu

- Dùng bộ mẫu sở hữu công nghiệp hiện hành do Cục Sở hữu trí tuệ công bố theo các văn bản đang có hiệu lực tại ngày nộp.
- Danh mục hàng hóa/dịch vụ và phân nhóm Nice phải được kiểm tra lại đúng ngày nộp.
- Nếu hai người muốn đồng sở hữu nhãn hiệu, tờ khai phải ghi cả **Đỗ Thùy Hương và Phan Anh Tú** là đồng chủ đơn; Phan Anh Tú có thể là người trực tiếp thực hiện thủ tục.
- Phí, lệ phí, phương thức nộp trực tuyến và điều kiện chữ ký số phải được xác minh tại thời điểm nộp.

## 8. Gói chứng cứ tự động

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

Manifest là chứng cứ kỹ thuật về nội dung, mã băm và thời điểm; không tự chứng minh tác giả hoặc chủ sở hữu nếu thiếu cam đoan và thỏa thuận đồng sở hữu.

## 9. Tiêu chí Go/No-Go cho hồ sơ

**Go khi:**

- mốc release và gói SHA-256 đã đóng băng;
- homepage mới, rollback, Instructor Studio và staging đều đạt QA;
- danh sách tác giả/chủ sở hữu đã được ký;
- thỏa thuận ghi rõ Phan Anh Tú là người nộp hồ sơ/đại diện thủ tục;
- tài sản AI-assisted, nhạc, giọng và thành phần bên thứ ba có hồ sơ nguồn gốc;
- tờ khai đúng mẫu hiện hành tại ngày nộp;
- website không tuyên bố đã có văn bằng trước khi được cấp.

**No-Go khi:**

- có tranh chấp hoặc chưa thống nhất tác giả/chủ sở hữu;
- chưa phân biệt rõ người nộp thủ tục với chủ sở hữu/chủ đơn;
- asset không rõ nguồn hoặc không lưu điều khoản AI/stock;
- gói chứng cứ chứa credential, khóa ký hoặc `.env`;
- dùng tờ khai đã hết hiệu lực;
- trộn staging với production;
- tài liệu công khai mô tả sai trạng thái pháp lý.

## 10. Nguồn chính thức phải đối chiếu

- Cục Bản quyền tác giả: quy định người có quyền nộp hồ sơ, biểu mẫu hiện hành và văn bản đồng ý/ủy quyền khi có đồng chủ sở hữu.
- Cổng Văn bản Chính phủ: văn bản gốc và tình trạng hiệu lực của Luật số 131/2025/QH15, Nghị định 17/2023 và Nghị định 134/2026.
- Cục Sở hữu trí tuệ: thủ tục đăng ký nhãn hiệu, quyền cùng đăng ký để trở thành đồng chủ sở hữu và quy định về đại diện/ủy quyền.
