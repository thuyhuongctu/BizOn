# Nguồn gốc model 3D

Tất cả model trong thư mục này lấy từ [Kenney.nl](https://kenney.nl), cấp phép
**CC0 1.0** (Creative Commons Zero — public domain, không bắt buộc ghi công).

| File | Pack gốc | Tên gốc | URL |
|---|---|---|---|
| `tan-cang-warehouse.glb` | City Kit: Industrial (v2.0) | `building-s.glb` | https://kenney.nl/assets/city-kit-industrial |
| `crate.glb` | City Kit: Industrial (v2.0) | `shipping-container-a.glb` | https://kenney.nl/assets/city-kit-industrial |

Không dùng pack nhân vật (Blocky Characters) — Kim Long Exports đã có model 3D đất sét
riêng (`bp-clay-cast.js`, `RIVAL_ID = 'bp_kimlong'`), thay bằng nhân vật phong cách khối
sẽ lệch tông với hệ thống nhân vật clay hiện có.

Nạp bằng `js/meshy-loader.js` (`makeMeshyLoader(THREE)` → `load()`/`clone()`/`flatten()`).

`Textures/colormap.png` là texture dùng chung cho cả 2 model trên (GLB của Kenney tham
chiếu texture qua đường dẫn tương đối `Textures/colormap.png` thay vì nhúng sẵn — xem
`Importing 3D models into game engines` của Kenney, mục "Missing colors").
