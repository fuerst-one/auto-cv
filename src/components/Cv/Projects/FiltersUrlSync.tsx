"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useFiltersStore } from "./filtersStore";
import { parseProjectSearchParams } from "./parseSearchParams";
import { FilterParams } from "./Filter/utils";

const filtersToSearchString = (filters: FilterParams) => {
  const params = new URLSearchParams();
  Object.entries(filters)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([key, values]) => {
      if (values?.length) params.set(key, values.join(","));
    });
  return params.toString();
};

export const FiltersUrlSync = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useFiltersStore((s) => s.filters);
  const setFilters = useFiltersStore((s) => s.setFilters);

  const lastSyncedSearchRef = useRef<string | null>(null);

  useEffect(() => {
    const urlSearch = searchParams.toString();
    const filtersSearch = filtersToSearchString(filters);

    if (urlSearch === filtersSearch) {
      lastSyncedSearchRef.current = urlSearch;
      return;
    }

    // First run, or URL changed externally (back/forward, link nav) — URL wins.
    if (
      lastSyncedSearchRef.current === null ||
      urlSearch !== lastSyncedSearchRef.current
    ) {
      lastSyncedSearchRef.current = urlSearch;
      setFilters(
        parseProjectSearchParams(Object.fromEntries(searchParams.entries())),
      );
      return;
    }

    // URL is in sync with the last reconciliation, so the store changed — push to URL.
    lastSyncedSearchRef.current = filtersSearch;
    router.replace(filtersSearch ? `${pathname}?${filtersSearch}` : pathname, {
      scroll: false,
    });
  }, [searchParams, filters, setFilters, pathname, router]);

  return null;
};
