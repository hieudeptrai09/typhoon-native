export type IntensityType = "NT" | "TD" | "TS" | "STS" | "1" | "2" | "3" | "4" | "5";

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

export interface StormHistoryEntry {
  name: string;
  position: number;
  year: number;
}

export type StormHighlightStatus = "active" | "next";

export interface StormHighlight {
  name: string;
  position: number;
  status: StormHighlightStatus;
}
