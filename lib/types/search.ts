import type { RetiredName, RetirementReason, TyphoonName } from "@/lib/types/name";
import type { Storm } from "@/lib/types/storm";

export interface SearchResult {
  id: number | null;
  name: string;
  position: number;
  country: string;
  isRetired: boolean;
  retirementReason: RetirementReason | null;
  stormCount: number;
  note: string | null;
  replacementName: string | null;
}

export interface SearchDetail {
  name: TyphoonName | RetiredName;
  storms: Storm[];
}
