-- Create core tables for the fantasy football stock market

-- profiles: one per user, created on signup
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  team_name text unique not null,
  cash_balance numeric not null default 10000,
  created_at timestamptz not null default now()
);

-- players: NFL players that can be traded
create table public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null check (position in ('QB', 'RB', 'WR', 'TE')),
  team text not null,
  jersey_number int,
  current_price numeric not null,
  baseline_price numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- holdings: which players a user currently owns
create table public.holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  player_id uuid not null references public.players on delete cascade,
  quantity int not null check (quantity > 0),
  avg_purchase_price numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, player_id)
);

-- transactions: buy/sell history
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  player_id uuid not null references public.players on delete cascade,
  type text not null check (type in ('BUY', 'SELL')),
  quantity int not null check (quantity > 0),
  price_per_share numeric not null,
  total_price numeric not null,
  created_at timestamptz not null default now()
);

-- price_history: time series of player prices for charts
create table public.price_history (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players on delete cascade,
  price numeric not null,
  recorded_at timestamptz not null default now()
);

-- Index for efficient chart queries (player + time range)
create index idx_price_history_player_time
  on public.price_history (player_id, recorded_at desc);
