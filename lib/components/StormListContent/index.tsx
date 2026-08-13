"use client";

import CountryFlag from "@/lib/components/CountryFlag";
import EmptyResults from "@/lib/components/EmptyResults";
import ImageWithLoader from "@/lib/components/ImageWithLoader";
import StormHighlightBadges, { hasHighlight } from "@/lib/components/StormHighlightBadges";
import StormStats from "@/lib/components/StormStats";
import { INTENSITY_LABEL } from "@/lib/constants";
import type { Storm } from "@/lib/types";
import { BACKGROUND_BADGE, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/utils/colors";
import { formatStormDateRange } from "@/lib/utils/date";
import { getZoomEarthUrl } from "@/lib/utils/format";
import { isExternalPosition } from "@/lib/utils/position";
import { Switch } from "antd";
import { ExternalLink, Inbox } from "lucide-react";
import { useState } from "react";

export interface StormListContentProps {
  storms: Storm[];
}

function StormRow({ storm, showMap }: { storm: Storm; showMap: boolean }) {
  const borderColor = BACKGROUND_BADGE[storm.intensity];
  const textColor = TEXT_COLOR_WHITE_BACKGROUND[storm.intensity];
  const label = INTENSITY_LABEL[storm.intensity];
  const hasMap = storm.map && storm.map.trim() !== "";
  const dateRange = formatStormDateRange(storm.dateStart, storm.dateEnd);

  return (
    <div
      className="rounded-md px-3 py-2 transition-colors hover:bg-gray-50"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      {showMap && hasMap && (
        <div className="relative mb-2 h-48 w-full">
          <ImageWithLoader
            src={storm.map}
            alt={`${storm.name} ${storm.year} track`}
            fill
            className="rounded border border-gray-200 object-contain"
            unoptimized
          />
        </div>
      )}
      {hasHighlight(storm) && (
        <div className="mb-1.5">
          <StormHighlightBadges storm={storm} />
        </div>
      )}
      <div className="text-sm font-bold" style={{ color: textColor }}>
        {label} {storm.name}
        {storm.jtwcDesignation && ` (${storm.jtwcDesignation})`}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-2">
        <span className="text-xs text-foreground">{dateRange}</span>
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
}

const StormListContent = ({ storms }: StormListContentProps) => {
  const [showMap, setShowMap] = useState(false);

  if (storms.length === 0) {
    return <EmptyResults icon={Inbox} description="No storms found for this name." />;
  }

  const isInternal = !isExternalPosition(storms[0].position);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-gray-200 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-foreground">
            {isInternal && <CountryFlag country={storms[0].country} className="h-5 w-8" />}
            <span>{storms[0].country}</span>
            {isInternal && <span className="text-gray-400">· #{storms[0].position}</span>}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-foreground">Show Map</span>
            <Switch checked={showMap} onChange={setShowMap} aria-label="Show storm track map" />
          </div>
        </div>
        <StormStats storms={storms} />
      </div>

      <div>
        <h3 id="storm-list-heading" className="mb-3 font-semibold text-foreground">
          All Storms ({storms.length})
        </h3>
        <div className="space-y-1" aria-describedby="storm-list-heading">
          {storms.map((storm, idx) => (
            <StormRow key={`${storm.year}-${storm.name}-${idx}`} storm={storm} showMap={showMap} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StormListContent;
