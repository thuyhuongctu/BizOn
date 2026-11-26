---
name: security-audit
description: "Rà an ninh BizOn trước một lớp học hay một đợt phát hành: sửa điểm và ván lưu (localStorage), gọi RPC Supabase vượt quyền, RLS hở, lộ dữ liệu sinh viên, chèn mã (innerHTML), khóa hay secret lọt vào kho. Chỉ rà và báo cáo theo mức độ; sửa thì mở nhánh riêng khi chị đồng ý."
argument-hint: "[full | supabase | client | du-lieu | quick]"
user-invocable: true
---

<!-- Phỏng theo skill security-audit của «Claude Code Game Studios» (Donchitos, giấy phép MIT – xem THIRD-PARTY-NOTICES.md mục 6),
     Việt hóa và viết lại cho trang tĩnh BizOn + Supabase (không Godot/Unity/Unreal, không chế độ nhiều người chơi thời gian thực).
     Phần «nguồn → đích» trong nhóm 2 và 2b, «Cổng xác minh 7 câu» và bảng «Một mình chưa thành lỗi» phỏng theo các skill hunt-dom, hunt-xss, hunt-open-redirect,
     triage-validation của «Claude-BugHunter» (© 2026 Sachin Sharma, https://github.com/elementalsouls/Claude-BugHunter,
     nội dung skill theo giấy phép CC BY 4.0 – https://creativecommons.org/licenses/by/4.0/). Đã thay đổi: rút gọn, Việt hóa,
     bỏ toàn bộ kỹ thuật tấn công và công cụ quét, chỉ giữ bảng kiểm phòng thủ áp cho trang tĩnh BizOn + Supabase. -->

# Rà an ninh BizOn

Trả lời bằng tiếng Việt, xưng «em», gọi chị. Lệnh này **chỉ đọc và báo cáo**: không sửa mã, không chạy SQL trên dự án thật,
không gọi RPC ghi dữ liệu thật. Không dán khóa, mật khẩu hay secret vào trò chuyện hay báo cáo (chỉ nêu tên tệp và dòng).

## 1. Phạm vi

- `full` (mặc định): cả 5 nhóm dưới đây. `quick`: chỉ tìm lỗi CRITICAL/HIGH ở nhóm 1–3.
- `supabase`: nhóm 1. `client`: nhóm 2–3. `du-lieu`: nhóm 4–5.
- Ghi rõ nhóm nào bỏ qua và vì sao. **Một nhóm không rà được thì ghi «CHƯA RÀ» kèm lý do, không bao giờ ghi là sạch.**
  Tìm 0 kết quả vì mẫu tìm sai (tên hàm không có trong kho) cũng là «CHƯA RÀ», không phải «an toàn».

## 2. Các nhóm kiểm

**1 · Supabase (máy chủ là nơi quyết định, không tin trình duyệt)**
- Mỗi bảng trong `supabase/migrations/` có `enable row level security`; bảng nhạy cảm có `revoke ... from anon, authenticated`.
- Hàm `security definer` có `set search_path`, kiểm quyền bên trong (`bizon_owns_class`, `auth.uid()`), và `grant execute`
  chỉ cho đúng vai (anon hay authenticated). Hàm công khai (ví dụ `bizon_cert_feed`) không trả cột kín (chữ ký thật, email).
- Điểm, vòng chơi, xếp hạng: máy chủ có giới hạn giá trị (check, giới hạn độ dài `state_json`) hay tin mọi số client gửi lên?
- Kiểm trên Postgres cục bộ như CLAUDE.md hướng dẫn (stub auth + toàn bộ migration), thử gọi bằng vai anon/authenticated khác chủ lớp.

**2 · Phía trình duyệt**
- `innerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, `setTimeout(chuỗi)` nhận dữ liệu từ người dùng,
  URL (`?lop=`, `?ten=`), localStorage hay Supabase mà chưa thoát ký tự (`esc`, `textContent`).
- Ván lưu và điểm trong localStorage/sessionStorage: sửa tay được không, và nếu sửa thì có ảnh hưởng đến điểm nộp lên lớp không
  (chỉ nghiêm trọng khi máy chủ nhận nguyên giá trị đó).
- `postMessage`: bên nhận kiểm `event.origin` trước khi dùng `event.data`; bên gửi không gửi dữ liệu kín với đích `'*'`.
  Ngày 25/11/2026 có bộ nhận `message` ở `app/sw.js`, `bp3d-explainer.html`, `deck-stage.js`, `lab/ho-chieu-sau-rieng-3d.html`.
  Liên kết ngoài có `rel="noopener"`.

**2b · Lần theo «nguồn → đích» (DOM)**
Tìm lỗi bằng cách nối hai đầu, không chỉ đếm `innerHTML`: một đích nguy hiểm chỉ là lỗi khi có nguồn người khác điều khiển được chạy tới nó.
- *Nguồn* người khác điều khiển: `location.search` / `location.hash` (`?lop=`, `?ten=`, `?bo=`…), `document.referrer`,
  `window.name`, `event.data` của `postMessage`, dữ liệu đọc từ Supabase do sinh viên khác nhập (tên đội, lý do, câu trả lời),
  tệp CSV/JSON người dùng nạp vào. localStorage chỉ là nguồn nguy hiểm khi người khác ghi được vào đó (qua một lỗi khác).
- *Đích* chạy mã: `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`,
  `setTimeout`/`setInterval` nhận chuỗi, `setAttribute('on…')`, `script.src`.
- *Đích* điều hướng: `location = …`, `location.href`, `location.assign/replace`, `window.open`, `a.href`, `iframe.src`
  gán từ nguồn trên. Phải chặn `javascript:` và `data:`. Nếu thêm tham số điều hướng (kiểu `?next=`; 25/11/2026 kho chưa có)
  thì chỉ nhận đường dẫn tương đối cùng trang (bắt đầu bằng một dấu `/`, không phải `//`).
- *DOM clobbering*: mã đọc biến toàn cục theo `id` (ví dụ `window.config`) rồi đưa vào đích; nguy hiểm khi có chỗ cho chèn
  thẻ HTML (dù đã lọc `<script>`).
- *SVG và tệp tải lên*: SVG chạy được script. Nếu thêm chức năng tải tệp lên (25/11/2026 kho chưa có), tệp phải nằm ở tên
  miền khác (ví dụ Supabase Storage), không phục vụ cùng nguồn với trang.
- *Service worker* (`sw.js`, `app/sw.js`): chỉ lưu đệm tệp cùng nguồn trong danh sách precache và ảnh; không lưu đệm phản hồi Supabase có
  phiên đăng nhập hay dữ liệu lớp; không có đường nào để người dùng đưa một tệp `.js` lên cùng nguồn (sw độc chạy lại mỗi lần mở trang).

**3 · Khóa và cấu hình**
- `git grep` tìm `service_role`, `sk_`, `secret`, `password`, `token`, khóa riêng, `.env` trong kho và trong lịch sử gần
  (`git log -p -S`). Khóa publishable của Supabase được phép công khai; khóa service_role thì không bao giờ.
- Workflow `.github/workflows/`: có `permissions` tối thiểu, secret chỉ qua `secrets.*`, input người dùng đi qua `env:` chứ
  không chèn thẳng vào lệnh `run:`.

**4 · Dữ liệu sinh viên**
- Không có danh sách lớp, MSSV, email, điểm thật trong kho, trang web hay test (test dùng tên giả).
- Màn hình lớp học, xếp hạng công khai chỉ hiện biệt danh/tên đội; bản xuất Excel chỉ cho giảng viên chủ lớp.

**5 · Phụ thuộc bên ngoài**
- Script tải từ CDN có phiên bản cố định (và `integrity` nếu có); thư viện trong `vendor/` ghi ở THIRD-PARTY-NOTICES.md.

**Cổng xác minh 7 câu (chạy cho từng phát hiện trước khi ghi vào báo cáo)**
Hỏi theo thứ tự. Câu 1–5 và 7 trả lời «không đạt» thì bỏ phát hiện (hoặc chuyển xuống LOW «gia cố»); câu 6 không đạt thì hạ mức, không bỏ.
1. **Khai thác được ngay, từng bước?** Viết ra: cần tài khoản gì; thao tác hay yêu cầu cụ thể (URL, thân yêu cầu, giá trị nhập);
   kết quả đọc/sửa/xoá được gì. Không viết được bước 2 thành thao tác thật → bỏ.
2. **Tác động thật với BizOn?** Điểm và xếp hạng của lớp, dữ liệu sinh viên, chèn mã trên trang công khai, phá buổi học.
3. **Gốc lỗi nằm trong kho BizOn?** Lỗi của nền tảng (Supabase, GitHub Pages, trình duyệt) thì ghi «ngoài phạm vi» và nói
   cần báo ai; không xếp vào mức của BizOn.
4. **Có cần quyền mà kẻ xấu không có?** Giảng viên chủ lớp làm được việc với chính lớp mình là đúng thiết kế, không phải lỗi;
   sinh viên hay giảng viên khác làm được việc chỉ chủ lớp được làm mới là lỗi.
5. **Đã biết hay cố ý?** Khóa publishable của Supabase công khai; chơi ngoại tuyến sửa được localStorage máy mình; những điều
   đã ghi trong `docs/` hay đặc tả. Có thì bỏ, trừ khi tác động lan ra người khác.
6. **Chứng minh vượt «về lý thuyết»?** RLS: thấy dòng của lớp khác thật trên Postgres cục bộ (vai authenticated khác chủ lớp),
   không chỉ mã 200. Chèn mã: thấy mã chạy trên máy người khác (Màn hình lớp học, trang giảng viên), không chỉ trên máy mình.
7. **Có nằm trong danh sách «một mình chưa thành lỗi» dưới đây** mà chưa có chuỗi đi kèm?

*Bẫy thứ tự lớp kiểm:* phản hồi lỗi «dữ liệu sai dạng» (400, lỗi kiểu dữ liệu) **không** chứng minh đã vượt qua xác thực.
Thử lại với yêu cầu hợp lệ tối thiểu rồi mới kết luận. Với Supabase (PostgREST): RLS lọc hết thì trả `[]` với mã 200, đó là RLS
đang làm việc, không phải lỗi; lỗi thật là khi `[]` lại có dòng của lớp khác.

**Một mình chưa thành lỗi, cần chuỗi mới nâng mức:**

| Phát hiện riêng lẻ | Mức khi đứng một mình | Chuỗi cần chứng minh | Mức khi có chuỗi |
|---|---|---|---|
| Thiếu CSP, HSTS, tiêu đề an ninh | LOW (gia cố) | + một lỗi chèn mã chạy được mà CSP lẽ ra chặn | theo lỗi chèn mã |
| Chuyển hướng mở (tham số nhận URL ngoài) | LOW | + dùng làm địa chỉ quay về sau đăng nhập Supabase, lấy được phiên | HIGH |
| Tự chèn mã (chỉ chạy trên máy mình, ví dụ tên đội trong localStorage) | LOW | + chuỗi đó lên Supabase rồi hiện ở Màn hình lớp học hay trang giảng viên | HIGH / CRITICAL |
| Bấm lừa (clickjacking) trang không có thao tác nhạy cảm | bỏ | + trang có nút xoá lớp, xuất điểm, đổi chủ lớp | MEDIUM |
| Sửa điểm trong localStorage | MEDIUM nếu chỉ máy mình | + máy chủ nhận nguyên điểm đó vào xếp hạng lớp | HIGH |
| Lộ phiên bản thư viện | bỏ | + phiên bản có lỗ hổng công bố khai thác được trên trang | theo lỗ hổng |
| CORS `*` trên tệp tĩnh | bỏ | (tệp tĩnh công khai, không mang phiên) | — |

## 3. Mức độ

- **CRITICAL**: lộ secret máy chủ, đọc/ghi dữ liệu lớp khác không cần quyền, chèn mã chạy được trên trang công khai.
- **HIGH**: sửa điểm hay xếp hạng trên máy chủ từ trình duyệt, lộ dữ liệu cá nhân sinh viên, RLS tắt ở bảng có dữ liệu thật.
- **MEDIUM**: gian lận chỉ ảnh hưởng máy mình, lộ thông tin ít nhạy cảm, thiếu kiểm đầu vào có tác động hẹp.
- **LOW**: gia cố thêm, chưa có cách khai thác trực tiếp.

Không hạ mức vì «chỉ là game học tập». Chỉ ghi phát hiện đã qua cổng 7 câu. Mỗi phát hiện: mã `SEC-NNN`, nhóm, `tệp:dòng`, mô tả, cách khai thác, cách sửa, công sức.

## 4. Kết luận

- **DỪNG LẠI** nếu còn CRITICAL hoặc HIGH. **ĐƯỢC, CÓ ĐIỀU KIỆN** nếu chỉ còn MEDIUM/LOW. **ĐƯỢC** khi mọi nhóm đã rà và không có phát hiện.
- **CHƯA ĐÁNH GIÁ** khi còn nhóm «CHƯA RÀ» — không bao giờ ghi ĐƯỢC trong trường hợp này.

Báo cáo trả lời trong trò chuyện; chị muốn lưu thì ghi vào `docs/an-ninh/ra-soat-YYYY-MM-DD.md` (hỏi trước khi ghi tệp).
Lỗi cần sửa CSDL thì làm migration mới trong `supabase/migrations/` + smoke SQL; chị tự áp bằng workflow (gõ APPLY).
