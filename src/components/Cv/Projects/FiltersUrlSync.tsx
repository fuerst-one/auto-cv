"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useFiltersStore } from "./filtersStore";
import {
  parseProjectSearchParams,
  ProjectSearchParams,
} from "./parseSearchParams";

export const FiltersUrlSync = ({
  initialSearchParams,
}: {
  initialSearchParams: ProjectSearchParams;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useFiltersStore((s) => s.filters);
  const setFilters = useFiltersStore((s) => s.setFilters);

  // 1) Hydrate store from server-provided search params on mount
  useEffect(() => {
    setFilters(parseProjectSearchParams(initialSearchParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) When URL changes (back/forward), update store
  useEffect(() => {
    const fromUrl = parseProjectSearchParams(
      Object.fromEntries(searchParams.entries()) as ProjectSearchParams,
    );
    setFilters(fromUrl);
  }, [searchParams, setFilters]);

  // 3) When store changes (user interactions), update URL without scroll
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, values]) => {
      if (values?.length) params.set(key, values.join(","));
    });
    const search = params.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, {
      scroll: false,
    });
  }, [filters, pathname, router]);

  return null;
};
