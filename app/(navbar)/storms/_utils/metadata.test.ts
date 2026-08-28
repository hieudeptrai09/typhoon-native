import { getDashboardDescription, getDashboardTitle } from "@/app/(navbar)/storms/_utils/metadata";
import { getCanonicalStormsSlugs, slugToParams } from "@/app/(navbar)/storms/_utils/routing";
import { INTENSITY_SLUGS_BY_STRENGTH } from "@/lib/utils/intensity";

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

  it("names the intensity in full rather than echoing the slug", () => {
    expect(getDashboardTitle("intensity", "table", "md")).toBe("Monsoon Depressions by Position");
    expect(getDashboardTitle("intensity", "list", "cat5")).toBe(
      "Category 5 Super Typhoons by Position",
    );
    expect(getDashboardTitle("intensity", "table", "bogus")).toBe("Storms by Intensity");
  });

  it("names the question a calendar page asks instead of capitalizing its filter", () => {
    expect(getDashboardTitle("calendar", "list", "started")).toBe("Seasons by Storm Start Date");
    expect(getDashboardTitle("calendar", "list", "ended")).toBe("Seasons by Storm End Date");
    expect(getDashboardTitle("calendar", "list", "active")).toBe("Seasons by Active Storm Date");
    expect(getDashboardTitle("calendar", "list", "todate")).toBe("Season Pace by Date");
    expect(getDashboardTitle("calendar", "list", "bogus")).toBe("Storms by Calendar Date");
  });

  it("gives every calendar page its own description", () => {
    const descriptions = ["started", "ended", "active", "todate"].map((slug) =>
      getDashboardDescription("calendar", "list", slug),
    );
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("gives every intensity page its own description", () => {
    const descriptions = INTENSITY_SLUGS_BY_STRENGTH.map((slug) =>
      getDashboardDescription("intensity", "table", slug),
    );
    expect(new Set(descriptions).size).toBe(descriptions.length);
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
