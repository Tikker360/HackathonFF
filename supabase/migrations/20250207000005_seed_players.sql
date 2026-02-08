-- Seed 20 NFL players across QB, RB, WR, TE
-- baseline_price = starting price, current_price = same initially (no market movement yet)

insert into public.players (name, position, team, jersey_number, current_price, baseline_price) values
  -- Quarterbacks
  ('Josh Allen',        'QB', 'BUF', 17, 670.00, 670.00),
  ('Patrick Mahomes',   'QB', 'KC',  15, 645.00, 645.00),
  ('Lamar Jackson',     'QB', 'BAL',  8, 635.00, 635.00),
  ('Jalen Hurts',       'QB', 'PHI',  1, 590.00, 590.00),
  ('Joe Burrow',        'QB', 'CIN',  9, 560.00, 560.00),

  -- Running Backs
  ('Saquon Barkley',    'RB', 'PHI', 26, 625.00, 625.00),
  ('Bijan Robinson',    'RB', 'ATL',  7, 600.00, 600.00),
  ('Jahmyr Gibbs',      'RB', 'DET', 26, 545.00, 545.00),
  ('Breece Hall',       'RB', 'NYJ', 20, 510.00, 510.00),
  ('De''Von Achane',    'RB', 'MIA', 28, 490.00, 490.00),

  -- Wide Receivers
  ('Ja''Marr Chase',    'WR', 'CIN',  1, 620.00, 620.00),
  ('CeeDee Lamb',       'WR', 'DAL', 88, 580.00, 580.00),
  ('Amon-Ra St. Brown', 'WR', 'DET', 14, 555.00, 555.00),
  ('Tyreek Hill',       'WR', 'MIA', 10, 520.00, 520.00),
  ('Malik Nabers',      'WR', 'NYG',  1, 470.00, 470.00),

  -- Tight Ends
  ('Travis Kelce',      'TE', 'KC',  87, 480.00, 480.00),
  ('Brock Bowers',      'TE', 'LV',  89, 440.00, 440.00),
  ('Sam LaPorta',       'TE', 'DET', 87, 420.00, 420.00),
  ('Trey McBride',      'TE', 'ARI', 85, 390.00, 390.00),
  ('George Kittle',     'TE', 'SF',  85, 365.00, 365.00);

-- Seed initial price_history entries for each player
insert into public.price_history (player_id, price, recorded_at)
select id, current_price, now()
from public.players;
