import { getProjects } from "@/lib/supabase";
import { checkStatus } from "@/lib/status";
import { LaunchpadClient } from "@/app/components/LaunchpadClient";

export const revalidate = 0;

export default async function HomePage() {
  const projects = await getProjects();

  const statusMap: Record<string, boolean> = {};
  await Promise.all(
    projects.map(async (p) => {
      statusMap[p.id] = await checkStatus(p.url);
    })
  );

  return <LaunchpadClient projects={projects} statusMap={statusMap} />;
}
