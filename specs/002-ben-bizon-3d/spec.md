# Đặc tả tính năng: Bến BizOn – đi bộ và chèo xuồng 3D cho các game BizOn

**Nhánh**: `claude/dao-pho-3d` (thư mục đặc tả `002-ben-bizon-3d`)

**Ngày tạo**: 2026-11-10

**Trạng thái**: Đã làm rõ ngày 10/11/2026, chờ chị duyệt kế hoạch

**Đầu vào**: «Tôi muốn game bizon nhân vật di chuyển thế này» (kèm trang vspeak.asia/flashcard và video quay màn hình
«Thành phố 3D»): nhân vật 3D đi bộ, máy quay bám sau lưng, cần điều khiển ở góc trái dưới, bản đồ nhỏ ở góc phải, đi
tới một địa điểm thì hiện thẻ tên và nút «Vào», có người qua lại. Chị đã chốt ngày 10/11/2026: áp dụng cho **tất cả
game 3D**; nhân vật dùng **7 mô hình có xương sẵn trong kho**. Chị nói thêm: «Không hẳn là dạo phố để có nét riêng
của game»: lấy **cách di chuyển** của mẫu, còn bối cảnh và nét riêng phải là của BizOn.

## Hiện trạng (đo ngày 10/11/2026)

**Mẫu tham khảo (video quay màn hình 156 giây, 1080 × 2340):** chọn một nhân vật chibi 3D; nhân vật đi bộ trong khu
phố toàn màn hình; máy quay ở sau lưng và xoay theo hướng đi; cần điều khiển tròn ở góc trái dưới; bản đồ nhỏ ở góc
phải; toà nhà có bảng tên; tới gần một điểm thì hiện thẻ («Chòi giao lưu / Meet-up Corner») kèm nút «Vào» mở hoạt
động của điểm đó; có người khác đi lại; khi trời mưa có lời nhắc chạy tới chỗ trú gần nhất.

**BizOn hiện nay:**

| Trang | Người chơi di chuyển thế nào | Nhân vật | Máy quay | Thuộc hồ sơ quyền tác giả |
|---|---|---|---|---|
| Sảnh 3D (`hub-3d.html`, trang thử, chưa vào sitemap) | WASD, mũi tên, cần điều khiển; 5 cửa sang game, 2 cố vấn, máy hát, bảng tin | Tranh dựng đứng (2 đại diện áo dài), giả bước đi bằng nhấp nhô | Cố định trên cao, nhìn chéo xuống | Không |
| Bật Nghiệp 3D (`BizOn Game 3D.html`): văn phòng đội | WASD, mũi tên, cần điều khiển, bấm sàn; tới gần bấm E | Tranh dựng đứng; mô hình có xương chỉ bật khi có cờ | Nhìn chéo từ trên | **Có** |
| Bến Phù Sa 3D (`ben-phu-sa-3d.html`): «Văn phòng chiến lược» | Như trên; cảnh là tranh phẳng nhìn từ trên, không phải 3D thật | Ảnh nhân vật | Nhìn từ trên | **Có** |
| Hộ Chiếu Thương Hiệu 3D (`Ho Chieu Thuong Hieu 3D.html`): «Văn phòng chiến lược» | Như Bến Phù Sa 3D (dùng chung một mô-đun) | Ảnh nhân vật | Nhìn từ trên | **Có** |
| Hộ Chiếu Sầu Riêng 3D (`lab/ho-chieu-sau-rieng-3d.html`, trang thử) | WASD, mũi tên, cần điều khiển, bấm sàn; tới gần nhân vật có dấu «!» bấm E; thẻ «Việc tiếp theo» có nút dẫn đường | Người chơi là hình 3D đất sét (nông dân đội nón lá); người trong cảnh là tượng ảnh cắt nền | Đi theo người chơi nhưng ở xa và cao, không xoay theo hướng đi | Không |
| Ra Khơi Cùng Lớp 3D (`ra-khoi-3d.html`) | Lái thuyền, nhiều người cùng lúc | Thuyền | Bám theo thuyền | Không |

- Sảnh 3D trên điện thoại: khung 3D chỉ là một ô tỉ lệ 16:10 nằm giữa trang, không toàn màn hình: 348 × 218 px
  trên màn 412 × 839 (Pixel 7), 326 × 204 px trên màn 390 × 664 (iPhone 13); chữ hướng dẫn che gần nửa ô. Không
  có bản đồ nhỏ.
- Kho có 7 mô hình có xương (`assets/models/nhan-vat/`: CEO, CFO, CMO, COO, Thư ký, Lumina, thầy Tu Phan), mỗi tệp
  0,95–1,11 MB, tổng 6,96 MB, đủ ba động tác đứng, nói, đi. Dựng từ chính tranh gốc của game.
- Các mô hình này **đang tắt mặc định** từ PR #1024 vì «nhòe mặt và bảng tên so với tranh gốc».
- Không trang nào có máy quay bám sát sau lưng và xoay theo hướng đi của nhân vật. Không trang nào có bản đồ nhỏ.
  Không trang nào hiện thẻ có nút «Vào» khi tới gần (đang dùng phím E hoặc một nút «Nói chuyện»).
- Ba game bản 3D đã nộp hồ sơ quyền tác giả (khóa ở commit `afbacd2`, 07/10/2026): không đổi tên, không sửa khối mã
  trong tệp trang của ba game này cho tới khi có giấy chứng nhận.

## Làm rõ

Chị trả lời ngày 10/11/2026:

1. **Áp dụng ở đâu?** Tất cả game 3D.
2. **Nhân vật?** 7 mô hình có xương sẵn trong kho.
3. **Ba game thuộc hồ sơ quyền tác giả (Bật Nghiệp 3D, Bến Phù Sa 3D, Hộ Chiếu Thương Hiệu 3D)?** **Chờ có giấy chứng
   nhận** rồi mới làm. Hai câu chuyện về ba game này (nay là câu chuyện 5 và 6) vì vậy **hoãn**, giữ trong đặc tả
   để làm tiếp sau; lượt này chỉ làm câu chuyện 1 đến 4.
4. **Đi bộ bắt buộc hay có lối tắt?** Luôn có lối tắt «Đi tới…».
5. **Người chơi điều khiển ai?** Chỉ 5 vai đội (CEO, CFO, CMO, COO, Thư ký); Lumina và thầy Tu Phan là cố vấn đứng
   trong cảnh.
6. **Người qua lại là ai?** Nhân vật BizOn đi theo lối định sẵn; không cần mạng, không thêm dữ liệu người học.
7. **Bối cảnh thay cho «phố» kiểu vspeak?** **Bến sông miền Tây** bằng đất sét: cầu tàu, ghe chợ nổi, nhà sàn, hàng
   dừa; mỗi game là một điểm đúng chất của nó. Gọi là **«Bến BizOn»**. Khớp câu chuyện «Từ Phù Sa ra Thế giới».
8. **Nét riêng trong cách di chuyển?** **Đi bộ và chèo xuồng**: trên bờ đi bộ, tới mép nước xuống xuồng chèo trên
   sông, cùng một cần điều khiển.

**Thuật ngữ**: «kiểu sau lưng» là cách di chuyển có máy quay bám sau lưng nhân vật (đi bộ hoặc chèo xuồng), để phân
biệt với «kiểu cũ» nhìn từ trên xuống.

## Kịch bản người dùng và kiểm thử *(bắt buộc)*

### Câu chuyện 1 – Sinh viên đi bộ ở «Bến BizOn» để vào game (Ưu tiên: P1)

Sinh viên hay khách mở Bến BizOn (Sảnh 3D nâng cấp) trên điện thoại, chọn một nhân vật, rồi đi bộ trên một bến sông
miền Tây bằng đất sét, toàn màn hình, bằng cần điều khiển. Máy quay ở sau lưng nhân vật. Mỗi game là một điểm đúng
chất của nó: ghe chợ nổi cập cầu tàu là Bến Phù Sa, trụ sở Cần Thơ là Bật Nghiệp, con tàu ở cầu cảng là Hộ Chiếu
Thương Hiệu, vườn sầu riêng là Hộ Chiếu Sầu Riêng. Tới gần thì hiện thẻ tên game, một dòng mô tả và nút «Vào».

**Vì sao P1**: nằm ngoài hồ sơ quyền tác giả nên làm được ngay; là nơi dựng phần di chuyển dùng chung cho mọi game
phía sau; tự nó đã là một lối vào game dùng được.

**Kiểm độc lập**: mở Bến BizOn ở 390 px, chọn nhân vật, đẩy cần điều khiển ra cầu tàu tới ghe chợ nổi, bấm «Vào» →
mở đúng trang Bến Phù Sa.

**Kịch bản chấp nhận**:

1. **Cho** sinh viên mở Bến BizOn trên điện thoại 390 px, **khi** chọn xong nhân vật, **thì** cảnh 3D chiếm toàn màn
   hình, nhân vật là mô hình 3D nhìn từ sau lưng, cần điều khiển ở góc trái dưới; cảnh là bến sông (có sông, cầu
   tàu, ghe), không phải phố xá.
2. **Cho** nhân vật đang đứng, **khi** đẩy cần điều khiển, **thì** nhân vật quay mặt theo hướng đi, có động tác bước
   chân, và máy quay đi theo sau lưng; thả tay thì nhân vật đứng lại với động tác đứng.
3. **Cho** nhân vật tới gần một điểm game, **khi** vào trong tầm, **thì** hiện thẻ có tên game, mô tả ngắn, nhãn
   «miễn phí» hay «dùng thử» đúng chính sách, và nút «Vào»; đi ra xa thì thẻ biến mất.
4. **Cho** thẻ đang hiện, **khi** bấm «Vào» (hoặc phím E / Enter), **thì** mở đúng game của điểm đó.
5. **Cho** người dùng máy tính, **khi** dùng WASD hoặc phím mũi tên, **thì** đi được như cần điều khiển.
6. **Cho** người không muốn hoặc không thể đi bộ, **khi** mở danh sách «Đi tới…», **thì** chọn được thẳng một điểm
   và thấy thẻ «Vào» của nó.
7. **Cho** nhân vật đi tới mép bờ hay mép cầu tàu, **khi** tiếp tục đẩy cần, **thì** nhân vật dừng ở mép, không rơi
   xuống nước.

---

### Câu chuyện 2 – Xuống xuồng chèo trên sông (Ưu tiên: P2)

Ở bến xuồng, sinh viên bấm «Xuống xuồng»; nhân vật đứng trên chiếc xuồng nhỏ và người chơi chèo đi trên sông bằng
chính cần điều khiển đó. Trên sông có khu chợ nổi và những điểm chỉ tới được bằng xuồng. Về bến thì bấm «Lên bờ».

**Vì sao P2**: đây là nét riêng miền Tây mà mẫu tham khảo không có, là thứ làm BizOn khác đi; nhưng thiếu nó câu
chuyện 1 vẫn vào được mọi game.

**Kiểm độc lập**: đi tới bến xuồng, bấm «Xuống xuồng», chèo ra khu chợ nổi → hiện thẻ «Vào» của Bến Phù Sa; chèo về
bến, bấm «Lên bờ» → đi bộ lại bình thường.

**Kịch bản chấp nhận**:

1. **Cho** nhân vật đứng ở bến xuồng, **khi** vào trong tầm, **thì** hiện thẻ «Xuống xuồng»; bấm thì nhân vật lên
   xuồng và máy quay chuyển ra sau xuồng.
2. **Cho** đang ở trên xuồng, **khi** đẩy cần điều khiển, **thì** xuồng quay mũi từ từ, lướt đi có đà, mái chèo
   khua; thả tay thì xuồng trôi chậm dần rồi dừng.
3. **Cho** xuồng chạm bờ, cầu tàu hay ghe khác, **khi** tiếp tục đẩy cần, **thì** xuồng dừng lại, không leo lên bờ,
   không đi xuyên.
4. **Cho** xuồng tới gần một điểm trên nước, **khi** vào trong tầm, **thì** hiện thẻ «Vào» như trên bờ.
5. **Cho** xuồng về tới một bến, **khi** vào trong tầm, **thì** hiện thẻ «Lên bờ»; bấm thì nhân vật đứng trên bến
   và đi bộ lại.
6. **Cho** người dùng lối tắt «Đi tới…» chọn một điểm trên nước, **khi** đang ở trên bờ, **thì** được đưa thẳng tới
   điểm đó trên xuồng, không phải tự chèo.
7. **Cho** người dùng bật «giảm chuyển động», **khi** ở trên xuồng, **thì** xuồng và máy quay không bập bềnh.

---

### Câu chuyện 3 – Biết mình đang ở đâu: bản đồ nhỏ và người qua lại (Ưu tiên: P3)

Khi đi ở Bến BizOn, sinh viên thấy bản đồ nhỏ ở góc phải có chấm của mình và biểu tượng các địa điểm; trên bến có các nhân
vật BizOn khác đi lại, tới gần thì chào một câu.

**Vì sao P3**: giúp định hướng và làm bến có sức sống, nhưng thiếu nó câu chuyện 1 và 2 vẫn dùng được.

**Kiểm độc lập**: đi nhân vật một đoạn → chấm trên bản đồ nhỏ dịch theo; bấm một biểu tượng trên bản đồ → có đường
chỉ tới địa điểm đó.

**Kịch bản chấp nhận**:

1. **Cho** nhân vật đang đi, **khi** đổi vị trí, **thì** chấm của mình trên bản đồ nhỏ dịch đúng hướng và đúng tỉ lệ.
2. **Cho** bản đồ nhỏ đang hiện, **khi** bấm biểu tượng một địa điểm, **thì** trong cảnh hiện mũi tên chỉ đường tới đó.
3. **Cho** một nhân vật khác đang đi trên bến, **khi** người chơi tới gần, **thì** nhân vật ấy dừng, quay lại và hiện
   một câu chào gợi ý nên ghé đâu; không chọn giúp, không đưa đáp án.
4. **Cho** màn hình 360 px, **khi** bản đồ nhỏ và thẻ «Vào» cùng hiện, **thì** không che nhau và không che cần điều
   khiển.

---

### Câu chuyện 4 – Hộ Chiếu Sầu Riêng 3D: đi qua 8 chặng (Ưu tiên: P4)

Đội chơi Hộ Chiếu Sầu Riêng 3D điều khiển nhân vật đi dọc chuỗi 8 chặng từ vườn tới quầy bán lẻ. Tới chặng nào hiện
thẻ của chặng đó với nút «Vào» để làm việc của chặng. Luật chơi, điểm số và ván lưu không đổi.

**Vì sao P4**: game này không thuộc hồ sơ nên là game thật đầu tiên áp dụng được; đang là trang thử nên rủi ro thấp.

**Kiểm độc lập**: chơi trọn một vụ bằng cách đi bộ và một vụ bằng lối tắt «Đi tới…» → kết quả vụ như nhau khi chọn
cùng quyết định.

**Kịch bản chấp nhận**:

1. **Cho** đội đang ở vụ 1, **khi** đi nhân vật tới một trạm hay một người có việc, **thì** máy quay ở sát sau lưng,
   hiện thẻ tên và nút «Vào»; bấm thì mở đúng hội thoại hay bảng việc mà phím E đang mở hiện nay.
2. **Cho** cùng một bộ quyết định, **khi** chơi bằng đi bộ hay bằng lối tắt, **thì** điểm, cờ và báo cáo vụ giống hệt.
3. **Cho** ván đang lưu từ trước khi có tính năng, **khi** mở lại, **thì** chơi tiếp được, không mất dữ liệu.
4. **Cho** bản 2D và bản gọn của cùng game, **khi** chạy bộ test hiện có, **thì** không đổi kết quả.

---

### Câu chuyện 5 – Bến Phù Sa 3D và Hộ Chiếu Thương Hiệu 3D: «Văn phòng chiến lược» kiểu sau lưng (Ưu tiên: P5, HOÃN)

Trong hai game này, phần «Văn phòng chiến lược» (nơi đi gặp cố vấn và các góc chức năng) có thêm kiểu sau lưng: nhân
vật 3D, máy quay sau lưng, thẻ «Vào». **Hoãn tới khi có giấy chứng nhận quyền tác giả** (chị quyết 10/11/2026); khi
làm sẽ hỏi lại chị cách đưa vào (thêm làm tuỳ chọn hay thay hẳn kiểu cũ).

**Vì sao P5**: hai game dùng chung một phần «văn phòng» nên làm một lần được cả hai, nhưng vướng hồ sơ nên đi sau.

**Kiểm độc lập**: mở từng game, vào Văn phòng chiến lược bằng kiểu sau lưng, tới một cố vấn và một góc chức năng →
mở đúng hội thoại và đúng bảng như kiểu cũ.

**Kịch bản chấp nhận**:

1. **Cho** người chơi ở kiểu sau lưng, **khi** tới gần cố vấn hay góc chức năng, **thì** thẻ «Vào» mở đúng nội dung mà
   kiểu cũ mở ở cùng điểm đó.
2. **Cho** người chơi ở kiểu cũ, **khi** không bật kiểu sau lưng, **thì** mọi thứ chạy y như trước.
3. **Cho** tệp trang của hai game, **khi** so với trước tính năng, **thì** khối mã trong trang không đổi một ký tự.

---

### Câu chuyện 6 – Bật Nghiệp 3D: văn phòng đội kiểu sau lưng (Ưu tiên: P6, HOÃN)

Trong văn phòng Bật Nghiệp 3D, người chơi là đúng nhân vật của vai mình (CEO, CFO, CMO, COO, Thư ký), đi tới bàn của
từng bộ phận theo kiểu sau lưng; Lumina và thầy Tu Phan đứng trong cảnh để hỏi ý kiến. **Hoãn tới khi có giấy chứng
nhận quyền tác giả**, cùng lý do với câu chuyện 5.

**Vì sao P6**: là game lớn nhất và thuộc hồ sơ; làm sau cùng khi phần dùng chung đã chín qua các câu chuyện trước.

**Kiểm độc lập**: vào vai CFO, đi tới bàn tài chính, bấm «Vào» → mở đúng bảng núm tài chính như hiện nay.

**Kịch bản chấp nhận**:

1. **Cho** người chơi đã chọn vai, **khi** vào văn phòng kiểu sau lưng, **thì** nhân vật điều khiển là mô hình của
   đúng vai đó.
2. **Cho** cùng một bộ quyết định, **khi** chơi kiểu sau lưng hay kiểu cũ, **thì** kết quả vòng giống hệt.
3. **Cho** tệp `BizOn Game 3D.html`, **khi** so với trước tính năng, **thì** khối mã trong trang không đổi.

---

### Trường hợp biên

- Trình duyệt không có WebGL, hoặc mô hình tải lỗi, hoặc mất mạng khi chưa lưu sẵn: quay về kiểu hiện tại (tranh dựng
  đứng, nhìn từ trên) kèm một dòng báo; vẫn vào được game.
- Máy yếu hoặc người dùng bật «giảm chuyển động»: máy quay không lắc, không tự xoay, xuồng không bập bềnh; có lối
  tắt «Đi tới…».
- Điện thoại xoay ngang, hoặc màn 360 px: cần điều khiển, bản đồ nhỏ, thẻ «Vào» không che nhau, không tràn ngang.
- Nhân vật đi sát tường, góc nhà: không đi xuyên; máy quay không chui vào trong tường.
- Hai địa điểm gần nhau: chỉ hiện thẻ của điểm gần hơn.
- Đang ở trên xuồng thì tải lại trang: mở lại ở trên bờ tại điểm xuất phát, không kẹt giữa sông.
- Xuồng bị kẹt giữa các ghe: lối tắt «Đi tới…» luôn đưa ra được.
- Chỉ dùng bàn phím hoặc trình đọc màn hình: danh sách «Đi tới…» dùng được bằng Tab và Enter, có nhãn đọc được.
- Mặt nhân vật nhòe khi máy quay lại gần (lý do của PR #1024): máy quay giữ ở sau lưng; tên nhân vật hiện bằng chữ
  rõ nét phía trên đầu thay cho bảng tên vẽ trên mô hình.
- Đang đi thì có cuộc gọi hay chuyển thẻ trình duyệt: quay lại nhân vật đứng yên tại chỗ, không tự chạy.

## Yêu cầu *(bắt buộc)*

### Yêu cầu chức năng

- **FR-001**: Người chơi PHẢI điều khiển được một nhân vật 3D đi bộ bằng cần điều khiển trên màn cảm ứng và bằng WASD
  hoặc phím mũi tên trên bàn phím.
- **FR-002**: Máy quay PHẢI ở sau lưng nhân vật và đi theo hướng nhân vật đang đi; không chui vào tường, không lắc
  khi người dùng bật «giảm chuyển động».
- **FR-003**: Nhân vật PHẢI có động tác đi khi di chuyển và động tác đứng khi dừng, quay mặt theo hướng đi.
- **FR-004**: Khi nhân vật vào trong tầm một địa điểm, hệ thống PHẢI hiện thẻ có tên địa điểm, mô tả ngắn và nút
  «Vào»; ra khỏi tầm thì ẩn; nhiều điểm trong tầm thì chỉ hiện điểm gần nhất.
- **FR-005**: Nút «Vào» (và phím E / Enter) PHẢI mở đúng hoạt động mà cách hiện tại mở ở cùng địa điểm đó.
- **FR-006**: Mỗi cảnh kiểu sau lưng PHẢI có lối tắt «Đi tới…» liệt kê mọi địa điểm, dùng được bằng chạm, bàn phím và
  trình đọc màn hình. Đi bộ không bao giờ là cách duy nhất.
- **FR-007**: Nhân vật PHẢI là 7 mô hình sẵn có dựng từ tranh gốc của BizOn; không dựng nhân vật mới. Người chơi
  chọn trong 5 vai đội (CEO, CFO, CMO, COO, Thư ký); Lumina và thầy Tu Phan là cố vấn đứng trong cảnh.
- **FR-008**: Tên nhân vật PHẢI hiện bằng chữ rõ nét, không dựa vào bảng tên vẽ trên mô hình.
- **FR-009**: Cảnh kiểu sau lưng PHẢI có bản đồ nhỏ cho thấy vị trí người chơi và các địa điểm; bấm một địa điểm thì có
  chỉ đường.
- **FR-010**: Ở Bến BizOn PHẢI có nhân vật BizOn khác đi lại theo lối định sẵn và chào khi người chơi tới gần; không
  cần mạng. Lời chào chỉ gợi hướng, không chọn giúp, không đưa đáp án; không gọi các nhân vật này là AI.
- **FR-011**: Kiểu sau lưng KHÔNG ĐƯỢC đổi luật chơi, điểm số, dữ liệu lưu hay dữ liệu gửi lên lớp của bất kỳ game nào.
- **FR-012**: Khi không dùng được 3D (không có WebGL, mô hình lỗi, mất mạng chưa lưu sẵn), hệ thống PHẢI quay về cách
  di chuyển hiện tại và báo một dòng; người chơi vẫn làm được mọi việc.
- **FR-013**: Cảnh kiểu sau lưng PHẢI dùng được trên điện thoại 360–390 px: toàn màn hình, không tràn ngang, vùng chạm
  ≥ 44 px, chữ tương phản ≥ 4,5, song ngữ VI/EN.
- **FR-014**: Có trạng thái đang tải (tên nhân vật đang tải), lỗi và mất mạng; sau lần đầu, cảnh dùng được ngoại tuyến.
- **FR-015**: Lượt này KHÔNG ĐƯỢC chạm vào ba game thuộc hồ sơ quyền tác giả: không sửa tệp trang, không sửa các
  tệp mã mà chỉ ba game ấy dùng, và ba trang ấy không nạp phần di chuyển mới.
- **FR-016**: Không thu thập thêm dữ liệu người học; vị trí nhân vật chỉ nằm trong trình duyệt của người chơi.
- **FR-018**: Tại bến xuồng PHẢI có thẻ «Xuống xuồng»; trên xuồng, cùng cần điều khiển và phím đi bộ PHẢI lái được
  xuồng: quay mũi từ từ, có đà, mái chèo khua; xuồng không lên bờ, không đi xuyên vật cản; về bến có thẻ «Lên bờ».
- **FR-019**: Điểm trên nước PHẢI hiện thẻ «Vào» khi xuồng tới gần và PHẢI tới được bằng lối tắt «Đi tới…» mà không
  cần tự chèo. Nhân vật đi bộ KHÔNG ĐƯỢC rơi xuống nước.
- **FR-020**: Phần di chuyển dùng chung KHÔNG mang theo bối cảnh nào. Mỗi nơi dùng bối cảnh, nhân vật và phương tiện
  của chính nó: Bến BizOn là bến sông miền Tây (không phải phố xá), Hộ Chiếu Sầu Riêng 3D giữ vườn và 8 chặng.
- **FR-017**: Nhãn chính sách trên thẻ «Vào» PHẢI đúng trang Chính sách: Bến Phù Sa và Arcade «miễn phí»; Bật Nghiệp
  và Hộ Chiếu Thương Hiệu «dùng thử».

### Thực thể chính

- **Nhân vật người chơi**: một trong các mô hình có xương; có vị trí, hướng nhìn, trạng thái đứng hay đi.
- **Địa điểm**: một chỗ trong cảnh có tên (VI/EN), mô tả ngắn, biểu tượng, tầm kích hoạt và hoạt động mở ra khi «Vào».
- **Cảnh**: mặt bằng đi được, chỗ không đi được, danh sách địa điểm và điểm xuất phát; mỗi game có cảnh riêng.
- **Người qua lại**: nhân vật không do người chơi điều khiển, có lối đi và một vài câu chào.
- **Xuồng**: phương tiện trên nước của người chơi; có vị trí, hướng mũi, vận tốc; chỉ ở trên vùng nước.
- **Bến xuồng**: điểm nối bờ và nước, nơi xuống xuồng và lên bờ.

## Tiêu chí thành công *(bắt buộc)*

### Kết quả đo được

- **SC-001**: Trên điện thoại 390 px, từ lúc mở Bến BizOn tới lúc mở được một game bằng cách đi bộ: dưới 30 giây với
  người dùng lần đầu, không cần đọc hướng dẫn dài hơn một dòng.
- **SC-002**: Cảnh 3D chiếm ≥ 90% chiều cao màn hình điện thoại (hiện nay 218 px trên 839 px, tức 26%).
- **SC-003**: Ở 360 px và 390 px: 0 px tràn ngang; cần điều khiển, bản đồ nhỏ và thẻ «Vào» không chồng lên nhau;
  mọi nút ≥ 44 px.
- **SC-004**: Nhân vật đầu tiên hiện ra trong 5 giây trên mạng 4G thông thường; lần mở sau dùng được khi mất mạng.
- **SC-005**: Chuyển động mượt trên điện thoại tầm trung: không dưới 30 khung hình mỗi giây khi đi bộ.
- **SC-006**: Với cùng bộ quyết định, kết quả ván chơi Hộ Chiếu Sầu Riêng 3D khi đi bộ và khi dùng lối tắt giống
  nhau 100% (so bằng test).
- **SC-007**: 100% địa điểm của mỗi cảnh tới được bằng lối tắt «Đi tới…» chỉ với bàn phím.
- **SC-008**: Ba trang game thuộc hồ sơ và các tệp mã riêng của chúng: 0 thay đổi trong lượt này; 0 trang trong ba
  trang ấy nạp phần di chuyển mới (kiểm bằng test).
- **SC-010**: Trên điện thoại 390 px, người dùng lần đầu xuống xuồng và tới được một điểm trên nước trong dưới 40
  giây; trong test, xuồng không bao giờ nằm trên đất và nhân vật đi bộ không bao giờ nằm trên nước.
- **SC-009** (theo dõi sau khi dùng trên lớp, không chặn PR): thời gian từ lúc vào game tới quyết định đầu tiên không
  tăng quá 20% so với kiểu cũ, theo báo cáo chơi thử.

## Chuẩn đầu ra liên quan

Kiểu sau lưng là phần **định hướng và tạo hứng thú**, không trực tiếp dạy một chuẩn đầu ra nào. Nó phục vụ gián tiếp
**CLO-E (hợp tác C-Suite, 5 vai)** ở Bật Nghiệp: người chơi mang đúng nhân vật của vai mình và phải tự đi tới bàn của
bộ phận khác để hỏi. Vì không dạy trực tiếp, đặc tả đặt ràng buộc ngược: không được làm chậm đường tới quyết định
(SC-009) và không được đổi luật hay điểm (FR-011, SC-006).

## Giả định

- «Tất cả game 3D» gồm: Bật Nghiệp 3D, Bến Phù Sa 3D, Hộ Chiếu Thương Hiệu 3D, Hộ Chiếu Sầu Riêng 3D, cộng Sảnh 3D
  làm «Bến BizOn» (lối vào chung). Ba game đầu hoãn tới khi có giấy chứng nhận; **lượt này làm Bến BizOn và Hộ Chiếu
  Sầu Riêng 3D**. **Ngoài phạm vi lượt này**: Ra Khơi Cùng Lớp 3D (đi thuyền, không đi bộ) và bốn
  trang thử (Phố Thị Trường 3D, Hộ Chiếu Mini 3D, Xưởng Gốm 3D, Bàn Họp Chiến Lược 3D).
- Phần đi trên bản đồ lớn của từng game (ghe trên sông ở Bến Phù Sa 3D, quả địa cầu và phố thị trường ở Hộ Chiếu
  Thương Hiệu 3D) giữ nguyên; kiểu sau lưng chỉ áp vào phần «văn phòng» có đi bộ.
- Bến BizOn vẫn là trang thử (không vào sitemap, không thêm vào menu) cho tới khi chị xem và cho công khai.
- Ở Hộ Chiếu Sầu Riêng 3D, người chơi **giữ nhân vật nông dân đội nón lá** hiện có của game (đã là hình 3D có lưng,
  hợp bối cảnh vườn sầu riêng); 5 mô hình vai đội dùng ở Bến BizOn. Sầu Riêng 3D không có xuồng. Chị muốn đổi thì nói khi duyệt.
- Mô hình bật riêng cho cảnh kiểu sau lưng; mặc định của Bật Nghiệp 3D theo PR #1024 (tranh gốc) không đổi.
- vspeak chỉ là mẫu tham khảo về **cách tương tác** (đi bộ, máy quay sau lưng, thẻ «Vào»); không chép mã, hình, nhân
  vật hay bản đồ của họ. Bối cảnh là bến sông miền Tây bằng phong cách đất sét và tài sản của BizOn, không phải phố xá.
- Không cần bảng hay hàm mới trên Supabase.
- Chưa làm thời tiết (mưa, chạy tới chỗ trú) trong lượt này.
- Mô hình nhân vật chỉ có ba động tác đứng, nói, đi, **không có động tác chèo**: trên xuồng nhân vật đứng (kiểu chèo
  đứng miền Tây), mái chèo tự khua; tay nhân vật chưa cử động theo mái chèo.
- Xuồng dùng mô hình xuồng, ghe đã có trong kho (bộ Kenney, giấy phép CC0, đã ghi nguồn), tô lại màu đất sét.
- Ra Khơi Cùng Lớp 3D có thể là một điểm trên nước của Bến BizOn (chỉ là lối vào; trang Ra Khơi không đổi).
