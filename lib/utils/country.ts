import { COUNTRY_NAMES } from "@/lib/components/common/CountryFlag";
import type { Storm } from "@/lib/types";
import { isExternalPosition } from "@/lib/utils/position";

// Dots vanish before hyphenating, so "U.S.A." stays one word ("usa") instead of "u-s-a".
export const getCountrySlug = (country: string): string =>
  country
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const getCountryFromSlug = (slug: string): string | null =>
  COUNTRY_NAMES.find((country) => getCountrySlug(country) === slug.toLowerCase()) ?? null;

export const isKnownCountry = (country?: string | null): country is string =>
  country != null && COUNTRY_NAMES.includes(country);

export const stepCountry = (country: string, step: 1 | -1): string => {
  const index = COUNTRY_NAMES.indexOf(country);
  return COUNTRY_NAMES[(index + step + COUNTRY_NAMES.length) % COUNTRY_NAMES.length];
};

// The agency positions share no member's column, so they never count towards a country even when
// the row carries the member's name.
export const getCountryStorms = (storms: Storm[], country: string): Storm[] =>
  storms.filter((storm) => storm.country === country && !isExternalPosition(storm.position));
