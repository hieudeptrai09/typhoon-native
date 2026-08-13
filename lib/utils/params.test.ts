import { DELIMITER, normalizeParam, toArr, toStr } from "@/lib/utils/params";

describe("normalizeParam", () => {
  it("takes the first entry of a repeated query param", () => {
    expect(normalizeParam(["a", "b"])).toBe("a");
  });

  it("collapses every empty form to an empty string", () => {
    expect(normalizeParam([])).toBe("");
    expect(normalizeParam(undefined)).toBe("");
    expect(normalizeParam("")).toBe("");
  });

  it("passes a single value through", () => {
    expect(normalizeParam("retired")).toBe("retired");
  });
});

describe("delimited filter values", () => {
  it("splits and joins on the delimiter", () => {
    expect(toArr(`Japan${DELIMITER}Vietnam`)).toEqual(["Japan", "Vietnam"]);
    expect(toStr(["Japan", "Vietnam"])).toBe(`Japan${DELIMITER}Vietnam`);
  });

  it("treats an empty or absent value as no selection", () => {
    expect(toArr("")).toEqual([]);
    expect(toStr(undefined)).toBe("");
    expect(toStr([])).toBe("");
  });

  it("drops empty segments left by a stale delimiter", () => {
    expect(toArr("Japan||Vietnam")).toEqual(["Japan", "Vietnam"]);
  });
});
