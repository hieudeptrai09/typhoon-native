import { MONTH_NAMES, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import type { Storm } from "@/lib/types";
import { getAvgDateColor, getDistanceColor } from "@/lib/utils/colors";
import { getPositionTitle } from "@/lib/utils/position";
import {
  calculateAverage,
  calculateGapAverage,
  formatDistance,
  getGroupedStorms,
  getIntensityFromNumber,
} from "@/lib/utils/storm/aggregate";
import {
  calculateAvgDates,
  calculateAvgDuration,
  formatDayOfYear,
  getDoyMonth,
} from "@/lib/utils/storm/dates";
import { getEffectiveMonth } from "@/lib/utils/storm/highlights";

// The naming list only starts here; earlier seasons are a few storms apiece.
export const YEAR_CUTOFF = 2000;

export interface StatRow {
  key: string;
  label: string;
  count: number;
  storms: Storm[];
  // Sorted and coloured by; -1 wherever the metric is not measurable.
  value: number;
  display: string;
  color: string;
  // Only the dates metric fills these.
  startDoy?: number;
  endDoy?: number;
  duration?: number;
  position?: number;
  country?: string;
}

export const groupStorms = (storms: Storm[], groupBy: string): Record<string, Storm[]> => {
  if (groupBy === "month") {
    const grouped: Record<string, Storm[]> = {};
    storms.forEach((storm) => {
      const month = getEffectiveMonth(storm);
      if (month === null) return;
      (grouped[String(month)] ??= []).push(storm);
    });
    return grouped;
  }

  const source = groupBy === "year" ? storms.filter((s) => s.year >= YEAR_CUTOFF) : storms;
  return getGroupedStorms(source, groupBy);
};

const labelOf = (key: string, groupBy: string): string => {
  if (groupBy === "position") return getPositionTitle(Number(key));
  if (groupBy === "month") return MONTH_NAMES[Number(key)];
  return key;
};

const measure = (
  metric: string,
  storms: Storm[],
): Pick<StatRow, "value" | "display" | "color" | "startDoy" | "endDoy" | "duration"> => {
  if (metric === "recurrence") {
    const gap = calculateGapAverage(storms);
    return { value: gap, display: formatDistance(gap), color: getDistanceColor(gap) };
  }

  if (metric === "dates") {
    const { startDoy, endDoy } = calculateAvgDates(storms);
    return {
      value: startDoy,
      display: `${formatDayOfYear(startDoy)} – ${formatDayOfYear(endDoy)}`,
      color: getAvgDateColor(getDoyMonth(startDoy)),
      startDoy,
      endDoy,
      duration: calculateAvgDuration(storms),
    };
  }

  const average = calculateAverage(storms);
  return {
    value: average,
    display: average.toFixed(2),
    color: TEXT_COLOR_WHITE_BACKGROUND[getIntensityFromNumber(average)],
  };
};

export const buildStatRows = (storms: Storm[], metric: string, groupBy: string): StatRow[] => {
  const rows = Object.entries(groupStorms(storms, groupBy)).map(([key, group]) => ({
    key,
    label: labelOf(key, groupBy),
    count: group.length,
    storms: group,
    position: groupBy === "country" ? undefined : (group[0]?.position ?? undefined),
    country: groupBy === "country" ? key : group[0]?.country,
    ...measure(metric, group),
  }));

  // Year and month read as a sequence, not a ranking, so they arrive in calendar order.
  if (groupBy === "year" || groupBy === "month") rows.sort((a, b) => Number(a.key) - Number(b.key));
  return rows;
};

export const statColorsByKey = (rows: StatRow[]): Record<string, string> =>
  Object.fromEntries(rows.map((row) => [row.key, row.color]));
