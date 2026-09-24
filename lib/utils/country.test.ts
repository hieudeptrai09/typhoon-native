import { COUNTRY_NAMES } from "@/lib/components/common/CountryFlag";
import {
  getCountryFromSlug,
  getCountrySlug,
  getCountryStorms,
  isKnownCountry,
  stepCountry,
} from "@/lib/utils/country";
import { storm } from "@/lib/utils/storm/testFixtures";

describe("getCountrySlug", () => {
  it("lowercases and hyphenates multi-word names", () => {
    expect(getCountrySlug("RO Korea")).toBe("ro-korea");
    expect(getCountrySlug("HK, China")).toBe("hk-china");
  });

  it("drops the dots of an abbreviation", () => {
    expect(getCountrySlug("U.S.A.")).toBe("usa");
  });

  it("gives every member a distinct slug", () => {
    const slugs = COUNTRY_NAMES.map(getCountrySlug);
    expect(new Set(slugs).size).toBe(COUNTRY_NAMES.length);
  });
});

describe("getCountryFromSlug", () => {
  it("round-trips every member", () => {
    COUNTRY_NAMES.forEach((country) => {
      expect(getCountryFromSlug(getCountrySlug(country))).toBe(country);
    });
  });

  it("accepts an uppercase slug", () => {
    expect(getCountryFromSlug("HK-CHINA")).toBe("HK, China");
  });

  it("rejects an unknown slug", () => {
    expect(getCountryFromSlug("atlantis")).toBeNull();
    expect(getCountryFromSlug("")).toBeNull();
  });
});

describe("isKnownCountry / stepCountry", () => {
  it("only knows the fourteen members", () => {
    expect(isKnownCountry("Japan")).toBe(true);
    expect(isKnownCountry("Atlantis")).toBe(false);
    expect(isKnownCountry(undefined)).toBe(false);
  });

  it("wraps around both ends of the member list", () => {
    const first = COUNTRY_NAMES[0];
    const last = COUNTRY_NAMES[COUNTRY_NAMES.length - 1];
    expect(stepCountry(first, -1)).toBe(last);
    expect(stepCountry(last, 1)).toBe(first);
    expect(stepCountry(first, 1)).toBe(COUNTRY_NAMES[1]);
  });
});

describe("getCountryStorms", () => {
  it("keeps the member's grid storms and drops agency positions", () => {
    const storms = [
      storm({ name: "Mine", country: "Japan", position: 5 }),
      storm({ name: "Agency", country: "Japan", position: 142 }),
      storm({ name: "Other", country: "China", position: 2 }),
    ];
    expect(getCountryStorms(storms, "Japan").map((s) => s.name)).toEqual(["Mine"]);
  });
});
