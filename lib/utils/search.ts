// A runtime without String.prototype.normalize would throw rather than degrade, and the only thing
// lost by skipping the fold is accent-insensitivity.
const decompose = (value: string): string =>
  typeof String.prototype.normalize === "function" ? value.normalize("NFD") : value;

const COMBINING_MARKS = /[̀-ͯ]/g;

/**
 * Folds case, accents and the hyphens in compound names, so "Sơn-Tinh" and "son tinh" reach the
 * same key. Every substitution is one character for one character: callers index the *original*
 * name with offsets found in the folded one.
 */
export function foldName(value: string): string {
  return decompose(value.toLowerCase())
    .replace(COMBINING_MARKS, "")
    .replace(/đ/g, "d")
    .replace(/-/g, " ");
}

const WORD_BREAK = /\s/;

/** Lower sorts first: exact name, then the start of the name, a word, and anything else. */
function tierOf(name: string, query: string, at: number): number {
  if (name === query) return 0;
  if (at === 0) return 1;
  return WORD_BREAK.test(name[at - 1]) ? 2 : 3;
}

export interface Ranked<T> {
  item: T;
  /** Where the query matched in the original name. Highlighting reads it rather than re-searching:
   *  folding can shift what `indexOf` would find on the unfolded string. */
  at: number;
}

export function rankMatches<T>(
  items: T[],
  query: string,
  nameOf: (item: T) => string,
): Ranked<T>[] {
  const folded = foldName(query.trim());
  if (folded === "") return [];

  const scored = items.flatMap((item) => {
    const name = foldName(nameOf(item));
    const at = name.indexOf(folded);
    return at === -1 ? [] : [{ item, at, name, tier: tierOf(name, folded, at) }];
  });

  scored.sort(
    (a, b) =>
      a.tier - b.tier ||
      a.at - b.at ||
      a.name.length - b.name.length ||
      a.name.localeCompare(b.name),
  );

  return scored.map(({ item, at }) => ({ item, at }));
}
