import sql from "@/lib/db";
import type { IntensityType } from "@/lib/types";
import { unstable_cache } from "next/cache";

export interface OnThisDayStorm {
  name: string;
  intensity: IntensityType;
  position: number;
  year: number;
  dateStart: string;
  dateEnd: string | null;
  reason: "started" | "ended" | "both";
}

interface OnThisDayRow {
  name: string;
  intensity: string;
  position: number;
  year: number;
  dateStart: string;
  dateEnd: string | null;
}

async function queryOnThisDay(
  day: number,
  month: number,
): Promise<{ count: number; data: OnThisDayStorm[] }> {
  const query = `SELECT
      s.name,
      s.intensity,
      s.position,
      s.year,
      s.startdate::text AS "dateStart",
      s.enddate::text AS "dateEnd"
    FROM storms s
    WHERE (EXTRACT(MONTH FROM s.startdate) = $1 AND EXTRACT(DAY FROM s.startdate) = $2)
       OR (EXTRACT(MONTH FROM s.enddate) = $1 AND EXTRACT(DAY FROM s.enddate) = $2)
    ORDER BY s.year ASC`;

  const rows = await sql.query<OnThisDayRow[]>(query, [month, day]);

  // "MM-DD" suffix of a "YYYY-MM-DD" date, for comparing against today.
  const monthDay = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const data: OnThisDayStorm[] = rows.map((row) => {
    const startedToday = row.dateStart.slice(5) === monthDay;
    const endedToday = row.dateEnd?.slice(5) === monthDay;
    const reason: "started" | "ended" | "both" =
      startedToday && endedToday ? "both" : startedToday ? "started" : "ended";

    return {
      name: row.name,
      intensity: row.intensity as IntensityType,
      position: Number(row.position),
      year: Number(row.year),
      dateStart: row.dateStart,
      dateEnd: row.dateEnd,
      reason,
    };
  });

  return { count: data.length, data };
}

export const getOnThisDay = unstable_cache(queryOnThisDay, ["getOnThisDay"], {
  revalidate: 3600,
});
