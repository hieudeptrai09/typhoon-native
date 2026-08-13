import {
  defaultDisplayPrefs,
  readDisplayPrefs,
  type NamesDisplayPrefs,
} from "@/lib/utils/name/displayPrefs";
import { useEffect, useState } from "react";

/**
 * Device storage is async, so the first render always uses the defaults and the stored value
 * arrives a tick later. The views seed their own state from what they are handed, so this is
 * returned rather than pushed into them.
 */
export const useDisplayPrefs = (): NamesDisplayPrefs & { isLoaded: boolean } => {
  const [prefs, setPrefs] = useState<NamesDisplayPrefs>(defaultDisplayPrefs);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    readDisplayPrefs().then((stored) => {
      if (cancelled) return;
      setPrefs(stored);
      setIsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { ...prefs, isLoaded };
};
