export interface DateParts {
  year: number;
  month: number;
  day: number;
}

// Storm dates travel as "YYYY-MM-DD" strings (never Date objects) so they can't shift a day when serialized or rendered in another timezone.

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
