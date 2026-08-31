import { rpc } from "@/lib/data/rpc";
import { toStorm, type StormRow } from "@/lib/db/module/storm";
import type { Storm } from "@/lib/types";

export async function getStorms(position: number | null = null): Promise<Storm[]> {
  const rows = await rpc<StormRow[]>("get_storms", { p_position: position });

  return rows.map(toStorm);
}
