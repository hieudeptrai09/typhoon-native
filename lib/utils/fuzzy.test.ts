import { topSuggestions } from "@/lib/utils/fuzzy";

// A slice of the real name pool: the crowded N- cluster that motivated edit distance over
// trigrams, plus a few longer names and the hyphenated spellings.
const NAMES = [
  "Bopha",
  "Bori",
  "Goni",
  "Hagibis",
  "Haiyan",
  "Haishen",
  "Kong-rey",
  "Mangkhut",
  "Nakri",
  "Nari",
  "Noguri",
  "Noru",
  "Noul",
  "Nuri",
  "Rai",
  "Trami",
  "Usagi",
  "Wipha",
  "Yagi",
];

describe("topSuggestions", () => {
  // The whole reason this module scores by edit distance rather than trigrams: trigram
  // similarity puts these at 0.25, under pg_trgm's 0.3 default, so a one-letter typo on a
  // four-letter name found nothing at all.
  it("returns every one-edit neighbour of an ambiguous short name", () => {
    // The Nori case: four names sit one edit away and none of them outranks the others.
    expect(topSuggestions("Nori", NAMES)).toEqual(["Bori", "Nari", "Noru", "Nuri", "Noguri"]);
  });

  // Damerau, not plain Levenshtein: an adjacent swap costs one edit rather than two, which
  // keeps a transposed typo above the threshold instead of dropping it.
  it("recovers a name whose letters were transposed", () => {
    expect(topSuggestions("yaig", NAMES)).toEqual(["Yagi"]);
  });

  it("puts the intended name first for a plain misspelling", () => {
    expect(topSuggestions("hagibys", NAMES)[0]).toBe("Hagibis");
    expect(topSuggestions("mankhut", NAMES)[0]).toBe("Mangkhut");
    expect(topSuggestions("konrey", NAMES)[0]).toBe("Kong-rey");
    expect(topSuggestions("wypha", NAMES)[0]).toBe("Wipha");
  });

  it("matches case-insensitively and ignores surrounding whitespace", () => {
    expect(topSuggestions("  YAGY  ", NAMES)).toEqual(["Yagi"]);
  });

  it("returns nothing for a query that resembles no name", () => {
    expect(topSuggestions("zzzzzz", NAMES)).toEqual([]);
    expect(topSuggestions("aaaaaaaaaa", NAMES)).toEqual([]);
  });

  it("stays quiet on queries too short to be a meaningful typo", () => {
    // "no" is one edit from Noru and Noul, but two characters aren't enough to guess from.
    expect(topSuggestions("no", NAMES)).toEqual([]);
    expect(topSuggestions("", NAMES)).toEqual([]);
  });

  it("drops matches that trail far behind the best one", () => {
    // Rai is an exact hit, so the 0.2 window keeps Nari and Bori (0.5) out.
    expect(topSuggestions("rai", NAMES)).toEqual(["Rai"]);
  });

  it("honours limit and threshold overrides", () => {
    expect(topSuggestions("Nori", NAMES, { limit: 2 })).toEqual(["Bori", "Nari"]);
    expect(topSuggestions("Nori", NAMES, { threshold: 0.9 })).toEqual([]);
    expect(topSuggestions("no", NAMES, { minQueryLength: 2, window: 0 })).toEqual(["Noru", "Noul"]);
  });
});
