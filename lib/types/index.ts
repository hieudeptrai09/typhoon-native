export interface ImageCredit {
  author?: string;
  license?: string;
  licenseUrl?: string;
  sourceUrl?: string;
}

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

export interface Storm {
  name: string;
  year: number;
  intensity: IntensityType;
  position: number;
  country: string;
  correctSpelling?: string;
  map: string;
  isStrongest?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  dateStart: string; // "YYYY-MM-DD"; always set — a storm can't exist without a start
  dateEnd?: string; // "YYYY-MM-DD"; missing while a storm is ongoing
  jtwcDesignation?: string;
}

export interface FilterParams {
  name: string;
  country: string;
  language: string;
  position: string;
  tag: string;
  status: string;
  letter?: string;
}

export interface RetiredFilterParams {
  name: string;
  year: string;
  country: string;
  reason: string;
  position: string;
  letter?: string;
}

export interface DashboardParams {
  view: string;
  mode: string;
  filter: string;
}

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  isSortable?: boolean;
  title?: string;
}

export type SortDirection = "asc" | "desc" | null;

export type IntensityType = "NT" | "TD" | "TS" | "STS" | "1" | "2" | "3" | "4" | "5";

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

export interface StormHistoryEntry {
  name: string;
  position: number;
  year: number;
}

export interface PositionDetail {
  country: string;
  names: TyphoonName[];
  storms: Storm[];
}

export type StormHighlightStatus = "active" | "next";

export interface StormHighlight {
  name: string;
  position: number;
  status: StormHighlightStatus;
}
