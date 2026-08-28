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

// "31 August 2024"
export const formatLongDate = (date: string): string => {
  const { year, month, day } = parseStormDate(date);
  return MONTH_NAMES[month] ? `${day} ${MONTH_NAMES[month]} ${year}` : date;
};

export const isLeapYear = (year: number): boolean =>
  year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

const ordinalSuffix = (day: number): string => {
  // 11th, 12th and 13th break the pattern the last digit would otherwise set.
  if (day % 100 >= 11 && day % 100 <= 13) return "th";
  return { 1: "st", 2: "nd", 3: "rd" }[day % 10] ?? "th";
};

export const formatOrdinalDate = (monthDay: string, year: number): string => {
  const parts = parseMonthDay(monthDay);
  if (!parts) return monthDay;

  const day = parts.month === 2 && parts.day === 29 && !isLeapYear(year) ? 28 : parts.day;
  return `${MONTH_NAMES[parts.month]} ${day}${ordinalSuffix(day)}, ${year}`;
};

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

export const formatStormDateRange = (dateStart: string, dateEnd?: string): string => {
  const start = parseStormDate(dateStart);
  const end = parseDateParts(dateEnd);
  if (!end) return `${start.day}/${start.month} - now`;
  if (start.year === end.year) {
    return `${start.day}/${start.month} - ${end.day}/${end.month}/${end.year}`;
  }
  return `${start.day}/${start.month}/${start.year} - ${end.day}/${end.month}/${end.year}`;
};
