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
  created_at timestamptz not null default now()
);

alter table public.documents enable row level security;

drop policy if exists "Allow service role full access" on public.documents;

create policy "Allow service role full access"
on public.documents
for all
to service_role
using (true)
with check (true);

-- Create the private storage bucket in the Supabase SQL editor if it does not already exist:
-- insert into storage.buckets (id, name, public)
-- values ('documents', 'documents', false)
-- on conflict (id) do nothing;