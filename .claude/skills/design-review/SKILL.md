---
name: design-review
description: "Rà một bản thiết kế game hoặc tính năng BizOn TRƯỚC khi làm: đủ phần chưa, luật có rõ để lập trình không phải đoán, công thức có hỏng ở giá trị biên không, có mâu thuẫn với game khác hay với chuẩn đầu ra không, tiêu chí nghiệm thu có kiểm được không. Dùng cho tài liệu trong docs/ hoặc một đề xuất chị vừa nêu trong trò chuyện."
argument-hint: "[đường-dẫn-tài-liệu | (để trống: rà đề xuất vừa bàn)]"
user-invocable: true
---

<!-- Phỏng theo skill design-review của «Claude Code Game Studios» (Donchitos, giấy phép MIT – xem THIRD-PARTY-NOTICES.md mục 6),
     Việt hóa và rút gọn cho BizOn: không registry/ADR, thêm tiêu chí sư phạm và nghiên cứu. -->

# Rà soát thiết kế

Trả lời bằng tiếng Việt, xưng «em», gọi chị. Chỉ đọc và nhận xét; không sửa tài liệu hay mã khi chị chưa đồng ý.

## 1. Nạp tài liệu

- Có đường dẫn: đọc tài liệu đó theo từng mục (tìm tiêu đề `^#` rồi đọc từng đoạn), không đọc lướt.
- Không có đường dẫn: dùng đề xuất vừa bàn trong trò chuyện; tóm tắt lại 3–5 dòng và hỏi chị đúng ý chưa trước khi rà.
- Đọc thêm tài liệu liên quan: `CLAUDE.md` (quy ước kho), `docs/chuan-dau-ra-va-rubric.md`, tài liệu chấm điểm của game
  (`docs/cham-diem-*.md`), kiến trúc trong `docs/architecture/` nếu tính năng đụng tới hành trình, dữ liệu hay Supabase.

## 2. Đủ phần chưa

Đánh dấu từng mục **Bắt buộc** hay **Nên có**; thiếu mục bắt buộc thì không duyệt.

- [ ] **Tổng quan** (một đoạn: là gì, cho ai, chơi trong bao lâu) — bắt buộc
- [ ] **Mục tiêu học tập**: nối với chuẩn đầu ra nào, sinh viên phải tự rút ra điều gì — bắt buộc
- [ ] **Trải nghiệm mong muốn**: người chơi cảm thấy gì, «à ra vậy» ở đâu — nên có
- [ ] **Luật chi tiết**: trạng thái, lượt/vòng, điều kiện thắng–thua, không mơ hồ — bắt buộc
- [ ] **Công thức**: mọi phép tính có biến, đơn vị và khoảng giá trị — bắt buộc nếu có con số
- [ ] **Trường hợp biên**: bỏ giữa chừng, mất mạng, đổi ngôn ngữ giữa ván, chơi lại, hai người chung máy — bắt buộc
- [ ] **Phụ thuộc**: game, module, bảng Supabase, RPC, hành trình 3 bậc bị ảnh hưởng — bắt buộc
- [ ] **Tham số chỉnh được** (núm vặn cân bằng) và nơi lưu — nên có
- [ ] **Dữ liệu và quyền riêng tư**: gửi gì lên máy chủ, ai đọc được, có email không, giữ bao lâu — bắt buộc nếu có gửi mạng
- [ ] **Tiêu chí nghiệm thu** kiểm được bằng test — bắt buộc

## 3. Nhất quán và làm được

**Bên trong tài liệu**
- Công thức cho ra đúng hành vi mô tả không? Thử giá trị nhỏ nhất, lớn nhất: âm vô lý, chia cho 0, vô cực, NaN.
- Trường hợp biên có mâu thuẫn với luật chính không?

**Làm được không**
- Lập trình viên làm theo có phải đoán chỗ nào không? Trích nguyên câu mơ hồ.
- Chạy được trên điện thoại 360–390 px, trên máy phòng lab cũ, khi mạng chập chờn? Trang tĩnh, không bước build.
- Tiêu chí nghiệm thu: câu kiểu «cảm thấy cân bằng», «chạy ổn», «đẹp» **không phải tiêu chí**. Viết lại thành điều đo được
  (ví dụ «mô phỏng 500 ván: chiến lược tham chiếu thắng chiến lược tham lam ở ≥ 60% ván»).

**Với phần còn lại của BizOn**
- Mâu thuẫn với luật hay thuật ngữ của game khác không (ví dụ cùng chữ «vụ» nhưng nghĩa khác)?
- Đụng engine dùng chung không (Sầu Riêng: 2D, v2, 3D dùng chung engine; `index.html` phải giống hệt `academia3d-v2.html`)?
- Hợp với giọng văn và nhân vật hiện có không (Lumina không chọn giúp; nhân vật không đưa đáp án thay người học)?
- Có yếu tố nhạy cảm cần thận trọng không: tôn giáo, chính trị, bản đồ chủ quyền, thương mại hóa niềm tin, tiền thật?

**Sư phạm và nghiên cứu**
- Cơ chế có dạy đúng điều tài liệu hứa không, hay chỉ thưởng cho việc đoán mò?
- Có giữ được khả năng so sánh với dữ liệu các lớp trước không (đổi luật giữa học kỳ làm hỏng so sánh)?

## 4. Kết quả

```
## Rà soát thiết kế: [tên]

### Đủ phần: [x/y mục bắt buộc]
- thiếu: …

### Phải sửa trước khi làm
1. [vấn đề — trích câu/dòng — đề xuất cụ thể]

### Nên sửa
- …

### Có thì hay
- …

### Quy mô ước tính: [S / M / L / XL]
S: một trang, không công thức, không đụng dữ liệu · M: 1–2 công thức hoặc vài tệp ·
L: nhiều game hoặc có migration Supabase · XL: đổi engine dùng chung hoặc kiến trúc

### Kết luận: [DUYỆT / CẦN SỬA / CẦN LÀM LẠI NHIỀU / CHƯA ĐÁNH GIÁ]
```

Kết luận theo phát hiện nặng nhất. **CHƯA ĐÁNH GIÁ** khi thiếu tài liệu để so (nói rõ thiếu gì), không phải duyệt.

## 5. Bước tiếp

Hỏi chị: (A) em sửa tài liệu theo các mục «Phải sửa»; (B) bắt đầu làm luôn với các giả định em vừa nêu;
(C) dừng để chị đọc. Có công thức hay tham số mới thì gợi ý chạy `/balance-check` sau khi làm xong bản đầu.
