-- Run this in Supabase SQL Editor to add the status_cache table
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
