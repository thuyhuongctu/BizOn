-- Bảng xếp hạng lớp trực tiếp (read-only, chỉ trả về tổng hợp không nhạy cảm).
-- KHÔNG thay đổi bảng/chính sách hiện có; chỉ thêm MỘT hàm SECURITY DEFINER.
--
-- team_saves có RLS bật và không có chính sách SELECT cho anon (cố ý) nên
-- người chơi không thể liệt kê nhau qua REST. Hàm này mở một đường đọc hẹp,
-- chỉ phơi bày: tên đội (do sinh viên tự đặt), vòng hiện tại, tổng lợi nhuận
-- lũy kế và thị phần gần nhất — KHÔNG trả về state_json, email hay token.

create or replace function public.bizon_class_leaderboard(p_class_code text)
returns table (
  team_name     text,
  round         int,
  total_profit  numeric,
  last_share    numeric,
  updated_at    timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    ts.team_name,
    coalesce((ts.state_json ->> 'round')::int, 1) as round,
    coalesce(
      (select sum((r ->> 'netProfit')::numeric)
         from jsonb_array_elements(ts.state_json -> 'history') r),
      0) as total_profit,
    coalesce(
      (select (r ->> 'share')::numeric
         from jsonb_array_elements(ts.state_json -> 'history') r
        order by (r ->> 'round')::int desc
        limit 1),
      25) as last_share,
    ts.updated_at
  from public.team_saves ts
  where ts.class_code = trim(p_class_code)
    and trim(p_class_code) <> ''
    and ts.class_code <> 'DEMO-2026'
  order by total_profit desc
  limit 50;
$$;

grant execute on function public.bizon_class_leaderboard(text) to anon;
