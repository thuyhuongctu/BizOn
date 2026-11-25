# Kế hoạch sản xuất phim hoạt hình «Đưa trái ra biển» – Mùa 1

Phim hoạt hình đất nặn, câu chuyện thương hiệu BizOnland. Bản 23/11/2026.

Tài liệu liên quan:
- đặc tả và kế hoạch kỹ thuật: `specs/008-phim-dua-trai-ra-bien/`;
- khung loạt phim: `docs/phim/khung-loat-phim.md`;
- tập 1: `docs/phim/tap-01-*.md`;
- nguồn số liệu: `docs/phim/nguon-so-lieu.md`.

Tệp này là **bảng điều hành sản xuất**: ai làm gì, khi nào, lưu tệp ở đâu, duyệt ở cổng nào. Mỗi khi lịch đổi, em sửa tệp này trước.

## 1. Phạm vi

| Hạng mục | Mùa 1 |
|---|---|
| Số tập | 6 tập dài và 1 đoạn dọc chúc Tết |
| Thời lượng | Tập dài 4–6 phút (khoảng 4:45); teaser 15 giây; 3 đoạn dọc 30–45 giây mỗi tập |
| Ngôn ngữ | Tiếng Việt và tiếng Anh, mỗi tập hai video riêng, phụ đề `.vtt` hai thứ tiếng |
| Phong cách | Đất nặn 3D, ánh sáng ấm, khung 16:9 (đoạn dọc 9:16) |
| Người kể | Lumina, giọng Hương tự thu. Nhân vật khác nói bằng bong bóng chữ |
| Phát hành | Kênh YouTube @jemappellehuong (playlist «Đưa trái ra biển»), Facebook, TikTok, LinkedIn, trang loạt phim trên bizonland.com |
| Nhịp | Hai tuần một tập, Chủ nhật 20:00, nghỉ quanh Tết Đinh Mùi (6/2/2027) |

## 2. Đội ngũ và phân vai

| Việc | Hương | Em (Claude) | Thầy Tú |
|---|---|---|---|
| Ý tưởng mùa, chọn quyết định từng tập | **Quyết** | Đề xuất | Góp ý |
| Tra số liệu, ghi nguồn | Duyệt | **Làm** | Góp ý học thuật |
| Kịch bản VI/EN, câu hỏi thảo luận | **Duyệt** (cổng 1) | **Làm** | Góp ý |
| Bảng phân cảnh, mô tả cảnh cho công cụ video | Xem | **Làm** | – |
| Thu giọng Lumina VI + EN | **Làm** | Soát bằng Whisper, cắt câu | – |
| Dựng cảnh nhân vật (công cụ video) | **Làm** | Chọn bản, báo cảnh lỗi | – |
| Dựng cảnh số liệu, bản đồ, chữ, bong bóng thoại | Xem | **Làm** | – |
| Ghép, nhạc, phụ đề, chuẩn độ to | Duyệt (cổng 2, 3) | **Làm** | – |
| Chiếu thử cho sinh viên | Làm (lớp của Hương) | Tổng hợp phiếu | **Làm** (lớp của thầy) |
| Teaser, đoạn dọc, ảnh bìa, mô tả video | Duyệt | **Làm** | – |
| Đăng tải, hẹn giờ, thăm dò, trả lời bình luận | **Làm** | Soạn sẵn mẫu | – |
| Trang loạt phim, màn chơi trên bizonland.com | Xem | **Làm** (PR) | – |
| Số liệu người xem 7 và 30 ngày | Xuất số từ YouTube Studio và Meta | Ghi, phân tích | – |
| Tài trợ, pháp nhân, bảng giá | **Quyết** | Soạn nháp | **Quyết** cùng Hương |

## 3. Dây chuyền một tập (mẫu 21 ngày, R là ngày phát hành)

Từ tập 2, mỗi tập chạy theo mẫu dưới đây. Hai tập liền nhau chồng lên nhau khoảng một tuần: khi tập trước phát hành thì tập sau đã ở bước dựng cảnh.

| Mốc | Bước | Ai | Đầu ra |
|---|---|---|---|
| R−21 → R−18 | Tra số liệu, viết kịch bản VI/EN, **viết sẵn hai nhánh mở đầu** theo hai lựa chọn của tập trước | Em | `docs/phim/tap-NN-kich-ban.md`, cập nhật `nguon-so-lieu.md` |
| R−17 | **Cổng 1: duyệt kịch bản** | Hương | Góp ý hoặc «Duyệt» |
| R−16 → R−15 | Bảng phân cảnh, mô tả cảnh, lời thu giọng | Em | `tap-NN-phan-canh.md`, `tap-NN-loi-thu-giong.md` |
| R−14 → R−10 | Thu giọng (khoảng 1 giờ); dựng cảnh nhân vật, kể cả cảnh của hai nhánh (khoảng 3–5 giờ) | Hương | Thư mục Drive `02-giong/`, `03-canh-nv/` |
| R−14 → R−9 | Dựng cảnh số liệu, tệp ghép, bản nháp (thẻ chữ thay cảnh còn thiếu) | Em | `scripts/video/dua-trai-ra-bien/tap-NN.ghep.json` |
| R−8 | Cắt giọng theo câu, soát Whisper, ghép bản nháp có giọng và cảnh thật | Em | `04-ban-nhap/` |
| R−7 | **Bình chọn tập trước đóng**; ghép nhánh mở đầu đúng lựa chọn số đông, chèn tỷ lệ phiếu thật | Em | Bản nháp hoàn chỉnh |
| R−6 | **Cổng 2: duyệt nhịp**; chiếu thử nếu có lớp | Hương, thầy Tú | Góp ý |
| R−5 → R−4 | Chỉnh; Hương dựng lại cảnh lỗi nếu có; bản cuối VI/EN, kiểm chất lượng (mục 7) | Em, Hương | `05-ban-cuoi/` |
| R−4 | **Cổng 3: duyệt bản cuối** | Hương | «Duyệt» |
| R−4 → R−3 | Teaser 15 giây, 3 đoạn dọc, ảnh bìa, mô tả video, mẫu thăm dò | Em | `06-doc-teaser/`, `07-anh-bia/` |
| R−3 (Thứ 5) | Đăng teaser (Shorts, Reels, TikTok) | Hương | – |
| R−2 → R−1 | **Cổng 4: kiểm trước khi đăng**; tải lên YouTube ở chế độ hẹn giờ, phụ đề, màn hình kết thúc, playlist, «không dành cho trẻ em»; cập nhật trang loạt phim | Hương, em | Mã YouTube trong `js/phim-data.js` |
| R (CN 20:00) | Phát hành; mở thăm dò 7 ngày; đăng Facebook | Hương | – |
| R+1, R+3, R+5 | Đăng 3 đoạn dọc | Hương | – |
| R+2 | Bài LinkedIn «số liệu thật đằng sau tập phim» | Hương (em soạn) | – |
| R+7 | Đóng thăm dò, ghi kết quả; lấy số liệu 7 ngày | Hương, em | `docs/phim/so-lieu-phat-hanh.md` |
| R+30 | Lấy số liệu 30 ngày | Hương, em | Như trên |

## 4. Lịch mùa 1

Tập 1 làm theo lịch rút gọn vì bắt đầu ngày 23/11/2026. Từ tập 2 theo mẫu ở mục 3.

### Tập 1 · Sà lan hay xe tải? · phát CN 13/12/2026

| Ngày | Việc | Ai |
|---|---|---|
| 23/11 | Khung loạt phim, nguồn số liệu, kịch bản, phân cảnh, lời thu giọng (PR #1193) | Em – **xong** |
| 23/11 | **Cổng 1: duyệt kịch bản** | Hương – **xong** |
| 27–28/11 | Chỉnh theo góp ý; gộp PR 1 khi Hương nói «Gộp» | Em |
| 29/11–02/12 | Thu giọng VI + EN; dựng 13 cảnh nhân vật | Hương |
| 29/11–03/12 | Trang cảnh số liệu, script dựng (PR 2); trang loạt phim (PR 3) | Em |
| 04/12 | **Cổng 2: duyệt nhịp**; chiếu thử | Hương, thầy Tú |
| 05–07/12 | Chỉnh; quy trình đăng và công cụ cắt đoạn dọc (PR 5); màn chơi chọn tuyến (PR 4) | Em, Hương |
| 08/12 | **Cổng 3: duyệt bản cuối** | Hương |
| 09/12 | Teaser, 3 đoạn dọc, ảnh bìa, mô tả | Em |
| Th 5 10/12 | Đăng teaser | Hương |
| 11–12/12 | **Cổng 4**; hẹn giờ tập 1 | Hương, em |
| CN 13/12 20:00 | **Phát hành tập 1**; mở thăm dò | Hương |
| CN 20/12 | Đóng thăm dò tập 1 | Hương |

### Tập 2–6

| Tập | Viết kịch bản | Cổng 1 | Thu giọng + cảnh NV | Bình chọn tập trước đóng | Cổng 2 | Cổng 3 | Teaser | **Phát hành** |
|---|---|---|---|---|---|---|---|---|
| 2 · Tươi hay cấp đông? | 06–09/12 | Th 5 10/12 | 13–17/12 | CN 20/12 | Th 2 21/12 | Th 4 23/12 | Th 5 24/12 | **CN 27/12/2026** |
| 3 · Chốt cước hay chờ? | 20–23/12 | Th 5 24/12 | 27–31/12 | CN 03/01 | Th 2 04/01 | Th 4 06/01 | Th 5 07/01 | **CN 10/01/2027** |
| 4 · Tự lập điểm gom? | 03–06/01 | Th 5 07/01 | 10–14/01 | CN 17/01 | Th 2 18/01 | Th 4 20/01 | Th 5 21/01 | **CN 24/01/2027** |
| – Chúc Tết (đoạn dọc) | – | – | – | – | – | – | – | Th 6 05/02/2027 |
| 5 · Rẻ, nhanh hay đủ? | 24–27/01 | Th 4 28/01 | **31/01–04/02 (làm trước Tết)** | CN 31/01 | Th 2 15/02 | Th 4 17/02 | Th 5 18/02 | **CN 21/02/2027** |
| 6 · Tới bến | 14–17/02 | Th 5 18/02 | 21–25/02 | CN 28/02 | Th 2 01/03 | Th 4 03/03 | Th 5 04/03 | **CN 07/03/2027** |

Ghi chú:
- **Tập 5:** nghỉ Tết từ 05/02 đến 13/02 (từ 28 tháng Chạp đến mùng 7). Mọi việc của Hương cho tập 5 làm xong trước 04/02; em dựng lại sau Tết, từ 14/02.
- **Tuần nặng nhất:** 06–13/12, khi tập 1 sắp phát hành mà tập 2 đã phải viết kịch bản. Em làm kịch bản tập 2 song song để Hương chỉ phải duyệt.
- **Mốc tài trợ (5A):** Hương và thầy Tú chốt pháp nhân nhận tiền và bảng giá trước 10/01/2027 (tập 3).

## 5. Lưu trữ tệp

### Trên Drive (tệp nặng, tệp gốc)

Hương tạo một thư mục chung và chia quyền cho em đọc:

```
BizOnland Phim/
└── Mua-1/
    ├── 00-chung/            ảnh tham chiếu nhân vật, nhạc nền, logo kênh (của BizOnland)
    ├── Tap-01/
    │   ├── 01-kich-ban/     bản PDF kịch bản đã duyệt (xuất từ kho)
    │   ├── 02-giong/vi/     01.wav, 02.wav… (giọng Hương, tệp gốc)
    │   ├── 02-giong/en/
    │   ├── 03-canh-nv/      C01.mp4, C03.mp4… (cảnh nhân vật, kể cả bản dựng lại C01-b.mp4)
    │   ├── 04-ban-nhap/     tap-01-nhap-vi.mp4, tap-01-nhap-en.mp4
    │   ├── 05-ban-cuoi/     tap-01-vi.mp4, tap-01-en.mp4 (bản đăng)
    │   ├── 06-doc-teaser/   tap-01-teaser.mp4, tap-01-doc-1.mp4… (9:16)
    │   ├── 07-anh-bia/      tap-01-bia-vi.jpg, tap-01-bia-en.jpg
    │   └── 08-so-lieu/      ảnh chụp YouTube Studio 7 ngày, 30 ngày
    └── Tap-02/ … Tap-06/
```

### Trong kho GitHub (nhẹ, dựng lại được)

| Loại | Đường dẫn |
|---|---|
| Kịch bản, phân cảnh, lời thu giọng, nguồn, kế hoạch | `docs/phim/` |
| Trang cảnh số liệu, tệp ghép, script dựng | `scripts/video/dua-trai-ra-bien/`, `scripts/video/dung-phim.mjs` |
| Giọng đã cắt theo câu (mp3, nhỏ) | `assets/video/src/dua-trai-ra-bien/tap-NN/{vi,en}/` |
| Phụ đề | `assets/video/subs/dua-trai-ra-bien-NN-{vi,en}.vtt` |
| Ảnh bìa nhúng trên web | `assets/video/dua-trai-ra-bien-NN-poster.webp` |
| Dữ liệu trang loạt phim (mã YouTube, lịch, kết quả bình chọn) | `js/phim-data.js` |

**Bản phim cuối không đưa vào kho**: một tập dài cả bản VI và EN quá nặng cho GitHub Pages. Phim nằm trên YouTube, bản gốc trên Drive.

**Không ghi đè tệp gốc** (hiến chương): bản sửa thêm hậu tố `-v2`, `-v3`…, hoặc `-b`, `-c` cho cảnh dựng lại.

### Quy ước đặt tên

- Tập: hai chữ số (`tap-01`). Cảnh: `C01`…`C20`. Câu giọng: `01`…`29`, theo số câu trong kịch bản.
- Ngôn ngữ ở cuối: `-vi`, `-en`. Không dấu, không khoảng trắng trong tên tệp.

## 6. Cổng duyệt

| Cổng | Khi nào | Hương xem gì | Đạt khi |
|---|---|---|---|
| 1. Kịch bản | R−17 | `tap-NN-kich-ban.md` | Câu chuyện hay, đúng tinh thần BizOnland; số liệu có nguồn; Lumina không chọn giúp |
| 2. Nhịp | R−6 | Bản nháp có giọng và cảnh | 10 giây đầu giữ được người xem; không đoạn nào lê thê; cảnh nhân vật đúng dáng |
| 3. Bản cuối | R−4 | Bản cuối VI và EN | Đạt danh sách kiểm ở mục 7 |
| 4. Trước khi đăng | R−2 | Màn hình tải lên YouTube | Đủ cài đặt: hẹn giờ, phụ đề, màn hình kết thúc, playlist, «không dành cho trẻ em», mô tả có nguồn |

## 7. Danh sách kiểm chất lượng (trước cổng 3)

- [ ] 10 giây đầu có người, có việc, có hạn chót; không giới thiệu kênh trước giây thứ 10
- [ ] Mọi con số trên hình và trong lời đọc có mã nguồn trong `nguon-so-lieu.md`
- [ ] Phim không nói lựa chọn nào đúng; kết bằng câu hỏi
- [ ] Không có chữ do công cụ video sinh ra; mọi chữ tiếng Việt đúng dấu
- [ ] Không có logo hay tên thương mại thật (hãng tàu, cảng, công ty vận tải, hãng xe)
- [ ] Bản đồ do em dựng; nếu vẽ toàn quốc thì có Hoàng Sa và Trường Sa
- [ ] Nhân vật đúng ảnh tham chiếu, không «trôi» dáng
- [ ] Giọng khớp kịch bản (soát Whisper), độ to khoảng −16 LUFS, không rè, không vang
- [ ] Phụ đề VI và EN khớp lời, không tràn hai dòng
- [ ] Bản EN cùng hình, cùng nhịp với bản VI; tên riêng tiếng Việt giữ dấu
- [ ] Nhạc nền là nhạc gốc BizOn
- [ ] Chữ chạy ghi nguồn số liệu và ghi chú «nhân vật, doanh nghiệp, hạn chót là hư cấu»
- [ ] `scripts/kiem-video.mjs` không báo lỗi

## 8. Công cụ

| Việc | Công cụ | Ghi chú |
|---|---|---|
| Dựng cảnh nhân vật | Công cụ video Hương đang dùng cho MV 3D | Hương kiểm điều khoản dùng thương mại, ghi vào `khung-loat-phim.md` mục 10 |
| Thu giọng | Mic hoặc điện thoại của Hương, phòng yên | WAV 48 kHz |
| Soát giọng | faster-whisper (đã cài trên máy của em) | Phát hiện sai dấu tên riêng |
| Cảnh số liệu | Trang HTML vẽ theo khung + Playwright | Giống video Cảng Cái Mép |
| Ghép, phụ đề, độ to | ffmpeg qua `scripts/video/dung-phim.mjs` | Có chế độ nháp `--nhap` |
| Đoạn dọc 9:16 | `scripts/video/cat-doan-doc.mjs` | PR 5 |
| Kiểm video | `scripts/kiem-video.mjs` | Có sẵn |

## 9. Công sức và chi phí

| Hạng mục | Mỗi tập | Ghi chú |
|---|---|---|
| Công của Hương | Khoảng 6–8 giờ | Duyệt 3 cổng (khoảng 1 giờ), thu giọng (1 giờ), dựng cảnh nhân vật (3–5 giờ), đăng tải (30 phút), bình luận (15 phút mỗi ngày trong tuần phát hành) |
| Công của thầy Tú | Khoảng 1 giờ | Góp ý kịch bản, chiếu thử |
| Công của em | Phần còn lại | Kịch bản, số liệu, dựng, hậu kỳ, đoạn dọc, trang web |
| Gói công cụ video | *(Hương ghi)* | Gói Hương đang dùng; ghi thêm nếu phải nâng gói vì số cảnh nhiều hơn |
| Giọng máy | 0 đồng | Không dùng; bản nháp dùng thẻ chữ |
| Nhạc | 0 đồng | Nhạc gốc BizOn |
| Quảng cáo trả tiền | 0 đồng ở tập 1–2 | Cân nhắc sau khi có số liệu 30 ngày |

## 10. Dự phòng

| Nếu | Thì |
|---|---|
| Hương chưa kịp thu giọng hay dựng cảnh trước R−10 | Dời tập đó một tuần (vẫn Chủ nhật 20:00), giữ khoảng cách hai tuần cho các tập sau; báo trên kênh bằng một đoạn dọc «Tập N lùi một tuần» |
| Một cảnh nhân vật không dựng được | Thay bằng ảnh tĩnh của nhân vật có chuyển động máy quay nhẹ, hoặc cảnh số liệu |
| Bình chọn hòa hoặc dưới 30 phiếu | Cộng phiếu của lớp học gần nhất, nói rõ nguồn trong cảnh mở đầu |
| Một số liệu mất nguồn hoặc nguồn bị gỡ | Bỏ số, nói định tính; sửa `nguon-so-lieu.md` |
| Tập đã đăng có lỗi nội dung | Ghim bình luận đính chính và sửa mô tả; lỗi nặng thì gỡ, sửa, đăng lại trong 48 giờ |

## 11. Bảng theo dõi tiến độ

Em đánh dấu sau mỗi bước; Hương xem nhanh ở đây.

| Tập | Kịch bản | Cổng 1 | Giọng | Cảnh NV | Bản nháp | Cổng 2 | Bản cuối | Cổng 3 | Teaser | Phát hành | Bình chọn |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | ✅ 23/11 | ✅ 23/11 | – | – | – | – | – | – | – | 13/12 | – |
| 2 | – | – | – | – | – | – | – | – | – | 27/12 | – |
| 3 | – | – | – | – | – | – | – | – | – | 10/01 | – |
| 4 | – | – | – | – | – | – | – | – | – | 24/01 | – |
| 5 | – | – | – | – | – | – | – | – | – | 21/02 | – |
| 6 | – | – | – | – | – | – | – | – | – | 07/03 | – |
