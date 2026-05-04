"use client";

import { create } from "zustand";

export type ProjectFocusState = {
  focusedProjectId: string | null;
  hoveredProjectId: string | null;
  setFocusedProjectId: (id: string | null) => void;
  setHoveredProjectId: (id: string | null) => void;
};

export const useProjectFocusStore = create<ProjectFocusState>((set) => ({
  focusedProjectId: null,
  hoveredProjectId: null,
  setFocusedProjectId: (id) => set({ focusedProjectId: id }),
  setHoveredProjectId: (id) => set({ hoveredProjectId: id }),
}));
