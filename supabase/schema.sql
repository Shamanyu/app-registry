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
