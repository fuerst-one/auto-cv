"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFiltersStore } from "../filtersStore";
import clsx from "clsx";
import { CvProject } from "@/server/notion/getCvProjects";
import { FilterParams, filterProjects } from "./utils";

const ARRAY_COLUMNS: (keyof FilterParams)[] = [
  "industries",
  "experiences",
  "tools",
  "languages",
];

type CliFilterKey =
  | "experiences"
  | "industries"
  | "projectType"
  | "tools"
  | "languages"
  | "featured";

type CliFilterOption = {
  value: string;
  count: number;
};

type CliFilterGroup = {
  key: CliFilterKey;
  label: string;
  options: CliFilterOption[];
};

const CLI_FILTER_GROUPS: Pick<CliFilterGroup, "key" | "label">[] = [
  {
    key: "featured",
    label: "Featured",
  },
  {
    key: "experiences",
    label: "Areas of expertise",
  },
  {
    key: "industries",
    label: "Industries",
  },
  {
    key: "projectType",
    label: "Project types",
  },
  {
    key: "tools",
    label: "Tools",
  },
  {
    key: "languages",
    label: "Languages",
  },
];

const CLI_FILTER_LABEL_LOOKUP = Object.fromEntries(
  CLI_FILTER_GROUPS.map(({ key, label }) => [key, label]),
) as Record<CliFilterKey, string>;

export const FilterSqlConsole = ({
  filterParams,
  projects,
}: {
  filterParams: FilterParams;
  projects: CvProject[];
}) => {
  const router = useRouter();
  const setFilters = useFiltersStore((s) => s.setFilters);
  const resetFilters = useFiltersStore((s) => s.reset);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = useId();

  const normalizedFilters = useMemo(
    () => normalizeFilters(filterParams),
    [filterParams],
  );

  const sqlStatement = useMemo(
    () => buildSqlStatement(normalizedFilters),
    [normalizedFilters],
  );

  const cliFilterGroups = useMemo(
    () => buildCliFilterGroups(projects),
    [projects],
  );

  const resultsCount = useMemo(
    () => filterProjects(projects, filterParams).length,
    [projects, filterParams],
  );

  const handleToggleValue = (key: CliFilterKey, optionValue: string) => {
    const nextFilters: NormalizedFilters = Object.fromEntries(
      Object.entries(normalizedFilters).map(([currentKey, values]) => [
        currentKey,
        [...values],
      ]),
    );

    const currentValues = nextFilters[key] ?? [];
    const isSelected = currentValues.includes(optionValue);

    if (isSelected) {
      nextFilters[key] = currentValues.filter((value) => value !== optionValue);
      if (!nextFilters[key]?.length) {
        delete nextFilters[key];
      }
    } else {
      nextFilters[key] = Array.from(
        new Set([...currentValues, optionValue]),
      ).sort((a, b) => a.localeCompare(b));
    }

    const params = new URLSearchParams();

    Object.entries(nextFilters).forEach(([paramKey, values]) => {
      if (!values.length) {
        return;
      }
      params.set(paramKey, values.join(","));
    });

    const search = params.toString();
    setFilters(nextFilters as unknown as FilterParams);
    router.replace(search ? `?${search}` : "/", { scroll: false });
  };

  const activeFilters = useMemo(() => {
    return Object.entries(normalizedFilters).flatMap(([key, values]) =>
      values.map((value) => ({
        key,
        label:
          CLI_FILTER_LABEL_LOOKUP[key as CliFilterKey] ??
          key.replace(/([a-z0-9])([A-Z])/g, "$1 $2"),
        value,
      })),
    );
  }, [normalizedFilters]);

  const loweredQuery = searchQuery.toLowerCase();

  return (
    <div className="border border-white/20 bg-black/85 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xs uppercase tracking-[0.3em] text-neutral-300">
            Project query console
          </h3>
          <span className="text-[0.65rem] text-neutral-500">SELECT mode</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="border border-white/30 bg-black px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-neutral-200">
            {resultsCount} results
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-2 border border-white/30 bg-black px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-neutral-200 transition hover:border-white hover:text-white"
            onClick={() => {
              resetFilters();
              router.replace("/", { scroll: false });
            }}
          >
            Reset filters
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 border border-white/30 bg-black px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-neutral-200 transition hover:border-white hover:text-white"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            aria-controls={panelId}
          >
            {isExpanded ? "Collapse" : "Expand"}
            <span
              className={clsx(
                "transition-transform",
                isExpanded ? "rotate-180" : "rotate-0",
              )}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>
        </div>
      </div>
      <div className="mt-4 border border-white/20 bg-black p-4 text-[0.8rem] leading-relaxed text-neutral-100">
        <span className="mr-2 text-neutral-500">&gt;</span>
        <pre className="inline whitespace-pre-wrap break-words text-neutral-100">
          {sqlStatement}
        </pre>
      </div>
      <div
        id={panelId}
        className={clsx("mt-5", !isExpanded && "hidden")}
        aria-hidden={!isExpanded}
      >
        {isExpanded && (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[0.7rem] uppercase tracking-[0.25em] text-neutral-400">
              <span>Active filters</span>
              <div className="flex flex-wrap gap-2">
                {activeFilters.length ? (
                  activeFilters.map(({ key, label, value }) => (
                    <span
                      key={`${key}-${value}`}
                      className="border border-white/40 bg-white/10 px-2 py-1 text-[0.65rem] text-neutral-100"
                    >
                      {label}: <span className="text-white">{value}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-neutral-500">None</span>
                )}
              </div>
            </div>
            <label className="block text-[0.65rem] uppercase tracking-[0.2em] text-neutral-400">
              Search dataset
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Filter values..."
                className="mt-2 w-full border border-white/20 bg-black px-3 py-2 text-sm text-neutral-100 outline-none transition focus:border-white"
              />
            </label>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {cliFilterGroups.map(({ key, label, options }) => {
                const activeValues = new Set(normalizedFilters[key] ?? []);
                const filteredOptions = options.filter((option) => {
                  if (!loweredQuery) {
                    return true;
                  }
                  if (activeValues.has(option.value)) {
                    return true;
                  }
                  return option.value.toLowerCase().includes(loweredQuery);
                });

                return (
                  <div
                    key={key}
                    className="border border-white/20 bg-black/60 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between text-[0.7rem] uppercase tracking-[0.3em] text-neutral-300">
                      <span>{label}</span>
                      <span className="text-neutral-500">
                        {activeValues.size > 0
                          ? `${activeValues.size} selected`
                          : "--"}
                      </span>
                    </div>
                    {filteredOptions.length ? (
                      <ul className="flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
                        {filteredOptions.map((option) => {
                          const isSelected = activeValues.has(option.value);
                          return (
                            <li key={`${key}-${option.value}`}>
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleValue(key, option.value)
                                }
                                className={clsx(
                                  "flex w-full items-center justify-between border px-3 py-2 text-sm transition",
                                  "border-white/20 bg-black text-neutral-100 hover:border-white",
                                  isSelected &&
                                    "border-white bg-white/10 text-white",
                                )}
                                aria-pressed={isSelected}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="text-neutral-200">
                                    {isSelected ? "▣" : "▢"}
                                  </span>
                                  <span className="whitespace-normal break-words text-left">
                                    {option.value}
                                  </span>
                                </span>
                                <span className="text-[0.65rem] text-neutral-500">
                                  {option.count}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-[0.7rem] text-neutral-500">
                        No matches
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const buildSqlStatement = (filters: NormalizedFilters) => {
  const entries = Object.entries(filters).filter(([, values]) => values.length);

  if (!entries.length) {
    return "SELECT *\nFROM projects;";
  }

  const whereClauses = entries.map(([key, values]) => {
    const column = formatColumnName(key);
    const formattedValues = values.map(formatSqlValue);
    const isArrayColumn = ARRAY_COLUMNS.includes(key as keyof FilterParams);

    if (isArrayColumn) {
      return `${column} && ARRAY[${formattedValues.join(", ")}]`;
    }

    if (formattedValues.length === 1) {
      return `${column} = ${formattedValues[0]}`;
    }

    return `${column} IN (${formattedValues.join(", ")})`;
  });

  return `SELECT *\nFROM projects\nWHERE ${whereClauses.join("\n  AND ")};`;
};

const buildCliFilterGroups = (projects: CvProject[]): CliFilterGroup[] => {
  return CLI_FILTER_GROUPS.map(({ key, label }) => ({
    key,
    label,
    options: buildOptionsForKey(projects, key),
  })).filter((group) => group.options.length > 0);
};

const buildOptionsForKey = (
  projects: CvProject[],
  key: CliFilterKey,
): CliFilterOption[] => {
  const counts = new Map<string, number>();

  projects.forEach((project) => {
    const value = project[key];

    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((item) => {
        const normalized = item.trim();
        if (!normalized) {
          return;
        }
        counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
      });
      return;
    }

    if (typeof value === "boolean") {
      const normalized = value.toString();
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
      return;
    }

    if (typeof value === "string" && value.trim()) {
      const normalized = value.trim();
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    }
  });

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => {
      if (b.count === a.count) {
        return a.value.localeCompare(b.value);
      }
      return b.count - a.count;
    });
};

type NormalizedFilters = Record<string, string[]>;

const normalizeFilters = (filters: FilterParams): NormalizedFilters => {
  return Object.fromEntries(
    Object.entries(filters)
      .filter(([, values]) => values && values.length)
      .map(([key, values]) => [key, Array.from(new Set(values)).sort()]),
  );
};

const formatColumnName = (column: string) => {
  return column
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/\s+/g, "_")
    .toLowerCase();
};

const formatSqlValue = (value: string) => {
  const lower = value.toLowerCase();
  if (lower === "true" || lower === "false") {
    return lower.toUpperCase();
  }
  const escaped = value.replace(/'/g, "''");
  return `'${escaped}'`;
};
