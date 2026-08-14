// The naming table is a fixed grid of GRID_ROWS × GRID_COLS, filled left-to-right, top-to-bottom, so a position maps to a "row + country-column letter" label (e.g. 37 → "3I").
export const GRID_ROWS = 10;
export const GRID_COLS = 14;
export const GRID_MAX = GRID_ROWS * GRID_COLS;

// Positions outside the grid belong to another basin's agency rather than the naming table.
export const POSITION_SLUGS: Record<number, string> = {
  141: "cphc",
  142: "nhc",
  143: "imd",
};

export const SLUG_POSITIONS: Record<string, number> = Object.fromEntries(
  Object.entries(POSITION_SLUGS).map(([id, slug]) => [slug, Number(id)]),
);

export const TOTAL_POSITIONS = Math.max(GRID_MAX, ...Object.keys(POSITION_SLUGS).map(Number));

// Integer-like keys iterate in ascending id order, so the list needs no sort.
export const SPECIAL_POSITIONS = Object.entries(POSITION_SLUGS).map(([id, slug]) => ({
  id: Number(id),
  label: slug.toUpperCase(),
}));
