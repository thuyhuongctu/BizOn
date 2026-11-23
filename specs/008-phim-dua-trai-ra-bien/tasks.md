# Việc cần làm: Loạt phim «Đưa trái ra biển», tập 1 «Sà lan hay xe tải?»

**Đầu vào**: [spec.md](spec.md), [plan.md](plan.md)

**Ký hiệu**:
- `[P]`: làm song song được (khác tệp).
- `[US1]`…`[US4]`: câu chuyện 1…4.
- **(chị)**: việc chị làm tay.
- Test viết trước và phải thấy hỏng.

## Giai đoạn 1 – Tiền kỳ tập 1 (US1, P1) · PR 1 · hạn 28/11/2026

- [X] T001 [US1] Viết `test/phim-dua-trai-ra-bien-kich-ban.test.js`, chạy và thấy hỏng. Test kiểm:
  - kịch bản có đủ 7 nhịp (móc câu, tựa đề, hai phe, leo thang, cú lật, kết treo, hậu đoạn), móc câu kết thúc ≤ 0:10;
  - số câu VI bằng số câu EN, cùng người nói, cùng mốc thời gian;
  - câu kết có câu hỏi «sông hay đường» và không có câu khẳng định lựa chọn nào đúng;
  - mọi con số trong lời thoại có dòng tương ứng trong `docs/phim/nguon-so-lieu.md`, mỗi dòng có URL hoặc tài liệu kèm trang;
  - không có số mô phỏng của game;
  - nhân vật nào cũng có trong danh sách nhân vật có sẵn và có ảnh tham chiếu tồn tại;
  - mô tả cảnh nào cũng có «no text» và «no logos»;
  - không gọi Lumina là «AI».
- [X] T002 [P] [US1] `docs/phim/khung-loat-phim.md`:
  - thế giới Bizonland; mục tiêu mùa 1 (lô sầu riêng đầu tiên của Bác Ba ra thế giới); đối thủ Kim Long Exports;
  - vai, tính cách, câu cửa miệng và ảnh tham chiếu của từng nhân vật;
  - 6 tập và quyết định của từng tập;
  - quy tắc hình ảnh và giọng;
  - mục «Điều khoản công cụ video» để chị ghi kết quả kiểm.
- [X] T003 [US1] Tra nguồn số liệu tuyến Cần Thơ → Cái Mép theo danh sách «Cần tra» trong `plan.md`. Ghi trang cho các số của Báo cáo Logistics Việt Nam 2024 (tệp Drive chị chia sẻ). Viết `docs/phim/nguon-so-lieu.md`. Chọn yếu tố «cú lật» có nguồn chính thống.
- [X] T004 [US1] `docs/phim/tap-01-kich-ban.md`: kịch bản VI/EN theo nhịp mẫu trong `plan.md` (khoảng 4:45). Bảng gồm: số câu, mốc thời gian, người nói, lời VI, lời EN, cảnh, chữ chèn trên hình.
- [X] T005 [US1] Gửi chị bản kịch bản. **(chị) Duyệt kịch bản** (dự kiến 26/11). Chị đã duyệt ngày 23/11/2026.
- [X] T006 [US1] `docs/phim/tap-01-phan-canh.md`: 14–18 cảnh. Mỗi cảnh có: loại (nhân vật / số liệu), thời lượng, khung hình, chuyển động máy quay, nhân vật, ảnh tham chiếu, mô tả cảnh tiếng Anh cho công cụ video. Mô tả luôn có «claymation, 16:9, no text, no signs, no logos».
- [X] T007 [P] [US1] `docs/phim/tap-01-loi-thu-giong.md`: lời Lumina từng câu VI và EN, đánh dấu ngắt nhịp (`/`) và nhấn, chú cách đọc tên riêng trong bản EN. Kèm hướng dẫn thu: phòng yên, cách mic 15–20 cm, WAV 48 kHz, mỗi câu một tệp `01.wav`… và thu thêm một lượt dự phòng.
- [ ] T008 [US1] `sw.js`: nâng `CACHE`. Chạy test mới và `dac-ta`. Mở PR nháp; gộp khi chị nói «Gộp».

**Điểm dừng**: chị có kịch bản đã duyệt, bảng phân cảnh để dựng cảnh nhân vật, lời để thu giọng.

## Giai đoạn 2 – Dựng tập 1 (US1, P1) · PR 2 · hạn 08/12/2026

- [ ] T009 (chị) Thu giọng Lumina VI và EN theo `tap-01-loi-thu-giong.md`. Gửi tệp qua Drive (29/11–02/12).
- [ ] T010 (chị) Dựng 10–14 cảnh nhân vật theo `tap-01-phan-canh.md`, mỗi cảnh 4–8 giây, không chữ. Gửi mp4 qua Drive (29/11–02/12).
- [ ] T011 [US1] Viết `test/phim-dua-trai-ra-bien-dung.test.js`, chạy và thấy hỏng. Test kiểm:
  - `canh.html` chạy được, mỗi cảnh số liệu hiện đúng lượt, không lỗi JS, chữ đúng ngôn ngữ;
  - bản đồ có nhãn Hoàng Sa và Trường Sa nếu vẽ toàn quốc;
  - mọi cảnh trong `tap-01.ghep.json` trỏ tới tệp có thật hoặc cảnh HTML có thật;
  - tổng thời lượng 4–6 phút;
  - `dung-phim.mjs` có `--nhap`, `loudnorm`, xuất phụ đề `.vtt`.
- [ ] T012 [US1] `scripts/video/dua-trai-ra-bien/canh.html`: đồng hồ đếm ngược, bản đồ tuyến (sông và bộ), bảng ba cột của Lumina, thẻ tựa đề, chữ chạy kèm nguồn, khung hé tập 2. Vẽ tất định theo `window.veKhung(t)` như `scripts/video/cang-cai-mep/canh.html`.
- [ ] T013 [US1] `scripts/video/dung-phim.mjs` và `tap-01.ghep.json`:
  - ghép cảnh nhân vật (mp4) với cảnh HTML;
  - chèn chữ VI/EN lên hình;
  - giọng theo câu, nhạc nền gốc BizOn, `loudnorm`;
  - xuất `.vtt`, bản VI và bản EN;
  - `--nhap` thay cảnh thiếu bằng thẻ chữ để duyệt nhịp sớm.
- [ ] T014 [US1] Cắt giọng chị theo câu vào `assets/video/src/dua-trai-ra-bien/tap-01/{vi,en}/NN.mp3`. Nghe soát bằng faster-whisper; báo chị câu nào cần thu lại.
- [ ] T015 [US1] Dựng bản nháp có giọng và cảnh của chị. **(chị) Duyệt nhịp** (dự kiến 04/12). Chỉnh theo góp ý; **(chị)** dựng lại cảnh lỗi nếu cần.
  **(chị hoặc thầy Tú)** chiếu bản nháp cho 5–10 sinh viên chưa biết BizOn, hỏi ba câu ở «Cách thử độc lập» của câu chuyện 1; em tổng hợp vào mô tả PR (SC-002).
- [ ] T016 [US1] Bản cuối VI và EN. Kiểm:
  - `scripts/kiem-video.mjs`, Whisper, độ to khoảng −16 LUFS;
  - danh sách kiểm logo và bản đồ.

  Ảnh bìa `assets/video/dua-trai-ra-bien-01-poster.webp`, phụ đề `assets/video/subs/dua-trai-ra-bien-01-{vi,en}.vtt`. Bản phim cuối để trên Drive, không đưa vào kho. **(chị) Duyệt bản cuối** (dự kiến 08/12).
- [ ] T017 [US1] `sw.js`: nâng `CACHE`. Chạy test mới, `video-cang-cai-mep`. Mở PR nháp; gộp khi chị nói «Gộp».

## Giai đoạn 3 – Trang loạt phim (US1 phát hành, US2 lịch) · PR 3 · hạn 09/12/2026

- [ ] T018 [US2] Viết `test/phim-dua-trai-ra-bien-trang.test.js`, chạy và thấy hỏng. Test kiểm, ở 360 VI, 390 EN và 1280 VI:
  - trang có lịch 6 tập;
  - có đếm ngược tới tập sắp phát, tính từ giờ máy, giả lập ngày bằng `page.clock`;
  - tập đã phát có nút phát `data-yt`; bấm mới tải `youtube-nocookie`;
  - chưa có tập nào thì có trạng thái «sắp phát hành»;
  - có `canonical`, có trong `sitemap.xml`;
  - không tràn ngang, không lỗi JS;
  - ngoại tuyến vẫn mở được trang.
- [ ] T019 [US2] `js/phim-data.js`: các tập (số, tên VI/EN, quyết định, mã YouTube VI/EN để trống tới khi đăng, ngày giờ phát theo giờ Việt Nam), kết quả bình chọn (để trống).
- [ ] T020 [US1] `phim-dua-trai-ra-bien.html`: phần đầu, tập mới nhất, lịch, đếm ngược, khung chờ màn chơi, nguồn số liệu, `js/am-mv.js`. Trang cùng phong cách đất nặn với các trang khác.
- [ ] T021 [P] [US1] Liên kết vào trang: `sitemap.xml`, `huong-dan.html` (cạnh video Cảng Cái Mép), `js/thu-vien-clay.js` (mục MV 3D), chân trang (`js/site-footer.js`, `js/bizon-clay-footer.js`).
- [ ] T022 [US1] `sw.js`: thêm trang và `js/phim-data.js` vào SHELL, nâng `CACHE`. html-validate 0 lỗi. Chạy test mới cùng `kenh-youtube`, `thu-vien-*`, `huong-dan*`, `chan-trang*`. Mở PR nháp.

## Giai đoạn 4 – Màn chơi chọn tuyến (US3, P3) · PR 4 · hạn 13/12/2026 (muộn nhất trước tập 2)

- [ ] T023 [US3] Viết `test/chon-tuyen.test.js`, chạy và thấy hỏng. Test kiểm:
  - **mô hình tính (Node `vm`):** hai tuyến × ba tình huống × ba mục tiêu cho kết quả xác định; mỗi tuyến tốt nhất ở ít nhất một tổ hợp (SC-004); mỗi tham số có nguồn;
  - **giao diện (Playwright, 360/390/1280, VI/EN):** chọn, xem kết quả, đổi mục tiêu thì lời nhận xét đổi; vùng chạm ≥ 44 px; không gửi lựa chọn của người chơi lên mạng (chỉ có lượt đếm GoatCounter chung của trang); chạy ngoại tuyến.
- [ ] T024 [US3] `js/chon-tuyen.js`:
  - tham số ở đầu tệp (chi phí, thời gian, hao hụt, khả năng kịp tàu theo tình huống), lấy từ `docs/phim/nguon-so-lieu.md`;
  - giao diện chọn tuyến, tình huống, mục tiêu;
  - lời nhận xét theo mục tiêu, không phán đúng sai;
  - câu hỏi suy ngẫm cho lớp.
- [ ] T025 [US3] `/balance-check` màn chơi; chỉnh tham số trong khoảng nguồn cho phép nếu một tuyến luôn thắng. Ghi bảng số vào mô tả PR.
- [ ] T026 [US3] Gắn màn chơi vào `phim-dua-trai-ra-bien.html`; `sw.js` thêm `js/chon-tuyen.js`, nâng `CACHE`. html-validate 0 lỗi. Mở PR nháp.

## Giai đoạn 5 – Bộ phát hành và bình chọn (US2, P2) · PR 5 · hạn 09/12/2026

- [ ] T027 [US2] Viết `test/phim-dua-trai-ra-bien-phat-hanh.test.js`, chạy và thấy hỏng. Test kiểm:
  - `docs/phim/quy-trinh-dang-tai.md` có đủ mục: «không dành cho trẻ em», phụ đề, màn hình kết thúc, nguồn trong mô tả, soát logo và bản đồ, lịch teaser và đoạn dọc, mẫu thăm dò;
  - `cat-doan-doc.mjs` cắt được một đoạn 9:16 từ video mẫu, có phụ đề;
  - khi `js/phim-data.js` có kết quả bình chọn, trang loạt phim hiện đúng tỷ lệ và ngày đóng.
- [ ] T028 [P] [US2] `docs/phim/quy-trinh-dang-tai.md`:
  - danh sách kiểm trước khi đăng;
  - cài đặt YouTube; mô tả mẫu VI/EN có chương và nguồn;
  - lịch Th 5 teaser / CN tập / Th 2-4-6 đoạn dọc;
  - mẫu thăm dò YouTube và Facebook;
  - cách nhập kết quả bình chọn vào `js/phim-data.js`;
  - cách xử lý khi hòa hoặc dưới 30 phiếu: cộng phiếu của lớp học gần nhất và nói rõ nguồn (trường hợp biên trong `spec.md`).
- [ ] T029 [P] [US2] `scripts/video/cat-doan-doc.mjs`: cắt đoạn 30–45 giây theo mốc, khung 9:16 (làm mờ nền hoặc cắt giữa), phụ đề chữ lớn, khung đầu có câu hỏi, khung cuối «Xem tập đầy đủ».
- [ ] T030 [US2] Trang loạt phim hiện kết quả bình chọn khi có số. Có lời «Theo bình chọn của các bạn: …» và ngày đóng.
- [ ] T031 [US2] Cắt teaser 15 giây và 3 đoạn dọc của tập 1, gửi chị qua Drive. **(chị)** Đăng teaser 10/12, đăng tập 1 hẹn giờ CN 13/12 lúc 20:00, mở thăm dò. Em nhập mã YouTube vào `js/phim-data.js`.
- [ ] T032 [US2] `sw.js`: nâng `CACHE`. Mở PR nháp.

## Giai đoạn 6 – Hồ sơ đồng hành (US4, P4) · PR 6 · sau 30 ngày số liệu của tập 1 (từ ~12/01/2027)

- [ ] T033 [US4] Viết test kiểm `docs/phim/ho-so-dong-hanh.md`, chạy và thấy hỏng. Test kiểm:
  - có bản VI và EN; có điều khoản độc lập nội dung;
  - mọi số người xem có ngày lấy số;
  - không có giá trên trang web công khai khi chị chưa duyệt.
- [ ] T034 [US4] `docs/phim/so-lieu-phat-hanh.md`: số liệu 7 ngày và 30 ngày của tập 1–2 từ YouTube Studio và Meta (chị chụp màn hình hoặc xuất số, em ghi).
- [ ] T035 [US4] `docs/phim/ho-so-dong-hanh.md`: giới thiệu, khán giả, số liệu thật, ba gói đồng hành, cách ghi nhận nhà tài trợ, bảng giá nháp. **(chị)** Duyệt giá và chốt pháp nhân cùng thầy Tú trước tập 3 (10/01/2027).
- [ ] T036 [US4] Xuất PDF hồ sơ (skill pdf), gửi chị. **(chị)** Gửi hồ sơ cho ít nhất 3 đơn vị (một trường, một doanh nghiệp xuất khẩu hoặc logistics, một hiệp hội hoặc quỹ) trước tập 3 (SC-005). `sw.js`: nâng `CACHE`. Mở PR nháp.

## Tập 2–6 (lặp lại theo dây chuyền, không phải PR riêng của đặc tả này)

Mỗi tập lặp lại các bước sau:
1. kịch bản và phân cảnh (giống T004–T007);
2. chị thu giọng và dựng cảnh (giống T009–T010);
3. em dựng (dùng lại `dung-phim.mjs` với tệp ghép mới);
4. teaser và đoạn dọc;
5. cập nhật `js/phim-data.js`.

Mỗi tập là một PR nhỏ gồm tài liệu tập, giọng, phụ đề, ảnh bìa và dữ liệu. Hai nhánh hậu quả của tập sau dựng sẵn trong tuần bình chọn.

## Phụ thuộc

- T003 → T004 → T005 (chị duyệt) → T006, T007 → T009, T010 (chị) → T014–T016.
- T011 → T012, T013 → T015 → T016.
- PR 3 không phụ thuộc PR 2 (dữ liệu tập để trống), làm song song từ 29/11.
- PR 4 cần `nguon-so-lieu.md` của PR 1.
- PR 5 (T029, T031) cần bản cuối của PR 2.
- PR 6 cần số liệu 30 ngày của tập 1.

## Kế hoạch PR

| PR | Câu chuyện | Nhánh | Test hỏng trước | Tệp chính | Chị làm tay |
|---|---|---|---|---|---|
| 0 (#1192) | Đặc tả + kế hoạch | `claude/phim-dua-trai-ra-bien` | – | `specs/008-phim-dua-trai-ra-bien/` | Duyệt kế hoạch, nói «Gộp» |
| 1 | US1 Tiền kỳ tập 1 | `claude/phim-tap-01-kich-ban` | `test/phim-dua-trai-ra-bien-kich-ban.test.js` | `docs/phim/khung-loat-phim.md`, `nguon-so-lieu.md`, `tap-01-kich-ban.md`, `tap-01-phan-canh.md`, `tap-01-loi-thu-giong.md` | Duyệt kịch bản (26/11) |
| 2 | US1 Dựng tập 1 | `claude/phim-tap-01-dung` | `test/phim-dua-trai-ra-bien-dung.test.js` | `scripts/video/dua-trai-ra-bien/canh.html`, `tap-01.ghep.json`, `scripts/video/dung-phim.mjs`, giọng, phụ đề, ảnh bìa | Thu giọng, dựng 10–14 cảnh nhân vật, duyệt nhịp (04/12) và bản cuối (08/12) |
| 3 | US1 + US2 Trang loạt phim | `claude/phim-trang-loat-phim` | `test/phim-dua-trai-ra-bien-trang.test.js` | `phim-dua-trai-ra-bien.html`, `js/phim-data.js`, `sitemap.xml`, liên kết | Xem trang |
| 4 | US3 Màn chơi chọn tuyến | `claude/phim-chon-tuyen` | `test/chon-tuyen.test.js` | `js/chon-tuyen.js`, `phim-dua-trai-ra-bien.html` | Chơi thử |
| 5 | US2 Phát hành và bình chọn | `claude/phim-phat-hanh` | `test/phim-dua-trai-ra-bien-phat-hanh.test.js` | `docs/phim/quy-trinh-dang-tai.md`, `scripts/video/cat-doan-doc.mjs`, `js/phim-data.js` | Đăng teaser (10/12), hẹn giờ tập 1 (13/12 20:00), mở thăm dò |
| 6 | US4 Hồ sơ đồng hành | `claude/phim-ho-so-dong-hanh` | test hồ sơ (T033) | `docs/phim/ho-so-dong-hanh.md`, `so-lieu-phat-hanh.md` | Duyệt giá, chốt pháp nhân với thầy Tú trước 10/01/2027 |

Không có migration Supabase, không cần áp gì lên production. Mỗi PR nâng `CACHE` trong `sw.js` lấy số lớn nhất + 1.

## Đối chiếu (theo `/speckit-analyze`, 23/11/2026)

- **Phủ yêu cầu:**
  - FR-001 → T002; FR-002 → T004; FR-003 → T001; FR-004 → T001, T003; FR-005 → T001, T006, T011, T016;
  - FR-006 → T007, T009; FR-007 → T016, T028, T031; FR-008 → T028, T030; FR-009 → T018–T022;
  - FR-010 → T023–T026; FR-011 → T033–T036; FR-012 → T028; FR-013 → mục «Lịch sản xuất» trong `plan.md`.
- **Phủ tiêu chí thành công:**
  - SC-001 → T016; SC-002 → T015; SC-003 → T034; SC-004 → T023, T025; SC-005 → T036; SC-006 → T001, T016.
- **Không có lỗi CRITICAL.**
- **Mức thấp:**
  1. Hiến chương ghi «nhân vật lấy từ ảnh game có sẵn». Cảnh do công cụ video dựng từ chính các ảnh ấy, nên không thêm nhân vật mới. Nhân vật phụ không lời (người lái sà lan, tài xế) chỉ là dáng xa, không mặt rõ. Chị xác nhận khi duyệt kế hoạch.
  2. Ngưỡng SC-003 (giữ chân ≥ 40%, ≥ 30 phiếu, ≥ 100 lượt bấm) là mặc định em đặt, chưa có số kênh cũ để so; chỉnh sau tập 1.
  3. Số liệu tuyến Cần Thơ → Cái Mép chưa có nguồn (T003). Nếu không tra được thì phim nói định tính, cú lật đổi sang yếu tố có nguồn.
