import { runCached } from "@/lib/api/cache";
import { NotFoundError } from "@/lib/data/rpc";
import { useCallback, useEffect, useRef, useState } from "react";

export interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  isNotFound: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

export interface QueryOptions {
  // Seconds. The reference data moves when the naming committee meets, so an hour is generous
  // without ever showing a season that has already changed.
  ttl?: number;
}

const DEFAULT_TTL = 3600;

const idle = {
  data: null,
  isLoading: false,
  isError: false,
  isNotFound: false,
  isRefetching: false,
} as const;

// A null `key` means "nothing to ask for yet". Two calls sharing a key share the cached answer, so
// the key must identify the request, arguments included.
export function useQuery<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: QueryOptions = {},
): QueryState<T> {
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<Omit<QueryState<T>, "refetch">>(idle);
  // A refetch asks the same question again, so the answer already on screen stays valid until the
  // new one lands. A new key asks a different question and must clear it.
  const lastKey = useRef<string | null>(null);
  // The fetcher closes over render values and so is a new function every render; reading it through
  // a ref keeps it out of the effect's dependencies, which would otherwise restart every request.
  const run = useRef(fetcher);
  run.current = fetcher;
  const forceNext = useRef(false);

  const ttl = options.ttl ?? DEFAULT_TTL;

  useEffect(() => {
    if (key === null) {
      lastKey.current = null;
      setState(idle);
      return;
    }

    let cancelled = false;
    const sameKey = lastKey.current === key;
    lastKey.current = key;

    const force = forceNext.current;
    forceNext.current = false;

    setState((current) => {
      // Retrying from an error page has nothing to keep, so it is a fresh load, not a quiet refresh.
      const refreshing = sameKey && current.data !== null;
      return {
        data: refreshing ? current.data : null,
        isLoading: !refreshing,
        isError: false,
        isNotFound: false,
        isRefetching: refreshing,
      };
    });

    const settled = { isLoading: false, isRefetching: false };

    runCached(key, { ttl, force }, run.current)
      .then((data) => {
        if (cancelled) return;
        setState({ data, isError: false, isNotFound: false, ...settled });
      })
      .catch((error: unknown) => {
        if (cancelled) return;

        if (error instanceof NotFoundError) {
          setState({ data: null, isError: false, isNotFound: true, ...settled });
          return;
        }

        console.error(`[data] ${key}`, error);
        // A failed refresh keeps what it was refreshing; callers holding data decide how to say so.
        setState((current) => ({
          data: current.data,
          isError: true,
          isNotFound: false,
          ...settled,
        }));
      });

    // The request is left to finish and fill the cache — another screen may be awaiting the same
    // promise, so it must not be aborted here.
    return () => {
      cancelled = true;
    };
  }, [key, nonce, ttl]);

  const refetch = useCallback(() => {
    forceNext.current = true;
    setNonce((value) => value + 1);
  }, []);

  return { ...state, refetch };
}
