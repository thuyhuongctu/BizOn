# Định hướng nâng cấp BizOn lên game engine 3D thật (Unity/Unreal)

*Tài liệu chiến lược — không phải code. Viết để ra quyết định trước khi đầu tư công sức/ngân sách.*
*Bối cảnh: người dùng gửi clip "Rio Rise" (game mobile 3D ảnh thật, studio chuyên làm) và hỏi hướng nâng cấp BizOn lên mức tương tự. Cập nhật: dự án sẽ **thương mại hóa sau giai đoạn thử nghiệm** — mục 11 phân tích riêng tác động của việc này lên toàn bộ khuyến nghị.*

---

## 1. Điểm xuất phát thực tế — BizOn hôm nay

| | |
|---|---|
| Công nghệ | HTML/CSS/JS tĩnh, không build step, chạy thẳng trong trình duyệt |
| Lõi luật chơi | Engine tất định riêng mỗi game (vd. `ho-chieu-sau-rieng-engine.js`) — cùng hạt giống + cùng quyết định → cùng kết quả, không gọi mạng, test bằng Node (`node test/*.test.js`) |
| Đồ họa | 2.5D CSS (bản đồ trạm, thẻ quyết định) + một phần WebGL thật đã có (Three.js + GLTFLoader + model Kenney cho Bến Phù Sa/Brand Passport, nhân vật đất sét dựng bằng code trong `bizon-characters.js`) |
| Offline | Service worker (sw.js/sw-hochieu.js) — mở được không cần mạng sau lần tải đầu |
| Backend | Supabase — chấm điểm, lớp học, bảng điểm GV, không máy chủ game riêng |
| Phân phối | Một đường link, mở trên bất kỳ thiết bị nào có trình duyệt — điện thoại SV, Chromebook trường, máy tính giảng viên |
| Vòng lặp phát triển | Sửa code → test Playwright vài phút → PR → merge, làm được trong một buổi |
| Dữ liệu | Mọi con số minh họa neo vào tài liệu thật có trích nguồn ngay trong code (`sources`/`facts` trong file data) |
| Chi phí vận hành | ~0 đồng — không máy chủ render, không phí engine, không phí store |

Đây không phải một bản demo sơ sài — đây là một **kiến trúc được tối ưu đúng cho mục tiêu**: công cụ giảng dạy, miễn phí, chạy mọi lúc mọi nơi trong lớp học, nội dung bám sát số liệu thật, sửa nhanh theo từng học kỳ.

## 2. "3D thật" nghĩa là gì — và cái giá phải trả

"3D thật" ở đây nghĩa là dùng **game engine** (Unity/Unreal) thay vì trình duyệt vẽ CSS/DOM: dựng scene bằng camera 3D thật, model có khối, ánh sáng động, nhân vật có rig xương và animation, có thể là asset ảnh thật như trong clip Rio Rise.

Đổi lại, ba thứ đang là lợi thế của BizOn sẽ bị đe dọa trực tiếp:

1. **Phân phối tức thì → cài đặt/tải nặng.** Build Unity/Unreal nhỏ nhất cũng 20–50MB (WebGL) hoặc 100MB+ (app cài đặt), so với trang HTML hiện tại vài trăm KB. Trên wifi lớp học chia sẻi cho 40 SV cùng lúc, đây là khác biệt giữa "mở là chơi" và "chờ tải 5–10 phút hoặc treo máy".
2. **Offline-first → khó giữ.** Cache một bundle Unity WebGL 50–100MB qua service worker vẫn làm được về mặt kỹ thuật nhưng nặng hơn hẳn, và app cài đặt thì mất hẳn mô hình "một link dùng chung".
3. **Vòng lặp phát triển nhanh → chậm lại.** Hiện tại một thay đổi luật chơi là sửa JS, test ngay trong trình duyệt/Node. Unity/Unreal cần build lại (phút tới chục phút mỗi lần), không review được qua PR diff đơn giản như hiện tại, khó CI hoá theo kiểu Playwright đang dùng.

Ba điều này không phải lý do để không làm — mà là **cái giá cụ thể cần cân nhắc có đáng không**, với từng mức độ dưới đây.

## 3. Ba mức độ fidelity — và chi phí thật

| | **Mức 1 — Stylized low-poly** | **Mức 2 — Bán thực (semi-realistic)** | **Mức 3 — Ảnh thật (Rio Rise)** |
|---|---|---|---|
| Ví dụ tham chiếu | Kenney asset kit, Townscaper, mèo con Three.js | Township, Hay Day, Coffee Stain style | Rio Rise, GTA Online Mobile |
| Nhân lực | 1–2 người (1 tech-artist kiêm 3D, 1 lập trình) | 4–8 người (3D artist, animator, tech artist, lập trình engine, UI, QA) | Studio hàng chục người: concept art, modeling, rigging, mocap, lighting, VFX, producer |
| Thời gian / 1 game | 4–10 tuần | 4–9 tháng | 1–3+ năm |
| Ngân sách / 1 game | ~0 (asset CC0 có sẵn) đến ~30–50 triệu đồng nếu thuê thêm model riêng | ~700 triệu – 3,5 tỷ đồng (tùy th outsource hay in-house) | Hàng chục đến hàng trăm tỷ đồng |
| Thiết bị lớp học | Chạy được trên điện thoại/Chromebook tầm trung | Cần máy khá hơn, một phần thiết bị cũ sẽ giật/lag | Cần điện thoại flagship hoặc PC — phần lớn thiết bị SV **sẽ không chạy nổi** |
| Giữ offline-first | Có thể giữ được | Khó, build đã khá nặng | Gần như không — các game này luôn cần mạng/máy chủ |
| Phù hợp mục tiêu giảng dạy trích nguồn số liệu thật | Rất phù hợp — trọng tâm vẫn là nội dung | Phù hợp nếu có đủ nguồn lực duy trì | Sai trọng tâm — ngân sách dồn hết vào đồ họa, không còn cho nội dung/nghiên cứu |

**Rio Rise nằm ở Mức 3.** Để nói thẳng: mức này không phải "nâng cấp", mà là **xây một studio game thương mại riêng** — ngân sách và quy mô đó thường chỉ các công ty game có doanh thu hoặc vừa gọi vốn mới kham nổi, không phải việc một dự án giáo dục đại học nên nhắm tới.

## 4. Chọn engine: Unity vs Unreal — nếu thật sự theo hướng này

| | **Unity** | **Unreal Engine** |
|---|---|---|
| Ngôn ngữ | C# — dễ tuyển freelancer VN hơn | C++/Blueprint — hiếm nhân lực hơn, học khó hơn |
| Xuất Web (giữ "mở link là chơi") | WebGL export hoạt động, build vài chục MB | Đã bỏ hỗ trợ HTML5 export dễ dùng; muốn chạy trên web phải dùng **Pixel Streaming** (render trên máy chủ cloud GPU, stream hình ảnh về — **tốn phí máy chủ theo giờ chơi**, phá vỡ hoàn toàn mô hình "0 đồng vận hành" hiện tại) |
| Yêu cầu phần cứng máy chơi | Nhẹ hơn, thân thiện thiết bị tầm trung | Nặng hơn, thường cần GPU rời để đạt chất lượng hình ảnh xứng đáng với việc dùng Unreal |
| Chất lượng ảnh thật tối đa | Tốt, nhưng Unreal vẫn nhỉnh hơn cho photoreal | Tốt nhất thị trường — đây là lý do các game như Rio Rise hay chọn Unreal |
| Giấy phép | Miễn phí cho giáo dục/phi lợi nhuận quy mô nhỏ | Miễn phí tới một ngưỡng doanh thu, cũng ổn cho dự án học thuật |
| Kho asset có sẵn (giảm chi phí) | Asset Store rất lớn, nhiều gói giá rẻ/miễn phí | Marketplace nhỏ hơn, giá trung bình cao hơn |

**Nếu phải chọn một trong hai cho đúng bối cảnh BizOn (miễn phí, offline, thiết bị lớp học): Unity, không phải Unreal.** Unreal chỉ hợp lý nếu chấp nhận bỏ hẳn yêu cầu "mở link, miễn phí, offline" — tức build app cài đặt, hoặc trả phí máy chủ Pixel Streaming hàng tháng.

### Một lựa chọn thứ ba, rủi ro thấp hơn hẳn

Repo đã có sẵn nền WebGL thật (không phải Unity, nhưng là 3D thật): `GLTFLoader.js` đã vendor, `js/meshy-loader.js`, model GLB từ Kenney đã nối vào `bp3d.js`, và `bizon-characters.js` dựng nhân vật đất sét 3D thuần code bằng Three.js. Đây chính là **Mức 1 (stylized low-poly)** đã có móng — nâng cấp tiếp hướng này giữ nguyên toàn bộ lợi thế (link, offline, 0 đồng, vòng lặp nhanh) mà vẫn là 3D thật chứ không phải CSS giả lập. Đây là phương án tôi khuyến nghị cân nhắc trước, trình bày ở Phase 1 bên dưới.

## 5. Nếu theo Unity thật — kiến trúc đề xuất

- **Giữ nguyên lõi luật chơi.** Các engine JS tất định (`*-engine.js`) là tài sản quý nhất — đã test kỹ, đã cân bằng qua nhiều lượt sửa lỗi, đúng số liệu trích nguồn. Port logic này sang C# (thuần toán học, không khó port) hoặc giữ JS và gọi qua cầu nối WebGL↔JS. **Không viết lại luật chơi trong Unity** — chỉ thay lớp trình bày.
- **Target build: Unity WebGL**, không phải app cài đặt, để giữ mô hình "mở link là chơi".
- **Giữ Supabase** cho chấm điểm/lớp học — chỉ đổi client gọi API.
- **Giữ Playwright cho phần UI web bao quanh** (màn đăng nhập lớp, bảng điểm GV...); phần 3D cần bộ test riêng (Unity Test Framework) — một khoản chi phí ẩn hay bị bỏ qua khi lên kế hoạch.

## 6. "Asset studio chuyên" cần những gì thật sự

| Vai trò | Việc | Ước lượng giá (thị trường VN/thuê ngoài, Mức 2) |
|---|---|---|
| Concept/Art direction | Chốt phong cách hình ảnh nhất quán (khuyến nghị **stylized**, không đuổi theo ảnh thật — vừa rẻ hơn, vừa hợp thương hiệu giáo dục) | 10–30 triệu đồng trọn gói |
| 3D modeling (nhân vật, môi trường, props) | Mô hình hóa — có thể tái dùng Kenney/Quaternius/Sketchfab CC0 cho props chung, chỉ thuê riêng cho nhân vật/linh vật chính | 1–10 triệu đồng/model tùy độ phức tạp |
| Rigging & animation | Gắn xương, animation đi/đứng/nói — có thể dùng rig người có sẵn trên Asset Store + Mixamo (miễn phí) để tiết kiệm thay vì mocap riêng | 0 (Mixamo) – 5 triệu/bộ animation nếu custom |
| Technical artist | Dựng scene trong engine, ánh sáng, shader, tối ưu hiệu năng cho thiết bị yếu | Cần 1 người cố định, không thuê vặt được |
| Lập trình engine | Port luật chơi, dựng UI/HUD, lưu game, build pipeline | Cần 1 người cố định |
| Producer/QA | Quản lý tiến độ, test đa thiết bị | Có thể kiêm nhiệm ở quy mô nhỏ |

**Quy mô tối thiểu khả thi:** 1 tech-artist kiêm 3D + 1 lập trình, làm bán thời gian một học kỳ → ra được **một** cảnh vertical-slice ở Mức 1. Làm cả bộ BizOn (4+ game) ở Mức 2 cần đội chuyên trách và 1–2 năm — đây là quy mô một studio nhỏ, không phải việc làm thêm giữa các buổi code như hiện tại.

## 7. Tận dụng nguồn lực sẵn có trong môi trường đại học (gợi ý thực tế)

- **Hợp tác khoa Thiết kế đồ họa/CNTT** hoặc CLB game dev sinh viên — nhận làm đồ án tốt nghiệp/thực tập 3D asset, vừa rẻ vừa đúng mục tiêu đào tạo liên ngành.
- **Đóng gói thành đề tài nghiên cứu** (phù hợp hướng nghiên cứu hiện có của PGS.TS Phan Anh Tú & NCS Đỗ Thùy Hương) — "Game hóa giảng dạy kinh doanh quốc tế bằng công nghệ 3D" có thể xin kinh phí cấp trường/cấp bộ, giải quyết bài toán ngân sách.
- **Unity for Education** — giấy phép miễn phí cho mục đích giáo dục phi lợi nhuận quy mô nhỏ.
- **Asset CC0/giá rẻ** — Kenney.nl, Quaternius, Mixamo, Sketchfab (đã dùng một phần) để giảm chi phí model/animation ban đầu.

## 8. Lộ trình đề xuất theo pha

| Pha | Thời gian | Ngân sách | Việc chính | Mục tiêu đo được |
|---|---|---|---|---|
| **0. Xác định mục tiêu** | 2–4 tuần | 0đ | Trả lời: làm 3D thật để làm gì — video tuyển sinh? sản phẩm nghiên cứu công bố? công cụ giảng dạy chính? Mỗi mục tiêu đòi fidelity khác hẳn | Văn bản mục tiêu + tiêu chí thành công |
| **1. Vertical slice** | 1 học kỳ | 0–50 triệu đồng | Chọn **một** game (gợi ý Hộ Chiếu Sầu Riêng — bản đồ đã phong phú nhất), dựng lại **một** cảnh (bến Bà Sáu Lành) bằng Unity WebGL **hoặc** nâng cấp tiếp nền Three.js sẵn có, phong cách Mức 1, tái dùng nguyên engine luật chơi JS | Đo thời gian tải thật trên thiết bị lớp học, đo phản ứng SV, đo công sức duy trì |
| **2. Mở rộng 1 game** | Nếu Pha 1 đạt | Theo Mức 1 hoặc 2 đã chọn | Hoàn thiện toàn bộ 1 game, dựng asset pipeline, tuyển/hợp tác nhân sự cố định | 1 game 3D thật hoàn chỉnh, đo được chi phí/game thực tế |
| **3. Nhân rộng** | Theo kết quả Pha 2 | Nhân theo số game | Áp dụng cho các game còn lại theo thứ tự ưu tiên | Toàn bộ bộ BizOn ở cùng fidelity |

**Không khuyến nghị nhảy thẳng vào Pha 3 hoặc Mức 3** mà bỏ qua đo lường ở Pha 1 — đây là cách các dự án 3D hóa thất bại phổ biến nhất: cam kết ngân sách lớn trước khi biết thiết bị lớp học có chạy nổi hay không.

## 9. Rủi ro cụ thể cần lường trước

- **Thiết bị lớp học không đồng đều** — nhiều SV dùng điện thoại/tablet phổ thông; build Unity WebGL nặng hơn trang HTML hiện tại hàng chục đến hàng trăm lần, có thể không chạy nổi hoặc tải quá lâu giữa giờ học.
- **Mất offline-first** — thế mạnh hiện tại (mở được không cần mạng sau lần đầu) khó giữ nguyên vẹn với build nặng.
- **Vòng lặp phát triển chậm lại** — hiện tại sửa 1 dòng JS, test Playwright vài phút, push PR trong một buổi; dự án Unity cần build time, khó CI hoá tương tự, không review bằng diff đơn giản.
- **Duy trì qua nhiều học kỳ** — cần quy trình asset/art/code tách biệt, không dễ "vừa học vừa làm" như HTML/JS hiện tại; nếu người phụ trách 3D nghỉ, kiến thức khó chuyển giao như code JS thuần.
- **Pha loãng trọng tâm nội dung** — giá trị cốt lõi của BizOn là số liệu thật có trích nguồn; ngân sách/thời gian dồn vào đồ họa dễ kéo trọng tâm khỏi nội dung sư phạm.

## 10. Khuyến nghị

1. **Không nên theo đuổi Mức 3 (ảnh thật kiểu Rio Rise)** cho bộ công cụ giảng dạy này — sai bài toán, ngân sách/rủi ro vượt xa giá trị sư phạm thu được, và phá vỡ đúng những gì đang làm BizOn hoạt động tốt.
2. **Nếu mục tiêu là "trông chuyên nghiệp hơn, có chiều sâu 3D thật"** (không phải thay thế hoàn toàn): con đường rẻ và rủi ro thấp nhất là nâng cấp tiếp nền Three.js/WebGL đã có sẵn trong repo — không cần học Unity, giữ nguyên toàn bộ lợi thế offline/miễn phí/vòng lặp nhanh.
3. **Nếu mục tiêu là làm sản phẩm/đề tài nghiên cứu nghiêm túc** để công bố hoặc gọi tài trợ: làm Pha 0 + Pha 1 trước (rẻ, đo được) rồi mới quyết ngân sách lớn cho Unity đầy đủ.

---

## 11. Tác động của kế hoạch thương mại hóa sau thử nghiệm

Đây là thông tin thay đổi phép tính, không chỉ là chi tiết thêm — toàn bộ khuyến nghị ở mục 10 vẫn đứng vững, nhưng lý do đứng vững thì khác hẳn.

### 11.1 Giấy phép engine theo doanh thu — không đáng lo ở giai đoạn pilot

Đã tra cứu ngưỡng hiện hành (xem Nguồn cuối tài liệu):

| Engine | Miễn phí tới đâu | Sau ngưỡng |
|---|---|---|
| **Unity Personal** | Doanh thu + vốn gọi được ≤ **200.000 USD**/12 tháng gần nhất | Bắt buộc lên Unity Pro (thuê bao theo seat) |
| **Unity Enterprise** | — | Bắt buộc khi > 25 triệu USD/12 tháng |
| **Unreal Engine** | **0% phí trước**, mọi doanh thu tới **1 triệu USD vòng đời/sản phẩm** | 5% royalty trên phần vượt 1 triệu USD (tính theo từng sản phẩm, không gộp cả studio) |

→ Cả hai engine đều có "đường băng miễn phí" đủ dài cho toàn bộ giai đoạn thử nghiệm và cả early-commercial (vài trăm khách hàng đầu, vài trường đại học đầu tiên trả phí). **Không cần quyết định Unity hay Unreal vì lý do chi phí license ở thời điểm hiện tại** — quyết định vẫn nên dựa trên mục 4 (phân phối web/offline), vì đó mới là ràng buộc thật.

### 11.2 Sở hữu trí tuệ — cần làm sớm, trước khi có doanh thu

Repo đã có sẵn quy trình đăng ký quyền tác giả (`docs/ho-so-so-huu-tri-tue.md`, `docs/bieu-mau-dang-ky-quyen-tac-gia.md`) — đây là nền tảng đúng, cần mở rộng áp dụng cho nhánh 3D trước khi thương mại hóa công khai:

- **Hợp đồng freelancer/sinh viên làm asset 3D phải có điều khoản chuyển nhượng toàn quyền** (work-for-hire), không chỉ "cho phép dùng" — khác biệt quan trọng giữa dùng cho đồ án học thuật và dùng trong sản phẩm bán ra thị trường.
- **Asset CC0 (Kenney, Quaternius, Mixamo) vẫn dùng thương mại được** — giấy phép CC0 không giới hạn mục đích sử dụng, kể cả bán sản phẩm. Không cần thay thế các asset nền đã dùng.
- **Đăng ký bảo hộ thương hiệu/nhân vật riêng càng sớm càng rẻ**: tên "BizOn", tên các game ("Hộ Chiếu Sầu Riêng", "Bến Phù Sa", "Bật Nghiệp"...), nhân vật ("Bà Sáu Lành", "Lumina", các CEO đối thủ...) — nếu để tới lúc có doanh thu mới đăng ký, rủi ro bị đăng ký trước hoặc tranh chấp cao hơn nhiều so với chi phí đăng ký sớm.

### 11.3 Bối cảnh thị trường — khoảng trống thật, nhưng chưa ai kiểm chứng

Tra cứu nhanh các sản phẩm mô phỏng kinh doanh dùng trong giáo dục được nhắc tới nhiều nhất: **Capsim** (Capstone/Foundation/Comp-XM/GlobalDNA), **Forio**, **Simul8**, **Interpretive Simulations**, **Top-BOSS**. Tất cả đều là mô phỏng dạng số liệu/bảng biểu — **không có đối thủ nào dùng trải nghiệm 3D nhập vai** như BizOn đang xây.

Hai mặt của việc này:
- **Cơ hội thật**: nếu BizOn mang được trải nghiệm 3D vào đúng phân khúc edtech-KDQT đang toàn số liệu/bảng biểu, đó là khác biệt hóa rõ ràng, không phải chạy đua tính năng với đối thủ đã có.
- **Rủi ro thật**: chính vì chưa ai làm, chưa có bằng chứng thị trường rằng "game 3D + nội dung học thuật trích nguồn" là mô hình khách hàng (trường/giảng viên) sẵn sàng trả tiền — khác với việc cải tiến một sản phẩm đã được thị trường chứng minh. **Đây là lý do kỹ hơn để pilot trước khi đầu tư fidelity cao**, không phải lý do để bỏ qua bước pilot.

### 11.4 Điều thật sự cần nâng cấp trước khi thương mại hóa — không phải đồ họa

Xếp theo thứ tự ưu tiên hợp lý hơn so với "nâng 3D trước":

1. **Bằng chứng hiệu quả sư phạm + mức sẵn lòng trả tiền** — thu thập từ chính đợt thử nghiệm hiện tại (phản hồi giảng viên, kết quả học tập đo được, mức độ engagement). Đây là tài sản quý nhất để gọi vốn/bán hàng, quan trọng hơn đồ họa đẹp.
2. **Kiến trúc multi-tenant** — Supabase hiện tại thiết kế cho quy mô một vài lớp/giảng viên. Thương mại hóa cho nhiều trường cần: phân quyền theo tổ chức (RLS theo tenant), hạ tầng billing, điều khoản dịch vụ, và quan trọng nhất là **chính sách bảo mật dữ liệu sinh viên** (khác hẳn yêu cầu khi chỉ dùng nội bộ một lớp).
3. **Sở hữu trí tuệ** — như mục 11.2, làm trước khi có doanh thu để chi phí thấp nhất.
4. **Đồ họa/3D fidelity** — chỉ nên là khoản đầu tư ở bước sau, dùng đúng ngân sách gọi được sau khi đã có bằng chứng ở bước 1, theo đúng lộ trình Pha 0→1→2→3 đã đề xuất ở mục 8.

### 11.5 Khuyến nghị cập nhật

Thông tin thương mại hóa **không đổi** khuyến nghị cốt lõi ở mục 10 — nó củng cố thêm lý do: giai đoạn thử nghiệm càng giữ chi phí thấp (CSS/2.5D hiện tại + nâng cấp nhẹ như vừa làm), càng nhiều "đạn" (thời gian, ngân sách, uy tín) để dành cho bước thương mại hóa thật khi đã có bằng chứng. Nâng fididelity 3D trước khi kiểm chứng được mô hình kinh doanh là rủi ro tài chính không cần thiết, không phải bước chuẩn bị khôn ngoan.

**Việc nên làm ngay, không tốn ngân sách 3D:** bắt đầu ghi lại có hệ thống bằng chứng từ đợt thử nghiệm (feedback form giảng viên/SV, số liệu sử dụng, kết quả học tập trước/sau) — đây sẽ là nền tảng quyết định fidelity nào, engine nào, ngân sách bao nhiêu khi tới lúc thương mại hóa thật.

---

## Việc "cần nâng" — phần bị ngắt trong tin nhắn trước

Tin nhắn trước của bạn dừng ở "Nếu nâng lên 3D thật, tôi cần nâng" — có vẻ bị cắt giữa chừng. Để trả lời đúng ý, dưới đây là mọi thứ cần nâng cấp/chuẩn bị nếu thật sự đi theo hướng Unity/Unreal, theo từng nhóm — bạn xem có đúng phần bạn định hỏi không, hoặc cho tôi biết ý đầy đủ:

- **Nhân sự**: cần ít nhất 1 người biết 3D (modeling/tech-art) + 1 người biết lập trình game engine — hiện tại chưa có vai trò này trong đội.
- **Công cụ/phần mềm**: Unity Editor (miễn phí bản Personal/Education), phần mềm dựng model (Blender — miễn phí), tài khoản Asset Store nếu mua asset sẵn.
- **Phần cứng phát triển**: máy tính dựng game cần GPU rời tương đối (khác với máy code JS hiện tại chỉ cần trình duyệt) — đây là khoản đầu tư phần cứng mới nếu chưa có.
- **Ngân sách**: xem bảng Mức 1/2/3 ở mục 3 — từ 0 đồng (Mức 1, tái dùng asset CC0) tới hàng tỷ đồng (Mức 2 trở lên).
- **Kỹ năng/thời gian học**: nếu tự làm thay vì thuê, cần thời gian học Unity/C# — không chuyển giao trực tiếp từ kỹ năng JS hiện tại.
- **Hạ tầng phân phối**: nếu xuất app cài đặt thay vì WebGL, cần tài khoản Google Play/App Store, quy trình ký app, cập nhật theo học kỳ.

Cho tôi biết đúng ý "cần nâng ___" của bạn (nâng cấp phần cứng? nâng cấp đội ngũ? nâng ngân sách bao nhiêu?) để tôi khoanh đúng trọng tâm thay vì liệt kê dàn trải như trên.

---

## Nguồn tra cứu (mục 11.1, 11.3)

- [State of Unity Licensing in 2026](https://enginesdatabase.com/blog/state-of-unity-licensing-in-2026/)
- [Unity — Plans & Pricing](https://unity.com/products)
- [Unreal Engine EULA — Royalty obligation threshold at $1,000,000](https://conductatlas.com/platform/unreal-engine/unreal-engine-eula/royalty-obligation-threshold-at-one-million-usd/)
- [Meta Developer Docs — Unreal / Oculus license](https://developers.meta.com/horizon/documentation/unreal/unreal-oculus-license/)
- [Unity vs Unreal Engine 2026](https://tech-insider.org/unity-vs-unreal-engine-2026/)
- [Capsim alternatives/competitors — CB Insights](https://www.cbinsights.com/compare/capsim-vs-top-boss)

*Lưu ý: các con số license engine đổi theo thời gian — kiểm tra lại trang chính thức của Unity/Epic trước khi đưa vào hợp đồng hoặc quyết định ngân sách chính thức.*
