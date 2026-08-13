import rpc from "@/be";
import { cached } from "@/be/cache";
import type { IntensityType } from "@/lib/types";

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
  const rows = await rpc.call<OnThisDayRow[]>("get_on_this_day", { p_day: day, p_month: month });

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

export const getOnThisDay = cached(queryOnThisDay, ["getOnThisDay"], {
  revalidate: 3600,
});
