"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Project } from "@/lib/types";
import { AppGrid } from "./AppGrid";
import { AddAppModal } from "./AddAppModal";
import { EditAppModal } from "./EditAppModal";
import { AppIcon } from "./AppIcon";

interface LaunchpadClientProps {
  projects: Project[];
}

export function LaunchpadClient({ projects }: LaunchpadClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050508]/80 backdrop-blur-xl">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 rounded-xl p-1 bg-gradient-to-br from-cyan-400/20 to-violet-500/20 border border-cyan-400/20">
              <AppIcon className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <span className="font-semibold text-white text-sm tracking-tight truncate bg-gradient-to-r from-cyan-200 to-violet-200 bg-clip-text text-transparent">
              App Registry
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline text-xs text-cyan-300/60 tabular-nums">
              {projects.length} {projects.length === 1 ? "app" : "apps"}
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 text-sm font-semibold
                bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400
                text-white transition-all duration-200 shadow-lg shadow-cyan-500/25
                hover:shadow-cyan-400/30 hover:-translate-y-0.5 active:translate-y-0
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="hidden xs:inline sm:inline">Add New App</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <AppGrid projects={projects} onEdit={(p) => setEditingProject(p)} />
      </main>

      <AddAppModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditAppModal project={editingProject} isOpen={!!editingProject} onClose={() => setEditingProject(null)} />
    </>
  );
}
