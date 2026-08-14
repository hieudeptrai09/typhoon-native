import rpc, { type ApiResponse } from "@/be";
import type { StormHighlight } from "@/lib/types";

// Not cached: this is the app's "what is happening right now" surface, so a storm that starts has
// to reach it on the next open rather than when a window expires.
export async function getStormHighlight(): Promise<ApiResponse<StormHighlight[]>> {
  // A deployed get_storm_highlight older than the array version answers with a single object;
  // normalising here keeps the card on one shape whichever one is live.
  const data = await rpc.call<StormHighlight | StormHighlight[] | null>("get_storm_highlight");

  if (!data) return { data: [] };

  return { data: Array.isArray(data) ? data : [data] };
}
