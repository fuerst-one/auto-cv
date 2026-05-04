"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useProjectFocusStore } from "./projectFocusStore";

const FOCUS_PARAM = "focus";

export const ProjectFocusUrlSync = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const focusedProjectId = useProjectFocusStore((s) => s.focusedProjectId);
  const setFocusedProjectId = useProjectFocusStore(
    (s) => s.setFocusedProjectId,
  );

  const previousUrlFocus = useRef<string | null>(searchParams.get(FOCUS_PARAM));

  useEffect(() => {
    const urlFocus = searchParams.get(FOCUS_PARAM);
    const storeFocus = focusedProjectId;

    if (urlFocus !== previousUrlFocus.current) {
      previousUrlFocus.current = urlFocus;
      if (urlFocus !== storeFocus) {
        setFocusedProjectId(urlFocus);
      }
      return;
    }

    if (urlFocus === storeFocus) {
      return;
    }

    previousUrlFocus.current = storeFocus;
    const next = new URLSearchParams(searchParams.toString());
    if (storeFocus) {
      next.set(FOCUS_PARAM, storeFocus);
    } else {
      next.delete(FOCUS_PARAM);
    }
    const search = next.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, {
      scroll: false,
    });
  }, [searchParams, focusedProjectId, setFocusedProjectId, pathname, router]);

  return null;
};
