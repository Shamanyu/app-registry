import { getProjects } from "@/lib/supabase";
import { enrichProjectsWithPopularity, sortProjectsForGrid } from "@/lib/popularity";
import { checkStatus } from "@/lib/status";
import { LaunchpadClient } from "@/app/components/LaunchpadClient";

export const revalidate = 300; // ISR: cache 5 min for fast repeat visits

export default async function HomePage() {
  const { projects: enriched, opens7d } = await enrichProjectsWithPopularity(await getProjects());

  const statusMap: Record<string, boolean> = {};
  await Promise.all(
    enriched.map(async (p) => {
      statusMap[p.id] = await checkStatus(p.url);
    })
  );

  const projects = sortProjectsForGrid(enriched, opens7d, statusMap);

  return <LaunchpadClient projects={projects} statusMap={statusMap} />;
}
