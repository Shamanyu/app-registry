import { getProjects } from "@/lib/supabase";
import { LaunchpadClient } from "@/app/components/LaunchpadClient";

export const revalidate = 0;

export default async function HomePage() {
  const projects = await getProjects();

  return <LaunchpadClient projects={projects} />;
}
