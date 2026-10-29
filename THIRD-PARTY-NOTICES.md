# Thông báo thành phần bên thứ ba · Third-Party Notices

**BizOn Bật Nghiệp — Business Simulation Game Ecosystem** · bizonland.com
Bản quyền phần do nhóm tác giả tạo: © 2026 Đỗ Thùy Hương và Phan Anh Tú — xem [`LICENSE`](LICENSE).

Tệp này liệt kê **mọi thành phần không do hai tác giả tạo ra** đang nằm trong kho mã hoặc được tải khi vận hành, kèm giấy phép của từng thành phần. Các thành phần này **không thuộc phạm vi giấy phép độc quyền** của BizOn và **không được kê khai** trong hồ sơ đăng ký quyền tác giả, nhãn hiệu của nhóm (xem [`docs/ho-so-so-huu-tri-tue.md`](docs/ho-so-so-huu-tri-tue.md), Mục B1 «Phải loại trừ khỏi phần khai»).

Cách duy trì: **mỗi khi thêm, nâng cấp hoặc gỡ một thư viện, phông chữ, bộ dữ liệu, mô hình hay dịch vụ**, cập nhật bảng tương ứng dưới đây trong cùng PR. Bộ test `test/third-party-notices.test.js` kiểm tra rằng mọi tệp trong `js/vendor/`, `vendor/` và mọi họ phông trong `assets/fonts/` đều có mặt ở đây.

*English summary at the end.*

---

## 1 · Thư viện JavaScript đóng gói trong kho (tải cùng trang, không qua CDN)

| Thành phần | Phiên bản | Giấy phép | Tệp trong kho | Dùng ở đâu |
|---|---|---|---|---|
| **three.js** (lõi + bản mô-đun) · Three.js Authors | r184 | MIT | `js/vendor/three.module.js`, `js/vendor/three.core.js`, `vendor/three/three.module.js`, `vendor/three/three.core.js` | Mọi cảnh 3D: Bật Nghiệp 3D, Bến Phù Sa 3D, Hộ Chiếu Thương Hiệu 3D, Hộ Chiếu Sầu Riêng 3D, Vũ trụ, trung tâm 3D |
| **three.js** (bản UMD cũ, không còn được dự án three.js duy trì) | r15x | MIT | `js/vendor/three.min.js` | Một số trang 3D cũ còn nạp kiểu `<script>` |
| **three.js add-ons** · OrbitControls, GLTFLoader, SkeletonUtils, BufferGeometryUtils | r184 | MIT | `js/vendor/OrbitControls.js`, `vendor/three/OrbitControls.js`, `js/vendor/GLTFLoader.js`, `js/vendor/SkeletonUtils.js`, `js/vendor/BufferGeometryUtils.js` | Điều khiển camera, nạp mô hình `.glb` |
| **GSAP** · GreenSock / Webflow | 3.15.0 | GSAP Standard «No Charge» License (miễn phí kể cả thương mại; không được dùng để dựng công cụ tạo hoạt ảnh không mã cạnh tranh với Webflow; không phải mã nguồn mở) — https://gsap.com/community/standard-license/ | `js/vendor/gsap.min.js` | Hoạt ảnh giao diện ở 3 trang |
| **@formkit/auto-animate** · FormKit Inc. | 0.10.0 | MIT (bản sao giấy phép: `vendor/auto-animate/LICENSE`) | `js/vendor/auto-animate.min.js` (gói lại thành biến toàn cục `window.autoAnimate`, có ghi chú trong tệp), `vendor/auto-animate/index.mjs` | Chuyển động danh sách ở Hộ Chiếu Thương Hiệu (thẻ + 3D) |
| **D3** · Mike Bostock | 7.9.0 | ISC | `js/vendor/d3.min.js` | Bản đồ thế giới trong Hộ Chiếu Thương Hiệu (`js/bp-worldmap.js`) |
| **topojson-client** · Mike Bostock | 3.1.0 | ISC | `js/vendor/topojson-client.min.js` | Giải nén dữ liệu bản đồ |
| **QR Code Generator for JavaScript** · Kazuhiko Arase | bản 2009 (tệp gốc của tác giả) | MIT (ghi chú giấy phép ở đầu tệp). «QR Code» là nhãn hiệu của DENSO WAVE | `js/vendor/qrcode.js` | Mã QR mở từng sản phẩm trên trang tổng hợp CHAM (`cham/index.html`) |
| **React** và **ReactDOM** · Meta Platforms | 18.3.1 | MIT | `vendor/react/react.production.min.js`, `vendor/react/react-dom.production.min.js` | Các trang tài liệu `*.dc.html`, Trang Giảng viên, trang thiết kế trong `design/`; các trang này ánh xạ URL unpkg sang bản cục bộ qua `window.__resources` nên **không gọi ra unpkg** |
| **PeerJS** | 1.5.4 | MIT | `vendor/peerjs/peerjs.min.js` | Chơi theo nhóm ngang hàng trong «Ben Phu Sa Game v4 Nhom.dc.html» (kèm máy chủ tín hiệu công cộng của PeerJS, xem Mục 5) |
| **Tailwind CSS** · Tailwind Labs | bản dựng rút gọn | MIT | `css/tw.css` (44 KB, chỉ chứa lớp tiện ích được dùng) | 10 trang |
| **Bản dựng Vite của trang lớp học KT330H** | — | React (MIT), biểu tượng **lucide-react** (ISC) và các gói phụ thuộc của chúng, đóng gói trong một tệp | `kt330h/assets/index-*.js` | `kt330h/index.html` |

Mã còn lại trong `js/`, `*.html`, `css/` (engine mô phỏng, cố vấn, hành trình, giao diện đất sét, service worker…) do nhóm tác giả viết.

## 2 · Phông chữ tự lưu trữ (`assets/fonts/`)

Tất cả theo **SIL Open Font License 1.1** (bản sao: `assets/fonts/OFL.txt`). OFL chỉ áp dụng cho các tệp phông; nó không ràng buộc phần còn lại của kho. Tên phông được bảo lưu theo điều khoản OFL.

| Họ phông | Tác giả / nguồn | Tệp |
|---|---|---|
| Be Vietnam Pro | Lâm Bảo, Tony Lê, Vietnam Type Foundry · Google Fonts | `BeVietnamPro-{300…800}-{latin,latin-ext,vietnamese}.woff2` |
| Plus Jakarta Sans | Tokotype · Google Fonts | `PlusJakartaSans-var-*.woff2` |
| Manrope | Mikhail Sharanda · Google Fonts | `Manrope-var-*.woff2` |
| IBM Plex Mono | IBM · Google Fonts | `IBMPlexMono-{400,600}-*.woff2` (một số bảng kiểu đặt tên họ là «JetBrains Mono» nhưng trỏ vào chính các tệp IBM Plex Mono này; không có tệp JetBrains Mono trong kho) |
| DM Serif Display | Colophon Foundry · Google Fonts | `DMSerifDisplay-400-*.woff2` |
| Nunito | Vernon Adams, Cyreal, Jacques Le Bailly · Google Fonts | `Nunito-var-*.woff2` |
| Baloo 2 | Ek Type · Google Fonts | `Baloo2-var-*.woff2` |

## 3 · Dữ liệu và mô hình 3D

| Thành phần | Giấy phép | Tệp | Ghi chú |
|---|---|---|---|
| **Bản đồ thế giới 1:110m** (`world-atlas`, topojson) · Mike Bostock | ISC; dữ liệu gốc **Natural Earth** thuộc phạm vi công cộng | `js/vendor/countries-110m.json` | Bản đồ trong Hộ Chiếu Thương Hiệu |
| **Đường bờ cù lao Tân Lộc và sông Hậu** · © OpenStreetMap contributors | ODbL 1.0 (ghi nguồn bắt buộc) | `assets/geo/tan-loc-clay.svg` | Giản lược để minh họa; dòng ghi nguồn đặt ngay dưới bản đồ trên `cham-homestay.html` và `cham/website.html` |
| **Mô hình nhà kho và container** · Kenney.nl, City Kit: Industrial v2.0 | CC0 1.0 (không bắt buộc ghi công; ghi để minh bạch) | `assets/models/tan-cang-warehouse.glb`, `assets/models/crate.glb`, `assets/models/Textures/colormap.png` | Chi tiết: `assets/models/SOURCES.md` |

## 4 · Tài nguyên tải từ máy chủ ngoài khi vận hành

Các trang chính của bizonland.com (trang chủ, bốn trò chơi, hành trình, trang giảng viên, chính sách…) **không tải phông hay mã từ CDN**. Ngoại lệ, liệt kê để người dùng và cơ quan thẩm định biết:

| Nguồn ngoài | Trang | Ghi chú |
|---|---|---|
| **Google Fonts** (`fonts.googleapis.com`, `fonts.gstatic.com`) — phông OFL, phát qua máy chủ Google | `kt330h/index.html`, `BizOn Game 3D.html`, `Characters 3D.html`, `HQ Asset Gallery.html`, `Trang Giang Vien.dc.html`, 4 trang thang điểm `*.dc.html` | Điều khoản dịch vụ Google Fonts; trình duyệt gửi địa chỉ IP tới Google khi mở các trang này |
| **unpkg.com** — three.js 0.184.0 (MIT) qua import map | 3 trang xưởng ghe `bp3d-boat/` | Công cụ nội bộ dựng mô hình ghe, không nằm trong luồng chơi |
| **unpkg.com** — `@babel/standalone` 7.29.0 (MIT) | `bp3d-explainer.html` | Trang giải thích kỹ thuật |
| **esm.sh** — three.js 0.160.0 (MIT) | Hộ Chiếu Sầu Riêng 3D | Chỉ là **dự phòng** khi `window.THREE` chưa nạp được từ bản cục bộ |
| **YouTube** (`youtube-nocookie.com`) | Kho Âm nhạc | Chỉ tải sau khi người xem bấm phát |

## 5 · Dịch vụ bên thứ ba (không phải mã trong kho)

| Dịch vụ | Vai trò | Điều khoản |
|---|---|---|
| **Supabase** (Postgres, Auth, PostgREST) | Lưu kết quả lớp học, đăng nhập, RPC. Nhóm chỉ sở hữu phần SQL trong `supabase/` và mã gọi trong `js/`; nhóm **không dùng** thư viện `supabase-js` mà gọi REST trực tiếp | Supabase Terms of Service |
| **GitHub Pages** · GitHub Actions | Lưu trữ trang tĩnh và CI | GitHub Terms of Service |
| **Google Play** · Trusted Web Activity | Ứng dụng Android `io.github.thuyhuongctu.bizon` bọc trang web; mã bọc sinh bởi Bubblewrap, dùng thư viện **android-browser-helper 2.2.0** (Apache License 2.0) | Google Play Developer Distribution Agreement |
| **PeerJS Cloud** (máy chủ tín hiệu công cộng) | Kết nối ngang hàng cho chế độ chơi nhóm | Điều khoản của PeerJS |
| **Zenodo** (CERN) | DOI 10.5281/zenodo.21592241 cho bản phát hành | Điều khoản Zenodo |

## 6 · Công cụ phát triển (không được phân phối cùng sản phẩm)

Chỉ chạy trên máy phát triển hoặc trong CI; không có mã của chúng trong trang web: Node.js, **Playwright** (Apache 2.0, kiểm thử trình duyệt), **html-validate** (MIT), **sharp**/libvips (Apache 2.0 / LGPL, xử lý ảnh), **ffmpeg** (LGPL, mã hoá lại video MP4 H.264/AAC), **rembg** (MIT) với mô hình U²-Net (Apache 2.0, tách nền ảnh — tệp mới, không ghi đè ảnh gốc), **Demucs** (MIT, tách giọng khỏi nhạc nền), **faster-whisper** (MIT) với mô hình Whisper (MIT, nhận dạng lời để kiểm phát âm), **edge-tts** (LGPL-3.0, gọi dịch vụ đọc của Edge), Android SDK và Gradle (xây gói Android), các action chính thức của GitHub.

## 7 · Nội dung được tạo với sự hỗ trợ của công cụ AI

Một phần tài sản nghe nhìn của BizOn được dựng với công cụ AI rồi do nhóm tác giả biên tập, chọn lọc và tích hợp; nhóm **không** kê các phần máy tạo thuần tuý là tác phẩm của mình (phương án A, Mục F1 hồ sơ SHTT). Ghi ở đây để minh bạch với người dùng và cơ quan thẩm định:

| Nhóm tài sản | Phần công cụ tham gia | Phần của con người |
|---|---|---|
| Hình ảnh nhân vật, bối cảnh, sa bàn (`assets/`) | Tạo ảnh bằng công cụ AI | Ý tưởng, mô tả, chọn bản, tách nền, biên tập, hệ thống tạo hình thống nhất 760 × 1100 px |
| Bản thu âm nhạc (`assets/audio/`) | Hoà âm và giọng hát bằng công cụ sản xuất nhạc có AI (ghi trong `docs/loi-bai-hat.md`) | Toàn bộ lời ca, thể loại, nhịp độ, cấu trúc bài, nghe chọn qua nhiều vòng |
| Giọng Lumina và giọng Tú Phan | Mô hình giọng nhân bản | Giọng gốc là **giọng của chính hai tác giả**, tự đồng ý (xem `docs/ip/BIZON_EXTERNAL_MEDIA_PROVENANCE_phan-anh-tu-media_2026-08-04.md`) |
| Video giới thiệu (`assets/video/`) | Dựng hình bằng công cụ AI, ghép bằng ffmpeg | Kịch bản, lời dẫn, dựng, phụ đề |
| Lời đọc trailer Bật Nghiệp bản v3 (`assets/video/bizon-trailer-v3.mp4`) | Giọng thần kinh `en-US-AvaMultilingualNeural` của Microsoft (dịch vụ đọc của Edge); nhạc nền tách từ bản v2 bằng Demucs | Kịch bản, chọn cách đọc từng tên riêng tiếng Việt, căn giờ, trộn — xem `docs/video/trailer-bat-nghiep-loi-doc.md` |

Điều khoản dịch vụ của từng công cụ tại thời điểm tạo được lưu kèm hồ sơ SHTT (việc 🔎 trong tài liệu nguồn gốc media).

## 8 · Nhãn hiệu và tên gọi của bên thứ ba xuất hiện trong nội dung

- **Trường Đại học Cần Thơ** và **Trường Kinh tế** (`assets/docs/ctu-logo.png`, `assets/docs/soe-logo.png`): logo thuộc nhà trường; chỉ xuất hiện trên chứng nhận của lớp có cấu hình đơn vị cấp là CTU và trong tư liệu lớp học KT330H; không phải tài sản của nhóm và không nằm trong đơn nhãn hiệu nào của BizOn.
- Tên các nền tảng được nhắc tới để so sánh trong tài liệu học thuật (Capsim, Harvard Business Publishing, Forio…) là nhãn hiệu của chủ sở hữu tương ứng, dùng theo nghĩa mô tả.
- Các thương hiệu trong trò chơi (Alpha, Star Clay, Mekong, Kim Long Exports, Lumina…) là **hư cấu**, do nhóm tạo ra.
- Bộ học liệu CHAM (`cham/`) nhắc tên cơ sở và nền tảng có thật theo nghĩa mô tả, lấy từ thông tin đăng công khai: **Homestay Cẩm Lụa** (đối thủ trong Đấu trường Tân Lộc, giá theo thông tin đăng công khai, cần kiểm chứng), các vườn và di tích trên cù lao Tân Lộc, **Foody**, **Facebook**, **Zalo**. «Sơn Ca Garden» và «Green Lộc Retreat» trong Đấu trường là **hư cấu**.
- Ảnh minh họa đất sét trên trang Góc giảng viên (`assets/giang-vien/*.webp`) và ảnh chính của bộ CHAM (`assets/cham/clay/*.webp`) do tác giả cung cấp (29/10/2026), thuộc nhóm tài sản tạo với công cụ AI ở Mục 7. Ảnh minh họa vườn trái cây, làng nghề, món ăn và thức uống trên màn hình «Khám phá cù lao» (`assets/cham/anh/*.webp`) cũng do tác giả cung cấp; tên vườn, làng nghề ghi theo tác giả, không phải ảnh chụp cơ sở thật. Mọi ảnh trưng bày trong `assets/cham/` và `assets/giang-vien/` có dòng bản quyền in trên ảnh, góc dưới bên phải: «© 2026 Đỗ Thùy Hương · CHAM Tân Lộc» cho ảnh CHAM, «© 2026 BizOn · Đỗ Thùy Hương & Phan Anh Tú» cho ảnh Góc giảng viên; trang neo ảnh về góc này khi khung cắt ảnh. Ảnh `ca-phe-sua-da.webp` có hộp sữa đặc mang nhãn giống một thương hiệu sữa trong nước, chỉ là chi tiết trang trí. Ảnh `bang-diem-csv.webp` có tên một số thương hiệu quốc tế làm chữ trang trí trong bảng mẫu; các tên này là nhãn hiệu của chủ sở hữu, xuất hiện theo nghĩa minh họa, không hàm ý liên kết.

---

## English summary

This file lists every component of BizOn that the two authors did not create, with its licence: vendored JavaScript libraries (three.js r184 and add-ons, MIT; GSAP 3.15.0, GSAP Standard "No Charge" License; @formkit/auto-animate 0.10.0, MIT; D3 7.9.0 and topojson-client 3.1.0, ISC; React 18.3.1, MIT; PeerJS 1.5.4, MIT; a purged Tailwind CSS build, MIT; a Vite bundle with React and lucide-react for the KT330H classroom page; Kazuhiko Arase’s QR Code Generator, MIT), self-hosted fonts under the SIL Open Font License 1.1 (Be Vietnam Pro, Plus Jakarta Sans, Manrope, IBM Plex Mono, DM Serif Display, Nunito, Baloo 2), OpenStreetMap coastline data for the Tân Lộc map (ODbL), the world-atlas 110m map (ISC, Natural Earth data in the public domain), two Kenney.nl models (CC0), the few pages that still load Google Fonts, three.js or Babel from a CDN, the hosted services the product relies on (Supabase, GitHub Pages, Google Play with android-browser-helper under Apache 2.0, PeerJS Cloud, Zenodo), development-only tools, AI-assisted media with the human contribution stated, and third-party marks that appear in the content. None of these components is covered by BizOn's proprietary licence or claimed in the authors' copyright or trademark filings. Update the relevant table in the same pull request whenever a dependency changes; `test/third-party-notices.test.js` checks that every vendored file and font family is listed.
