import type { Storm } from "@/lib/types";
import { parseStormDate } from "@/lib/utils/date";

export const getHighlights = (stormsData: Storm[], type: string): Storm[] => {
  if (type === "strongest") {
    return stormsData.filter((storm) => storm.isStrongest);
  } else if (type === "first") {
    return stormsData.filter((storm) => storm.isFirst);
  } else if (type === "last") {
    return stormsData.filter((storm) => storm.isLast);
  } else if (type === "untracked") {
    return stormsData.filter((storm) => storm.intensity === "NT");
  }
  return [];
};

export const getEffectiveMonth = (storm: Storm): number | null => {
  if (storm.year < 2000) return null;
  const start = parseStormDate(storm.dateStart);
  // A storm carried over from the previous season counts toward January.
  return start.year < storm.year ? 1 : start.month;
};
