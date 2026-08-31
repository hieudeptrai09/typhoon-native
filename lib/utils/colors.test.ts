import { GRID_EMPTY_CELL_COLOR, STORM_COUNT_COLORS } from "@/lib/constants/colors";
import { getStormCountColor } from "@/lib/utils/colors";

const [BEHIND, BUSIEST] = STORM_COUNT_COLORS;

describe("getStormCountColor", () => {
  it("draws only the two shades the palette holds", () => {
    expect(STORM_COUNT_COLORS).toHaveLength(2);
    for (const max of [1, 2, 5, 6, 16]) {
      for (let count = 1; count <= max; count++) {
        expect(STORM_COUNT_COLORS).toContain(getStormCountColor(count, max));
      }
    }
  });

  it("gives the busiest positions the darker shade and the count below them the lighter", () => {
    expect(getStormCountColor(5, 5)).toBe(BUSIEST);
    expect(getStormCountColor(4, 5)).toBe(BEHIND);
  });

  it("hands both shades down a count once the table gets busier", () => {
    expect(getStormCountColor(6, 6)).toBe(BUSIEST);
    expect(getStormCountColor(5, 6)).toBe(BEHIND);
    expect(getStormCountColor(4, 6)).toBe(BEHIND);
  });

  it("keeps the two shades meaning the same thing at any maximum", () => {
    for (const max of [2, 3, 5, 6, 12]) {
      expect(getStormCountColor(max, max)).toBe(BUSIEST);
      expect(getStormCountColor(max - 1, max)).toBe(BEHIND);
    }
  });

  it("puts everything further down with the count below the busiest", () => {
    expect(getStormCountColor(1, 6)).toBe(BEHIND);
    expect(getStormCountColor(3, 16)).toBe(BEHIND);
  });

  it("keeps an empty position off the palette entirely", () => {
    expect(getStormCountColor(0, 5)).toBe(GRID_EMPTY_CELL_COLOR);
  });
});
