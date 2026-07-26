# BizOn Bật Nghiệp — Business Simulation Game

> **Game mô phỏng kinh doanh EdTech phong cách 3D Claymorphism** — các đội sinh viên điều hành doanh nghiệp ảo qua **6 vòng chơi** trên bản đồ Việt Nam, cùng cố vấn AI **Lumina (Je m'appelle Hương)**, và vươn ra thị trường quốc tế với **BizOn Global**.

![version](https://img.shields.io/badge/version-1.0-blue)
![license](https://img.shields.io/badge/license-Proprietary%20·%20All%20rights%20reserved-lightgrey)
![PWA](https://img.shields.io/badge/PWA-offline%20ready-5cc4e6)
![deploy](https://img.shields.io/badge/GitHub%20Pages-live-2ea44f)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21592242.svg)](https://doi.org/10.5281/zenodo.21592242)

| | |
|---|---|
| **Tác giả** | **Đỗ Thùy Hương** (Founder & Creative Lead) · **Phan Anh Tú** (Academic Advisor) |
| **Đơn vị** | Đại học Cần Thơ (CTU) |
| **Chơi ngay** | 🎮 [Game](https://thuyhuongctu.github.io/BizOn/) · 🌐 [Trang giới thiệu](https://thuyhuongctu.github.io/BizOn/gioi-thieu.html) · 🕹️ [Arcade](https://thuyhuongctu.github.io/BizOn/games.html) · 🌏 [BizOn Global](https://thuyhuongctu.github.io/BizOn/global.html) |
| **Liên hệ** | thuyhuongctu@gmail.com |
| **Lưu trữ & DOI** | Zenodo concept DOI: [10.5281/zenodo.21592242](https://doi.org/10.5281/zenodo.21592242) — mọi phiên bản phát hành được lưu trữ vĩnh viễn |

---

## 🗺️ Hệ sinh thái

| Trang | Nội dung |
|---|---|
| [`index.html`](https://thuyhuongctu.github.io/BizOn/) | **Game chính** — 6 vòng chinh phục bản đồ Việt Nam (Cần Thơ → Hà Nội), cắm cờ 🚩 khi thắng thị phần từng vòng; cột cờ Lũng Cú, quần đảo Hoàng Sa & Trường Sa trên bản đồ |
| [`gioi-thieu.html`](https://thuyhuongctu.github.io/BizOn/gioi-thieu.html) | Landing quốc tế: demo tương tác, 5 vai trò lãnh đạo, lộ trình 6 vòng, mini-game, tour guide AI, FAQ, khu giảng viên |
| [`games.html`](https://thuyhuongctu.github.io/BizOn/games.html) | **BizOn Arcade** — 8 trò chơi của hệ sinh thái |
| [`global.html`](https://thuyhuongctu.github.io/BizOn/global.html) | **BizOn Global** (thử nghiệm) — từ Việt Nam ra thế giới: chọn thị trường, phương thức thâm nhập (Export · Licensing · Liên doanh · Đầu tư mới FDI), World Market LIVE và **I–P Lab** dựa trên luận án |
| [`doi-ngu.html`](https://thuyhuongctu.github.io/BizOn/doi-ngu.html) | Đội ngũ sáng lập, sứ mệnh & tầm nhìn 2026 |

Toàn bộ trang hỗ trợ **chế độ Sáng/Tối**, **song ngữ Việt–Anh** và **nhạc nền** (2 ca khúc chủ đề «Bật Nghiệp», «Je m'appelle Hương and the World» — lời tại [`docs/loi-bai-hat.md`](docs/loi-bai-hat.md)).

## 🎮 Tính năng chính

| Nhóm | Nội dung |
|---|---|
| Vòng chơi | 6 vòng = 6 tỉnh/thành theo bản đồ mới; mỗi vòng một biến cố thị trường (Cơ Hội Vàng, Price War, Khủng hoảng năng lượng, Siết tín dụng, Việt Nam Hóa Rồng) |
| Quyết định | Giá bán · Marketing · R&D · Sản lượng · Nhân công & đào tạo · Nguồn vốn (tự có / vay 8,5%) · Kỳ hạn thanh toán 30/60/90 ngày · Bảo trì |
| Đối thủ AI | 🐺 Alpha Dynamics (giá rẻ) · 🐘 Mekong Ventures (cân bằng) · 🦚 Star Clay Co. (cao cấp) — hành vi **tất định theo seed đội**, tiện chấm điểm |
| Cố vấn Lumina AI | Kịch bản "Nếu — Thì", cảnh báo rủi ro theo vai trò, chat giọng nói tiếng Việt (STT/TTS), bộ não riêng cho CEO · CFO · CMO · COO · SEC |
| Báo cáo | P&L, dòng tiền 3 hoạt động, CVP hòa vốn, nhân sự, BMC, khấu hao, kiểm toán năng lượng ⚡ |
| Học mà chơi | Nhiệm vụ, thành tựu, cây kỹ năng, chứng nhận hoàn thành, nhật ký đội, Clay Reward Shop, mini-game |
| Giảng viên | Class ID, khóa/mở vòng, cấp vốn kèm nhật ký — tài liệu đầy đủ tại [`docs/huong-dan-giang-vien.md`](docs/huong-dan-giang-vien.md) |
| BizOn Monitor | Bảng theo dõi kiểu terminal: sparkline chỉ số đội + 3 đối thủ qua từng vòng |

## 🔬 Cơ sở khoa học

Chế độ **I–P Lab** (trang BizOn Global) mô phỏng quan hệ **quốc tế hóa – hiệu quả doanh nghiệp** theo chương trình nghiên cứu luận án tiến sĩ *"Internationalization and firm business performance in Asia"* (Đỗ Thùy Hương, ĐH Cần Thơ; người hướng dẫn: Phan Anh Tú) — dữ liệu WBES 92.564 doanh nghiệp, 50 nền kinh tế châu Á – Thái Bình Dương:

- Quan hệ **chữ U ngược** với điểm ngoặt ≈ **43,6% FSTS** (mẫu gộp);
- Thể chế mạnh (Singapore, Nhật Bản): gần tuyến tính; **"lá chắn số" DAI** tại Singapore;
- Đảo nhỏ Thái Bình Dương (SIDS): **FIP — Forced Internationalization Penalty** (β = −1,339, quan hệ âm đơn điệu).

> Luận án là công trình chưa công bố; các con số trong game là minh họa giáo dục từ kết quả nghiên cứu.

## 🚀 Chạy & triển khai

```bash
# chạy cục bộ (không cần cài đặt)
python3 -m http.server 8000   # rồi mở http://localhost:8000
```

- **Web:** workflow [`deploy-pages.yml`](.github/workflows/deploy-pages.yml) tự deploy lên GitHub Pages mỗi khi push `main`.
- **Mobile (PWA):** mở link trên điện thoại → "Thêm vào màn hình chính" — chạy toàn màn hình, chơi offline (service worker + manifest).
- Tiến trình chơi lưu trong `localStorage` của từng máy.

## 🧱 Cấu trúc mã nguồn

```
index.html            # Game SPA — toàn bộ màn hình + Tailwind config + PWA
gioi-thieu.html       # Landing page quốc tế
games.html            # BizOn Arcade (8 trò chơi)
global.html           # BizOn Global + World Market LIVE + I–P Lab
doi-ngu.html          # Trang đội ngũ sáng lập
js/engine.js          # Engine mô phỏng 6 vòng, biến cố, vật phẩm, kỹ năng
js/app.js             # UI game: render, điều hướng, bản đồ chinh phục, intro
js/site-ui.js         # Sáng/Tối + từ điển song ngữ Việt–Anh dùng chung
sw.js                 # Service worker — app shell, chơi offline
assets/character/     # Tạo hình 3D: Lumina Áo Dài, Lumina Vest Trắng, Phan Anh Tú
assets/audio/         # Nhạc: BizOn Theme, Bật Nghiệp, Hương and the World, giọng Hương
docs/                 # Hướng dẫn giảng viên, đề án V-Monitor, lời bài hát, hồ sơ SHTT
```

## 📚 Trích dẫn & Lưu trữ

Nếu sử dụng BizOn trong giảng dạy hoặc nghiên cứu, vui lòng trích dẫn:

> Do, T. H., & Phan, A. T. (2026). *BizOn Bật Nghiệp: A 3D claymorphism business-simulation game for entrepreneurship education* [Computer software]. Can Tho University. https://doi.org/10.5281/zenodo.21592242

- Tệp trích dẫn máy đọc được: [`CITATION.cff`](CITATION.cff) (GitHub hiển thị nút **"Cite this repository"**).
- **Zenodo:** concept DOI [10.5281/zenodo.21592242](https://doi.org/10.5281/zenodo.21592242) (đại diện mọi phiên bản); mỗi release GitHub được Zenodo tự lưu trữ và cấp version DOI riêng.

## ⚖️ Bản quyền & Sở hữu trí tuệ

**Phần mềm độc quyền** — xem [`LICENSE`](LICENSE). Mã nguồn, thuật toán engine mô phỏng, tạo hình nhân vật **Lumina — Je m'appelle Hương**, tên gọi và nhận diện **BizOn Bật Nghiệp** thuộc sở hữu của nhóm tác giả **Đỗ Thùy Hương & Phan Anh Tú**; nghiêm cấm sao chép hoặc sử dụng thương mại khi chưa được phép bằng văn bản.

Hồ sơ đăng ký bảo hộ (quyền tác giả, nhãn hiệu) và chiến lược thương mại hóa: [`docs/so-huu-tri-tue.md`](docs/so-huu-tri-tue.md).

Thành phần bên thứ ba: Tailwind CSS (MIT), Google Fonts Plus Jakarta Sans & Manrope (OFL 1.1) — giữ nguyên giấy phép gốc.

## 🛣️ Lộ trình tiếp theo

1. Backend API theo [`docs/api-structure.md`](docs/api-structure.md) (JWT, queue xử lý commit) → chế độ nhiều đội thời gian thực.
2. Database PostgreSQL theo [`docs/database-schema.md`](docs/database-schema.md).
3. Tích hợp cố vấn AI thật qua API mô hình ngôn ngữ lớn thay cho advisor luật.
4. **V-Monitor** — dashboard dữ liệu thật thị trường Việt Nam, phát triển thành dự án độc lập: [`docs/de-an-vn-monitor.md`](docs/de-an-vn-monitor.md).

---

## 👥 Nhóm tác giả

| Tác giả | Vai trò |
|---|---|
| **Đỗ Thùy Hương** | Founder & Creative Lead — thiết kế game, hóa thân nhân vật Lumina AI · thuyhuongctu@gmail.com |
| **Phan Anh Tú** | Academic Advisor — cố vấn học thuật, bảo chứng chuyên môn quản trị kinh doanh |

© 2026 Đỗ Thùy Hương & Phan Anh Tú · **BizOn Bật Nghiệp** — Bảo lưu mọi quyền.
