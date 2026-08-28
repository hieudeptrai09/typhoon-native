type AsyncFn<A extends unknown[], R> = (...args: A) => Promise<R>;

interface Entry<R> {
  value: Promise<R>;
  expiresAt: number;
}

export interface CacheOptions {
  revalidate: number;
}

// Some entries are keyed by a name taken straight from the URL, so the key space is bounded by
// what callers ask for rather than by the data, and needs a ceiling.
const MAX_ENTRIES = 500;

const store = new Map<string, Entry<unknown>>();

export function cached<A extends unknown[], R>(
  fn: AsyncFn<A, R>,
  keyParts: string[],
  options: CacheOptions,
): AsyncFn<A, R> {
  const prefix = keyParts.join(":");
  const ttlMs = options.revalidate * 1000;

  return (...args: A): Promise<R> => {
    const key = `${prefix}(${JSON.stringify(args)})`;
    const now = Date.now();

    const hit = store.get(key) as Entry<R> | undefined;
    if (hit && hit.expiresAt > now) {
      return hit.value;
    }

    // The promise is stored rather than the resolved value, so callers arriving during a cold miss
    // share one round trip instead of each issuing their own.
    const value = fn(...args).catch((error: unknown) => {
      // A rejection must not be cached, or one blip poisons the key for the whole TTL.
      store.delete(key);
      throw error;
    });

    store.set(key, { value, expiresAt: now + ttlMs });

    // Map iterates in insertion order, so the first key is the oldest.
    if (store.size > MAX_ENTRIES) {
      const oldest = store.keys().next();
      if (!oldest.done) store.delete(oldest.value);
    }

    return value;
  };
}

export function clearCache(): void {
  store.clear();
}
