# App Registry — Project Directory

A modern, dark-mode project directory built with **Next.js** (App Router), **Tailwind CSS**, and **Supabase**.

## Features

- Dynamic grid layout (large cards for 1–3 apps, standard grid for 4+)
- Glassmorphism card design with dark theme
- Add and edit apps via modals with server-side validation
- Data from Supabase with server-side rendering (homepage ISR, 5-minute revalidate)
- Fully responsive (1 column on mobile → 4 columns on desktop)
- **Outbound tracking**: card links go through `/go/[projectId]`, which logs a row in `project_opens` then redirects to the real URL
- **Relative popularity**: short labels on cards (e.g. New, Growing, Popular lately) — no raw view counts; tiers are computed vs other listings on the same directory
- **Sort order**: tiles ordered by **7-day opens** (highest first). Ties: **new listings** (added in the last 14 days with fewer than 3 opens in the last 7 days) rank above older listings with the same count, then **name A→Z**
- After a click is logged, the app calls `revalidatePath("/")` and refreshes the grid when you return to the tab (focus / visibility), so updates show up without waiting only on the 5-minute ISR window

## Getting Started

### 1. Supabase schema

In your [Supabase SQL Editor](https://supabase.com/dashboard), run the **full** file [`supabase/schema.sql`](./supabase/schema.sql). It defines `projects`, preview/status caches, **`project_opens`** (click log), RLS policies, and indexes.

If you already applied an older schema, add anything you’re missing — at minimum the **`project_opens`** block at the bottom of `schema.sql` — so outbound tracking works.

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in from [Project Settings → API](https://supabase.com/dashboard/project/_/settings/api):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (reads `projects`, resolves `/go` target URL) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only**: Storage uploads for previews, **inserts into `project_opens`**, and **aggregating opens** for the homepage (table has no public RLS policies) |

Without the service role key, redirects from `/go` still work, but popularity and sorting will not update.

### 3. Storage bucket (preview screenshots)

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
3. Add the environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (previews **and** `project_opens` / popularity)
4. Deploy — done!

## Project Structure

```
app/
  components/
    AppCard.tsx          # Card UI; link targets /go/[id]
    AppGrid.tsx          # Dynamic grid layout
    AddAppModal.tsx      # Register new app
    EditAppModal.tsx     # Edit existing app
    LaunchpadClient.tsx  # Header, modals, focus/visibility refresh for fresh data
  go/[id]/route.ts       # Log open + redirect; revalidatePath("/")
  actions.ts             # Server actions: register / update project
  layout.tsx
  page.tsx               # Fetches projects + popularity, status checks
lib/
  supabase.ts            # Anon client + getProjects()
  supabase-admin.ts      # Service-role client (server only)
  popularity.ts          # Open aggregates, labels, sort order
  types.ts               # TypeScript interfaces
  preview*.ts            # Preview URL / cache / storage
supabase/
  schema.sql             # Full database schema
```
