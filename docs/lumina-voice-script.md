# Danh sách các đoạn cần thu âm giọng Lumina — BizOn Bật Nghiệp

**Ngày soạn:** 29/09/2026 · **Trạng thái âm thanh hiện tại:** đã **tạm tắt** toàn bộ giọng Lumina trên game (xem mục cuối) trong lúc chờ thu âm lại.

## Cách hệ thống giọng nói hoạt động

Game có 2 lớp giọng cho Lumina, ưu tiên bản thu thật hơn giọng máy:

1. **Bản thu sẵn** (`assets/audio/voice/<clip>.mp3`) — phát qua `playVoice(clip)`, xếp hàng để không chồng tiếng. Đây là 41 đoạn thoại cố định liệt kê đầy đủ bên dưới.
2. **Giọng máy dự phòng (TTS trình duyệt)** — chỉ dùng khi một câu tư vấn *động* (do AI cố vấn sinh ra tùy tình huống, không có clip cố định) không có bản thu sẵn. Loại này không thu âm trước được vì nội dung thay đổi theo dữ liệu mỗi ván.
3. **2 hiệu ứng âm thanh độc lập** (`lumina-victory.mp3`, `lumina-round-result.mp3`) — phát trực tiếp bằng `playClip()`, không gắn với dòng chữ cụ thể nào trong code — cần **soạn lời thoại mới** trước khi thu (gợi ý bên dưới).
4. **1 file không còn dùng**: `lumina-advisor-hello.mp3` — đã bị thay bằng `chat-02` từ trước, có thể bỏ qua khi thu lại.

Tất cả 41 clip trong bảng dưới đã có sẵn 1 file mp3 tương ứng trong repo (khả năng là bản dựng tạm/giọng cũ) — **liệt kê lại toàn bộ để cô/thầy thu mới**, không phải danh sách "còn thiếu".

---

## A. Câu trích dẫn Nhật ký đội (6 câu — 3 người nói khác nhau)

Hiện ở tab Nhật ký, đọc khi bấm nút 🔊 cạnh mỗi câu.

| Clip | Người nói | Nội dung tiếng Việt |
|---|---|---|
| `quote-01` | **Lumina** | Mục tiêu không phải là đánh bại đối thủ, mà là làm cho họ trở nên không còn quan trọng. |
| `quote-02` | SEC (nhân vật) | Mọi báo cáo tài chính đều là một câu chuyện, hãy đảm bảo đội của bạn đang viết một chương thành công. |
| `quote-03` | Phan Anh Tú | Dữ liệu cho ta biết quá khứ, quyết định hôm nay viết nên tương lai. |
| `quote-04` | **Lumina** | Khủng hoảng là bài kiểm tra tốt nhất cho năng lực quản trị dòng tiền. |
| `quote-05` | Phan Anh Tú | Thị phần mua được bằng tiền, nhưng lòng trung thành phải xây bằng giá trị. |
| `quote-06` | SEC (nhân vật) | Đừng sợ commit sai – hãy sợ việc không rút ra được bài học nào. |

> ⚠️ Chỉ `quote-01` và `quote-04` là giọng **Lumina**; 4 câu còn lại là lời của nhân vật SEC và của thầy Phan Anh Tú — nếu thu riêng giọng Lumina thì có thể bỏ qua 4 câu này, hoặc thu bằng giọng khác phù hợp với từng người nói.

## B. Lumina trò chuyện — tab Cố vấn AI (6 đoạn)

| Clip | Bối cảnh phát | Nội dung tiếng Việt |
|---|---|---|
| `chat-02` | Lời chào khi mở tab Cố vấn lần đầu | Xin chào, Je m'appelle Hương! 👋 Tôi là Lumina – cố vấn AI của đội {tên đội}. Hãy chọn một câu hỏi bên dưới, tôi sẽ phân tích kịch bản "Nếu – Thì" cho bạn. |
| `chat-03` | Sau khi CFO duyệt khoản vay | Đã giải ngân khoản vay 300tr₫! Lưu ý: lãi 5%/vòng (15tr₫) sẽ trừ vào lợi nhuận mỗi vòng còn lại. Hãy dùng vốn hiệu quả để ROI vượt chi phí vốn nhé. |
| `chat-04` | Sau khi kích hoạt cắt giảm chi phí | Đã kích hoạt phương án cắt giảm chi phí – chi phí cố định vòng sau giảm 15%. Cẩn thận đừng cắt vào các khoản đầu tư dài hạn! |
| `chat-05` | Sau khi kích hoạt Branding Premium | Branding Premium đã kích hoạt! Giá trị thương hiệu tăng – thị phần và Brand Loyalty sẽ cải thiện từ vòng sau. 🎉 |
| `chat-06` | Sau khi lên lịch bảo trì khẩn | Đã lên lịch bảo trì khẩn! OEE sẽ cải thiện +3% và tỷ lệ phế phẩm giảm ở vòng tới. 🔧 |
| `chat-07` | Hết lượt hỏi cố vấn trong vòng | ERR_AI_LIMIT_REACHED – Bạn đã dùng hết lượt tư vấn của vòng này. Lượt sẽ làm mới sau khi Commit quyết định nhé! |

*(Ghi chú: `chat-01` không tồn tại trong code — không phải thiếu sót, đánh số bắt đầu từ 02.)*

## C. Cố vấn theo vai trò — 4 "bộ não" CMO/CFO/COO/SEC (16 đoạn)

Đây là phần thoại **dài và nhiều nhất** — Lumina phân tích tình huống kinh doanh hiện tại của từng vai trò mỗi vòng chơi.

### CMO Brain (5 đoạn)
| Clip | Tình huống kích hoạt | Nội dung tiếng Việt |
|---|---|---|
| `adv-02` | Thị phần giảm > 5% so với vòng trước | Đối thủ đang xâm chiếm phân khúc của chúng ta bằng giá rẻ. Chúng ta cần tăng ngân sách quảng cáo hoặc tung sản phẩm R&D mới. |
| `adv-03` | Hiệu quả Marketing thấp (doanh thu/chi phí < 3) | CMO thân mến, chi phí tiếp thị của chúng ta đang quá cao nhưng không chuyển đổi thành doanh thu tương ứng. Hãy rà soát lại thông điệp chiến dịch. |
| `adv-04` | Đáp ứng nhu cầu < 90% (thiếu hàng) | Nhu cầu thị trường đang rất lớn nhưng chúng ta không có đủ hàng để bán. Hãy phối hợp với COO để tăng sản lượng. |
| `adv-05` | Biến cố chiến tranh giá | Thưa CMO, một đối thủ vừa hạ giá 15% và chiếm mất 8% thị phần của chúng ta. Nếu không phản ứng trong vòng tới, chúng ta sẽ mất vị thế dẫn đầu. |
| *(không mã clip riêng)* | Cơ hội xanh — xu hướng tiêu dùng bền vững | CMO ơi, thị trường đang khao khát sản phẩm bền vững. Nếu chúng ta "Bật" chiến dịch xanh ngay bây giờ, chúng ta sẽ dẫn đầu xu hướng! |

### CFO Brain (3 đoạn)
| Clip | Tình huống kích hoạt | Nội dung tiếng Việt |
|---|---|---|
| `adv-14` | Khủng hoảng thanh khoản (Quick Ratio < 1) | CFO, thanh khoản đang ở vùng đỏ! Tiền mặt chỉ còn {số tiền}tr₫, vòng quay tồn kho lên tới {số ngày} ngày. Hãy phê duyệt khoản vay khẩn cấp hoặc cắt giảm chi phí ngay – đừng để lỡ kỳ trả lương. |
| `adv-15` | ROI cao hơn lãi vay, chưa vay | ROI hiện tại ({số}%) đang cao hơn chi phí vốn vay ({số}%). Đây là thời điểm tốt để dùng đòn bẩy tài chính mở rộng sản xuất, CFO ạ. |
| `adv-16` | Thanh khoản an toàn | Thanh khoản ổn định, vòng quay tồn kho {số} ngày trong ngưỡng an toàn. Hãy duy trì kỷ luật chi tiêu và theo dõi dòng tiền từng vòng nhé. |

### COO Brain (5 đoạn)
| Clip | Tình huống kích hoạt | Nội dung tiếng Việt |
|---|---|---|
| `adv-06` | Tồn kho > 40% nhu cầu | Lượng hàng tồn kho đang quá lớn, gây lãng phí chi phí lưu kho. Hãy phối hợp với CMO để đẩy mạnh tiêu thụ hoặc giảm sản lượng. |
| `adv-07` | Tỷ lệ phế phẩm tăng > 12% | Thưa COO, tôi nhận thấy tỷ lệ sản phẩm lỗi tăng mạnh. Nguyên nhân là do đội ngũ nhân sự mới chưa được đào tạo bài bản. Chúng ta nên đầu tư vào gói "Đào tạo chuyên sâu" để lấy lại phong độ. |
| `adv-08` | Công suất nhà máy > 95% | COO ơi, nhà máy đang chạy quá tải. Nếu không đầu tư mở rộng ngay, chúng ta sẽ bỏ lỡ cơ hội bán hàng ở vòng tới. |
| `adv-09` | Vòng trước bị thiếu hàng | Thị trường đang "khát" hàng nhưng chúng ta không đủ năng lực cung ứng. Đây là lúc để kích hoạt tăng ca hoặc mở rộng công suất. |
| `adv-10` | Vận hành ổn định | Vận hành đang mượt mà, COO ạ. Hãy duy trì bảo trì định kỳ và theo dõi OEE để giữ phong độ nhé. |

### SEC Brain (4 đoạn)
| Clip | Tình huống kích hoạt | Nội dung tiếng Việt |
|---|---|---|
| `adv-17` | Có biến cố xấu, chưa commit | Biến cố "{tên biến cố}" vừa ập đến! SEC hãy nhanh chóng tổng hợp thông tin từ COO về tình hình sản xuất và báo cáo cho CEO để điều chỉnh giá bán kịp thời. |
| `adv-11` | Chưa chốt quyết định vòng | SEC ơi, các bộ phận vẫn chưa thống nhất con số cuối cùng. Hãy nhắc CEO chốt quyết định ngay để tránh bị hệ thống tự động khóa! |
| `adv-12` | Nhật ký cố vấn còn trống | Dữ liệu lịch sử đang bị trống. SEC cần ghi chú lại các biến cố quan trọng để đội có cơ sở phân tích cho các vòng sau nhé. |
| `adv-13` | Toàn đội đã sẵn sàng commit | Tuyệt vời! Toàn đội đã sẵn sàng. SEC hãy kiểm tra lại lần cuối và báo cáo CEO thực hiện nút nhấn "Commit" thần thánh nhé. |

## D. Khen ngợi cuối vòng — KPI xuất sắc (3 đoạn)

| Clip | Điều kiện | Nội dung tiếng Việt |
|---|---|---|
| `kpi-01` | ROI > 30% | Thật tuyệt vời, CFO! Chiến lược tối ưu cấu trúc vốn của bạn đã mang lại lợi nhuận kỷ lục (ROI {số}%). Dòng tiền đang cực kỳ dồi dào để chúng ta tái đầu tư mở rộng! |
| `kpi-02` | Thị phần tăng mạnh / dẫn đầu | Chúc mừng CMO! Chiến dịch Marketing Mix của bạn đã đánh bại hoàn toàn đối thủ. Thương hiệu của đội hiện đang là lựa chọn số 1 của khách hàng! |
| `kpi-03` | OEE ≥ 95%, phế phẩm < 1% | COO ơi, hiệu suất nhà máy đạt mức không tưởng (OEE {số}%, phế phẩm {số}%)! Bảo trì dự phòng và đào tạo công nhân đã giúp dây chuyền chạy mượt tuyệt đối. |

## E. Cảnh báo rủi ro cuối vòng (2 đoạn)

| Clip | Điều kiện | Nội dung tiếng Việt |
|---|---|---|
| `risk-01` | OEE < 60% hoặc phế phẩm > 7% | Dây chuyền sản xuất đang kêu cứu! Tỷ lệ phế phẩm quá cao sẽ bào mòn lợi nhuận gộp. Đừng ép máy móc chạy quá tải mà bỏ qua bảo trì – hãy bảo trì định kỳ và đào tạo nhân sự kỹ thuật. |
| `risk-02` | Sản xuất > 90% công suất và Quick Ratio < 1 | Thưa CEO, chúng ta đang đứng trước ngưỡng cửa phá sản kỹ thuật. Sự đánh đổi giữa tăng trưởng nóng và an toàn dòng tiền đang bị lệch pha – hãy họp khẩn cấp toàn đội và rà soát lại quyết định. |

## F. Gợi ý "Nếu – Thì" theo chủ đề thị trường (7 đoạn)

| Clip | Chủ đề | Nội dung tiếng Việt |
|---|---|---|
| `topic-01` | Chiến tranh giá | Vòng này là Chiến tranh giá – khách cực nhạy về giá. Nếu bạn giữ giá trên {giá}k₫, thị phần có thể rơi mạnh. Cân nhắc giảm 10–15% và bù bằng sản lượng. |
| `topic-02` | Vòng trước thiếu hàng | Vòng trước bạn hụt {số} đơn vì thiếu hàng – cầu đang vượt cung. Nếu tăng giá 5–10%, lợi nhuận biên sẽ cải thiện mà thị phần giảm không đáng kể. |
| `topic-03` | Giá tham chiếu thị trường | Giá tham chiếu thị trường là {giá}k₫. Nếu giảm 10% giá, mô hình dự báo thị phần tăng ~3–4 điểm nhưng biên lợi nhuận mỏng đi – chỉ nên làm khi sản lượng đủ lớn. |
| `topic-04` | Gợi ý tăng Marketing | Nếu tăng ngân sách Marketing thêm 15%, thị phần dự kiến đạt {số}% ở vòng sau. Khuyến nghị: Marketing Boost, R&D Upgrade. |
| `topic-05` | Biến cố xấu (cảnh báo đỏ) | ⚠️ Cảnh báo đỏ: {tên biến cố} – {mô tả}. Nếu không giữ ít nhất 15% vốn dự phòng, đội có thể âm dòng tiền. Cân nhắc mua "Khiên bảo hiểm" trong Cửa hàng. |
| `topic-06` | Biến cố cảnh báo vừa | Rủi ro chính vòng này: {tên biến cố}. {mô tả} Hãy điều chỉnh cơ cấu chi phí trước khi commit. |
| `topic-07` | Cơ hội tốt | Cơ hội xanh ngọc: {tên biến cố}. {mô tả} Đây là lúc mạnh dạn đầu tư để bứt phá thị phần. |

## G. BizOn Go Global — gợi ý mở rộng quốc tế (3 đoạn)

| Clip | Điều kiện | Nội dung tiếng Việt |
|---|---|---|
| `glob-01` | Thị phần quốc tế < 35% | Lumina: thị phần đang yếu – cân nhắc giảm giá hoặc tăng bản địa hóa cho hợp văn hóa bản địa. |
| `glob-02` | Đang lỗ quý này | Lumina: đang lỗ quý này – kiểm soát ngân sách hoặc chấp nhận đầu tư giai đoạn thâm nhập. |
| `glob-03` | Cân bằng tốt | Lumina: cân bằng tốt! Kỷ nguyên số thưởng cho ai dám đầu tư marketing số đúng lúc. ✨ |

## H. 2 hiệu ứng âm thanh độc lập — CẦN SOẠN LỜI THOẠI

Hai file này không có dòng chữ cố định gắn kèm trong code, chỉ phát tiếng khi vào đúng màn hình — **cần cô/thầy chốt lời thoại trước khi thu**:

| File | Phát khi nào | Gợi ý lời thoại (nháp) |
|---|---|---|
| `lumina-round-result.mp3` | Mỗi lần xem kết quả 1 vòng chơi (mọi vòng, thắng hay thua) | "Kết quả vòng này đã có rồi đây! Cùng xem đội mình làm tốt ở đâu và cần cải thiện gì nhé." |
| `lumina-victory.mp3` | Khi đội dẫn đầu thị phần (màn hình Chúc mừng chiến thắng) | "Chúc mừng đội đã vươn lên dẫn đầu thị trường! Đây là thành quả của cả một hành trình quyết định thông minh." |

## I. Không cần thu — đã ngừng dùng

| File | Lý do |
|---|---|
| `lumina-advisor-hello.mp3` | Đã thay bằng `chat-02`, không còn được gọi trong code (xem ghi chú tại `js/app.js`, hàm `showTab`). |

---

## Đã tạm tắt âm thanh Lumina trên game

Theo yêu cầu, `js/app.js` đã đổi biến `voiceEnabled` về `false` mặc định (có ghi chú rõ trong code là **tạm thời**) và đồng bộ nút "🔊/🔇" trên màn hình về trạng thái Tắt. Cả giọng thu sẵn lẫn giọng máy TTS đều bị tắt; người chơi vẫn có thể tự bấm nút để bật lại cho phiên đang chơi nếu muốn.

**Khi có bộ giọng mới thu xong**, khôi phục bằng cách sửa lại đúng 1 dòng trong `js/app.js`:

```js
// hiện tại (tạm tắt):
let voiceEnabled = false;

// đổi lại thành (đọc theo lựa chọn đã lưu của người chơi):
let voiceEnabled = localStorage.getItem('bizon-voice') !== 'off';
```

Và đổi nhãn nút mặc định trong `game.html` (`#voice-toggle`) trở lại "🔊 Bật".
