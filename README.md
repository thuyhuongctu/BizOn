# BizOn Bật Nghiệp 2026 — Business Simulation

Nền tảng **mô phỏng kinh doanh EdTech** theo phong cách **3D Claymorphism**, nơi các đội
sinh viên điều hành doanh nghiệp ảo qua **6 vòng chơi** cùng cố vấn AI **Lumina
(Je m'appelle Hương)**.

## Chạy thử

Không cần cài đặt — mở trực tiếp:

```bash
# Cách 1: mở file
open index.html

# Cách 2: chạy server tĩnh
python3 -m http.server 8000
# rồi mở http://localhost:8000
```

Tiến trình chơi được lưu tự động trong `localStorage` của trình duyệt.

## Triển khai Web App & Mobile App

- **Web (GitHub Pages):** workflow [`deploy-pages.yml`](.github/workflows/deploy-pages.yml)
  tự động deploy mỗi khi push lên `main` → game chạy tại
  `https://thuyhuongctu.github.io/BizOn/`.
- **Mobile (PWA):** game là Progressive Web App — mở link trên điện thoại rồi chọn
  **"Thêm vào màn hình chính"** (Android/Chrome tự gợi ý cài đặt) là có app icon
  Lumina, chạy toàn màn hình như app native và **chơi được offline** nhờ service
  worker (`sw.js` + `manifest.webmanifest`).

## Tính năng

| Màn hình | Mô tả |
|---|---|
| Splash & Đăng nhập | Logo pulse, chọn vai trò CEO / CFO / CMO / COO / SEC |
| Trung tâm điều hành | Vòng chơi R1→R6, chỉ số Dòng tiền / Thị phần / Thương hiệu, banner biến cố thị trường |
| Nhập quyết định | Giá bán, Ngân sách Marketing, Sản lượng, Đầu tư R&D — nút **Commit** khóa quyết định |
| Cố vấn Lumina AI | Kịch bản "Nếu — Thì", cảnh báo rủi ro (🔴 đỏ cam) / cơ hội (🟢 xanh ngọc), giới hạn lượt hỏi mỗi vòng |
| Báo cáo | P&L, Dòng tiền, Khấu hao — biểu đồ cột theo vòng |
| Cửa hàng & Kho đồ | Marketing Boost, R&D Upgrade, Khiên bảo hiểm… trừ trực tiếp ví ảo của đội |
| Cây kỹ năng | Mở khóa bằng XP tích lũy từ lợi nhuận và thị phần |
| Bảng xếp hạng | Đấu với 3 đội AI (Alpha Dynamics, Mekong Ventures, Star Clay Co.) |
| Thành tựu & Chứng chỉ | 6 thành tựu + chứng chỉ hoàn thành sau vòng 6, hiệu ứng confetti |
| Nhiệm vụ | 9 nhiệm vụ xuyên game với thưởng tiền ảo + XP, badge đếm nhiệm vụ chờ nhận |
| Clay Factory Frenzy | Mini-game băng chuyền đất sét: chạm đúng đơn hàng trong 30 giây, 3 lượt/vòng, đổi điểm lấy tiền ảo |
| Màn hình Giảng viên | Cấp vốn cho đội (+ nhật ký), khóa/mở vòng chơi (ERR_ROUND_LOCKED) |
| Lumina Advisor Pro | Nhập số liệu kinh doanh thực → 3 kịch bản "Nếu — Thì" (Thận trọng / Cân bằng / Tăng tốc) |
| Biến cố toàn màn hình | Mỗi vòng mở màn bằng màn hình biến cố kiểu Stitch: Cơ Hội Vàng, Chiến Tranh Giá, Khủng Hoảng Năng Lượng/Chuỗi Cung Ứng... kèm chỉ số tác động + lời khuyên Lumina theo vai trò |
| Chúc mừng chiến thắng | Thị phần đạt đỉnh mới (≥30%, có lãi) → màn hình TOP 1 MARKET với Lumina vỗ tay, hiệu quả quảng cáo, độ hài lòng thương hiệu |
| Kiểm toán Năng lượng | Báo cáo ⚡: tổng kWh vs mục tiêu (vòng tròn % quá tải), 3 dây chuyền với trạng thái, nâng cấp/bảo trì dây chuyền, lịch sử bảo trì |
| Phân tích theo vai trò | Advisor: thẻ CFO (thanh toán nhanh, ROI, khoản vay, cắt chi phí), COO (OEE, phế phẩm, bảo trì), CMO (thị phần, Brand Loyalty, Price War/Green Marketing, Branding Premium) |
| Mô phỏng "Nếu — Thì" | Trước khi Commit: chạy thử kịch bản CEO (thị phần, hòa vốn, đánh đổi) hoặc CFO (Quick Ratio ngưỡng 1.1, đòn bẩy ROI vs lãi vay) — 2 lượt/vòng theo `what_if_limit` |
| Bộ nhớ doanh nghiệp | SEC: nhật ký toàn bộ lời tư vấn của Lumina theo vòng (mô phỏng bảng `ai_advisor_history`) |
| Nhật ký đội | Timeline hành trình 6 vòng: quyết định then chốt, kết quả & bài học tự sinh từ số liệu, trích dẫn Lumina/SEC/PGS.TS Phan Anh Tú |

## Engine mô phỏng (client-side)

- **6 vòng chơi**, mỗi vòng một biến cố thị trường: Bùng nổ công nghệ, Chiến tranh giá,
  Suy thoái kinh tế (hiệu ứng `animate-shake`), Đứt gãy chuỗi cung ứng, Hội chợ quốc tế.
- Mô hình thị phần theo **độ co giãn giá** + hiệu quả marketing + giá trị thương hiệu.
- Chi phí: giá vốn / khấu hao theo công suất máy / phí lưu kho / chi phí cố định.
- R&D tích lũy giảm giá thành và tăng thương hiệu; XP quy đổi từ lợi nhuận và thị phần.
- Mã lỗi nghiệp vụ mô phỏng theo API spec: `ERR_ALREADY_COMMITTED`,
  `ERR_INSUFFICIENT_FUNDS`, `ERR_AI_LIMIT_REACHED`, `ERR_ITEM_NOT_FOUND`…

## Design Tokens

| Token | Giá trị |
|---|---|
| Primary | `#006687` |
| Primary Container | `#00c4ff` |
| Surface Bright | `#f4faff` |
| Deep Teal | `#033337` |
| Font tiêu đề | Plus Jakarta Sans |
| Font nội dung | Manrope |
| Bo góc | `24px` |
| Clay shadow | `0 10px 30px -5px rgba(0,102,135,.05)` + `inset 0 -4px 0 rgba(0,0,0,.05)` |

## Cấu trúc mã nguồn

```
index.html          # SPA — toàn bộ màn hình + Tailwind config + đăng ký PWA
js/engine.js        # Engine mô phỏng 6 vòng, biến cố, vật phẩm, kỹ năng, Lumina AI
js/app.js           # Điều khiển UI, điều hướng tab, render, localStorage
sw.js               # Service worker — cache app shell, chơi offline
manifest.webmanifest# Khai báo PWA (tên, icon, màu thương hiệu)
assets/character/   # Ảnh 3D nhân vật Lumina (áo dài & vest trắng)
assets/icons/       # Icon app (mặt Lumina trên nền gradient clay)
docs/               # Hồ sơ kỹ thuật (schema, API, design system, sở hữu trí tuệ)
```

> Nhân vật **Lumina — Je m'appelle Hương** xuất hiện xuyên suốt game:
> bản **áo dài trắng** ở Splash / Đăng nhập / Chứng chỉ hoàn thành,
> bản **vest trắng** ở Dashboard / màn hình Cố vấn AI / khung chat.

## Lộ trình tiếp theo

1. Backend API theo [`docs/api-structure.md`](docs/api-structure.md) (JWT, queue xử lý commit).
2. Database PostgreSQL theo [`docs/database-schema.md`](docs/database-schema.md).
3. Chế độ nhiều đội thời gian thực + màn hình Giảng viên (cấp vốn, khóa vòng).
4. Tích hợp Lumina AI thật qua Claude API thay cho rule-based advisor.

## Bản quyền & Sở hữu trí tuệ

Đây là **phần mềm độc quyền** — xem [`LICENSE`](LICENSE). Mã nguồn, thuật toán
engine mô phỏng, tạo hình nhân vật **Lumina — Je m'appelle Hương**, tên gọi và
nhận diện **BizOn Bật Nghiệp** thuộc sở hữu của nhóm tác giả; nghiêm cấm sao chép
hoặc sử dụng thương mại khi chưa được phép bằng văn bản.

Hồ sơ đăng ký bảo hộ (quyền tác giả, nhãn hiệu) và chiến lược thương mại hóa:
[`docs/so-huu-tri-tue.md`](docs/so-huu-tri-tue.md).

Thành phần bên thứ ba: Tailwind CSS (MIT), Google Fonts Plus Jakarta Sans &
Manrope (OFL 1.1) — giữ nguyên giấy phép gốc của chúng.

---
## Thành viên nhóm

| Thành viên | Vai trò |
|---|---|
| **Đỗ Thùy Hương** (Je m'appelle Hương) | Tác giả thiết kế & nhân vật Lumina · thuyhuongctu@gmail.com |
| **PGS.TS Phan Anh Tú** | Đồng sáng lập |

© 2026 BizOn Bật Nghiệp
