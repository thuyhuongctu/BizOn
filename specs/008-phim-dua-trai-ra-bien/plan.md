# Kế hoạch thực hiện: Loạt phim «Đưa trái ra biển», tập 1 «Sà lan hay xe tải?»

**Nhánh**: `claude/phim-dua-trai-ra-bien` | **Ngày**: 2026-11-23 | **Đặc tả**: [spec.md](spec.md)

## Tóm tắt

Mùa 1 có 6 tập, phát hai tuần một tập, mở màn bằng tập 1 vào **Chủ nhật 13/12/2026, 20:00** (giờ Việt Nam).

Mỗi tập làm theo một dây chuyền cố định gồm năm bước:
1. **Tiền kỳ (em):** kịch bản VI/EN, bảng phân cảnh, mô tả cảnh cho chị, lời thu giọng, số liệu có nguồn.
2. **Chị:** thu giọng Lumina, dựng các cảnh nhân vật diễn.
3. **Em:** dựng cảnh số liệu bằng HTML, ghép, phụ đề, kiểm.
4. **Chị:** duyệt bản cuối và đăng.
5. **Em:** cắt teaser và đoạn dọc, cập nhật trang loạt phim.

Bảng điều hành sản xuất (phân vai, lịch từng tập, lưu trữ tệp, cổng duyệt, danh sách kiểm, dự phòng, bảng theo dõi tiến độ) nằm ở `docs/phim/ke-hoach-san-xuat.md`.

Phần mã trong kho chia thành 6 PR sau PR đặc tả này. Không có migration Supabase. Bản phim cuối nằm trên YouTube và Drive, **không đưa vào kho**, vì một tập dài 4–6 phút có cả bản VI và EN sẽ quá nặng cho GitHub Pages.

## Bối cảnh kỹ thuật

- **Trang tĩnh, không có bước build** (hiến chương III). Trang loạt phim mới `phim-dua-trai-ra-bien.html` nhúng YouTube bằng `js/am-mv.js` (chỉ tải trình phát khi người xem bấm), đọc lịch và tập từ `js/phim-data.js`.
- **Dựng phim** dùng lại quy trình của video Cảng Cái Mép:
  - trang cảnh HTML vẽ từng khung qua `window.veKhung(t)`;
  - Playwright chụp khung;
  - ffmpeg ghép, nhạc nền, `loudnorm`.

  Khác ở một điểm: phim có hai loại cảnh.
  - **Cảnh nhân vật (chị dựng):** tệp mp4 từ công cụ video, không có chữ.
  - **Cảnh số liệu (em dựng):** trang `scripts/video/dua-trai-ra-bien/canh.html`.

  Một tệp ghép `tap-01.ghep.json` liệt kê theo thứ tự từng cảnh: loại cảnh, nguồn, thời lượng, câu thoại và chữ chèn lên hình. Script mới `scripts/video/dung-phim.mjs` đọc tệp này để dựng bản VI và bản EN.
- **Giọng:** chị thu theo từng câu (mỗi câu một tệp, đặt tên `01.wav`…). Nếu chị thu liền một tệp thì `scripts/video/cat-giong-theo-cau.py` cắt theo câu sau khi có mốc thời gian, hoặc em cắt tay theo khoảng lặng. Bản nháp duyệt nhịp dùng thẻ chữ thay giọng, không tốn tiền mua giọng máy.
- **Kiểm:**
  - `scripts/kiem-video.mjs`: độ dài, độ to, khung đen, phụ đề;
  - faster-whisper (đã cài) nghe soát dấu tên riêng;
  - Playwright cho trang loạt phim và màn chơi;
  - Node `vm` cho mô hình tính của màn chơi.
- **Đo lường:** bizonland.com không có công cụ đo người xem (cam kết không cookie bên thứ ba). Số người xem lấy ở YouTube Studio và Meta, gồm tỷ lệ giữ chân, lượt bấm thẻ và màn hình kết thúc, phiếu bình chọn. Lượt chơi trên web không đếm.

## Kiểm theo hiến chương

| Nguyên tắc | Ảnh hưởng | Cách giữ |
|---|---|---|
| I. Học là chính | Phim và màn chơi dạy đánh đổi vận tải | Lumina chỉ hỏi và trình bày số, không chọn giúp (FR-003). Phim không kết luận đúng sai. Màn chơi không có lựa chọn luôn thắng, kiểm bằng `/balance-check` (SC-004). Có câu hỏi thảo luận nối CLO-C, CLO-B, CLO-E. |
| II. Nói thật | Phim có số liệu và nhân vật Lumina | Mọi số có nguồn trong `docs/phim/nguon-so-lieu.md`. Không gọi Lumina là AI. Bảng giá đồng hành không đăng web khi chưa duyệt và chưa khớp trang Chính sách (5A). Ghi rõ «Đồng hành cùng tập này» nếu có tài trợ. |
| III. Trang tĩnh (không thương lượng) | Thêm một trang và hai tệp JS | Không build. Trang và màn chơi chạy ngoại tuyến (thêm vào `sw.js`); video cần mạng, có thông báo. 360/390/1280 px không tràn ngang, vùng chạm ≥ 44 px, tương phản ≥ 4,5. VI/EN bằng `data-en`. Có trạng thái lỗi khi chưa có tập. |
| IV. Có test | Mỗi PR một test viết trước, thấy hỏng | Xem bảng «Kế hoạch PR» trong `tasks.md`. html-validate 0 lỗi; `CACHE` lấy số lớn nhất + 1. |
| V. Dữ liệu tối thiểu | Bình chọn | 4A: bình chọn trên YouTube và Facebook; trang web không gửi dữ liệu nào. Không bảng, không RPC, không migration. |
| Hồ sơ quyền tác giả | Không chạm | Không sửa `BizOn Game 3D.html`, `game.html`, `js/engine.js` hay tệp nào trong danh sách khóa. Phim dùng **ảnh** nhân vật, không sửa tệp game. |
| Tài sản gốc | Ảnh nhân vật, nhạc | Không ghi đè. Ảnh cắt, ghép mới lưu tên mới (`-v2`…). Nhạc nền chỉ dùng nhạc gốc BizOn. |
| Nhân vật | Chỉ nhân vật có sẵn | Danh sách vai và ảnh tham chiếu ở `docs/phim/khung-loat-phim.md`. Không thêm nhân vật mới. Nhân vật phụ không lời (người lái sà lan, tài xế) chỉ là dáng xa, không mặt rõ. |

## Tệp sẽ chạm

| Tệp | PR | Thay đổi |
|---|---|---|
| `docs/phim/khung-loat-phim.md` (mới) | 1 | Bộ khung mùa 1: thế giới Bizonland, nhân vật và giọng, mục tiêu mùa, đối thủ, 6 tập, quy tắc hình ảnh (không chữ trong cảnh AI, không logo, bản đồ đủ Hoàng Sa, Trường Sa) |
| `docs/phim/nguon-so-lieu.md` (mới) | 1 | Bảng số liệu: giá trị, tài liệu gốc, trang, ngày tra, tập dùng |
| `docs/phim/tap-01-kich-ban.md` (mới) | 1 | Kịch bản VI/EN theo nhịp (bảng câu, thời điểm, người nói, cảnh) |
| `docs/phim/tap-01-phan-canh.md` (mới) | 1 | Bảng phân cảnh 14–18 cảnh: khung, máy quay, nhân vật, ảnh tham chiếu, **mô tả cảnh tiếng Anh cho công cụ video**, thời lượng |
| `docs/phim/tap-01-loi-thu-giong.md` (mới) | 1 | Lời Lumina từng câu VI/EN, dấu ngắt, từ khó, hướng dẫn thu (phòng yên, cách mic 15–20 cm, WAV 48 kHz) |
| `test/phim-dua-trai-ra-bien-kich-ban.test.js` (mới) | 1 | Kiểm cấu trúc kịch bản và nguồn |
| `scripts/video/dua-trai-ra-bien/canh.html` (mới) | 2 | Cảnh số liệu: đồng hồ đếm ngược, bản đồ tuyến Cần Thơ → Cái Mép (đường sông và đường bộ), bảng ba cột của Lumina, thẻ tựa đề, chữ chạy |
| `scripts/video/dua-trai-ra-bien/tap-01.ghep.json` (mới) | 2 | Danh sách cảnh để ghép |
| `scripts/video/dung-phim.mjs` (mới) | 2 | Đọc tệp ghép, dựng bản VI/EN, chèn chữ, phụ đề `.vtt`, nhạc nền, `loudnorm`; có `--nhap` (thẻ chữ thay cảnh thiếu) |
| `assets/video/src/dua-trai-ra-bien/tap-01/{vi,en}/NN.mp3` (mới) | 2 | Giọng chị đã cắt theo câu (nhỏ, để dựng lại được) |
| `assets/video/subs/dua-trai-ra-bien-01-{vi,en}.vtt`, `assets/video/dua-trai-ra-bien-01-poster.webp` (mới) | 2 | Phụ đề và ảnh bìa |
| `test/phim-dua-trai-ra-bien-dung.test.js` (mới) | 2 | Kiểm trang cảnh, tệp ghép, script dựng |
| `phim-dua-trai-ra-bien.html` (mới) | 3 | Trang loạt phim: tập phát hành, lịch, đếm ngược tới tập sau, kết quả bình chọn, chỗ đặt màn chơi |
| `js/phim-data.js` (mới) | 3, 5 | Dữ liệu mùa: tập, mã YouTube VI/EN, ngày giờ phát hành, kết quả bình chọn (nhập tay) |
| `sitemap.xml`, `huong-dan.html`, `js/thu-vien-clay.js`, chân trang (`js/site-footer.js`, `js/bizon-clay-footer.js`) | 3 | Thêm trang vào sitemap; liên kết từ trang Hướng dẫn, Thư viện Sáng tạo, chân trang |
| `test/phim-dua-trai-ra-bien-trang.test.js` (mới) | 3 | Kiểm trang loạt phim |
| `js/chon-tuyen.js` (mới) | 4 | Màn chơi «Chọn tuyến Cần Thơ → Cái Mép»: tham số có nguồn ở đầu tệp, ba tình huống, ba mục tiêu |
| `phim-dua-trai-ra-bien.html` | 4 | Gắn màn chơi |
| `test/chon-tuyen.test.js` (mới) | 4 | Mô hình tính (Node `vm`) và giao diện (Playwright) |
| `docs/phim/quy-trinh-dang-tai.md` (mới) | 5 | Danh sách kiểm trước khi đăng, cài đặt YouTube, mô tả mẫu, chương, thẻ, màn hình kết thúc, lịch teaser và đoạn dọc, mẫu thăm dò |
| `scripts/video/cat-doan-doc.mjs` (mới) | 5 | Cắt đoạn dọc 9:16 từ bản cuối theo mốc, chèn phụ đề lớn, khung đầu có câu hỏi |
| `test/phim-dua-trai-ra-bien-phat-hanh.test.js` (mới) | 5 | Kiểm quy trình và script cắt dọc |
| `docs/phim/ho-so-dong-hanh.md` (mới) | 6 | Bộ hồ sơ VI/EN: giới thiệu, số người xem thật, gói đồng hành, điều khoản độc lập nội dung. Bảng giá nháp để chị duyệt |
| `sw.js` | 1–6 | Mỗi PR nâng `CACHE`; PR 3, 4 thêm trang và JS mới vào SHELL |

## Nhịp kể một tập (mẫu tập 1, dài 4:45)

| Thời điểm | Nhịp | Nội dung | Loại cảnh |
|---|---|---|---|
| 0:00–0:10 | **Móc câu** | Container sầu riêng của Bác Ba trên bến Cần Thơ, đồng hồ đếm giờ tàu chạy ở Cái Mép. Tèo Soi gõ lên container: «Kịp không đây?» | Nhân vật + chữ đếm ngược |
| 0:10–0:25 | Tựa đề | «Đưa trái ra biển · Tập 1: Sà lan hay xe tải?». Lumina chào, giới thiệu thật ngắn | Số liệu (thẻ tựa) |
| 0:25–1:30 | **Hai phe** | Minh Khang: sà lan rẻ, «phần lớn hàng miền Tây vẫn đi sông». Lina Park và An Nhiên: xe tải nhanh, trái giữ độ tươi. Bà Sáu Lành nhắc chuyện con nước | Nhân vật |
| 1:30–2:30 | **Leo thang** | Kim Long Exports cũng giành chuyến tàu ấy. Lumina hiện bảng ba cột (chi phí, thời gian, rủi ro), số có nguồn | Nhân vật + số liệu |
| 2:30–3:30 | **Cú lật** | Một yếu tố có thật đảo thế: con nước, kẹt xe cửa ngõ cảng, hay tàu đổi lịch. Chọn yếu tố nào tùy nguồn tra được (T003) | Nhân vật + bản đồ |
| 3:30–4:15 | **Kết treo** | Cả đội phải chốt. Màn hình dừng trước khi chọn. Lumina: «Còn đội bạn: sông hay đường?» Lời mời bình chọn, đường dẫn bizonland.com | Nhân vật + chữ |
| 4:15–4:45 | Chữ chạy + **hậu đoạn** | Chữ chạy và nguồn số liệu; 3–5 giây hé tập 2 «Tươi hay cấp đông?» | Số liệu + nhân vật |

Quy tắc chung cho mọi tập:
- câu đầu tiên có người, có việc, có hạn chót;
- không giới thiệu kênh trước giây thứ 10;
- mỗi 30–45 giây có một thông tin mới hoặc một trở ngại mới;
- kết bằng câu hỏi, không bằng đáp án.

## Mùa 1: 6 tập và lịch phát hành (3A)

| Tập | Ngày phát (20:00) | Teaser (trước 3 ngày) | Quyết định của tập | Bình chọn đóng |
|---|---|---|---|---|
| 1 | CN 13/12/2026 | Th 5 10/12 | Sà lan hay xe tải? | CN 20/12 |
| 2 | CN 27/12/2026 | Th 5 24/12 | Bán trái tươi hay cấp đông? (mở bằng hậu quả của bình chọn tập 1) | CN 03/01 |
| 3 | CN 10/01/2027 | Th 5 07/01 | Chốt cước sớm hay chờ? *(mốc 5A: chốt pháp nhân trước tập này)* | CN 17/01 |
| 4 | CN 24/01/2027 | Th 5 21/01 | Tự lập điểm gom? | CN 31/01 |
| – | Tết Đinh Mùi (6/2/2027) | Chỉ một đoạn dọc chúc Tết | – | – |
| 5 | CN 21/02/2027 | Th 5 18/02 | Rẻ nhất, nhanh nhất hay giao đủ 100%? | CN 28/02 |
| 6 | CN 07/03/2027 | Th 5 04/03 | Tập kết: container tới tay người mua; nhìn lại các lựa chọn của khán giả | – |

**Hai nhánh hậu quả dựng sẵn.** Trong 7 ngày bình chọn, em dựng sẵn cả hai cảnh mở đầu của tập sau, mỗi lựa chọn một cảnh. Bình chọn đóng thì chỉ cần ghép đúng nhánh và chèn tỷ lệ phiếu. Nhờ vậy lịch không trễ vì chờ phiếu.

## Lịch sản xuất tập 1 (từ 23/11 đến 13/12/2026)

| Tuần | Ngày | Việc | Ai |
|---|---|---|---|
| 1 | 23–25/11 | Tra nguồn số liệu tuyến Cần Thơ → Cái Mép (T003); viết bộ khung mùa và kịch bản tập 1 VI/EN | Em |
| 1 | 26/11 | **Chị duyệt kịch bản** (PR 1) | Chị |
| 1 | 27–28/11 | Bảng phân cảnh, mô tả cảnh cho công cụ video, lời thu giọng; gộp PR 1 khi chị nói «Gộp» | Em |
| 2 | 29/11–02/12 | **Chị thu giọng Lumina VI + EN** (ước 45–60 phút cho hai thứ tiếng); **chị dựng 10–14 cảnh nhân vật** theo bảng phân cảnh (ước 3–5 giờ tùy công cụ) | Chị |
| 2 | 29/11–03/12 | Trang cảnh số liệu, script dựng, bản nháp (thẻ chữ thay cảnh còn thiếu) | Em |
| 2 | 04/12 | Ghép bản nháp có giọng và cảnh của chị; **chị duyệt nhịp** | Em → Chị |
| 3 | 05–07/12 | Chỉnh theo góp ý; dựng lại cảnh lỗi (chị); trang loạt phim (PR 3); quy trình đăng và script cắt dọc (PR 5) | Em, Chị |
| 3 | 08/12 | Bản cuối VI/EN: `kiem-video`, Whisper, soát logo và bản đồ; **chị duyệt bản cuối** | Em → Chị |
| 3 | 09/12 | Cắt teaser 15 giây và 3 đoạn dọc; ảnh bìa; mô tả video có nguồn | Em |
| 3 | 10/12 | **Chị đăng teaser** (YouTube Shorts, Facebook Reels, TikTok) | Chị |
| 3 | 11–12/12 | **Chị tải tập 1 lên YouTube ở chế độ hẹn giờ** (VI và EN, thêm phụ đề `.vtt`, màn hình kết thúc, playlist, «không dành cho trẻ em»); em cập nhật mã YouTube vào `js/phim-data.js` | Chị, Em |
| 3 | CN 13/12, 20:00 | **Phát hành tập 1**; mở thăm dò 7 ngày; đăng Facebook, LinkedIn | Chị |
| – | 14–20/12 | Đăng 3 đoạn dọc (Th 2, Th 4, Th 6); trả lời bình luận; em dựng hai nhánh hậu quả cho tập 2 | Chị, Em |

Màn chơi chọn tuyến (PR 4) cố gắng xong trước 13/12. Nếu chưa kịp, trang loạt phim ghi «Màn chơi sắp có» và PR 4 xong trước tập 2.

**Việc chị làm tay mỗi tập (ước tính):**
- thu giọng: khoảng 1 giờ;
- dựng cảnh nhân vật: 3–5 giờ;
- duyệt hai lượt: khoảng 1 giờ;
- đăng và hẹn giờ: khoảng 30 phút;
- trả lời bình luận: 15 phút mỗi ngày trong tuần phát hành.

## Phát hành và quảng bá

| Kênh | Đăng gì | Khi nào |
|---|---|---|
| YouTube (kênh @jemappellehuong, playlist «Đưa trái ra biển») | Tập dài VI và EN (hai video riêng, mô tả trỏ nhau), phụ đề hai thứ tiếng, chương, thẻ trỏ bizonland.com | CN 20:00 |
| YouTube Shorts | Teaser; 3 đoạn dọc, mỗi đoạn có thăm dò hoặc câu hỏi | Th 5 trước; Th 2/4/6 sau |
| Thẻ Cộng đồng YouTube | Thăm dò «Sà lan hay xe tải?» (4A) | Mở lúc phát hành, đóng sau 7 ngày |
| Facebook (trang) + Reels | Tập dài (tải lên gốc), đoạn dọc, thăm dò; chia sẻ vào nhóm giảng viên, nhóm nông sản Đồng bằng sông Cửu Long khi nhóm cho phép | Cùng ngày |
| TikTok | Teaser và đoạn dọc | Cùng nhịp Shorts |
| LinkedIn | Một bài «số liệu thật đằng sau tập phim» kèm đoạn 60 giây | Th 3 sau phát hành |
| bizonland.com | Trang loạt phim; liên kết từ Hướng dẫn, Thư viện Sáng tạo, chân trang | Cập nhật trước giờ phát |
| Lớp học của chị và thầy Tú | Chiếu tập 1 + màn chơi 10 phút + câu hỏi thảo luận | Buổi học gần nhất sau phát hành |

**Cài đặt bắt buộc khi đăng:** đánh dấu «không dành cho trẻ em» (người xem mục tiêu là sinh viên); thêm phụ đề `.vtt` của em, không dùng phụ đề tự động; màn hình kết thúc gồm tập tiếp theo và playlist; nhập nguồn số liệu vào mô tả.

## Đo lường (SC-003)

Em lấy số ở mốc 7 ngày và 30 ngày sau phát hành, ghi vào `docs/phim/so-lieu-phat-hanh.md` (tạo ở PR 6):
- **YouTube:** lượt xem, tỷ lệ giữ chân trung bình, tỷ lệ còn xem ở giây 30, tỷ lệ bấm ảnh bìa, lượt bấm thẻ và màn hình kết thúc, người đăng ký mới từ tập phim, số phiếu thăm dò.
- **Shorts, Reels, TikTok:** lượt xem, tỷ lệ xem hết, lượt bấm sang tập dài (nếu nền tảng có số này).
- **Lớp học:** phiếu hỏi nhanh 3 câu sau buổi chiếu (SC-002).

Ngưỡng mặc định ở SC-003. Chị chỉnh khi duyệt kế hoạch.

## Mô hình tài chính (5A)

| Nguồn | Khi nào | Ghi chú |
|---|---|---|
| Giấy phép lớp học trọn gói (game + phim + câu hỏi thảo luận) | Chào từ học kỳ 2 năm 2026–2027 | Khớp chính sách hiện có: dùng thử một học kỳ, dùng tiếp cần giấy phép (hiến chương II). Giá do chị và thầy Tú quyết |
| Tài trợ từng tập (vận tải thủy, logistics, xuất khẩu trái cây, hiệp hội) | Sớm nhất từ tập 3, sau khi chốt pháp nhân | Điều khoản độc lập nội dung; ghi «Đồng hành cùng tập này: …»; không logo trong cảnh, chỉ ở chữ chạy |
| Đặt hàng phim câu chuyện thương hiệu (đặc sản, OCOP) | Sau mùa 1 | Nối Local-Specialty-Brand-Lab; mỗi phim một hợp đồng dịch vụ |
| Quỹ, tài trợ giáo dục và đổi mới sáng tạo | Nộp khi có số liệu 30 ngày của tập 1 (từ ~12/01/2027) | Hồ sơ dùng `docs/phim/ho-so-dong-hanh.md` và số người xem thật |
| Doanh thu nền tảng | Khi kênh đủ điều kiện | YouTube: 1.000 người đăng ký và 4.000 giờ xem công khai trong 12 tháng hoặc 10 triệu lượt xem Shorts trong 90 ngày (trang chính thức, tra 23/11/2026). Facebook ở Việt Nam có Stars, gói hội viên; trả tiền theo lượt xem chưa chính thức. TikTok Creator Rewards ở Việt Nam chưa rõ. Khoản nhỏ, không dựa vào |
| Phụ thêm | Bất kỳ lúc nào | Phát hành nhạc BizOn lên nền tảng nghe nhạc; quà lưu niệm (huy hiệu cài áo có sẵn) |

**Điều khoản của công cụ video:** trước khi nhận tài trợ, chị kiểm điều khoản của công cụ dựng cảnh nhân vật xem gói đang dùng có cho phép dùng thương mại không. Ghi kết quả vào `docs/phim/khung-loat-phim.md`.

## Nguồn số liệu

Tra ngày 22–23/11/2026. Bảng đầy đủ sẽ ở `docs/phim/nguon-so-lieu.md` (PR 1).

**Đã có, cần ghi trang:**
- Báo cáo Logistics Việt Nam 2024 (Bộ Công Thương): khoảng 79,7% hàng hóa vùng Đồng bằng sông Cửu Long đi đường thủy nội địa; chi phí đường thủy khoảng 30% đường bộ; cước biển một giai đoạn tăng từ 1.661 lên 3.964 USD/FEU. *(Tệp chị chia sẻ trên Drive. Ghi số trang khi làm PR 1.)*
- Luận văn chuỗi cung ứng trái cây tươi: hao hụt sau thu hoạch khoảng 25%. Nguồn thứ cấp: chỉ dùng nếu truy được nguồn gốc, nếu không thì nói định tính.

**Cần tra (T003), chưa dùng khi chưa có nguồn:**
- quãng đường và thời gian sà lan, xe tải từ Cần Thơ tới Cái Mép;
- cước mỗi container 40 feet cho từng phương thức;
- yếu tố «cú lật»: lịch con nước và mớn nước luồng sông, tình trạng kẹt xe ở cửa ngõ cảng, hay tàu đổi lịch, chọn cái nào có nguồn chính thống;
- điều kiện giữ sầu riêng tươi khi vận chuyển (nhiệt độ, thời gian) cho hậu đoạn và tập 2.

Ưu tiên nguồn chính thống: báo cáo bộ ngành, Cục Hàng hải, Cục Đường thủy nội địa, cảng vụ, báo lớn có trích nguồn. Số không tra được thì bỏ, chỉ nói định tính (trường hợp biên trong `spec.md`).

## Rủi ro và cách giảm

| Rủi ro | Cách giảm |
|---|---|
| Công cụ video làm nhân vật «trôi» khác ảnh gốc giữa các cảnh | Mỗi cảnh dùng đúng ảnh tham chiếu ghi trong bảng phân cảnh; cảnh ngắn 4–8 giây; cảnh lỗi thì dựng lại hoặc thay bằng cảnh số liệu |
| Chữ trong cảnh do công cụ video sinh ra sai dấu | Mô tả cảnh luôn ghi «no text, no signs, no logos»; mọi chữ do em chèn ở hậu kỳ |
| Logo giống hãng thật, bản đồ thiếu Hoàng Sa, Trường Sa | Danh sách kiểm trước khi đăng (`docs/phim/quy-trinh-dang-tai.md`); không dùng bản đồ do công cụ video vẽ, bản đồ chỉ do em dựng |
| Chị bận, chưa kịp thu giọng hay dựng cảnh | Lịch có 4 ngày đệm (04–07/12); nếu trễ quá 07/12 thì dời tập 1 sang 20/12, giữ nhịp hai tuần |
| Số liệu tuyến không có nguồn | Nói định tính; giữ số của báo cáo Bộ Công Thương làm trục |
| Ít phiếu bình chọn | Ngưỡng tối thiểu 30 phiếu; dưới ngưỡng thì cộng phiếu của lớp học gần nhất và nói rõ |
| Kênh bị đánh dấu nội dung trẻ em | Chọn «không dành cho trẻ em» ngay khi tải lên (quy trình đăng) |
