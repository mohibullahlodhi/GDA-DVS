create table if not exists public.documents (
  id text primary key,
  department text not null,
  title text not null,
  recipient_name text,
  issue_date date,
  expiry_date date,
  storage_path text not null,
  mime_type text not null,
  file_size bigint not null,
  original_file_name text,
  processed_file_name text,
  processed_by uuid,
  created_at timestamptz not null default now()
);

create extension if not exists pgcrypto;

create table if not exists public.officers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text not null unique,
  full_name text not null,
  designation text not null,
  department text not null,
  role text not null default 'officer',
  confirmed boolean not null default false,
  approved boolean not null default false,
  approved_at timestamptz,
  approved_by uuid,
  created_at timestamptz not null default now(),
  constraint officers_role_check check (role in ('admin', 'officer'))
);

create unique index if not exists officers_user_id_unique on public.officers (user_id) where user_id is not null;
create index if not exists officers_role_idx on public.officers (role);
create index if not exists officers_approved_idx on public.officers (approved);

create table if not exists public.officer_logins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text not null,
  full_name text,
  role text not null default 'officer',
  login_status text not null default 'approved',
  ip_address text,
  browser text,
  operating_system text,
  device_type text,
  user_agent text,
  created_at timestamptz not null default now(),
  constraint officer_logins_role_check check (role in ('admin', 'officer'))
);

create index if not exists officer_logins_user_id_idx on public.officer_logins (user_id);
create index if not exists officer_logins_created_at_idx on public.officer_logins (created_at desc);

alter table public.documents enable row level security;
alter table public.officers enable row level security;
alter table public.officer_logins enable row level security;

drop policy if exists "Allow service role full access" on public.documents;
drop policy if exists "Allow service role full access" on public.officers;
drop policy if exists "Allow service role full access" on public.officer_logins;

create policy "Allow service role full access"
on public.documents
for all
to service_role
using (true)
with check (true);

create policy "Allow service role full access"
on public.officers
for all
to service_role
using (true)
with check (true);

create policy "Allow service role full access"
on public.officer_logins
for all
to service_role
using (true)
with check (true);

-- Create the private storage bucket in the Supabase SQL editor if it does not already exist:
-- insert into storage.buckets (id, name, public)
-- values ('documents', 'documents', false)
-- on conflict (id) do nothing;