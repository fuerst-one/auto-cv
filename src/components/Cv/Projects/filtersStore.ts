"use client";

import { create } from "zustand";
import { FilterParams } from "./Filter/utils";

export type FiltersState = {
  filters: FilterParams;
  setFilters: (next: FilterParams) => void;
  toggle: (key: string, value: string) => void;
  clearKey: (key: string) => void;
  reset: () => void;
};

export const useFiltersStore = create<FiltersState>((set, get) => ({
  filters: {
    featured: ["true"],
  },
  setFilters: (next) => set({ filters: next }),
  toggle: (key, value) => {
    const prev = get().filters;
    const existing = prev[key as keyof FilterParams] ?? [];
    const has = existing.includes(value);
    const updated = has
      ? existing.filter((v) => v !== value)
      : Array.from(new Set([...existing, value])).sort((a, b) =>
          a.localeCompare(b),
        );
    const next: FilterParams = { ...prev };
    if (updated.length) {
      next[key as keyof FilterParams] = updated;
    } else {
      delete next[key as keyof FilterParams];
    }
    // Drop default featured when any other filter is touched
    if (key !== "featured") {
      delete next.featured;
    }
    set({ filters: next });
  },
  clearKey: (key) => {
    const prev = get().filters;
    const next: FilterParams = { ...prev };
    delete next[key as keyof FilterParams];
    set({ filters: next });
  },
  reset: () => set({ filters: {} }),
}));
