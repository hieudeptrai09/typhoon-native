export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export interface CachePolicy {
  sMaxAge: number;
  staleWhileRevalidate: number;
}

// Tiers follow how often the data actually moves: storms change during a season, the naming lists
// only when the committee meets.
export const CACHE = {
  reference: { sMaxAge: 3600, staleWhileRevalidate: 86400 },
  seasonal: { sMaxAge: 300, staleWhileRevalidate: 3600 },
  volatile: { sMaxAge: 60, staleWhileRevalidate: 300 },
} as const satisfies Record<string, CachePolicy>;

function cacheHeader(policy?: CachePolicy): string {
  if (!policy) return "no-store";
  return `public, s-maxage=${policy.sMaxAge}, stale-while-revalidate=${policy.staleWhileRevalidate}`;
}

export function json<T>(data: T, policy?: CachePolicy): Response {
  return Response.json(data, {
    headers: { "Cache-Control": cacheHeader(policy) },
  });
}

export interface ErrorBody {
  error: { code: string; message: string };
}

export function errorResponse(status: number, code: string, message: string): Response {
  const body: ErrorBody = { error: { code, message } };
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export const notFound = (message: string) => errorResponse(404, "not_found", message);

export function route<P extends Record<string, string> = Record<string, string>>(
  handler: (request: Request, params: P) => Promise<Response>,
): (request: Request, params: P) => Promise<Response> {
  return async (request, params) => {
    try {
      return await handler(request, params);
    } catch (error) {
      if (error instanceof HttpError) {
        return errorResponse(error.status, error.code, error.message);
      }
      // Unexpected errors are logged but never returned: the message can carry connection details.
      console.error(`[api] ${request.method} ${request.url}`, error);
      return errorResponse(500, "internal_error", "Something went wrong on our end.");
    }
  };
}

// --- Parameter parsing -------------------------------------------------------------------------

export function optionalInt(url: URL, key: string): number | null {
  const raw = url.searchParams.get(key);
  if (raw === null || raw.trim() === "") return null;

  const value = Number(raw);
  if (!Number.isInteger(value)) {
    throw new HttpError(400, "invalid_param", `"${key}" must be an integer.`);
  }
  return value;
}

export function requiredInt(url: URL, key: string): number {
  const value = optionalInt(url, key);
  if (value === null) {
    throw new HttpError(400, "missing_param", `"${key}" is required.`);
  }
  return value;
}

const MAX_QUERY_LENGTH = 100;

export function requiredString(url: URL, key: string): string {
  const raw = (url.searchParams.get(key) ?? "").trim();
  if (raw === "") {
    throw new HttpError(400, "missing_param", `"${key}" is required.`);
  }
  if (raw.length > MAX_QUERY_LENGTH) {
    throw new HttpError(400, "invalid_param", `"${key}" must be ${MAX_QUERY_LENGTH} characters or fewer.`);
  }
  return raw;
}

export interface DayMonth {
  day: number;
  month: number;
}

export function readDayMonth(url: URL): DayMonth {
  const day = optionalInt(url, "day");
  const month = optionalInt(url, "month");

  // The fallback is UTC, so clients should send their own local date — near midnight the two
  // differ and the user expects their own day.
  if (day === null && month === null) {
    const now = new Date();
    return { day: now.getUTCDate(), month: now.getUTCMonth() + 1 };
  }

  // Out of range is rejected rather than silently defaulted, so a client bug stays visible.
  if (day === null || month === null) {
    throw new HttpError(400, "invalid_param", '"day" and "month" must be provided together.');
  }
  if (day < 1 || day > 31) {
    throw new HttpError(400, "invalid_param", '"day" must be between 1 and 31.');
  }
  if (month < 1 || month > 12) {
    throw new HttpError(400, "invalid_param", '"month" must be between 1 and 12.');
  }

  return { day, month };
}
