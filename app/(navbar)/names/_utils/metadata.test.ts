import { getNamesDescription, getNamesTitle } from "@/app/(navbar)/names/_utils/metadata";
import { getCanonicalNamesSlugs, slugToParams } from "@/app/(navbar)/names/_utils/routing";
import { SERVED_SLUGS } from "@/app/(navbar)/names/_utils/testFixtures";

describe("getNamesTitle", () => {
  it("titles by view, with history taking precedence over the default", () => {
    expect(getNamesTitle({ view: "retired" })).toBe("Retired Typhoon Names");
    expect(getNamesTitle({ view: "grid", showName: true, showHistory: true })).toBe(
      "Typhoon Name History",
    );
    expect(getNamesTitle({ view: "grid", showName: true, showHistory: false })).toBe(
      "Current Typhoon Names",
    );
    expect(getNamesTitle({ view: "list", showHistory: false })).toBe("Current Typhoon Names");
  });

  it("gives every served slug a title", () => {
    for (const [, slug] of SERVED_SLUGS) {
      expect(getNamesTitle(slugToParams(slug)).length).toBeGreaterThan(0);
    }
  });
});

describe("getNamesDescription", () => {
  it("describes each view distinctly", () => {
    const retired = getNamesDescription({ view: "retired" });
    const list = getNamesDescription({ view: "list", showHistory: false });
    const grid = getNamesDescription({ view: "grid", showName: true, showHistory: false });
    expect(new Set([retired, list, grid]).size).toBe(3);
  });

  it("varies the grid description by the name and history toggles", () => {
    const variants = [
      getNamesDescription({ view: "grid", showName: true, showHistory: true }),
      getNamesDescription({ view: "grid", showName: false, showHistory: true }),
      getNamesDescription({ view: "grid", showName: true, showHistory: false }),
      getNamesDescription({ view: "grid", showName: false, showHistory: false }),
    ];
    expect(new Set(variants).size).toBe(4);
  });

  it("has a description for every canonical slug", () => {
    for (const slug of getCanonicalNamesSlugs()) {
      expect(getNamesDescription(slugToParams(slug)).length).toBeGreaterThan(0);
    }
  });
});
