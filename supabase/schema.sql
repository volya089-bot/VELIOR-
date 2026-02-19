create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'FREE' check (plan in ('FREE','PRO','BUSINESS')),
  plan_status text not null default 'inactive' check (plan_status in ('inactive','pending','active')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.monitors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('url_uptime','keyword_watch','coingecko_price')),
  target text not null,
  rule_json jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  interval_minutes int not null default 60,
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.monitor_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  monitor_id uuid not null references public.monitors(id) on delete cascade,
  ok boolean not null,
  severity text not null check (severity in ('info','warn','critical')),
  title text not null,
  body text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  monitor_id uuid not null references public.monitors(id) on delete cascade,
  severity text not null check (severity in ('info','warn','critical')),
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists monitors_set_updated_at on public.monitors;
create trigger monitors_set_updated_at before update on public.monitors
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.monitors enable row level security;
alter table public.monitor_runs enable row level security;
alter table public.alerts enable row level security;

create policy "profiles_read_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

create policy "monitors_crud_own" on public.monitors for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "runs_read_own" on public.monitor_runs for select using (auth.uid() = user_id);
create policy "alerts_read_own" on public.alerts for select using (auth.uid() = user_id);

create index if not exists idx_monitors_user on public.monitors(user_id);
create index if not exists idx_alerts_user_time on public.alerts(user_id, created_at desc);
