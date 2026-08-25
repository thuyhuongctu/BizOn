# BizOn Web–App–Mobile Foundation

## 1. Mục tiêu

Tách ba bề mặt triển khai nhưng dùng chung một URL và lõi sản phẩm:

1. **Marketing website** tại `/`.
2. **Simulation web app/PWA** tại `/app/`.
3. **Android app** đóng gói `/app/` bằng Trusted Web Activity sau khi đạt release gate.

PR này chỉ tạo app shell preview; chưa thay homepage, game engine hoặc backend.

## 2. Trạng thái trước PR

- Manifest production mở `./index.html`, tức landing page thay vì application workspace.
- Service worker gốc precache nhiều trang và media, bao gồm tệp âm thanh lớn.
- Marketing, game và tài nguyên offline dùng chung một cache boundary.
- Android/TWA cần một app URL ổn định và Digital Asset Links hợp lệ.

## 3. Kiến trúc

```text
/
  index.html                 Marketing website
/app/
  index.html                 Application shell
  manifest.webmanifest       App-specific manifest
  sw.js                      Service worker scope /app/
  offline.html               Navigation fallback
/css/app-shell.css           Shared shell visual system
/js/app-shell/app-shell.js   Install/network/theme controller
/.well-known/
  assetlinks.template.json   Android verification template only
```

## 4. Routing tạm thời

App shell liên kết tới các module production hiện có:

- Startup Lab → `/game.html`
- AIBIS → `/global.html`
- Classroom → `/lop-hoc.html`
- Instructor Studio → `/giang-vien.html`

Giai đoạn sau mới chuyển các module vào `/app/routes/` hoặc router nội bộ.

## 5. PWA strategy

Service worker `/app/sw.js` có scope `/app/`, tránh xung đột với service worker gốc. App shell chỉ precache tài nguyên tối thiểu, không precache audio/video hoặc toàn bộ website.

Navigation: network-first, sau đó cache chính xác, cuối cùng `offline.html`.
Static assets: cache-first sau lần truy cập đầu tiên.

## 6. Android strategy

Mục tiêu Android là Trusted Web Activity vì web app và app cùng một đội phát triển, cùng domain và cùng nội dung. Trước khi build release cần:

1. Chốt application ID, đề xuất `vn.bizon.simulation`.
2. Tạo Android/TWA project bằng Bubblewrap hoặc android-browser-helper.
3. Lấy SHA-256 từ Play App Signing.
4. Thay placeholder trong `assetlinks.template.json`.
5. Chỉ khi fingerprint chính xác mới publish thành `/.well-known/assetlinks.json`.
6. Kiểm tra deep link `/BizOn/app/`, `/BizOn/game.html`, `/BizOn/global.html`.

Không publish file template với fingerprint giả như file production.

## 7. Release gates

### PWA preview
- `/app/` chạy độc lập.
- Manifest parse hợp lệ.
- Service worker không kiểm soát `/`.
- Offline fallback hoạt động.
- Responsive 360–1920 px.

### Internal alpha
- Core v2 selectors thay dữ liệu mock.
- Save/resume hoạt động.
- Không có lỗi nghiêm trọng khi offline/online chuyển đổi.

### Android internal testing
- Digital Asset Links verified.
- TWA fullscreen, không hiện URL bar.
- Back navigation và deep links đúng.
- Play Console internal test pass.
- Privacy policy, Data safety và content rating hoàn chỉnh.

## 8. Không thuộc phạm vi PR

- Không thay `manifest.webmanifest` production.
- Không thay `sw.js` production.
- Không tạo APK/AAB.
- Không publish `assetlinks.json` thật.
- Không thay game state, scoring hoặc Supabase.
