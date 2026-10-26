# Từ điển biến — gói dữ liệu nghiên cứu BizOn (rp-v1, 27/10/2026)

Gói xuất từ Trang Giảng viên (thẻ Hành trình → «📦 Gói dữ liệu nghiên cứu (ZIP)»), mã `js/core/research-pack.js`. Mọi tệp đều ẩn danh; `dictionary.csv` trong gói là bản rút gọn của trang này.

## Khoá ghép
| Khoá | Cách tạo | Có ở |
|---|---|---|
| `student_key` | FNV-1a(email trường, chữ thường), 8 ký tự hex | participants, passports, decisions (t1, t3), case_tasks, CSV điểm rubric (qua CSV bài tình huống) |
| `team_key` | FNV-1a(mã lớp | tên đội, chữ thường) | participants, teams, rounds, decisions (t2), passports, case_tasks |
| `journey_hash` | FNV-1a(journey_id) | participants, teams, rounds, decisions, passports, case_tasks, CSV ẩn danh trang Hành trình |
| `student_code` | sinh viên tự đặt trên phiếu khảo sát | surveys (không ghép được với student_key) |

## participants.csv — một dòng mỗi sinh viên có hộ chiếu hoặc bài tình huống
| Biến | Kiểu | Mô tả |
|---|---|---|
| `class` | text | mã lớp |
| `explain_condition` | hidden/shown | điều kiện R1 lúc nộp; ưu tiên từ bài tình huống, rồi hộ chiếu |
| `case_pre`, `case_post` | 0/1 | đã nộp bài tình huống trước/sau |
| `has_passport`, `t1_done`, `t2_done`, `t3_done` | 0/1 | hộ chiếu và các bậc đã xong |

## teams.csv — một dòng mỗi đội Bật Nghiệp
`n_rounds`, `last_round` (int); `carry_applied` (0/1, có vòng áp hành trang); `explain_condition`; `t2_uppsala_adherence`, `t2_leap_share` (0–1, xem MA-HOA-DAU-VET.md §3, §5).

## rounds.csv — một dòng mỗi vòng Bật Nghiệp
| Nhóm | Biến | Đơn vị / ghi chú |
|---|---|---|
| Kết quả | `share` (%), `net_profit`, `revenue`, `balance` (triệu ₫), `sold`, `lost_sales`, `inventory` (sản phẩm), `oee` (%), `defect` (%), `quick_ratio`, `brand_loyalty`, `roi` | từ engine `js/engine.js` |
| Thành tích | `ach` (số thành tựu), `win` (cắm cờ 0/1), `difficulty` | |
| Điều kiện | `explain` (hidden/shown), `journey_hash`, `carry_applied` | |
| Quyết định | `price` (nghìn ₫), `marketing`, `rd`, `training` (triệu ₫), `production` (sp), `workers`, `payment_term` (30/60/90), `funding` (equity/loan), `what_if` (0/1/rỗng) | `result_json.decisions` |
| Mã dấu vết | `code`, `logic`, `uppsala_ok`, `d_production` | dc-v1 |

## decisions.csv — một dòng mỗi quyết định được mã hoá
`tier` (t1/t2/t3), `seq` (tuần/vòng/lần vào), `code`, `logic`, `uppsala_ok`, `detail` (JSON các trường thô: t1 `m, menu, loc, net, known_before`; t2 `production, d_production, prev_lost_sales, what_if, loan`; t3 `market, near, when`). Dòng t2 không có `student_key` (mức đội).

## passports.csv — một dòng mỗi hộ chiếu đã đồng bộ
| Nhóm | Biến |
|---|---|
| Chung | `updated_at`, `app_version`, `carry_enabled` |
| Bậc 1 | `t1_done`, `t1_eff` (0–100), `t1_rank` (1–4), `t1_total` (doanh thu), `t1_explore_weeks`, `t1_exploit_weeks`, `t1_survey_weeks`, `t1_explain` |
| Bậc 2 | `t2_done`, `t2_balance_end`, `t2_net_profit_total`, `t2_share_end`, `t2_profitable_rounds`, `t2_what_if_rounds`, `t2_rd_cumulative`, `t2_loan_end`, `t2_case` (A/B/C), `t2_explain` |
| Bậc 3 | `t3_done`, `t3_variant` (brand/durian), `t3_total`, `t3_cash_end`, `t3_rep_end`, `t3_markets_entered`, `t3_role` (durian), `t3_explain` |
| Chỉ số hộ chiếu | `effectuation_index` (tuần thử/khảo sát ÷ 5), `causation_index` (vòng dùng Nếu – Thì ÷ 6), `intl_pattern` (near-first/leapfrog/mixed/none) — `js/core/journey.js` |
| Chỉ số mã hoá | `t1_uppsala_adherence`, `t1_effectual_share`, `t1_leap_share`, `t2_uppsala_adherence`, `t3_uppsala_adherence`, `journey_uppsala_adherence` |

## case_tasks.csv — một dòng mỗi câu trả lời bài tình huống
Cùng cột với CSV bài tình huống của Trang Giảng viên (thêm `team_key`): `phase`, `form`, `item`, `mech`, `choice`, `expected`, `aligned`, `logic`, `why` (lý do hoặc câu giải thích), `duration_s`, `explain_condition`, `journey_hash`, `submitted_at`, `answers_version`. Điểm rubric nằm ở CSV của `cham-tinh-huong.html`, ghép qua `student_key + phase + form + item`.

## surveys.csv — một dòng mỗi phiếu khảo sát
`instrument` (bộ câu hỏi), `phase`, `student_code`, `role`, `rounds_played`, `score_a` (0–15), `out_<chuẩn>` (điểm theo chuẩn đầu ra), `b_1…b_8` (tự tin, Likert 1–5), `c_1…c_5` (trải nghiệm, phiếu sau), `nps` (0–10), `created_at`; `open_like`, `open_improve` chỉ khi xuất với `includeOpenText`.

## Quy ước
Ô rỗng = không có dữ liệu. Số thập phân dùng dấu chấm. Mã hoá UTF-8 có BOM? Không: ZIP chứa UTF-8 không BOM; mở bằng R/Python/Excel (Data → From Text, UTF-8).
