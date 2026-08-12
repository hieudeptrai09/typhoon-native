import rpc, { type ApiListResponse } from "@/lib/db";
import { cached } from "@/lib/db/cache";
import type { StormHistoryEntry } from "@/lib/types";

async function queryAllStormHistory(): Promise<ApiListResponse<StormHistoryEntry[]>> {
  const data = await rpc.call<StormHistoryEntry[]>("get_storm_history");

  return { data, count: data.length };
}

export const getAllStormHistory = cached(queryAllStormHistory, ["getAllStormHistory"], {
  revalidate: 3600,
});
