# Báo cáo: Tài khoản sinh viên thật (v1) — đã xây, CHƯA bật

**Ngày:** 2026-09-14
**Phạm vi:** `supabase/migrations/20260914020000_student_auth.sql`, `js/student-auth.js`, `game.html`
**Trạng thái:** Backend đã build thật, đã kiểm thử, đã áp dụng lên production
Supabase (`ceytblfelodpnudomccn`). Giao diện đã build và kiểm thử, nhưng
**CHƯA nối vào luồng đăng nhập mặc định** — hoàn toàn không ảnh hưởng buổi
học Thứ Ba 15/09.

## 1. Vấn đề cần giải quyết

Màn hình LOGIN của `game.html` hiện chỉ nhận email/tên đội/mã lớp gõ tự do,
không xác thực gì. `get_team_save`/`upsert_team_save` chấp nhận bất kỳ ai
biết đúng (Mã lớp, Tên đội) đọc/ghi tiến trình đội đó — token bảo vệ chỉ là
tùy chọn, không bắt buộc.

Bạn yêu cầu: xây auth thật cho SV, nhưng **không bật cho buổi học Thứ Ba
15/09** (chưa đầy 24 giờ tính từ lúc bắt đầu việc này) — build xong, test kỹ,
để cờ tắt, chỉ bật sau khi bạn xác nhận và có thời gian dự phòng.

## 2. Kiến trúc

Giống hệt kiến trúc giảng viên (`INSTRUCTOR_AUTH_V1_REPORT.md`): Supabase
Auth (GoTrue) thật, gọi thẳng REST, không SDK, không tốn phí.

```
Sinh viên
  → Đăng ký/Đăng nhập (email @student.ctu.edu.vn + mật khẩu) qua Supabase Auth
  → Nhận access_token, lưu tạm sessionStorage
  → Gõ Mã lớp + Tên đội + Vai trò (CEO/CFO/CMO/COO/SEC) → bizon_join_team()
      - Domain email sai (không phải @student.ctu.edu.vn) → bị chặn
      - Vai trò đó trong đội đó đã có người giữ → bị chặn
      - Đổi đội (gọi lại với đội khác) → CHUYỂN sang đội mới, mất quyền đọc
        đội cũ ngay (unique(student_id, class_code))
  → bizon_student_get_save()/bizon_student_upsert_save() đọc/ghi đúng đội
    của người gọi — KHÔNG nhận team_name từ client nữa. Ghi vào đúng bảng
    team_saves hiện có — Instructor Studio/Dashboard cổ điển đọc được ngay,
    không cần đổi gì.
```

### Bảng mới: `student_team_membership`
`unique(student_id, class_code)`: một sinh viên = một đội trong một lớp.
`unique(class_code, team_name, role)`: một vai trò trong một đội chỉ một
người giữ. RLS bật, không cấp quyền trực tiếp — mọi truy cập qua hàm
SECURITY DEFINER, giống `instructor_class_access`.

### Hàm mới
`bizon_join_team`, `bizon_my_team`, `bizon_student_get_save`,
`bizon_student_upsert_save` — chi tiết xem chú thích đầu file migration.

## 3. Đã kiểm thử thế nào

**10 kịch bản trên PostgreSQL cục bộ** (dùng lại đúng bộ giả lập
`auth.uid()`/`auth.jwt()` từ lần build auth giảng viên): tham gia hợp lệ →
lưu/đọc tiến trình đúng → `bizon_my_team` trả đúng → giành vai trò đã có
người giữ bị chặn với thông báo rõ ràng → đồng đội (vai khác, cùng đội) đọc
được tiến trình chung → đổi đội thì **mất ngay** quyền đọc đội cũ (0 dòng,
cách ly đúng) → email ngoài `@student.ctu.edu.vn` bị chặn → `anon` (chưa
đăng nhập) bị chặn ở mọi hàm mới → bảng `student_team_membership` không đọc
trực tiếp được kể cả khi đã đăng nhập → luồng cũ (`get_team_save`/
`upsert_team_save`, anon + token) chạy y nguyên, không bị đụng.

**Phát hiện và sửa 1 lỗi thật lúc test:** cột trả về của `bizon_join_team`
trùng tên với cột bảng thật (`class_code`) khiến Postgres báo "ambiguous
column" ngay tại mệnh đề `ON CONFLICT` — sửa bằng pragma
`#variable_conflict use_column`. Không phát hiện được lỗi này nếu chỉ đọc
code, phải chạy thật mới thấy.

**Sau khi áp dụng lên production:** kiểm chứng lại bằng
`has_function_privilege` — cả 4 hàm mới đều `anon=false, authenticated=true`
đúng như thiết kế.

**Giao diện (`js/student-auth.js` + panel trong `game.html`):** kiểm thử
bằng Playwright, 2 trường hợp:
- **Không có `?studentAuth=1`:** panel tồn tại trong DOM nhưng ẩn
  (`display:none`), 0 lỗi console — xác nhận màn hình đăng nhập mặc định
  không đổi gì cả.
- **Có `?studentAuth=1`:** panel hiện ra sau đúng màn splash chờ sẵn có của
  game (không phải lỗi mới); giả lập máy chủ Supabase bằng
  `page.route()` (cùng kỹ thuật đã dùng khi kiểm thử Instructor Studio, vì
  **sandbox này bị chặn gọi HTTPS trực tiếp ra `supabase.co`** — chỉ gọi
  được qua công cụ MCP Supabase, không qua trình duyệt/curl thường) — đăng
  ký → tham gia đội → tải tiến trình → lưu thử đều đúng dữ liệu gửi/nhận
  khớp hợp đồng API thật; đường lỗi (giành vai đã có người giữ) hiện đúng
  thông báo cho người dùng.

**Giới hạn của lần kiểm thử này:** vì sandbox chặn gọi thẳng `supabase.co`,
chưa kiểm thử được một lượt round-trip THẬT (trình duyệt thật gọi thẳng
production) — chỉ kiểm thử được logic SQL thật (Postgres cục bộ + production
qua MCP) và logic giao diện thật (Playwright + giả lập mạng khớp đúng hợp
đồng API). Nên tự tay thử một lượt thật trên điện thoại/máy tính trước khi
bật, xem mục 5.

## 4. CHƯA bật — game.html mặc định không đổi gì

`js/student-auth.js` tự thoát ngay dòng đầu nếu URL không có
`?studentAuth=1` — không tải DOM, không gắn sự kiện, không gọi mạng. Bảng
mới và 4 hàm mới thuần cộng thêm, không sửa/xóa gì đang dùng. Buổi học Thứ
Ba 15/09 dùng đúng màn LOGIN cũ (email/tên đội/mã lớp tự khai), không hay
biết migration này tồn tại.

## 5. Cách thử — và cách bật thật khi bạn sẵn sàng

**Thử ngay (không ảnh hưởng ai):** mở
`https://thuyhuongctu.github.io/BizOn/game.html?studentAuth=1` trên trình
duyệt của bạn — sẽ thấy khung "🔒 Đăng nhập sinh viên thật (thử nghiệm)"
phía trên khung đăng nhập cũ. Đăng ký bằng một email `@student.ctu.edu.vn`
thật của bạn (hoặc nhờ một sinh viên thử hộ), tham gia một mã lớp/đội thử
nghiệm (đừng dùng đúng mã lớp thật đang chạy), bấm Lưu thử/Tải tiến trình để
xem vòng lặp hoạt động.

**Việc còn lại trước khi "bật thật" (nối vào luồng mặc định của mọi sinh
viên):**
1. Xác nhận cài đặt "Confirm email" của Supabase Auth (chưa có công cụ để tự
   kiểm tra/tắt, giống hạn chế đã ghi trong báo cáo giảng viên) — nếu đang
   bật, sinh viên đăng ký xong phải mở email xác nhận mới đăng nhập được,
   có thể không phù hợp nhịp một buổi học 90 phút.
2. Quyết định: có bắt buộc TOÀN BỘ sinh viên dùng auth thật ngay, hay cho
   phép cả hai đường chạy song song (như đã làm với giảng viên) một thời
   gian trước khi khóa đường cũ?
3. Nối `js/student-auth.js` (hoặc logic tương đương) vào `doLogin()` thật
   trong `js/app.js`, có UI rõ ràng hơn là một khung phụ (hiện tại chỉ đủ để
   kiểm thử, chưa phải trải nghiệm sau cùng cho sinh viên).
4. Thử thật với một lớp nhỏ/một buổi thử nghiệm trước khi áp dụng đại trà.

## 6. Không tốn phí

Dùng đúng Supabase Auth đã có sẵn miễn phí, không thêm dịch vụ trả phí nào.
