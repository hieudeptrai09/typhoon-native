import sql, { type ApiListResponse } from "@/lib/db";
import {
  toRetiredName,
  typhoonNameColumns,
  typhoonNameJoin,
  type TyphoonNameRow,
} from "@/lib/db/module/typhoonName";
import type { RetiredName } from "@/lib/types";
import { unstable_cache } from "next/cache";

async function queryTyphoonNames(): Promise<ApiListResponse<RetiredName[]>> {
  const rows = await sql.query<TyphoonNameRow[]>(
    `SELECT
      ${typhoonNameColumns()}
    FROM typhoonnames tn
    ${typhoonNameJoin()}`,
  );

  const data = rows.map(toRetiredName);

  return { data, count: data.length };
}

export const getTyphoonNames = unstable_cache(queryTyphoonNames, ["getTyphoonNames"], {
  revalidate: 3600,
});
