import type { IntensityType, RetirementReason } from "@/lib/types";

// --- Intensity badge colors ---

export const BACKGROUND_BADGE: Record<IntensityType, string> = {
  NT: "#CBD5E1",
  TD: "#00CCFF",
  TS: "#00FF00",
  STS: "#C0FFC0",
  1: "#FFFF00",
  2: "#FFCC00",
  3: "#FF6600",
  4: "#FF0000",
  5: "#CC00CC",
};

export const TEXT_COLOR_BADGE: Record<IntensityType, string> = {
  NT: "#334155",
  TD: "#003D4C",
  TS: "#005500",
  STS: "#004D26",
  1: "#666600",
  2: "#663300",
  3: "#3D1800",
  4: "#FFFFFF",
  5: "#FFFFFF",
};

export const TEXT_COLOR_WHITE_BACKGROUND: Record<IntensityType, string> = {
  NT: "#475569",
  TD: "#0099CC",
  TS: "#00AC00",
  STS: "#008844",
  1: "#999900",
  2: "#C98600",
  3: "#FF5500",
  4: "#DD0000",
  5: "#AA00AA",
};

// --- Distance colors ---

export const DISTANCE_NA_COLOR = "#6b7280";
export const DISTANCE_SHORT_COLOR = "#dc2626";
export const DISTANCE_STANDARD_COLOR = "#4d7c0f";
export const DISTANCE_LONG_COLOR = "#2563eb";

// A negative gap means there is nothing to measure against, so 0 stays free to mean a real same-year gap.
export const getDistanceColor = (years: number): string => {
  if (years < 0) return DISTANCE_NA_COLOR;
  if (years < 6.0) return DISTANCE_SHORT_COLOR;
  if (years === 6.0) return DISTANCE_STANDARD_COLOR;
  return DISTANCE_LONG_COLOR;
};

// --- Average-date month colors ---
export const AVG_DATE_MONTH_COLOR: Record<number, string> = {
  6: "#1d4ed8", // June — blue
  7: "#15803d", // July — green
  8: "#ea580c", // August — orange
  9: "#9333ea", // September — purple
  10: "#be185d", // October — pink
};

export const AVG_DATE_FALLBACK_COLOR = "#374151";

export const getAvgDateColor = (month: number): string =>
  AVG_DATE_MONTH_COLOR[month] ?? AVG_DATE_FALLBACK_COLOR;

// --- Highlights grid colors ---

export const HIGHLIGHT_CELL_CLASS: Record<string, string> = {
  strongest: "bg-rose-300",
  first: "bg-blue-300",
  last: "bg-orange-300",
  untracked: "bg-slate-300",
};

export const HIGHLIGHT_EMPTY_CELL_CLASS = "bg-gray-100";

export const getHighlightCellClass = (highlightType: string): string =>
  HIGHLIGHT_CELL_CLASS[highlightType] ?? "bg-green-300";

// --- Name status colors ---

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
