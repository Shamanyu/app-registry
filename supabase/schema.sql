-- Create the projects table
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamp with time zone default now() not null,
  name        text not null,
  url         text not null,
  description text not null,
  icon_url    text,
  owner       text,
  preview_url text
);

-- If table already exists, add columns
alter table public.projects add column if not exists owner text;
alter table public.projects add column if not exists preview_url text;

-- Enable Row Level Security
alter table public.projects enable row level security;

-- Allow anyone to read projects (public directory)
create policy "Allow public read access"
  on public.projects
  for select
  using (true);

-- Allow anyone to insert projects (open registration)
create policy "Allow public insert access"
  on public.projects
  for insert
  with check (true);

-- Allow anyone to update projects (for editing)
create policy "Allow public update access"
  on public.projects
  for update
  using (true)
  with check (true);

-- Preview cache: shared DB cache for /api/preview (url -> storage URL + timestamp)
create table if not exists public.preview_cache (
  url         text not null,
  width       int not null default 400,
  preview_url text not null,
  created_at  timestamp with time zone default now() not null,
  primary key (url, width)
);

alter table public.preview_cache enable row level security;

create policy "Allow public read on preview_cache"
  on public.preview_cache for select using (true);

create policy "Allow public insert on preview_cache"
  on public.preview_cache for insert with check (true);

create policy "Allow public update on preview_cache"
  on public.preview_cache for update using (true) with check (true);

-- Status cache: shared DB cache for live/offline checks (url -> live + timestamp)
create table if not exists public.status_cache (
  url         text primary key,
  live        boolean not null,
  created_at  timestamp with time zone default now() not null
);

alter table public.status_cache enable row level security;

create policy "Allow public read on status_cache"
  on public.status_cache for select using (true);

create policy "Allow public insert on status_cache"
  on public.status_cache for insert with check (true);

create policy "Allow public update on status_cache"
  on public.status_cache for update using (true) with check (true);

-- Outbound click log (inserts from Next.js server via service role only)
create table if not exists public.project_opens (
  id          uuid primary key default gen_random_uuid(),
  opened_at   timestamp with time zone default now() not null,
  project_id  uuid not null references public.projects (id) on delete cascade
);

create index if not exists project_opens_project_time
  on public.project_opens (project_id, opened_at desc);

alter table public.project_opens enable row level security;
-- No policies: anon cannot read/write; service role bypasses RLS for inserts.
