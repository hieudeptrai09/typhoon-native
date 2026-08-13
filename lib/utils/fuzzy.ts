function damerauLevenshtein(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const prevPrev = new Array<number>(bl + 1).fill(0); // row i-2 (for transpositions)
  const prev = new Array<number>(bl + 1); // row i-1
  const curr = new Array<number>(bl + 1); // row i

  for (let j = 0; j <= bl; j++) prev[j] = j;

  for (let i = 1; i <= al; i++) {
    curr[0] = i;
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let val = Math.min(
        prev[j] + 1, // deletion
        curr[j - 1] + 1, // insertion
        prev[j - 1] + cost, // substitution
      );
      // adjacent transposition
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        val = Math.min(val, prevPrev[j - 2] + 1);
      }
      curr[j] = val;
    }
    for (let j = 0; j <= bl; j++) {
      prevPrev[j] = prev[j];
      prev[j] = curr[j];
    }
  }

  return prev[bl];
}

/** Similarity in [0, 1]: 1 = identical, 0 = completely different. */
function similarity(a: string, b: string): number {
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - damerauLevenshtein(a, b) / maxLen;
}

interface SuggestionOptions {
  limit?: number;
  threshold?: number;
  minQueryLength?: number;
  window?: number;
}

export function topSuggestions(
  query: string,
  candidates: string[],
  { limit = 5, threshold = 0.4, minQueryLength = 3, window = 0.2 }: SuggestionOptions = {},
): string[] {
  const q = query.trim().toLowerCase();
  if (q.length < minQueryLength) return [];

  const scored = candidates
    .map((name) => ({ name, score: similarity(q, name.toLowerCase()) }))
    .filter((c) => c.score >= threshold)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  if (scored.length === 0) return [];

  const cutoff = scored[0].score - window;
  return scored
    .filter((c) => c.score >= cutoff)
    .slice(0, limit)
    .map((c) => c.name);
}
