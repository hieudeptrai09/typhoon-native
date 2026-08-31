import { NotFoundError, rpc } from "@/lib/data/rpc";
import { toStorm, type StormRow } from "@/lib/db/module/storm";
import { toRetiredName, type TyphoonNameRow } from "@/lib/db/module/typhoonName";
import type { PositionDetail } from "@/lib/types";

interface PositionPayload {
  country: string;
  names: TyphoonNameRow[];
  storms: StormRow[];
}

export async function getPositionDetails(position: number): Promise<PositionDetail> {
  // Null for an unknown position.
  const payload = await rpc<PositionPayload | null>("get_position_details", {
    p_position: position,
  });

  if (!payload) {
    throw new NotFoundError(`There is no naming position ${position}.`);
  }

  return {
    country: payload.country,
    names: payload.names.map(toRetiredName),
    storms: payload.storms.map(toStorm),
  };
}
