import { SORTING_RANK } from "@/lib/constants";
import type { IntensityType } from "@/lib/types";

// The filter is carried as a slug rather than the raw enum value so a lone "1" can't be mistaken
// for a position or a page number.
const INTENSITY_SLUGS: Record<IntensityType, string> = {
  MD: "md",
  TD: "td",
  TS: "ts",
  STS: "sts",
  1: "cat1",
  2: "cat2",
  3: "cat3",
  4: "cat4",
  5: "cat5",
};

const SLUG_INTENSITIES: Record<string, IntensityType> = Object.fromEntries(
  Object.entries(INTENSITY_SLUGS).map(([intensity, slug]) => [slug, intensity as IntensityType]),
);

export const getIntensitySlug = (intensity: IntensityType): string => INTENSITY_SLUGS[intensity];

export const intensityFromSlug = (slug: string): IntensityType | null =>
  SLUG_INTENSITIES[slug] ?? null;

// Weakest first, the same order the intensity legend lists the scale in.
export const INTENSITIES_BY_STRENGTH: IntensityType[] = (
  Object.keys(INTENSITY_SLUGS) as IntensityType[]
).sort((a, b) => SORTING_RANK[a] - SORTING_RANK[b]);

export const INTENSITY_SLUGS_BY_STRENGTH: string[] = INTENSITIES_BY_STRENGTH.map(getIntensitySlug);
