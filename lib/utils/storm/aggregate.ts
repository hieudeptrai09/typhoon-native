import { INTENSITY_RANK } from "@/lib/constants";
import type { IntensityType, Storm } from "@/lib/types";

// The inverse of INTENSITY_RANK: turns an averaged rank back into the intensity it represents.
export const getIntensityFromNumber = (avgNumber: number): IntensityType => {
  const rounded = Math.round(avgNumber);
  if (rounded >= 5) return "5";
  if (rounded === 4) return "4";
  if (rounded === 3) return "3";
  if (rounded === 2) return "2";
  if (rounded === 1) return "1";
  if (rounded === 0) return "TS";
  if (rounded === -1) return "TD";
  if (rounded <= -2) return "NT";
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

export const calculateAverage = (storms: Storm[]): number => {
  const sum = storms.reduce((acc, s) => acc + INTENSITY_RANK[s.intensity], 0);
  return sum / storms.length;
};

// Average number of years between consecutive appearances; -1 when a single storm
// leaves no gap to measure, which 0 can't stand in for (a real same-year gap).
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
