import { COLOR } from "@/lib/constants/theme";
import type { IntensityType } from "@/lib/types";

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

export const DISTANCE_NA_COLOR = COLOR.textMuted;
export const DISTANCE_SHORT_COLOR = COLOR.danger;
export const DISTANCE_STANDARD_COLOR = "#4d7c0f";
export const DISTANCE_LONG_COLOR = COLOR.accent;

export const AVG_DATE_MONTH_COLOR: Record<number, string> = {
  6: "#1d4ed8", // June — blue
  7: "#15803d", // July — green
  8: "#ea580c", // August — orange
  9: "#9333ea", // September — purple
  10: "#be185d", // October — pink
};

export const AVG_DATE_FALLBACK_COLOR = "#374151";

export const HIGHLIGHT_CELL_COLOR: Record<string, string> = {
  strongest: "#fda4af",
  first: "#93c5fd",
  last: "#fdba74",
  untracked: "#cbd5e1",
};

export const HIGHLIGHT_FALLBACK_COLOR = "#86efac";
export const HIGHLIGHT_EMPTY_CELL_COLOR = "#f1f5f9";

/** A position with no value at all, on any of the heatmaps. */
export const GRID_EMPTY_CELL_COLOR = "#e2e8f0";

export const RETIRED_REASON_COLOR: Record<string, string> = {
  destructive: COLOR.danger,
  language: "#9333ea",
  misspell: COLOR.warning,
  special: COLOR.textSecondary,
};

export const RETIRED_REASON_FALLBACK_COLOR = COLOR.danger;
