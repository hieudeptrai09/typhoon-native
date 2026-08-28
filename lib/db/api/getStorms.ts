import sql, { type ApiListResponse, type QueryParam } from "@/lib/db";
import { stormColumns, stormJoin, toStorm, type StormRow } from "@/lib/db/module/storm";
import type { Storm } from "@/lib/types";
import { unstable_cache } from "next/cache";

async function queryStorms(position: number | null = null): Promise<ApiListResponse<Storm[]>> {
  let query = `SELECT
      ${stormColumns()}
    FROM storms s
    ${stormJoin()}`;

  const params: QueryParam[] = [];
  if (position !== null) {
    query += ` WHERE s.position = $${params.length + 1}`;
    params.push(position);
  }
  query += " ORDER BY s.year ASC, s.position";

  const rows = await sql.query<StormRow[]>(query, params);
  const data = rows.map(toStorm);

  return { data, count: data.length };
}

export const getStorms = unstable_cache(queryStorms, ["getStorms"], { revalidate: 3600 });
