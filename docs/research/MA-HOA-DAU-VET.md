# Sơ đồ mã hoá dấu vết quyết định (dc-v1, 27/10/2026)

Mã nguồn: `js/core/decision-codes.js` (hàm thuần, có test). Mục đích: biến dữ liệu hành vi trong ba game thành biến **logic ra quyết định** và **mức tuân thủ logic Uppsala** để phân tích bên cạnh bài tình huống (R2) và rubric (R3). Dữ liệu hành vi khách quan hơn tự báo cáo; sơ đồ này là một cách thao tác hoá, cần nêu rõ trong bài viết.

## 1 · Nhãn chung cho mọi quyết định
| Trường | Giá trị | Nghĩa |
|---|---|---|
| `logic` | `effectual` | thử nhỏ với phương tiện sẵn có, học qua phản hồi (Sarasvathy 2001) |
| | `causal` | thu thập thông tin/dự báo trước, cam kết theo tri thức hoặc tín hiệu |
| | `leap` | tăng cam kết khi chưa có tri thức/tín hiệu |
| | `adaptive` | giữ hoặc co lại theo tình hình (không phải cam kết mới) |
| | `start` | quyết định đầu tiên, chưa có mốc so sánh |
| `uppsala_ok` | 1 / 0 / rỗng | 1 = cam kết đi **sau** tri thức/tín hiệu, hoặc là bước học; 0 = cam kết đi **trước**; rỗng = không áp dụng |

## 2 · Bậc 1 · Bến Phù Sa (`tiers.t1.weeks[{w, m, menu, loc, net}]`)
| `m` | Hành vi | `code` | `logic` | `uppsala_ok` |
|---|---|---|---|---|
| 1 | gánh hàng rong (thử nghiệm nhỏ) | `explore` | effectual | 1 |
| 2 | khảo sát chợ (mua thông tin) | `survey` | causal | 1 |
| 0 | ghe hàng bông (nhân rộng) trên cặp (menu, địa điểm) đã thử hoặc khảo sát ở tuần trước | `exploit-known` | causal | 1 |
| 0 | ghe hàng bông trên cặp chưa biết | `exploit-unknown` | leap | 0 |

`known_before` = cặp đã biết trước tuần đó (tái dựng từ thứ tự tuần; xấp xỉ `knownPairs` của game).

## 3 · Bậc 2 · Bật Nghiệp (bài nộp từng vòng, `result_json`)
So **sản lượng** (`decisions.production`) với vòng trước; `d_production` = tỉ lệ thay đổi. Tín hiệu cầu = vòng trước có đơn hụt (`lostSales > 0`).
| Điều kiện | `code` | `logic` | `uppsala_ok` |
|---|---|---|---|
| vòng 1 | `start` | start | rỗng |
| tăng ≥ 15 % và có tín hiệu cầu | `expand-informed` | causal | 1 |
| tăng ≥ 15 % và không có tín hiệu | `expand-uninformed` | leap | 0 |
| giảm ≥ 15 % | `contract` | adaptive | 1 |
| còn lại | `hold` | adaptive | 1 |

Cờ kèm: `what_if` (dùng mô phỏng Nếu – Thì trong vòng, chỉ có khi engine ghi), `loan` (nguồn vốn vay). Ngưỡng 15 % là tham số `EXPAND`; nêu phân tích độ nhạy với 10 % và 20 % trong bài.

## 4 · Bậc 3 · Hộ Chiếu (thứ tự vào thị trường)
Thị trường **gần** (khoảng cách tâm lý/địa lý thấp): Hộ Chiếu Thương Hiệu chỉ số `[5, 2]` (trùng hai thị trường được hành trang mạng lưới, `PARAMS.T2_NET_MARKETS`); Sầu Riêng kênh `DOM`, `BORDER`.
| Lần vào | `code` | `logic` | `uppsala_ok` |
|---|---|---|---|
| thị trường gần khi chưa vào thị trường xa nào | `near-first` | causal | 1 |
| thị trường xa sau khi đã có ≥ 1 thị trường gần | `sequential` | causal | 1 |
| thị trường xa khi chưa có thị trường gần | `leapfrog` | leap | 0 |
| thị trường gần sau khi đã nhảy cóc | `late-near` | causal | 1 |

Brand: `entered[i]` = quý vào thị trường i, sắp theo quý; Sầu Riêng: `channelOrder` theo thứ tự mở kênh. Phương thức thâm nhập (số, xuất khẩu trực tiếp, đối tác) chưa có trong dữ liệu nộp; nếu cần, thêm vào `p_detail_json` ở một PR sau.

## 5 · Chỉ số tổng hợp (`summarize`)
`uppsala_adherence` = số quyết định `uppsala_ok = 1` / số quyết định có mã (bỏ rỗng); `effectual_share`, `causal_share`, `leap_share`, `adaptive_share` = tỉ lệ nhãn trên tổng quyết định. Tính theo bậc (`t1_*`, `t2_*`, `t3_*`) và cả hành trình (`journey_uppsala_adherence`, gộp t1 + t2 của đội + t3).

## 6 · Giới hạn
- Bậc 2 mã hoá ở mức đội (bài nộp là của đội), bậc 1 và 3 ở mức hộ chiếu (cá nhân hoặc đội tuỳ cách lớp dùng).
- Ngưỡng và định nghĩa «gần» là lựa chọn của nhóm nghiên cứu; đổi = tăng `CODING_VERSION`.
- Sơ đồ chưa được kiểm định độc lập; khuyến nghị để hai người mã hoá tay một mẫu 30 quyết định và so với mã tự động (κ) trước khi dùng trong bài.
