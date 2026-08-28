import type { Storm } from "@/lib/types";
import { daysBetween, isLeapYear, monthDayOf, parseStormDate, todayISO } from "@/lib/utils/date";

export const eventYearOf = (storm: Storm, monthDay: string): number => {
  const { year } = parseStormDate(storm.dateStart);
  return monthDay >= monthDayOf(storm.dateStart) ? year : year + 1;
};

export const getStormStarts = (storms: Storm[], monthDay: string): Storm[] =>
  storms.filter((storm) => monthDayOf(storm.dateStart) === monthDay);

export const getStormEnds = (storms: Storm[], monthDay: string): Storm[] =>
  storms.filter((storm) => storm.dateEnd !== undefined && monthDayOf(storm.dateEnd) === monthDay);

const isActiveOn = (storm: Storm, monthDay: string): boolean => {
  const dateEnd = storm.dateEnd ?? todayISO();
  const startMonthDay = monthDayOf(storm.dateStart);
  const endMonthDay = monthDayOf(dateEnd);

  if (parseStormDate(dateEnd).year > parseStormDate(storm.dateStart).year) {
    return startMonthDay <= monthDay || monthDay <= endMonthDay;
  }
  return startMonthDay <= monthDay && monthDay <= endMonthDay;
};

const LEAP_DAY = "02-29";

const dayExistedFor = (storm: Storm, monthDay: string): boolean =>
  monthDay !== LEAP_DAY || isLeapYear(eventYearOf(storm, monthDay));

export const getActiveStorms = (storms: Storm[], monthDay: string): Storm[] =>
  storms.filter((storm) => isActiveOn(storm, monthDay) && dayExistedFor(storm, monthDay));

export interface SeasonGroup {
  year: number;
  storms: Storm[];
}

export const groupBySeason = (storms: Storm[]): SeasonGroup[] => {
  const seasons = new Map<number, Storm[]>();

  for (const storm of storms) {
    const group = seasons.get(storm.year);
    if (group) group.push(storm);
    else seasons.set(storm.year, [storm]);
  }

  return [...seasons.entries()]
    .map(([year, group]) => ({
      year,
      storms: [...group].sort((a, b) => a.dateStart.localeCompare(b.dateStart)),
    }))
    .sort((a, b) => a.year - b.year);
};

export interface DayOfStorm {
  day: number; // counting the first day of the storm as 1
  total: number | null; // null while the storm is still ongoing
}

export const getDayOfStorm = (storm: Storm, monthDay: string): DayOfStorm => ({
  day: (daysBetween(storm.dateStart, `${eventYearOf(storm, monthDay)}-${monthDay}`) ?? 0) + 1,
  total: storm.dateEnd ? (daysBetween(storm.dateStart, storm.dateEnd) ?? 0) + 1 : null,
});

export const hasStartedBy = (storm: Storm, monthDay: string): boolean =>
  parseStormDate(storm.dateStart).year < storm.year || monthDayOf(storm.dateStart) <= monthDay;

export const seasonMonthOf = (storm: Storm): number => {
  const { year, month } = parseStormDate(storm.dateStart);
  return year < storm.year ? 1 : month;
};

export interface SeasonMonth {
  month: number;
  storms: Storm[]; // in the order they formed
  toDate: number; // how many of them had started by the chosen date
}

export const getSeasonMonths = (storms: Storm[], monthDay: string): SeasonMonth[] => {
  const months = new Map<number, Storm[]>();

  for (const storm of storms) {
    const month = seasonMonthOf(storm);
    const group = months.get(month);
    if (group) group.push(storm);
    else months.set(month, [storm]);
  }

  return [...months.entries()]
    .map(([month, group]) => {
      const sorted = [...group].sort((a, b) => a.dateStart.localeCompare(b.dateStart));
      return {
        month,
        storms: sorted,
        toDate: sorted.filter((storm) => hasStartedBy(storm, monthDay)).length,
      };
    })
    .sort((a, b) => a.month - b.month);
};

export interface SeasonToDateRow {
  year: number;
  toDate: number;
  total: number;
  storms: Storm[];
}

export const NAMING_LIST_FIRST_YEAR = 2000;

const isJmaNumbered = (storm: Storm): boolean => storm.jmaNumber !== undefined;

export const getSeasonToDate = (storms: Storm[], monthDay: string): SeasonToDateRow[] =>
  groupBySeason(
    storms.filter((storm) => storm.year >= NAMING_LIST_FIRST_YEAR && isJmaNumbered(storm)),
  ).map(({ year, storms: season }) => ({
    year,
    toDate: season.filter((storm) => hasStartedBy(storm, monthDay)).length,
    total: season.length,
    storms: season,
  }));

export const isSeasonOngoing = (year: number): boolean => year >= parseStormDate(todayISO()).year;

export const averageToDate = (rows: SeasonToDateRow[]): number =>
  rows.length ? rows.reduce((sum, row) => sum + row.toDate, 0) / rows.length : 0;

export const averageTotal = (rows: SeasonToDateRow[]): number => {
  const finished = rows.filter((row) => !isSeasonOngoing(row.year));
  return finished.length ? finished.reduce((sum, row) => sum + row.total, 0) / finished.length : 0;
};
