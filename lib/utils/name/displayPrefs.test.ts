import {
  defaultDisplayPrefs,
  parseDisplayPrefs,
  type NamesDisplayPrefs,
} from "@/lib/utils/name/displayPrefs";

describe("parseDisplayPrefs", () => {
  it("falls back to the defaults when the cookie is missing or empty", () => {
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

describe("round-trip", () => {
  // writeDisplayPrefs still writes document.cookie, which does not exist on
  // native — the writer stays uncovered until it moves onto device storage.
  const encode = (prefs: NamesDisplayPrefs) => encodeURIComponent(JSON.stringify(prefs));

  it("reads back what the writer encodes", () => {
    expect(parseDisplayPrefs(encode({ showLetterNav: true }))).toEqual({ showLetterNav: true });
  });

  it("round-trips the defaults too", () => {
    expect(parseDisplayPrefs(encode(defaultDisplayPrefs))).toEqual(defaultDisplayPrefs);
  });
});
