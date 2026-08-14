import type { FilterParams, RetiredFilterParams, RetiredName, TyphoonName } from "@/lib/types";
import {
  applyNameFilters,
  applyRetiredFilters,
  clearNameFilter,
  clearRetiredFilter,
  EMPTY_NAME_FILTERS,
  EMPTY_RETIRED_FILTERS,
  nameFilterChips,
  retiredFilterChips,
} from "@/lib/utils/name/filters";

const name = (overrides: Partial<TyphoonName> & { id: number; name: string }): TyphoonName => ({
  position: 1,
  meaning: "",
  country: "Cambodia",
  language: "Khmer",
  isRetired: false,
  isReplaced: false,
  tag: "Animal",
  ...overrides,
});

const retired = (overrides: Partial<RetiredName> & { id: number; name: string }): RetiredName => ({
  ...name(overrides),
  lastYear: 2013,
  replacementName: "",
  isRetired: true,
  ...overrides,
});

const withFilters = (overrides: Partial<FilterParams>): FilterParams => ({
  ...EMPTY_NAME_FILTERS,
  ...overrides,
});

const withRetiredFilters = (overrides: Partial<RetiredFilterParams>): RetiredFilterParams => ({
  ...EMPTY_RETIRED_FILTERS,
  ...overrides,
});

describe("applyNameFilters", () => {
  const names = [
    name({ id: 1, name: "Damrey", country: "Cambodia", language: "Khmer", tag: "Animal" }),
    name({ id: 2, name: "Haikui", country: "China", language: "Chinese", tag: "Plant" }),
    name({ id: 3, name: "Haiyan", country: "China", isRetired: true, isReplaced: true }),
    name({ id: 4, name: "Vongfong", country: "Macao", isRetired: true, isReplaced: false }),
  ];

  it("keeps everything when nothing is set", () => {
    expect(applyNameFilters(names, EMPTY_NAME_FILTERS)).toHaveLength(4);
  });

  it("matches a name on a case-insensitive substring", () => {
    expect(applyNameFilters(names, withFilters({ name: "hai" })).map((n) => n.name)).toEqual([
      "Haikui",
      "Haiyan",
    ]);
  });

  it("treats a multi-select as any-of", () => {
    expect(
      applyNameFilters(names, withFilters({ country: "China|Macao" })).map((n) => n.id),
    ).toEqual([2, 3, 4]);
  });

  it("counts a retired name as current until its replacement takes the slot", () => {
    expect(applyNameFilters(names, withFilters({ status: "current" })).map((n) => n.id)).toEqual([
      1, 2, 4,
    ]);
  });

  it("separates active from retired", () => {
    expect(applyNameFilters(names, withFilters({ status: "active" })).map((n) => n.id)).toEqual([
      1, 2,
    ]);
    expect(applyNameFilters(names, withFilters({ status: "retired" })).map((n) => n.id)).toEqual([
      3, 4,
    ]);
  });

  it("intersects across fields", () => {
    const filters = withFilters({ country: "China", tag: "Plant" });
    expect(applyNameFilters(names, filters).map((n) => n.id)).toEqual([2]);
  });
});

describe("applyRetiredFilters", () => {
  const names = [
    retired({ id: 1, name: "Haiyan", lastYear: 2013, retirementReason: "destructive" }),
    retired({ id: 2, name: "Vongfong", lastYear: 2020, retirementReason: "language" }),
    retired({ id: 3, name: "Hagibis", lastYear: 2019, retirementReason: "destructive" }),
  ];

  it("filters by year", () => {
    expect(
      applyRetiredFilters(names, withRetiredFilters({ year: "2019" })).map((n) => n.id),
    ).toEqual([3]);
  });

  it("treats reasons as any-of", () => {
    const filters = withRetiredFilters({ reason: "destructive|language" });
    expect(applyRetiredFilters(names, filters)).toHaveLength(3);
  });

  it("drops names whose reason is unset when a reason is asked for", () => {
    const unlabelled = [retired({ id: 4, name: "Rusa", retirementReason: undefined })];
    expect(applyRetiredFilters(unlabelled, withRetiredFilters({ reason: "special" }))).toEqual([]);
  });
});

describe("filter chips", () => {
  it("gives every value of a multi-select its own chip", () => {
    const chips = nameFilterChips(withFilters({ country: "China|Macao" }), false);
    expect(chips.map((chip) => chip.key)).toEqual(["country:China", "country:Macao"]);
  });

  it("hides the status chip outside the history scope", () => {
    const filters = withFilters({ status: "retired" });
    expect(nameFilterChips(filters, false)).toEqual([]);
    expect(nameFilterChips(filters, true).map((chip) => chip.label)).toEqual(["Retired"]);
  });

  it("labels a position by its grid cell", () => {
    const chips = nameFilterChips(withFilters({ position: "3" }), false);
    expect(chips).toEqual([{ key: "position", label: "1C" }]);
  });

  it("names a retirement reason in full", () => {
    const chips = retiredFilterChips(withRetiredFilters({ reason: "misspell" }));
    expect(chips).toEqual([{ key: "reason:misspell", label: "Misspelling" }]);
  });
});

describe("clearing one chip", () => {
  it("removes a single value and leaves the rest of the field", () => {
    const filters = withFilters({ country: "China|Macao|Japan" });
    expect(clearNameFilter(filters, "country:Macao").country).toBe("China|Japan");
  });

  it("empties a whole field when the chip names no value", () => {
    const filters = withFilters({ name: "Hai", country: "China" });
    const next = clearNameFilter(filters, "name");
    expect(next.name).toBe("");
    expect(next.country).toBe("China");
  });

  it("clears retired filters the same way", () => {
    const filters = withRetiredFilters({ year: "2013", reason: "destructive|language" });
    expect(clearRetiredFilter(filters, "reason:destructive").reason).toBe("language");
    expect(clearRetiredFilter(filters, "year").year).toBe("");
  });
});
