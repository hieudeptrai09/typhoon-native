import type { DashboardParams } from "@/lib/types";
import { INTENSITY_SLUGS_BY_STRENGTH, intensityFromSlug } from "@/lib/utils/storm/intensity";

export const VIEWS = ["all", "records", "stats"] as const;

export const STATS_METRICS = ["intensity", "recurrence", "dates"] as const;

const VIEW_FILTERS: Record<string, string[]> = {
  all: ["position", "name"],
  records: ["strongest", "first", "last", ...INTENSITY_SLUGS_BY_STRENGTH],
  stats: ["position", "name", "country", "year", "month"],
};

// Groupings a metric can actually be computed over, rather than every grouping the view offers.
const METRIC_GROUPS: Record<string, string[]> = {
  intensity: ["position", "name", "country", "year", "month"],
  recurrence: ["position", "name"],
  dates: ["position", "name", "country", "year"],
};

const DEFAULT_FILTER: Record<string, string> = {
  all: "position",
  records: "strongest",
  stats: "position",
};

// The heatmap and the names pager are both laid out on the naming table, so only those two
// groupings have a grid to draw into. Country, year and month have nowhere to go but a list.
const GRIDDABLE_GROUPS = new Set(["position", "name"]);

export const isKnownView = (view: string): boolean => VIEW_FILTERS[view] !== undefined;

export const filtersForView = (view: string, metric: string): string[] =>
  view === "stats" ? (METRIC_GROUPS[metric] ?? []) : (VIEW_FILTERS[view] ?? []);

export const hasGrid = (view: string, filter: string): boolean =>
  view !== "stats" || GRIDDABLE_GROUPS.has(filter);

// The storms list is a flat run of storms, which is what "by name" already means. Grouping by
// position has nothing to list that the grid does not say better, so the pairing does not exist.
export const hasList = (view: string, filter: string): boolean =>
  view !== "all" || filter === "name";

/**
 * Why an option is offered but cannot be picked. Returning the reason rather than hiding the
 * option is the point: a control that silently changes shape between views reads as a bug.
 */
export const groupBlockedReason = (
  view: string,
  metric: string,
  filter: string,
  mode: string,
): string | null => {
  if (view === "all") {
    return mode === "list" && !hasList(view, filter) ? "Not available in the list layout" : null;
  }
  if (view !== "stats" || METRIC_GROUPS[metric]?.includes(filter)) return null;
  return "Not available for this metric";
};

export const layoutBlockedReason = (view: string, filter: string, mode: string): string | null => {
  const available = mode === "list" ? hasList(view, filter) : hasGrid(view, filter);
  return available ? null : "Not available for this grouping";
};

/** The one place params are made legal, so no caller has to know which pairings exist. */
export const normalizeParams = ({
  view,
  metric,
  filter,
  mode,
}: DashboardParams): DashboardParams => {
  const safeView = isKnownView(view) ? view : "all";
  const safeMetric =
    safeView === "stats" ? (METRIC_GROUPS[metric] ? metric : STATS_METRICS[0]) : "";

  const allowed = filtersForView(safeView, safeMetric);
  const fallback = DEFAULT_FILTER[safeView];
  const safeFilter = allowed.includes(filter)
    ? filter
    : allowed.includes(fallback)
      ? fallback
      : allowed[0];

  const wantsList = mode === "list";
  const safeMode =
    wantsList && hasList(safeView, safeFilter)
      ? "list"
      : hasGrid(safeView, safeFilter)
        ? "table"
        : "list";

  return { view: safeView, metric: safeMetric, filter: safeFilter, mode: safeMode };
};

export const paramsForView = (view: string): DashboardParams =>
  normalizeParams({
    view,
    metric: STATS_METRICS[0],
    filter: DEFAULT_FILTER[view] ?? "",
    mode: "table",
  });
