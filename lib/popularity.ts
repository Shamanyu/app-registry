import type { PopularityInfo, PopularityKind, Project } from "./types";
import { getSupabaseAdmin } from "./supabase-admin";

const NEW_DAYS = 14;
const MIN_OPENS_FOR_COMPARE = 2;
const MIN_OPENS_POPULAR = 3;
const GROWTH_RATIO = 1.25;
const POPULAR_FRACTION = 0.7;

const HINTS: Record<PopularityKind, string> = {
  new: "Recently added — give it a look.",
  growing: "Opens are up compared to last week on this directory.",
  popular_lately: "One of the most-opened apps here recently.",
  often_opened: "Opened more than most listings here this week.",
  steady: "Getting regular opens alongside other apps here.",
};

function msDays(n: number) {
  return n * 86400000;
}

function isNewListing(createdAt: string, opens7d: number): boolean {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  return ageMs <= msDays(NEW_DAYS) && opens7d < MIN_OPENS_POPULAR;
}

function buildOpenMaps(
  rows: { project_id: string; opened_at: string }[]
): { opens7d: Record<string, number>; opensPrev7d: Record<string, number> } {
  const opens7d: Record<string, number> = {};
  const opensPrev7d: Record<string, number> = {};
  const now = Date.now();
  const start7 = now - msDays(7);
  const start14 = now - msDays(14);

  for (const row of rows) {
    const t = new Date(row.opened_at).getTime();
    if (t >= start7) {
      opens7d[row.project_id] = (opens7d[row.project_id] ?? 0) + 1;
    } else if (t >= start14) {
      opensPrev7d[row.project_id] = (opensPrev7d[row.project_id] ?? 0) + 1;
    }
  }

  return { opens7d, opensPrev7d };
}

function labelForProject(
  project: Project,
  opens7d: Record<string, number>,
  opensPrev7d: Record<string, number>,
  allProjects: Project[]
): PopularityInfo | null {
  const c7 = opens7d[project.id] ?? 0;
  const cPrev = opensPrev7d[project.id] ?? 0;

  if (isNewListing(project.created_at, c7)) {
    return { kind: "new", label: "New", hint: HINTS.new };
  }

  if (c7 < MIN_OPENS_FOR_COMPARE) {
    return null;
  }

  const counts = allProjects.map((p) => opens7d[p.id] ?? 0);
  const M = Math.max(0, ...counts);
  if (M < MIN_OPENS_FOR_COMPARE) {
    return null;
  }

  if (cPrev >= 1 && c7 >= cPrev * GROWTH_RATIO) {
    return { kind: "growing", label: "Growing", hint: HINTS.growing };
  }

  const popularThreshold = Math.max(MIN_OPENS_POPULAR, Math.ceil(POPULAR_FRACTION * M));
  if (c7 >= popularThreshold) {
    return { kind: "popular_lately", label: "Popular lately", hint: HINTS.popular_lately };
  }

  const ranked = allProjects
    .map((p) => ({ id: p.id, c: opens7d[p.id] ?? 0 }))
    .filter((x) => x.c > 0)
    .sort((a, b) => b.c - a.c);

  const rank = ranked.findIndex((x) => x.id === project.id);
  if (rank === -1) {
    return null;
  }

  const topHalfCount = Math.ceil(ranked.length / 2);
  const often = rank < topHalfCount;

  if (often) {
    return { kind: "often_opened", label: "Often opened", hint: HINTS.often_opened };
  }
  return { kind: "steady", label: "Steady", hint: HINTS.steady };
}

/** Higher 7d opens first; ties favor listings still in the "new" window; then name A→Z. */
export function compareProjectsByPopularity(
  a: Project,
  b: Project,
  opens7d: Record<string, number>
): number {
  const oa = opens7d[a.id] ?? 0;
  const ob = opens7d[b.id] ?? 0;
  if (ob !== oa) {
    return ob - oa;
  }
  const newA = isNewListing(a.created_at, oa);
  const newB = isNewListing(b.created_at, ob);
  if (newA && !newB) {
    return -1;
  }
  if (!newA && newB) {
    return 1;
  }
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

/** Live apps first; within each group, same order as {@link compareProjectsByPopularity}. */
export function sortProjectsForGrid(
  projects: Project[],
  opens7d: Record<string, number>,
  statusMap: Record<string, boolean>
): Project[] {
  return [...projects].sort((a, b) => {
    const liveA = statusMap[a.id] === true;
    const liveB = statusMap[b.id] === true;
    if (liveA !== liveB) {
      return liveA ? -1 : 1;
    }
    return compareProjectsByPopularity(a, b, opens7d);
  });
}

export async function enrichProjectsWithPopularity(
  projects: Project[]
): Promise<{ projects: Project[]; opens7d: Record<string, number> }> {
  if (projects.length === 0) {
    return { projects, opens7d: {} };
  }

  const emptyOpens: Record<string, number> = {};

  const admin = getSupabaseAdmin();
  if (!admin) {
    return {
      projects: projects.map((p) => ({ ...p, popularity: null })),
      opens7d: emptyOpens,
    };
  }

  const ids = projects.map((p) => p.id);
  const since = new Date(Date.now() - msDays(14)).toISOString();

  const { data, error } = await admin
    .from("project_opens")
    .select("project_id, opened_at")
    .in("project_id", ids)
    .gte("opened_at", since);

  if (error) {
    console.error("project_opens fetch error:", error);
    return {
      projects: projects.map((p) => ({ ...p, popularity: null })),
      opens7d: emptyOpens,
    };
  }

  const { opens7d, opensPrev7d } = buildOpenMaps(data ?? []);

  const enriched = projects.map((p) => ({
    ...p,
    popularity: labelForProject(p, opens7d, opensPrev7d, projects),
  }));

  return { projects: enriched, opens7d };
}
