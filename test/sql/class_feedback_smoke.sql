\set ON_ERROR_STOP on
-- Kiểm hành vi của 20261106000000_class_feedback.sql trên CSDL đã chạy test/sql/supabase_auth_stub.sql và toàn bộ migration
-- (chạy lại được: dọn lớp FB-TEST trước). Giảng viên fb.gv (chủ lớp) và fb.gv2 (không phải chủ). Tiêu chí: docs/design/tro-ly-giang-vien.md §10.4.
reset role;
delete from public.class_feedback where class_code = 'FB-TEST';
delete from public.round_submissions where class_code = 'FB-TEST';
delete from public.class_exam where class_code = 'FB-TEST';
delete from public.instructor_class_access where class_code = 'FB-TEST';
create or replace function pg_temp.fb_fail(p_sql text, p_needle text) returns void language plpgsql as $$
begin
  begin execute p_sql; exception when others then
    if p_needle <> '' and position(p_needle in sqlerrm) = 0 then raise exception 'Lỗi sai loại: "%" (cần "%")', sqlerrm, p_needle; end if; return; end;
  raise exception 'Lẽ ra phải bị chặn: %', p_sql;
end; $$;
grant execute on function pg_temp.fb_fail(text, text) to anon, authenticated;
create or replace function pg_temp.fb_eq(p_actual text, p_expected text, p_what text) returns void language plpgsql as $$
begin if p_actual is distinct from p_expected then raise exception '% : được "%", cần "%"', p_what, p_actual, p_expected; end if; end; $$;
grant execute on function pg_temp.fb_eq(text, text, text) to anon, authenticated;

insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000b1', 'fb.gv@ctu.edu.vn'), ('00000000-0000-0000-0000-0000000000b2', 'fb.gv2@ctu.edu.vn') on conflict (id) do nothing;
insert into public.instructor_allowlist (email, note, added_by) values ('fb.gv@ctu.edu.vn', 'test', 'test'), ('fb.gv2@ctu.edu.vn', 'test', 'test') on conflict (email) do nothing;
-- Hai đội đã nộp vòng 2; đội A nộp hai lần (lần sau là căn cứ).
insert into public.round_submissions (class_code, team_name, round_number, result_json, result_hash, created_at) values
  ('FB-TEST', 'Đội A', 2, '{"share":20}', 'hash-a-cu', now() - interval '5 minutes'),
  ('FB-TEST', 'Đội A', 2, '{"share":21}', 'hash-a-moi', now()),
  ('FB-TEST', 'Đội B', 2, '{"share":18}', 'hash-b', now());

-- anon: không gọi được hàm ghi; bảng không đọc thẳng được
select set_config('request.jwt.claims', '{"role":"anon"}', false); set role anon;
select pg_temp.fb_fail($q$select public.bizon_feedback_send('FB-TEST','Đội A',2,'x','vi',null,0)$q$, 'permission denied');
select pg_temp.fb_fail($q$select count(*) from public.class_feedback$q$, 'permission denied');
reset role;

-- chủ lớp nhận lớp
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b1","email":"fb.gv@ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select public.bizon_claim_class('FB-TEST');
reset role;

-- giảng viên không phải chủ lớp: bị từ chối cả gửi lẫn đọc
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","email":"fb.gv2@ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select pg_temp.fb_fail($q$select public.bizon_feedback_send('FB-TEST','Đội A',2,'Ghi nhận.','vi','{}',0)$q$, 'quyền');
select pg_temp.fb_fail($q$select public.bizon_feedback_class('FB-TEST')$q$, 'quyền');
reset role;

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b1","email":"fb.gv@ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
-- gửi bản 1 cho đội A: căn cứ là lần nộp mới nhất (hash lấy trên máy chủ)
select pg_temp.fb_eq(public.bizon_feedback_send('fb-test','Đội A',2,'Ghi nhận: thị phần lên.','vi','{"hoi":"R1"}',0)->>'result_hash', 'hash-a-moi', 'hash căn cứ');
-- đội chưa nộp vòng ấy: không gửi được; nội dung trống / quá dài: bị chặn
select pg_temp.fb_fail($q$select public.bizon_feedback_send('FB-TEST','Đội C',2,'x','vi',null,0)$q$, 'chưa nộp');
select pg_temp.fb_fail($q$select public.bizon_feedback_send('FB-TEST','Đội B',2,'   ','vi',null,0)$q$, 'trống');
select pg_temp.fb_fail($q$select public.bizon_feedback_send('FB-TEST','Đội B',2,repeat('a',1201),'vi',null,0)$q$, '1 200');
-- hai thẻ: thẻ sau còn tưởng phiên bản 0 thì bị từ chối
select pg_temp.fb_fail($q$select public.bizon_feedback_send('FB-TEST','Đội A',2,'Bản thẻ kia','vi',null,0)$q$, 'Tải lại');
-- gửi cho đội B rồi thu hồi
select public.bizon_feedback_send('FB-TEST','Đội B',2,'Nhận xét riêng đội B.','vi',null,0);
select pg_temp.fb_eq(public.bizon_feedback_set_state('FB-TEST','Đội B',2,'thu_hoi',1)->>'trang_thai', 'thu_hoi', 'thu hồi');
select pg_temp.fb_fail($q$select public.bizon_feedback_set_state('FB-TEST','Đội B',2,'thu_hoi',1)$q$, 'đang gửi');
-- sửa sau khi gửi: phiên bản 2, dòng 1 còn nguyên
select pg_temp.fb_eq(public.bizon_feedback_send('FB-TEST','Đội A',2,'Bản sửa.','en','{"hoi":"Q0"}',1)->>'phien_ban', '2', 'phiên bản 2');
reset role;
select pg_temp.fb_eq((select noi_dung from public.class_feedback where class_code='FB-TEST' and team_name='Đội A' and phien_ban=1), 'Ghi nhận: thị phần lên.', 'dòng 1 còn nguyên');
select pg_temp.fb_eq((select da_sua::text from public.class_feedback where class_code='FB-TEST' and team_name='Đội A' and phien_ban=2), 'true', 'đánh dấu đã sửa');
select pg_temp.fb_eq((select count(*)::text from public.class_feedback where class_code='FB-TEST'), '3', 'không xoá dòng nào');

-- đội A đọc feed: chỉ thấy phiên bản 2 của mình, không thấy chữ của đội B; đội B (đã thu hồi) không thấy gì
select set_config('request.jwt.claims', '{"role":"anon"}', false); set role anon;
select pg_temp.fb_eq(jsonb_array_length(public.bizon_class_feed('FB-TEST','Đội A')->'feedback')::text, '1', 'đội A thấy một nhận xét');
select pg_temp.fb_eq(public.bizon_class_feed('FB-TEST','Đội A')->'feedback'->0->>'noi_dung', 'Bản sửa.', 'đội A thấy bản mới nhất');
select pg_temp.fb_eq(public.bizon_class_feed('FB-TEST','Đội A')->'feedback'->0->>'ngon_ngu', 'en', 'giữ ngôn ngữ đã duyệt');
select pg_temp.fb_eq((position('đội B' in public.bizon_class_feed('FB-TEST','Đội A')::text) > 0)::text, 'false', 'đội A không thấy chữ của đội B');
select pg_temp.fb_eq(public.bizon_class_feed('FB-TEST','Đội B')->>'feedback', '[]', 'dòng thu_hoi không hiện');
select pg_temp.fb_eq((public.bizon_class_feed('FB-TEST','Đội A') ?& array['controls','grants','feedback'])::text, 'true', 'feed giữ đủ khoá cũ');
reset role;

-- bỏ một bản nháp; đọc biên nhận + hash; chế độ thi chặn gửi
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b1","email":"fb.gv@ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select pg_temp.fb_eq(public.bizon_feedback_set_state('FB-TEST','Đội B',2,'bo',1)->>'phien_ban', '2', 'bỏ sau thu hồi');
select pg_temp.fb_fail($q$select public.bizon_feedback_set_state('FB-TEST','Đội A',2,'bo',2)$q$, 'thu hồi');
select pg_temp.fb_eq(jsonb_array_length(public.bizon_feedback_class('FB-TEST')->'feedback')::text, '4', 'chủ lớp đọc mọi dòng');
select pg_temp.fb_eq((select h->>'result_hash' from jsonb_array_elements(public.bizon_feedback_class('FB-TEST')->'hashes') h where h->>'team_name' = 'Đội A'), 'hash-a-moi', 'hash mới nhất');
select pg_temp.fb_eq((public.bizon_feedback_class('FB-TEST')->'feedback'->0 ? 'created_by')::text, 'false', 'không lộ người tạo');
select public.bizon_set_exam('FB-TEST', true, now(), 10, 8, 500);
select pg_temp.fb_fail($q$select public.bizon_feedback_send('FB-TEST','Đội A',2,'Giữa giờ thi','vi',null,2)$q$, 'chế độ thi');
select public.bizon_set_exam('FB-TEST', false, null, 10, 8, 500);
reset role;

-- tự dọn dòng quá 365 ngày ở lần gửi kế tiếp
update public.class_feedback set created_at = now() - interval '366 days' where class_code = 'FB-TEST' and team_name = 'Đội B';
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b1","email":"fb.gv@ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select public.bizon_feedback_send('FB-TEST','Đội A',2,'Bản ba.','vi',null,2);
reset role;
select pg_temp.fb_eq((select count(*)::text from public.class_feedback where class_code='FB-TEST' and team_name='Đội B'), '0', 'dọn sau 365 ngày');
select 'class_feedback_smoke: OK' as result;
