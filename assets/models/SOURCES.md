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

## Thanh Long cưỡi mây 3D (`rong-bay-doi-bizon.glb`, màn đăng nhập BizOn Game 3D)

| File | Nguồn | Cách làm |
|---|---|---|
| `rong-bay-doi-bizon.glb` | Tác phẩm riêng của BizOn: dựng từ tranh `assets/illustrations/rong-bay-doi-bizon-v5.webp` bằng Meshy AI (06/11/2026, tài khoản của tác giả) | Meshy vẽ lại rồng và đội theo đúng tranh gốc trên nền trắng → Image to 3D (`meshy-7.1`, màu vẽ `meshy-7` 4K) → Remesh về 41.714 tam giác → thu màu vẽ về 2048 px JPEG, bỏ lớp normal và metallic-roughness (chỉ giữ base color cho đúng tông đất sét), 3,3 MB |

Ảnh nền đi kèm `assets/illustrations/rong-bay-doi-bizon-nen.webp` (2752×1536): Meshy vẽ lại tranh gốc bỏ rồng và đội, chỉ còn trời, biển, bản đồ; chỉ hiện khi mô hình 3D đã tải, để rồng 2D không ló ra sau rồng 3D.
Nội dung có công cụ AI tham gia, xem `THIRD-PARTY-NOTICES.md` Mục 7. Nạp trong `js/game3d-rong.js` (GLTFLoader, máy quay trực giao khớp
đúng vị trí con rồng trong ảnh nền). Đầu rồng ở phía +z của mô hình.

## Nhân vật 3D có xương (`nhan-vat/`, BizOn Game 3D)

| File | Nguồn | Cách làm |
|---|---|---|
| `nhan-vat/ceo.glb` | Tác phẩm riêng của BizOn: dựng từ ảnh gốc `assets/character/solid/ceo-tex.webp` bằng Meshy AI (06/11/2026, tài khoản của tác giả) | Meshy vẽ lại ảnh gốc ở tư thế chữ A, la bàn cầm bên hông (ảnh gốc cầm la bàn trước ngực làm bàn tay ấy dính vào thân khi gắn xương) → Image to 3D lưới thông minh (`meshy-t2.5`, 12.000 mặt, màu `meshy-n1`, dáng chữ A) → Rigging 1,7 m (kèm clip đi bộ) → Animate thư viện: Idle (0), Talk with Hands Open (313) → gộp ba clip vào một GLB bằng `scripts/3d/glb-gop-clip.py`, màu vẽ 1024 px JPEG, 0,97 MB |
| `nhan-vat/cfo.glb`, `cmo.glb`, `coo.glb`, `sec.glb`, `lumina.glb` | Tác phẩm riêng của BizOn: dựng từ ảnh gốc `assets/character/solid/{cfo,cmo,coo,sec,lumina}-tex.webp` bằng Meshy AI (06/11/2026, tài khoản của tác giả) | Cùng cách với CEO: Meshy vẽ lại ảnh gốc ở tư thế chữ A, đạo cụ (túi tiền, loa, máy tính bảng, bảng kẹp, hoa sen) cầm bên hông → Image to 3D lưới thông minh 12.000 mặt, màu `meshy-n1` → Rigging 1,7 m → Animate Idle (0) + Talk with Hands Open (313) → gộp ba clip, màu vẽ 1024 px JPEG, 0,95–1,11 MB |
| `nhan-vat/tu.glb` | Tác phẩm riêng của BizOn: dựng từ ảnh gốc `assets/character/solid/tu-phan-tex-v3.webp` bằng Meshy AI (06/11/2026) | Ảnh gốc đã dang tay nên đưa thẳng vào Image to 3D (không vẽ lại) → Rigging → Animate Idle + Talk → gộp ba clip, 0,97 MB |
| `nhan-vat/dong-tac-v1.glb` | Kho động tác dùng chung (10/11/2026): bộ xương 24 khớp và ba clip Run, Wave, Cheer, rút từ `ceo-v2.glb` (mô hình CEO gắn xương và động tác qua API Meshy bằng tài khoản của tác giả, PR #1061) | `scripts/3d/glb-chi-dong-tac.py ceo-v2.glb dong-tac-v1.glb Run,Wave,Cheer`: bỏ lưới, vật liệu, ảnh; còn 141 KB. `js/ben-bizon-dang-di.js` ghép clip sang mô hình khác theo tên khớp lúc chạy, nên cả bảy nhân vật có dáng chạy mà không tốn thêm credit |
| `nhan-vat/nguon/ceo-tranh-dong-truoc-v1.jpg`, `ceo-tranh-dong-sau-v1.jpg` | Ảnh mẫu CEO cho hướng «tranh gốc thành hoạt hình» (10/11/2026, tài khoản Meshy của tác giả): vẽ lại từ tranh gốc `assets/character/v2/ceo.png`, **bỏ la bàn** theo ý chị Hương, tay buông, giữ bảng tên CEO; thêm ảnh nhìn từ sau lưng để các hướng nhìn khớp nhau | Meshy Image to Image `nano-banana-pro`, 9 credit mỗi ảnh. Dùng làm ảnh mẫu (đường dẫn công khai) cho công cụ tạo video; đoạn phim nền xanh sau đó qua `scripts/3d/tach-nen-sprite.py` để thành tờ sprite |
| `assets/character/tranh-dong/ceo-di-truoc.webp`, `ceo-di-sau.webp` (kèm `.json`) | Tờ sprite CEO đi bộ nhìn từ phía trước (23 khung) và từ sau lưng (30 khung), 24 khung/giây, mỗi khung cao 256 px (10/11/2026, tài khoản Agensi của tác giả) | Kling 3.0 (qua Agensi) vẽ đoạn phim 3 giây nền xanh từ hai ảnh mẫu `nhan-vat/nguon/ceo-tranh-dong-*-v1.jpg`, 0,33 USD mỗi đoạn → `scripts/3d/tach-nen-sprite.py` tách nền, co về cùng cỡ, cắt vòng lặp. Chưa trang nào nạp. Đoạn nhìn ngang lần này hỏng (nhân vật xoay tại chỗ), chờ làm lại |

Từ 06/11/2026 mặc định **tắt** (chị Hương thấy mặt và bảng tên bị nhòe so với tranh gốc): trang dùng tranh gốc dựng đứng, GLB chỉ bật khi đặt `window.BIZON_CHAR_GLB = true` hoặc thêm `?glb=1`.
Nạp trong `bizon-characters.js` (`rigChar`: GLTFLoader + SkeletonUtils.clone + AnimationMixer; clip chọn theo trạng thái idle/talk/walk của game).
Nhân vật quay mặt về +z. Lưới có xương bỏ qua tỷ lệ 0,01 của nút Armature khi vẽ, nên đo chiều cao bằng hình học ở tư thế gốc.
Nội dung có công cụ AI tham gia, xem `THIRD-PARTY-NOTICES.md` Mục 7.
