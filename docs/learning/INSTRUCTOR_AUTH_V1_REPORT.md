# Báo cáo: Tài khoản giảng viên riêng cho Instructor Studio (v1)

**Ngày:** 2026-09-13
**Phạm vi:** `app/instructor-studio.html`, `js/app-shell/instructor-studio.js`,
`supabase/migrations/20260914000000_instructor_auth.sql`
**Trạng thái:** Đã build thật, đã áp dụng lên production Supabase
(`ceytblfelodpnudomccn`), đã kiểm thử. Chưa có giảng viên thật nào dùng
(0 lớp đã đăng ký tính đến thời điểm viết báo cáo này).

## 1. Vấn đề cần giải quyết

Bản ghi nhớ so sánh BizOn với BizRuptors (Nikkei) chỉ ra: Instructor Studio
trước đây dùng **một khóa giảng viên dùng chung cho tất cả mọi người**
(`BIZON-GV-2026` hoặc khóa tùy chỉnh lưu trong bảng `app_secrets`). Bất kỳ
ai biết khóa đều đọc được **mọi lớp**, không chỉ lớp của mình. Việc thêm
link đăng nhập ở `truong-giang-vien.html` (đã làm trước đó) chỉ sửa lỗi
"không tìm thấy đường vào Instructor Studio" — không giải quyết việc thiếu
tài khoản riêng cho từng giảng viên, vốn là yêu cầu thật của bản ghi nhớ.

Yêu cầu của bạn: *"Làm thật... nếu phải có backend"*, và không tốn phí mua
API key. Báo cáo này mô tả những gì đã **thực sự chạy được**, không phải
đề xuất.

## 2. Kiến trúc

Không dùng dịch vụ trả phí nào. Toàn bộ dựa trên **Supabase Auth (GoTrue)**
— tính năng đăng nhập có sẵn miễn phí trong gói Supabase đang dùng, gọi
thẳng qua REST (không cần SDK, không cần thư viện ngoài).

```
Giảng viên
  → Đăng ký/Đăng nhập (email + mật khẩu) qua Supabase Auth
  → Nhận access_token (JWT), lưu tạm trong sessionStorage (mất khi đóng tab)
  → Gõ Mã lớp → gọi bizon_claim_class(mã_lớp)
      - Lớp CHƯA ai nhận  → giảng viên này trở thành chủ lớp
      - Lớp ĐÃ có chủ     → bị từ chối ("đã được giảng viên khác đăng ký")
  → Các RPC xem dữ liệu (*_v2) chỉ trả về lớp mà đúng giảng viên này sở hữu
```

### Bảng mới: `instructor_class_access`
Ghi nhận ai sở hữu mã lớp nào. `unique(class_code)` đảm bảo **mỗi mã lớp
chỉ có một chủ** (nguyên tắc "ai đăng ký trước, người đó giữ" — first-claim-
wins), tương tự cơ chế đã dùng cho việc lưu kết quả đội trước đây. Bật RLS,
không cấp quyền đọc/ghi trực tiếp cho `anon`/`authenticated` — chỉ truy cập
được qua các hàm bên dưới.

### Hàm mới
- `bizon_claim_class(p_class_code)` — đăng ký lớp cho người gọi (phải đã
  đăng nhập). Chống trùng mã lớp bằng bắt lỗi `unique_violation`.
- `bizon_owns_class(p_class_code)` — kiểm tra người gọi có phải chủ lớp đó
  không; dùng làm điều kiện lọc trong các hàm xem dữ liệu.
- 6 hàm xem dữ liệu bản `_v2` (`bizon_leaderboard_v2`, `bizon_feed_v2`,
  `bizon_ft_board_v2`, `bizon_bp_board_v2`, `bizon_survey_export_v2`,
  `bizon_bp_learning_traces_v2`) — giống hệt bản gốc, chỉ khác: xác thực
  bằng `bizon_owns_class()` (qua tài khoản đăng nhập) thay vì so khớp khóa
  dùng chung. Đặt tên `_v2` riêng (không ghi đè hàm cũ) để tránh lỗi
  overload Postgres từng gặp trước đây.
- `bizon_demo_leaderboard()` / `bizon_demo_feed()` — cho phép **xem thử
  không cần đăng nhập**, chỉ đọc dữ liệu mẫu công khai của lớp `DEMO-2026`
  (mã lớp demo đã có sẵn trong code từ trước, không phải lớp thật).

### Giao diện (`app/instructor-studio.html` + `instructor-studio.js`)
- Ô Email + Mật khẩu, nút "Đăng ký tài khoản" / "Đăng nhập".
- Sau khi đăng nhập: ô Mã lớp + nút "Đăng ký & theo dõi lớp".
- Nút "👀 Xem thử — không cần đăng nhập" luôn hiển thị, mở thẳng bảng dữ
  liệu mẫu, không đụng đến lớp thật.
- Phiên đăng nhập lưu trong `sessionStorage` (không phải `localStorage`) —
  đúng với nguyên tắc "khóa không được lưu" đã ghi sẵn trên trang; khi gọi
  RPC bị từ chối do hết hạn (401), tự làm mới phiên một lần bằng
  refresh_token trước khi báo lỗi.

## 3. Đã áp dụng lên production, đã kiểm chứng lại (vừa chạy lại lúc viết báo cáo)

```
RLS bật trên instructor_class_access:        true
anon gọi được bizon_claim_class:             false  (đúng — phải đăng nhập)
authenticated gọi được bizon_claim_class:    true
anon đọc được bizon_leaderboard_v2:          false  (đúng — bị chặn)
authenticated đọc được bizon_leaderboard_v2: true   (còn bị lọc theo quyền sở hữu bên trong)
anon gọi được bizon_demo_leaderboard/feed:   true   (đúng — demo công khai)
anon vẫn gọi được bizon_leaderboard cũ:      true   (đúng — đường cũ CHƯA bị tắt, xem mục 5)
Số lớp đã có giảng viên đăng ký:              0
Số dòng dữ liệu mẫu DEMO-2026:                12
```

## 4. Đã kiểm thử thế nào

- **9 kịch bản trên PostgreSQL cục bộ** (giả lập trước khi đụng production):
  giảng viên A đăng ký lớp → đọc được lớp mình; giảng viên B cố giành lớp
  đó → bị từ chối; B đọc lớp A → **0 dòng** (cách ly đúng); B đăng ký lớp
  khác → chỉ đọc được lớp của B; người dùng `anon` không đăng nhập → không
  đăng ký lớp được, không đọc bảng nội bộ được; chế độ xem thử hoạt động
  với `anon` hoàn toàn không có JWT; đường cũ (khóa dùng chung) vẫn chạy
  song song. Phát hiện và sửa 1 lỗi thật trong lúc test: 2 hàm demo thiếu
  `security definer` nên bị từ chối đọc bảng — đã sửa trước khi đưa lên
  production.
- **Kiểm thử giao diện thật bằng trình duyệt (Playwright)**, giả lập máy
  chủ Supabase để không cần chạm dữ liệu thật: đăng ký tài khoản → đăng ký
  mã lớp → bảng xếp hạng/Brand Passport/Decision Trace/khảo sát hiển thị
  đúng → xuất CSV/JSON đúng định dạng (chống công thức độc hại) → mật khẩu
  luôn bị xóa khỏi ô nhập (kể cả khi đăng nhập thất bại hoặc rời trang —
  phát hiện và vá thêm lỗi nhỏ này trong lúc viết bài kiểm thử) → chế độ
  xem thử hoạt động với 0 thao tác đăng nhập → khi backend lỗi, không lộ
  dữ liệu, không lưu mã lớp thất bại.
- Bộ kiểm thử tự động của dự án (`test/instructor-studio.test.js`,
  `scripts/release/capture-instructor-studio.mjs`) trước đó viết cho luồng
  khóa dùng chung cũ — đã cập nhật lại để khớp luồng mới, chạy lại toàn bộ,
  đều đạt.

## 5. Rollout an toàn — CHƯA đổi gì cho người dùng cũ

Đường cũ (`giang-vien.html` — "Dashboard cổ điển", dùng Mã lớp + Khóa
giảng viên chung) **vẫn hoạt động y nguyên**, chưa tắt. Hai đường chạy song
song. Việc này cố ý: tránh trường hợp bạn hoặc Phan Anh Tú đang dùng
Dashboard cổ điển giữa chừng buổi học mà bị khóa đột ngột.

**Việc còn lại, cố ý CHƯA làm:** thu hồi quyền gọi 5 hàm cũ dùng khóa chung
(`bizon_leaderboard`, `bizon_feed`, `bizon_bp_board`,
`bizon_bp_learning_traces`, `bizon_survey_export`) khỏi `anon`/
`authenticated`. Chỉ nên làm việc này **sau khi** bạn xác nhận luồng mới
chạy ổn với một lớp thật. Câu lệnh đã ghi sẵn trong migration, chỉ cần một
migration nhỏ tiếp theo khi bạn đồng ý.

## 6. Cách dùng ngay bây giờ

1. Mở `app/instructor-studio.html`.
2. **Xem thử ngay không cần tài khoản:** bấm "👀 Xem thử" — thấy bảng xếp
   hạng mẫu của lớp `DEMO-2026`.
3. **Dùng thật:** nhập Email + Mật khẩu (≥ 8 ký tự) → "Đăng ký tài khoản"
   → nhập Mã lớp thật của bạn → "Đăng ký & theo dõi lớp". Lần đăng nhập
   sau chỉ cần "Đăng nhập" (không cần đăng ký lại), rồi nhập lại mã lớp
   (mã lớp gần nhất được nhớ sẵn để khỏi gõ lại).
4. Nếu Phan Anh Tú cũng cần theo dõi lớp riêng của anh ấy: anh ấy tự đăng
   ký tài khoản riêng, đăng ký mã lớp riêng — không đọc được lớp của bạn
   và ngược lại.

## 7. Giới hạn đã biết (nói thẳng, không giấu)

- **Chưa xác minh được cài đặt "yêu cầu xác nhận email" của Supabase Auth**
  cho project này. Nếu project đang bật, sau khi "Đăng ký tài khoản" hệ
  thống sẽ báo *"Kiểm tra email để xác nhận"* thay vì đăng nhập ngay — đây
  là hành vi bình thường của Supabase, giao diện đã xử lý đúng thông báo
  đó, nhưng tôi không có công cụ để tự kiểm tra hoặc tắt cài đặt này (chỉ
  truy vấn được cơ sở dữ liệu Postgres qua công cụ hiện có, không truy cập
  được phần cấu hình GoTrue/Auth). Nếu lần đầu thử mà bị yêu cầu xác nhận
  email và bạn không muốn vậy, báo lại — tôi sẽ hướng dẫn tắt trong màn
  hình cài đặt Supabase (Authentication → Providers → Email → tắt "Confirm
  email"), thao tác 1 phút.
- **Một mã lớp = một giảng viên duy nhất.** Chưa có cách thêm giảng viên
  thứ hai (đồng giảng dạy) vào cùng một lớp. Nếu bạn và Phan Anh Tú cùng
  dạy một lớp và cần cùng xem, sẽ cần thêm một hàm nữa (không khó, nhưng
  chưa làm vì chưa có ai yêu cầu).
- **Phiên đăng nhập kéo dài khoảng 1 giờ**, tự làm mới một lần khi hết hạn;
  nếu để trang mở qua đêm, giảng viên sẽ phải đăng nhập lại — đây là đánh
  đổi có chủ đích để không phải lưu mật khẩu lâu dài.
- **Đăng nhập theo tab, không theo máy.** Do dùng `sessionStorage` (đúng
  theo nguyên tắc bảo mật đã ghi sẵn trên trang — "khóa không được lưu"),
  đóng tab là phải đăng nhập lại. Đây là lựa chọn an toàn hơn nhưng kém
  tiện hơn so với lưu vĩnh viễn; có thể đổi nếu bạn thấy bất tiện.

## 8. Không tốn phí

Toàn bộ dùng tính năng Auth có sẵn miễn phí trong gói Supabase hiện tại,
không gọi bất kỳ API trả phí, không thêm dịch vụ bên thứ ba nào — đúng yêu
cầu "không tốn phí mua khóa API".
