# App Registry — Project Directory

A modern, dark-mode project directory built with **Next.js 15** (App Router), **Tailwind CSS**, and **Supabase**.

## Features

- Dynamic grid layout (large cards for 1–3 apps, standard grid for 4+)
- Glassmorphism card design with dark theme
- Add new apps via a modal form with server-side validation
- Real-time data from Supabase with server-side rendering
- Fully responsive (1 column on mobile → 4 columns on desktop)
- Relative popularity hints on each card (from outbound clicks via `/go/[id]`, no raw counts)

## Getting Started

### 1. Create the Supabase table

In your [Supabase SQL Editor](https://supabase.com/dashboard), run the schema from `supabase/schema.sql`:

```sql
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamp with time zone default now() not null,
  name        text not null,
  url         text not null,
  description text not null,
  icon_url    text
);

alter table public.projects enable row level security;

create policy "Allow public read access"  on public.projects for select using (true);
create policy "Allow public insert access" on public.projects for insert with check (true);
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase project URL, anon key, and **service role key** (for storing preview screenshots and logging outbound clicks) from:
`https://supabase.com/dashboard/project/<id>/settings/api`

The `project_opens` table (in `supabase/schema.sql`) records clicks through `/go/[id]`; the service role is required because that table has no public RLS policies.

### 3. Create Storage bucket (for preview screenshots)

In Supabase Dashboard: **Storage** → **New bucket** → Name: `project-previews`, Public: **Yes**

### 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Import into [Vercel](https://vercel.com).
3. Add the environment variables in Vercel's project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for storing preview screenshots)
4. Deploy — done!

## Project Structure

```
app/
  components/
    AppCard.tsx          # Individual project card
    AppGrid.tsx          # Dynamic grid layout
    AddAppModal.tsx      # Modal form for registering apps
    LaunchpadClient.tsx  # Client shell (header + modal state)
  actions.ts             # Server Action: registerProject()
  layout.tsx
  page.tsx               # Server Component: fetches projects
lib/
  supabase.ts            # Supabase client + getProjects()
  types.ts               # TypeScript interfaces
supabase/
  schema.sql             # Database schema
```
