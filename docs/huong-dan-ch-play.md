# Hướng dẫn đưa BizOn lên Google Play (CH Play)

> BizOn được đóng gói theo hướng **Trusted Web Activity (TWA)** bằng Bubblewrap — dùng chính PWA đang chạy tại
> https://thuyhuongctu.github.io/BizOn/ , không viết lại ứng dụng Android.

## Chi phí

| Khoản | Chi phí |
|---|---|
| Tài khoản Google Play Console | **25 USD một lần** (~650–700 nghìn ₫) |
| GitHub Pages, Bubblewrap, workflow build | Miễn phí |
| Phí hằng năm / phí theo lượt tải (app miễn phí) | Không có |

## Những gì đã có sẵn trong repo

- ✅ `chinh-sach.html` — Chính sách quyền riêng tư song ngữ Việt–Anh, URL công khai:
  `https://thuyhuongctu.github.io/BizOn/chinh-sach.html`
- ✅ `manifest.webmanifest` — mở `index.html` (cổng hệ sinh thái), icon 192/512 + maskable
- ✅ `android/twa-manifest.json` — cấu hình Bubblewrap: package `io.github.thuyhuongctu.bizon`
- ✅ `.github/workflows/android-build.yml` — build `.aab` tự động (chạy tay, cần 4 secret)
- ✅ `docs/assetlinks-template.json` — mẫu tệp xác minh Digital Asset Links
- ✅ Service worker + chế độ ngoại tuyến

## Các bước cô cần tự làm (không thể ủy quyền)

1. **Đăng ký Google Play Console** — trả 25 USD, xác minh danh tính + một điện thoại Android thật.
   https://play.google.com/console/signup
2. **Tạo khóa ký cục bộ** (một lần, giữ tuyệt mật, KHÔNG commit vào repo):
   ```bash
   keytool -genkeypair -v -keystore android.keystore -alias bizon -keyalg RSA -keysize 2048 -validity 10000
   base64 -w0 android.keystore
   ```
   Dán chuỗi base64 vào secret `KEYSTORE_BASE64` của repo (Settings → Secrets and variables → Actions),
   kèm `KEYSTORE_PASSWORD`, `KEY_ALIAS` (= `bizon`), `KEY_PASSWORD`.
3. **Chạy workflow «Build Android (.aab)»** trong tab Actions → tải artifact `bizon-aab`.
4. **Tệp assetlinks.json**: vì BizOn nằm ở đường dẫn con `/BizOn/`, Android tìm tệp xác minh tại
   `https://thuyhuongctu.github.io/.well-known/assetlinks.json` (kho **trang gốc** `thuyhuongctu.github.io`,
   không phải trong repo BizOn). Cần:
   - Tạo repo `thuyhuongctu.github.io` (nếu chưa có) với thư mục `.well-known/assetlinks.json`
     theo mẫu `docs/assetlinks-template.json`;
   - Điền SHA-256 lấy từ Play Console → Setup → App signing (nên bật **Play App Signing** để Google giữ khóa phát hành);
     nếu bật Play App Signing thì fingerprint dùng là **App signing key certificate** của Google, không phải khóa upload.
5. **Điền hồ sơ Play Console** — dùng nội dung soạn sẵn ở phần dưới.
6. **Kiểm thử kín**: tài khoản cá nhân mới cần **≥ 12 người thử nghiệm liên tục 14 ngày** trước khi
   xin phát hành chính thức (lớp sinh viên của cô là nguồn tester lý tưởng).
   💡 Tận dụng luôn đợt này làm pilot đo hiệu quả học tập bằng bộ phiếu khảo sát trước–sau:
   https://thuyhuongctu.github.io/BizOn/khao-sat.html
7. Gửi xét duyệt.

Lưu ý: từ **31/8/2026** app mới phải nhắm **Android 16 / API 36** — Bubblewrap bản mới sẽ nhắm SDK mới nhất;
khi build kiểm tra lại `targetSdkVersion` trong log.

## Nội dung hồ sơ CH Play (soạn sẵn)

- **Tên ứng dụng** (≤30 ký tự): `BizOn Bật Nghiệp`
- **Mô tả ngắn** (≤80 ký tự): `Hệ sinh thái game mô phỏng kinh doanh & khởi nghiệp Việt Nam — học mà chơi`
- **Mô tả đầy đủ**:

  > BizOn Bật Nghiệp là hệ sinh thái game mô phỏng kinh doanh và khởi nghiệp dành cho sinh viên và lớp học kinh tế.
  >
  > 🎮 BẬT NGHIỆP — điều hành xưởng linh vật đất sét Việt qua 6 vòng kinh doanh trên bản đồ Việt Nam: định giá, marketing, sản xuất, R&D, nhân sự, tài chính. Đội 3–5 người với 5 vai trò CEO · CFO · CMO · COO · Thư ký pháp chế; mỗi ván ≈ 30–45 phút — vừa một buổi học.
  >
  > 🌏 BIZON GO GLOBAL — đưa sản phẩm Việt ra 7 thị trường thế giới: chọn phương thức thâm nhập (Xuất khẩu · Licensing · Liên doanh · FDI), đàm phán với đối tác AI, quản trị ESG, xuất nhật ký quyết định CSV cho giảng viên.
  >
  > 🕹️ BIZON ARCADE — các mini-game phản xạ kinh doanh.
  >
  > 🤖 Cố vấn AI Lumina đồng hành từng vòng: cuộc họp đội, dự báo thị phần trực tiếp, giải thích «Vì sao?», mô phỏng Nếu–Thì và sổ tay thuật ngữ.
  >
  > ✅ Miễn phí, không quảng cáo, không thu thập dữ liệu, chơi được ngoại tuyến. Phong cách 3D claymorphism độc quyền cùng kho nhạc gốc đa ngôn ngữ.
  >
  > Sản phẩm giáo dục của nhóm BizOn — Đỗ Thùy Hương & Phan Anh Tú.

- **Danh mục**: Giáo dục (hoặc Mô phỏng)
- **URL chính sách quyền riêng tư**: `https://thuyhuongctu.github.io/BizOn/chinh-sach.html`
- **Email liên hệ**: thuyhuongctu@gmail.com

### Khai Data Safety (An toàn dữ liệu)

| Câu hỏi | Trả lời |
|---|---|
| Ứng dụng có thu thập dữ liệu người dùng? | **Không** |
| Ứng dụng có chia sẻ dữ liệu với bên thứ ba? | **Không** |
| Dữ liệu có được mã hóa khi truyền? | Ứng dụng chỉ tải tài nguyên tĩnh qua HTTPS |
| Người dùng có thể yêu cầu xóa dữ liệu? | Dữ liệu chỉ nằm trên thiết bị; xóa bằng cách xóa dữ liệu ứng dụng |

### Phân loại nội dung
Trò chơi giáo dục, không bạo lực, không cờ bạc, không nội dung người lớn, không quảng cáo,
không mua trong ứng dụng, không tương tác giữa người dùng → thường được xếp **Mọi lứa tuổi / PEGI 3**.

### Bộ ảnh hồ sơ — ĐÃ CHUẨN BỊ SẴN trong `docs/ch-play-assets/`
- Icon 512×512: `assets/icons/icon-512.png` ✅
- Feature graphic 1024×500: `docs/ch-play-assets/feature-graphic-1024x500.png` ✅
- 6 ảnh màn hình điện thoại 1079×2397 (9:16, đạt chuẩn ≥1080px): trang chủ, đăng nhập,
  trung tâm điều hành, quyết định + cuộc họp đội, GO GlObal, Kho Âm nhạc ✅
- Khi phát hành bản mới chỉ cần chụp lại các màn thay đổi

## Thứ tự khuyến nghị

1. **BizOn Android v1** (tài liệu này) — mọi thứ kỹ thuật đã sẵn trong repo.
2. **M-AIDA** để sau: cần backend production (PostgreSQL, tài khoản, HTTPS) trước khi đóng gói,
   nếu không CH Play chỉ nhận được bản giới thiệu tĩnh.
