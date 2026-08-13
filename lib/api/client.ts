import { useCallback, useEffect, useState } from "react";

// Mirrors the envelope that be/http.ts json() writes. Redeclared here instead of imported from
// @/be so the screen bundle never pulls in the server module and its env lookups.
interface ApiEnvelope<T> {
  data: T;
}

export interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  isNotFound: boolean;
  refetch: () => void;
}

const idle = { data: null, isLoading: false, isError: false, isNotFound: false } as const;

/**
 * Reads one of the `+api.ts` routes. A null path means "nothing to ask for yet" — the screen is
 * still validating its params, or this query only applies to a view the user hasn't opened.
 *
 * The relative path resolves against the Expo Router origin: the dev server under `npx expo start`,
 * and the `origin` option on the expo-router plugin in a release build. Without that option set,
 * a standalone build has nothing to resolve against.
 */
export function useApiQuery<T>(path: string | null): QueryState<T> {
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<Omit<QueryState<T>, "refetch">>(idle);

  useEffect(() => {
    if (path === null) {
      setState(idle);
      return;
    }

    const controller = new AbortController();
    setState({ data: null, isLoading: true, isError: false, isNotFound: false });

    fetch(path, { signal: controller.signal })
      .then(async (response) => {
        // The routes answer 404 for "no such name/position", which is a real state the screen
        // renders rather than an error to retry.
        if (response.status === 404) {
          setState({ data: null, isLoading: false, isError: false, isNotFound: true });
          return;
        }
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }

        const body = (await response.json()) as ApiEnvelope<T>;
        setState({ data: body.data, isLoading: false, isError: false, isNotFound: false });
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setState({ data: null, isLoading: false, isError: true, isNotFound: false });
      });

    return () => controller.abort();
  }, [path, nonce]);

  const refetch = useCallback(() => setNonce((value) => value + 1), []);

  return { ...state, refetch };
}
