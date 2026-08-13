import {
  getPositionFromSlug,
  getPositionSlug,
  getPositionTitle,
  isExternalPosition,
  isPartialPosition,
  parsePositionLabel,
  positionColumnLetter,
  positionFromValue,
  positionToValue,
} from "@/lib/utils/position";

describe("positionColumnLetter", () => {
  it("letters the grid columns A through N", () => {
    expect(positionColumnLetter(0)).toBe("A");
    expect(positionColumnLetter(13)).toBe("N");
  });
});

describe("getPositionTitle", () => {
  it("maps the external-basin positions to their agency", () => {
    expect(getPositionTitle(141)).toBe("CPHC");
    expect(getPositionTitle(142)).toBe("NHC");
    expect(getPositionTitle(143)).toBe("IMD");
  });

  it("maps a grid position to its row + column letter", () => {
    expect(getPositionTitle(1)).toBe("1A");
    expect(getPositionTitle(14)).toBe("1N"); // last column of row 1
    expect(getPositionTitle(15)).toBe("2A"); // wraps to the next row
    expect(getPositionTitle(37)).toBe("3I");
    expect(getPositionTitle(140)).toBe("10N"); // last cell of the grid
  });

  it("falls back to #n outside the 1-140 grid", () => {
    expect(getPositionTitle(0)).toBe("#0");
    expect(getPositionTitle(144)).toBe("#144");
    expect(getPositionTitle(1.5)).toBe("#1.5");
  });
});

describe("isExternalPosition", () => {
  it("flags the positions that sit outside the naming grid", () => {
    expect(isExternalPosition(141)).toBe(true);
    expect(isExternalPosition(0)).toBe(true);
  });

  it("accepts every cell of the grid", () => {
    expect(isExternalPosition(1)).toBe(false);
    expect(isExternalPosition(37)).toBe(false);
    expect(isExternalPosition(140)).toBe(false);
  });

  it("treats a missing position as not external", () => {
    expect(isExternalPosition(undefined)).toBe(false);
  });
});

describe("parsePositionLabel", () => {
  it("parses a grid label, case-insensitively", () => {
    expect(parsePositionLabel("3I")).toBe(37);
    expect(parsePositionLabel("3i")).toBe(37);
    expect(parsePositionLabel("  3I  ")).toBe(37);
    expect(parsePositionLabel("1A")).toBe(1);
    expect(parsePositionLabel("10N")).toBe(140);
  });

  it("parses a plain position number", () => {
    expect(parsePositionLabel("37")).toBe(37);
    expect(parsePositionLabel("140")).toBe(140);
  });

  it("rejects anything outside the grid", () => {
    expect(parsePositionLabel("")).toBeNull();
    expect(parsePositionLabel("   ")).toBeNull();
    expect(parsePositionLabel("11A")).toBeNull(); // row past 10
    expect(parsePositionLabel("0A")).toBeNull(); // row before 1
    expect(parsePositionLabel("3O")).toBeNull(); // column past N
    expect(parsePositionLabel("0")).toBeNull();
    expect(parsePositionLabel("141")).toBeNull(); // external basins aren't grid cells
    expect(parsePositionLabel("abc")).toBeNull();
  });

  it("round-trips against getPositionTitle across the whole grid", () => {
    for (let position = 1; position <= 140; position++) {
      expect(parsePositionLabel(getPositionTitle(position))).toBe(position);
    }
  });
});

describe("position picker values", () => {
  it("splits a position into its row and column", () => {
    expect(positionToValue(1)).toEqual({ row: 1, col: 0 });
    expect(positionToValue(14)).toEqual({ row: 1, col: 13 });
    expect(positionToValue(37)).toEqual({ row: 3, col: 8 });
    expect(positionToValue(140)).toEqual({ row: 10, col: 13 });
  });

  it("yields an empty value outside the grid", () => {
    expect(positionFromValue(positionToValue(null))).toBeNull();
    expect(positionFromValue(positionToValue(0))).toBeNull();
    expect(positionFromValue(positionToValue(141))).toBeNull(); // external basins aren't grid cells
  });

  it("spells out both keys when empty, so setFieldsValue can merge the pick away", () => {
    expect(Object.keys(positionToValue(null))).toEqual(["row", "col"]);
  });

  it("resolves a position only once both halves are picked", () => {
    expect(positionFromValue({ row: 3, col: 8 })).toBe(37);
    expect(positionFromValue({ row: 3 })).toBeNull();
    expect(positionFromValue({ col: 8 })).toBeNull();
    expect(positionFromValue({})).toBeNull();
    expect(positionFromValue(undefined)).toBeNull();
  });

  it("flags a half-filled pick so the form can ask for the other half", () => {
    expect(isPartialPosition({ row: 3 })).toBe(true);
    expect(isPartialPosition({ col: 0 })).toBe(true);
    expect(isPartialPosition({ row: 3, col: 8 })).toBe(false);
    expect(isPartialPosition({})).toBe(false);
    expect(isPartialPosition(undefined)).toBe(false);
  });

  it("round-trips against positionToValue across the whole grid", () => {
    for (let position = 1; position <= 140; position++) {
      expect(positionFromValue(positionToValue(position))).toBe(position);
    }
  });
});

describe("position slugs", () => {
  it("slugs the external basins by agency and grid cells by lowercase label", () => {
    expect(getPositionSlug(141)).toBe("cphc");
    expect(getPositionSlug(37)).toBe("3i");
    expect(getPositionSlug(1)).toBe("1a");
    expect(getPositionSlug(140)).toBe("10n");
  });

  it("keeps digits for positions that have no grid label", () => {
    expect(getPositionSlug(999)).toBe("999");
    expect(getPositionSlug(0)).toBe("0");
  });

  it("round-trips every position the sitemap emits", () => {
    for (let position = 1; position <= 143; position++) {
      expect(getPositionFromSlug(getPositionSlug(position))).toBe(position);
    }
  });

  it("is the lowercase of the title for every grid cell", () => {
    for (let position = 1; position <= 140; position++) {
      expect(getPositionSlug(position)).toBe(getPositionTitle(position).toLowerCase());
    }
  });

  // The canonical slug is "3i", so these are the spellings the page redirects onto it.
  it("also accepts the uppercase label and the plain number as a slug", () => {
    expect(getPositionFromSlug("3i")).toBe(37);
    expect(getPositionFromSlug("3I")).toBe(37);
    expect(getPositionFromSlug("37")).toBe(37);
  });

  it("rejects a non-numeric slug", () => {
    expect(getPositionFromSlug("abc")).toBeNull();
    expect(getPositionFromSlug("3.5")).toBeNull();
    expect(getPositionFromSlug("")).toBeNull();
  });

  it("passes out-of-grid integers through for the caller to range-check", () => {
    expect(getPositionFromSlug("999")).toBe(999);
    expect(getPositionFromSlug("0")).toBe(0);
  });
});
