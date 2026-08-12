import sql, { type ApiListResponse } from "@/lib/db";
import { unstable_cache } from "next/cache";

interface NameRow {
  name: string;
}

async function queryNameList(): Promise<ApiListResponse<string[]>> {
  const rows = await sql.query<NameRow[]>(
    `SELECT name FROM typhoonnames
     UNION
     SELECT DISTINCT name FROM storms WHERE position IN (141, 142, 143)
     ORDER BY name`,
  );

  const data = rows.map((row) => row.name);

  return { data, count: data.length };
}

export const getNameList = unstable_cache(queryNameList, ["getNameList"], { revalidate: 3600 });
