import {
  applySort,
  cycleCriterion,
  liveCriteria,
  type SortCriterion,
  type SortField,
} from "@/lib/utils/table";

const asc = (key: string): SortCriterion => ({ key, order: "ascend" });
const desc = (key: string): SortCriterion => ({ key, order: "descend" });

describe("cycleCriterion", () => {
  it("starts a field ascending", () => {
    expect(cycleCriterion([], "name")).toEqual([asc("name")]);
  });

  it("flips an ascending field to descending", () => {
    expect(cycleCriterion([asc("name")], "name")).toEqual([desc("name")]);
  });

  it("drops a descending field", () => {
    expect(cycleCriterion([desc("name")], "name")).toEqual([]);
  });

  it("appends a new field after the existing criteria", () => {
    expect(cycleCriterion([desc("intensity")], "name")).toEqual([desc("intensity"), asc("name")]);
  });

  it("flips direction without changing rank", () => {
    expect(cycleCriterion([asc("intensity"), asc("name")], "intensity")).toEqual([
      desc("intensity"),
      asc("name"),
    ]);
  });

  it("drops only the cycled-off field", () => {
    expect(cycleCriterion([desc("intensity"), asc("name")], "intensity")).toEqual([asc("name")]);
  });
});

describe("liveCriteria", () => {
  const fields: SortField<{ name: string }>[] = [
    { key: "name", label: "Name", compare: (a, b) => a.name.localeCompare(b.name) },
  ];

  it("keeps criteria whose field still exists", () => {
    expect(liveCriteria([asc("name")], fields)).toEqual([asc("name")]);
  });

  it("drops criteria left over from another filter's fields", () => {
    expect(liveCriteria([asc("name"), desc("year")], fields)).toEqual([asc("name")]);
  });
});

describe("applySort", () => {
  interface Row {
    name: string;
    year: number;
  }

  const fields: SortField<Row>[] = [
    { key: "name", label: "Name", compare: (a, b) => a.name.localeCompare(b.name) },
    { key: "year", label: "Year", compare: (a, b) => a.year - b.year },
  ];

  const rows: Row[] = [
    { name: "Rai", year: 2021 },
    { name: "Yagi", year: 2018 },
    { name: "Haiyan", year: 2013 },
    { name: "Yagi", year: 2024 },
  ];

  it("returns the rows untouched when nothing is sorted", () => {
    expect(applySort(rows, [], fields)).toBe(rows);
  });

  it("does not mutate the input", () => {
    const snapshot = [...rows];
    applySort(rows, [asc("name")], fields);
    expect(rows).toEqual(snapshot);
  });

  it("sorts ascending", () => {
    expect(applySort(rows, [asc("year")], fields).map((row) => row.year)).toEqual([
      2013, 2018, 2021, 2024,
    ]);
  });

  it("sorts descending", () => {
    expect(applySort(rows, [desc("year")], fields).map((row) => row.year)).toEqual([
      2024, 2021, 2018, 2013,
    ]);
  });

  it("breaks ties with the next criterion", () => {
    expect(
      applySort(rows, [asc("name"), desc("year")], fields).map((row) => `${row.name}-${row.year}`),
    ).toEqual(["Haiyan-2013", "Rai-2021", "Yagi-2024", "Yagi-2018"]);
  });

  it("ignores criteria naming a field that is gone", () => {
    expect(applySort(rows, [asc("country"), asc("year")], fields).map((row) => row.year)).toEqual([
      2013, 2018, 2021, 2024,
    ]);
  });
});
