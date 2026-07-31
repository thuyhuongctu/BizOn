# Kiểm thử tự động

Hiện có một bộ: `brand-passport.test.js` — cho game «Hộ Chiếu Thương Hiệu».

## Vì sao có thư mục này

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

## Còn thiếu

Bộ này mới phủ «Hộ Chiếu Thương Hiệu». Game mô phỏng chính (`js/engine.js`)
chưa có kiểm thử — đó là phần đáng làm tiếp, vì nó mới là thứ dùng để chấm
điểm sinh viên.
