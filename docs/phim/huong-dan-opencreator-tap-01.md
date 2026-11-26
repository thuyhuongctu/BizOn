# Dựng cảnh nhân vật tập 1 bằng OpenCreator

Hướng dẫn cho việc T010 của đặc tả 008: Hương dựng các cảnh nhân vật (NV) của tập 1 «Sà lan hay xe tải?», gửi qua Drive trong khoảng 29/11–02/12/2026, kịp ra mắt ngày 13/12.

- Bảng gốc của từng cảnh (khung hình, ảnh tham chiếu, mô tả tiếng Anh): `docs/phim/tap-01-phan-canh.md`. Mô tả cảnh lấy từ bảng đó, không gõ lại.
- Quy tắc chung của loạt phim: `docs/phim/khung-loat-phim.md`. Ba điều không đổi: cảnh không có chữ, chỉ dùng nhân vật có sẵn trong game, giọng Lumina do Hương tự thu.

OpenCreator (tên cũ KrillinAI) là ứng dụng mã nguồn mở, giấy phép Apache 2.0, chạy trên máy tính, nguồn: https://github.com/krillinai/OpenCreator. Ta chỉ dùng hai mục **Video Generation** và **Image Generation**. Không dùng các mục đọc thành tiếng, lồng tiếng, hoạt hình người que hay viết kịch bản.

## 1. Cài đặt (một lần)

1. Tải bộ cài cho máy ở trang https://github.com/krillinai/OpenCreator/releases/latest: macOS Apple Silicon, macOS Intel hoặc Windows x64.
2. Cài và mở ứng dụng. Lần đầu, ứng dụng hỏi tài khoản mô hình: dùng đăng nhập ChatGPT có sẵn, hoặc nhập khóa API.
3. Vào **Settings → AI Services**, chọn dịch vụ tạo video (Seedance, Kling hoặc Veo) và dịch vụ tạo ảnh. Ghi lại tên dịch vụ, gói đang dùng vào mục 5 bên dưới.
4. Tạo một dự án tên `BizOnland-Phim-Tap01`. Chép các ảnh tham chiếu ở bảng mục 3 từ kho BizOn (thư mục `assets/…`) vào máy để tải lên khi dựng.

## 2. Thử trước hai cảnh

Trước khi dựng cả tập, thử **C03 (Bác Ba)** và **C05 (Minh Khang)**, mỗi cảnh hai lần. Đạt khi:

- nhân vật giống ảnh tham chiếu (nón lá, khăn rằn của Bác Ba; tóc bạc, kính tròn, áo polo xanh xám của Minh Khang);
- trông như đất nặn, không phải 3D bóng;
- không có chữ, biển hiệu, logo nào trên hình;
- dài 5–8 giây, khung 16:9.

Nếu một trong bốn điều trên không đạt sau hai lần, thử dịch vụ video khác trong **AI Services**, rồi báo em để sửa mô tả cảnh.

## 3. Các bước cho mỗi cảnh

1. Mở **Video Generation**. Chọn mô hình, khung hình **16:9**, độ phân giải 1080p nếu có, thời lượng theo bảng dưới.
2. Tải ảnh tham chiếu lên làm ảnh đầu vào. Cảnh có nhiều nhân vật thì đưa ảnh nhân vật chính trước.
3. Dán mô tả tiếng Anh của cảnh từ `tap-01-phan-canh.md`, giữ nguyên đuôi `claymation stop-motion style, handmade clay figures, warm cinematic light, 16:9, no text, no signs, no logos, no subtitles`.
4. Bấm tạo. Mỗi lần tạo lại, OpenCreator lưu thành một phiên bản mới, bản cũ vẫn còn. Cảnh C01, C14, C17 nên tạo 2–3 bản để em chọn.
5. Tải về, đặt tên theo mã cảnh như kế hoạch sản xuất: `C03.mp4`; bản dựng thêm là `C03-b.mp4`, `C03-c.mp4`. Cảnh dài phải dựng thành nhiều đoạn thì thêm số đoạn: `C17-d1.mp4`, `C17-d2.mp4` (bản dựng thêm: `C17-d1-b.mp4`).
6. Gửi vào Drive `13. BizOnland Phim/Mua-1/Tap-01/03-canh-nv/` (cây thư mục ở `docs/phim/ke-hoach-san-xuat.md`).

| Mã | Dài | Nhân vật | Ảnh tham chiếu | Ghi chú dựng |
|---|---|---|---|---|
| C01 | 8 giây | Tèo Soi, Bác Ba (xa) | `assets/dragon/teo-soi/countdown.webp`, `assets/hc/cast/bac-ba-v4-cut.webp` | Cảnh mở đầu: tạo 2–3 bản |
| C03 | 7 giây | Bác Ba | `assets/hc/cast/bac-ba-v4-cut.webp` | Cảnh thử |
| C04 | 8 giây | – | `assets/hc/durian/cang-boc-xep-container.webp` | Cảnh sông, không nhân vật |
| C05 | 7 giây | Minh Khang | `assets/character/advisors/minh-khang-cut.webp` | Cảnh thử |
| C07 | 5 giây | Lina Park | `assets/hc/cast/lina-park-cut-v3.webp` | |
| C09 | 8 giây | An Nhiên | `assets/hc/cast/an-nhien-qa-dong-lanh-cut.webp` | |
| C10 | 12 giây | Kim Long | `assets/hc/cast/kim-long-ceo.png` | Dựng 2 đoạn: văn phòng (6 giây), bãi xe lạnh (6 giây) |
| C11 | 6 giây | – | `assets/hc/durian/cabin-xe-lanh.webp` | |
| C13 | 10 giây | Minh Khang, Lina Park, Tèo Soi | `assets/character/advisors/minh-khang-cut.webp`, `assets/hc/cast/lina-park-cut-v3.webp`, `assets/dragon/teo-soi/inspect.webp` | Dựng 2 đoạn 5 giây nếu mô hình chỉ cho tối đa 5–8 giây |
| C14 | 10 giây | Bà Sáu Lành | `assets/hc/cast/ba-sau-lanh-v4-cut.webp` | Cảnh cú lật: tạo 2–3 bản |
| C16 | 7 giây | – | `assets/hc/durian/tau-keo-roi-cang.webp` | |
| C17 | 20 giây | Bác Ba, Bà Sáu Lành, Minh Khang, Lina Park, An Nhiên, Tèo Soi | ảnh của sáu nhân vật, xem bảng gốc | Cảnh cả nhóm: dựng 3 đoạn khoảng 7 giây, mỗi đoạn 2–3 nhân vật; tạo 2–3 bản |
| C20 | 6 giây | Tèo Soi | `assets/dragon/teo-soi/inspect.webp` | |

Các cảnh số liệu (SL: C02, C06, C08 và các cảnh còn lại) em dựng bằng trang cảnh HTML, Hương không cần làm.

## 4. Vẽ lại khung Stitch (không bắt buộc)

Khung Stitch ở Drive `13. BizOnland Phim/Mua-1/00-chung/khung-hinh-stitch/` còn chữ «DURIAN EXPRESS», logo và phong cách 3D bóng (xem mục 11 của `khung-loat-phim.md`). Nếu muốn dùng làm bối cảnh:

1. Mở **Image Generation**, tải khung Stitch lên làm ảnh tham chiếu, khung 16:9.
2. Lời nhắc: tả lại bối cảnh, thêm đuôi `claymation stop-motion style, no text, no letters, no logos, no signage, no brand names, no flags, no maps`.
3. Không để Kim Long đứng ở vị trí của hợp tác xã; không thêm nhân vật mới rõ mặt.
4. Lưu tên `stitch-<tên cũ>-v2.png`, không ghi đè tệp gốc.

## 5. Điều khoản cần ghi lại (chép sang mục 10 của `khung-loat-phim.md`)

Giấy phép Apache 2.0 chỉ áp cho mã của OpenCreator. Quyền dùng video làm ra do điều khoản của dịch vụ tạo video và gói tài khoản quyết định. Trước khi phát hành, Hương ghi:

- dịch vụ video và ảnh đã dùng, gói tài khoản;
- gói ấy có cho dùng thương mại không (cần biết trước khi nhận tài trợ cho loạt phim);
- có phải ghi nguồn hay gắn nhãn «tạo bằng AI» không;
- chi phí ước tính cho tập 1 (số lần tạo × giá mỗi lần).

Ảnh tham chiếu được gửi lên dịch vụ đám mây của mô hình. Chỉ đưa ảnh nhân vật của game, không đưa ảnh người thật.

## 6. Em làm gì khi nhận cảnh

- Chọn bản đẹp nhất, ghép với cảnh số liệu, giọng Lumina, nhạc nền và chữ chèn (tên nhân vật, số liệu, phụ đề VI/EN) bằng quy trình dựng của tập 1.
- Kiểm thành phẩm bằng `scripts/kiem-video.mjs` và nghe soát bằng Whisper.
- Cảnh nào lệch nhân vật hay lọt chữ, em báo mã cảnh và sửa mô tả để Hương dựng lại.
