import {
  getCanonicalStormsSlugs,
  getLegendKind,
  isGridOnly,
  isListOnly,
  isValidStormsSlug,
  paramsForFilter,
  paramsForView,
  paramsToPath,
  slugToParams,
  slugToPath,
} from "@/app/(navbar)/storms/_utils/routing";

describe("isValidStormsSlug", () => {
  it("rejects the empty slug — /storms/ is a 404, not a page", () => {
    expect(isValidStormsSlug([])).toBe(false);
  });

  it("rejects every one-segment slug — the filter is never optional", () => {
    for (const slug of ["all", "highlights", "average", "recurrence", "avgdate"]) {
      expect(isValidStormsSlug([slug])).toBe(false);
    }
    for (const slug of ["list", "names", "positions", "storms"]) {
      expect(isValidStormsSlug([slug])).toBe(false);
    }
  });

  it("accepts a filter only when the view offers it", () => {
    expect(isValidStormsSlug(["average", "country"])).toBe(true);
    expect(isValidStormsSlug(["all", "position"])).toBe(true);
    expect(isValidStormsSlug(["all", "country"])).toBe(false); // country is average-only
    expect(isValidStormsSlug(["list", "position"])).toBe(false); // list is not a view
  });

  it("accepts list as the third segment only", () => {
    expect(isValidStormsSlug(["average", "country", "list"])).toBe(true);
    expect(isValidStormsSlug(["average", "country", "grid"])).toBe(false);
    expect(isValidStormsSlug(["average", "bogus", "list"])).toBe(false);
  });

  it("rejects unknown views and over-deep slugs", () => {
    expect(isValidStormsSlug(["bogus"])).toBe(false);
    expect(isValidStormsSlug(["average", "country", "list", "extra"])).toBe(false);
  });
});

describe("slugToParams", () => {
  it("reads the grid coordinates straight off the slug", () => {
    expect(slugToParams(["all", "name", "list"])).toEqual({
      view: "all",
      mode: "list",
      filter: "name",
    });
    expect(slugToParams(["all", "position"])).toEqual({
      view: "all",
      mode: "table",
      filter: "position",
    });
  });

  it("drops a list request the pairing cannot honour", () => {
    expect(slugToParams(["all", "position", "list"]).mode).toBe("table");
  });

  it("forces list mode for filters that have no grid", () => {
    expect(slugToParams(["average", "country"]).mode).toBe("list");
    expect(slugToParams(["average", "month"]).mode).toBe("list");
    expect(slugToParams(["average", "year"]).mode).toBe("list");
    expect(slugToParams(["average", "position"]).mode).toBe("table");
  });
});

describe("isListOnly / isGridOnly", () => {
  it("marks the average filters that only render as a list", () => {
    expect(isListOnly("average", "country")).toBe(true);
    expect(isListOnly("average", "month")).toBe(true);
    expect(isListOnly("average", "year")).toBe(true);
    expect(isListOnly("average", "position")).toBe(false);
    expect(isListOnly("recurrence", "country")).toBe(false);
  });

  it("marks all-storms-by-position as grid only", () => {
    expect(isGridOnly("all", "position")).toBe(true);
    expect(isGridOnly("all", "name")).toBe(false);
  });
});

describe("paramsForView / paramsForFilter", () => {
  it("pairs a view with its default filter and a legal mode", () => {
    expect(paramsForView("all")).toEqual({ view: "all", filter: "position", mode: "table" });
    expect(paramsForView("average")).toEqual({
      view: "average",
      filter: "position",
      mode: "table",
    });
  });

  it("overrides the requested mode when the pairing forbids it", () => {
    expect(paramsForFilter("all", "position", "list").mode).toBe("table"); // grid only
    expect(paramsForFilter("average", "country", "table").mode).toBe("list"); // list only
  });

  it("keeps the requested mode when both are allowed", () => {
    expect(paramsForFilter("average", "name", "list").mode).toBe("list");
    expect(paramsForFilter("average", "name", "table").mode).toBe("table");
  });
});

describe("paramsToPath", () => {
  it("builds every path from the same view/filter/mode template", () => {
    expect(paramsToPath({ view: "all", mode: "table", filter: "name" })).toBe("/storms/all/name/");
    expect(paramsToPath({ view: "all", mode: "list", filter: "name" })).toBe(
      "/storms/all/name/list/",
    );
    expect(paramsToPath({ view: "all", mode: "table", filter: "position" })).toBe(
      "/storms/all/position/",
    );
  });

  it("appends list/ for the list mode of other views", () => {
    expect(paramsToPath({ view: "average", mode: "table", filter: "year" })).toBe(
      "/storms/average/year/",
    );
    expect(paramsToPath({ view: "average", mode: "list", filter: "year" })).toBe(
      "/storms/average/year/list/",
    );
  });
});

describe("slugToPath", () => {
  it("joins the segments into a trailing-slash path", () => {
    expect(slugToPath(["all", "name"])).toBe("/storms/all/name/");
    expect(slugToPath(["average", "country", "list"])).toBe("/storms/average/country/list/");
  });
});

describe("getCanonicalStormsSlugs", () => {
  const canonical = getCanonicalStormsSlugs();

  it("only returns slugs the route accepts", () => {
    for (const slug of canonical) {
      expect(isValidStormsSlug(slug)).toBe(true);
    }
  });

  it("returns slugs that already sit at their own canonical path", () => {
    for (const slug of canonical) {
      expect(paramsToPath(slugToParams(slug))).toBe(slugToPath(slug));
    }
  });

  it("gives the sitemap no duplicate URLs", () => {
    const paths = canonical.map((slug) => slugToPath(slug));
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("never emits bare views — they are 404s, not redirects", () => {
    expect(canonical).not.toContainEqual(["highlights"]);
    expect(canonical).not.toContainEqual(["all"]);
  });

  it("never emits the empty slug — /storms/ is a 404, not a page", () => {
    expect(canonical).not.toContainEqual([]);
    expect(canonical).toContainEqual(["all", "name"]);
    expect(canonical).toContainEqual(["all", "position"]);
    expect(canonical).toContainEqual(["all", "name", "list"]);
  });
});

describe("getLegendKind", () => {
  const kind = (view: string, filter: string, mode: string) =>
    getLegendKind({ view, filter, mode });

  it("shows no legend where the storms grids render one flat color", () => {
    expect(kind("all", "position", "table")).toBeNull();
    expect(kind("all", "name", "table")).toBeNull();
  });

  it("shows the intensity scale only where color tracks intensity", () => {
    expect(kind("all", "name", "list")).toBe("intensity");
    expect(kind("highlights", "strongest", "list")).toBe("intensity");
    expect(kind("average", "position", "table")).toBe("intensity");
    expect(kind("average", "name", "table")).toBe("intensity");
    expect(kind("average", "year", "list")).toBe("intensity");
  });

  it("gives the categorical cell tints their own mini-key", () => {
    expect(kind("highlights", "strongest", "table")).toBe("highlight");
    expect(kind("highlights", "untracked", "table")).toBe("highlight");
  });

  it("keeps the gap and month legends on their own views", () => {
    expect(kind("recurrence", "position", "table")).toBe("recurrence");
    expect(kind("recurrence", "name", "list")).toBe("recurrence");
    expect(kind("avgdate", "position", "table")).toBe("avgdate");
    expect(kind("avgdate", "name", "list")).toBe("avgdate");
  });

  it("falls back to no legend for an unknown view", () => {
    expect(kind("nonsense", "position", "table")).toBeNull();
  });
});
