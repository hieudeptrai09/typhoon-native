import type { DashboardParams } from "@/lib/types";
import { INTENSITY_SLUGS_BY_STRENGTH } from "@/lib/utils/intensity";

const VALID_FILTERS: Record<string, string[]> = {
  all: ["position", "name"],
  highlights: ["strongest", "first", "last"],
  intensity: INTENSITY_SLUGS_BY_STRENGTH,
  average: ["position", "name", "country", "year", "month"],
  recurrence: ["position", "name"],
  avgdate: ["position", "name", "country", "year"],
  calendar: ["started", "ended", "active", "todate"],
};

// Filters with no grid of their own: they only ever render as a list.
const LIST_ONLY_FILTERS: Record<string, string[]> = {
  average: ["country", "month", "year"],
  avgdate: ["country", "year"],
  calendar: ["started", "ended", "active", "todate"],
};

export const DEFAULT_FILTER: Record<string, string> = {
  all: "position",
  highlights: "strongest",
  intensity: "md",
  average: "position",
  recurrence: "position",
  avgdate: "position",
  calendar: "started",
};

// Every URL is /storms/<view>/<filter>/[list]/
export const isValidStormsSlug = (slug: string[]): boolean => {
  const [first, second, third] = slug;

  if (slug.length === 2) {
    const validFilters = VALID_FILTERS[first];
    if (!validFilters) return false;
    return validFilters.includes(second);
  }
  if (slug.length === 3) {
    const validFilters = VALID_FILTERS[first];
    if (!validFilters || !validFilters.includes(second)) return false;
    return third === "list";
  }
  return false;
};

export const isListOnly = (view: string, filter: string): boolean =>
  LIST_ONLY_FILTERS[view]?.includes(filter) ?? false;

export const isGridOnly = (view: string, filter: string): boolean =>
  view === "all" && filter === "position";

export const paramsForView = (view: string): DashboardParams => {
  const filter = DEFAULT_FILTER[view] ?? "";
  return { view, filter, mode: isListOnly(view, filter) ? "list" : "table" };
};

export const paramsForFilter = (view: string, filter: string, mode: string): DashboardParams => {
  if (isGridOnly(view, filter)) return { view, filter, mode: "table" };
  if (isListOnly(view, filter)) return { view, filter, mode: "list" };
  return { view, filter, mode };
};

export const slugToParams = (slug: string[]): DashboardParams => {
  const [view, filter, third] = slug;

  let mode = third === "list" ? "list" : "table";
  if (isGridOnly(view, filter)) mode = "table";
  if (isListOnly(view, filter)) mode = "list";

  return { view, mode, filter };
};

export const paramsToPath = (params: DashboardParams): string => {
  const { view, mode, filter } = params;

  const base = `/storms/${view}/${filter}/`;
  return mode === "list" ? `${base}list/` : base;
};

export const slugToPath = (slug: string[]): string => `/storms/${slug.join("/")}/`;

const ALL_SLUGS: string[][] = [
  ...Object.entries(VALID_FILTERS).flatMap(([view, filters]) =>
    filters.flatMap((filter) => [
      [view, filter],
      [view, filter, "list"],
    ]),
  ),
];

// Non-canonical slugs redirect, so prerendering them would only cache the redirect.
export const getCanonicalStormsSlugs = (): string[][] =>
  ALL_SLUGS.filter((slug) => paramsToPath(slugToParams(slug)) === slugToPath(slug));

export type LegendKind = "intensity" | "recurrence" | "avgdate" | "highlight" | null;

// Which legend a view/mode pairing needs is decided by the same params that pick the view itself.
export const getLegendKind = ({ view, mode, filter }: DashboardParams): LegendKind => {
  switch (view) {
    case "recurrence":
      return "recurrence";
    case "avgdate":
      return "avgdate";
    case "calendar":
      return filter === "todate" ? null : "intensity";
    case "highlights":
      return mode === "list" ? "intensity" : "highlight";
    case "intensity":
    case "average":
      return "intensity";
    case "all":
      return mode === "list" && filter === "name" ? "intensity" : null;
    default:
      return null;
  }
};
