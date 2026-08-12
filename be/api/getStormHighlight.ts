import rpc, { type ApiResponse } from "@/be";
import type { StormHighlight } from "@/lib/types";

// Not cached: the pick is random among ongoing storms, so caching would freeze it.
export async function getStormHighlight(): Promise<ApiResponse<StormHighlight | null>> {
  const data = await rpc.call<StormHighlight | null>("get_storm_highlight");

  return { data: data ?? null };
}
