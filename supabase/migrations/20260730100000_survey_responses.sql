-- ============================================================
-- BizOn Bật Nghiệp – Khảo sát trước–sau bản online (nghiên cứu giáo dục)
-- Sinh viên làm phiếu trên điện thoại tại khao-sat-online.html; kết quả
-- tự chấm Phần A và nộp về đây – hết cảnh nhập tay 40–60 phiếu giấy.
-- Ẩn danh: chỉ thu "mã tự đặt", không họ tên. Tệp tự áp dụng qua tích
-- hợp GitHub (hoặc dán vào SQL Editor → Run).
-- ============================================================

create table if not exists survey_responses (
  id uuid primary key default gen_random_uuid(),
  phase text not null check (phase in ('pre','post')),  -- phiếu trước / phiếu sau
  class_code text not null,              -- Mã lớp giảng viên phát
  student_code text not null,            -- Mã tự đặt ẩn danh (2 chữ + 2 số)
  role text,                             -- Vai trò trong đội (chỉ phiếu sau)
  rounds_played int,                     -- Số vòng đã chơi (chỉ phiếu sau)
  answers_a jsonb not null,              -- Đáp án 15 câu Phần A: {"1":"a",...}
  score_a int not null,                  -- Điểm Phần A (0–15, chấm tự động)
  score_by_outcome jsonb,                -- Điểm theo 5 chuẩn đầu ra (0–3 mỗi cụm)
  likert_b jsonb not null,               -- Tự tin: 8 mức 1–5
  likert_c jsonb,                        -- Trải nghiệm: 5 mức 1–5 (chỉ phiếu sau)
  nps int check (nps between 0 and 10), -- Điểm giới thiệu (chỉ phiếu sau)
  open_like text,                        -- Thích nhất điều gì (chỉ phiếu sau)
  open_improve text,                     -- Cần cải thiện gì (chỉ phiếu sau)
  client_ts timestamptz,                 -- Thời điểm trên máy sinh viên
  created_at timestamptz not null default now()
);

create index if not exists idx_sr_class_phase on survey_responses (class_code, phase, created_at);

-- RLS: sinh viên (anon) CHỈ ĐƯỢC NỘP – không đọc/sửa/xóa được phiếu nào.
alter table survey_responses enable row level security;

create policy "sinh vien chi duoc nop phieu"
  on survey_responses for insert to anon
  with check (true);

-- Giảng viên xuất dữ liệu qua trang giang-vien.html (kèm khóa) hoặc Table Editor.
create or replace function bizon_survey_export(p_class_code text, p_key text)
returns table (
  phase text,
  student_code text,
  role text,
  rounds_played int,
  score_a int,
  score_by_outcome jsonb,
  likert_b jsonb,
  likert_c jsonb,
  nps int,
  open_like text,
  open_improve text,
  created_at timestamptz
)
language sql security definer stable
set search_path = public
as $$
  select sr.phase, sr.student_code, sr.role, sr.rounds_played,
         sr.score_a, sr.score_by_outcome, sr.likert_b, sr.likert_c,
         sr.nps, sr.open_like, sr.open_improve, sr.created_at
  from survey_responses sr
  where bizon_check_key(p_key) and sr.class_code = p_class_code
  order by sr.student_code, sr.phase desc, sr.created_at;
$$;

-- Ghi chú vận hành:
--  • Một sinh viên nộp trùng (cùng phase + mã) → khi phân tích lấy dòng
--    created_at mới nhất của mỗi (class_code, student_code, phase).
--  • Ghép cặp trước–sau bằng student_code; Δ kiến thức = score_a(post) − score_a(pre).
