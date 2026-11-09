---
name: dac-ta
description: "Lối vào tiếng Việt cho Spec Kit: từ một mô tả tính năng, chạy liền chuỗi đặc tả → làm rõ (tối đa 5 câu hỏi) → kế hoạch → chia việc thành từng PR → đối chiếu, ghi vào specs/NNN-tên/, rồi dừng chờ chị duyệt trước khi viết mã. Dùng cho tính năng mới cỡ M trở lên (nhiều trang, nhiều PR, đổi luật chơi hay dữ liệu); sửa chữ, sửa lỗi nhỏ thì làm thẳng."
argument-hint: "[mô tả tính năng bằng lời thường]"
user-invocable: true
---

<!-- Phỏng theo quy trình của Spec Kit (github/spec-kit, © GitHub, Inc., giấy phép MIT – xem THIRD-PARTY-NOTICES.md
     mục 6). Lệnh này không chép lại mẫu: nó gọi các lệnh speckit-* đã cài trong .claude/skills/ và các mẫu trong
     .specify/templates/, thêm quy ước riêng của BizOn (tiếng Việt, mỗi câu chuyện một PR, dừng chờ chị duyệt). -->

# Đặc tả trước, mã sau

Trả lời bằng tiếng Việt, xưng «em», gọi chị. Mọi tài liệu sinh ra (spec, plan, tasks) viết **bằng tiếng Việt**, giữ
nguyên tên mục của mẫu Spec Kit đã Việt hóa như `specs/001-giai-phap-cta/`. Đọc trước `.specify/memory/constitution.md`
(hiến chương) và `CLAUDE.md`; khi hai bên khác nhau thì `CLAUDE.md` thắng.

**Không viết mã trong lệnh này.** Lệnh kết thúc ở bước 6, khi chị đã có đủ tài liệu để duyệt.

## 0. Có cần đặc tả không

- Sửa chữ, sửa lỗi nhỏ, một tệp, không đổi luật hay dữ liệu: nói với chị là không cần đặc tả, làm thẳng như thường.
- Từ cỡ M trở lên (nhiều trang hoặc nhiều PR, đổi luật chơi, đổi điểm số, thêm bảng hay RPC Supabase, thêm game): đi tiếp.
- Mở nhánh `claude/<tên-việc>` như thường lệ. Spec Kit **không tự tạo nhánh**; thư mục `specs/NNN-tên/` đi cùng PR đầu tiên.

## 1. Đặc tả: theo `/speckit-specify`

Đọc và làm theo `.claude/skills/speckit-specify/SKILL.md` với mô tả của chị. Tên ngắn (`--short-name`) không dấu,
nối gạch, ví dụ `hanh-trinh-3-bac`. Ngoài yêu cầu của mẫu, spec phải có:

- **Hiện trạng đo được** trước khi đổi (đếm trang, đo bằng Playwright, trích mã đang chạy), ghi ngày đo.
- **Câu chuyện người dùng xếp ưu tiên P1, P2, P3…**, mỗi câu chuyện **tự đứng được**: làm riêng câu P1 vẫn ra một
  phần dùng được. Mỗi câu có mục «Cách thử độc lập» và kịch bản nghiệm thu dạng **Cho … / Khi … / Thì …**.
- Người dùng ghi đúng vai của BizOn: sinh viên, đội, giảng viên, lãnh đạo khoa, khách.
- Nối mỗi câu chuyện với **chuẩn đầu ra** (`docs/chuan-dau-ra-va-rubric.md`) khi tính năng phục vụ việc học.
- Tối đa **3** chỗ đánh dấu `[CẦN LÀM RÕ: …]`; chỗ nào đoán được hợp lý thì đoán và ghi vào mục «Giả định».

## 2. Làm rõ: theo `/speckit-clarify`, **tối đa 5 câu hỏi**

Đọc và làm theo `.claude/skills/speckit-clarify/SKILL.md`, với các điều chỉnh sau:

- Chỉ hỏi điều **chỉ chị quyết được** hoặc làm đổi thiết kế: câu chữ chính sách, giá, chức danh, chọn bản chính,
  luật chơi, dữ liệu người học. Không hỏi điều tự tra được trong kho.
- Mỗi câu có 2–4 phương án; phương án em đề xuất đứng đầu, ghi «(đề xuất)» và một dòng lý do.
- Hỏi gộp trong **một lượt**, rồi dừng chờ chị trả lời. Không tự trả lời thay chị.
- Ghi câu trả lời vào spec ở mục `## Làm rõ`, kèm ngày, và sửa luôn các yêu cầu bị ảnh hưởng.
- Nếu không còn chỗ mơ hồ đáng hỏi, nói rõ là không hỏi và đi tiếp.

## 3. Kế hoạch: theo `/speckit-plan`

Đọc và làm theo `.claude/skills/speckit-plan/SKILL.md`. Kế hoạch phải có:

- Mục **«Kiểm theo hiến chương»**: nguyên tắc nào bị ảnh hưởng và cách giữ. Nguyên tắc III «trang tĩnh» là không thương lượng.
- Tệp sẽ chạm, **kể cả bản 2D, v2, 3D** của cùng game (ví dụ Hộ Chiếu Sầu Riêng dùng chung engine và dữ liệu).
- Tệp thuộc hồ sơ quyền tác giả đang thẩm định thì không đổi; nếu buộc phải đổi, đưa thành câu hỏi cho chị.
- Phần Supabase: migration mới trong `supabase/migrations/`, test trên Postgres cục bộ; **không đụng cơ sở dữ liệu thật**.

## 4. Chia việc thành PR: theo `/speckit-tasks`

Đọc và làm theo `.claude/skills/speckit-tasks/SKILL.md`, rồi thêm vào cuối `tasks.md` mục **`## Kế hoạch PR`**:

| PR | Câu chuyện | Nhánh | Test hỏng trước | Tệp chính |
|---|---|---|---|---|

- Mỗi PR gói **một câu chuyện** (P1 trước), hoặc một phần nền dùng chung đứng riêng trước câu chuyện cần nó.
- Mỗi PR có test trong `test/*.test.js` viết **trước** và thấy hỏng; nâng `CACHE` trong `sw.js`; `html-validate@8.24.1`
  0 lỗi trên tệp đã đổi; `index.html` trùng byte `academia3d-v2.html` nếu chạm trang chủ.
- PR nào cần chị làm tay (áp migration, đổi cài đặt Supabase, bấm «Delete branch») thì ghi rõ trong bảng.

## 5. Đối chiếu: theo `/speckit-analyze` (chỉ đọc)

Đọc và làm theo `.claude/skills/speckit-analyze/SKILL.md`: soát spec ↔ plan ↔ tasks xem có yêu cầu không có việc,
việc không có yêu cầu, mâu thuẫn số liệu hay thuật ngữ, vi phạm hiến chương. Lỗi mức **CRITICAL** thì sửa ngay trong
tài liệu rồi đối chiếu lại; mức thấp hơn ghi vào báo cáo cho chị.

## 6. Dừng chờ chị duyệt

Gửi chị một tóm tắt ngắn: tên và thư mục đặc tả, số câu chuyện (P1…), bảng **Kế hoạch PR**, câu hỏi còn mở và
kết quả đối chiếu. Đẩy thư mục `specs/NNN-tên/` lên nhánh, mở **PR nháp** tiêu đề tiếng Việt như thường lệ.

Khi chị duyệt, làm **từng PR một** theo `/speckit-implement`, đánh dấu `[X]` trong `tasks.md` sau mỗi việc xong.
**Chỉ gộp khi chị nói «Gộp»**.
