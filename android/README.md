# BizOn Android TWA

## Trạng thái

Dự án này đóng gói PWA tại:

`https://thuyhuongctu.github.io/BizOn/app/`

thành ứng dụng Android dùng Trusted Web Activity.

- Application ID: `vn.bizon.simulation`
- Min SDK: 23
- Target/compile SDK: 35
- JDK: 17
- Gradle: 8.9
- Android Gradle Plugin: 8.7.3
- TWA library: `com.google.androidbrowserhelper:androidbrowserhelper:2.2.0`

## Build cục bộ

Cần Android SDK 35, JDK 17 và Gradle 8.9:

```bash
gradle -p android :app:assembleDebug
```

APK được tạo tại:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

GitHub Actions workflow `Android TWA Build` tự động:

1. kiểm tra contract web/TWA;
2. xác minh URL PWA công khai;
3. build debug APK;
4. tạo `assetlinks-debug.json` từ debug certificate;
5. tải APK, SHA-256 checksum và debug asset links thành artifact.

## Digital Asset Links

TWA chỉ chạy toàn màn hình khi origin xác minh ứng dụng bằng:

```text
https://thuyhuongctu.github.io/.well-known/assetlinks.json
```

GitHub Pages project hiện đặt BizOn dưới `/BizOn/`. File trong repo này sẽ được phục vụ ở `/BizOn/.well-known/`, không đáp ứng vị trí gốc origin mà Digital Asset Links yêu cầu.

Trước Play internal testing phải chọn một trong hai phương án:

1. quản lý user-site `thuyhuongctu.github.io` để xuất file tại root; hoặc
2. dùng custom domain do dự án kiểm soát và phục vụ `/.well-known/assetlinks.json` tại domain đó.

Không đổi `.well-known/assetlinks.template.json` thành file production khi chưa có Play App Signing SHA-256 thật.

## Debug và release signing

Debug APK dùng debug keystore do Android Gradle Plugin tạo. Fingerprint này chỉ phục vụ kiểm thử nội bộ và không được dùng cho Play release.

Release cần:

1. tạo ứng dụng trong Play Console với package `vn.bizon.simulation`;
2. bật Play App Signing;
3. lấy SHA-256 certificate fingerprint từ Play Console;
4. tạo `assetlinks.json` thật tại root origin;
5. xác minh App Links/TWA không còn hiện thanh URL;
6. cấu hình signing secrets trong GitHub hoặc build AAB tại môi trường kiểm soát;
7. hoàn tất Privacy Policy, Data safety, content rating và internal testing.

Không commit keystore, password hoặc fingerprint giả vào repository.

## Ranh giới dữ liệu

Android shell không đọc cookies, localStorage hoặc dữ liệu mô phỏng. Nội dung, save và offline behavior thuộc PWA. Brand Passport Learning Pilot vẫn giữ remote submission tắt cho đến khi governance và staging được phê duyệt.
