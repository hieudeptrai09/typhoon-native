import type { Storm } from "@/lib/types";
import {
  calculateAverage,
  calculateDistances,
  calculateGapAverage,
  formatDistance,
  getGroupedStorms,
  getGroupSummaries,
  getIntensityFromNumber,
  getIntensityGroups,
  getSeasonStorms,
  getSeasonYears,
  sortNamesByFirstYear,
} from "@/lib/utils/storm/aggregate";
import { storm } from "@/lib/utils/storm/testFixtures";

describe("getIntensityFromNumber", () => {
  it("rounds an averaged rank onto a real intensity", () => {
    expect(getIntensityFromNumber(4.6)).toBe("5");
    expect(getIntensityFromNumber(4)).toBe("4");
    expect(getIntensityFromNumber(3.4)).toBe("3");
    expect(getIntensityFromNumber(1.5)).toBe("2");
  });

  it("clamps above category 5", () => {
    expect(getIntensityFromNumber(7)).toBe("5");
  });

  it("maps the sub-typhoon ranks", () => {
    expect(getIntensityFromNumber(0)).toBe("TS");
    expect(getIntensityFromNumber(0.4)).toBe("TS");
    expect(getIntensityFromNumber(-0.4)).toBe("TS");
    expect(getIntensityFromNumber(-1)).toBe("TD");
  });

  it("maps ranks below TD onto monsoon depression", () => {
    expect(getIntensityFromNumber(-2)).toBe("MD");
    expect(getIntensityFromNumber(-5)).toBe("MD");
  });
});

describe("getGroupedStorms", () => {
  it("groups by the given key", () => {
    const grouped = getGroupedStorms(
      [storm({ name: "Yagi", year: 2018 }), storm({ name: "Yagi", year: 2024 })],
      "name",
    );
    expect(Object.keys(grouped)).toEqual(["Yagi"]);
    expect(grouped.Yagi).toHaveLength(2);
  });
});

describe("calculateAverage", () => {
  it("averages the intensity ranks", () => {
    expect(calculateAverage([storm({ intensity: "5" }), storm({ intensity: "3" })])).toBe(4);
  });

  it("ranks TS and STS the same, below category 1", () => {
    expect(calculateAverage([storm({ intensity: "TS" }), storm({ intensity: "STS" })])).toBe(0);
    expect(calculateAverage([storm({ intensity: "TD" })])).toBe(-1);
  });

  it("ranks monsoon depressions at -2, below TD", () => {
    expect(calculateAverage([storm({ intensity: "MD" })])).toBe(-2);
    expect(calculateAverage([storm({ intensity: "4" }), storm({ intensity: "MD" })])).toBe(1);
  });
});

describe("calculateGapAverage / calculateDistances", () => {
  it("averages the year gaps between appearances", () => {
    const storms = [storm({ year: 2000 }), storm({ year: 2004 }), storm({ year: 2006 })];
    expect(calculateGapAverage(storms)).toBe(3); // gaps of 4 and 2
  });

  it("sorts before measuring, so input order does not matter", () => {
    const ascending = [storm({ year: 2000 }), storm({ year: 2006 })];
    const descending = [storm({ year: 2006 }), storm({ year: 2000 })];
    expect(calculateGapAverage(descending)).toBe(calculateGapAverage(ascending));
  });

  it("returns -1 when there is no gap to measure", () => {
    expect(calculateGapAverage([storm({ year: 2024 })])).toBe(-1);
    expect(calculateGapAverage([])).toBe(-1);
  });

  it("measures each group independently", () => {
    const distances = calculateDistances(
      [
        storm({ name: "Yagi", year: 2000 }),
        storm({ name: "Yagi", year: 2006 }),
        storm({ name: "Nakri", year: 2024 }),
      ],
      "name",
    );
    expect(distances).toEqual({ Yagi: 6, Nakri: -1 });
  });
});

describe("formatDistance", () => {
  it("renders a gap to two decimals", () => {
    expect(formatDistance(3)).toBe("3.00");
    expect(formatDistance(4.5)).toBe("4.50");
  });

  it("renders the no-gap sentinel as N/A", () => {
    expect(formatDistance(-1)).toBe("N/A");
  });
});

describe("sortNamesByFirstYear", () => {
  it("orders groups by their earliest storm", () => {
    const entries: [string, Storm[]][] = [
      ["Nakri", [storm({ year: 2019 }), storm({ year: 2008 })]],
      ["Yagi", [storm({ year: 2000 })]],
    ];
    expect(sortNamesByFirstYear(entries).map(([name]) => name)).toEqual(["Yagi", "Nakri"]);
  });

  it("does not mutate the input", () => {
    const entries: [string, Storm[]][] = [
      ["Nakri", [storm({ year: 2019 })]],
      ["Yagi", [storm({ year: 2000 })]],
    ];
    sortNamesByFirstYear(entries);
    expect(entries.map(([name]) => name)).toEqual(["Nakri", "Yagi"]);
  });
});

describe("getIntensityGroups", () => {
  it("orders groups strongest first and each group's storms by year", () => {
    const groups = getIntensityGroups([
      storm({ name: "A", intensity: "TS", year: 2010 }),
      storm({ name: "B", intensity: "5", year: 2020 }),
      storm({ name: "C", intensity: "5", year: 2001 }),
    ]);
    expect(groups.map((group) => group.intensity)).toEqual(["5", "TS"]);
    expect(groups[0].storms.map((s) => s.name)).toEqual(["C", "B"]);
  });
});

describe("getSeasonYears", () => {
  it("lists each year once, ascending", () => {
    const storms = [storm({ year: 2024 }), storm({ year: 2001 }), storm({ year: 2024 })];
    expect(getSeasonYears(storms)).toEqual([2001, 2024]);
  });

  it("starts at the naming list's first season", () => {
    const storms = [storm({ year: 1999 }), storm({ year: 2000 }), storm({ year: 1951 })];
    expect(getSeasonYears(storms)).toEqual([2000]);
  });
});

describe("getSeasonStorms", () => {
  it("keeps one season in formation order", () => {
    const storms = [
      storm({ name: "Late", year: 2024, dateStart: "2024-11-01" }),
      storm({ name: "Other", year: 2023, dateStart: "2023-05-01" }),
      storm({ name: "Early", year: 2024, dateStart: "2024-02-01" }),
    ];
    expect(getSeasonStorms(storms, 2024).map((s) => s.name)).toEqual(["Early", "Late"]);
  });
});

describe("getGroupSummaries", () => {
  it("counts and averages each group", () => {
    const summaries = getGroupSummaries(
      [
        storm({ year: 2024, intensity: "5" }),
        storm({ year: 2024, intensity: "1" }),
        storm({ year: 2001, intensity: "1" }),
      ],
      "year",
    );
    expect(summaries).toEqual({
      "2024": { count: 2, average: 3 },
      "2001": { count: 1, average: 1 },
    });
  });
});
