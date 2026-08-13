import sql from "@/lib/db";
import type { IntensityType } from "@/lib/types";
import { unstable_cache } from "next/cache";

export interface ActiveOnThisDayStorm {
  name: string;
  intensity: IntensityType;
  position: number;
  year: number;
  dateStart: string;
  dateEnd: string | null; // null while the storm is still ongoing
}

interface ActiveOnThisDayRow {
  name: string;
  intensity: string;
  position: number;
  year: number;
  dateStart: string;
  dateEnd: string | null;
}

async function queryActiveOnThisDay(
  day: number,
  month: number,
): Promise<{ count: number; data: ActiveOnThisDayStorm[] }> {
  const query = `SELECT
      s.position,
      s.name,
      s.intensity,
      s.year,
      s.startdate::text AS "dateStart",
      s.enddate::text AS "dateEnd"
    FROM storms s
    WHERE (s.enddate IS NULL AND s.startdate <= CURRENT_DATE)
      OR (s.enddate IS NOT NULL
        AND CASE WHEN EXTRACT(YEAR FROM s.enddate) = EXTRACT(YEAR FROM s.startdate)
          THEN to_char(s.startdate, 'MMDD')::int <= $1::int * 100 + $2::int
           AND to_char(s.enddate, 'MMDD')::int >= $1::int * 100 + $2::int
          ELSE to_char(s.startdate, 'MMDD')::int <= $1::int * 100 + $2::int
            OR to_char(s.enddate, 'MMDD')::int >= $1::int * 100 + $2::int
        END)
    ORDER BY s.year ASC`;

  const rows = await sql.query<ActiveOnThisDayRow[]>(query, [month, day]);

  const data: ActiveOnThisDayStorm[] = rows.map((row) => ({
    name: row.name,
    intensity: row.intensity as IntensityType,
    position: Number(row.position),
    year: Number(row.year),
    dateStart: row.dateStart,
    dateEnd: row.dateEnd,
  }));

  return { count: data.length, data };
}

export const getActiveOnThisDay = unstable_cache(queryActiveOnThisDay, ["getActiveOnThisDay"], {
  revalidate: 3600,
});
