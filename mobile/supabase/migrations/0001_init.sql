-- HelpID Supabase schema
-- Run in the Supabase SQL editor, or via `supabase db push`.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  blood_group text not null default '',
  address text not null default '',
  allergies text[] not null default '{}',
  medical_notes text[] not null default '{}',
  emergency_contacts jsonb not null default '[]'::jsonb,
  language text not null default 'en',
  last_updated timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Public keys are only readable/writable by the service role (edge functions).
create table if not exists public.public_keys (
  key text primary key,
  uid uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.public_keys enable row level security;

-- Optional: keep last_updated fresh when rows are updated outside the app.
create or replace function public.touch_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.last_updated = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_profile_updated_at();
