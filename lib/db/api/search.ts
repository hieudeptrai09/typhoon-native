import sql, { type ApiListResponse } from "@/lib/db";
import type { RetirementReason, SearchResult } from "@/lib/types";
import { unstable_cache } from "next/cache";

interface SearchRow {
  // id is bigint and stormCount is a COUNT(): postgres.js returns both as strings.
  id: string | null;
  name: string;
  position: number;
  country: string;
  isRetired: boolean;
  retirementReason: RetirementReason | null;
  note: string | null;
  replacementName: string | null;
  stormCount: string;
}

async function querySearch(query: string): Promise<ApiListResponse<SearchResult[]>> {
  const q = `%${query}%`;

  const rows = await sql.query<SearchRow[]>(
    `SELECT
        tn.id,
        tn.name,
        tn.position,
        p.country,
        tn.isretired AS "isRetired",
        tn.retirementreason AS "retirementReason",
        tn.note,
        tn.replacementname AS "replacementName",
        COUNT(s.id) as "stormCount"
    FROM typhoonnames tn
    INNER JOIN positions p ON tn.position = p.id
    LEFT JOIN storms s ON s.name = tn.name
    WHERE tn.name ILIKE $1
    GROUP BY tn.id, tn.name, tn.position, p.country, tn.isretired, tn.retirementreason, tn.note, tn.replacementname

    UNION

    SELECT
        NULL as id,
        s.name,
        s.position,
        p.country,
        false as "isRetired",
        -- Storms with no matching name row were never in rotation, so they have no reason.
        NULL::typhoonnames_retirementreason as "retirementReason",
        NULL as note,
        NULL as "replacementName",
        COUNT(s.id) as "stormCount"
    FROM storms s
    INNER JOIN positions p ON s.position = p.id
    WHERE s.name ILIKE $2
      AND s.name NOT IN (SELECT tn2.name FROM typhoonnames tn2)
    GROUP BY s.name, s.position, p.country

    ORDER BY name ASC`,
    [q, q],
  );

  const data: SearchResult[] = rows.map((row) => ({
    id: row.id !== null ? Number(row.id) : null,
    name: row.name,
    position: row.position,
    country: row.country,
    isRetired: row.isRetired,
    retirementReason: row.retirementReason,
    note: row.note,
    replacementName: row.replacementName,
    stormCount: Number(row.stormCount),
  }));

  return { data, count: data.length };
}

export const search = unstable_cache(querySearch, ["search"], { revalidate: 3600 });
