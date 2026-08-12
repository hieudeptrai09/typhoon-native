import rpc, { type ApiResponse } from "@/lib/db";
import { cached } from "@/lib/db/cache";
import { toStorm, type StormRow } from "@/lib/db/module/storm";
import { toRetiredName, type TyphoonNameRow } from "@/lib/db/module/typhoonName";
import type { PositionDetail } from "@/lib/types";

interface PositionPayload {
  country: string;
  names: TyphoonNameRow[];
  storms: StormRow[];
}

async function queryPositionDetails(position: number): Promise<ApiResponse<PositionDetail | null>> {
  // Null for an unknown position, which the route turns into a 404.
  const payload = await rpc.call<PositionPayload | null>("get_position_details", {
    p_position: position,
  });

  if (!payload) {
    return { data: null };
  }

  return {
    data: {
      country: payload.country,
      names: payload.names.map(toRetiredName),
      storms: payload.storms.map(toStorm),
    },
  };
}

export const getPositionDetails = cached(queryPositionDetails, ["getPositionDetails"], {
  revalidate: 3600,
});
