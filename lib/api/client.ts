import Constants from "expo-constants";
import { useCallback, useEffect, useRef, useState } from "react";

// Mirrors the envelope that be/http.ts json() writes. Redeclared here instead of imported from
// @/be so the screen bundle never pulls in the server module and its env lookups.
interface ApiEnvelope<T> {
  data: T;
}

/**
 * Expo's fetch polyfill resolves a relative path against the dev server in development and against
 * the expo-router `origin` in a release build. A release build without that origin fails every
 * request with an opaque URL error, which reads as "the server is down" — so name the real cause,
 * once, at startup. See app.config.ts for where the value comes from.
 */
const originError = ((): string | null => {
  if (__DEV__) return null;

  const router = Constants.expoConfig?.extra?.router as
    { origin?: unknown; generatedOrigin?: unknown } | undefined;

  if (typeof router?.origin === "string" || typeof router?.generatedOrigin === "string") {
    return null;
  }
  return "This build has no API origin. Set EXPO_PUBLIC_API_ORIGIN (see eas.json) and rebuild.";
})();

if (originError) {
  console.error(`[api] ${originError}`);
}

export interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  isNotFound: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

const idle = {
  data: null,
  isLoading: false,
  isError: false,
  isNotFound: false,
  isRefetching: false,
} as const;

/**
 * A null `path` means "nothing to ask for yet": the screen is still validating its params, or the
 * query only applies to a view the user hasn't opened. `path` stays relative so the same call
 * works against the dev server and the deployed one.
 */
export function useApiQuery<T>(path: string | null): QueryState<T> {
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<Omit<QueryState<T>, "refetch">>(idle);
  // A refetch asks the same question again, so the answer already on screen stays valid until the
  // new one lands. A new path asks a different question and must clear it.
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (path === null) {
      lastPath.current = null;
      setState(idle);
      return;
    }

    if (originError) {
      setState({ ...idle, isError: true });
      return;
    }

    const controller = new AbortController();
    const samePath = lastPath.current === path;
    lastPath.current = path;

    setState((current) => {
      // Only a refresh over something already on screen is quiet. Retrying from an error page has
      // nothing to keep, so it is a fresh load and says so.
      const refreshing = samePath && current.data !== null;
      return {
        data: refreshing ? current.data : null,
        isLoading: !refreshing,
        isError: false,
        isNotFound: false,
        isRefetching: refreshing,
      };
    });

    const settled = { isLoading: false, isRefetching: false };

    fetch(path, { signal: controller.signal })
      .then(async (response) => {
        // The routes answer 404 for "no such name/position", which is a real state the screen
        // renders rather than an error to retry.
        if (response.status === 404) {
          setState({ data: null, isError: false, isNotFound: true, ...settled });
          return;
        }
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }

        const body = (await response.json()) as ApiEnvelope<T>;
        setState({ data: body.data, isError: false, isNotFound: false, ...settled });
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        // A failed refresh keeps what it was refreshing: replacing a working screen with a full
        // error page punishes the pull gesture. Callers holding data decide how to say so quietly.
        setState((current) => ({
          data: current.data,
          isError: true,
          isNotFound: false,
          ...settled,
        }));
      });

    return () => controller.abort();
  }, [path, nonce]);

  const refetch = useCallback(() => setNonce((value) => value + 1), []);

  return { ...state, refetch };
}
