import {
  AVG_DATE_FALLBACK_COLOR,
  AVG_DATE_MONTH_COLOR,
  DISTANCE_LONG_COLOR,
  DISTANCE_NA_COLOR,
  DISTANCE_SHORT_COLOR,
  DISTANCE_STANDARD_COLOR,
  HIGHLIGHT_CELL_CLASS,
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

export const getHighlightCellClass = (highlightType: string): string =>
  HIGHLIGHT_CELL_CLASS[highlightType] ?? "bg-green-300";

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

export const getNameStatusColorClass = (name: NameStatus): string => {
  if (name.isExternal) return "text-slate-600";
  if (name.retirementReason === "misspell") return "text-amber-600";
  if (name.isRetired) return "text-red-600";
  return "text-emerald-600";
};

export const getNameStatusBgClass = (name: NameStatus): string => {
  if (name.isExternal) return "bg-slate-100";
  if (name.retirementReason === "misspell") return "bg-amber-100";
  if (name.isRetired) return "bg-red-100";
  return "bg-emerald-100";
};

export const getRetiredReasonColorClass = (reason?: RetirementReason): string => {
  switch (reason) {
    case "destructive":
      return "text-red-600";
    case "language":
      return "text-purple-600";
    case "misspell":
      return "text-amber-600";
    case "special":
      return "text-foreground";
    default:
      return "text-red-600";
  }
};
