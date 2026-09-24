-- ============================================================
-- BizOn – Retention purge: xóa dữ liệu máy chủ quá hạn.
-- Cửa sổ lưu: xem docs/release/RETENTION_DELETION.md
--   round_submissions / bp_results / ft_results : 12 tháng
--   survey_responses                            : 24 tháng
--   team_saves (theo updated_at)                : 90 ngày
--   client_errors                              : 90 ngày
--   bp_learning_traces (theo retention_until)   : đã hết hạn
--
-- An toàn để áp ở mọi môi trường: mỗi lệnh xóa được bọc to_regclass nên
-- không lỗi nếu bảng chưa tồn tại. KHÔNG tự tạo extension pg_cron (cần bật ở
-- Dashboard → Database → Extensions). Nếu pg_cron đã bật, tự đặt lịch hằng
-- ngày; nếu chưa, chỉ ghi chú — chạy purge thủ công khi cần.
-- ============================================================

create or replace function public.bizon_purge_expired()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if to_regclass('public.round_submissions') is not null then
    delete from round_submissions where created_at < now() - interval '12 months';
  end if;
  if to_regclass('public.bp_results') is not null then
    delete from bp_results where created_at < now() - interval '12 months';
  end if;
  if to_regclass('public.ft_results') is not null then
    delete from ft_results where created_at < now() - interval '12 months';
  end if;
  if to_regclass('public.survey_responses') is not null then
    delete from survey_responses where created_at < now() - interval '24 months';
  end if;
  if to_regclass('public.team_saves') is not null then
    delete from team_saves where updated_at < now() - interval '90 days';
  end if;
  if to_regclass('public.client_errors') is not null then
    delete from client_errors where created_at < now() - interval '90 days';
  end if;
  if to_regclass('public.bp_learning_traces') is not null then
    delete from bp_learning_traces where retention_until < now();
  end if;
end;
$$;

-- Không cấp quyền gọi cho client công khai; chỉ chạy nội bộ/qua cron.
revoke all on function public.bizon_purge_expired() from public, anon, authenticated;

-- Tự đặt lịch nếu pg_cron sẵn sàng (cron.schedule upsert theo tên job).
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('bizon-purge-daily', '15 3 * * *',
                          'select public.bizon_purge_expired();');
    raise notice 'Đã đặt lịch bizon-purge-daily (03:15 UTC).';
  else
    raise notice 'pg_cron chưa bật — bật ở Dashboard rồi chạy: select cron.schedule(''bizon-purge-daily'',''15 3 * * *'',''select public.bizon_purge_expired();'');';
  end if;
end
$$;
