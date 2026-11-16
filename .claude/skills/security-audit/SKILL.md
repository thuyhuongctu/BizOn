---
name: security-audit
description: "Rà an ninh BizOn trước một lớp học hay một đợt phát hành: sửa điểm và ván lưu (localStorage), gọi RPC Supabase vượt quyền, RLS hở, lộ dữ liệu sinh viên, chèn mã (innerHTML), khóa hay secret lọt vào kho. Chỉ rà và báo cáo theo mức độ; sửa thì mở nhánh riêng khi chị đồng ý."
argument-hint: "[full | supabase | client | du-lieu | quick]"
user-invocable: true
---

<!-- Phỏng theo skill security-audit của «Claude Code Game Studios» (Donchitos, giấy phép MIT – xem THIRD-PARTY-NOTICES.md mục 6),
     Việt hóa và viết lại cho trang tĩnh BizOn + Supabase (không Godot/Unity/Unreal, không chế độ nhiều người chơi thời gian thực). -->

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
- `postMessage` có kiểm `origin`; liên kết ngoài có `rel="noopener"`.

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

## 3. Mức độ

- **CRITICAL**: lộ secret máy chủ, đọc/ghi dữ liệu lớp khác không cần quyền, chèn mã chạy được trên trang công khai.
- **HIGH**: sửa điểm hay xếp hạng trên máy chủ từ trình duyệt, lộ dữ liệu cá nhân sinh viên, RLS tắt ở bảng có dữ liệu thật.
- **MEDIUM**: gian lận chỉ ảnh hưởng máy mình, lộ thông tin ít nhạy cảm, thiếu kiểm đầu vào có tác động hẹp.
- **LOW**: gia cố thêm, chưa có cách khai thác trực tiếp.

Không hạ mức vì «chỉ là game học tập». Mỗi phát hiện: mã `SEC-NNN`, nhóm, `tệp:dòng`, mô tả, cách khai thác, cách sửa, công sức.

## 4. Kết luận

- **DỪNG LẠI** nếu còn CRITICAL hoặc HIGH. **ĐƯỢC, CÓ ĐIỀU KIỆN** nếu chỉ còn MEDIUM/LOW. **ĐƯỢC** khi mọi nhóm đã rà và không có phát hiện.
- **CHƯA ĐÁNH GIÁ** khi còn nhóm «CHƯA RÀ» — không bao giờ ghi ĐƯỢC trong trường hợp này.

Báo cáo trả lời trong trò chuyện; chị muốn lưu thì ghi vào `docs/an-ninh/ra-soat-YYYY-MM-DD.md` (hỏi trước khi ghi tệp).
Lỗi cần sửa CSDL thì làm migration mới trong `supabase/migrations/` + smoke SQL; chị tự áp bằng workflow (gõ APPLY).
