# BizOn Android TWA

## Trạng thái đã xác minh — 02/08/2026

PWA công khai:

`https://thuyhuongctu.github.io/BizOn/app/`

AIBIS workspace:

`https://thuyhuongctu.github.io/BizOn/app/aibis.html`

Digital Asset Links tại root origin:

`https://thuyhuongctu.github.io/.well-known/assetlinks.json`

Các endpoint trên đã được GitHub Actions kiểm tra thành công. Debug APK đã build, ký, xuất checksum và có fingerprint khớp với Digital Asset Links công khai.

- Application ID: `vn.bizon.simulation`
- Min SDK: 23
- Target/compile SDK: 35
- JDK: 17
- Gradle: 8.9
- Android Gradle Plugin: 8.7.3
- TWA library: `com.google.androidbrowserhelper:androidbrowserhelper:2.2.0`
- Debug APK SHA-256: `e6e25680b7a128cb9e832ec3a87990be3b267c3c4ba6bf731a46890638886ac2`
- Debug signing SHA-256: `90:1F:4E:09:2B:15:A9:3A:77:F7:A0:A0:AD:9E:5A:1D:5C:06:3B:ED:3A:D7:69:1A:05:13:AE:9D:8B:80:AD:06`

## Build cục bộ

Cần Android SDK 35, JDK 17 và Gradle 8.9:

```bash
gradle -p android :app:assembleDebug
```

APK được tạo tại:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Workflow `Android TWA Build` tự động:

1. kiểm tra contract Web/PWA/TWA;
2. xác minh URL PWA công khai;
3. build debug APK;
4. đọc SHA-256 từ chứng thư ký của APK;
5. tạo `assetlinks-debug.json`;
6. xuất APK, checksum, fingerprint và asset links thành artifact.

## Cài APK debug

1. tải `BizOn-debug.apk` từ artifact hoặc gói bàn giao;
2. mở tệp trên thiết bị Android;
3. cho phép cài ứng dụng từ nguồn này nếu Android yêu cầu;
4. mở BizOn và kiểm tra Startup Lab, AIBIS, Classroom, Instructor và Privacy Policy;
5. dùng Chrome hoặc một trình duyệt hỗ trợ Trusted Web Activity để có trải nghiệm toàn màn hình.

Đây là bản internal/debug, không phải bản Google Play production.

## Digital Asset Links

Root user-site `thuyhuongctu/thuyhuongctu.github.io` hiện có:

- `.nojekyll`, để GitHub Pages không loại thư mục `.well-known`;
- `.well-known/assetlinks.json`, chứa fingerprint thật của APK debug hiện tại;
- workflow kiểm tra endpoint công khai, package và fingerprint.

Do đó blocker root-origin trước đây đã được đóng cho APK debug này.

Khi tạo ứng dụng trên Google Play, cần **thêm** Play App Signing SHA-256 thật vào mảng `sha256_cert_fingerprints`. Không thay bằng placeholder và không giả định debug fingerprint là release fingerprint.

## Release signing và Google Play

Release còn cần:

1. tạo ứng dụng trong Play Console với package `vn.bizon.simulation`;
2. bật Play App Signing;
3. lấy Play App Signing SHA-256 và bổ sung vào root `assetlinks.json`;
4. cấu hình upload/release key trong môi trường kiểm soát;
5. build và ký AAB có khả năng cập nhật lâu dài;
6. tải AAB lên internal testing;
7. kiểm tra App Links/TWA trên thiết bị thật;
8. hoàn tất Privacy Policy, Data Safety, content rating, target audience và store listing.

Không commit release keystore, password hoặc secret vào repository.

## Ranh giới dữ liệu

Android shell chỉ khai báo quyền Internet. Nội dung, save và offline behavior thuộc PWA. Privacy Policy phân biệt local-only mặc định với optional classroom submission. Brand Passport Learning Pilot vẫn giữ remote submission tắt cho đến khi governance và staging được phê duyệt.
