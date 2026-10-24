-- ============================================================
-- BizOn — Gộp Mã lớp gõ lệch trong survey_responses (khảo sát trước/sau)
--
-- Mã lớp ở khao-sat-online.html là ô gõ tự do, nên phiếu của hai lớp KTM330H
-- (15–19/10/2026) nằm rải ở nhiều cách gõ: KT330HM02, KT330H.M02, KT330H-M02,
-- KTM330H-M02, KT330M02, KT330H M01, KT330M01, KT33H M01… Instructor Studio chỉ lọc
-- đúng mã đã đăng ký nên chỉ thấy một phần phiếu. Theo quyết định của giảng viên
-- (24/10/2026), gộp về mã đã phát cho lớp:
--   lớp M02 → KTM330HM02 · lớp M01 → KTM330HM01
-- Phiếu chỉ ghi «KT330H» (không rõ lớp) để nguyên.
--
-- Chỉ sửa cột class_code, không đụng câu trả lời. Mã gốc của từng phiếu được ghi
-- vào survey_class_code_fixes trước khi sửa, để khôi phục được:
--   update survey_responses s set class_code = f.old_code
--   from survey_class_code_fixes f where f.survey_id = s.id;
-- Chạy lại an toàn: lần sau không còn mã lệch nên không sửa gì thêm.
-- ============================================================

create table if not exists public.survey_class_code_fixes (
  survey_id uuid primary key,
  old_code text not null,
  new_code text not null,
  fixed_at timestamptz not null default now()
);
alter table public.survey_class_code_fixes enable row level security;
revoke all on public.survey_class_code_fixes from anon, authenticated;

with map(key, new_code) as (values
  ('KTM330HM02', 'KTM330HM02'), ('KT330HM02', 'KTM330HM02'), ('KT330M02', 'KTM330HM02'),
  ('KTM330HM01', 'KTM330HM01'), ('KT330HM01', 'KTM330HM01'), ('KT330M01', 'KTM330HM01'), ('KT33HM01', 'KTM330HM01')
), target as (
  -- Khoá so khớp: viết hoa, bỏ khoảng trắng, dấu chấm và gạch ngang
  select s.id, s.class_code as old_code, m.new_code
  from public.survey_responses s
  join map m on m.key = upper(regexp_replace(s.class_code, '[[:space:].-]', '', 'g'))
  where s.class_code <> m.new_code
), logged as (
  insert into public.survey_class_code_fixes (survey_id, old_code, new_code)
  select id, old_code, new_code from target
  on conflict (survey_id) do nothing
  returning survey_id
)
update public.survey_responses s
set class_code = t.new_code
from target t
where s.id = t.id;
