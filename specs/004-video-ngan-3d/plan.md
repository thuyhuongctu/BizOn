# Kế hoạch: Video ngắn dọc 3D với nhân vật đất sét BizOn

**Nhánh**: `claude/video-ngan-3d` · **Ngày**: 2026-11-12 · **Đặc tả**: [spec.md](spec.md)

## Tóm tắt

Thêm một **công cụ dựng video** trong `scripts/video/3d/`, không thuộc trang web. Một trang HTML dựng cảnh three.js chạy
trong Chromium (Playwright). Cảnh gồm nhân vật GLB đất sét có sẵn, khối đất sét đơn giản, ảnh đất sét làm phông, và máy
quay theo kế hoạch. Trang lộ hàm `veKhung(n)` vẽ đúng khung thứ n theo thời gian `n / 30` giây. Tệp Node gọi hàm này lần
lượt, chụp từng khung rồi ghép bằng ffmpeg với giọng đọc tác giả đã thu.

Video thử dùng 7 câu (1, 3, 4, 7, 10, 12, 14) của kịch bản sầu riêng, khổ dọc 1080 × 1920, phụ đề từng chữ đốt vào
hình, kèm `.vtt`.

## Bối cảnh kỹ thuật

| Hạng mục | Lựa chọn |
|---|---|
| Ngôn ngữ, chạy | Node 22 (ESM `.mjs`), Chromium của Playwright, ffmpeg/ffprobe; không thêm phụ thuộc npm |
| Dựng cảnh | three.js có sẵn trong kho (`js/vendor/three.module.js`, `GLTFLoader`, `SkeletonUtils`), `AnimationMixer` đặt thời gian bằng `mixer.setTime(t)` |
| Render | WebGL qua SwiftShader trên máy không GPU (`--use-gl=angle --use-angle=swiftshader`), `preserveDrawingBuffer`, chụp `canvas.toDataURL` hoặc `page.screenshot` theo khung, ghi PNG rồi `ffmpeg -framerate 30` |
| Tất định | Không dùng `requestAnimationFrame` hay `Date.now`; mọi chuyển động là hàm thuần của `t`; hạt ngẫu nhiên dùng bộ sinh số có hạt giống cố định |
| Mốc từng từ (P3) | Thử `faster-whisper` cài bằng pip (cần tải mô hình; có thể bị chặn mạng). Nếu không được thì **chia mốc theo số âm tiết trong câu**, neo bằng khoảng lặng do `ffmpeg silencedetect` tìm được, rồi chỉnh tay trong tệp `moc-tu.json`. Câu chuyện 3 nghiệm thu bằng mắt ở mốc từng chữ |
| Âm thanh | Dùng lại cách của `scripts/video/dung-sau-rieng.mjs`: cắt khoảng lặng đầu và cuối câu, đặt câu theo mốc, nhạc nền «Mekong Compass» hạ khi có lời, `loudnorm` −15 LUFS, đỉnh −1,5 dBTP |
| Kiểm | `scripts/kiem-video.mjs` (đã có) và test Node mới trong `test/` |

**Học từ kho tham khảo (MIT)**, ghi vào `THIRD-PARTY-NOTICES.md` mục 6:
- ý tưởng render tất định từng khung qua trình duyệt;
- cấu trúc `shot(t0, fn)` cho kế hoạch cảnh;
- danh sách kiểu máy quay (thiết lập toàn cảnh, đẩy vào, chèn qua vai, lia nhanh);
- phụ đề từng chữ.

Không chép mã, mô hình, đồ nội thất, kiểu nhân vật hay chỉ số màu của kho đó.

## Kiểm theo hiến chương

| Nguyên tắc | Ảnh hưởng | Cách giữ |
|---|---|---|
| I. Học là chính | Video là học liệu mở đầu buổi học về Hộ Chiếu Sầu Riêng | Giữ dòng «Trong BizOn» và gắn BP-4 như hồ sơ kịch bản; không chấm điểm |
| II. Nói thật | Lời đọc là sự thật có nguồn; anh Tư là nhân vật minh họa | Chỉ dùng 7 câu đã kiểm nguồn; không dùng tiêu đề «container bị trả về chỉ vì một con số»; ghi rõ anh Tư là nhân vật ghép trong mô tả video |
| III. Trang tĩnh (không thương lượng) | Bộ dựng chạy bằng Node trên máy, không phải bước build của trang | Mọi mã ở `scripts/video/3d/`; trang web không đổi trong PR 1 và PR 2. Đưa video lên trang là việc khác, chị quyết sau |
| IV. Có test | Mỗi PR có test viết trước | Xem «Kế hoạch PR» trong tasks.md; `sw.js` nâng `CACHE` mỗi PR dù trang không đổi (theo quy ước kho) |
| V. Dữ liệu người học | Không đụng | Không có |
| Hồ sơ quyền tác giả | Không sửa tệp nào trong hồ sơ | Bộ dựng tự nạp GLB bằng `GLTFLoader`, **không** import `bizon-characters.js`; chỉ đọc `assets/models/nhan-vat/*.glb` |
| Tài sản gốc | Không ghi đè | Thành phẩm là tệp mới `assets/video/sau-rieng-ma-so-doc-3d-vi.mp4`; GLB gốc giữ nguyên, nón lá dựng trong bộ dựng |
| Nhân vật | «Lấy từ ảnh game có sẵn, không tự dựng nhân vật mới» | Dùng GLB có sẵn; nón lá là đạo cụ, không phải nhân vật mới (chị duyệt ở câu làm rõ 3) |
| Bên thứ ba | Học kỹ thuật từ kho MIT | Ghi nguồn trong `THIRD-PARTY-NOTICES.md` mục 6 |

## Thiết kế

### Câu chuyện 1 – Bộ dựng (`scripts/video/3d/`)

- `dung-video-3d.mjs <ke-hoach.mjs> --out <thư mục> [--thu] [--tu N --den M]`:
  - mở máy chủ tĩnh tạm ở cổng ngẫu nhiên, gốc là thư mục kho;
  - mở `canh-3d.html?ke=<đường dẫn>` trong Chromium 1080 × 1920;
  - chờ `window.__san` (đã tải xong mọi GLB và ảnh);
  - với n = 0 … N−1: gọi `veKhung(n)` rồi chụp, ghi `khung/000123.png`;
  - ghép mp4 bằng ffmpeg: `libx264`, `yuv420p`, `-r 30`, `crf 18`;
  - `--thu`: chỉ chụp ảnh ở giữa mỗi cảnh để duyệt bố cục.
- `canh-3d.html` + `canh-3d.js`:
  - nạp kế hoạch (module ES xuất `{ fps, khung, nhanVat, canh: [...] }`);
  - dựng renderer, ánh sáng đất sét (ấm, mềm), phông ảnh;
  - mỗi cảnh: `{ tu, den, boi: 'vuon'|..., nguoi: [{ id, glb, vi, huong, dong, tu }], may: { tu: [x,y,z], den: [...], nhin, fov, kieu } }`;
  - nhân vật: `GLTFLoader` + `SkeletonUtils.clone` cho mỗi lần xuất hiện, `AnimationMixer.setTime`;
  - clip thiếu (Wave/Cheer/Run trên GLB chỉ có Idle/Talk/Walk) ghép từ `dong-tac-v1.glb` theo cách `js/ben-bizon-dang-di.js` đang làm (đọc để học, không import nếu kéo theo phụ thuộc trang).
- `dao-cu.js`: nón lá (hình nón dẹt, vân đan, màu rơm), thùng xốp, bàn kiểm, container (khối có gân), hàng rào vườn, cây sầu riêng đơn giản; vật liệu `MeshStandardMaterial` thô ráp, hợp đất sét.
- `ke-hoach-thu.mjs`: cảnh thử 10 giây (CEO và CFO, một lần đẩy máy vào), dùng trong test.

### Câu chuyện 2 – Video thử (`scripts/video/3d/sau-rieng-doc/`)

- `ke-hoach.mjs`: 7 cảnh theo 7 câu; mốc câu lấy từ độ dài giọng sau khi cắt lặng.

  | Câu | Cảnh |
  |---|---|
  | 1 | Cận trái sầu riêng trên bàn kiểm, kéo ra |
  | 3 | Bảng mã ở cổng vườn |
  | 4 | Anh Tư đội nón lá giữa vườn, đẩy vào |
  | 7 | Hàng container ở cảng, nhân vật kiểm nghiệm vẫy tờ giấy |
  | 10 | Một trái bị đánh dấu đỏ, cả lô xám đi |
  | 12 | Lớp học: số báo danh |
  | 14 | Cổng biên giới, chữ «VIỆT NAM» trên thùng |

- `dung-sau-rieng-doc.mjs`: ghép giọng (VI) bằng cách của `dung-sau-rieng.mjs`, gọi bộ dựng, trộn tiếng, loudnorm, poster, phụ đề `.vi.vtt`/`.en.vtt` theo mốc câu, chạy `kiem-video.mjs`.
- Thành phẩm: `assets/video/sau-rieng-ma-so-doc-3d-vi.mp4` (+ `-poster.jpg/.webp`). Chưa gắn vào trang nào.

### Câu chuyện 3 – Phụ đề từng chữ

- `moc-tu.mjs`: tạo `moc-tu.json` (mốc từng từ) bằng một trong hai cách ở bảng trên; cho sửa tay.
- Phụ đề vẽ trong `canh-3d.html` bằng lớp HTML phủ trên canvas, chụp cùng khung:
  - mỗi lần 3–5 chữ, chữ đang đọc tô vàng;
  - đặt ở 62–78 % chiều cao, ngoài vùng mặt nhân vật;
  - viền tối để đọc được trên mọi nền.
- `.vi.vtt`, `.en.vtt` đã có từ PR 2 (bản EN lấy câu EN tương ứng trong kịch bản, chỉ làm phụ đề, không đọc).

## Tệp sẽ chạm

| Tệp | PR | Ghi chú |
|---|---|---|
| `scripts/video/3d/dung-video-3d.mjs`, `canh-3d.html`, `canh-3d.js`, `dao-cu.js`, `ke-hoach-thu.mjs` | 1 | mới |
| `test/video-3d-bo-dung.test.js` | 1 | mới |
| `THIRD-PARTY-NOTICES.md` | 1 | thêm nguồn kỹ thuật (mục 6) |
| `scripts/video/3d/sau-rieng-doc/ke-hoach.mjs`, `dung-sau-rieng-doc.mjs` | 2 | mới |
| `assets/video/sau-rieng-ma-so-doc-3d-vi.mp4`, poster | 2 | tệp mới, không ghi đè |
| `docs/video/kich-ban-sau-rieng-ma-so-vung-trong.md` | 2 | thêm mục «Bản dọc 3D 45 giây» (7 câu, cột cảnh) |
| `test/video-3d-sau-rieng.test.js` | 2 | mới |
| `scripts/video/3d/moc-tu.mjs`, `canh-3d.js` (lớp phụ đề) | 3 | mới, sửa |
| `assets/video/sau-rieng-ma-so-doc-3d-vi.vi.vtt`, `.en.vtt` | 2 | tệp mới |
| mp4 bản có chữ (`-v2`) | 3 | tệp mới |
| `test/video-3d-phu-de.test.js` | 3 | mới |
| `sw.js` | 1, 2, 3 | nâng `CACHE` mỗi PR theo quy ước |

**Không chạm**: ba game trong hồ sơ, `bizon-characters.js`, trang web, Supabase.

## Rủi ro

| Rủi ro | Cách giảm |
|---|---|
| Render bằng SwiftShader chậm (1.350 khung cho 45 giây) | Đo ở PR 1; nếu quá 30 phút thì giảm bóng đổ và độ phân giải bóng, hoặc dựng 540 × 960 rồi phóng lên (ghi rõ) |
| Clip GLB khác nhịp và cỡ giữa các nhân vật | Đo chiều cao bằng hộp bao, chuẩn hóa như `ben-bizon-dang-di.js` |
| Không có mốc từng từ chính xác | Phương án chia theo âm tiết và neo khoảng lặng, sửa tay; nghiệm thu bằng mắt |
| Tệp mp4 làm kho nặng thêm | Bản dọc 45 giây `crf 23`, mục tiêu ≤ 8 MB; không đưa khung PNG vào kho (`.gitignore`) |
