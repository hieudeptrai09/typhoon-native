import sql, { type ApiResponse } from "@/lib/db";
import type { StormHighlight } from "@/lib/types";

interface StormPositionRow {
  name: string;
  position: number;
}

interface NameRow {
  name: string;
}

export async function getStormHighlights(): Promise<ApiResponse<StormHighlight[]>> {
  const ongoing = await sql.query<StormPositionRow[]>(
    `SELECT name, position FROM storms
     WHERE enddate IS NULL
     ORDER BY startdate ASC, id ASC`,
  );

  if (ongoing.length > 0) {
    return {
      data: ongoing.map(({ name, position }) => ({ name, position, status: "active" })),
    };
  }

  const latestRows = await sql.query<StormPositionRow[]>(
    `SELECT name, position FROM storms
     WHERE position BETWEEN 1 AND 140
     ORDER BY year DESC, startdate DESC, id DESC
     LIMIT 1`,
  );
  const latest = latestRows[0];

  if (!latest) {
    return { data: [] };
  }

  const nextPosition = (latest.position % 140) + 1;

  const nextNameRows = await sql.query<NameRow[]>(
    `SELECT name FROM typhoonnames
     WHERE position = $1 AND isretired = false
     LIMIT 1`,
    [nextPosition],
  );
  const nextName = nextNameRows[0];

  if (!nextName) {
    return { data: [{ name: latest.name, position: latest.position, status: "next" }] };
  }

  return { data: [{ name: nextName.name, position: nextPosition, status: "next" }] };
}
