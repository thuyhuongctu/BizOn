# 📖 Hướng dẫn Giảng viên / Người quản lý — BizOn Bật Nghiệp

> Tài liệu dành cho giảng viên và người quản lý lớp học sử dụng BizOn làm công cụ giảng dạy khởi nghiệp / quản trị kinh doanh.
> © 2026 Đỗ Thùy Hương & Phan Anh Tú — Đại học Cần Thơ.

---

## 1. Tổng quan trò chơi

- **BizOn Bật Nghiệp** là game mô phỏng kinh doanh: mỗi đội điều hành một công ty đồ chơi đất sét tại Việt Nam 2026, qua **6 vòng chơi** (mỗi vòng ≈ một quý kinh doanh).
- Mỗi vòng đội ra quyết định: **giá bán, marketing, R&D, sản lượng, nhân công, đào tạo, nguồn vốn (vốn chủ / vay), bảo trì** — sau đó thị trường mô phỏng phản ứng và sinh báo cáo.
- Chơi trên web hoặc cài như app (PWA): https://thuyhuongctu.github.io/BizOn/ — dữ liệu lưu cục bộ trên máy từng đội (localStorage), không cần máy chủ.

## 2. Tổ chức lớp học

| Bước | Việc cần làm |
|---|---|
| 1 | Phát **Class ID** thống nhất (VD: `QTKD-2026-A`) — các đội nhập khi đăng nhập |
| 2 | Mỗi đội 5 sinh viên ứng với 5 vai trò: **CEO · CFO · CMO · COO · SEC** (một máy/đội; người cầm máy chọn vai của mình, các vai còn lại thảo luận ngoài đời) |
| 3 | Đội mới có thể bấm **"👥 Chơi thử với Đội Demo"** để xem cấu trúc đội mẫu 5 nhân vật |
| 4 | Quy định thời gian mỗi vòng (khuyến nghị 8–12 phút thảo luận + chốt) |
| 5 | Dùng tab **🧑‍🏫 Giảng viên** trong game: khóa vòng chơi, cấp vốn thưởng, xem nhật ký cấp vốn |
| 6 | Cuối buổi: so sánh các đội bằng ảnh chụp tab **Xếp hạng**, **Bản đồ chinh phục** (số cờ 🚩) và **báo cáo P&L** |

**Chấm điểm gợi ý:** 40% lợi nhuận lũy kế · 30% số cờ chinh phục (thắng thị phần vòng) · 15% chất lượng thảo luận vai trò · 15% bài học rút ra (Nhật ký đội).

## 3. Ba đối thủ AI — hành vi chính xác

Mỗi vòng, 3 đối thủ AI tự quyết định **giá** và **marketing** quanh mức đặc trưng, nhân với hệ số dao động ngẫu nhiên **±12%** (jitter 0,9–1,15, tất định theo seed của đội — cùng một đội chơi lại sẽ ra đúng kết quả cũ, tiện đối chiếu):

| Đối thủ | Phong cách | Giá cơ sở | Marketing cơ sở | Ý nghĩa sư phạm |
|---|---|---|---|---|
| 🐺 **Alpha Dynamics** | Giá rẻ tốc chiến (aggressive) | ~125 nghìn ₫ | ~90 tr₫/vòng | Dạy về cạnh tranh giá & giữ biên lợi nhuận |
| 🐘 **Mekong Ventures** | Cân bằng (balanced) | ~150 nghìn ₫ | ~60 tr₫/vòng | Chuẩn so sánh "trung tính" của thị trường |
| 🦚 **Star Clay Co.** | Cao cấp (premium) | ~195 nghìn ₫ | ~75 tr₫/vòng | Dạy về định vị phân khúc & thương hiệu |

**Cách thị phần được tính:** sức hút của mỗi công ty = `(giá tham chiếu 150k / giá)^độ_co_giãn × (1 + √marketing_hiệu_quả/18) × thương_hiệu^trọng_số`. Thị phần = sức hút của công ty / tổng sức hút 4 công ty. Ở **vòng 6** (cột mốc thu nhập trung bình cao), trọng số thương hiệu tăng **×1,5** — đội đầu tư thương hiệu dài hạn bứt phá.

**Độ co giãn giá** thay đổi theo biến cố (Price War làm thị trường nhạy giá hơn — lợi cho Alpha; Cơ Hội Vàng tăng tổng cầu...).

## 4. Sáu vòng chơi = Hành trình chinh phục Việt Nam

Mỗi vòng gắn với một tỉnh/thành (bản đồ mới sau sáp nhập). **Đội thắng thị phần vòng đó** (≥ đối thủ AI cao nhất) cắm cờ 🚩; thua thì AI cắm cờ 🏴:

Vòng 1 **Cần Thơ** → 2 **TP. Hồ Chí Minh** → 3 **Khánh Hòa** → 4 **Đà Nẵng** → 5 **Thanh Hóa** → 6 **Hà Nội**

Bản đồ chinh phục hiển thị trên Trang chủ của mỗi đội — dùng làm bảng thành tích trực quan khi tổng kết.

## 5. Biến cố thị trường theo vòng

| Vòng | Biến cố | Tác động chính |
|---|---|---|
| 1 | Khởi động thị trường | Cơ bản |
| 2 | Cơ Hội Vàng | Tổng cầu tăng |
| 3 | Price War | Độ co giãn giá tăng — thị trường nhạy giá |
| 4 | Khủng hoảng năng lượng | Chi phí cố định & OEE bị ảnh hưởng (Pin Mặt Trời giảm nhẹ tác động) |
| 5 | Siết tín dụng | Lãi vay & thanh khoản căng |
| 6 | Việt Nam Hóa Rồng (cột mốc) | Cầu ×1,25 · thương hiệu ×1,5 · lương ×1,1 — vòng quyết định |

## 6. Công cụ hỗ trợ học tập trong game

- **Lumina AI** (Lumina Áo Dài / Lumina Vest Trắng): cố vấn theo vai trò, mô phỏng "Nếu — Thì" trước khi chốt, chúc mừng KPI và cảnh báo rủi ro theo đúng kịch bản sư phạm.
- **Sổ tay 📖**: luật chơi, vai trò, đối thủ AI, mẹo, xử lý sự cố — sinh viên tự tra cứu.
- **7 báo cáo chuẩn giáo trình**: P&L, dòng tiền 3 hoạt động, CVP hòa vốn, nhân sự, BMC, khấu hao, kiểm toán năng lượng.
- **BizOn Monitor** (tab Thị trường sống): sparkline chỉ số đội + 3 đối thủ theo vòng — dạy đọc dashboard.
- **IE Lab — Khởi nghiệp quốc tế** (trang BizOn GO GlObal): công cụ mô phỏng số liệu quan hệ quốc tế hóa – hiệu quả doanh nghiệp (chữ U ngược với điểm ngoặt minh họa ≈43% FSTS, kịch bản đảo nhỏ, "lá chắn số") — dùng cho học phần Khởi nghiệp/Kinh doanh quốc tế; toàn bộ là tham số mô phỏng giáo dục.

## 7. Xử lý sự cố thường gặp

- **Không thấy bản cập nhật mới:** đóng hẳn app/tab rồi mở lại (service worker đổi cache).
- **Muốn chơi lại từ đầu:** Cài đặt → ♻️ Chơi lại từ đầu (Reset) — xóa save cục bộ của đội.
- **Hai đội dùng chung một máy:** dữ liệu sẽ ghi đè nhau — mỗi đội một máy/trình duyệt riêng (hoặc hồ sơ trình duyệt riêng).
- **Cần "trọng tài":** hành vi AI tất định theo seed đội — kết quả tái lập được, không có yếu tố may rủi giữa các lần chơi lại cùng quyết định.

## 8. Liên hệ & mã nguồn

- Mã nguồn: https://github.com/thuyhuongctu/BizOn
- Trang giới thiệu: https://thuyhuongctu.github.io/BizOn/gioi-thieu.html
- Liên hệ hợp tác: thuyhuongctu@gmail.com
