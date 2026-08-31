import type { DashboardParams } from "@/lib/types";
import {
  filtersForView,
  groupBlockedReason,
  hasGrid,
  hasList,
  isKnownView,
  layoutBlockedReason,
  normalizeParams,
  paramsForView,
} from "@/lib/utils/storm/routing";

const params = (over: Partial<DashboardParams> = {}): DashboardParams => ({
  view: "all",
  metric: "",
  filter: "position",
  mode: "table",
  ...over,
});

describe("isKnownView", () => {
  it("knows the three dashboard views and nothing else", () => {
    expect(isKnownView("all")).toBe(true);
    expect(isKnownView("records")).toBe(true);
    expect(isKnownView("stats")).toBe(true);
    // The views these three replaced must not linger as valid input.
    expect(isKnownView("highlights")).toBe(false);
    expect(isKnownView("intensity")).toBe(false);
    expect(isKnownView("average")).toBe(false);
    expect(isKnownView("calendar")).toBe(false);
  });
});

describe("filtersForView", () => {
  it("offers records both the highlight kinds and every intensity", () => {
    const filters = filtersForView("records", "");
    expect(filters.slice(0, 3)).toEqual(["strongest", "first", "last"]);
    expect(filters).toContain("md");
    expect(filters).toContain("cat5");
    expect(filters).toHaveLength(12);
  });

  it("narrows the stats groupings to what the metric can be computed over", () => {
    expect(filtersForView("stats", "intensity")).toHaveLength(5);
    expect(filtersForView("stats", "recurrence")).toEqual(["position", "name"]);
    expect(filtersForView("stats", "dates")).not.toContain("month");
  });
});

describe("hasGrid", () => {
  it("gives every non-stats view a grid, whatever it is grouped by", () => {
    expect(hasGrid("all", "position")).toBe(true);
    expect(hasGrid("all", "name")).toBe(true);
    expect(hasGrid("records", "cat5")).toBe(true);
  });

  it("only grids the stats groupings that sit on the naming table", () => {
    expect(hasGrid("stats", "position")).toBe(true);
    expect(hasGrid("stats", "name")).toBe(true);
    expect(hasGrid("stats", "country")).toBe(false);
    expect(hasGrid("stats", "year")).toBe(false);
    expect(hasGrid("stats", "month")).toBe(false);
  });
});

describe("hasList", () => {
  it("keeps the storms list under the name grouping only", () => {
    expect(hasList("all", "name")).toBe(true);
    expect(hasList("all", "position")).toBe(false);
  });

  it("lists every other view whatever it is grouped by", () => {
    expect(hasList("records", "cat5")).toBe(true);
    expect(hasList("stats", "position")).toBe(true);
    expect(hasList("stats", "country")).toBe(true);
  });
});

describe("normalizeParams", () => {
  it("leaves a legal combination alone", () => {
    expect(normalizeParams(params({ view: "stats", metric: "dates", filter: "name" }))).toEqual({
      view: "stats",
      metric: "dates",
      filter: "name",
      mode: "table",
    });
  });

  it("drops a metric on the views that compute none", () => {
    expect(normalizeParams(params({ view: "all", metric: "recurrence" })).metric).toBe("");
  });

  it("falls back to a grouping the metric supports", () => {
    expect(
      normalizeParams(params({ view: "stats", metric: "recurrence", filter: "country" })).filter,
    ).toBe("position");
    expect(
      normalizeParams(params({ view: "stats", metric: "dates", filter: "month" })).filter,
    ).toBe("position");
  });

  it("forces list mode where the grouping has no grid", () => {
    expect(
      normalizeParams(params({ view: "stats", metric: "intensity", filter: "year" })).mode,
    ).toBe("list");
  });

  it("keeps list mode where a grid does exist", () => {
    expect(normalizeParams(params({ view: "all", filter: "name", mode: "list" })).mode).toBe(
      "list",
    );
  });

  it("rescues an unknown view rather than rendering nothing", () => {
    expect(normalizeParams(params({ view: "avgdate", filter: "position" })).view).toBe("all");
  });
});

describe("paramsForView", () => {
  it("opens each view on a pairing it can actually draw", () => {
    expect(paramsForView("all")).toEqual({
      view: "all",
      metric: "",
      filter: "position",
      mode: "table",
    });
    expect(paramsForView("records")).toEqual({
      view: "records",
      metric: "",
      filter: "strongest",
      mode: "table",
    });
    expect(paramsForView("stats")).toEqual({
      view: "stats",
      metric: "intensity",
      filter: "position",
      mode: "table",
    });
  });
});

describe("groupBlockedReason", () => {
  it("blocks only the grouping the list cannot show", () => {
    expect(groupBlockedReason("all", "", "position", "list")).toBe(
      "Not available in the list layout",
    );
    expect(groupBlockedReason("all", "", "name", "list")).toBeNull();
    expect(groupBlockedReason("all", "", "position", "table")).toBeNull();
  });

  it("marks the groupings a metric cannot be computed over", () => {
    expect(groupBlockedReason("stats", "recurrence", "year", "table")).toBe(
      "Not available for this metric",
    );
    expect(groupBlockedReason("stats", "dates", "month", "list")).toBe(
      "Not available for this metric",
    );
    expect(groupBlockedReason("stats", "intensity", "month", "list")).toBeNull();
  });

  it("never blocks a grouping on the records view", () => {
    expect(groupBlockedReason("records", "", "cat5", "table")).toBeNull();
  });
});

describe("layoutBlockedReason", () => {
  it("explains a missing grid only while the grid is the one being asked for", () => {
    expect(layoutBlockedReason("stats", "country", "table")).toBe(
      "Not available for this grouping",
    );
    expect(layoutBlockedReason("stats", "country", "list")).toBeNull();
    expect(layoutBlockedReason("stats", "position", "table")).toBeNull();
  });

  it("blocks the list for storms by position, and the grid for nothing there", () => {
    expect(layoutBlockedReason("all", "position", "list")).toBe("Not available for this grouping");
    expect(layoutBlockedReason("all", "position", "table")).toBeNull();
    expect(layoutBlockedReason("all", "name", "list")).toBeNull();
  });
});
