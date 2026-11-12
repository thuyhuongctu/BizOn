\set ON_ERROR_STOP on
-- Kiểm 20261112000000_gioi_han_lop_dong.sql trên CSDL đã chạy test/sql/supabase_auth_stub.sql và toàn bộ migration.
-- Tự tạo người dùng, lớp và dữ liệu riêng (mã lớp GH-TEST*), dọn sạch khi xong. Chạy lại được.
reset role;
create or replace function pg_temp.gh_fail(p_sql text, p_needle text) returns void language plpgsql as $$
begin
  begin execute p_sql; exception when others then
    if p_needle <> '' and position(p_needle in sqlerrm) = 0 then raise exception 'Lỗi sai loại: "%" (cần "%")', sqlerrm, p_needle; end if; return; end;
  raise exception 'Lẽ ra phải bị chặn: %', p_sql;
end; $$;
grant execute on function pg_temp.gh_fail(text, text) to anon, authenticated;
create or replace function pg_temp.gh_eq(p_actual text, p_expected text, p_what text) returns void language plpgsql as $$
begin if p_actual is distinct from p_expected then raise exception '% : được "%", cần "%"', p_what, p_actual, p_expected; end if; end; $$;
grant execute on function pg_temp.gh_eq(text, text, text) to anon, authenticated;

-- Dọn dữ liệu của lần chạy trước
delete from public.survey_responses where class_code like 'GH-TEST%';
delete from public.ft_results where class_code like 'GH-TEST%';
delete from public.bp_results where class_code like 'GH-TEST%';
delete from public.round_submissions where class_code like 'GH-TEST%';
delete from public.instructor_class_access where class_code like 'GH-TEST%';
delete from auth.users where email like 'gh-test-%';

-- 170 sinh viên giả (một lớp đông) và một giảng viên chủ lớp GH-TEST
insert into auth.users (id, email)
  select ('00000000-0000-0000-0000-' || lpad((990000 + g)::text, 12, '0'))::uuid, 'gh-test-' || g || '@student.ctu.edu.vn' from generate_series(1, 170) g;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-000000990999', 'gh-test-gv@ctu.edu.vn');
insert into public.instructor_class_access (instructor_id, class_code) values ('00000000-0000-0000-0000-000000990999', 'GH-TEST');

-- 1. Phiếu khảo sát: 160 bạn nộp trong cùng một phút đều qua (trước đây phiếu thứ 151 bị từ chối); trần mới 500
set role anon;
insert into public.survey_responses (phase, class_code, student_code, answers_a, score_a, likert_b)
  select 'pre', 'GH-TEST', 'S' || g, '{"1":"a"}', 5, '{"1":3}' from generate_series(1, 160) g;
reset role;
select pg_temp.gh_eq((select count(*)::text from public.survey_responses where class_code = 'GH-TEST'), '160', '160 phiếu cùng phút đều được nhận');
insert into public.survey_responses (phase, class_code, student_code, answers_a, score_a, likert_b)
  select 'post', 'GH-TEST', 'S' || g, '{"1":"a"}', 5, '{"1":3}' from generate_series(1, 340) g;   -- đủ 500
set role anon;
select pg_temp.gh_fail($q$insert into public.survey_responses (phase, class_code, student_code, answers_a, score_a, likert_b)
  values ('pre', 'GH-TEST', 'S999', '{"1":"a"}', 5, '{"1":3}')$q$, 'Quá nhiều phiếu');
-- lớp khác không bị ảnh hưởng
insert into public.survey_responses (phase, class_code, student_code, answers_a, score_a, likert_b)
  values ('pre', 'GH-TEST-KHAC', 'S1', '{"1":"a"}', 5, '{"1":3}');
reset role;
delete from public.survey_responses where class_code like 'GH-TEST%';

-- 2. Bảng xếp hạng: lớp 170 bạn hiện đủ 170 dòng (trước đây Bến Phù Sa cụt ở 60, Hộ Chiếu ở 50, theo phiên bản ở 120)
insert into public.ft_results (class_code, player_name, team_name, total_revenue, efficiency, final_rank, app_version, student_id)
  select 'GH-TEST', 'SV ' || g, 'Doi ' || ((g - 1) / 5 + 1), 1000 - g, 50, 1, 'v8', ('00000000-0000-0000-0000-' || lpad((990000 + g)::text, 12, '0'))::uuid
  from generate_series(1, 170) g;
insert into public.bp_results (class_code, player_name, company, total_score, profit, quarters, student_id)
  select 'GH-TEST', 'SV ' || g, 'Moc Nhien', (g % 100), 1, 6, ('00000000-0000-0000-0000-' || lpad((990000 + g)::text, 12, '0'))::uuid
  from generate_series(1, 170) g;
set role anon;
select pg_temp.gh_eq((select count(*)::text from public.ft_class_leaderboard('GH-TEST')), '170', 'ft_class_leaderboard đủ 170 dòng');
select pg_temp.gh_eq((select count(distinct team_name)::text from public.ft_class_leaderboard('GH-TEST')), '34', 'đủ 34 đội, không đội nào biến mất');
select pg_temp.gh_eq((select count(*)::text from public.ft_class_results_by_version('GH-TEST')), '170', 'ft_class_results_by_version đủ 170 dòng');
select pg_temp.gh_eq((select count(*)::text from public.bp_class_leaderboard('GH-TEST')), '170', 'bp_class_leaderboard đủ 170 dòng');
-- vẫn xếp theo điểm giảm dần, vẫn chỉ trả biệt danh
select pg_temp.gh_eq((select player_name from public.ft_class_leaderboard('GH-TEST') limit 1), 'SV 1', 'người doanh thu cao nhất đứng đầu');
reset role;
-- trần mới: 500 dòng
insert into public.ft_results (class_code, player_name, team_name, total_revenue, efficiency, final_rank, student_id)
  select 'GH-TEST', 'SV ' || g, 'Doi phu ' || t, 10, 50, 4, ('00000000-0000-0000-0000-' || lpad((990000 + g)::text, 12, '0'))::uuid
  from generate_series(1, 170) g, generate_series(1, 2) t;
set role anon;
select pg_temp.gh_eq((select count(*)::text from public.ft_class_leaderboard('GH-TEST')), '500', 'ft_class_leaderboard trần 500 dòng');
reset role;

-- 3. Dòng nộp của Bật Nghiệp: 32 đội × 6 vòng = 192 lượt, chủ lớp xin 1000 thì nhận đủ; mặc định vẫn 30; người khác không thấy gì
insert into public.round_submissions (class_code, team_name, round_number, result_json, result_hash)
  select 'GH-TEST', 'Team ' || lpad(t::text, 2, '0'), r, jsonb_build_object('netProfit', t * r, 'share', 25), md5(t::text || '-' || r)
  from generate_series(1, 32) t, generate_series(1, 6) r;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000990999","email":"gh-test-gv@ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select pg_temp.gh_eq((select count(*)::text from public.bizon_feed_v2('GH-TEST', 1000)), '192', 'chủ lớp nhận đủ 192 lượt nộp');
select pg_temp.gh_eq((select count(distinct team_name)::text from public.bizon_feed_v2('GH-TEST', 1000)), '32', 'đủ 32 đội');
select pg_temp.gh_eq((select count(*)::text from public.bizon_feed_v2('GH-TEST')), '30', 'mặc định vẫn 30 dòng');
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000990001","email":"gh-test-1@student.ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select pg_temp.gh_eq((select count(*)::text from public.bizon_feed_v2('GH-TEST', 1000)), '0', 'người không phải chủ lớp không thấy dòng nào');
reset role;
set role anon;
select pg_temp.gh_fail($q$select * from public.bizon_feed_v2('GH-TEST', 1000)$q$, 'permission denied');
reset role;
select set_config('request.jwt.claims', '', false);

-- Dọn
delete from public.ft_results where class_code like 'GH-TEST%';
delete from public.bp_results where class_code like 'GH-TEST%';
delete from public.round_submissions where class_code like 'GH-TEST%';
delete from public.instructor_class_access where class_code like 'GH-TEST%';
delete from auth.users where email like 'gh-test-%';
\echo gioi_han_lop_dong_smoke: ok
