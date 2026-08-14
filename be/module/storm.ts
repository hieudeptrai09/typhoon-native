import type { Storm } from "@/lib/types";

// Mirrors the v_storms view in db/functions.sql: field types are what the columns emit, not what
// the domain type wants — toStorm closes the gap.
export interface StormRow {
  position: number;
  country: string;
  name: string;
  intensity: string;
  map: string | null;
  correctSpelling: string | null;
  year: number;
  isStrongest: boolean;
  dateStart: string;
  dateEnd: string | null;
  jtwcDesignation: string | null;
  isFirst: boolean;
  isLast: boolean;
}

export const toStorm = (row: StormRow): Storm => ({
  position: row.position,
  country: row.country,
  name: row.name,
  intensity: row.intensity as Storm["intensity"],
  map: row.map ?? "",
  correctSpelling: row.correctSpelling ?? undefined,
  year: row.year,
  isStrongest: row.isStrongest,
  dateStart: row.dateStart,
  dateEnd: row.dateEnd ?? undefined,
  jtwcDesignation: row.jtwcDesignation ?? undefined,
  isFirst: row.isFirst,
  isLast: row.isLast,
});
