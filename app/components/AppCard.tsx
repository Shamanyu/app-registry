"use client";

import { useState, useCallback } from "react";
import { ExternalLink, Globe, Pencil } from "lucide-react";
import type { Project } from "@/lib/types";
import { getPreviewUrl } from "@/lib/preview";

interface AppCardProps {
  project: Project;
  large?: boolean;
  onEdit?: (project: Project) => void;
}

export function AppCard({ project, large = false, onEdit }: AppCardProps) {
  const [previewError, setPreviewError] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const hostname = (() => {
    try {
      return new URL(project.url).hostname.replace("www.", "");
    } catch {
      return project.url;
    }
  })();

  const baseUrl = getPreviewUrl(project.url, large ? 480 : 400);
  const previewUrl = baseUrl ? `${baseUrl}${retryKey > 0 ? `&_r=${retryKey}` : ""}` : "";
  const showPreview = previewUrl && !previewError;

  const handleError = useCallback(() => {
    if (retryKey === 0) {
      setPreviewLoaded(false);
      setRetryKey(1);
    } else {
      setPreviewError(true);
    }
  }, [retryKey]);

  return (
    <div className="relative">
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group relative flex flex-col overflow-hidden rounded-2xl
        bg-white/[0.03] backdrop-blur-md
        border border-white/[0.06] hover:border-cyan-500/30
        transition-all duration-300 ease-out
        hover:bg-white/[0.06] hover:shadow-xl hover:shadow-cyan-500/10
        active:scale-[0.99] hover:-translate-y-1
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400
        ${large ? "min-h-[280px] sm:min-h-[320px]" : "min-h-[260px] sm:min-h-[280px]"}
      `}
    >
      {/* Website preview thumbnail */}
      <div className={`relative w-full overflow-hidden ${large ? "h-36 sm:h-40" : "h-28 sm:h-32"}`}>
        {showPreview ? (
          <>
            {!previewLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 animate-pulse" />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={retryKey}
              src={previewUrl}
              alt={`${project.name} preview`}
              className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-300 ${
                previewLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
              onLoad={() => setPreviewLoaded(true)}
              onError={handleError}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-500/10 to-violet-500/10">
            <Globe className="w-10 h-10 text-cyan-400/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4 sm:p-5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {project.icon_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.icon_url}
                alt=""
                className={`rounded-lg object-cover flex-shrink-0 ring-1 ring-white/10 ${large ? "w-8 h-8" : "w-6 h-6"}`}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : null}
            <div className="min-w-0">
              <h3 className={`font-semibold text-white leading-tight truncate ${large ? "text-lg" : "text-base"}`}>
                {project.name}
              </h3>
              <p className="text-xs text-cyan-300/50 truncate mt-0.5">
                {project.owner ? `${project.owner} · ${hostname}` : hostname}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(project); }}
                className="p-1.5 rounded-lg text-white/30 hover:text-violet-400 hover:bg-white/10 transition-colors"
                aria-label="Edit app"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            <ExternalLink className="w-4 h-4 text-cyan-400/40 flex-shrink-0 transition-all group-hover:text-cyan-400 group-hover:translate-x-0.5" />
          </div>
        </div>

        <p className="text-white/55 leading-relaxed line-clamp-2 flex-1 text-sm">
          {project.description}
        </p>

        <div className="flex items-center gap-1.5 pt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
          <span className="text-xs text-emerald-400/70">Live</span>
        </div>
      </div>
    </a>
    </div>
  );
}
