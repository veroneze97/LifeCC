-- 004_seed_dev.sql
-- Dev seed for public tables. Requires an existing auth user UUID.
-- Usage:
--   set app.seed_user_id = 'REPLACE_WITH_AUTH_USER_UUID';
--   \i 004_seed_dev.sql

DO $$
declare
  target_user_id uuid;
  target_profile_id uuid;
begin
  target_user_id := nullif(current_setting('app.seed_user_id', true), '')::uuid;

  if target_user_id is null then
    raise exception 'Set app.seed_user_id before running 004_seed_dev.sql';
  end if;

  insert into public.profiles (user_id, name, role)
  values (target_user_id, 'Usuário Dev', 'primary')
  on conflict do nothing;

  select id
  into target_profile_id
  from public.profiles
  where user_id = target_user_id
  order by created_at asc
  limit 1;

  if target_profile_id is null then
    raise exception 'Não foi possível localizar/criar profile para o usuário %', target_user_id;
  end if;

  delete from public.transactions where user_id = target_user_id;
  delete from public.shifts where user_id = target_user_id;
  delete from public.assets where user_id = target_user_id;
  delete from public.liabilities where user_id = target_user_id;
  delete from public.health_metrics where user_id = target_user_id;
  delete from public.goals where user_id = target_user_id;
  delete from public.accounts where user_id = target_user_id;

  insert into public.accounts (user_id, profile_id, name, type, balance_initial)
  values
    (target_user_id, target_profile_id, 'Conta Corrente', 'checking', 4000),
    (target_user_id, target_profile_id, 'Carteira de Investimentos', 'investment', 25000);

  insert into public.transactions (user_id, profile_id, account_id, date, type, category, description, amount, status)
  select target_user_id, target_profile_id, a.id, current_date - interval '5 day', 'income', 'Salário', 'Salário mensal', 8500, 'paid'
  from public.accounts a
  where a.user_id = target_user_id
  order by a.created_at asc
  limit 1;

  insert into public.assets (user_id, profile_id, type, name, value, date_reference)
  values (target_user_id, target_profile_id, 'investment', 'Tesouro Selic', 30000, current_date);

  insert into public.liabilities (user_id, profile_id, type, name, value, date_reference)
  values (target_user_id, target_profile_id, 'credit_card', 'Fatura Cartão', 1800, current_date);

  insert into public.health_metrics (user_id, profile_id, date, weight, workouts, notes)
  values (target_user_id, target_profile_id, current_date, 80.5, 1, 'Seed dev');

  insert into public.goals (user_id, profile_id, name, target_value, monthly_contribution, expected_return_rate, scope)
  values (target_user_id, target_profile_id, 'Meta Dev', 100000, 2000, 0, 'individual');
end $$;
