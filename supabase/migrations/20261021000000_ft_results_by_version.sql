-- ============================================================
-- BizOn — Bến Phù Sa: bảng giáo viên tách xếp hạng theo PHIÊN BẢN game.
-- Ba bản chơi đơn nộp chung bảng ft_results nhưng luật khác nhau, phân biệt bằng
-- cột app_version (không có ràng buộc giá trị):
--   'bizon-bps2d-v2'  ben-phu-sa.html     (2D, luật 10/2026 – lợi nhuận)
--   'bizon-bps3d-v2'  ben-phu-sa-3d.html  (3D, luật 10/2026 – lợi nhuận)
--   'bizon-bps-v8'    ben-phu-sa-v8.html  (cảnh 3D + chơi nhóm, luật 10/2026)
--   'bizon-bps3d-v1'  bản cũ: 3D (doanh thu) và v8 (lợi nhuận) nộp TRÙNG mã này
--   'bizon-v302'…     bản 2D cũ
-- RPC cũ ft_class_leaderboard (20261002000000) GIỮ NGUYÊN cho trang Bảng Xếp Hạng;
-- RPC mới trả thêm app_version, mỗi (người, đội, phiên bản) 1 dòng tốt nhất.
-- Bang Giao Vien.dc.html gọi RPC mới, máy chủ chưa có thì lùi về RPC cũ.
-- Chỉ thêm hàm đọc, không đổi dữ liệu. An toàn khi chạy lại.
-- ============================================================
create or replace function public.ft_class_results_by_version(p_class_code text)
returns table (player_name text, team_name text, total_revenue numeric, efficiency numeric, final_rank int, exam boolean, created_at timestamptz, app_version text)
language sql security definer stable set search_path = public as $$
  select * from (
    select distinct on (lower(coalesce(r.player_name, '')), r.team_name, coalesce(r.app_version, ''))
      coalesce(nullif(r.player_name, ''), 'Ẩn danh'), r.team_name, r.total_revenue, r.efficiency::numeric, r.final_rank::int,
      coalesce((r.detail_json->>'exam')::boolean, false), r.created_at, r.app_version
    from ft_results r
    where upper(r.class_code) = upper(trim(p_class_code))
    order by lower(coalesce(r.player_name, '')), r.team_name, coalesce(r.app_version, ''), r.total_revenue desc, r.created_at
  ) x order by x.total_revenue desc, x.created_at limit 120;
$$;
revoke all on function public.ft_class_results_by_version(text) from public;
grant execute on function public.ft_class_results_by_version(text) to anon, authenticated;

notify pgrst, 'reload schema';
