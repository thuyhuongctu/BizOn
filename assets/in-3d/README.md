# Tệp in 3D nhân vật BizOn

| Tệp | Nhân vật | Kích thước | Nhựa (đặc) |
|---|---|---|---|
| `tu-v3-10cm.stl` | Thầy Tu Phan, áo dài | 48 × 48 × 102 mm (cao 10 cm, đế tròn 48 mm dày 3 mm) | khoảng 25 cm³ |
| `ceo-v3-10cm.stl` | CEO | 48 × 48 × 102 mm | khoảng 31 cm³ |

Dựng ngày 21/11/2026 từ hai mô hình tám động tác `assets/models/nhan-vat/tu-v3.glb`, `ceo-v3.glb` (tư thế lấy ở động tác Idle, khung 10)
bằng Blender 4.2.3 và kịch bản `scripts/3d/glb-thanh-stl.py`. Lưới kín (0 cạnh hở), một khối liền, đơn vị milimét. Ảnh xem trước:
`xem-truoc.webp`.

**Khi in:** ngón tay và vạt áo mỏng ở cỡ 10 cm. Máy in nhựa sợi (FDM) nên bật giá đỡ (support) cho tay, hoặc phóng lên 12–15 cm cho
chắc; máy in nhựa lỏng (resin) cho chi tiết mặt đẹp hơn. Muốn tư thế khác (Wave, Cheer…) thì chạy lại kịch bản với tên động tác khác.

Nguồn mô hình: Meshy AI dựng từ ảnh gốc của BizOn (xem `assets/models/SOURCES.md` và `THIRD-PARTY-NOTICES.md` Mục 7).
