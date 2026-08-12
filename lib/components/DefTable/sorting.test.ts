import { nextCriteria, sortPriority, type SortCriterion } from "@/lib/components/DefTable/sorting";

const asc = (key: string): SortCriterion => ({ key, order: "ascend" });
const desc = (key: string): SortCriterion => ({ key, order: "descend" });

describe("nextCriteria", () => {
  it("starts a sort on the first click", () => {
    expect(nextCriteria([], [asc("name")], false)).toEqual([asc("name")]);
  });

  it("replaces the whole sort on a plain click", () => {
    // antd keeps the old criteria and appends the clicked column; we drop them.
    expect(nextCriteria([asc("intensity")], [asc("intensity"), asc("name")], false)).toEqual([
      asc("name"),
    ]);
  });

  it("appends the clicked column on an additive click", () => {
    expect(nextCriteria([desc("intensity")], [desc("intensity"), asc("name")], true)).toEqual([
      desc("intensity"),
      asc("name"),
    ]);
  });

  it("flips direction without changing rank", () => {
    // antd reports the clicked column last whatever its rank, so "name" would
    // otherwise be promoted ahead of "intensity".
    expect(
      nextCriteria([desc("intensity"), asc("name")], [desc("intensity"), desc("name")], true),
    ).toEqual([desc("intensity"), desc("name")]);
  });

  it("drops only the cleared column on an additive click", () => {
    expect(nextCriteria([desc("intensity"), asc("name")], [asc("name")], true)).toEqual([
      asc("name"),
    ]);
  });

  it("drops only the cleared column on a plain click too", () => {
    // Switching one column off must not unsort the rest: the criteria ranked
    // above it stay put and take over.
    expect(nextCriteria([desc("intensity"), asc("name")], [desc("intensity")], false)).toEqual([
      desc("intensity"),
    ]);
  });

  it("empties the list when the last criterion is cleared", () => {
    expect(nextCriteria([desc("name")], [], false)).toEqual([]);
  });

  it("ignores criteria for columns that are gone", () => {
    expect(nextCriteria([], [], false)).toEqual([]);
  });
});

describe("sortPriority", () => {
  it("ranks earlier criteria higher", () => {
    expect(sortPriority(0, 3)).toBeGreaterThan(sortPriority(1, 3));
    expect(sortPriority(1, 3)).toBeGreaterThan(sortPriority(2, 3));
  });

  it("keeps every ranked criterion above the unranked columns", () => {
    expect(sortPriority(2, 3)).toBeGreaterThan(sortPriority(-1, 3));
  });
});
