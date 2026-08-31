import {
  getEffectiveMonth,
  getHighlights,
  getStormsByIntensity,
} from "@/lib/utils/storm/highlights";
import { storm } from "@/lib/utils/storm/testFixtures";

describe("getHighlights", () => {
  const storms = [
    storm({ name: "Yagi", isStrongest: true }),
    storm({ name: "Haiyan", isFirst: true }),
    storm({ name: "Nakri", isLast: true }),
  ];

  it("selects by the requested flag", () => {
    expect(getHighlights(storms, "strongest").map((s) => s.name)).toEqual(["Yagi"]);
    expect(getHighlights(storms, "first").map((s) => s.name)).toEqual(["Haiyan"]);
    expect(getHighlights(storms, "last").map((s) => s.name)).toEqual(["Nakri"]);
  });

  it("returns nothing for an unknown highlight type", () => {
    expect(getHighlights(storms, "bogus")).toEqual([]);
  });
});

describe("getStormsByIntensity", () => {
  const storms = [
    storm({ name: "Krathon", intensity: "MD" }),
    storm({ name: "Yagi", intensity: "5" }),
    storm({ name: "Trami", intensity: "MD" }),
  ];

  it("keeps only the storms that peaked at the given intensity", () => {
    expect(getStormsByIntensity(storms, "MD").map((s) => s.name)).toEqual(["Krathon", "Trami"]);
    expect(getStormsByIntensity(storms, "5").map((s) => s.name)).toEqual(["Yagi"]);
    expect(getStormsByIntensity(storms, "TD")).toEqual([]);
  });

  it("selects nothing when the slug did not resolve to an intensity", () => {
    expect(getStormsByIntensity(storms, null)).toEqual([]);
  });
});

describe("getEffectiveMonth", () => {
  it("uses the start month for an ordinary storm", () => {
    expect(getEffectiveMonth(storm({ year: 2024, dateStart: "2024-08-31" }))).toBe(8);
  });

  it("counts a carried-over storm toward January", () => {
    expect(getEffectiveMonth(storm({ year: 2001, dateStart: "2000-12-28" }))).toBe(1);
  });

  it("ignores seasons before the 2000 cutoff", () => {
    expect(getEffectiveMonth(storm({ year: 1999, dateStart: "1999-08-31" }))).toBeNull();
  });
});
