"use client";

import { useState, useCallback } from "react";
import { ExternalLink, Globe, Pencil } from "lucide-react";
import type { Project } from "@/lib/types";
import { getPreviewUrl } from "@/lib/preview";

interface AppCardProps {
  project: Project;
  live?: boolean;
  large?: boolean;
  onEdit?: (project: Project) => void;
  fetchPriority?: "high" | "low" | "auto";
}

export function AppCard({ project, live = false, large = false, onEdit, fetchPriority = "auto" }: AppCardProps) {
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

  const storedPreview = project.preview_url;
  const apiPreview = getPreviewUrl(project.url, large ? 480 : 400);
  const previewUrl = storedPreview
    ? storedPreview
    : apiPreview
      ? `${apiPreview}${retryKey > 0 ? `&_r=${retryKey}` : ""}`
      : "";
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
        bg-white/5 backdrop-blur-xl border border-white/10
        hover:border-amber-500/30 hover:bg-white/10
        transition-all duration-200
        active:scale-[0.99] hover:-translate-y-0.5
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0a09]
        ${large ? "min-h-[280px] sm:min-h-[320px]" : "min-h-[260px] sm:min-h-[280px]"}
      `}
    >
      {/* Website preview thumbnail */}
      <div className={`relative w-full overflow-hidden ${large ? "h-36 sm:h-40" : "h-28 sm:h-32"}`}>
        {showPreview ? (
          <>
            {!previewLoaded && (
              <div className="absolute inset-0 bg-stone-800/50 animate-pulse" />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={retryKey}
              src={previewUrl}
              alt={`${project.name} preview`}
              className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-300 ${
                previewLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading={fetchPriority === "high" ? "eager" : "lazy"}
              {...(fetchPriority !== "auto" && { fetchPriority })}
              onLoad={() => setPreviewLoaded(true)}
              onError={handleError}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-800/50">
            <Globe className="w-10 h-10 text-stone-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none" />
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
                className={`rounded-lg object-cover flex-shrink-0 ring-1 ring-white/20 ${large ? "w-8 h-8" : "w-6 h-6"}`}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : null}
            <div className="min-w-0">
              <h3 className={`font-semibold text-stone-100 leading-tight truncate ${large ? "text-lg" : "text-base"}`}>
                {project.name}
              </h3>
              <p className="text-xs text-stone-500 truncate mt-0.5">
                {project.owner ? `${project.owner} · ${hostname}` : hostname}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(project); }}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-white/10 transition-colors"
                aria-label="Edit app"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            <ExternalLink className="w-4 h-4 text-stone-500 flex-shrink-0 transition-all group-hover:text-amber-400 group-hover:translate-x-0.5" />
          </div>
        </div>

        <p className="text-stone-400 leading-relaxed line-clamp-2 flex-1 text-sm">
          {project.description}
        </p>

        <div className="flex items-center gap-1.5 pt-1">
          {live ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-emerald-400/90">Live</span>
            </>
          ) : (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-red-500/80" />
              <span className="text-xs text-red-400/90">Offline</span>
            </>
          )}
        </div>
      </div>
    </a>
    </div>
  );
}
