-- 001_base.sql
-- Base objects required by the app and production migrations.

create extension if not exists pgcrypto;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null default 'primary' check (role in ('primary', 'partner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  target_value numeric not null,
  target_date date,
  monthly_contribution numeric not null default 0,
  expected_return_rate numeric not null default 0,
  scope text not null default 'individual' check (scope in ('individual', 'joint')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.accounts add column if not exists updated_at timestamptz not null default now();
alter table if exists public.transactions add column if not exists updated_at timestamptz not null default now();
alter table if exists public.shifts add column if not exists updated_at timestamptz not null default now();
alter table if exists public.assets add column if not exists updated_at timestamptz not null default now();
alter table if exists public.liabilities add column if not exists updated_at timestamptz not null default now();
alter table if exists public.health_metrics add column if not exists updated_at timestamptz not null default now();
alter table if exists public.goals add column if not exists updated_at timestamptz not null default now();
alter table if exists public.profiles add column if not exists updated_at timestamptz not null default now();

do $$
declare
  t text;
  tables text[] := array['profiles','accounts','transactions','shifts','assets','liabilities','health_metrics','goals'];
begin
  foreach t in array tables loop
    if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = t) then
      if not exists (
        select 1
        from pg_trigger
        where tgname = format('trg_%s_touch_updated_at', t)
      ) then
        execute format('create trigger trg_%s_touch_updated_at before update on public.%I for each row execute function public.touch_updated_at();', t, t);
      end if;
    end if;
  end loop;
end $$;
