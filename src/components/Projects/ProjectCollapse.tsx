"use client";

import React, { ReactNode, useState } from "react";

export const ProjectCollapse = ({ children }: { children: ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (isCollapsed) {
    return (
      <div>
        <button
          className="w-full border border-white/30 bg-black/60 px-4 py-3 text-center text-sm uppercase tracking-[0.2em] text-neutral-200 transition hover:border-white hover:text-white print:hidden"
          onClick={() => setIsCollapsed(false)}
        >
          Show more projects
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
