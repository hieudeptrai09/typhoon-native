import {
  AVG_DATE_FALLBACK_COLOR,
  AVG_DATE_MONTH_COLOR,
  DISTANCE_LONG_COLOR,
  DISTANCE_NA_COLOR,
  DISTANCE_SHORT_COLOR,
  DISTANCE_STANDARD_COLOR,
  GRID_EMPTY_CELL_COLOR,
  HIGHLIGHT_CELL_COLOR,
  HIGHLIGHT_FALLBACK_COLOR,
  RETIRED_REASON_COLOR,
  RETIRED_REASON_FALLBACK_COLOR,
  SEASON_PACE_AHEAD_COLOR,
  SEASON_PACE_BEHIND_COLOR,
  SEASON_PACE_EVEN_COLOR,
  STORM_COUNT_COLORS,
} from "@/lib/constants/colors";
import { COLOR } from "@/lib/constants/theme";
import type { RetirementReason } from "@/lib/types";

// A negative gap means there is nothing to measure against, so 0 stays free to mean a real same-year gap.
export const getDistanceColor = (years: number): string => {
  if (years < 0) return DISTANCE_NA_COLOR;
  if (years < 6.0) return DISTANCE_SHORT_COLOR;
  if (years === 6.0) return DISTANCE_STANDARD_COLOR;
  return DISTANCE_LONG_COLOR;
};

// The scale rides the top of the data: the busiest count takes the darker colour, one below it
// the lighter, and everything further down shares the lighter one.
const countStop = (count: number, maxCount: number): number => {
  const shift = Math.max(0, maxCount - STORM_COUNT_COLORS.length);
  return Math.min(STORM_COUNT_COLORS.length - 1, Math.max(0, count - 1 - shift));
};

export const getStormCountColor = (count: number, maxCount: number): string =>
  count <= 0 ? GRID_EMPTY_CELL_COLOR : STORM_COUNT_COLORS[countStop(count, maxCount)];

export const getAvgDateColor = (month: number): string =>
  AVG_DATE_MONTH_COLOR[month] ?? AVG_DATE_FALLBACK_COLOR;

export const getSeasonPaceColor = (delta: number): string => {
  if (delta > 0) return SEASON_PACE_AHEAD_COLOR;
  if (delta < 0) return SEASON_PACE_BEHIND_COLOR;
  return SEASON_PACE_EVEN_COLOR;
};

export const getHighlightCellColor = (highlightType: string): string =>
  HIGHLIGHT_CELL_COLOR[highlightType] ?? HIGHLIGHT_FALLBACK_COLOR;

interface NameStatus {
  isRetired: boolean;
  retirementReason?: RetirementReason;
  isExternal?: boolean;
}

export const getNameStatusColor = (name: NameStatus): string => {
  if (name.isExternal) return COLOR.textBody;
  if (name.retirementReason === "misspell") return COLOR.warning;
  if (name.isRetired) return COLOR.danger;
  return COLOR.success;
};

export const getNameStatusBgColor = (name: NameStatus): string => {
  if (name.isExternal) return COLOR.surfaceMuted;
  if (name.retirementReason === "misspell") return COLOR.warningSoft;
  if (name.isRetired) return COLOR.dangerSoft;
  return COLOR.successSoft;
};

export const getRetiredReasonColor = (reason?: RetirementReason): string =>
  (reason && RETIRED_REASON_COLOR[reason]) ?? RETIRED_REASON_FALLBACK_COLOR;
