import { FilterParams } from "@/components/Cv/Projects/Filter/utils";
import {
  ApiFilterParams,
  SORT_ORDERS,
  SortOrder,
  isValidIsoDate,
} from "./filterCvProjects";

const CATEGORICAL_KEYS = [
  "tools",
  "industries",
  "experiences",
  "languages",
  "projectType",
  "workplace",
  "featured",
] as const;

type CategoricalKey = (typeof CATEGORICAL_KEYS)[number];

export type ParseResult =
  | { ok: true; params: ApiFilterParams }
  | { ok: false; error: string; param: string; expected: string };

export const parseListParams = (searchParams: URLSearchParams): ParseResult => {
  const categorical: FilterParams = {};
  for (const key of CATEGORICAL_KEYS) {
    const values = collectValues(searchParams, key);
    if (values.length) {
      const validation = validateCategorical(key, values);
      if (!validation.ok) return validation;
      categorical[key] = values;
    }
  }

  const clientIds = collectValues(searchParams, "clientId");

  const from = searchParams.get("from");
  if (from && !isValidIsoDate(from)) {
    return invalid("from", "ISO date YYYY-MM-DD");
  }
  const to = searchParams.get("to");
  if (to && !isValidIsoDate(to)) {
    return invalid("to", "ISO date YYYY-MM-DD");
  }

  const sortRaw = searchParams.get("sort");
  if (sortRaw && !SORT_ORDERS.includes(sortRaw as SortOrder)) {
    return invalid("sort", `one of ${SORT_ORDERS.join("|")}`);
  }
  const sort: SortOrder = (sortRaw as SortOrder | null) ?? "wow";

  const query = (searchParams.get("q") ?? "").trim() || null;

  return {
    ok: true,
    params: { categorical, clientIds, query, from, to, sort },
  };
};

const collectValues = (
  searchParams: URLSearchParams,
  key: string,
): string[] => {
  const raw = searchParams.getAll(key);
  if (!raw.length) return [];
  const split = raw.flatMap((value) => value.split(","));
  return Array.from(new Set(split.map((v) => v.trim()).filter(Boolean)));
};

const validateCategorical = (
  key: CategoricalKey,
  values: string[],
): ParseResult => {
  if (key === "featured") {
    if (values.some((v) => v !== "true" && v !== "false")) {
      return invalid("featured", "true or false");
    }
  }
  return { ok: true, params: {} as ApiFilterParams };
};

const invalid = (param: string, expected: string): ParseResult => ({
  ok: false,
  error: `Invalid value for "${param}"`,
  param,
  expected,
});
