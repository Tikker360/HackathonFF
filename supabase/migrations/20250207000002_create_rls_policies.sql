-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.players enable row level security;
alter table public.holdings enable row level security;
alter table public.transactions enable row level security;
alter table public.price_history enable row level security;

-- profiles: anyone can read, users update their own
create policy "profiles_select" on public.profiles
  for select using (true);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- players: authenticated users can read, no user writes
create policy "players_select" on public.players
  for select to authenticated using (true);

-- holdings: anyone can read (rosters are public), system manages writes
create policy "holdings_select" on public.holdings
  for select using (true);

-- transactions: users read their own, system manages writes
create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);

-- price_history: authenticated users can read
create policy "price_history_select" on public.price_history
  for select to authenticated using (true);
