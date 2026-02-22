-- 002_add_profile_id.sql
-- Adds profile_id ownership model to all business tables and backfills legacy data.
-- Safety mode (Option B): fail-fast if any legacy non-UUID user_id is found.

-- Ensure every auth user has a public profile row.
insert into public.profiles (id, name, role)
select
  u.id,
  coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), nullif(u.email, ''), 'Usuário'),
  'primary'
from auth.users u
on conflict (id) do nothing;

alter table if exists public.accounts add column if not exists profile_id uuid;
alter table if exists public.transactions add column if not exists profile_id uuid;
alter table if exists public.shifts add column if not exists profile_id uuid;
alter table if exists public.assets add column if not exists profile_id uuid;
alter table if exists public.liabilities add column if not exists profile_id uuid;
alter table if exists public.health_metrics add column if not exists profile_id uuid;
alter table if exists public.goals add column if not exists profile_id uuid;

do $$
declare
  non_uuid_count bigint;
  orphan_uuid_count bigint;
  goals_has_user_id boolean;
  goals_profile_null_count bigint;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'goals'
      and column_name = 'user_id'
  ) into goals_has_user_id;

  -- NO-GO safety check: migration aborts if legacy user_id is not UUID.
  select coalesce(sum(cnt), 0)
  into non_uuid_count
  from (
    select count(*) as cnt from public.accounts where profile_id is null and (user_id is null or user_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')
    union all
    select count(*) as cnt from public.transactions where profile_id is null and (user_id is null or user_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')
    union all
    select count(*) as cnt from public.shifts where profile_id is null and (user_id is null or user_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')
    union all
    select count(*) as cnt from public.assets where profile_id is null and (user_id is null or user_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')
    union all
    select count(*) as cnt from public.liabilities where profile_id is null and (user_id is null or user_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')
    union all
    select count(*) as cnt from public.health_metrics where profile_id is null and (user_id is null or user_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')
    union all
    select case
      when goals_has_user_id then (
        select count(*) from public.goals where profile_id is null and (user_id is null or user_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')
      )
      else 0
    end as cnt
  ) s;

  if non_uuid_count > 0 then
    raise exception using
      message = format('NO-GO: migration 002 aborted. Found %s rows with non-UUID user_id. Clean legacy rows before retry.', non_uuid_count),
      hint = 'Run pre-check query for non-UUID user_id and normalize/delete those rows first.';
  end if;

  -- Safety check: UUID user_id must exist in public.profiles (which maps auth.users).
  select coalesce(sum(cnt), 0)
  into orphan_uuid_count
  from (
    select count(*) as cnt from public.accounts a where a.profile_id is null and a.user_id is not null and a.user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' and not exists (select 1 from public.profiles p where p.id = a.user_id::uuid)
    union all
    select count(*) as cnt from public.transactions t where t.profile_id is null and t.user_id is not null and t.user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' and not exists (select 1 from public.profiles p where p.id = t.user_id::uuid)
    union all
    select count(*) as cnt from public.shifts s where s.profile_id is null and s.user_id is not null and s.user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' and not exists (select 1 from public.profiles p where p.id = s.user_id::uuid)
    union all
    select count(*) as cnt from public.assets a where a.profile_id is null and a.user_id is not null and a.user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' and not exists (select 1 from public.profiles p where p.id = a.user_id::uuid)
    union all
    select count(*) as cnt from public.liabilities l where l.profile_id is null and l.user_id is not null and l.user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' and not exists (select 1 from public.profiles p where p.id = l.user_id::uuid)
    union all
    select count(*) as cnt from public.health_metrics h where h.profile_id is null and h.user_id is not null and h.user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' and not exists (select 1 from public.profiles p where p.id = h.user_id::uuid)
    union all
    select case
      when goals_has_user_id then (
        select count(*) from public.goals g where g.profile_id is null and g.user_id is not null and g.user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' and not exists (select 1 from public.profiles p where p.id = g.user_id::uuid)
      )
      else 0
    end as cnt
  ) x;

  if orphan_uuid_count > 0 then
    raise exception using
      message = format('NO-GO: migration 002 aborted. Found %s rows with UUID user_id not present in public.profiles/auth.users.', orphan_uuid_count),
      hint = 'Ensure auth.users/public.profiles contain these UUIDs before rerunning migration.';
  end if;

  -- If goals has no user_id, fail-fast when legacy rows still need mapping.
  if not goals_has_user_id then
    select count(*) into goals_profile_null_count from public.goals where profile_id is null;
    if goals_profile_null_count > 0 then
      raise exception using
        message = format('NO-GO: migration 002 aborted. goals.user_id does not exist and %s goals rows have null profile_id.', goals_profile_null_count),
        hint = 'Backfill goals.profile_id manually before rerunning migration 002.';
    end if;
  end if;
end $$;

-- Deterministic backfill only from validated UUID user_id.
update public.accounts a
set profile_id = a.user_id::uuid
where a.profile_id is null and a.user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

update public.transactions t
set profile_id = t.user_id::uuid
where t.profile_id is null and t.user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

update public.shifts s
set profile_id = s.user_id::uuid
where s.profile_id is null and s.user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

update public.assets a
set profile_id = a.user_id::uuid
where a.profile_id is null and a.user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

update public.liabilities l
set profile_id = l.user_id::uuid
where l.profile_id is null and l.user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

update public.health_metrics h
set profile_id = h.user_id::uuid
where h.profile_id is null and h.user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

do $$
declare
  goals_has_user_id boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'goals'
      and column_name = 'user_id'
  ) into goals_has_user_id;

  if goals_has_user_id then
    update public.goals g
    set profile_id = g.user_id::uuid
    where g.profile_id is null and g.user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
  end if;
end $$;

alter table public.accounts alter column profile_id set not null;
alter table public.transactions alter column profile_id set not null;
alter table public.shifts alter column profile_id set not null;
alter table public.assets alter column profile_id set not null;
alter table public.liabilities alter column profile_id set not null;
alter table public.health_metrics alter column profile_id set not null;
alter table public.goals alter column profile_id set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'accounts_profile_id_fkey') then
    alter table public.accounts add constraint accounts_profile_id_fkey foreign key (profile_id) references public.profiles(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'transactions_profile_id_fkey') then
    alter table public.transactions add constraint transactions_profile_id_fkey foreign key (profile_id) references public.profiles(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'shifts_profile_id_fkey') then
    alter table public.shifts add constraint shifts_profile_id_fkey foreign key (profile_id) references public.profiles(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'assets_profile_id_fkey') then
    alter table public.assets add constraint assets_profile_id_fkey foreign key (profile_id) references public.profiles(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'liabilities_profile_id_fkey') then
    alter table public.liabilities add constraint liabilities_profile_id_fkey foreign key (profile_id) references public.profiles(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'health_metrics_profile_id_fkey') then
    alter table public.health_metrics add constraint health_metrics_profile_id_fkey foreign key (profile_id) references public.profiles(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'goals_profile_id_fkey') then
    alter table public.goals add constraint goals_profile_id_fkey foreign key (profile_id) references public.profiles(id) on delete cascade;
  end if;
end $$;

-- NOTE: CREATE INDEX CONCURRENTLY cannot run inside transactional migrations in many runners.
create index if not exists idx_accounts_profile_id on public.accounts(profile_id);
create index if not exists idx_transactions_profile_id on public.transactions(profile_id);
create index if not exists idx_shifts_profile_id on public.shifts(profile_id);
create index if not exists idx_assets_profile_id on public.assets(profile_id);
create index if not exists idx_liabilities_profile_id on public.liabilities(profile_id);
create index if not exists idx_health_metrics_profile_id on public.health_metrics(profile_id);
create index if not exists idx_goals_profile_id on public.goals(profile_id);
