# Prompt tạo lại ảnh nhân vật BizOn (để dựng mô hình 3D)

Cách dùng: mở công cụ tạo ảnh có nhận ảnh mẫu (Meshy «Image to Image», Gemini, ChatGPT…), **đính kèm tranh gốc của nhân vật**
(`assets/character/solid/<tên>-tex.webp`), dán prompt của hướng chị chọn, thay dòng `[NHÂN VẬT]` bằng dòng của nhân vật đó ở cuối tệp.
Tỉ lệ ảnh 3:4, đứng. Em đã chạy thử ba hướng này cho CEO bằng mô hình `nano-banana-pro` của Meshy.

Mọi hướng đều giữ bốn điều để dựng 3D và gắn xương cho đẹp:

1. Toàn thân, nhìn thẳng từ trước, đối xứng, **dáng chữ A** (hai tay duỗi thẳng, cách thân khoảng 35 độ).
2. **Tay trống**: bỏ đạo cụ (la bàn, túi tiền, loa…). Đạo cụ gắn riêng sau, nếu vẽ dính vào tay sẽ bị méo khi cử động.
3. **Không chữ, không bảng tên**: chữ vẽ trên mô hình luôn bị nhòe; tên nhân vật hiện bằng chữ của trang.
4. Nền xám nhạt phẳng, ánh sáng đều, không bóng đổ lên nền, cả người nằm gọn trong khung.

## Hướng A – Chibi đất sét (em đề xuất)

```
Redesign the character in the reference image as a cute chibi clay figurine for a 3D game.
Keep the same person and identity: [NHÂN VẬT].
Chibi proportions: about 3 heads tall, large round head, big expressive eyes, small simple nose, gentle closed-mouth smile,
short sturdy body and legs, slightly oversized hands and shoes. Handmade matte modelling-clay look with soft rounded forms
and clean solid colours, like a stop-motion claymation toy.
Full body, front view, standing straight and perfectly symmetrical in an A-pose: both arms straight and held about 35 degrees
away from the body, open relaxed hands with fingers together, empty hands, legs slightly apart, feet flat.
Remove any hand-held prop and remove the name badge: no props, no text, no logos.
Plain flat light grey background, soft even studio lighting, no cast shadow on the background, whole figure inside the frame
with a small margin, sharp focus, high detail on the face.
```

## Hướng B – Hoạt hình 3D kiểu phim

```
Redesign the character in the reference image as a stylised 3D animated-film character, appealing and expressive, for a 3D game.
Keep the same person and identity: [NHÂN VẬT].
Stylised proportions: about 4.5 heads tall, slightly large head, large warm eyes with clear eyebrows, soft simplified nose,
confident friendly smile, slim simplified body, clean smooth shapes with a subtle matte clay finish.
Clothing in smooth, even, solid colours close to the reference, without scratches, speckles, streaks or brush strokes.
Full body, front view, standing straight and perfectly symmetrical in an A-pose: both arms straight and held about 35 degrees
away from the body, open relaxed hands with fingers together, empty hands, legs slightly apart, feet flat.
Remove any hand-held prop and remove the name badge: no props, no text, no logos.
Plain flat light grey background, soft even studio lighting, no cast shadow on the background, whole figure inside the frame
with a small margin, sharp focus, high detail on the face.
```

## Hướng C – Tượng gốc, chỉ làm sạch

```
Redraw the clay figurine in the reference image as a clean character reference for 3D modelling.
Keep exactly the same character, proportions, sculpted clay style and colours: [NHÂN VẬT].
Only change the pose and clean it up: full body, front view, standing straight and perfectly symmetrical in an A-pose with both
arms straight and held about 35 degrees away from the body, open relaxed hands with fingers together, empty hands, legs slightly
apart, feet flat. Make the face crisp, with clearly defined eyes, eyebrows and smile.
Remove any hand-held prop and remove the name badge: no props, no text, no logos.
Plain flat light grey background, soft even studio lighting, no cast shadow on the background, whole figure inside the frame
with a small margin, sharp focus.
```

## Dòng `[NHÂN VẬT]` cho từng người

Em viết theo tranh gốc; chị sửa nếu em tả sai chi tiết nào.

| Nhân vật | Tranh gốc | Dòng thay vào `[NHÂN VẬT]` |
|---|---|---|
| CEO Minh Long | `ceo-tex.webp` | `same short brown hair, same friendly face, same navy blue suit, white shirt, dark tie and brown shoes` |
| CFO Thu Hà | `cfo-tex.webp` | `same woman with a blonde chin-length bob, same calm friendly face, same grey blazer and grey trousers, white top and black heels` |
| CMO Mạnh Chi | `cmo-tex.webp` | `same man with short brown hair and a cheerful open smile, same rust-orange jacket over a cream shirt, khaki trousers and brown shoes` |
| COO Bảo Ngọc | `coo-tex.webp` | `same woman with a brown chin-length bob, same gentle face, same light blue shirt, blue knee-length skirt and light blue heels` |
| Thư ký Gia Hân | `sec-tex.webp` | `same woman with dark skin and dark hair tied in a top bun, same warm face, same green shirt, green trousers and brown shoes` |
| Lumina | `lumina-tex.webp` | `same young woman with long wavy auburn-brown hair and a small white flower hairpin, same kind face, same cream-white Vietnamese ao dai with matching trousers and cream flat shoes, same tiny red pin with a yellow star on the chest` |
| Thầy Tu Phan | `tu-phan-tex-v3.webp` | `same man with short black hair, no glasses, same kind face with a wide friendly smile, same white knee-length men's Vietnamese ao dai with a small dark-red brooch on the chest, white trousers and brown leather shoes` |

## Ảnh đã vẽ (10/11/2026)

Bảy ảnh hướng B vẽ bằng prompt trên nằm ở `assets/models/nhan-vat/nguon/<tên>-huong-b-v2.webp` (CEO, CFO, CMO, COO, Thư ký, Lumina, thầy Tu Phan).
Bản `ceo-huong-b.webp` là ảnh thử đầu tiên, vân đất sét còn rõ nên lên 3D bị vệt trên áo; bản v2 đã thêm câu yêu cầu bề mặt áo trơn.

## Muốn chỉnh thêm

- Đầu to hơn nữa: đổi `about 3 heads tall` thành `about 2.5 heads tall`.
- Bớt «búp bê», người lớn hơn: đổi thành `about 3.5 heads tall`.
- Mắt nhỏ lại như tranh gốc: đổi `big expressive eyes` thành `small round dot eyes`.
- Thêm ảnh nhìn từ sau và từ bên (giúp Meshy dựng lưng đẹp hơn): thêm câu
  `Also show the same character from the back and from the left side, same pose, same scale, three separate images.`
