import type { Project } from "@/lib/types";
import { AppCard } from "./AppCard";
import { AppIcon } from "./AppIcon";

interface AppGridProps {
  projects: Project[];
  statusMap: Record<string, boolean>;
  onEdit?: (project: Project) => void;
}

export function AppGrid({ projects, statusMap, onEdit }: AppGridProps) {
  const count = projects.length;

  if (count === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-32 text-center px-4">
        <div className="mb-8">
          <div className="w-20 h-20 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center">
            <AppIcon className="w-10 h-10 text-amber-500" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-stone-200 mb-2">
          No projects yet
        </h2>
        <p className="text-stone-500 text-sm max-w-sm mb-8">
          Add your first app to get started.
        </p>
        <div className="flex gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm text-stone-400 border border-white/10">Quick</span>
          <span className="px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm text-stone-400 border border-white/10">Simple</span>
        </div>
      </div>
    );
  }

  if (count <= 3) {
    return (
      <div
        className={`grid gap-5 ${
          count === 1 ? "grid-cols-1 max-w-lg" : count === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-3xl" : "grid-cols-1 sm:grid-cols-3"
        }`}
      >
        {projects.map((project) => (
          <AppCard key={project.id} project={project} live={statusMap[project.id]} large onEdit={onEdit} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {projects.map((project) => (
        <AppCard key={project.id} project={project} live={statusMap[project.id]} onEdit={onEdit} />
      ))}
    </div>
  );
}
