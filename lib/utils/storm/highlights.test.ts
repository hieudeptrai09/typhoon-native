import type { StormHighlight } from "@/lib/types";
import {
  getEffectiveMonth,
  getHighlights,
  getStormsByIntensity,
  pickAnotherHighlight,
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

describe("pickAnotherHighlight", () => {
  const list = (...names: string[]): StormHighlight[] =>
    names.map((name, i) => ({ name, position: i + 1, status: "active" }));

  const DRAWS = 200;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("draws from the storms that are not the one showing", () => {
    const ongoing = list("Yagi", "Nakri", "Krathon");
    jest.spyOn(Math, "random").mockReturnValue(0);
    expect(pickAnotherHighlight(ongoing, "Yagi")).toBe("Nakri");
    jest.spyOn(Math, "random").mockReturnValue(0.99);
    expect(pickAnotherHighlight(ongoing, "Yagi")).toBe("Krathon");
  });

  it("draws from the whole list when nothing is showing yet", () => {
    jest.spyOn(Math, "random").mockReturnValue(0);
    expect(pickAnotherHighlight(list("Yagi", "Nakri"), null)).toBe("Yagi");
  });

  it("never returns the storm it was asked to move on from", () => {
    const outcomes: StormHighlight[][] = [
      list("Yagi", "Nakri"),
      list("Nakri", "Yagi"), // reordered
      list("Yagi", "Nakri", "Krathon"), // a storm started
      list("Yagi", "Krathon"), // a storm ended
      list("Krathon", "Trami"), // wholly replaced
    ];
    for (const outcome of outcomes) {
      for (let draw = 0; draw < DRAWS; draw++) {
        expect(pickAnotherHighlight(outcome, "Yagi")).not.toBe("Yagi");
      }
    }
  });

  it("reaches every other storm given enough taps", () => {
    const ongoing = list("Yagi", "Nakri", "Krathon", "Trami");
    const seen = new Set<string | null>();
    for (let draw = 0; draw < DRAWS; draw++) {
      seen.add(pickAnotherHighlight(ongoing, "Yagi"));
    }
    expect([...seen].sort()).toEqual(["Krathon", "Nakri", "Trami"]);
  });

  it("stays put when the storm it left is the only one remaining", () => {
    expect(pickAnotherHighlight(list("Yagi"), "Yagi")).toBe("Yagi");
  });

  it("has nothing to show for an empty list", () => {
    expect(pickAnotherHighlight([], "Yagi")).toBeNull();
  });
});
