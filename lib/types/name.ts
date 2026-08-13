import type { ImageCredit } from "@/lib/types/media";

// Why a name left rotation. Set only when isRetired is true; the DB enforces that pairing.
export type RetirementReason = "destructive" | "language" | "misspell" | "special";

export interface TyphoonName {
  id: number;
  position: number;
  name: string;
  meaning: string;
  country: string;
  language: string;
  originalText?: string;
  ipa?: string;
  pronunciationFile?: string;
  isRetired: boolean;
  isReplaced: boolean;
  retirementReason?: RetirementReason;
  image?: string;
  imageCredit?: ImageCredit;
  description?: string;
  tag: string;
}

export interface RetiredName extends TyphoonName {
  lastYear: number;
  note?: string;
  replacementName: string;
}

export interface Suggestion {
  replacementName: string;
  replacementMeaning: string;
  isChosen: boolean;
  image?: string;
  imageCredit?: ImageCredit;
}

export interface SuggestionWithNameId extends Suggestion {
  nameId: number;
}
