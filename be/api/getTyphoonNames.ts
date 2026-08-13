import rpc, { type ApiListResponse } from "@/be";
import { cached } from "@/be/cache";
import { toRetiredName, type TyphoonNameRow } from "@/be/module/typhoonName";
import type { RetiredName } from "@/lib/types";

async function queryTyphoonNames(): Promise<ApiListResponse<RetiredName[]>> {
  const rows = await rpc.call<TyphoonNameRow[]>("get_typhoon_names");
  const data = rows.map(toRetiredName);

  return { data, count: data.length };
}

export const getTyphoonNames = cached(queryTyphoonNames, ["getTyphoonNames"], {
  revalidate: 3600,
});
