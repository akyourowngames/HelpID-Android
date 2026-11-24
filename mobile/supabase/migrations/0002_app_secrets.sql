-- Server-only secrets. RLS is enabled with no policies, so only the
-- service role (edge functions) can read these values.
create table if not exists public.app_secrets (
  name text primary key,
  value text not null,
  created_at timestamptz not null default now()
);

alter table public.app_secrets enable row level security;

-- Generated in Postgres so the value never lives in the repo or chat.
insert into public.app_secrets (name, value)
values ('profile_jwt_secret', encode(gen_random_bytes(32), 'hex'))
on conflict (name) do nothing;
