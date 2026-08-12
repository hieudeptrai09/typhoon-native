import ImageWithLoader from "@/lib/components/ImageWithLoader";
import StormHighlightBadges, { hasHighlight } from "@/lib/components/StormHighlightBadges";
import { INTENSITY_LABEL } from "@/lib/constants";
import type { Storm } from "@/lib/types";
import { BACKGROUND_BADGE, TEXT_COLOR_BADGE } from "@/lib/utils/colors";
import { formatStormDateRange } from "@/lib/utils/date";
import { getZoomEarthUrl } from "@/lib/utils/format";
import { Calendar, ExternalLink, Hash, ImageOff } from "lucide-react";

const StormCard = ({ storm }: { storm: Storm }) => {
  const bgColor = BACKGROUND_BADGE[storm.intensity];
  const textColor = TEXT_COLOR_BADGE[storm.intensity];
  const label = INTENSITY_LABEL[storm.intensity];
  const hasMap = storm.map && storm.map.trim() !== "";
  const dateRange = formatStormDateRange(storm.dateStart, storm.dateEnd);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex h-28 flex-col justify-center px-4" style={{ backgroundColor: bgColor }}>
        {hasHighlight(storm) && (
          <div className="mb-1.5">
            <StormHighlightBadges storm={storm} />
          </div>
        )}
        <span className="text-sm leading-tight font-bold" style={{ color: textColor }}>
          {label} {storm.name}
        </span>
        {storm.jtwcDesignation && (
          <div className="mt-1 flex items-center gap-1.5">
            <Hash size={12} style={{ color: textColor }} />
            <span className="text-xs font-semibold" style={{ color: textColor }}>
              {storm.jtwcDesignation}
            </span>
          </div>
        )}
        <div className="mt-1 flex items-center gap-1.5">
          <Calendar size={12} style={{ color: textColor }} />
          <span className="text-xs font-semibold" style={{ color: textColor }}>
            {dateRange}
          </span>
        </div>
      </div>
      <div className="relative h-44 w-full bg-slate-50">
        {hasMap ? (
          <ImageWithLoader
            src={storm.map}
            alt={`${storm.name} ${storm.year} track`}
            fill
            className="object-contain"
            unoptimized
          />
        ) : (
          <div
            role="img"
            aria-label="No image available"
            className="@container flex h-full w-full flex-col items-center justify-center gap-1.5 p-2 text-center text-gray-400"
          >
            <ImageOff className="h-1/4 w-1/4 min-h-6 min-w-6" strokeWidth={1.5} aria-hidden />
            <span aria-hidden className="hidden text-xs font-medium @[7rem]:block">
              No track map
            </span>
          </div>
        )}
      </div>
      <div className="border-t border-slate-100 px-4 py-2">
        <a
          href={getZoomEarthUrl(storm.name, storm.year)}
          target="_blank"
          rel="noopener noreferrer"
          title={`View ${storm.name} ${storm.year} on Zoom Earth`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:underline"
        >
          Zoom Earth
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
};

export default StormCard;
