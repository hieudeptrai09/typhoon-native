import { getEffectiveMonth, getHighlights } from "@/app/(navbar)/storms/_utils/stats";
import { storm } from "@/lib/testFixtures";

describe("getHighlights", () => {
  const storms = [
    storm({ name: "Yagi", isStrongest: true }),
    storm({ name: "Haiyan", isFirst: true }),
    storm({ name: "Nakri", isLast: true }),
    storm({ name: "Krathon", intensity: "NT" }),
  ];

  it("selects by the requested flag", () => {
    expect(getHighlights(storms, "strongest").map((s) => s.name)).toEqual(["Yagi"]);
    expect(getHighlights(storms, "first").map((s) => s.name)).toEqual(["Haiyan"]);
    expect(getHighlights(storms, "last").map((s) => s.name)).toEqual(["Nakri"]);
    expect(getHighlights(storms, "untracked").map((s) => s.name)).toEqual(["Krathon"]);
  });

  it("returns nothing for an unknown highlight type", () => {
    expect(getHighlights(storms, "bogus")).toEqual([]);
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
