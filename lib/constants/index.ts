import type { IntensityType, RetiredName, TyphoonName } from "@/lib/types";

export const TITLE_COMMON = "Cá Tra's Typhoons App";

export const SORTING_RANK: Record<IntensityType, number> = {
  5: 5,
  4: 4,
  3: 3,
  2: 2,
  1: 1,
  STS: 0,
  TS: -1,
  TD: -2,
  MD: -3,
};

export const INTENSITY_RANK: Record<IntensityType, number> = {
  5: 5,
  4: 4,
  3: 3,
  2: 2,
  1: 1,
  STS: 0,
  TS: 0,
  TD: -1,
  MD: -2,
};

export const MONTH_NAMES: Record<number, string> = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};

export const INTENSITY_LABEL: Record<IntensityType, string> = {
  5: "Category 5 Super Typhoon",
  4: "Category 4 Typhoon",
  3: "Category 3 Typhoon",
  2: "Category 2 Typhoon",
  1: "Category 1 Typhoon",
  STS: "Severe Tropical Storm",
  TS: "Tropical Storm",
  TD: "Tropical Depression",
  MD: "Monsoon Depression",
};

// Segmented controls and chips have room for the code only, and a bare "1" beside MD/TD/TS reads as a rank.
export const INTENSITY_SHORT_LABEL: Record<IntensityType, string> = {
  5: "C5",
  4: "C4",
  3: "C3",
  2: "C2",
  1: "C1",
  STS: "STS",
  TS: "TS",
  TD: "TD",
  MD: "MD",
};

export const defaultTyphoonName: TyphoonName = {
  id: 0,
  position: 0,
  name: "",
  meaning: "",
  country: "",
  language: "",
  isRetired: false,
  isReplaced: false,
  // retirementReason stays undefined: the default name is not retired.
  tag: "",
};

export const defaultRetiredName: RetiredName = {
  ...defaultTyphoonName,
  lastYear: 0,
  replacementName: "",
};
