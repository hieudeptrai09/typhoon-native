import { NotFoundError, rpc } from "@/lib/data/rpc";
import { toStorm, type StormRow } from "@/lib/db/module/storm";
import { toRetiredName, type TyphoonNameRow } from "@/lib/db/module/typhoonName";
import type { SearchDetail } from "@/lib/types";

interface NameDetailPayload {
  // Null when no name row matched; the storm list may still have entries.
  name: TyphoonNameRow | null;
  storms: StormRow[];
}

export async function getNameDetail(name: string): Promise<SearchDetail> {
  const payload = await rpc<NameDetailPayload>("get_typhoon_name_by_name", { p_name: name });

  if (!payload.name && payload.storms.length === 0) {
    throw new NotFoundError(`No name or storm called "${name}".`);
  }

  const detail = payload.name ? toRetiredName(payload.name) : null;

  return {
    // A storm can exist under a name the naming lists no longer carry; the screens read `name`
    // defensively, which the non-nullable type does not say.
    name: detail as SearchDetail["name"],
    storms: payload.storms.map(toStorm),
  };
}
