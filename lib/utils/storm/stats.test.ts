import { buildStatRows, groupStorms, statColorsByKey, YEAR_CUTOFF } from "@/lib/utils/storm/stats";
import { storm } from "@/lib/utils/storm/testFixtures";

describe("groupStorms", () => {
  it("drops the seasons before the naming list from a year grouping", () => {
    const grouped = groupStorms(
      [storm({ year: 1998, dateStart: "1998-07-01" }), storm({ year: 2004 })],
      "year",
    );
    expect(Object.keys(grouped)).toEqual(["2004"]);
    expect(YEAR_CUTOFF).toBe(2000);
  });

  it("counts a carried-over storm toward January rather than its December start", () => {
    const grouped = groupStorms([storm({ year: 2019, dateStart: "2018-12-28" })], "month");
    expect(Object.keys(grouped)).toEqual(["1"]);
  });

  it("keeps every season for a grouping the cutoff does not apply to", () => {
    const grouped = groupStorms(
      [storm({ year: 1998, position: 3 }), storm({ year: 2024, position: 3 })],
      "position",
    );
    expect(grouped["3"]).toHaveLength(2);
  });
});

describe("buildStatRows", () => {
  const storms = [
    storm({ name: "Yagi", year: 2018, intensity: "TS", dateStart: "2018-08-08" }),
    storm({ name: "Yagi", year: 2024, intensity: "5", dateStart: "2024-08-31" }),
  ];

  it("averages intensity onto the −2 to 5 scale", () => {
    const [row] = buildStatRows(storms, "intensity", "name");
    expect(row.key).toBe("Yagi");
    expect(row.count).toBe(2);
    expect(row.value).toBeCloseTo(2.5);
    expect(row.display).toBe("2.50");
  });

  it("measures recurrence as the gap in years between reuses", () => {
    const [row] = buildStatRows(storms, "recurrence", "name");
    expect(row.value).toBe(6);
    expect(row.display).toBe("6.00");
  });

  it("reports a lone storm as unmeasurable rather than as a zero gap", () => {
    const [row] = buildStatRows([storms[0]], "recurrence", "name");
    expect(row.value).toBe(-1);
    expect(row.display).toBe("N/A");
  });

  it("carries start, end and duration for the dates metric only", () => {
    const [dates] = buildStatRows(storms, "dates", "name");
    expect(dates.startDoy).toBeGreaterThan(0);
    expect(dates.endDoy).toBeGreaterThan(0);
    expect(dates.duration).toBeGreaterThanOrEqual(0);
    expect(dates.display).toContain("–");

    const [intensity] = buildStatRows(storms, "intensity", "name");
    expect(intensity.startDoy).toBeUndefined();
    expect(intensity.duration).toBeUndefined();
  });

  it("titles a position group by its grid label and a month by its name", () => {
    expect(buildStatRows(storms, "intensity", "position")[0].label).toBe("2E");
    expect(buildStatRows(storms, "intensity", "month")[0].label).toBe("August");
  });

  it("orders year and month as a sequence, not as a ranking", () => {
    const seasons = [
      storm({ year: 2024, dateStart: "2024-08-31" }),
      storm({ year: 2004, dateStart: "2004-08-31" }),
      storm({ year: 2014, dateStart: "2014-08-31" }),
    ];
    expect(buildStatRows(seasons, "intensity", "year").map((row) => row.key)).toEqual([
      "2004",
      "2014",
      "2024",
    ]);
  });

  it("names the country group by its own key rather than by the first storm", () => {
    const [row] = buildStatRows([storm({ country: "Vietnam" })], "intensity", "country");
    expect(row.key).toBe("Vietnam");
    expect(row.country).toBe("Vietnam");
  });
});

describe("statColorsByKey", () => {
  it("hands the grid the same colour the list card uses", () => {
    const rows = buildStatRows([storm({ name: "Yagi" })], "intensity", "name");
    expect(statColorsByKey(rows)).toEqual({ Yagi: rows[0].color });
  });
});
