-- Create the projects table
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamp with time zone default now() not null,
  name        text not null,
  url         text not null,
  description text not null,
  icon_url    text,
  owner       text
);

-- If table already exists, add owner column
alter table public.projects add column if not exists owner text;

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
