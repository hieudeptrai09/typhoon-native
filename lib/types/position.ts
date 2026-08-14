import type { TyphoonName } from "@/lib/types/name";
import type { Storm } from "@/lib/types/storm";

export interface PositionDetail {
  country: string;
  names: TyphoonName[];
  storms: Storm[];
}

// Filters pick a grid cell by its two visible coordinates (row number + country column) rather than
// by the "3I" code, so a value only resolves to a position once both halves are chosen.
export interface PositionValue {
  row?: number;
  col?: number;
}
