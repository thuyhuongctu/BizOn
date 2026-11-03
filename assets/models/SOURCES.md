# Nguồn gốc model 3D

Tất cả model trong thư mục này lấy từ [Kenney.nl](https://kenney.nl), cấp phép
**CC0 1.0** (Creative Commons Zero — public domain, không bắt buộc ghi công).

| File | Pack gốc | Tên gốc | URL |
|---|---|---|---|
| `tan-cang-warehouse.glb` | City Kit: Industrial (v2.0) | `building-s.glb` | https://kenney.nl/assets/city-kit-industrial |
| `crate.glb` | City Kit: Industrial (v2.0) | `shipping-container-a.glb` | https://kenney.nl/assets/city-kit-industrial |

## Trang Ra Khơi Cùng Lớp 3D (`ra-khoi-3d.html`, nạp trong `js/ra-khoi-3d.js`)

| Thư mục | Pack gốc | Tệp | URL |
|---|---|---|---|
| `kenney-thuyen/` | Watercraft Kit (2.1) | `boat-fishing-small`, `boat-row-small`, `boat-house-a` + `Textures/colormap.png` riêng của pack này (khác colormap City Kit ở trên) | https://kenney.nl/assets/watercraft-kit |
| `kenney-cay/` | Nature Kit (2.1) | 3 dừa, 2 cây, 3 bụi, đá, 3 hoa, cỏ, 2 lục bình, gốc cây | https://kenney.nl/assets/nature-kit |

Nature Kit khai `metallicFactor = 1` nên vật liệu được đặt `metalness = 0` lúc nạp (không thì gần như đen);
lá dừa xanh ngọc được nhuộm về xanh lá của cảnh. Giấy phép gốc của từng pack nằm trong `LICENSE.txt` của thư mục.

Không dùng pack nhân vật (Blocky Characters) — Kim Long Exports đã có model 3D đất sét
riêng (`bp-clay-cast.js`, `RIVAL_ID = 'bp_kimlong'`), thay bằng nhân vật phong cách khối
sẽ lệch tông với hệ thống nhân vật clay hiện có.

Nạp bằng `js/meshy-loader.js` (`makeMeshyLoader(THREE)` → `load()`/`clone()`/`flatten()`).

`Textures/colormap.png` là texture dùng chung cho cả 2 model trên (GLB của Kenney tham
chiếu texture qua đường dẫn tương đối `Textures/colormap.png` thay vì nhúng sẵn — xem
`Importing 3D models into game engines` của Kenney, mục "Missing colors").
