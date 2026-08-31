import { rpc } from "@/lib/data/rpc";
import { toRetiredName, type TyphoonNameRow } from "@/lib/db/module/typhoonName";
import type { RetiredName } from "@/lib/types";

export async function getTyphoonNames(): Promise<RetiredName[]> {
  const rows = await rpc<TyphoonNameRow[]>("get_typhoon_names");

  return rows.map(toRetiredName);
}
