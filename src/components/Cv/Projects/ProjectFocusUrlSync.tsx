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

  const lastSyncedRef = useRef<string | null>(null);

  useEffect(() => {
    const urlFocus = searchParams.get(FOCUS_PARAM);
    const storeFocus = focusedProjectId;

    if (urlFocus === storeFocus) {
      lastSyncedRef.current = urlFocus;
      return;
    }

    if (lastSyncedRef.current === null || urlFocus !== lastSyncedRef.current) {
      lastSyncedRef.current = urlFocus;
      setFocusedProjectId(urlFocus);
      return;
    }

    lastSyncedRef.current = storeFocus;
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
