# BizOn PWA & App Foundation

## Mục tiêu

Một codebase web phục vụ ba hình thức phân phối:

1. Website/PWA trên GitHub Pages hoặc hosting riêng.
2. Ứng dụng cài từ trình duyệt.
3. Android Trusted Web Activity (TWA) cho Google Play.

## Kiến trúc

```text
Marketing website
        |
Application shell
        |
Simulation Core v2
        |
Persistence / Backend adapters
        |
PWA service worker
        |
Web install / Android TWA
```

## Quyết định kỹ thuật

- Không duy trì một codebase Android riêng trong Commercial Pilot v1.
- App shell là mobile-first và có bottom navigation.
- Service worker chỉ precache app shell nhỏ; ảnh, JS/CSS và media dùng runtime cache có giới hạn.
- Audio/video lớn không nằm trong install cache.
- Navigation dùng network-first và fallback về `offline.html`.
- PWA manager xử lý install prompt, update-ready và controller lifecycle.
- GameState không thuộc UI shell; shell chỉ hiển thị view-model/selector ở PR tích hợp sau.

## Android TWA path

### Điều kiện trước khi đóng gói

- HTTPS ổn định.
- Manifest đạt installability.
- Service worker không có lỗi install.
- Có `/.well-known/assetlinks.json` chứa SHA-256 fingerprint của signing key.
- Package name, signing key và Play Console owner được chốt.
- Chính sách quyền riêng tư, data safety và support URL đã công khai.

### Cấu trúc dự kiến

```text
android/
├── app/
├── build.gradle
├── settings.gradle
├── twa-manifest.json
└── README.md

.well-known/
└── assetlinks.json
```

Không tạo fingerprint giả trong repository. `assetlinks.json` chỉ được phát hành sau khi signing key chính thức tồn tại.

## Cache policy

| Request | Strategy | Cache |
|---|---|---|
| HTML navigation | Network first | pages |
| JS/CSS/font | Stale while revalidate | assets |
| Images | Stale while revalidate | assets |
| Audio/video | Cache first on demand | media |
| Range request | Browser/network | none |

## Release gates

### PWA Preview

- Manifest parse thành công.
- App shell responsive ở 360, 768, 1366 px.
- Offline page hoạt động.
- Install prompt chỉ xuất hiện khi browser cho phép.
- Update lifecycle có thể kiểm thử.

### Android Internal Test

- Lighthouse PWA không có lỗi nghiêm trọng.
- Digital Asset Links xác minh thành công.
- Back button, deep links, file download và external links hoạt động.
- Không có browser chrome trong TWA verified mode.
- Data Safety phản ánh đúng telemetry/consent.

### Google Play Closed Test

- Crash-free sessions >= 99%.
- Startup <= 3 giây trên thiết bị Android tầm trung.
- Mobile completion >= 90%.
- Save/resume >= 95%.
- Privacy, support và account/data-deletion flow được kiểm tra.

## Không thuộc phạm vi PR này

- Không tạo APK/AAB.
- Không tạo signing key.
- Không tạo fingerprint hoặc assetlinks giả.
- Không nối shell với GameState production.
- Không thay homepage production.
- Không thêm billing, push notification hoặc background sync.
