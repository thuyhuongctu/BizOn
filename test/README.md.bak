# Kiểm thử tự động

| Bộ | Đối tượng | Cần gì | Thời gian |
|---|---|---|---|
| `engine.test.js` | `js/engine.js` – engine game mô phỏng chính | chỉ Node | vài giây |
| `brand-passport.test.js` | game «Hộ Chiếu Thương Hiệu» | Node + Chromium + máy chủ tĩnh | vài phút |

```bash
node test/engine.test.js          # nhanh, chạy được mọi lúc
node test/brand-passport.test.js  # cần dựng máy chủ trước, xem mục dưới
```

---

## `engine.test.js` — engine game mô phỏng chính

Đây là engine dùng để **chấm điểm sinh viên**. Một sai số ở đây không chỉ làm
game khó chịu mà làm điểm số sai, và làm hỏng luôn tuyên bố *«engine xác định,
kết quả tái lập được»* trong hồ sơ học thuật. Vì vậy bộ này đặt nặng hai thứ:
tính tái lập và các đẳng thức kế toán.

`js/engine.js` không đụng tới DOM — không `document`, không `window`, không
`localStorage` — nên nạp thẳng vào Node qua `vm` được. Không cần trình duyệt,
không cần máy chủ, chạy xong trong vài giây.

23 phép thử, chia bốn nhóm:

| Nhóm | Nội dung |
|---|---|
| Xác định & tái lập | cùng hạt giống + cùng quyết định ⇒ cùng dãy kết quả; bộ sinh số phụ thuộc hoàn toàn vào hạt giống |
| Kế toán | số dư sau vòng = số dư trước + lợi nhuận ròng; doanh thu = số bán × giá; không bán quá hàng có; đơn mất = cầu − số bán |
| Luật kinh doanh | nhân sự giới hạn sản lượng; giá lên cầu xuống; marketing nhiều thị phần cao; thị phần và chỉ số vận hành luôn trong khoảng cho phép |
| Trạng thái & phần thưởng | khiên bảo hiểm che đúng một vòng; vay vốn và lãi; cắt giảm chi phí hết hiệu lực sau một vòng; nhiệm vụ chỉ nhận thưởng một lần; thành tựu không trùng lặp |

### Bộ này đã bắt được một lỗi ngay lần chạy đầu

`unlockAchievements()` được gọi **trước** dòng đặt `s.finished = true`, nên tại
thời điểm chấm thành tựu thì cờ kết thúc vẫn là `false`. Hai thành tựu
`A_FINISH` («Tốt nghiệp BizOn») và `A_CHAMP` («Vô địch BizOn») đều kiểm
`s.finished`, nên **engine tự nó không bao giờ mở được hai thành tựu này**.

Trong game thì người chơi vẫn nhận được — nhưng chỉ nhờ `js/app.js` gọi
`unlockAchievements` lần thứ hai bên trong `recordConquest()`, một hàm mà tên
gọi là về bản đồ chinh phục chứ không phải về thành tựu. Nghĩa là hành vi đúng
đang phụ thuộc vào một lần gọi tình cờ ở nơi khác.

Đã sửa: đặt cờ kết thúc trước khi chấm thành tựu, để engine tự đứng được.

---

## `brand-passport.test.js` — game «Hộ Chiếu Thương Hiệu»

Cuối tháng 7/2026, một đợt rà soát tìm ra bốn lỗi trong `brand-passport.html`
mà chơi tay rất khó bắt: mã còn sót logic **ba** thị trường của bản nháp cũ,
trong khi trò chơi đã có **sáu**. Hệ quả là người chơi đi Lục Đảo, Nhật Quang
hay Tân Cảng bị bỏ sót — chỉ số 📚 Tri thức không nhúc nhích, án phạt dữ liệu
không rơi vào họ, gợi ý «bay trong sương mù» hiện sai.

Cả bốn lỗi đều chỉ lộ ra ở ba thị trường ít ai chọn khi chơi thử. Đó chính là
loại lỗi mà kiểm thử tự động bắt được còn chơi tay ba mươi ván thì không.

## Chạy

Cần **Node 18+** và **Chromium qua Playwright**.

```bash
# 1. Cài playwright-core (chỉ phần điều khiển trình duyệt, không tải trình duyệt)
npm install playwright-core

# 2. Dựng máy chủ tĩnh ở thư mục gốc kho mã
python3 -m http.server 8899 --directory .

# 3. Chạy bộ kiểm thử ở một cửa sổ khác
node test/brand-passport.test.js
```

Kết quả in ra dạng:

```
✓ Ván chơi lặp lại được khi truyền ?seed= (1240ms)
✓ Bản đồ có đủ sáu thị trường, trạng thái khởi tạo đủ sáu ô (890ms)
...
10/10 phép thử đạt
```

Mã thoát khác 0 nếu có phép thử trượt, nên dùng được trong CI.

### Biến môi trường

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `BIZON_URL` | `http://127.0.0.1:8899` | Địa chỉ máy chủ tĩnh |
| `BIZON_CHROME` | đường dẫn Chromium của Playwright | Trình duyệt dùng để chạy |

Nếu Chromium nằm chỗ khác:

```bash
BIZON_CHROME=/usr/bin/chromium node test/brand-passport.test.js
```

## Bộ kiểm thử bao gồm

| Phép thử | Khoá lại điều gì |
|---|---|
| Ván chơi lặp lại được với `?seed=` | Nền tảng để mọi phép thử khác có kết quả ổn định |
| Bản đồ đủ sáu thị trường | `MKTS`, `S.know`, `S.entered`, `S.qin` đều dài 6 |
| Tri thức tính trên cả sáu thị trường | **Hồi quy** cho lỗi `hud()` cũ — thử lần lượt thị trường 0, 3, 4, 5 |
| Gợi ý «bay trong sương mù» | **Hồi quy** — điều kiện cũ chỉ đọc `know[0..2]` |
| Vào thị trường trừ đúng vốn | Ba phương thức: 0,5 · 1,2 · 0,8 tỷ, ghi đúng ô |
| Mỗi quý tối đa một thị trường | Luật cốt lõi của trò chơi |
| Tiền mặt không tự sinh | Mua tình báo trừ đúng tiền, giới hạn 2 nguồn/quý |
| Chấm điểm | Năm chiều trong 0–100, tổng đúng trọng số 30/20/20/15/15 |
| Thua sớm vì mất thanh toán | Bộ đếm `lowQ` không vượt 2, ván dừng đúng lúc |
| Ván bình thường kết thúc sau sáu quý | Vòng lặp chính không kẹt, màn kết hiện tổng điểm |
| Không lỗi JavaScript suốt một ván | Bắt lỗi phát sinh khi các nhánh hiếm gặp nhau |

## Ghi chú thiết kế

**`?seed=`** — trò chơi vốn đã dùng bộ sinh số giả ngẫu nhiên có hạt giống
(một `Math.random()` duy nhất để lấy hạt giống ban đầu). Nay hạt giống nhận
được từ địa chỉ, nên ván chơi lặp lại được.

Đây không chỉ là giàn giáo cho kiểm thử: **giảng viên có thể phát cùng một
đường dẫn kèm `?seed=` cho cả lớp**, khi đó mọi đội gặp đúng một bộ điều kiện
thị trường và việc so sánh kết quả giữa các đội mới công bằng.

**`window.bpTest`** — cửa sổ chỉ-đọc, trả về bản sao của trạng thái nên phép
thử không sửa được trạng thái thật. Không dòng nào của trò chơi phụ thuộc vào
nó; gỡ đi trò chơi vẫn chạy y nguyên.

## Ghi chú

Hai bộ hiện có phủ engine game chính và game «Hộ Chiếu Thương Hiệu». Phần
chưa có kiểm thử: lớp giao diện trong `js/app.js`, các mini-game trong
`games.html`, và luồng nộp bài về Supabase.
