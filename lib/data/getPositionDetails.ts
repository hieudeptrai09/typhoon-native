import { toStorm, type StormRow } from "@/lib/data/rows/storm";
import { toRetiredName, type TyphoonNameRow } from "@/lib/data/rows/typhoonName";
import { NotFoundError, rpc } from "@/lib/data/rpc";
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
