-- 005_auth_user_scope.sql
-- Multi-tenant hardening: ownership by user_id = auth.uid()

create extension if not exists pgcrypto;

-- 1) Profiles: decouple profile id from auth.users.id and add explicit user ownership.
do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_id_fkey'
  ) then
    alter table public.profiles drop constraint profiles_id_fkey;
  end if;
exception
  when undefined_table then
    null;
end $$;

alter table public.profiles alter column id set default gen_random_uuid();
alter table public.profiles add column if not exists user_id uuid;

update public.profiles p
set user_id = p.id
where p.user_id is null
  and p.id in (select id from auth.users);

insert into public.profiles (user_id, name, role)
select
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data ->> 'full_name', ''),
    nullif(split_part(u.email, '@', 1), ''),
    'Usuário'
  ),
  'primary'
from auth.users u
where not exists (
  select 1
  from public.profiles p
  where p.user_id = u.id
);

delete from public.profiles p
using public.profiles p2
where p.user_id = p2.user_id
  and p.role = 'primary'
  and p2.role = 'primary'
  and p.created_at > p2.created_at;

alter table public.profiles alter column user_id set not null;
alter table public.profiles alter column user_id set default auth.uid();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_user_id_fkey') then
    alter table public.profiles
      add constraint profiles_user_id_fkey
      foreign key (user_id)
      references auth.users(id)
      on delete cascade;
  end if;
end $$;

create index if not exists idx_profiles_user_id on public.profiles(user_id);
create unique index if not exists idx_profiles_id_user_id on public.profiles(id, user_id);
create unique index if not exists idx_profiles_user_primary_unique on public.profiles(user_id) where role = 'primary';

-- 2) Ensure business tables have user_id uuid and it is backfilled from profile ownership.
do $$
declare
  t text;
  tables text[] := array['accounts','transactions','shifts','assets','liabilities','health_metrics','goals'];
begin
  foreach t in array tables loop
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = t
        and column_name = 'user_id'
        and data_type in ('text', 'character varying')
    ) then
      execute format('alter table public.%I add column if not exists user_id_uuid uuid;', t);
      execute format(
        $$update public.%1$I set user_id_uuid = nullif(user_id, '')::uuid
          where user_id_uuid is null
            and user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';$$,
        t
      );
      execute format('alter table public.%I drop column user_id;', t);
      execute format('alter table public.%I rename column user_id_uuid to user_id;', t);
    elsif not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = t
        and column_name = 'user_id'
    ) then
      execute format('alter table public.%I add column user_id uuid;', t);
    end if;

    execute format(
      'update public.%1$I x set user_id = p.user_id from public.profiles p where x.user_id is null and x.profile_id = p.id;',
      t
    );
    execute format('alter table public.%I alter column user_id set not null;', t);
    execute format('alter table public.%I alter column user_id set default auth.uid();', t);
    execute format('create index if not exists idx_%1$s_user_id on public.%1$I(user_id);', t);
  end loop;
end $$;

alter table public.goals alter column profile_id drop not null;

-- 3) Ownership constraints: profile_id must belong to the same user_id.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'accounts_profile_user_fkey') then
    alter table public.accounts
      add constraint accounts_profile_user_fkey
      foreign key (profile_id, user_id)
      references public.profiles(id, user_id)
      on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'transactions_profile_user_fkey') then
    alter table public.transactions
      add constraint transactions_profile_user_fkey
      foreign key (profile_id, user_id)
      references public.profiles(id, user_id)
      on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'shifts_profile_user_fkey') then
    alter table public.shifts
      add constraint shifts_profile_user_fkey
      foreign key (profile_id, user_id)
      references public.profiles(id, user_id)
      on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'assets_profile_user_fkey') then
    alter table public.assets
      add constraint assets_profile_user_fkey
      foreign key (profile_id, user_id)
      references public.profiles(id, user_id)
      on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'liabilities_profile_user_fkey') then
    alter table public.liabilities
      add constraint liabilities_profile_user_fkey
      foreign key (profile_id, user_id)
      references public.profiles(id, user_id)
      on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'health_metrics_profile_user_fkey') then
    alter table public.health_metrics
      add constraint health_metrics_profile_user_fkey
      foreign key (profile_id, user_id)
      references public.profiles(id, user_id)
      on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'goals_profile_user_fkey') then
    alter table public.goals
      add constraint goals_profile_user_fkey
      foreign key (profile_id, user_id)
      references public.profiles(id, user_id)
      on delete cascade;
  end if;
end $$;

-- Transactions also need account ownership consistency.
create unique index if not exists idx_accounts_id_user_id on public.accounts(id, user_id);

do $$
begin
  update public.transactions t
  set user_id = a.user_id
  from public.accounts a
  where t.account_id = a.id
    and t.user_id <> a.user_id;

  if not exists (select 1 from pg_constraint where conname = 'transactions_account_user_fkey') then
    alter table public.transactions
      add constraint transactions_account_user_fkey
      foreign key (account_id, user_id)
      references public.accounts(id, user_id)
      on delete cascade;
  end if;
end $$;

-- 4) RLS policies by user_id.
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.shifts enable row level security;
alter table public.assets enable row level security;
alter table public.liabilities enable row level security;
alter table public.health_metrics enable row level security;
alter table public.goals enable row level security;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_delete_own on public.profiles;
drop policy if exists accounts_select_own on public.accounts;
drop policy if exists accounts_insert_own on public.accounts;
drop policy if exists accounts_update_own on public.accounts;
drop policy if exists accounts_delete_own on public.accounts;
drop policy if exists transactions_select_own on public.transactions;
drop policy if exists transactions_insert_own on public.transactions;
drop policy if exists transactions_update_own on public.transactions;
drop policy if exists transactions_delete_own on public.transactions;
drop policy if exists shifts_select_own on public.shifts;
drop policy if exists shifts_insert_own on public.shifts;
drop policy if exists shifts_update_own on public.shifts;
drop policy if exists shifts_delete_own on public.shifts;
drop policy if exists assets_select_own on public.assets;
drop policy if exists assets_insert_own on public.assets;
drop policy if exists assets_update_own on public.assets;
drop policy if exists assets_delete_own on public.assets;
drop policy if exists liabilities_select_own on public.liabilities;
drop policy if exists liabilities_insert_own on public.liabilities;
drop policy if exists liabilities_update_own on public.liabilities;
drop policy if exists liabilities_delete_own on public.liabilities;
drop policy if exists health_metrics_select_own on public.health_metrics;
drop policy if exists health_metrics_insert_own on public.health_metrics;
drop policy if exists health_metrics_update_own on public.health_metrics;
drop policy if exists health_metrics_delete_own on public.health_metrics;
drop policy if exists goals_select_own on public.goals;
drop policy if exists goals_insert_own on public.goals;
drop policy if exists goals_update_own on public.goals;
drop policy if exists goals_delete_own on public.goals;

create policy profiles_select_by_user on public.profiles
  for select using (user_id = auth.uid());
create policy profiles_insert_by_user on public.profiles
  for insert with check (user_id = auth.uid());
create policy profiles_update_by_user on public.profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy profiles_delete_by_user on public.profiles
  for delete using (user_id = auth.uid());

create policy accounts_select_by_user on public.accounts
  for select using (user_id = auth.uid());
create policy accounts_insert_by_user on public.accounts
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and p.user_id = auth.uid()
    )
  );
create policy accounts_update_by_user on public.accounts
  for update using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and p.user_id = auth.uid()
    )
  );
create policy accounts_delete_by_user on public.accounts
  for delete using (user_id = auth.uid());

create policy transactions_select_by_user on public.transactions
  for select using (user_id = auth.uid());
create policy transactions_insert_by_user on public.transactions
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and p.user_id = auth.uid()
    )
    and exists (
      select 1 from public.accounts a
      where a.id = account_id
        and a.user_id = auth.uid()
    )
  );
create policy transactions_update_by_user on public.transactions
  for update using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and p.user_id = auth.uid()
    )
    and exists (
      select 1 from public.accounts a
      where a.id = account_id
        and a.user_id = auth.uid()
    )
  );
create policy transactions_delete_by_user on public.transactions
  for delete using (user_id = auth.uid());

create policy shifts_select_by_user on public.shifts
  for select using (user_id = auth.uid());
create policy shifts_insert_by_user on public.shifts
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and p.user_id = auth.uid()
    )
  );
create policy shifts_update_by_user on public.shifts
  for update using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and p.user_id = auth.uid()
    )
  );
create policy shifts_delete_by_user on public.shifts
  for delete using (user_id = auth.uid());

create policy assets_select_by_user on public.assets
  for select using (user_id = auth.uid());
create policy assets_insert_by_user on public.assets
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and p.user_id = auth.uid()
    )
  );
create policy assets_update_by_user on public.assets
  for update using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and p.user_id = auth.uid()
    )
  );
create policy assets_delete_by_user on public.assets
  for delete using (user_id = auth.uid());

create policy liabilities_select_by_user on public.liabilities
  for select using (user_id = auth.uid());
create policy liabilities_insert_by_user on public.liabilities
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and p.user_id = auth.uid()
    )
  );
create policy liabilities_update_by_user on public.liabilities
  for update using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and p.user_id = auth.uid()
    )
  );
create policy liabilities_delete_by_user on public.liabilities
  for delete using (user_id = auth.uid());

create policy health_metrics_select_by_user on public.health_metrics
  for select using (user_id = auth.uid());
create policy health_metrics_insert_by_user on public.health_metrics
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and p.user_id = auth.uid()
    )
  );
create policy health_metrics_update_by_user on public.health_metrics
  for update using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and p.user_id = auth.uid()
    )
  );
create policy health_metrics_delete_by_user on public.health_metrics
  for delete using (user_id = auth.uid());

create policy goals_select_by_user on public.goals
  for select using (user_id = auth.uid());
create policy goals_insert_by_user on public.goals
  for insert with check (
    user_id = auth.uid()
    and (
      profile_id is null
      or exists (
        select 1 from public.profiles p
        where p.id = profile_id
          and p.user_id = auth.uid()
      )
    )
  );
create policy goals_update_by_user on public.goals
  for update using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and (
      profile_id is null
      or exists (
        select 1 from public.profiles p
        where p.id = profile_id
          and p.user_id = auth.uid()
      )
    )
  );
create policy goals_delete_by_user on public.goals
  for delete using (user_id = auth.uid());

-- 5) DB-side bootstrap fallback on signup.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, name, role)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(split_part(new.email, '@', 1), ''),
      'Usuário'
    ),
    'primary'
  )
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();
