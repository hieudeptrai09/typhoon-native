import type { SortCriterion } from "@/lib/utils/table";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type Store = Record<string, SortCriterion[]>;

const SortMemoryContext = createContext<{ current: Store } | null>(null);

// Switching views unmounts the list, which would otherwise throw away the sort the user just set up.
export const SortMemoryProvider = ({ children }: { children: ReactNode }) => {
  const store = useRef<Store>({});
  return <SortMemoryContext.Provider value={store}>{children}</SortMemoryContext.Provider>;
};

/**
 * Remembered criteria when the list names a `key` inside a provider, plain local state otherwise.
 * Only the one mounted list owning a key ever writes it, so a re-render tick is enough to publish
 * the change.
 */
export const useSortMemory = (
  key?: string,
  initial: SortCriterion[] = [],
): [SortCriterion[], (criteria: SortCriterion[]) => void] => {
  const store = useContext(SortMemoryContext);
  const [local, setLocal] = useState<SortCriterion[]>(initial);
  const [, tick] = useState(0);

  const remembered = store !== null && key !== undefined;

  const set = useCallback(
    (criteria: SortCriterion[]) => {
      if (!remembered) {
        setLocal(criteria);
        return;
      }
      store.current[key] = criteria;
      tick((count) => count + 1);
    },
    [remembered, store, key],
  );

  return [remembered ? (store.current[key] ?? initial) : local, set];
};
