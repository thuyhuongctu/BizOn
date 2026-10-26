\set ON_ERROR_STOP on
-- Kiểm hành vi của 20261026000000_journey_passports.sql (hành trình 3 bậc, J7) trên CSDL đã chạy
-- test/sql/supabase_auth_stub.sql và toàn bộ migration theo thứ tự (có thể chạy sau require_student_login_smoke.sql).
-- Đổi người dùng như PostgREST: request.jwt.claims + set role. Dữ liệu riêng: lớp JT-TEST, người dùng ...e1/e2/e3/f1.

reset role;
create or replace function pg_temp.jt_fail(p_sql text, p_needle text) returns void
language plpgsql as $$
begin
  begin
    execute p_sql;
  exception when others then
    if p_needle <> '' and position(p_needle in sqlerrm) = 0 then
      raise exception 'Lỗi sai loại: "%" (cần chứa "%") khi chạy: %', sqlerrm, p_needle, p_sql;
    end if;
    return;
  end;
  raise exception 'Lẽ ra phải bị chặn: %', p_sql;
end;
$$;
grant execute on function pg_temp.jt_fail(text, text) to anon, authenticated;
create or replace function pg_temp.jt_eq(p_actual text, p_expected text, p_what text) returns void
language plpgsql as $$
begin
  if p_actual is distinct from p_expected then raise exception '% : được "%", cần "%"', p_what, p_actual, p_expected; end if;
end;
$$;
grant execute on function pg_temp.jt_eq(text, text, text) to anon, authenticated;

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000e1', 'jt.a@student.ctu.edu.vn'),
  ('00000000-0000-0000-0000-0000000000e2', 'jt.b@student.ctu.edu.vn'),
  ('00000000-0000-0000-0000-0000000000e3', 'jt.ngoai@gmail.com'),
  ('00000000-0000-0000-0000-0000000000f1', 'jt.gv@ctu.edu.vn'),
  ('00000000-0000-0000-0000-0000000000f2', 'jt.gv2@ctu.edu.vn')
on conflict (id) do nothing;
insert into public.instructor_allowlist (email, note, added_by) values ('jt.gv@ctu.edu.vn', 'test', 'test'), ('jt.gv2@ctu.edu.vn', 'test', 'test') on conflict (email) do nothing;

-- Hộ chiếu mẫu (lược đồ v1, xem js/core/journey.js)
create temp table jt_p as select
  '{"schemaVersion":1,"journeyId":"J-JT-TEST-DOI-A-2026-11-03","classCode":"JT-TEST","teamName":"Doi A","createdAt":"2026-11-03T02:10:00Z","updatedAt":"2026-11-03T02:10:00Z","tiers":{"t1":{"status":"done","eff":71},"t2":{"status":"pending"},"t3":{"status":"locked","variant":"durian"}},"carry":{},"carryEnabled":true}'::jsonb as p;
grant select on jt_p to anon, authenticated;

-- ---------- 1. anon: không gọi được gì, không đọc bảng ----------
select set_config('request.jwt.claims', '{"role":"anon"}', false);
set role anon;
select pg_temp.jt_fail($q$select public.bizon_journey_upsert('JT-TEST','Doi A','{}'::jsonb,null)$q$, 'permission denied');
select pg_temp.jt_fail($q$select public.bizon_journey_get('JT-TEST','Doi A')$q$, 'permission denied');
select pg_temp.jt_fail($q$select public.bizon_set_journey_carry('JT-TEST',true)$q$, 'permission denied');
select pg_temp.jt_fail($q$select * from public.journey_passports$q$, 'permission denied');
-- feed công khai vẫn đọc được và có khoá journey_carry (null khi chưa đặt)
select pg_temp.jt_eq((public.bizon_class_feed('JT-TEST','Doi A')->'controls')::text, 'null', 'feed lớp chưa có controls');
reset role;

-- ---------- 2. Sinh viên A: ghi, đọc lại của mình; hộ chiếu hỏng bị từ chối ----------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000e1","email":"jt.a@student.ctu.edu.vn","role":"authenticated"}', false);
set role authenticated;
select pg_temp.jt_eq((public.bizon_journey_upsert('jt-test', 'Doi A', (select p from jt_p), 'bizon-journey-v1'))->>'journey_id', 'J-JT-TEST-DOI-A-2026-11-03', 'upsert trả journey_id');
select pg_temp.jt_eq((public.bizon_journey_get('JT-TEST', 'doi a'))->>'mine', 'true', 'đọc của mình (không phân biệt hoa thường tên đội)');
select pg_temp.jt_eq((public.bizon_journey_get('JT-TEST', 'Doi A'))->'passport'->'tiers'->'t1'->>'eff', '71', 'nội dung hộ chiếu');
select pg_temp.jt_eq((public.bizon_journey_get('JT-TEST', 'Doi B'))::text, null, 'đội khác → null');
select pg_temp.jt_fail($q$select public.bizon_journey_upsert('JT-TEST','Doi A','{"schemaVersion":2,"journeyId":"J-X","tiers":{}}'::jsonb,null)$q$, 'không hợp lệ');
select pg_temp.jt_fail($q$select public.bizon_journey_upsert('JT-TEST','Doi A','{"schemaVersion":1,"journeyId":"J","tiers":{}}'::jsonb,null)$q$, 'không hợp lệ');
select pg_temp.jt_fail($q$select public.bizon_journey_upsert('x','Doi A','{"schemaVersion":1,"journeyId":"J-X","tiers":{}}'::jsonb,null)$q$, 'Mã lớp');
select pg_temp.jt_fail($q$select * from public.journey_passports$q$, 'permission denied');
-- ghi lần hai cùng (lớp, đội): cập nhật, không nhân đôi
select public.bizon_journey_upsert('JT-TEST', 'Doi A', jsonb_set((select p from jt_p), '{tiers,t2}', '{"status":"done","balanceEnd":612}'), 'bizon-journey-v1');
select pg_temp.jt_eq((public.bizon_journey_get('JT-TEST', 'Doi A'))->'passport'->'tiers'->'t2'->>'balanceEnd', '612', 'cập nhật hộ chiếu');
reset role;
select pg_temp.jt_eq((select count(*)::text from public.journey_passports where class_code = 'JT-TEST'), '1', 'một dòng cho A');

-- ---------- 3. Sinh viên B: chưa vào đội → không đọc được; vào đội Doi A → đọc bản của đội (mine=false) ----------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000e2","email":"jt.b@student.ctu.edu.vn","role":"authenticated"}', false);
set role authenticated;
select pg_temp.jt_eq((public.bizon_journey_get('JT-TEST', 'Doi A'))::text, null, 'B ngoài đội → null');
select * from public.bizon_join_team('jt-test', 'Doi A', 'CFO');
select pg_temp.jt_eq((public.bizon_journey_get('JT-TEST', 'Doi A'))->>'mine', 'false', 'B trong đội đọc bản của A');
select pg_temp.jt_eq((public.bizon_journey_get('JT-TEST', 'Doi A'))->>'journey_id', 'J-JT-TEST-DOI-A-2026-11-03', 'cùng journeyId');
reset role;

-- ---------- 4. Email ngoài trường: bị chặn ----------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000e3","email":"jt.ngoai@gmail.com","role":"authenticated"}', false);
set role authenticated;
select pg_temp.jt_fail($q$select public.bizon_journey_upsert('JT-TEST','Doi A','{"schemaVersion":1,"journeyId":"J-NGOAI","tiers":{}}'::jsonb,null)$q$, 'email trường');
select pg_temp.jt_fail($q$select public.bizon_journey_get('JT-TEST','Doi A')$q$, 'email trường');
reset role;

-- ---------- 5. Giảng viên: nhận lớp, bật cờ hành trang, xem hộ chiếu của lớp; giảng viên khác không được ----------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000f1","email":"jt.gv@ctu.edu.vn","role":"authenticated"}', false);
set role authenticated;
select public.bizon_claim_class('JT-TEST');
select pg_temp.jt_eq((public.bizon_class_feed('JT-TEST','Doi A')->'controls'->>'journey_carry'), null, 'chưa đặt → null (game coi là tắt)');
select pg_temp.jt_eq(public.bizon_set_journey_carry('jt-test', true)::text, 'true', 'bật cờ');
select pg_temp.jt_eq((public.bizon_class_feed('JT-TEST','Doi A')->'controls'->>'journey_carry'), 'true', 'feed trả cờ đã bật');
select pg_temp.jt_eq((public.bizon_class_state_v2('JT-TEST')->'controls'->>'journey_carry'), 'true', 'state giảng viên có cờ');
select pg_temp.jt_eq(public.bizon_set_journey_carry('JT-TEST', false)::text, 'true', 'tắt cờ');
select pg_temp.jt_eq((public.bizon_class_feed('JT-TEST','Doi A')->'controls'->>'journey_carry'), 'false', 'feed trả cờ đã tắt');
select pg_temp.jt_eq((select count(*)::text from public.bizon_journey_class('JT-TEST')), '1', 'giảng viên thấy 1 hộ chiếu');
select pg_temp.jt_eq((select student_email from public.bizon_journey_class('JT-TEST') limit 1), 'jt.a@student.ctu.edu.vn', 'kèm email sinh viên');
-- hộ chiếu của sinh viên không bị cờ lớp làm hỏng; hàm sinh viên không cho giảng viên (email không phải sinh viên) gọi
select pg_temp.jt_fail($q$select public.bizon_journey_get('JT-TEST','Doi A')$q$, 'email trường');
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000f2","email":"jt.gv2@ctu.edu.vn","role":"authenticated"}', false);
set role authenticated;
select pg_temp.jt_fail($q$select public.bizon_set_journey_carry('JT-TEST', true)$q$, 'quyền');
select pg_temp.jt_eq((select count(*)::text from public.bizon_journey_class('JT-TEST')), '0', 'giảng viên khác không thấy gì');
reset role;

-- ---------- 6. Dọn dữ liệu cũ và xoá tài khoản ----------
update public.journey_passports set updated_at = now() - interval '13 months' where student_id = '00000000-0000-0000-0000-0000000000e1';
select public.bizon_purge_expired();
select pg_temp.jt_eq((select count(*)::text from public.journey_passports where class_code = 'JT-TEST'), '0', 'purge xoá hộ chiếu quá 12 tháng');
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000e2","email":"jt.b@student.ctu.edu.vn","role":"authenticated"}', false);
set role authenticated;
select public.bizon_journey_upsert('JT-TEST', 'Doi A', (select p from jt_p), null);
reset role;
delete from auth.users where id = '00000000-0000-0000-0000-0000000000e2';
select pg_temp.jt_eq((select count(*)::text from public.journey_passports where class_code = 'JT-TEST'), '0', 'xoá tài khoản → hộ chiếu xoá theo');
select 'journey_passports_smoke: OK' as result;
