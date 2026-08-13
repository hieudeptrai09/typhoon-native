import rpc, { type ApiListResponse } from "@/be";
import { cached } from "@/be/cache";
import { toStorm, type StormRow } from "@/be/module/storm";
import type { Storm } from "@/lib/types";

async function queryStorms(position: number | null = null): Promise<ApiListResponse<Storm[]>> {
  const rows = await rpc.call<StormRow[]>("get_storms", { p_position: position });
  const data = rows.map(toStorm);

  return { data, count: data.length };
}

export const getStorms = cached(queryStorms, ["getStorms"], { revalidate: 3600 });
