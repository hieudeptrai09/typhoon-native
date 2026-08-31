interface Entry {
  value: Promise<unknown>;
  expiresAt: number;
}

// Keys are built from route params, so the key space is bounded by what the user browses to rather
// than by the data, and needs a ceiling.
const MAX_ENTRIES = 200;

const store = new Map<string, Entry>();

export interface CacheOptions {
  // Seconds. Zero means never cached — the answer is expected to have moved by the next ask.
  ttl: number;
  // Set by an explicit refresh, which means "get me the current data" and must not be answered
  // from the store.
  force: boolean;
}

export function runCached<T>(
  key: string,
  { ttl, force }: CacheOptions,
  fn: () => Promise<T>,
): Promise<T> {
  if (ttl <= 0) return fn();

  const now = Date.now();

  if (!force) {
    const hit = store.get(key);
    if (hit && hit.expiresAt > now) return hit.value as Promise<T>;
  }

  // The promise is stored rather than the resolved value, so the three screens that open on the
  // same storm list share one round trip instead of each issuing their own.
  const value = fn().catch((error: unknown) => {
    // A rejection must not be cached, or one blip poisons the key for the whole TTL.
    store.delete(key);
    throw error;
  });

  store.set(key, { value, expiresAt: now + ttl * 1000 });

  // Map iterates in insertion order, so the first key is the oldest.
  if (store.size > MAX_ENTRIES) {
    const oldest = store.keys().next();
    if (!oldest.done) store.delete(oldest.value);
  }

  return value;
}

export function clearCache(): void {
  store.clear();
}
