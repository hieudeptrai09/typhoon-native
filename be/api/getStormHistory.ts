import rpc, { type ApiListResponse } from "@/be";
import { cached } from "@/be/cache";
import type { StormHistoryEntry } from "@/lib/types";

async function queryAllStormHistory(): Promise<ApiListResponse<StormHistoryEntry[]>> {
  const data = await rpc.call<StormHistoryEntry[]>("get_storm_history");

  return { data, count: data.length };
}

export const getAllStormHistory = cached(queryAllStormHistory, ["getAllStormHistory"], {
  revalidate: 3600,
});
