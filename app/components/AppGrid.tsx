import type { Project } from "@/lib/types";
import { AppCard } from "./AppCard";
import { AppIcon } from "./AppIcon";

interface AppGridProps {
  projects: Project[];
  onEdit?: (project: Project) => void;
}

export function AppGrid({ projects, onEdit }: AppGridProps) {
  const count = projects.length;

  if (count === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-32 text-center px-4">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 blur-2xl rounded-3xl" />
          <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-violet-500/15 border border-cyan-400/20 flex items-center justify-center">
            <AppIcon className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-200 to-violet-200 bg-clip-text text-transparent">
          No projects yet
        </h2>
        <p className="text-white/40 text-sm max-w-sm mb-8">
          Add your first app to get started. Your launchpad is waiting.
        </p>
        <div className="flex gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">Quick</span>
          <span className="px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-400/20">Simple</span>
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
          <AppCard key={project.id} project={project} large onEdit={onEdit} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {projects.map((project) => (
        <AppCard key={project.id} project={project} onEdit={onEdit} />
      ))}
    </div>
  );
}
