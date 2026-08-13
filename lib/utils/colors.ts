import {
  AVG_DATE_FALLBACK_COLOR,
  AVG_DATE_MONTH_COLOR,
  DISTANCE_LONG_COLOR,
  DISTANCE_NA_COLOR,
  DISTANCE_SHORT_COLOR,
  DISTANCE_STANDARD_COLOR,
  HIGHLIGHT_CELL_COLOR,
  HIGHLIGHT_FALLBACK_COLOR,
  RETIRED_REASON_COLOR,
  RETIRED_REASON_FALLBACK_COLOR,
} from "@/lib/constants/colors";
import type { RetirementReason } from "@/lib/types";

// A negative gap means there is nothing to measure against, so 0 stays free to mean a real same-year gap.
export const getDistanceColor = (years: number): string => {
  if (years < 0) return DISTANCE_NA_COLOR;
  if (years < 6.0) return DISTANCE_SHORT_COLOR;
  if (years === 6.0) return DISTANCE_STANDARD_COLOR;
  return DISTANCE_LONG_COLOR;
};

export const getAvgDateColor = (month: number): string =>
  AVG_DATE_MONTH_COLOR[month] ?? AVG_DATE_FALLBACK_COLOR;

export const getHighlightCellColor = (highlightType: string): string =>
  HIGHLIGHT_CELL_COLOR[highlightType] ?? HIGHLIGHT_FALLBACK_COLOR;

interface NameStatus {
  isRetired: boolean;
  retirementReason?: RetirementReason;
  isExternal?: boolean;
}

export const getNameStatusColor = (name: NameStatus): string => {
  if (name.isExternal) return "#475569";
  if (name.retirementReason === "misspell") return "#d97706";
  if (name.isRetired) return "#dc2626";
  return "#059669";
};

export const getNameStatusBgColor = (name: NameStatus): string => {
  if (name.isExternal) return "#f1f5f9";
  if (name.retirementReason === "misspell") return "#fef3c7";
  if (name.isRetired) return "#fee2e2";
  return "#d1fae5";
};

export const getRetiredReasonColor = (reason?: RetirementReason): string =>
  (reason && RETIRED_REASON_COLOR[reason]) ?? RETIRED_REASON_FALLBACK_COLOR;
