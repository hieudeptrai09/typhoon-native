import { rpc } from "@/lib/data/rpc";
import type { StormHighlight } from "@/lib/types";

export async function getStormHighlight(): Promise<StormHighlight[]> {
  // A deployed get_storm_highlight older than the array version answers with a single object;
  // normalising here keeps the card on one shape whichever one is live.
  const data = await rpc<StormHighlight | StormHighlight[] | null>("get_storm_highlight");

  if (!data) return [];

  return Array.isArray(data) ? data : [data];
}
