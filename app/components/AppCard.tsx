import { ExternalLink, Globe } from "lucide-react";
import type { Project } from "@/lib/types";

interface AppCardProps {
  project: Project;
  large?: boolean;
}

export function AppCard({ project, large = false }: AppCardProps) {
  const hostname = (() => {
    try {
      return new URL(project.url).hostname.replace("www.", "");
    } catch {
      return project.url;
    }
  })();

  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group relative flex flex-col gap-3 rounded-2xl border border-white/10
        bg-white/5 backdrop-blur-md p-6 transition-all duration-300
        hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-black/30
        hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
        ${large ? "min-h-[200px]" : "min-h-[160px]"}
      `}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {project.icon_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.icon_url}
              alt={`${project.name} icon`}
              className={`rounded-xl object-cover flex-shrink-0 ${large ? "w-12 h-12" : "w-9 h-9"}`}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
                const sibling = e.currentTarget.nextElementSibling as HTMLElement | null;
                if (sibling) sibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`
              rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center flex-shrink-0
              ${project.icon_url ? "hidden" : "flex"} ${large ? "w-12 h-12" : "w-9 h-9"}
            `}
          >
            <Globe className={large ? "w-6 h-6" : "w-4 h-4"} />
          </div>
          <div className="min-w-0">
            <h3
              className={`font-semibold text-white leading-tight truncate ${
                large ? "text-xl" : "text-base"
              }`}
            >
              {project.name}
            </h3>
            <p className="text-xs text-white/40 truncate mt-0.5">{hostname}</p>
          </div>
        </div>
        <ExternalLink
          className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5 transition-colors group-hover:text-white/60"
        />
      </div>

      {/* Description */}
      <p
        className={`text-white/60 leading-relaxed line-clamp-3 flex-1 ${
          large ? "text-sm" : "text-sm"
        }`}
      >
        {project.description}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-1.5 mt-auto pt-1">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
        <span className="text-xs text-white/30">Live</span>
      </div>
    </a>
  );
}
