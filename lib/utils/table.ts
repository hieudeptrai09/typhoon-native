export type SortKey = string;
export type SortDirection = "ascend" | "descend";

export interface SortCriterion {
  key: SortKey;
  order: SortDirection;
}

export interface SortField<T> {
  key: SortKey;
  label: string;
  compare: (a: T, b: T) => number;
}

// Flipping direction keeps the field's rank, so tuning one criterion never reshuffles the rest
// of a multi-criteria sort.
export const cycleCriterion = (current: SortCriterion[], key: SortKey): SortCriterion[] => {
  const existing = current.find((criterion) => criterion.key === key);
  if (!existing) return [...current, { key, order: "ascend" }];
  if (existing.order === "ascend") {
    return current.map((criterion) =>
      criterion.key === key ? { key, order: "descend" as const } : criterion,
    );
  }
  return current.filter((criterion) => criterion.key !== key);
};

// A view swapping its filter swaps its sort fields too, so criteria can outlive
// the field they name.
export const liveCriteria = <T>(
  criteria: SortCriterion[],
  fields: SortField<T>[],
): SortCriterion[] =>
  criteria.filter((criterion) => fields.some((field) => field.key === criterion.key));

export const applySort = <T>(rows: T[], criteria: SortCriterion[], fields: SortField<T>[]): T[] => {
  const active = criteria.flatMap((criterion) => {
    const field = fields.find((candidate) => candidate.key === criterion.key);
    return field ? [{ compare: field.compare, order: criterion.order }] : [];
  });
  if (active.length === 0) return rows;

  return [...rows].sort((a, b) => {
    for (const { compare, order } of active) {
      const diff = compare(a, b);
      if (diff !== 0) return order === "ascend" ? diff : -diff;
    }
    return 0;
  });
};
