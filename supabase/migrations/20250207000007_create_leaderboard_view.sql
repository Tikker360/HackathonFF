-- Leaderboard rankings view: computes total portfolio value and rank for all users
CREATE OR REPLACE VIEW public.leaderboard_rankings AS
WITH portfolio AS (
  SELECT
    p.id,
    p.team_name,
    p.cash_balance,
    COALESCE(SUM(h.quantity * pl.current_price), 0) AS holdings_value
  FROM profiles p
  LEFT JOIN holdings h ON h.user_id = p.id
  LEFT JOIN players pl ON pl.id = h.player_id
  GROUP BY p.id, p.team_name, p.cash_balance
)
SELECT
  id,
  team_name,
  cash_balance,
  holdings_value,
  (cash_balance + holdings_value) AS total_value,
  (cash_balance + holdings_value - 10000) AS change_from_start,
  CASE
    WHEN 10000 = 0 THEN 0
    ELSE ROUND(((cash_balance + holdings_value - 10000) / 10000) * 100, 2)
  END AS change_pct,
  RANK() OVER (ORDER BY (cash_balance + holdings_value) DESC) AS rank
FROM portfolio;

-- Leaderboard stats RPC: summary statistics for the leaderboard header
CREATE OR REPLACE FUNCTION public.leaderboard_stats()
RETURNS JSON
LANGUAGE sql
STABLE
AS $$
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'avg_portfolio_value', (
      SELECT COALESCE(ROUND(AVG(cash_balance + COALESCE(hv.holdings_value, 0)), 2), 0)
      FROM profiles p
      LEFT JOIN (
        SELECT user_id, SUM(quantity * pl.current_price) AS holdings_value
        FROM holdings h
        JOIN players pl ON pl.id = h.player_id
        GROUP BY user_id
      ) hv ON hv.user_id = p.id
    ),
    'trades_today', (
      SELECT COUNT(*)
      FROM transactions
      WHERE created_at >= CURRENT_DATE
    ),
    'most_owned_player', (
      SELECT json_build_object('name', pl.name, 'owner_count', COUNT(DISTINCT h.user_id))
      FROM holdings h
      JOIN players pl ON pl.id = h.player_id
      GROUP BY pl.id, pl.name
      ORDER BY COUNT(DISTINCT h.user_id) DESC, SUM(h.quantity) DESC
      LIMIT 1
    )
  );
$$;
