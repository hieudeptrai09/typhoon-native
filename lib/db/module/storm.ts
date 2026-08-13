import type { Storm } from "@/lib/types";

// Shape of a full storm projection.
// Field types are what postgres.js hands back for the underlying column types, not what the domain type wants — see toStorm for the gap.
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

export const stormColumns = (stormAlias = "s", positionAlias = "p") =>
  `${stormAlias}.position,
      ${positionAlias}.country,
      ${stormAlias}.name,
      ${stormAlias}.intensity,
      ${stormAlias}.map,
      ${stormAlias}.correctspelling AS "correctSpelling",
      ${stormAlias}.year,
      ${stormAlias}.isstrongest AS "isStrongest",
      ${stormAlias}.startdate::text AS "dateStart",
      ${stormAlias}.enddate::text AS "dateEnd",
      LPAD(${stormAlias}.jtwcnumber::text, 2, '0') || ${positionAlias}.suffix::text AS "jtwcDesignation",
      ${stormAlias}.isfirst AS "isFirst",
      ${stormAlias}.islast AS "isLast"`;

export const stormJoin = (stormAlias = "s", positionAlias = "p") =>
  `INNER JOIN positions ${positionAlias} ON ${stormAlias}.position = ${positionAlias}.id`;

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
