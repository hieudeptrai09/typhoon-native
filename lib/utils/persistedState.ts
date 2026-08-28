import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * State that survives a cold start. The first render always uses `initial`: reading storage is
 * async, so a screen that waited for it would flash a spinner on every launch. `ready` says
 * whether the stored value has landed, for callers that must not write before it does.
 */
export const usePersistedState = <T>(key: string, initial: T): [T, (value: T) => void, boolean] => {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  // A write that beats the initial read must win, or restoring would undo the user's first tap.
  const written = useRef(false);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(key)
      .then((stored) => {
        if (cancelled || written.current || stored === null) return;
        setValue(JSON.parse(stored) as T);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  const store = useCallback(
    (next: T) => {
      written.current = true;
      setValue(next);
      AsyncStorage.setItem(key, JSON.stringify(next)).catch(() => undefined);
    },
    [key],
  );

  return [value, store, ready];
};
