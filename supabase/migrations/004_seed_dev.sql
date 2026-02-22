-- 004_seed_dev.sql
-- Dev seed for public tables. Requires an existing auth user UUID.
-- Usage:
--   set app.seed_profile_id = 'REPLACE_WITH_AUTH_USER_UUID';
--   \i 004_seed_dev.sql

DO $$
declare
  target_profile_id uuid;
begin
  target_profile_id := nullif(current_setting('app.seed_profile_id', true), '')::uuid;

  if target_profile_id is null then
    raise exception 'Set app.seed_profile_id before running 004_seed_dev.sql';
  end if;

  insert into public.profiles (id, name, role)
  values (target_profile_id, 'Usuário Dev', 'primary')
  on conflict (id) do update set name = excluded.name;

  delete from public.transactions where profile_id = target_profile_id;
  delete from public.shifts where profile_id = target_profile_id;
  delete from public.assets where profile_id = target_profile_id;
  delete from public.liabilities where profile_id = target_profile_id;
  delete from public.health_metrics where profile_id = target_profile_id;
  delete from public.goals where profile_id = target_profile_id;
  delete from public.accounts where profile_id = target_profile_id;

  insert into public.accounts (profile_id, name, type, balance_initial)
  values
    (target_profile_id, 'Conta Corrente', 'checking', 4000),
    (target_profile_id, 'Carteira de Investimentos', 'investment', 25000);

  insert into public.transactions (profile_id, account_id, date, type, category, description, amount, status)
  select target_profile_id, a.id, current_date - interval '5 day', 'income', 'Salário', 'Salário mensal', 8500, 'paid'
  from public.accounts a
  where a.profile_id = target_profile_id
  order by a.created_at asc
  limit 1;

  insert into public.assets (profile_id, type, name, value, date_reference)
  values (target_profile_id, 'investment', 'Tesouro Selic', 30000, current_date);

  insert into public.liabilities (profile_id, type, name, value, date_reference)
  values (target_profile_id, 'credit_card', 'Fatura Cartão', 1800, current_date);

  insert into public.health_metrics (profile_id, date, weight, workouts, notes)
  values (target_profile_id, current_date, 80.5, 1, 'Seed dev');

  insert into public.goals (profile_id, name, target_value, monthly_contribution, expected_return_rate, scope)
  values (target_profile_id, 'Meta Dev', 100000, 2000, 0, 'individual');
end $$;
