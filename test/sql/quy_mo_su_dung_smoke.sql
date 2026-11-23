\set ON_ERROR_STOP on
-- Kiểm 20261123000000_quy_mo_su_dung.sql trên CSDL đã chạy test/sql/supabase_auth_stub.sql và toàn bộ migration.
-- Đếm chênh lệch trước/sau khi thêm dữ liệu thử (lớp QMTEST-…), nên chạy được cả trên CSDL đã có dữ liệu khác. Chạy lại được.
reset role;
delete from round_submissions where class_code like 'QMTHU-%';
delete from team_saves where class_code like 'QMTHU-%';
delete from ft_results where class_code like 'QMTHU-%';
delete from bp_results where class_code like 'QMTHU-%';
create temp table qm_truoc as select public.bizon_quy_mo_su_dung() as j;
create or replace function pg_temp.qm_eq(p_khoa text, p_them int) returns void language plpgsql as $$
declare a bigint; b bigint;
begin
  select (j->>p_khoa)::bigint into a from qm_truoc;
  b := (public.bizon_quy_mo_su_dung()->>p_khoa)::bigint;
  if b - a is distinct from p_them then raise exception '% : tăng %, cần tăng %', p_khoa, b - a, p_them; end if;
end; $$;

-- Hai lớp thật: lớp 1 có đội A nộp đủ 6 vòng (tên đội viết hoa/thường khác nhau vẫn là một đội), đội B nộp 2 vòng;
-- lớp 2 chỉ có một ván Bến Phù Sa và một ván Hộ Chiếu. Lớp DEMO và TEST không được đếm.
insert into round_submissions (class_code, team_name, round_number, result_json, result_hash)
select 'QMTHU-1', case when r % 2 = 0 then 'Đội A' else 'đội a ' end, r, '{}'::jsonb, 'h' from generate_series(1, 6) r;
insert into round_submissions (class_code, team_name, round_number, result_json, result_hash)
select 'QMTHU-1', 'Đội B', r, '{}'::jsonb, 'h' from generate_series(1, 2) r;
insert into ft_results (class_code, team_name, total_revenue, efficiency, final_rank) values ('QMTHU-2', 'Ghe 1', 120, 80, 1);
insert into bp_results (class_code, company, total_score, profit, quarters) values ('QMTHU-2', 'Mộc Nhiên', 70, 1.5, 4);
insert into round_submissions (class_code, team_name, round_number, result_json, result_hash) values ('DEMO-QMTHU', 'X', 6, '{}'::jsonb, 'h'), ('TEST-QMTHU', 'Y', 6, '{}'::jsonb, 'h');

select pg_temp.qm_eq('lop', 2);
select pg_temp.qm_eq('doi_bat_nghiep', 2);
select pg_temp.qm_eq('van_bat_nghiep_xong', 1);
select pg_temp.qm_eq('luot_ben_phu_sa', 1);
select pg_temp.qm_eq('luot_ho_chieu', 1);

-- Khách ẩn danh gọi được hàm, nhưng vẫn không đọc thẳng được bảng; kết quả chỉ có các khóa số tổng.
select set_config('request.jwt.claims', '{"role":"anon"}', false); set role anon;
do $$ declare j jsonb := public.bizon_quy_mo_su_dung(); begin
  if (select array_agg(k order by k) from jsonb_object_keys(j) k) <> array['doi_bat_nghiep','lop','luot_ben_phu_sa','luot_ho_chieu','tu_ngay','van_bat_nghiep_xong'] then raise exception 'khóa lạ: %', j; end if;
  if j::text ~ 'QMTHU|Đội|Mộc' then raise exception 'lộ dữ liệu lớp: %', j; end if;
end $$;
-- Bảng bật RLS và không có chính sách cho anon: đọc thẳng chỉ thấy 0 dòng dù đang có dữ liệu thử.
do $$ begin if exists (select 1 from round_submissions where class_code like 'QMTHU-%') then raise exception 'anon đọc thẳng được round_submissions'; end if; exception when insufficient_privilege then null; end $$;
reset role;

delete from round_submissions where class_code like 'QMTHU-%' or class_code in ('DEMO-QMTHU', 'TEST-QMTHU');
delete from ft_results where class_code like 'QMTHU-%';
delete from bp_results where class_code like 'QMTHU-%';
select 'quy_mo_su_dung_smoke: ok';
