import { createClient } from "@/lib/supabase/client";

export interface TradeResult {
  success: boolean;
  price_per_share: number;
  quantity: number;
  total: number;
  cash_remaining?: number;
}

export async function buyPlayer(
  playerId: string,
  quantity: number = 1
): Promise<TradeResult> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("buy_player", {
    p_player_id: playerId,
    p_quantity: quantity,
  });

  if (error) throw new Error(error.message);
  return data as unknown as TradeResult;
}

export async function sellPlayer(
  playerId: string,
  quantity: number = 1
): Promise<TradeResult> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("sell_player", {
    p_player_id: playerId,
    p_quantity: quantity,
  });

  if (error) throw new Error(error.message);
  return data as unknown as TradeResult;
}
