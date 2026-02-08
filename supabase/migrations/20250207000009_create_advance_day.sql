-- advance_day: Simulates a day of market activity by randomly adjusting all player prices.
-- Each player's price shifts by -7% to +8% (slight upward bias like real markets).
-- Records new price_history entries for charting.
-- Returns a summary of all price changes.

create or replace function advance_day()
returns jsonb
language plpgsql
security definer
as $$
declare
  v_player record;
  v_new_price numeric;
  v_factor numeric;
  v_changes jsonb := '[]'::jsonb;
  v_min_price numeric := 50;   -- price floor
  v_max_price numeric := 2000; -- price ceiling
begin
  for v_player in select id, name, current_price from players order by name
  loop
    -- Random factor between 0.93 and 1.08 (slight upward bias)
    v_factor := 0.93 + (random() * 0.15);
    v_new_price := round((v_player.current_price * v_factor)::numeric, 2);

    -- Clamp to min/max bounds
    if v_new_price < v_min_price then
      v_new_price := v_min_price;
    elsif v_new_price > v_max_price then
      v_new_price := v_max_price;
    end if;

    -- Update the player's current price
    update players
    set current_price = v_new_price,
        updated_at = now()
    where id = v_player.id;

    -- Record in price_history
    insert into price_history (player_id, price, recorded_at)
    values (v_player.id, v_new_price, now());

    -- Accumulate changes for return
    v_changes := v_changes || jsonb_build_object(
      'player_id', v_player.id,
      'name', v_player.name,
      'old_price', v_player.current_price,
      'new_price', v_new_price,
      'change_pct', round(((v_new_price - v_player.current_price) / v_player.current_price * 100)::numeric, 2)
    );
  end loop;

  return jsonb_build_object(
    'success', true,
    'players_updated', jsonb_array_length(v_changes),
    'changes', v_changes
  );
end;
$$;

-- Grant execute to authenticated users (for testing)
grant execute on function advance_day() to authenticated;
