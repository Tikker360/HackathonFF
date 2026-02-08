export interface LeaderboardEntry {
  id: string;
  team_name: string;
  cash_balance: number;
  holdings_value: number;
  total_value: number;
  change_from_start: number;
  change_pct: number;
  rank: number;
}

export interface LeaderboardStats {
  total_users: number;
  avg_portfolio_value: number;
  trades_today: number;
  most_owned_player: {
    name: string;
    owner_count: number;
  } | null;
}

export interface RosterHolding {
  id: string;
  player_id: string;
  quantity: number;
  avg_purchase_price: number;
  player: {
    name: string;
    position: string;
    team: string;
    current_price: number;
  };
}
