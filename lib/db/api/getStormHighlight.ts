import sql, { type ApiResponse } from "@/lib/db";
import type { StormHighlight } from "@/lib/types";

interface StormPositionRow {
  name: string;
  position: number;
}

interface NameRow {
  name: string;
}

export async function getStormHighlight(): Promise<ApiResponse<StormHighlight | null>> {
  const ongoing = await sql.query<StormPositionRow[]>(
    `SELECT name, position FROM storms
     WHERE enddate IS NULL`,
  );

  if (ongoing.length > 0) {
    const pick = ongoing[Math.floor(Math.random() * ongoing.length)];
    return { data: { name: pick.name, position: pick.position, status: "active" } };
  }

  const latestRows = await sql.query<StormPositionRow[]>(
    `SELECT name, position FROM storms
     WHERE position BETWEEN 1 AND 140
     ORDER BY year DESC, startdate DESC, id DESC
     LIMIT 1`,
  );
  const latest = latestRows[0];

  if (!latest) {
    return { data: null };
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
    return { data: { name: latest.name, position: latest.position, status: "next" } };
  }

  return { data: { name: nextName.name, position: nextPosition, status: "next" } };
}
