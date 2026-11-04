---
name: balance-check
description: "Kiểm tra cân bằng một game BizOn: giá trị lệch, chiến lược áp đảo (một lựa chọn luôn thắng), dòng tiền vô hạn, đường tiến độ gãy. Dùng khi chị hỏi «game có cân bằng không», «sao đội nào cũng chọn X», hoặc trước khi đổi tham số engine."
argument-hint: "[bat-nghiep|ben-phu-sa|hcth|sau-rieng|fdi|ra-khoi|đường-dẫn-tệp]"
user-invocable: true
---

<!-- Phỏng theo skill balance-check của «Claude Code Game Studios» (Donchitos, giấy phép MIT – xem THIRD-PARTY-NOTICES.md mục 6),
     Việt hóa và chỉnh cho game web tĩnh của BizOn (không Unity/Godot, không design/registry). -->

# Kiểm tra cân bằng game

Trả lời bằng tiếng Việt, xưng «em», gọi chị. Chỉ đọc và phân tích; **không sửa tham số** khi chị chưa đồng ý.

## 0. Thiếu dữ liệu thì nói «chưa đánh giá được»

Liệt kê các nguồn cần đọc và ghi `CÓ` / `KHÔNG CÓ` cho từng nguồn. Mục nào thiếu nguồn thì ghi
**`CHƯA ĐÁNH GIÁ — THIẾU DỮ LIỆU`**, kèm tên tệp còn thiếu. Không ước lượng, không suy từ tệp bên cạnh.
Một bản báo cáo «ổn» trên dữ liệu rỗng là báo cáo sai.

## 1. Xác định game và miền cân bằng

| Đối số | Engine / dữ liệu | Tài liệu ý đồ thiết kế |
|---|---|---|
| `bat-nghiep` | `js/engine.js`, `js/bizon-grading.js`, `js/market-dynamic.js` | `docs/chuc-nang-game-bat-nghiep.md`, `docs/cham-diem-bat-nghiep.md` |
| `ben-phu-sa` | khối `<script>` chính của `ben-phu-sa-3d.html` (D, W, MENUS, LOCS, RIVALS, BOAT_COST), `js/bps-*.js` | phần «Luật chơi chi tiết» trong trang, `docs/chuan-dau-ra-va-rubric.md` |
| `hcth` (Hộ Chiếu Thương Hiệu) | `js/bp-core.js` | `docs/cham-diem-ho-chieu-thuong-hieu.md`, `docs/huong-dan-choi-ho-chieu-thuong-hieu.md` |
| `sau-rieng` | `lab/ho-chieu-sau-rieng-engine.js`, `-data.js`, `-core.js` (dùng chung 2D, v2, 3D) | `docs/huong-dan-ho-chieu-sau-rieng.md`, bảng tham số trên `truong-hoc-thuat.html` |
| `fdi` | `lab/nha-may-fdi-engine.js`, `lab/nha-may-fdi-data.js` | `docs/fdi-lab/` |
| đường dẫn tệp | đọc thẳng tệp đó, suy ra miền từ nội dung | tìm tài liệu cùng tên trong `docs/` |

Không có đối số thì hỏi chị kiểm game nào. Miền cần xét (một game có thể có nhiều miền):
- **Kinh tế:** nguồn tiền vào (doanh thu, trợ cấp, thưởng nhiệm vụ) và tiền ra (chi phí, phí ghe, lãi vay, vật phẩm); tích lũy theo vòng/tuần/vụ; vòng lặp tiền vô hạn; vật phẩm không bao giờ đáng mua.
- **Lựa chọn chiến lược:** có phương án nào **luôn tốt hơn** mọi phương án khác (áp đảo) không; có phương án nào **không bao giờ** đáng chọn không. Ví dụ: ghe hàng bông từ tuần 1 có luôn thắng không, khảo sát chợ có bao giờ đáng không.
- **Tiến độ và độ khó:** điểm/lợi nhuận theo vòng có đoạn chết (vài vòng không đổi gì) hay nhảy vọt; đối thủ theo kịch bản có quá dễ hoặc quá khó so với người chơi trung bình.
- **Ngẫu nhiên:** biên độ may rủi có lấn át quyết định không (cùng một chiến lược, kết quả chênh bao nhiêu giữa các hạt giống).

## 2. Đọc dữ liệu và ý đồ thiết kế

Ghi lại mọi tệp đã đọc (cho mục «Nguồn dữ liệu»). Lấy **giá trị mục tiêu** từ tài liệu thiết kế, rubric hoặc chú thích trong mã
(ví dụ «chiến lược tham chiếu: dò 1 tuần bằng gánh rồi chạy ghe 4 tuần»). Giá trị không có mục tiêu ở đâu cả thì ghi
`chưa có ngưỡng — không phán xét`, không tự đặt ngưỡng.

## 3. Phân tích bằng mô phỏng thật, không bằng cảm giác

- Ưu tiên **chạy engine** bằng Node (nạp tệp engine trong `vm` như các test sẵn có, ví dụ `test/journey-balance.test.js`) và mô phỏng
  vài trăm ván với các chiến lược điển hình: tham lam, thận trọng, ngẫu nhiên, chiến lược tham chiếu của tài liệu.
- So **trung bình, trung vị, khoảng 10–90%** của điểm/lợi nhuận giữa các chiến lược. Chiến lược đơn giản mà thắng chiến lược tham chiếu → nghi áp đảo.
- Thử **giá trị biên** của mọi công thức (đầu vào nhỏ nhất, lớn nhất): kết quả âm vô lý, chia cho 0, vô cực, NaN.
- Ván chơi lớp học có seed cố định thì kiểm cả seed lớp (mọi đội cùng đề) lẫn seed ngẫu nhiên.
- Script mô phỏng tạm đặt trong thư mục scratchpad, **không** commit trừ khi chị muốn biến nó thành test.

## 4. Báo cáo

```
## Kiểm tra cân bằng: [Tên game] – [miền]

### Nguồn dữ liệu đã đọc
- [tệp …]

### Tình trạng chung: [CHƯA ĐÁNH GIÁ / ỔN / CẦN CHỈNH / NGHIÊM TRỌNG]

### Giá trị lệch
| Tham số | Ngưỡng mong muốn (nguồn) | Thực tế | Vấn đề |

### Chiến lược áp đảo / vô dụng
- [mô tả, số liệu mô phỏng, vì sao hỏng bài học]

### Tiến độ theo vòng
[bảng trung bình theo vòng cho từng chiến lược]

### Đề xuất
| Ưu tiên | Vấn đề | Cách chỉnh (tham số, giá trị cũ → mới) | Ảnh hưởng tới bài học |
```

Chọn **Tình trạng chung** theo phát hiện nặng nhất:
- **NGHIÊM TRỌNG:** có chiến lược áp đảo, vòng lặp tiền không có lối ra, hoặc ván không thể hoàn thành/thắng.
- **CẦN CHỈNH:** giá trị lệch hay đường tiến độ chỉnh bằng tham số được.
- **CHƯA ĐÁNH GIÁ:** thiếu dữ liệu hoặc thiếu ngưỡng; nói rõ thiếu gì.
- **ỔN:** mọi giá trị có ngưỡng và nằm trong ngưỡng, không chiến lược áp đảo.

Mỗi đề xuất phải nói **bài học nào được giữ hay bị hỏng**: BizOn là game dạy học, cân bằng phục vụ chuẩn đầu ra
(`docs/chuan-dau-ra-va-rubric.md`), không chỉ phục vụ độ vui.

## 5. Sau báo cáo

Hỏi chị: (A) em sửa vấn đề ưu tiên cao nhất ngay; (B) lưu báo cáo vào `docs/can-bang/can-bang-[game]-[YYYY-MM-DD].md`; (C) dừng để chị đọc.
Nếu sửa: một nhánh riêng, PR nháp, có test giữ giá trị mới, tăng `CACHE` trong `sw.js`; game Sầu Riêng thì kiểm cả bản 2D, v2 và 3D;
tham số có trên bảng tham số trang Học thuật thì cập nhật luôn bảng đó. Sau khi sửa, chạy lại `/balance-check` để chắc không sinh lệch mới.
