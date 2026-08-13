import AsyncStorage from "@react-native-async-storage/async-storage";

export interface NamesDisplayPrefs {
  showLetterNav: boolean;
}

export const NAMES_DISPLAY_KEY = "namesDisplay";

export const defaultDisplayPrefs: NamesDisplayPrefs = {
  showLetterNav: false,
};

export const parseDisplayPrefs = (raw: string | undefined): NamesDisplayPrefs => {
  if (!raw) return defaultDisplayPrefs;

  try {
    // Still tolerates percent-encoded values so prefs written by the web build's cookie
    // survive if they are ever migrated across.
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

export const readDisplayPrefs = async (): Promise<NamesDisplayPrefs> => {
  try {
    return parseDisplayPrefs((await AsyncStorage.getItem(NAMES_DISPLAY_KEY)) ?? undefined);
  } catch {
    return defaultDisplayPrefs;
  }
};

// Fire-and-forget: a display toggle is not worth blocking the tap on, and a failed write only
// costs the preference at next launch.
export const writeDisplayPrefs = (prefs: NamesDisplayPrefs) => {
  AsyncStorage.setItem(NAMES_DISPLAY_KEY, JSON.stringify(prefs)).catch(() => {});
};
