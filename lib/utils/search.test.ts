import { foldName, rankMatches } from "@/lib/utils/search";

describe("foldName", () => {
  it("lowercases", () => {
    expect(foldName("Ampil")).toBe("ampil");
  });

  it("strips Vietnamese tone marks and the đ stroke", () => {
    expect(foldName("Sơn Tinh")).toBe("son tinh");
    expect(foldName("Đà Nẵng")).toBe("da nang");
  });

  it("treats the hyphen in a compound name as a space", () => {
    expect(foldName("Son-Tinh")).toBe("son tinh");
  });

  it("keeps one character per character, so offsets survive the fold", () => {
    for (const value of ["Sơn-Tinh", "Đà Nẵng", "Bualoi", "Nesat"]) {
      expect(foldName(value)).toHaveLength(value.length);
    }
  });
});

describe("rankMatches", () => {
  const names = ["Hai-Tang", "Haikui", "Haima", "Nesat", "Sonca", "Son-Tinh"];
  const rank = (query: string, pool = names) =>
    rankMatches(pool, query, (name) => name).map((result) => result.item);

  it("returns nothing for a blank query", () => {
    expect(rank("")).toEqual([]);
    expect(rank("   ")).toEqual([]);
  });

  it("drops names that do not contain the query", () => {
    expect(rank("zzz")).toEqual([]);
  });

  it("puts an exact name above one that merely contains it", () => {
    expect(rank("tang", ["Hai-Tang", "Tang"])).toEqual(["Tang", "Hai-Tang"]);
  });

  it("ranks the start of a name above a word inside it", () => {
    expect(rank("son")).toEqual(["Sonca", "Son-Tinh"]);
    expect(rank("tinh")).toEqual(["Son-Tinh"]);
  });

  it("ranks a word start above the middle of a word", () => {
    expect(rank("ta", ["Mitag", "Hai-Tang"])).toEqual(["Hai-Tang", "Mitag"]);
  });

  it("breaks ties on equal footing by the shorter, tighter name", () => {
    expect(rank("hai")).toEqual(["Haima", "Haikui", "Hai-Tang"]);
  });

  it("matches an accented query against the unaccented catalogue", () => {
    expect(rank("sơn")).toEqual(["Sonca", "Son-Tinh"]);
  });

  it("matches across the hyphen of a compound name", () => {
    expect(rank("hai t")).toEqual(["Hai-Tang"]);
  });

  it("reports the offset into the original name, not the folded one", () => {
    const [match] = rankMatches(["Sơn-Tinh"], "tinh", (name) => name);
    expect(match.at).toBe(4);
    expect("Sơn-Tinh".slice(match.at, match.at + 4)).toBe("Tinh");
  });
});
