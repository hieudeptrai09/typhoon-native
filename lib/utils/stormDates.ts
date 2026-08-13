import type { Storm } from "@/lib/types";
import { daysBetween, parseStormDate } from "@/lib/utils/date";
import { getGroupedStorms } from "@/lib/utils/storms";

// Averaged storm timing: when a group's storms typically start, end, and how long they last.

// Dates are averaged as a day-of-year in a fixed non-leap reference year, so a
// 29/2 date collapses to 28/2 and the output can never land on 29/2 either.
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MONTH_OFFSET = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
const DAYS_IN_YEAR = 365;

const toDayOfYear = (month: number, date: number): number => {
  const clampedDate = Math.min(date, DAYS_IN_MONTH[month - 1]); // 29/2 → 28/2
  return MONTH_OFFSET[month - 1] + clampedDate;
};

const stormStartDoy = (s: Storm): number => {
  const start = parseStormDate(s.dateStart);
  return toDayOfYear(start.month, start.day);
};

// Today as a "YYYY-MM-DD" string, matching how storm dates travel. A storm with
// no end date is still active, so its end can only be later than today — today
// stands in for the missing end rather than dropping the storm from an average.
const today = (): string => {
  const now = new Date(Date.now());
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// A storm that crossed into the new year has its January end treated as "month
// 13": one full year later. This keeps a Dec→Jan storm's end after its start
// when averaging and measuring span.
const stormEndDoy = (s: Storm): number => {
  const start = parseStormDate(s.dateStart);
  const end = parseStormDate(s.dateEnd ?? today());
  const doy = toDayOfYear(end.month, end.day);
  return end.year > start.year ? doy + DAYS_IN_YEAR : doy;
};

// Wrap an averaged day-of-year (which may land past day 365 for new-year-spanning
// groups) back onto a real calendar date, so the output is never below 1/1.
const fromDayOfYear = (doy: number): { month: number; date: number } => {
  const wrapped = ((((Math.round(doy) - 1) % DAYS_IN_YEAR) + DAYS_IN_YEAR) % DAYS_IN_YEAR) + 1;
  for (let m = 0; m < 12; m++) {
    if (wrapped <= MONTH_OFFSET[m] + DAYS_IN_MONTH[m]) {
      return { month: m + 1, date: wrapped - MONTH_OFFSET[m] };
    }
  }
  return { month: 12, date: wrapped - MONTH_OFFSET[11] };
};

export interface AvgDates {
  startDoy: number; // -1 for an empty group
  endDoy: number; // -1 for an empty group
}

const average = (values: number[]): number =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : -1;

export const calculateAvgDates = (storms: Storm[]): AvgDates => ({
  startDoy: average(storms.map(stormStartDoy)),
  endDoy: average(storms.map(stormEndDoy)),
});

export const calculateAvgDatesByGroup = (
  stormsData: Storm[],
  groupBy: "position" | "name",
): Record<string, AvgDates> => {
  const grouped = getGroupedStorms(stormsData, groupBy);
  const result: Record<string, AvgDates> = {};
  Object.entries(grouped).forEach(([key, groupStorms]) => {
    result[key] = calculateAvgDates(groupStorms);
  });
  return result;
};

export const formatDayOfYear = (doy: number): string => {
  if (doy < 0) return "N/A";
  const { month, date } = fromDayOfYear(doy);
  return `${date}/${month}`;
};

// Calendar month (1–12) an averaged day-of-year falls in; -1 for an empty group.
export const getDoyMonth = (doy: number): number => (doy < 0 ? -1 : fromDayOfYear(doy).month);

// Average storm duration in whole days. An active storm counts its days so far,
// measured to today, on the same basis as its stand-in end date.
export const calculateAvgDuration = (storms: Storm[]): number => {
  const durations = storms
    .map((s) => daysBetween(s.dateStart, s.dateEnd ?? today()))
    .filter((v): v is number => v !== null);
  return average(durations);
};

export const formatDuration = (days: number): string => {
  if (days < 0) return "N/A";
  const rounded = Math.round(days);
  return `${rounded} ${rounded === 1 ? "day" : "days"}`;
};
