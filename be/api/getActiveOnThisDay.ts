import rpc from "@/be";
import { cached } from "@/be/cache";
import type { IntensityType } from "@/lib/types";

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
  const rows = await rpc.call<ActiveOnThisDayRow[]>("get_active_on_this_day", {
    p_day: day,
    p_month: month,
  });

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

export const getActiveOnThisDay = cached(queryActiveOnThisDay, ["getActiveOnThisDay"], {
  revalidate: 3600,
});
