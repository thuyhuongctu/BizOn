---
name: ux-review
description: "Rà trải nghiệm người dùng của một trang hay màn game BizOn đang chạy: người mới có biết phải làm gì, đủ trạng thái (đang tải, trống, lỗi, mất mạng), điện thoại 360–390 px, chạm ≥ 44 px, bàn phím, tương phản, chế độ tối, VI/EN, giảm chuyển động. Mở trang thật bằng Playwright và chụp màn hình làm bằng chứng."
argument-hint: "[tên-trang.html] [luồng: vd «bắt đầu → chốt tuần 1»]"
user-invocable: true
---

<!-- Phỏng theo skill ux-review của «Claude Code Game Studios» (Donchitos, giấy phép MIT – xem THIRD-PARTY-NOTICES.md mục 6),
     Việt hóa và đổi từ rà bản đặc tả sang rà trang web thật của BizOn. -->

# Rà soát UX một trang

Trả lời bằng tiếng Việt, xưng «em», gọi chị. Chỉ rà và báo cáo; sửa thì làm nhánh riêng sau khi chị đồng ý.

## 1. Chuẩn bị

- Không có tên trang thì hỏi chị trang nào và luồng nào (ví dụ «sinh viên mở link ?lop= trên điện thoại rồi chơi tuần 1»).
- Bật máy chủ tĩnh ở thư mục kho (ví dụ `python3 -m http.server 89xx --bind 127.0.0.1`), mở bằng Playwright
  (`require('playwright')`, trình duyệt có sẵn). Tắt máy chủ theo PID khi xong, không dùng `pkill -f`.
- Trang có cổng đăng nhập trò chơi (Game3DGate) thì đặt sẵn khóa sessionStorage của trang để vào thẳng màn giới thiệu.
- Ảnh chụp và script để trong thư mục scratchpad, không commit.

## 2. Chạy luồng ở ba khổ

360×760 (điện thoại nhỏ), 390×844 (điện thoại phổ biến), 1280×860 (máy tính). Mỗi khổ ghi: lỗi JS (`pageerror`), lỗi console,
tài nguyên 404, `scrollWidth - innerWidth` (phải ≤ 1, không tràn ngang), ảnh hỏng. Chụp màn ở mỗi bước chính của luồng.

## 3. Danh sách kiểm

**Người mới có biết phải làm gì**
- [ ] Màn đầu nói rõ mục tiêu và việc đầu tiên cần làm, trong một màn không cuộn trên điện thoại
- [ ] Nút hành động chính nổi bật nhất; không có hai nút cùng mức gây phân vân
- [ ] Sau mỗi hành động có phản hồi thấy được (kết quả, thông báo, chuyển cảnh) trong ≤ 1 giây
- [ ] Tour/hướng dẫn không che nút đang cần bấm; tắt được và xem lại được

**Đủ trạng thái**
- [ ] Đang tải (nhất là cảnh 3D, video, dữ liệu Supabase): có dấu hiệu, không màn trắng
- [ ] Trống (chưa có lớp, chưa có kết quả): nói rõ vì sao và làm gì tiếp
- [ ] Lỗi và mất mạng: game vẫn chơi được nếu được thiết kế chơi không mạng; lỗi gửi kết quả có thông báo dễ hiểu, không mất ván
- [ ] Chưa đăng nhập / phiên hết hạn: hướng dẫn đăng nhập email trường, không văng lỗi kỹ thuật

**Điện thoại và thao tác**
- [ ] Không tràn ngang ở 360–390 px; chữ chính ≥ 14 px; vùng chạm ≥ 44×44 px
- [ ] Không có lớp phủ cố định che nút (chip, khung chat, nút Vũ trụ, thanh ngôn ngữ)
- [ ] Bàn phím: Tab đi đúng thứ tự, thấy được tiêu điểm, Enter/Space bấm được nút, Esc đóng hộp thoại
- [ ] Không thao tác nào bắt buộc rê chuột hay kéo chính xác mà không có cách khác

**Đọc được, ai cũng dùng được**
- [ ] Tương phản chữ chính ≥ 4.5:1, cả chế độ sáng lẫn tối (`localStorage bizon-theme = dark`)
- [ ] Thông tin không chỉ nói bằng màu (đúng/sai, tăng/giảm có thêm chữ hay biểu tượng)
- [ ] Ảnh có `alt` có nghĩa; nút chỉ có biểu tượng thì có `aria-label`
- [ ] `prefers-reduced-motion`: tắt nhấp nhô, hạt bay, rung; game vẫn chơi được
- [ ] Đổi VI ↔ EN giữa chừng không mất trạng thái ván, không còn chữ chưa dịch ở phần đang hiện

**Quy ước của kho** (theo `CLAUDE.md`)
- [ ] html-validate 0 lỗi (`npx --yes html-validate@8.24.1 <trang>`)
- [ ] Nút ngoài form có `type="button"`; `th` có `scope`; không có `div`/`p` trong `button`
- [ ] Trang trong `sitemap.xml` có `<link rel="canonical">`

**Riêng game dạy học**
- [ ] Con số quan trọng (lợi nhuận, điểm, hạng) có đơn vị và giải thích ngắn; có ghi rõ là chỉ số mô phỏng
- [ ] Màn kết quả dẫn sang phản tư/debrief, không chỉ khoe điểm
- [ ] Giảng viên chiếu lên máy chiếu đọc được từ cuối lớp (chữ lớn, tương phản cao)

## 4. Kết quả

```
## Rà soát UX: [trang] – luồng [..]

### Bằng chứng
- ảnh: [đường dẫn tuyệt đối trong scratchpad]
- lỗi JS / console / 404 / tràn ngang theo khổ: …

### Vấn đề
| Mức | Khổ | Bước | Vấn đề | Đề xuất |
(Mức: Chặn – không đi tiếp được · Cao – dễ bỏ cuộc/hiểu sai · Trung bình · Thấp)

### Đạt / chưa đạt theo nhóm: Người mới · Trạng thái · Điện thoại · Đọc được · Quy ước · Dạy học

### Kết luận: [ĐẠT / CẦN SỬA / CẦN LÀM LẠI / CHƯA ĐÁNH GIÁ]
```

Mục nào không kiểm được (thiếu dữ liệu lớp, không đăng nhập được) thì ghi **CHƯA ĐÁNH GIÁ** cho mục đó, không coi là đạt.

## 5. Bước tiếp

Gửi chị 2–4 ảnh tiêu biểu kèm báo cáo. Hỏi chị: (A) em sửa các mục Chặn/Cao trên một nhánh riêng, có test giữ hành vi
(kiểm tràn ngang, trạng thái, nhãn); (B) chỉ lưu báo cáo vào `docs/ux/ux-[trang]-[YYYY-MM-DD].md`; (C) dừng.
