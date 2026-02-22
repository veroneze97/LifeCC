-- 003_rls.sql
-- Locks down all business tables by auth.uid() = profile_id.

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.shifts enable row level security;
alter table public.assets enable row level security;
alter table public.liabilities enable row level security;
alter table public.health_metrics enable row level security;
alter table public.goals enable row level security;

do $$
begin
  -- profiles
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_select_own') then
    create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_insert_own') then
    create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_update_own') then
    create policy profiles_update_own on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_delete_own') then
    create policy profiles_delete_own on public.profiles for delete using (auth.uid() = id);
  end if;

  -- accounts
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='accounts' and policyname='accounts_select_own') then
    create policy accounts_select_own on public.accounts for select using (auth.uid() = profile_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='accounts' and policyname='accounts_insert_own') then
    create policy accounts_insert_own on public.accounts for insert with check (auth.uid() = profile_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='accounts' and policyname='accounts_update_own') then
    create policy accounts_update_own on public.accounts for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='accounts' and policyname='accounts_delete_own') then
    create policy accounts_delete_own on public.accounts for delete using (auth.uid() = profile_id);
  end if;

  -- transactions
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='transactions' and policyname='transactions_select_own') then
    create policy transactions_select_own on public.transactions for select using (auth.uid() = profile_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='transactions' and policyname='transactions_insert_own') then
    create policy transactions_insert_own on public.transactions for insert with check (auth.uid() = profile_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='transactions' and policyname='transactions_update_own') then
    create policy transactions_update_own on public.transactions for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='transactions' and policyname='transactions_delete_own') then
    create policy transactions_delete_own on public.transactions for delete using (auth.uid() = profile_id);
  end if;

  -- shifts
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='shifts' and policyname='shifts_select_own') then
    create policy shifts_select_own on public.shifts for select using (auth.uid() = profile_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='shifts' and policyname='shifts_insert_own') then
    create policy shifts_insert_own on public.shifts for insert with check (auth.uid() = profile_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='shifts' and policyname='shifts_update_own') then
    create policy shifts_update_own on public.shifts for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='shifts' and policyname='shifts_delete_own') then
    create policy shifts_delete_own on public.shifts for delete using (auth.uid() = profile_id);
  end if;

  -- assets
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='assets' and policyname='assets_select_own') then
    create policy assets_select_own on public.assets for select using (auth.uid() = profile_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='assets' and policyname='assets_insert_own') then
    create policy assets_insert_own on public.assets for insert with check (auth.uid() = profile_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='assets' and policyname='assets_update_own') then
    create policy assets_update_own on public.assets for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='assets' and policyname='assets_delete_own') then
    create policy assets_delete_own on public.assets for delete using (auth.uid() = profile_id);
  end if;

  -- liabilities
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='liabilities' and policyname='liabilities_select_own') then
    create policy liabilities_select_own on public.liabilities for select using (auth.uid() = profile_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='liabilities' and policyname='liabilities_insert_own') then
    create policy liabilities_insert_own on public.liabilities for insert with check (auth.uid() = profile_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='liabilities' and policyname='liabilities_update_own') then
    create policy liabilities_update_own on public.liabilities for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='liabilities' and policyname='liabilities_delete_own') then
    create policy liabilities_delete_own on public.liabilities for delete using (auth.uid() = profile_id);
  end if;

  -- health_metrics
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='health_metrics' and policyname='health_metrics_select_own') then
    create policy health_metrics_select_own on public.health_metrics for select using (auth.uid() = profile_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='health_metrics' and policyname='health_metrics_insert_own') then
    create policy health_metrics_insert_own on public.health_metrics for insert with check (auth.uid() = profile_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='health_metrics' and policyname='health_metrics_update_own') then
    create policy health_metrics_update_own on public.health_metrics for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='health_metrics' and policyname='health_metrics_delete_own') then
    create policy health_metrics_delete_own on public.health_metrics for delete using (auth.uid() = profile_id);
  end if;

  -- goals
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='goals' and policyname='goals_select_own') then
    create policy goals_select_own on public.goals for select using (auth.uid() = profile_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='goals' and policyname='goals_insert_own') then
    create policy goals_insert_own on public.goals for insert with check (auth.uid() = profile_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='goals' and policyname='goals_update_own') then
    create policy goals_update_own on public.goals for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='goals' and policyname='goals_delete_own') then
    create policy goals_delete_own on public.goals for delete using (auth.uid() = profile_id);
  end if;
end $$;
