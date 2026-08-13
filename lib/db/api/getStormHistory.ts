import sql, { type ApiListResponse } from "@/lib/db";
import type { StormHistoryEntry } from "@/lib/types";
import { unstable_cache } from "next/cache";

interface StormHistoryRow {
  name: string;
  position: number;
  year: number;
}

async function queryAllStormHistory(): Promise<ApiListResponse<StormHistoryEntry[]>> {
  const rows = await sql.query<StormHistoryRow[]>(
    `SELECT
      s.name,
      s.position,
      s.year
    FROM storms s
    ORDER BY s.year ASC`,
  );

  const data: StormHistoryEntry[] = rows.map((row) => ({
    name: row.name,
    position: row.position,
    year: row.year,
  }));

  return { data, count: data.length };
}

export const getAllStormHistory = unstable_cache(queryAllStormHistory, ["getAllStormHistory"], {
  revalidate: 3600,
});
