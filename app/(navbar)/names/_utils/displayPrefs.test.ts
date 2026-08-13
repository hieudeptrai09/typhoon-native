/**
 * @jest-environment jsdom
 */
import {
  defaultDisplayPrefs,
  NAMES_DISPLAY_COOKIE,
  parseDisplayPrefs,
  writeDisplayPrefs,
} from "@/app/(navbar)/names/_utils/displayPrefs";

describe("parseDisplayPrefs", () => {
  it("falls back to the defaults when the cookie is missing or empty", () => {
    expect(parseDisplayPrefs(undefined)).toEqual(defaultDisplayPrefs);
    expect(parseDisplayPrefs("")).toEqual(defaultDisplayPrefs);
  });

  it("reads an encoded cookie value", () => {
    const raw = encodeURIComponent(JSON.stringify({ showLetterNav: true }));
    expect(parseDisplayPrefs(raw)).toEqual({ showLetterNav: true });
  });

  it("reads an already-decoded cookie value", () => {
    // The server reader and document.cookie decode differently, so both forms arrive here.
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

describe("writeDisplayPrefs", () => {
  const readCookie = (): string | undefined =>
    document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${NAMES_DISPLAY_COOKIE}=`))
      ?.slice(NAMES_DISPLAY_COOKIE.length + 1);

  afterEach(() => {
    document.cookie = `${NAMES_DISPLAY_COOKIE}=; path=/; max-age=0`;
  });

  it("writes a value parseDisplayPrefs can read back", () => {
    writeDisplayPrefs({ showLetterNav: true });
    expect(parseDisplayPrefs(readCookie())).toEqual({ showLetterNav: true });
  });

  it("round-trips the defaults too", () => {
    writeDisplayPrefs(defaultDisplayPrefs);
    expect(parseDisplayPrefs(readCookie())).toEqual(defaultDisplayPrefs);
  });
});
