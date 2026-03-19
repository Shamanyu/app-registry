"use client";

import { useState } from "react";
import { Plus, LayoutGrid } from "lucide-react";
import type { Project } from "@/lib/types";
import { AppGrid } from "./AppGrid";
import { AddAppModal } from "./AddAppModal";

interface LaunchpadClientProps {
  projects: Project[];
}

export function LaunchpadClient({ projects }: LaunchpadClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-black/30 backdrop-blur-xl">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <LayoutGrid className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white text-sm tracking-tight">
              App Registry
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-white/30 tabular-nums">
              {projects.length} {projects.length === 1 ? "app" : "apps"}
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium
                bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg
                shadow-indigo-900/30 focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-indigo-500"
            >
              <Plus className="w-4 h-4" />
              <span>Add New App</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <AppGrid projects={projects} />
      </main>

      <AddAppModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
