import rpc, { type ApiListResponse } from "@/lib/db";
import { cached } from "@/lib/db/cache";

interface NameRow {
  name: string;
}

async function queryNameList(): Promise<ApiListResponse<string[]>> {
  const rows = await rpc.call<NameRow[]>("get_name_list");
  const data = rows.map((row) => row.name);

  return { data, count: data.length };
}

export const getNameList = cached(queryNameList, ["getNameList"], { revalidate: 3600 });
