"use client";

import React, { ReactNode, useState } from "react";

export const ProjectCollapse = ({ children }: { children: ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (isCollapsed) {
    return (
      <div>
        <button
          className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-[var(--font-plex)] uppercase tracking-[0.2em] text-slate-200 transition hover:border-emerald-400/50 hover:text-white print:hidden"
          onClick={() => setIsCollapsed(false)}
        >
          Show more projects
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
