import { INTENSITY_LABEL, INTENSITY_SHORT_LABEL } from "@/lib/constants";
import type { IntensityType } from "@/lib/types";
import {
  getIntensitySlug,
  INTENSITIES_BY_STRENGTH,
  INTENSITY_SLUGS_BY_STRENGTH,
  intensityFromSlug,
} from "@/lib/utils/intensity";

describe("intensity slugs", () => {
  it("round-trips every intensity in the enum", () => {
    for (const intensity of Object.keys(INTENSITY_LABEL) as IntensityType[]) {
      expect(intensityFromSlug(getIntensitySlug(intensity))).toBe(intensity);
    }
  });

  it("spells the categories out so a URL segment is never a bare digit", () => {
    expect(getIntensitySlug("5")).toBe("cat5");
    expect(getIntensitySlug("MD")).toBe("md");
    expect(intensityFromSlug("5")).toBeNull();
    expect(intensityFromSlug("untracked")).toBeNull();
    expect(intensityFromSlug("")).toBeNull();
  });

  it("orders weakest first, the way the intensity legend reads", () => {
    expect(INTENSITY_SLUGS_BY_STRENGTH).toEqual([
      "md",
      "td",
      "ts",
      "sts",
      "cat1",
      "cat2",
      "cat3",
      "cat4",
      "cat5",
    ]);
  });

  it("covers the whole scale, with a chip label for each step", () => {
    expect(INTENSITIES_BY_STRENGTH).toHaveLength(Object.keys(INTENSITY_LABEL).length);
    for (const intensity of INTENSITIES_BY_STRENGTH) {
      expect(INTENSITY_SHORT_LABEL[intensity]).toBeTruthy();
    }
  });
});
