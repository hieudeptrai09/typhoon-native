import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const KEY = "search:recent-names";
const LIMIT = 8;

/**
 * The names a user opened from search, newest first.
 *
 * Matching happens as you type, so there is no submit to record — the tap that opens a result is
 * the only moment a query is known to have meant something. Storing the name rather than the text
 * typed also makes the entry directly re-openable.
 */
export function useRecentNames() {
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;

    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!alive || raw === null) return;
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return;

        setNames(
          parsed.filter((entry): entry is string => typeof entry === "string").slice(0, LIMIT),
        );
      })
      // History is a convenience: an unreadable or half-written store just means there is none.
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  const remember = useCallback((name: string) => {
    setNames((current) => {
      const next = [
        name,
        ...current.filter((entry) => entry.toLowerCase() !== name.toLowerCase()),
      ].slice(0, LIMIT);

      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setNames([]);
    AsyncStorage.removeItem(KEY).catch(() => {});
  }, []);

  return { names, remember, clear };
}
