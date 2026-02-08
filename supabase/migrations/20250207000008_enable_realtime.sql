-- Enable Supabase Realtime for tables needed by the leaderboard
-- The supabase_realtime publication exists by default on all Supabase projects

alter publication supabase_realtime add table public.holdings;
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.transactions;
