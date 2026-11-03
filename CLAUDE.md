# BizOn – hướng dẫn cho Claude Code

Trang tĩnh bizonland.com: trò chơi mô phỏng học kinh doanh quốc tế (Cần Thơ). Không có bước build; `package.json` chỉ để chạy test. Chủ kho: Đỗ Thùy Hương (thuyhuongctu) và Phan Anh Tú.

## Giao tiếp
- Trả lời bằng **tiếng Việt**, xưng «em», gọi chủ kho là «chị». Ngắn gọn, nói rõ việc đã làm và việc còn chờ chị.
- Không dán mật khẩu, khóa hay secret vào trò chuyện, commit hoặc PR.

## Tác giả và commit
- Tác giả commit **chỉ** là thuyhuongctu:
  `git -c user.name=thuyhuongctu -c user.email=thuyhuongctu@gmail.com commit …`
- **Không** thêm Claude làm tác giả hay đồng tác giả; không ghi tên hay mã mô hình AI trong commit, PR, chú thích mã.
- Khi squash-merge, thông điệp commit kết thúc bằng dòng:
  `Co-authored-by: Phan Anh Tú <patu@ctu.edu.vn>`
- Không commit rỗng, không force-push, không `reset --hard` khi chưa được chị cho phép.

## Nhánh, PR và gộp
- Mỗi việc một nhánh riêng, mở **PR nháp**. Tiêu đề và mô tả PR bằng tiếng Việt.
- **Chỉ gộp khi chị nói «Gộp».** Trước khi gộp: CI xanh, không xung đột; bỏ chế độ nháp; squash-merge với `expectedHeadSha`.
- Gộp nhiều PR liền nhau: đưa main mới vào từng nhánh trước, lấy số phiên bản sw.js lớn nhất + 1.
- Sau khi gộp: xóa nhánh cục bộ, cập nhật main. (Xóa nhánh trên GitHub từ phiên đám mây thường bị lỗi «remote end hung up»: nhờ chị bấm «Delete branch».)

## Quy ước mã
- **sw.js:** mỗi PR tăng `CACHE` (`bizon-vNNN`) thêm 1. Test kiểm tra phiên bản bằng `>=`, không bằng `===`, để PR sau không làm hỏng test cũ.
- **index.html phải giống hệt academia3d-v2.html** (từng byte). Sửa một tệp thì chép sang tệp kia.
- **Không ghi đè ảnh, video gốc.** Ảnh hay video sửa lại thì lưu tệp mới (thêm hậu tố `-v2`, `-v3`…) rồi đổi đường dẫn.
- **html-validate phải 0 lỗi:** `npx --yes html-validate@8.24.1 <tệp>`. Trang x-dc/bundler không sửa được thì tắt luật bằng chỉ thị có lý do: `<!-- [html-validate-disable rule: lý do] -->`.
- Nút không nằm trong form có `type="button"`; `th` có `scope`; không đặt thẻ khối (`div`, `p`) trong `button`.
- Trang trong sitemap.xml phải có `<link rel="canonical">`. Không để trang tràn ngang ở bề rộng 360–390 px.
- Các trang Hộ Chiếu Sầu Riêng (`lab/ho-chieu-sau-rieng*.html`) dùng chung engine và dữ liệu (`lab/ho-chieu-sau-rieng-engine.js`, `-data.js`, `-core.js`); sửa một bản thì kiểm tra cả bản 2D, v2 và 3D.

## Kiểm thử
- Toàn bộ: `npm test` (tức `node scripts/run-tests.mjs`). Một phần: `node scripts/run-tests.mjs <một phần tên tệp>`.
- Script tự bật máy chủ tĩnh ở 127.0.0.1:8899 cho các test trình duyệt (Playwright).
- Trên máy đám mây của Claude Code cần:
  `NODE_PATH=/opt/node22/lib/node_modules:/opt/node-tools/node_modules node scripts/run-tests.mjs`
- Mỗi tính năng hay lỗi đã sửa có test trong `test/*.test.js` để không quay lại.
- Tắt tiến trình theo PID (tìm bằng `ss -ltnp`), không dùng `pkill -f`.
- Không tắt kiểm tra TLS; dùng chứng chỉ của proxy nếu cần.

## Supabase
- Dự án production: ref `ceytblfelodpnudomccn` (Tokyo).
- **Không thay đổi cơ sở dữ liệu thật khi chưa hỏi chị.** Migration mới đặt trong `supabase/migrations/`, kiểm thử trên Postgres cục bộ; chị tự áp bằng workflow «Supabase – áp migration lên production» (chạy tay, phải gõ APPLY).
- Sao lưu tự động mỗi ngày: `.github/workflows/supabase-backup.yml`, hướng dẫn khôi phục ở `docs/sao-luu-supabase.md`.

## Các kho khác của chị
- Local-Specialty-Brand-Lab: cùng quy tắc tác giả, có dòng `Co-authored-by` của thầy Tú khi gộp.
- CHAM và Je-mappelle-Huong: tác giả chỉ thuyhuongctu, **không** có dòng `Co-authored-by` của thầy Tú.
