import {
  calendarDuration,
  dayIndexOf,
  DAYS_OF_YEAR,
  daysBetween,
  durationFromDays,
  formatAverageDays,
  formatDayCount,
  formatDurationParts,
  formatLongDate,
  formatMonthDay,
  formatShortDate,
  formatStormDateRange,
  MONTH_START_INDEX,
  monthDayAt,
  monthDayOf,
  parseDateParts,
  parseMonthDay,
  parseStormDate,
  shiftMonthDay,
  todayISO,
  toMonthDay,
} from "@/lib/utils/date";

describe("parseDateParts", () => {
  it("splits a YYYY-MM-DD string", () => {
    expect(parseDateParts("2024-08-31")).toEqual({ year: 2024, month: 8, day: 31 });
  });

  it("returns null for anything it cannot fully parse", () => {
    expect(parseDateParts(undefined)).toBeNull();
    expect(parseDateParts("")).toBeNull();
    expect(parseDateParts("2024-08")).toBeNull(); // no day
    expect(parseDateParts("not-a-date")).toBeNull();
  });

  it("trusts the DB rather than range-checking the parts", () => {
    expect(parseDateParts("2024-13-45")).toEqual({ year: 2024, month: 13, day: 45 });
  });
});

describe("daysBetween", () => {
  it("counts the days spanned by a storm", () => {
    expect(daysBetween("2024-08-31", "2024-09-09")).toBe(9);
  });

  it("returns 0 for a single-day storm", () => {
    expect(daysBetween("2024-08-31", "2024-08-31")).toBe(0);
  });

  it("counts across a year boundary", () => {
    expect(daysBetween("2023-12-30", "2024-01-02")).toBe(3);
  });

  it("counts across a leap day", () => {
    expect(daysBetween("2024-02-28", "2024-03-01")).toBe(2);
  });

  it("returns null while a storm is still ongoing", () => {
    expect(daysBetween("2024-08-31", undefined)).toBeNull();
  });

  it("goes negative for a reversed range rather than clamping", () => {
    expect(daysBetween("2024-09-09", "2024-08-31")).toBe(-9);
  });
});

describe("formatStormDateRange", () => {
  it("omits the year on the start when both ends share it", () => {
    expect(formatStormDateRange("2024-08-31", "2024-09-09")).toBe("31/8 - 9/9/2024");
  });

  it("shows both years when the storm crosses into a new one", () => {
    expect(formatStormDateRange("2023-12-30", "2024-01-02")).toBe("30/12/2023 - 2/1/2024");
  });

  it("marks an ongoing storm as running to now", () => {
    expect(formatStormDateRange("2024-08-31", undefined)).toBe("31/8 - now");
  });
});

describe("parseStormDate", () => {
  it("splits a start date without the null case an optional end date needs", () => {
    expect(parseStormDate("2024-08-31")).toEqual({ year: 2024, month: 8, day: 31 });
  });
});

describe("month-day dates", () => {
  it("zero-pads both halves so two of them compare as strings", () => {
    expect(toMonthDay(8, 26)).toBe("08-26");
    expect(toMonthDay(12, 5) > toMonthDay(2, 28)).toBe(true);
  });

  it("takes the month-day off the tail of a storm date", () => {
    expect(monthDayOf("2024-08-31")).toBe("08-31");
  });

  it("range-checks a value that came in off stored state", () => {
    expect(parseMonthDay("08-26")).toEqual({ month: 8, day: 26 });
    expect(parseMonthDay(null)).toBeNull();
    expect(parseMonthDay("8-26")).toBeNull(); // unpadded
    expect(parseMonthDay("13-01")).toBeNull();
    expect(parseMonthDay("04-31")).toBeNull(); // April is 30 days
  });

  it("accepts 29/2, which a year-less date has no leap year to rule out", () => {
    expect(parseMonthDay("02-29")).toEqual({ month: 2, day: 29 });
    expect(parseMonthDay("02-30")).toBeNull();
  });

  it("spells the month out rather than leaving a year-less 26/8", () => {
    expect(formatMonthDay("08-26")).toBe("26 August");
    expect(formatMonthDay("nonsense")).toBe("nonsense");
  });
});

describe("formatLongDate", () => {
  it("spells a storm date out for prose", () => {
    expect(formatLongDate("2024-08-31")).toBe("31 August 2024");
    expect(formatLongDate("2024-01-02")).toBe("2 January 2024");
  });

  it("hands back anything it cannot name a month for", () => {
    expect(formatLongDate("2024-13-01")).toBe("2024-13-01");
  });
});

describe("shiftMonthDay", () => {
  it("steps a day either way", () => {
    expect(shiftMonthDay("08-26", 1)).toBe("08-27");
    expect(shiftMonthDay("08-26", -1)).toBe("08-25");
  });

  it("rolls over the ends of a month", () => {
    expect(shiftMonthDay("08-31", 1)).toBe("09-01");
    expect(shiftMonthDay("09-01", -1)).toBe("08-31");
  });

  it("wraps the year round rather than running off either end", () => {
    expect(shiftMonthDay("12-31", 1)).toBe("01-01");
    expect(shiftMonthDay("01-01", -1)).toBe("12-31");
  });

  it("steps through 29/2 rather than over it", () => {
    expect(shiftMonthDay("02-28", 1)).toBe("02-29");
    expect(shiftMonthDay("03-01", -1)).toBe("02-29");
  });

  it("leaves a value it could not parse alone", () => {
    expect(shiftMonthDay("nonsense", 1)).toBe("nonsense");
  });
});

describe("todayISO", () => {
  it("reads the local date, not the UTC one", () => {
    jest.useFakeTimers().setSystemTime(new Date(2024, 8, 9)); // 9/9/2024, local time
    expect(todayISO()).toBe("2024-09-09");
    jest.useRealTimers();
  });

  it("zero-pads into the same shape a storm date travels in", () => {
    jest.useFakeTimers().setSystemTime(new Date(2024, 0, 5));
    expect(todayISO()).toBe("2024-01-05");
    jest.useRealTimers();
  });
});

describe("formatShortDate", () => {
  it("abbreviates the month", () => {
    expect(formatShortDate("2024-08-31")).toBe("31 Aug 2024");
  });

  it("hands back anything it cannot read", () => {
    expect(formatShortDate("nonsense")).toBe("nonsense");
  });
});

describe("DAYS_OF_YEAR", () => {
  it("keeps a slot of its own for 29 February", () => {
    expect(DAYS_OF_YEAR).toHaveLength(366);
    expect(DAYS_OF_YEAR).toContain("02-29");
  });

  it("runs from the first day to the last", () => {
    expect(DAYS_OF_YEAR[0]).toBe("01-01");
    expect(DAYS_OF_YEAR[365]).toBe("12-31");
  });

  it("starts every month where MONTH_START_INDEX says it does", () => {
    expect(MONTH_START_INDEX.map((start) => DAYS_OF_YEAR[start])).toEqual([
      "01-01",
      "02-01",
      "03-01",
      "04-01",
      "05-01",
      "06-01",
      "07-01",
      "08-01",
      "09-01",
      "10-01",
      "11-01",
      "12-01",
    ]);
  });
});

describe("dayIndexOf / monthDayAt", () => {
  it("round-trips a date through its slot", () => {
    expect(monthDayAt(dayIndexOf("08-31"))).toBe("08-31");
    expect(monthDayAt(dayIndexOf("02-29"))).toBe("02-29");
  });

  it("falls back to the first slot for a date it does not know", () => {
    expect(dayIndexOf("13-01")).toBe(0);
  });

  it("clamps an index that runs off either end of the year", () => {
    expect(monthDayAt(-1)).toBe("01-01");
    expect(monthDayAt(999)).toBe("12-31");
  });
});

describe("calendarDuration", () => {
  it("counts whole years, then months, then leftover days", () => {
    expect(calendarDuration("2019-08-01", "2023-09-15")).toEqual({ years: 4, months: 1, days: 14 });
    expect(calendarDuration("2018-09-10", "2024-09-10")).toEqual({ years: 6, months: 0, days: 0 });
  });

  it("borrows a month when the end day falls before the start day", () => {
    expect(calendarDuration("2020-10-20", "2021-01-05")).toEqual({ years: 0, months: 2, days: 16 });
  });

  it("steps a month-end start to the end of a shorter month", () => {
    expect(calendarDuration("2023-01-31", "2023-03-01")).toEqual({ years: 0, months: 1, days: 1 });
    expect(calendarDuration("2024-01-31", "2024-02-29")).toEqual({ years: 0, months: 0, days: 29 });
  });

  it("is zero for the same day", () => {
    expect(calendarDuration("2024-08-31", "2024-08-31")).toEqual({ years: 0, months: 0, days: 0 });
  });
});

describe("durationFromDays", () => {
  it("floors to whole days, takes 365-day years, then walks the months from January", () => {
    // 1416 = 3 × 365 + 321; Jan–Oct is 304 days, leaving 17
    expect(durationFromDays(1416.25)).toEqual({ years: 3, months: 10, days: 17 });
  });

  it("counts a year as exactly 365 days", () => {
    expect(durationFromDays(365)).toEqual({ years: 1, months: 0, days: 0 });
    expect(durationFromDays(366)).toEqual({ years: 1, months: 0, days: 1 });
    expect(durationFromDays(2192)).toEqual({ years: 6, months: 0, days: 2 });
  });

  it("uses the Gregorian month lengths of a common year", () => {
    expect(durationFromDays(30)).toEqual({ years: 0, months: 0, days: 30 });
    expect(durationFromDays(45)).toEqual({ years: 0, months: 1, days: 14 });
    expect(durationFromDays(59)).toEqual({ years: 0, months: 2, days: 0 });
    expect(durationFromDays(364)).toEqual({ years: 0, months: 11, days: 30 });
  });

  it("never rounds a fraction up", () => {
    expect(durationFromDays(9.99)).toEqual({ years: 0, months: 0, days: 9 });
  });
});

describe("formatDurationParts", () => {
  it("spells out each non-zero part", () => {
    expect(formatDurationParts({ years: 4, months: 1, days: 14 })).toBe("4 years 1 month 14 days");
    expect(formatDurationParts({ years: 1, months: 0, days: 1 })).toBe("1 year 1 day");
  });

  it("reads 0 days when there is nothing to show", () => {
    expect(formatDurationParts({ years: 0, months: 0, days: 0 })).toBe("0 days");
  });
});

describe("formatDayCount / formatAverageDays", () => {
  it("floors to whole days without a thousands separator", () => {
    expect(formatDayCount(2193.9)).toBe("2193 days");
    expect(formatDayCount(1)).toBe("1 day");
  });

  it("pairs the day count with its calendar reading", () => {
    expect(formatAverageDays(1416.25)).toBe("1416 days ≈ 3 years 10 months 17 days");
  });
});
