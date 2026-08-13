import {
  calculateAvgDates,
  calculateAvgDatesByGroup,
  calculateAvgDuration,
  formatDayOfYear,
  getDoyMonth,
} from "@/lib/utils/stormDates";
import { storm } from "@/lib/testFixtures";

describe("average storm dates", () => {
  it("round-trips a single storm's dates through the day-of-year math", () => {
    const { startDoy, endDoy } = calculateAvgDates([
      storm({ dateStart: "2024-08-31", dateEnd: "2024-09-09" }),
    ]);
    expect(formatDayOfYear(startDoy)).toBe("31/8");
    expect(formatDayOfYear(endDoy)).toBe("9/9");
  });

  it("collapses 29/2 onto 28/2 so a leap day never appears in the output", () => {
    const leap = calculateAvgDates([storm({ dateStart: "2024-02-29" })]);
    const nonLeap = calculateAvgDates([storm({ dateStart: "2023-02-28" })]);
    expect(leap.startDoy).toBe(nonLeap.startDoy);
    expect(formatDayOfYear(leap.startDoy)).toBe("28/2");
  });

  it("keeps a Dec-to-Jan storm's end after its start", () => {
    const { startDoy, endDoy } = calculateAvgDates([
      storm({ year: 2023, dateStart: "2023-12-30", dateEnd: "2024-01-02" }),
    ]);
    expect(endDoy).toBeGreaterThan(startDoy);
    expect(formatDayOfYear(endDoy)).toBe("2/1"); // wraps back onto a real date
    expect(getDoyMonth(endDoy)).toBe(1);
  });

  it("never averages a new-year-spanning group below 1/1", () => {
    const { endDoy } = calculateAvgDates([
      storm({ year: 2023, dateStart: "2023-12-30", dateEnd: "2024-01-02" }),
      storm({ year: 2023, dateStart: "2023-12-28", dateEnd: "2024-01-06" }),
    ]);
    expect(endDoy).toBeGreaterThan(365);
    expect(formatDayOfYear(endDoy)).toBe("4/1");
  });

  it("ends an active storm today, since its real end is still ahead", () => {
    jest.useFakeTimers().setSystemTime(new Date(2024, 8, 9)); // 9/9/2024, local time
    const { endDoy } = calculateAvgDates([storm({ dateStart: "2024-08-31" })]);
    expect(formatDayOfYear(endDoy)).toBe("9/9");
    jest.useRealTimers();
  });

  it("reports -1 for an empty group", () => {
    const { startDoy, endDoy } = calculateAvgDates([]);
    expect(startDoy).toBe(-1);
    expect(endDoy).toBe(-1);
    expect(formatDayOfYear(-1)).toBe("N/A");
    expect(getDoyMonth(-1)).toBe(-1);
  });

  it("averages each group independently", () => {
    const byName = calculateAvgDatesByGroup(
      [
        storm({ name: "Yagi", dateStart: "2024-08-31" }),
        storm({ name: "Nakri", dateStart: "2024-01-01" }),
      ],
      "name",
    );
    expect(formatDayOfYear(byName.Yagi.startDoy)).toBe("31/8");
    expect(formatDayOfYear(byName.Nakri.startDoy)).toBe("1/1");
  });
});

describe("calculateAvgDuration", () => {
  it("averages the whole-day durations", () => {
    expect(
      calculateAvgDuration([
        storm({ dateStart: "2024-08-31", dateEnd: "2024-09-09" }), // 9 days
        storm({ dateStart: "2024-08-01", dateEnd: "2024-08-06" }), // 5 days
      ]),
    ).toBe(7);
  });

  it("counts an ongoing storm's days so far, measured to today", () => {
    jest.useFakeTimers().setSystemTime(new Date(2024, 8, 9)); // 9/9/2024, local time
    expect(
      calculateAvgDuration([
        storm({ dateStart: "2024-08-31", dateEnd: "2024-09-09" }), // 9 days
        storm({ dateStart: "2024-09-04" }), // ongoing, 5 days so far
      ]),
    ).toBe(7);
    jest.useRealTimers();
  });

  it("returns -1 for an empty group", () => {
    expect(calculateAvgDuration([])).toBe(-1);
  });
});
