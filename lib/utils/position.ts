import {
  GRID_COLS,
  GRID_MAX,
  GRID_ROWS,
  POSITION_SLUGS,
  SLUG_POSITIONS,
  TOTAL_POSITIONS,
} from "@/lib/constants/position";
import type { PositionValue } from "@/lib/types";

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

export const isKnownPosition = (position: number | null): position is number =>
  position !== null && Number.isInteger(position) && position >= 1 && position <= TOTAL_POSITIONS;

/** Next/previous in the paging order, wrapping at both ends. */
export const stepPosition = (position: number, step: 1 | -1): number =>
  ((position - 1 + step + TOTAL_POSITIONS) % TOTAL_POSITIONS) + 1;

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

export const positionToValue = (position: number | null): PositionValue =>
  position != null && position >= 1 && position <= GRID_MAX
    ? { row: Math.floor((position - 1) / GRID_COLS) + 1, col: (position - 1) % GRID_COLS }
    : { row: undefined, col: undefined };

export const positionFromValue = (value?: PositionValue): number | null =>
  value?.row != null && value.col != null ? (value.row - 1) * GRID_COLS + value.col + 1 : null;

export const isPartialPosition = (value?: PositionValue) =>
  (value?.row != null) !== (value?.col != null);

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
