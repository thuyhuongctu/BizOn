-- ============================================================
-- BizOn Bật Nghiệp – Thêm «bộ câu hỏi» (instrument) cho khảo sát trước–sau
-- GĐ3: khao-sat-online.html giờ có 2 bộ: 'batnghiep' (game chính) và
-- 'quocte' (Hộ Chiếu Thương Hiệu – kinh doanh quốc tế). Cột mới giúp
-- phân tích Δ/Cohen's d tách bạch từng bộ, không trộn lẫn dữ liệu.
-- Tệp tự áp dụng qua tích hợp GitHub (hoặc dán vào SQL Editor → Run).
-- ============================================================

alter table survey_responses
  add column if not exists instrument text not null default 'batnghiep';

create index if not exists idx_sr_instr
  on survey_responses (class_code, instrument, phase, created_at);

-- Đổi kiểu trả về nên phải drop trước (CREATE OR REPLACE không đổi được out params)
drop function if exists bizon_survey_export(text, text);

create function bizon_survey_export(p_class_code text, p_key text)
returns table (
  instrument text,
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
  select sr.instrument, sr.phase, sr.student_code, sr.role, sr.rounds_played,
         sr.score_a, sr.score_by_outcome, sr.likert_b, sr.likert_c,
         sr.nps, sr.open_like, sr.open_improve, sr.created_at
  from survey_responses sr
  where bizon_check_key(p_key) and sr.class_code = p_class_code
  order by sr.instrument, sr.student_code, sr.phase desc, sr.created_at;
$$;
