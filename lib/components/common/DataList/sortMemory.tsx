import type { SortCriterion } from "@/lib/utils/table";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type Store = Record<string, SortCriterion[]>;

interface SortMemory {
  store: Store;
  remember: (key: string, criteria: SortCriterion[]) => void;
}

const SortMemoryContext = createContext<SortMemory | null>(null);

// Switching views unmounts the list, which would otherwise throw away the sort the user just set up.
export const SortMemoryProvider = ({ children }: { children: ReactNode }) => {
  const [store, setStore] = useState<Store>({});

  const remember = useCallback((key: string, criteria: SortCriterion[]) => {
    setStore((current) => ({ ...current, [key]: criteria }));
  }, []);

  const value = useMemo(() => ({ store, remember }), [store, remember]);

  return <SortMemoryContext.Provider value={value}>{children}</SortMemoryContext.Provider>;
};

// Remembered criteria when the list names a `key` inside a provider, plain local state otherwise.
export const useSortMemory = (
  key?: string,
  initial: SortCriterion[] = [],
): [SortCriterion[], (criteria: SortCriterion[]) => void] => {
  const memory = useContext(SortMemoryContext);
  const [local, setLocal] = useState<SortCriterion[]>(initial);

  const remembered = memory !== null && key !== undefined;

  const set = useCallback(
    (criteria: SortCriterion[]) => {
      if (!remembered) {
        setLocal(criteria);
        return;
      }
      memory.remember(key, criteria);
    },
    [remembered, memory, key],
  );

  return [remembered ? (memory.store[key] ?? initial) : local, set];
};
