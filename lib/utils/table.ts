export type SortKey = string | number;
export type SortDirection = "ascend" | "descend";

export interface SortCriterion {
  key: SortKey;
  order: SortDirection;
}

export const nextCriteria = (
  current: SortCriterion[],
  reported: SortCriterion[],
  additive: boolean,
): SortCriterion[] => {
  const reportedKeys = new Set(reported.map((criterion) => criterion.key));
  const cleared = current.find((criterion) => !reportedKeys.has(criterion.key));

  if (cleared) {
    return current.filter((criterion) => criterion.key !== cleared.key);
  }

  const clicked = reported[reported.length - 1];
  if (!clicked) return [];
  if (!additive) return [clicked];

  // Re-clicking an existing criterion flips its direction but keeps its rank.
  return current.some((criterion) => criterion.key === clicked.key)
    ? current.map((criterion) => (criterion.key === clicked.key ? clicked : criterion))
    : [...current, clicked];
};

export const sortPriority = (rank: number, total: number): number =>
  rank === -1 ? 0 : total - rank;
