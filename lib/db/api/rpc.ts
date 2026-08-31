// One POST per call to Supabase's PostgREST RPC endpoint. The functions in db/functions.sql are
// SECURITY DEFINER and granted to `anon`, so the publishable key reaches exactly those and nothing
// else — the tables live in a schema PostgREST does not expose.

// Metro inlines EXPO_PUBLIC_* at build time only when written as a literal member expression, so
// these cannot be read through a helper or a computed key.
const URL_BASE = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "") ?? "";
const KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

// A build without credentials fails on every screen with an opaque fetch error that reads as "the
// server is down", so name the real cause once at startup.
export const configError =
  URL_BASE && KEY
    ? null
    : "This build has no Supabase credentials. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY (see .env.example) and rebuild.";

if (configError) {
  console.error(`[data] ${configError}`);
}

// Thrown for "no such name/position" — a real state a screen renders, not an error to retry.
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

const TIMEOUT_MS = 15_000;

// `args` keys must match the function parameter names in db/functions.sql, which are prefixed `p_`
// so they cannot collide with column names inside the function bodies.
export async function rpc<T>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  if (configError) throw new Error(configError);

  // React Native's AbortSignal ponyfill has no `AbortSignal.timeout`, so the timer is manual.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${URL_BASE}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(args),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(
        `RPC ${fn} failed: ${response.status} ${response.statusText} ${detail}`.trim(),
      );
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}
