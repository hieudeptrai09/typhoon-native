import type { Storm } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";

export const hasHighlight = (storm: Storm): boolean =>
  storm.isStrongest === true || storm.isFirst === true || storm.isLast === true;

const BADGE_CLASS =
  "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] leading-none font-semibold";

const StormHighlightBadges = ({ storm }: { storm: Storm }) => {
  if (!hasHighlight(storm)) return null;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {storm.isStrongest && (
        <span className={`${BADGE_CLASS} bg-rose-200 text-rose-700`}>
          <Ionicons name="flash-outline" size={10} color="#be123c" /> Strongest
        </span>
      )}
      {storm.isFirst && (
        <span className={`${BADGE_CLASS} bg-blue-200 text-blue-700`}>
          <Ionicons name="medal-outline" size={10} color="#1d4ed8" /> First
        </span>
      )}
      {storm.isLast && (
        <span className={`${BADGE_CLASS} bg-orange-200 text-orange-700`}>
          <Ionicons name="download-outline" size={10} color="#c2410c" /> Last
        </span>
      )}
    </div>
  );
};

export default StormHighlightBadges;
