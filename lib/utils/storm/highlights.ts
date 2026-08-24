import type { IntensityType, Storm, StormHighlight } from "@/lib/types";
import { parseStormDate } from "@/lib/utils/date";

// Matched by name, not by index: the list is refetched under the rotation, so a `current` that is
// gone from the new list excludes nothing and the draw covers all of it. `current` comes back only
// when it is the last storm standing.
export const pickAnotherHighlight = (
  list: StormHighlight[],
  current: string | null,
): string | null => {
  if (list.length === 0) return null;

  const others = list.filter((storm) => storm.name !== current);
  if (others.length === 0) return list[0].name;

  return others[Math.floor(Math.random() * others.length)].name;
};

export const getHighlights = (stormsData: Storm[], type: string): Storm[] => {
  if (type === "strongest") {
    return stormsData.filter((storm) => storm.isStrongest);
  } else if (type === "first") {
    return stormsData.filter((storm) => storm.isFirst);
  } else if (type === "last") {
    return stormsData.filter((storm) => storm.isLast);
  }
  return [];
};

export const getStormsByIntensity = (
  stormsData: Storm[],
  intensity: IntensityType | null,
): Storm[] =>
  intensity === null ? [] : stormsData.filter((storm) => storm.intensity === intensity);

export const getEffectiveMonth = (storm: Storm): number | null => {
  if (storm.year < 2000) return null;
  const start = parseStormDate(storm.dateStart);
  // A storm carried over from the previous season counts toward January.
  return start.year < storm.year ? 1 : start.month;
};
