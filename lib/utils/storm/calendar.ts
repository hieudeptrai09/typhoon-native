import type { Storm } from "@/lib/types";
import {
  dayIndexOf,
  DAYS_OF_YEAR,
  daysBetween,
  isLeapYear,
  monthDayOf,
  parseDateParts,
  parseStormDate,
  todayISO,
  toMonthDay,
} from "@/lib/utils/date";

export const NAMING_LIST_FIRST_YEAR = 2000;

// The naming list begins in 2000. What sits before it is a handful of storms that wandered in from
// another basin, with no season of their own, so every day-of-year view counts from 2000 on.
const namingEra = (storms: Storm[]): Storm[] =>
  storms.filter((storm) => storm.year >= NAMING_LIST_FIRST_YEAR);

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

const isJmaNumbered = (storm: Storm): boolean => storm.jmaNumber !== undefined;

export const getSeasonToDate = (storms: Storm[], monthDay: string): SeasonToDateRow[] =>
  groupBySeason(namingEra(storms).filter(isJmaNumbered)).map(({ year, storms: season }) => ({
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

export type DayEventKind = "started" | "ended" | "active";

// A storm can both form and dissipate on the same day of the year; null means it was already
// under way when the day came round.
export type DayReason = "started" | "ended" | "both" | null;

export interface DayStormEntry {
  key: string;
  storm: Storm;
  // The calendar year this date fell in — not the season year, for a storm that crossed New Year.
  year: number;
  started: boolean;
  ended: boolean;
  active: boolean;
  reason: DayReason;
  progress: DayOfStorm;
}

export interface DayEntries {
  entries: DayStormEntry[]; // newest year first
  counts: Record<DayEventKind, number>;
}

const keyOf = (storm: Storm) => `${storm.name}-${storm.year}`;

export const getDayEntries = (record: Storm[], monthDay: string): DayEntries => {
  const storms = namingEra(record);

  const starts = getStormStarts(storms, monthDay);
  const ends = getStormEnds(storms, monthDay);
  const active = getActiveStorms(storms, monthDay);

  const startedKeys = new Set(starts.map(keyOf));
  const endedKeys = new Set(ends.map(keyOf));
  const activeKeys = new Set(active.map(keyOf));

  // The three lists overlap: `active` includes the day a storm formed or dissipated.
  const byStorm = new Map<string, DayStormEntry>();

  for (const storm of [...starts, ...ends, ...active]) {
    const key = keyOf(storm);
    if (byStorm.has(key)) continue;

    const started = startedKeys.has(key);
    const ended = endedKeys.has(key);

    byStorm.set(key, {
      key,
      storm,
      year: eventYearOf(storm, monthDay),
      started,
      ended,
      active: activeKeys.has(key),
      reason: started && ended ? "both" : started ? "started" : ended ? "ended" : null,
      progress: getDayOfStorm(storm, monthDay),
    });
  }

  const entries = [...byStorm.values()].sort(
    (a, b) =>
      b.year - a.year ||
      Number(a.reason === null) - Number(b.reason === null) ||
      a.storm.name.localeCompare(b.storm.name),
  );

  return {
    entries,
    counts: { started: startedKeys.size, ended: endedKeys.size, active: activeKeys.size },
  };
};

export const matchesDayKind = (entry: DayStormEntry, kind: DayEventKind): boolean => {
  if (kind === "started") return entry.started;
  if (kind === "ended") return entry.ended;
  return entry.active;
};

export interface SpineYearRow {
  year: number;
  entries: DayStormEntry[];
}

// Newest year first: a date's history reads back from the last time it happened.
export const buildDaySpine = (
  storms: Storm[],
  monthDay: string,
  kind: DayEventKind,
): SpineYearRow[] => {
  const { entries } = getDayEntries(storms, monthDay);

  const byYear = new Map<number, DayStormEntry[]>();
  for (const entry of entries) {
    if (!matchesDayKind(entry, kind)) continue;

    const group = byYear.get(entry.year);
    if (group) group.push(entry);
    else byYear.set(entry.year, [entry]);
  }

  return [...byYear.entries()]
    .map(([year, group]) => ({ year, entries: group }))
    .sort((a, b) => b.year - a.year);
};

// Seasons in the record that could have carried this day at all, which 29 February narrows to the
// leap years. It is the denominator the summary line counts against.
export const countDaySeasons = (record: Storm[], monthDay: string): number => {
  const years = new Set<number>();
  for (const storm of namingEra(record)) years.add(storm.year);

  return monthDay === LEAP_DAY ? [...years].filter(isLeapYear).length : years.size;
};

// A malformed end date must not spin the walk forever.
const MAX_ACTIVE_DAYS = 400;

const daysCovered = (storm: Storm): string[] => {
  const start = parseStormDate(storm.dateStart);
  const end = parseDateParts(storm.dateEnd) ?? parseStormDate(todayISO());

  const cursor = new Date(Date.UTC(start.year, start.month - 1, start.day));
  const last = Date.UTC(end.year, end.month - 1, end.day);

  const days: string[] = [];
  // Walking real dates rather than the 366 slots keeps a non-leap February from ever yielding 29.
  while (cursor.getTime() <= last && days.length < MAX_ACTIVE_DAYS) {
    days.push(toMonthDay(cursor.getUTCMonth() + 1, cursor.getUTCDate()));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
};

// One count per slot of DAYS_OF_YEAR: how many storms in the whole record touched that day.
export const getDayDensity = (record: Storm[], kind: DayEventKind): number[] => {
  const density = new Array<number>(DAYS_OF_YEAR.length).fill(0);

  for (const storm of namingEra(record)) {
    if (kind === "started") {
      density[dayIndexOf(monthDayOf(storm.dateStart))] += 1;
    } else if (kind === "ended") {
      if (storm.dateEnd) density[dayIndexOf(monthDayOf(storm.dateEnd))] += 1;
    } else {
      for (const monthDay of daysCovered(storm)) density[dayIndexOf(monthDay)] += 1;
    }
  }

  return density;
};

export interface DayRank {
  count: number;
  rank: number; // 1-based; days with the same count share a rank
  busiest: { monthDay: string; count: number };
}

export const rankDay = (density: number[], monthDay: string): DayRank => {
  const count = density[dayIndexOf(monthDay)] ?? 0;

  let rank = 1;
  let busiest = 0;
  for (let index = 0; index < density.length; index++) {
    if (density[index] > count) rank += 1;
    if (density[index] > density[busiest]) busiest = index;
  }

  return {
    count,
    rank,
    busiest: { monthDay: DAYS_OF_YEAR[busiest], count: density[busiest] },
  };
};
