"use client";

import React, { ReactNode, useState } from "react";

export const ProjectCollapse = ({ children }: { children: ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (isCollapsed) {
    return (
      <div>
        <button
          className="w-full rounded border px-2 py-1 text-center hover:bg-gray-100 print:hidden"
          onClick={() => setIsCollapsed(false)}
        >
          Show more projects
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
