import {
  getEffectiveMonth,
  getHighlights,
  getStormsByIntensity,
} from "@/app/(navbar)/storms/_utils/stats";
import { storm } from "@/lib/testFixtures";

describe("getHighlights", () => {
  const storms = [
    storm({ name: "Yagi", isStrongest: true }),
    storm({ name: "Haiyan", isFirst: true }),
    storm({ name: "Nakri", isLast: true }),
    storm({ name: "Krathon", intensity: "MD" }),
  ];

  it("selects by the requested flag", () => {
    expect(getHighlights(storms, "strongest").map((s) => s.name)).toEqual(["Yagi"]);
    expect(getHighlights(storms, "first").map((s) => s.name)).toEqual(["Haiyan"]);
    expect(getHighlights(storms, "last").map((s) => s.name)).toEqual(["Nakri"]);
  });

  it("no longer answers for intensity — that moved to its own view", () => {
    expect(getHighlights(storms, "untracked")).toEqual([]);
  });

  it("returns nothing for an unknown highlight type", () => {
    expect(getHighlights(storms, "bogus")).toEqual([]);
  });
});

describe("getStormsByIntensity", () => {
  const storms = [
    storm({ name: "Yagi", intensity: "5" }),
    storm({ name: "Krathon", intensity: "MD" }),
    storm({ name: "Nakri", intensity: "MD" }),
  ];

  it("selects the storms that peaked at exactly that intensity", () => {
    expect(getStormsByIntensity(storms, "MD").map((s) => s.name)).toEqual(["Krathon", "Nakri"]);
    expect(getStormsByIntensity(storms, "5").map((s) => s.name)).toEqual(["Yagi"]);
    expect(getStormsByIntensity(storms, "1")).toEqual([]);
  });

  it("selects nothing when the slug named no intensity", () => {
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
