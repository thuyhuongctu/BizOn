# BizOn Bật Nghiệp 2026 — Business Simulation

Nền tảng **mô phỏng kinh doanh EdTech** theo phong cách **3D Claymorphism**, nơi các đội
sinh viên điều hành doanh nghiệp ảo qua **6 vòng chơi** cùng cố vấn AI **Lumina
(Je m'appelle Hương)**.

Bản prototype này được xây dựng theo hồ sơ thiết kế xuất từ **Google Stitch**
(Design Tokens, kiến trúc màn hình, logic mô phỏng, database schema và API spec —
xem thư mục [`docs/`](docs/)).

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

## Engine mô phỏng (client-side)

- **6 vòng chơi**, mỗi vòng một biến cố thị trường: Bùng nổ công nghệ, Chiến tranh giá,
  Suy thoái kinh tế (hiệu ứng `animate-shake`), Đứt gãy chuỗi cung ứng, Hội chợ quốc tế.
- Mô hình thị phần theo **độ co giãn giá** + hiệu quả marketing + giá trị thương hiệu.
- Chi phí: giá vốn / khấu hao theo công suất máy / phí lưu kho / chi phí cố định.
- R&D tích lũy giảm giá thành và tăng thương hiệu; XP quy đổi từ lợi nhuận và thị phần.
- Mã lỗi nghiệp vụ mô phỏng theo API spec: `ERR_ALREADY_COMMITTED`,
  `ERR_INSUFFICIENT_FUNDS`, `ERR_AI_LIMIT`, `ERR_ITEM_NOT_FOUND`…

## Design Tokens (từ Stitch)

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
index.html          # SPA — toàn bộ màn hình + Tailwind config
js/engine.js        # Engine mô phỏng 6 vòng, biến cố, vật phẩm, kỹ năng, Lumina AI
js/app.js           # Điều khiển UI, điều hướng tab, render, localStorage
assets/character/   # Ảnh 3D nhân vật Lumina (áo dài & vest trắng)
docs/               # Hồ sơ kỹ thuật từ Stitch (schema, API, handoff)
```

> Nhân vật **Lumina — Je m'appelle Hương** xuất hiện xuyên suốt game:
> bản **áo dài trắng** ở Splash / Đăng nhập / Chứng chỉ hoàn thành,
> bản **vest trắng** ở Dashboard / màn hình Cố vấn AI / khung chat.

## Lộ trình tiếp theo

1. Backend API theo [`docs/api-structure.md`](docs/api-structure.md) (JWT, queue xử lý commit).
2. Database PostgreSQL theo [`docs/database-schema.md`](docs/database-schema.md).
3. Chế độ nhiều đội thời gian thực + màn hình Giảng viên (cấp vốn, khóa vòng).
4. Tích hợp Lumina AI thật qua Claude API thay cho rule-based advisor.

---
## Thành viên nhóm

| Thành viên | Vai trò |
|---|---|
| **Đỗ Thùy Hương** (Je m'appelle Hương) | Tác giả thiết kế & nhân vật Lumina · thuyhuongctu@gmail.com |
| **Phan Anh Tú** | Đồng phát triển |

© 2026 BizOn Bật Nghiệp
