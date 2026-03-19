import type { Project } from "@/lib/types";
import { AppCard } from "./AppCard";

interface AppGridProps {
  projects: Project[];
}

export function AppGrid({ projects }: AppGridProps) {
  const count = projects.length;

  if (count === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-32 text-center">
        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <svg
            className="w-9 h-9 text-white/20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white/60 mb-2">
          No projects yet
        </h2>
        <p className="text-white/30 text-sm max-w-xs">
          Click &ldquo;Add New App&rdquo; to register your first project in the directory.
        </p>
      </div>
    );
  }

  // 1–3 projects: large cards, up to 3 columns
  if (count <= 3) {
    return (
      <div
        className={`grid gap-5 ${
          count === 1
            ? "grid-cols-1 max-w-lg"
            : count === 2
            ? "grid-cols-1 sm:grid-cols-2 max-w-3xl"
            : "grid-cols-1 sm:grid-cols-3"
        }`}
      >
        {projects.map((project) => (
          <AppCard key={project.id} project={project} large />
        ))}
      </div>
    );
  }

  // 4+ projects: standard grid
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {projects.map((project) => (
        <AppCard key={project.id} project={project} />
      ))}
    </div>
  );
}
