import { MONTH_NAMES } from "@/lib/constants";

export interface DateParts {
  year: number;
  month: number;
  day: number;
}

// Storm dates travel as "YYYY-MM-DD" strings, never Date objects, so they can't shift a day when
// serialized or rendered in another timezone.
export const parseStormDate = (date: string): DateParts => {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
};

export const parseDateParts = (date?: string): DateParts | null => {
  if (!date) return null;
  const { year, month, day } = parseStormDate(date);
  if (!year || !month || !day) return null;
  return { year, month, day };
};

const DAYS_IN_MONTH_MAX = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const todayISO = (): string => {
  const now = new Date(Date.now());
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// Cache key suffix for remote content that is re-rendered upstream behind a stable URL. The width
// matches the query TTL in lib/api/client.ts, so an image and the row describing it go stale
// together.
export const hourBucket = (): string => String(Math.floor(Date.now() / 3_600_000));

export const toMonthDay = (month: number, day: number): string =>
  `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

export const monthDayOf = (date: string): string => date.slice(5);

export const parseMonthDay = (
  monthDay: string | null | undefined,
): { month: number; day: number } | null => {
  if (!monthDay || !/^\d{2}-\d{2}$/.test(monthDay)) return null;
  const month = Number(monthDay.slice(0, 2));
  const day = Number(monthDay.slice(3));
  if (month < 1 || month > 12 || day < 1 || day > DAYS_IN_MONTH_MAX[month - 1]) return null;
  return { month, day };
};

// "26 August"
export const formatMonthDay = (monthDay: string): string => {
  const parts = parseMonthDay(monthDay);
  return parts ? `${parts.day} ${MONTH_NAMES[parts.month]}` : monthDay;
};

// "31 Aug 2024" — for the half-width fact columns, where the full month name wraps.
export const formatShortDate = (date: string): string => {
  const { year, month, day } = parseStormDate(date);
  return MONTH_NAMES[month] ? `${day} ${MONTH_NAMES[month].slice(0, 3)} ${year}` : date;
};

// "31 August 2024"
export const formatLongDate = (date: string): string => {
  const { year, month, day } = parseStormDate(date);
  return MONTH_NAMES[month] ? `${day} ${MONTH_NAMES[month]} ${year}` : date;
};

export const isLeapYear = (year: number): boolean =>
  year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

// Steps through the 366-day calendar, so 29/2 stays reachable whatever the year.
export const shiftMonthDay = (monthDay: string, delta: 1 | -1): string => {
  const parts = parseMonthDay(monthDay);
  if (!parts) return monthDay;

  let { month, day } = parts;
  day += delta;
  if (day < 1) {
    month = month === 1 ? 12 : month - 1;
    day = DAYS_IN_MONTH_MAX[month - 1];
  } else if (day > DAYS_IN_MONTH_MAX[month - 1]) {
    month = month === 12 ? 1 : month + 1;
    day = 1;
  }
  return toMonthDay(month, day);
};

// The calendar as 366 slots, so 29 February keeps a place of its own instead of collapsing onto
// the 28th. Everything that scans a whole year — the density strip, the day ranking — indexes here.
export const DAYS_OF_YEAR: string[] = DAYS_IN_MONTH_MAX.flatMap((days, index) =>
  Array.from({ length: days }, (_, day) => toMonthDay(index + 1, day + 1)),
);

export const MONTH_START_INDEX: number[] = DAYS_IN_MONTH_MAX.map((_, index) =>
  DAYS_IN_MONTH_MAX.slice(0, index).reduce((sum, days) => sum + days, 0),
);

const DAY_INDEX = new Map(DAYS_OF_YEAR.map((monthDay, index) => [monthDay, index]));

export const dayIndexOf = (monthDay: string): number => DAY_INDEX.get(monthDay) ?? 0;

export const monthDayAt = (index: number): string =>
  DAYS_OF_YEAR[Math.min(DAYS_OF_YEAR.length - 1, Math.max(0, index))];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const daysBetween = (dateStart: string, dateEnd?: string): number | null => {
  const start = parseStormDate(dateStart);
  const end = parseDateParts(dateEnd);
  if (!end) return null;
  return Math.round(
    (Date.UTC(end.year, end.month - 1, end.day) -
      Date.UTC(start.year, start.month - 1, start.day)) /
      MS_PER_DAY,
  );
};

export interface Duration {
  years: number;
  months: number;
  days: number;
}

const daysInMonth = (year: number, month: number): number =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

// Whole years and months first, then the leftover days. A start on the 31st steps to the end of a
// shorter month (31/1 + 1 month = 28/2), the way people count it by hand.
export const calendarDuration = (dateStart: string, dateEnd: string): Duration => {
  const start = parseStormDate(dateStart);
  const end = parseStormDate(dateEnd);
  let totalMonths = (end.year - start.year) * 12 + (end.month - start.month);
  if (end.day < start.day) totalMonths -= 1;

  const anchorYear = start.year + Math.floor((start.month - 1 + totalMonths) / 12);
  const anchorMonth = ((start.month - 1 + totalMonths) % 12) + 1;
  const anchorDay = Math.min(start.day, daysInMonth(anchorYear, anchorMonth));
  const pad = (n: number) => String(n).padStart(2, "0");
  const anchor = `${anchorYear}-${pad(anchorMonth)}-${pad(anchorDay)}`;

  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days: daysBetween(anchor, dateEnd) ?? 0,
  };
};

// An average has no dates to anchor it, so it is floored to whole days, split into 365-day years,
// and the rest walked through a common year's months from January until less than a month is left.
// 1416 → 3 years (1095) + 321 → Jan…Oct (304) → 3 years 10 months 17 days.
const DAYS_PER_YEAR = 365;
const COMMON_YEAR_MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const durationFromDays = (totalDays: number): Duration => {
  const whole = Math.floor(totalDays);
  const years = Math.floor(whole / DAYS_PER_YEAR);
  let days = whole - years * DAYS_PER_YEAR;
  let months = 0;
  while (days >= COMMON_YEAR_MONTH_DAYS[months]) {
    days -= COMMON_YEAR_MONTH_DAYS[months];
    months += 1;
  }
  return { years, months, days };
};

const unit = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// "4 years 1 month 14 days"
export const formatDurationParts = ({ years, months, days }: Duration): string => {
  const parts = [
    years > 0 && unit(years, "year"),
    months > 0 && unit(months, "month"),
    days > 0 && unit(days, "day"),
  ].filter(Boolean);
  return parts.length ? parts.join(" ") : "0 days";
};

// Floored, not rounded, so it always agrees with durationFromDays.
export const formatDayNumber = (days: number): string => String(Math.floor(days));

export const formatDayCount = (days: number): string =>
  `${formatDayNumber(days)} ${Math.floor(days) === 1 ? "day" : "days"}`;

// "1416 days ≈ 3 years 10 months 17 days"
export const formatAverageDays = (days: number): string =>
  `${formatDayCount(days)} ≈ ${formatDurationParts(durationFromDays(days))}`;

export const formatStormDateRange = (dateStart: string, dateEnd?: string): string => {
  const start = parseStormDate(dateStart);
  const end = parseDateParts(dateEnd);
  if (!end) return `${start.day}/${start.month} - now`;
  if (start.year === end.year) {
    return `${start.day}/${start.month} - ${end.day}/${end.month}/${end.year}`;
  }
  return `${start.day}/${start.month}/${start.year} - ${end.day}/${end.month}/${end.year}`;
};
