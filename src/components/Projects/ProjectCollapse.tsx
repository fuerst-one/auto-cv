"use client";

import React, { ReactNode, useState } from "react";

export const ProjectCollapse = ({ children }: { children: ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (isCollapsed) {
    return (
      <div>
        <button
          className="mt-16 w-full rounded border px-2 py-1 text-center print:hidden"
          onClick={() => setIsCollapsed(false)}
        >
          Show More
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
