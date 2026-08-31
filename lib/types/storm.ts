export type IntensityType = "MD" | "TD" | "TS" | "STS" | "1" | "2" | "3" | "4" | "5";

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
  dateStart: string; // "YYYY-MM-DD"
  dateEnd?: string; // "YYYY-MM-DD"; missing while a storm is ongoing
  jtwcDesignation?: string;
  jmaNumber?: string; // "YYnn", the JMA international number
}

export type StormHighlightStatus = "active" | "next";

export interface StormHighlight {
  name: string;
  position: number;
  status: StormHighlightStatus;
  // Also absent if the deployed get_storm_highlight predates these fields, so the card must
  // degrade without them rather than assume they arrived.
  intensity?: IntensityType;
  dateStart?: string;
}
