const POSITION_SLUGS: Record<number, string> = {
  141: "cphc",
  142: "nhc",
  143: "imd",
};

const SLUG_POSITIONS: Record<string, number> = Object.fromEntries(
  Object.entries(POSITION_SLUGS).map(([id, slug]) => [slug, Number(id)]),
);

// The naming table is a fixed grid of GRID_ROWS × GRID_COLS, filled left-to-right, top-to-bottom, so a position maps to a "row + country-column letter" label (e.g. 37 → "3I").
export const GRID_ROWS = 10;
export const GRID_COLS = 14;
const GRID_MAX = GRID_ROWS * GRID_COLS; // 140

export const positionColumnLetter = (col: number): string => String.fromCharCode(65 + col);

const positionGridLabel = (position: number): string | null => {
  if (!Number.isInteger(position) || position < 1 || position > GRID_MAX) return null;
  const row = Math.floor((position - 1) / GRID_COLS) + 1;
  return `${row}${positionColumnLetter((position - 1) % GRID_COLS)}`;
};

export const getPositionTitle = (position: number): string => {
  const slug = POSITION_SLUGS[position];
  if (slug) return slug.toUpperCase();
  return positionGridLabel(position) ?? `#${position}`;
};

// Positions outside the grid belong to another basin's agency (CPHC/NHC/IMD) rather than the naming table.
export const isExternalPosition = (position?: number): boolean =>
  position !== undefined && (position < 1 || position > GRID_MAX);

// The agency positions as a render-ready list; integer-like keys iterate in ascending id order.
export const SPECIAL_POSITIONS = Object.entries(POSITION_SLUGS).map(([id, slug]) => ({
  id: Number(id),
  label: slug.toUpperCase(),
}));

// Parse a grid label ("3I" / "3i") or a plain number ("37") into a 1–140 position, else null.
export const parsePositionLabel = (input: string): number | null => {
  const trimmed = input.trim().toUpperCase();
  if (!trimmed) return null;

  const gridMatch = trimmed.match(/^(\d{1,2})([A-N])$/);
  if (gridMatch) {
    const row = Number(gridMatch[1]);
    const col = gridMatch[2].charCodeAt(0) - 65;
    if (row < 1 || row > GRID_ROWS || col < 0 || col >= GRID_COLS) return null;
    return (row - 1) * GRID_COLS + col + 1;
  }

  const num = Number(trimmed);
  return Number.isInteger(num) && num >= 1 && num <= GRID_MAX ? num : null;
};

// Filters pick a grid cell by its two visible coordinates (row number + country column) rather than
// by the "3I" code, so a value only resolves to a position once both halves are chosen.
export interface PositionValue {
  row?: number;
  col?: number;
}

// The empty value spells out both keys because Form.setFieldsValue merges plain objects into the
// store: a bare {} would merge nothing and leave the previous pick in place.
export const positionToValue = (position: number | null): PositionValue =>
  position != null && position >= 1 && position <= GRID_MAX
    ? { row: Math.floor((position - 1) / GRID_COLS) + 1, col: (position - 1) % GRID_COLS }
    : { row: undefined, col: undefined };

export const positionFromValue = (value?: PositionValue): number | null =>
  value?.row != null && value.col != null ? (value.row - 1) * GRID_COLS + value.col + 1 : null;

export const isPartialPosition = (value?: PositionValue) =>
  (value?.row != null) !== (value?.col != null);

// URLs carry the lowercase grid label ("3i"), so the page redirects /positions/3I/ and /positions/37/ onto it.
export const getPositionSlug = (position: number): string =>
  POSITION_SLUGS[position] ?? positionGridLabel(position)?.toLowerCase() ?? String(position);

export const getPositionFromSlug = (slug: string): number | null => {
  if (slug in SLUG_POSITIONS) return SLUG_POSITIONS[slug];
  const gridPosition = parsePositionLabel(slug);
  if (gridPosition !== null) return gridPosition;
  const num = Number(slug);
  // Out-of-grid integers pass through so the caller can range-check and 404;
  // Number("") is 0, so an empty slug needs its own rejection.
  return slug.trim() !== "" && Number.isInteger(num) ? num : null;
};
