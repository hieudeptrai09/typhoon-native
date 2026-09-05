import {
  capitalize,
  formatPaceDelta,
  formatPaceGap,
  roundPaceDelta,
} from "@/lib/utils/format";

describe("capitalize", () => {
  it("uppercases the first character only", () => {
    expect(capitalize("strongest")).toBe("Strongest");
    expect(capitalize("avgdate")).toBe("Avgdate");
  });

  it("tolerates an empty string", () => {
    expect(capitalize("")).toBe("");
  });
});

describe("pace delta", () => {
  it("collapses a gap that rounds to zero, sign and all", () => {
    expect(roundPaceDelta(-0.04)).toBe(0);
    expect(Object.is(roundPaceDelta(-0.04), 0)).toBe(true);
    expect(formatPaceDelta(-0.04)).toBe("0.0");
    expect(formatPaceDelta(0.049)).toBe("0.0");
    expect(formatPaceGap(-0.04)).toBe("0.0");
  });

  it("keeps a gap that still shows at one decimal", () => {
    expect(formatPaceDelta(0.05)).toBe("+0.1");
    expect(formatPaceDelta(-0.06)).toBe("-0.1");
    expect(formatPaceDelta(2.34)).toBe("+2.3");
    expect(formatPaceGap(-1.25)).toBe("1.2");
  });
});
