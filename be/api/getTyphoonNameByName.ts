import rpc, { type ApiResponse } from "@/be";
import { cached } from "@/be/cache";
import { toStorm, type StormRow } from "@/be/module/storm";
import { toRetiredName, type TyphoonNameRow } from "@/be/module/typhoonName";
import type { SearchDetail } from "@/lib/types";

interface NameDetailPayload {
  // Null when no name row matched; the storm list may still have entries.
  name: TyphoonNameRow | null;
  storms: StormRow[];
}

async function queryTyphoonNameByName(name: string): Promise<ApiResponse<SearchDetail>> {
  const payload = await rpc.call<NameDetailPayload>("get_typhoon_name_by_name", { p_name: name });

  const nameDetail = payload.name ? toRetiredName(payload.name) : null;

  return {
    data: {
      name: nameDetail as SearchDetail["name"],
      storms: payload.storms.map(toStorm),
    },
  };
}

export const getTyphoonNameByName = cached(queryTyphoonNameByName, ["getTyphoonNameByName"], {
  revalidate: 3600,
});

export const isNameNotFound = (result: ApiResponse<SearchDetail> | null) =>
  result !== null && !result.data.name && result.data.storms.length === 0;
