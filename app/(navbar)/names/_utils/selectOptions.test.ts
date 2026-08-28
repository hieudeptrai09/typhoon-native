import { toOpts } from "@/app/(navbar)/names/_utils/selectOptions";

describe("toOpts", () => {
  it("builds select options", () => {
    expect(toOpts(["Animal", "Plant"])).toEqual([
      { label: "Animal", value: "Animal" },
      { label: "Plant", value: "Plant" },
    ]);
  });

  it("yields no options for an empty list", () => {
    expect(toOpts([])).toEqual([]);
  });
});
