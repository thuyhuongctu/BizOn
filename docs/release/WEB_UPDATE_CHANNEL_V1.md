# BizOn Web Update Channel V1

## Mục tiêu

Cho phép BizOn cập nhật giao diện, nội dung và logic web sau khi ứng dụng đã được phát hành trên Google Play mà không buộc phải tạo Android App Bundle mới cho mọi thay đổi.

## Kiến trúc

BizOn Android sử dụng Trusted Web Activity để mở Web/PWA tại:

`https://thuyhuongctu.github.io/BizOn/app/release.html`

Kênh cập nhật web gồm:

- `app/version.json`: phiên bản web công khai, luôn được kiểm tra không qua cache;
- `js/app-shell/update-manager.js`: so sánh build hiện tại với build công khai;
- `app/sw.js`: service worker dùng network-first cho điều hướng và version manifest, stale-while-revalidate cho tài sản tĩnh;
- thông báo cập nhật trên `app/release.html`;
- CI contract để ngăn version manifest, HTML và cache version lệch nhau.

## Hành vi người dùng

1. Ứng dụng kiểm tra phiên bản khi mở, khi trở lại foreground, khi có mạng và định kỳ sáu giờ.
2. Nếu build công khai mới hơn build trong HTML đang chạy, ứng dụng hiển thị thông báo.
3. Người dùng chọn **Cập nhật ngay** hoặc **Để sau**.
4. Cập nhật chỉ làm mới Web/PWA và cache, không tự xóa dữ liệu localStorage, IndexedDB hoặc Decision Trace.
5. Không tự động tải lại khi người dùng đang nhập dữ liệu.

## Quy trình phát hành thay đổi web

1. Tạo branch và sửa HTML/CSS/JavaScript.
2. Tăng `build_id` trong `app/version.json` theo dạng `YYYY.MM.DD.N`.
3. Cập nhật cùng giá trị trong `data-bizon-build` của `app/release.html`.
4. Cập nhật `summary` và `changes` bằng nội dung ngắn, đúng chức năng thực tế.
5. Khi thay đổi app shell hoặc tài sản đã precache, tăng `CACHE_NAME` trong `app/sw.js`.
6. Chạy Web/PWA tests và visual QA trên điện thoại.
7. Merge vào `main`; GitHub Pages phát hành web mới.

## Khi nào không cần AAB mới

- thay màu sắc, bố cục, nội dung;
- sửa câu hỏi, tình huống hoặc dữ liệu mô phỏng;
- cập nhật JavaScript của mô-đun web;
- thêm trang hoặc mô-đun trong phạm vi URL hiện tại;
- sửa Privacy Policy và nội dung hỗ trợ;
- cập nhật service worker/PWA.

## Khi nào cần AAB mới

- thay package name, Android application label hoặc icon launcher;
- thay Android manifest, quyền ứng dụng, SDK hoặc thư viện native;
- thay start URL hoặc domain TWA;
- thêm native billing, notification, camera, microphone hoặc deep-link behavior;
- thay version Android gửi lên Google Play.

## Guardrails

- Không dùng web update để thay đổi bản chất ứng dụng mà không cập nhật Store Listing/App Content.
- Khi thêm luồng thu thập dữ liệu, phải cập nhật Privacy Policy và Data Safety trước khi phát hành.
- `force_refresh` mặc định là `false`; chỉ dùng khi có lỗi nghiêm trọng và đã đánh giá nguy cơ mất dữ liệu chưa lưu.
- Không lưu secret, token hoặc cấu hình quản trị trong `version.json`.
- Không giảm `build_id` hoặc tái sử dụng build đã phát hành.

## Versioning

- Android release: Semantic Versioning, ví dụ `1.0.0`, version code tăng đơn điệu.
- Web release: `build_id` dạng `YYYY.MM.DD.N`.
- Thay đổi web không làm tăng Android version code trừ khi đồng thời phát hành AAB mới.
