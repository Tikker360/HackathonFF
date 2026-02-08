-- Automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, team_name, cash_balance)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'team_name', 'Team ' || left(new.id::text, 8)),
    10000
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Allow the trigger function to insert into profiles
create policy "profiles_insert_on_signup" on public.profiles
  for insert with check (auth.uid() = id);
