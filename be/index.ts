// The SQL for these calls lives in db/functions.sql rather than here: the server runtime has no
// raw TCP sockets, so it cannot speak the Postgres wire protocol and reaches the data over HTTP.
//
// Import only from `+api.ts` route handlers — never from a screen or component.

export interface ApiResponse<T> {
  data: T;
}

export interface ApiListResponse<T> extends ApiResponse<T> {
  count: number;
}

const TIMEOUT_MS = 15_000;

interface Config {
  url: string;
  key: string;
}

function getConfig(): Config {
  const url = process.env.SUPABASE_URL;
  // The anon key was renamed to the publishable key; both are accepted so an older .env still works.
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be set. See .env.example.");
  }

  return { url: url.replace(/\/$/, ""), key };
}

// `args` keys must match the function parameter names in db/functions.sql, which are prefixed `p_`
// so they cannot collide with column names inside the function bodies.
async function call<T>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const { url, key } = getConfig();

  const response = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(args),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`RPC ${fn} failed: ${response.status} ${response.statusText} ${detail}`.trim());
  }

  return (await response.json()) as T;
}

const rpc = { call };

export default rpc;
