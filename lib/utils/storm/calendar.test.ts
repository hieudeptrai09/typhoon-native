import {
  averageToDate,
  averageTotal,
  eventYearOf,
  getActiveStorms,
  getDayOfStorm,
  getSeasonMonths,
  getSeasonToDate,
  getStormEnds,
  getStormStarts,
  groupBySeason,
  hasStartedBy,
  isSeasonOngoing,
  seasonMonthOf,
} from "@/lib/utils/storm/calendar";
import { storm } from "@/lib/utils/storm/testFixtures";

const storms = [
  storm({ name: "Yagi", year: 2024, dateStart: "2024-08-31", dateEnd: "2024-09-09" }),
  storm({ name: "Krathon", year: 2024, dateStart: "2024-09-09", dateEnd: "2024-10-04" }),
  storm({ name: "Nakri", year: 2019, dateStart: "2019-11-05", dateEnd: "2019-11-09" }),
  storm({ name: "Solo", year: 2020, dateStart: "2020-09-09", dateEnd: "2020-09-09" }),
];

describe("getStormStarts / getStormEnds", () => {
  it("splits the two ends of a date into their own lists", () => {
    expect(getStormStarts(storms, "09-09").map((s) => s.name)).toEqual(["Krathon", "Solo"]);
    expect(getStormEnds(storms, "09-09").map((s) => s.name)).toEqual(["Yagi", "Solo"]);
  });

  it("puts a storm that began and ended on the date in both lists", () => {
    expect(getStormStarts([storms[3]], "09-09")).toHaveLength(1);
    expect(getStormEnds([storms[3]], "09-09")).toHaveLength(1);
  });

  it("matches an end date in the year after the season", () => {
    const carried = storm({ year: 2023, dateStart: "2023-12-30", dateEnd: "2024-01-02" });
    expect(getStormEnds([carried], "01-02")).toHaveLength(1);
    expect(getStormStarts([carried], "12-30")).toHaveLength(1);
  });

  it("finds nothing on a date no storm touched", () => {
    expect(getStormStarts(storms, "03-15")).toEqual([]);
    expect(getStormEnds(storms, "03-15")).toEqual([]);
  });

  it("never reads an end date off an ongoing storm", () => {
    expect(getStormEnds([storm({ dateStart: "2024-08-31" })], "08-31")).toEqual([]);
  });
});

describe("groupBySeason", () => {
  it("files storms under the season that named them, oldest season first", () => {
    expect(groupBySeason(storms).map((s) => [s.year, s.storms.length])).toEqual([
      [2019, 1],
      [2020, 1],
      [2024, 2],
    ]);
  });

  it("orders a season's storms by the date they formed", () => {
    expect(groupBySeason(storms)[2].storms.map((s) => s.name)).toEqual(["Yagi", "Krathon"]);
  });

  it("keeps a storm that ended in January under the season it started in", () => {
    const carried = storm({ year: 2023, dateStart: "2023-12-30", dateEnd: "2024-01-02" });
    expect(groupBySeason([carried])[0].year).toBe(2023);
  });
});

describe("getActiveStorms", () => {
  const yagi = storm({ name: "Yagi", year: 2024, dateStart: "2024-08-31", dateEnd: "2024-09-09" });
  const carried = storm({
    name: "Phanfone",
    year: 2019,
    dateStart: "2019-12-19",
    dateEnd: "2020-01-01",
  });

  it("counts the days between the ends, and both ends themselves", () => {
    expect(getActiveStorms([yagi], "09-04").map((s) => s.name)).toEqual(["Yagi"]);
    expect(getActiveStorms([yagi], "08-31").map((s) => s.name)).toEqual(["Yagi"]);
    expect(getActiveStorms([yagi], "09-09").map((s) => s.name)).toEqual(["Yagi"]);
  });

  it("leaves out the days on either side of the storm", () => {
    expect(getActiveStorms([yagi], "08-30")).toEqual([]);
    expect(getActiveStorms([yagi], "09-10")).toEqual([]);
  });

  it("wraps a storm that crossed the new year round both ends of the calendar", () => {
    expect(getActiveStorms([carried], "12-25")).toHaveLength(1);
    expect(getActiveStorms([carried], "01-01")).toHaveLength(1);
    expect(getActiveStorms([carried], "07-01")).toEqual([]);
  });

  it("never puts a storm out on a 29 February its season never had", () => {
    // Real cases: all three ran late February into March in non-leap years.
    const nonLeap = [
      storm({ name: "Mitag", year: 2002, dateStart: "2002-02-26", dateEnd: "2002-03-09" }),
      storm({ name: "Faxai", year: 2014, dateStart: "2014-02-27", dateEnd: "2014-03-05" }),
      storm({ name: "Wutip", year: 2019, dateStart: "2019-02-18", dateEnd: "2019-03-02" }),
    ];
    expect(getActiveStorms(nonLeap, "02-29")).toEqual([]);
    // The same span in a leap year did meet the day.
    const leap = storm({ year: 2024, dateStart: "2024-02-26", dateEnd: "2024-03-09" });
    expect(getActiveStorms([leap], "02-29")).toHaveLength(1);
  });

  it("still lists those storms on the days their calendar did have", () => {
    const mitag = storm({ year: 2002, dateStart: "2002-02-26", dateEnd: "2002-03-09" });
    expect(getActiveStorms([mitag], "02-28")).toHaveLength(1);
    expect(getActiveStorms([mitag], "03-01")).toHaveLength(1);
  });

  it("runs an ongoing storm up to today, which has no end of its own", () => {
    jest.useFakeTimers().setSystemTime(new Date(2024, 8, 9)); // 9/9/2024, local time
    const ongoing = storm({ year: 2024, dateStart: "2024-08-31" });
    expect(getActiveStorms([ongoing], "09-05")).toHaveLength(1);
    expect(getActiveStorms([ongoing], "09-20")).toEqual([]);
    jest.useRealTimers();
  });
});

describe("eventYearOf", () => {
  it("uses the storm's own year for a date it reaches in that year", () => {
    expect(eventYearOf(storm({ year: 2024, dateStart: "2024-08-31" }), "09-09")).toBe(2024);
  });

  it("rolls to the next year for a date the storm only reaches after new year", () => {
    // Bolaven: a 2018-season storm that formed on 29 December 2017.
    expect(eventYearOf(storm({ year: 2018, dateStart: "2017-12-29" }), "12-29")).toBe(2017);
    // Jangmi: a 2014-season storm that ended on 1 January 2015.
    expect(eventYearOf(storm({ year: 2014, dateStart: "2014-12-28" }), "01-01")).toBe(2015);
  });
});

describe("getDayOfStorm", () => {
  const yagi = storm({ year: 2024, dateStart: "2024-08-31", dateEnd: "2024-09-09" });

  it("counts the first day as day 1", () => {
    expect(getDayOfStorm(yagi, "08-31")).toEqual({ day: 1, total: 10 });
    expect(getDayOfStorm(yagi, "09-09")).toEqual({ day: 10, total: 10 });
  });

  it("carries the count across a new year rather than restarting it", () => {
    const carried = storm({ year: 2019, dateStart: "2019-12-30", dateEnd: "2020-01-02" });
    expect(getDayOfStorm(carried, "01-01")).toEqual({ day: 3, total: 4 });
  });

  it("leaves an ongoing storm without a total", () => {
    expect(getDayOfStorm(storm({ dateStart: "2024-08-31" }), "09-02").total).toBeNull();
  });
});

describe("hasStartedBy / seasonMonthOf", () => {
  it("counts a storm from the date it started", () => {
    const yagi = storm({ year: 2024, dateStart: "2024-08-31" });
    expect(hasStartedBy(yagi, "08-31")).toBe(true);
    expect(hasStartedBy(yagi, "08-30")).toBe(false);
    expect(seasonMonthOf(yagi)).toBe(8);
  });

  it("counts a storm carried over from December toward its season's January", () => {
    const carried = storm({ year: 2024, dateStart: "2023-12-28" });
    expect(hasStartedBy(carried, "01-01")).toBe(true);
    expect(seasonMonthOf(carried)).toBe(1);
  });
});

describe("getSeasonMonths", () => {
  const season = [
    storm({ name: "A", year: 2024, dateStart: "2023-12-28" }),
    storm({ name: "B", year: 2024, dateStart: "2024-05-20" }),
    storm({ name: "C", year: 2024, dateStart: "2024-08-01" }),
    storm({ name: "D", year: 2024, dateStart: "2024-08-31" }),
  ];

  it("splits a season into the months its storms formed in, in order", () => {
    expect(getSeasonMonths(season, "12-31").map((m) => [m.month, m.storms.length])).toEqual([
      [1, 1],
      [5, 1],
      [8, 2],
    ]);
  });

  it("marks how much of a month the chosen date had reached", () => {
    const august = getSeasonMonths(season, "08-15").find((m) => m.month === 8);
    expect(august).toMatchObject({ toDate: 1 });
    expect(august?.storms.map((s) => s.name)).toEqual(["C", "D"]);
  });

  it("leaves out the months the season produced nothing in", () => {
    expect(getSeasonMonths(season, "12-31").map((m) => m.month)).not.toContain(2);
  });
});

describe("getSeasonToDate", () => {
  const record = [
    storm({ name: "A", year: 2024, dateStart: "2024-02-01" }),
    storm({ name: "B", year: 2024, dateStart: "2024-08-31" }),
    storm({ name: "C", year: 2023, dateStart: "2023-04-10" }),
    storm({ name: "D", year: 1998, dateStart: "1998-04-10" }),
  ];

  it("splits each season into what had happened by the date and the whole of it", () => {
    expect(
      getSeasonToDate(record, "05-01").map(({ year, toDate, total }) => ({ year, toDate, total })),
    ).toEqual([
      { year: 2023, toDate: 1, total: 1 },
      { year: 2024, toDate: 1, total: 2 },
    ]);
  });

  it("keeps a season that had produced nothing yet rather than dropping it", () => {
    expect(getSeasonToDate(record, "01-15").map((row) => row.toDate)).toEqual([0, 0]);
  });

  it("carries the whole season along, for the month breakdown behind the row", () => {
    const row = getSeasonToDate(record, "05-01").find((r) => r.year === 2024);
    expect(row?.storms.map((s) => s.name)).toEqual(["A", "B"]);
  });

  it("leaves out a storm JMA never numbered, which is not part of the season tally", () => {
    // Iona and Senyar 2025: both arrived from another basin already named, and JMA gave
    // neither an international number.
    const record = [
      storm({ name: "Ragasa", year: 2025, dateStart: "2025-09-16", jmaNumber: "2518" }),
      storm({ name: "Iona", year: 2025, dateStart: "2025-08-01", jmaNumber: undefined }),
      storm({ name: "Senyar", year: 2025, dateStart: "2025-11-25", jmaNumber: undefined }),
    ];
    expect(getSeasonToDate(record, "12-31")).toEqual([
      { year: 2025, toDate: 1, total: 1, storms: [record[0]] },
    ]);
  });

  it("still counts a storm at an outside-basin position that JMA did number", () => {
    const crossover = storm({ name: "Maka", year: 2024, position: 141, jmaNumber: "2401" });
    expect(getSeasonToDate([crossover], "12-31")[0].total).toBe(1);
  });

  it("ignores seasons from before the naming list began", () => {
    expect(getSeasonToDate(record, "12-31").map((row) => row.year)).toEqual([2023, 2024]);
  });
});

describe("isSeasonOngoing", () => {
  it("marks the season the clock is still inside", () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 7, 26)); // 26/8/2026, local time
    expect(isSeasonOngoing(2026)).toBe(true);
    expect(isSeasonOngoing(2025)).toBe(false);
    expect(isSeasonOngoing(2000)).toBe(false);
    jest.useRealTimers();
  });
});

describe("averageTotal", () => {
  const rows = [
    { year: 2024, toDate: 4, total: 26, storms: [] },
    { year: 2025, toDate: 5, total: 20, storms: [] },
    { year: 2026, toDate: 21, total: 21, storms: [] }, // still running, and short of its eventual total
  ];

  it("averages the finished seasons only, so a running one cannot drag it down", () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 7, 26));
    expect(averageTotal(rows)).toBe(23); // (26 + 20) / 2, with 2026 left out
    jest.useRealTimers();
  });

  it("returns 0 rather than NaN when every season is still running", () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 7, 26));
    expect(averageTotal([rows[2]])).toBe(0);
    jest.useRealTimers();
  });
});

describe("averageToDate", () => {
  it("averages the counts across the seasons", () => {
    expect(
      averageToDate([
        { year: 2023, toDate: 1, total: 4, storms: [] },
        { year: 2024, toDate: 4, total: 9, storms: [] },
      ]),
    ).toBe(2.5);
  });

  it("returns 0 rather than NaN when there is nothing to average", () => {
    expect(averageToDate([])).toBe(0);
  });
});
