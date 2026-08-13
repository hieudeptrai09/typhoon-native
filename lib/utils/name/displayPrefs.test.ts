import {
  defaultDisplayPrefs,
  parseDisplayPrefs,
  readDisplayPrefs,
  writeDisplayPrefs,
} from "@/lib/utils/name/displayPrefs";
import AsyncStorage from "@react-native-async-storage/async-storage";

describe("parseDisplayPrefs", () => {
  it("falls back to the defaults when nothing is stored", () => {
    expect(parseDisplayPrefs(undefined)).toEqual(defaultDisplayPrefs);
    expect(parseDisplayPrefs("")).toEqual(defaultDisplayPrefs);
  });

  it("reads an encoded value", () => {
    const raw = encodeURIComponent(JSON.stringify({ showLetterNav: true }));
    expect(parseDisplayPrefs(raw)).toEqual({ showLetterNav: true });
  });

  it("reads an already-decoded value", () => {
    expect(parseDisplayPrefs('{"showLetterNav":true}')).toEqual({ showLetterNav: true });
  });

  it("falls back rather than throwing on malformed JSON", () => {
    expect(parseDisplayPrefs("not json")).toEqual(defaultDisplayPrefs);
    expect(parseDisplayPrefs("%")).toEqual(defaultDisplayPrefs); // breaks decodeURIComponent
  });

  it("falls back on JSON that is not an object", () => {
    expect(parseDisplayPrefs("null")).toEqual(defaultDisplayPrefs);
    expect(parseDisplayPrefs('"a string"')).toEqual(defaultDisplayPrefs);
    expect(parseDisplayPrefs("42")).toEqual(defaultDisplayPrefs);
  });

  it("only accepts a real boolean true", () => {
    expect(parseDisplayPrefs('{"showLetterNav":"true"}')).toEqual({ showLetterNav: false });
    expect(parseDisplayPrefs('{"showLetterNav":1}')).toEqual({ showLetterNav: false });
    expect(parseDisplayPrefs("{}")).toEqual({ showLetterNav: false });
  });

  it("ignores unknown keys", () => {
    expect(parseDisplayPrefs('{"showLetterNav":true,"bogus":true}')).toEqual({
      showLetterNav: true,
    });
  });
});

describe("round-trip through device storage", () => {
  beforeEach(() => AsyncStorage.clear());

  it("reads back what the writer stored", async () => {
    writeDisplayPrefs({ showLetterNav: true });
    await expect(readDisplayPrefs()).resolves.toEqual({ showLetterNav: true });
  });

  it("round-trips the defaults too", async () => {
    writeDisplayPrefs(defaultDisplayPrefs);
    await expect(readDisplayPrefs()).resolves.toEqual(defaultDisplayPrefs);
  });

  it("falls back to the defaults when nothing has been written", async () => {
    await expect(readDisplayPrefs()).resolves.toEqual(defaultDisplayPrefs);
  });
});
