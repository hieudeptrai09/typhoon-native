import {
  daysBetween,
  formatLongDate,
  formatMonthDay,
  formatOrdinalDate,
  formatStormDateRange,
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

describe("formatOrdinalDate", () => {
  it("pins a year-less date to one year", () => {
    expect(formatOrdinalDate("08-26", 2021)).toBe("August 26th, 2021");
  });

  it("uses the suffix the last digit calls for", () => {
    expect(formatOrdinalDate("09-01", 2024)).toBe("September 1st, 2024");
    expect(formatOrdinalDate("09-02", 2024)).toBe("September 2nd, 2024");
    expect(formatOrdinalDate("09-03", 2024)).toBe("September 3rd, 2024");
    expect(formatOrdinalDate("09-04", 2024)).toBe("September 4th, 2024");
    expect(formatOrdinalDate("10-21", 2024)).toBe("October 21st, 2024");
    expect(formatOrdinalDate("10-31", 2024)).toBe("October 31st, 2024");
  });

  it("keeps the teens on th, which their last digit would not", () => {
    expect(formatOrdinalDate("07-11", 2024)).toBe("July 11th, 2024");
    expect(formatOrdinalDate("07-12", 2024)).toBe("July 12th, 2024");
    expect(formatOrdinalDate("07-13", 2024)).toBe("July 13th, 2024");
  });

  it("clamps 29 February onto the 28th in a year with no leap day", () => {
    expect(formatOrdinalDate("02-29", 2024)).toBe("February 29th, 2024");
    expect(formatOrdinalDate("02-29", 2002)).toBe("February 28th, 2002");
    expect(formatOrdinalDate("02-29", 1900)).toBe("February 28th, 1900"); // century, not a leap year
    expect(formatOrdinalDate("02-29", 2000)).toBe("February 29th, 2000"); // but 400 years is
  });

  it("hands back a value it could not parse", () => {
    expect(formatOrdinalDate("nonsense", 2024)).toBe("nonsense");
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
