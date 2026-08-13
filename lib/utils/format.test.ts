import { capitalize, getZoomEarthUrl } from "@/lib/utils/format";

describe("capitalize", () => {
  it("uppercases the first character only", () => {
    expect(capitalize("strongest")).toBe("Strongest");
    expect(capitalize("avgdate")).toBe("Avgdate");
  });

  it("tolerates an empty string", () => {
    expect(capitalize("")).toBe("");
  });
});

describe("getZoomEarthUrl", () => {
  it("builds a slugged storm URL", () => {
    expect(getZoomEarthUrl("Yagi", 2024)).toBe("https://zoom.earth/storms/yagi-2024/");
  });

  it("trims and hyphenates a multi-word name", () => {
    expect(getZoomEarthUrl("  Tropical Depression  ", 2001)).toBe(
      "https://zoom.earth/storms/tropical-depression-2001/",
    );
  });
});
