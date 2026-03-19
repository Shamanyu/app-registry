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
  statusMap: Record<string, boolean>;
}

export function LaunchpadClient({ projects, statusMap }: LaunchpadClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-stone-950/60 backdrop-blur-2xl">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0">
              <AppIcon className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <span className="font-semibold text-stone-100 text-sm tracking-tight truncate">
              App Registry
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline text-xs text-stone-500 tabular-nums">
              {projects.length} {projects.length === 1 ? "app" : "apps"}
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 text-sm font-medium
                bg-amber-600 hover:bg-amber-500 text-white transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0a09]"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="hidden xs:inline sm:inline">Add New App</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <AppGrid projects={projects} statusMap={statusMap} onEdit={(p) => setEditingProject(p)} />
      </main>

      <AddAppModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditAppModal project={editingProject} isOpen={!!editingProject} onClose={() => setEditingProject(null)} />
    </>
  );
}
