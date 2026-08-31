import type { IntensityType } from "@/lib/types";

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

// Chips and pills have room for the code only, and a bare "1" beside MD/TD/TS reads as a rank.
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
