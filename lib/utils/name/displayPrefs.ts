export interface NamesDisplayPrefs {
  showLetterNav: boolean;
}

export const NAMES_DISPLAY_COOKIE = "namesDisplay";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const defaultDisplayPrefs: NamesDisplayPrefs = {
  showLetterNav: false,
};

export const parseDisplayPrefs = (raw: string | undefined): NamesDisplayPrefs => {
  if (!raw) return defaultDisplayPrefs;

  try {
    // Tolerates both encoded and already-decoded values, since cookie decoding
    // differs between the server reader and document.cookie.
    const parsed: unknown = JSON.parse(decodeURIComponent(raw));
    if (typeof parsed !== "object" || parsed === null) return defaultDisplayPrefs;

    const prefs = parsed as Record<keyof NamesDisplayPrefs, unknown>;
    return {
      showLetterNav: prefs.showLetterNav === true,
    };
  } catch {
    return defaultDisplayPrefs;
  }
};

export const writeDisplayPrefs = (prefs: NamesDisplayPrefs) => {
  const value = encodeURIComponent(JSON.stringify(prefs));
  document.cookie = `${NAMES_DISPLAY_COOKIE}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
};
