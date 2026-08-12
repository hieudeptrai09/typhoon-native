import { getDashboardDescription, getDashboardTitle } from "@/app/(navbar)/storms/_utils/metadata";
import { getCanonicalStormsSlugs, slugToParams } from "@/app/(navbar)/storms/_utils/routing";

describe("getDashboardTitle", () => {
  it("titles the storms view by its filter", () => {
    expect(getDashboardTitle("all", "table", "position")).toBe("All Storms by Position");
    expect(getDashboardTitle("all", "table", "name")).toBe("All Storms by Name");
  });

  it("defaults to the storms view", () => {
    expect(getDashboardTitle(undefined, undefined, "name")).toBe("All Storms by Name");
  });

  it("capitalizes the filter into the other view titles", () => {
    expect(getDashboardTitle("highlights", "table", "strongest")).toBe(
      "Strongest Typhoons by Position",
    );
    expect(getDashboardTitle("average", "list", "country")).toBe("Average Intensity by Country");
    expect(getDashboardTitle("recurrence", "table", "name")).toBe(
      "Average Storm Recurrence by Name",
    );
    expect(getDashboardTitle("avgdate", "table", "position")).toBe(
      "Average Storm Dates by Position",
    );
  });

  it("takes the first value of a repeated query param", () => {
    expect(getDashboardTitle(["average"], "list", ["country"])).toBe(
      "Average Intensity by Country",
    );
  });

  it("falls back to the all-storms title rather than returning nothing", () => {
    expect(getDashboardTitle("bogus", "table", "bogus")).toBe("All Storms by Name");
  });
});

describe("getDashboardDescription", () => {
  it("describes each storms mode differently", () => {
    const table = getDashboardDescription("all", "table", "position");
    const list = getDashboardDescription("all", "list", "name");
    expect(table).not.toBe(list);
    expect(table.length).toBeGreaterThan(0);
  });

  it("has a description for every valid view/filter pairing", () => {
    for (const slug of getCanonicalStormsSlugs()) {
      const { view, mode, filter } = slugToParams(slug);
      expect(getDashboardDescription(view, mode, filter).length).toBeGreaterThan(0);
    }
  });

  it("falls back rather than returning nothing for an unknown filter", () => {
    expect(getDashboardDescription("average", "table", "bogus").length).toBeGreaterThan(0);
    expect(getDashboardDescription("bogus", "table", "bogus").length).toBeGreaterThan(0);
  });
});
