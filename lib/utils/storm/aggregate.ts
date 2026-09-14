import { INTENSITY_RANK, NAMING_LIST_FIRST_YEAR, SORTING_RANK } from "@/lib/constants";
import type { IntensityType, Storm } from "@/lib/types";

// The inverse of INTENSITY_RANK.
export const getIntensityFromNumber = (avgNumber: number): IntensityType => {
  const rounded = Math.round(avgNumber);
  if (rounded >= 5) return "5";
  if (rounded === 4) return "4";
  if (rounded === 3) return "3";
  if (rounded === 2) return "2";
  if (rounded === 1) return "1";
  if (rounded === 0) return "TS";
  if (rounded === -1) return "TD";
  if (rounded <= -2) return "MD";
  return "TD";
};

export const getGroupedStorms = (stormsData: Storm[], groupBy: string): Record<string, Storm[]> => {
  const grouped: Record<string, Storm[]> = {};
  stormsData.forEach((storm) => {
    const key = storm[groupBy as keyof Storm]?.toString() || "";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(storm);
  });
  return grouped;
};

export interface IntensityGroup {
  intensity: IntensityType;
  storms: Storm[];
}

export const getIntensityGroups = (storms: Storm[]): IntensityGroup[] =>
  Object.entries(getGroupedStorms(storms, "intensity"))
    .map(([intensity, groupStorms]) => ({
      intensity: intensity as IntensityType,
      storms: [...groupStorms].sort((a, b) => a.year - b.year),
    }))
    .sort((a, b) => SORTING_RANK[b.intensity] - SORTING_RANK[a.intensity]);

export const calculateAverage = (storms: Storm[]): number => {
  const sum = storms.reduce((acc, s) => acc + INTENSITY_RANK[s.intensity], 0);
  return sum / storms.length;
};

// -1 when a single storm leaves no gap to measure, which 0 can't stand in for: that is a real
// same-year gap.
export const calculateGapAverage = (storms: Storm[]): number => {
  const years = storms.map((s) => s.year).sort((a, b) => a - b);
  if (years.length <= 1) return -1;

  const gaps: number[] = [];
  for (let i = 1; i < years.length; i++) {
    gaps.push(years[i] - years[i - 1]);
  }
  return gaps.reduce((a, b) => a + b, 0) / gaps.length;
};

export const calculateDistances = (
  stormsData: Storm[],
  groupBy: "position" | "name",
): Record<string, number> => {
  const grouped = getGroupedStorms(stormsData, groupBy);
  const result: Record<string, number> = {};

  Object.entries(grouped).forEach(([key, groupStorms]) => {
    result[key] = calculateGapAverage(groupStorms);
  });

  return result;
};

export const formatDistance = (dist: number): string => (dist < 0 ? "N/A" : dist.toFixed(2));

export const sortNamesByFirstYear = (entries: [string, Storm[]][]): [string, Storm[]][] =>
  [...entries].sort(
    ([, aStorms], [, bStorms]) =>
      Math.min(...aStorms.map((s) => s.year)) - Math.min(...bStorms.map((s) => s.year)),
  );

export const isSeasonYear = (year: number): boolean => year >= NAMING_LIST_FIRST_YEAR;

export const getSeasonYears = (storms: Storm[]): number[] =>
  [...new Set(storms.map((storm) => storm.year))].filter(isSeasonYear).sort((a, b) => a - b);

export const getSeasonStorms = (storms: Storm[], year: number): Storm[] =>
  storms
    .filter((storm) => storm.year === year)
    .sort((a, b) => a.dateStart.localeCompare(b.dateStart));

export interface GroupSummary {
  count: number;
  average: number;
}

export const getGroupSummaries = (storms: Storm[], groupBy: string): Record<string, GroupSummary> =>
  Object.fromEntries(
    Object.entries(getGroupedStorms(storms, groupBy)).map(([key, group]) => [
      key,
      { count: group.length, average: calculateAverage(group) },
    ]),
  );
