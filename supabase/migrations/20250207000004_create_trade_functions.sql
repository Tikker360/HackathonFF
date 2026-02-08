-- Atomic buy_player RPC
-- Deducts cash, upserts holdings (with avg cost recalc), logs transaction
create or replace function public.buy_player(
  p_player_id uuid,
  p_quantity int default 1
)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  v_user_id uuid;
  v_price numeric;
  v_total numeric;
  v_cash numeric;
  v_existing_qty int;
  v_existing_avg numeric;
  v_new_qty int;
  v_new_avg numeric;
begin
  -- Get caller
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_quantity < 1 then
    raise exception 'Quantity must be at least 1';
  end if;

  -- Lock the player row and read price
  select current_price into v_price
    from public.players
    where id = p_player_id
    for share;

  if v_price is null then
    raise exception 'Player not found';
  end if;

  v_total := v_price * p_quantity;

  -- Lock the profile row and check cash
  select cash_balance into v_cash
    from public.profiles
    where id = v_user_id
    for update;

  if v_cash < v_total then
    raise exception 'Insufficient funds. Need %, have %', v_total, v_cash;
  end if;

  -- Deduct cash
  update public.profiles
    set cash_balance = cash_balance - v_total
    where id = v_user_id;

  -- Upsert holdings with weighted average cost
  select quantity, avg_purchase_price
    into v_existing_qty, v_existing_avg
    from public.holdings
    where user_id = v_user_id and player_id = p_player_id
    for update;

  if v_existing_qty is not null then
    v_new_qty := v_existing_qty + p_quantity;
    v_new_avg := ((v_existing_avg * v_existing_qty) + (v_price * p_quantity)) / v_new_qty;

    update public.holdings
      set quantity = v_new_qty,
          avg_purchase_price = v_new_avg,
          updated_at = now()
      where user_id = v_user_id and player_id = p_player_id;
  else
    insert into public.holdings (user_id, player_id, quantity, avg_purchase_price)
      values (v_user_id, p_player_id, p_quantity, v_price);
  end if;

  -- Log transaction
  insert into public.transactions (user_id, player_id, type, quantity, price_per_share, total_price)
    values (v_user_id, p_player_id, 'BUY', p_quantity, v_price, v_total);

  return jsonb_build_object(
    'success', true,
    'price_per_share', v_price,
    'quantity', p_quantity,
    'total', v_total,
    'cash_remaining', v_cash - v_total
  );
end;
$$;

-- Atomic sell_player RPC
-- Adds cash, reduces/removes holdings, logs transaction
create or replace function public.sell_player(
  p_player_id uuid,
  p_quantity int default 1
)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  v_user_id uuid;
  v_price numeric;
  v_total numeric;
  v_existing_qty int;
  v_remaining int;
begin
  -- Get caller
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_quantity < 1 then
    raise exception 'Quantity must be at least 1';
  end if;

  -- Lock the player row and read price
  select current_price into v_price
    from public.players
    where id = p_player_id
    for share;

  if v_price is null then
    raise exception 'Player not found';
  end if;

  v_total := v_price * p_quantity;

  -- Check holdings
  select quantity into v_existing_qty
    from public.holdings
    where user_id = v_user_id and player_id = p_player_id
    for update;

  if v_existing_qty is null or v_existing_qty < p_quantity then
    raise exception 'Insufficient shares. Own %, trying to sell %',
      coalesce(v_existing_qty, 0), p_quantity;
  end if;

  -- Add cash
  update public.profiles
    set cash_balance = cash_balance + v_total
    where id = v_user_id;

  -- Update or remove holdings
  v_remaining := v_existing_qty - p_quantity;

  if v_remaining = 0 then
    delete from public.holdings
      where user_id = v_user_id and player_id = p_player_id;
  else
    update public.holdings
      set quantity = v_remaining,
          updated_at = now()
      where user_id = v_user_id and player_id = p_player_id;
  end if;

  -- Log transaction
  insert into public.transactions (user_id, player_id, type, quantity, price_per_share, total_price)
    values (v_user_id, p_player_id, 'SELL', p_quantity, v_price, v_total);

  return jsonb_build_object(
    'success', true,
    'price_per_share', v_price,
    'quantity', p_quantity,
    'total', v_total
  );
end;
$$;
