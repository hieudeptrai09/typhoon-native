"use client";

import CountryFlag from "@/lib/components/CountryFlag";
import DefModal from "@/lib/components/DefModal";
import EmptyResults from "@/lib/components/EmptyResults";
import FrownError from "@/lib/components/FrownError";
import ImageCredit from "@/lib/components/ImageCredit";
import ImageWithLoader from "@/lib/components/ImageWithLoader";
import StormStats from "@/lib/components/StormStats";
import Tabs, { type Tab } from "@/lib/components/Tabs";
import { INTENSITY_LABEL } from "@/lib/constants";
import type { PositionDetail, Storm, TyphoonName } from "@/lib/types";
import {
  BACKGROUND_BADGE,
  getDistanceColor,
  getNameStatusColorClass,
  TEXT_COLOR_WHITE_BACKGROUND,
} from "@/lib/utils/colors";
import { formatStormDateRange } from "@/lib/utils/date";
import { getZoomEarthUrl } from "@/lib/utils/format";
import { getPositionTitle } from "@/lib/utils/position";
import {
  calculateAverage,
  calculateGapAverage,
  formatDistance,
  getGroupedStorms,
  getIntensityFromNumber,
  sortNamesByFirstYear,
} from "@/lib/utils/storms";
import { Carousel as AntCarousel } from "antd";
import { Calendar, ExternalLink, ImageOff, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

interface PositionModalProps {
  detail: PositionDetail | null;
  position: number;
  isError?: boolean;
}

type TabType = "names" | "storms";

function Carousel({ slides }: { slides: ReactNode[] }) {
  if (slides.length === 0) return null;

  // A lone slide has nowhere to go, so drop the controls entirely.
  const hasControls = slides.length > 1;

  return (
    <AntCarousel rootClassName="carousel-light" arrows={hasControls} dots={hasControls}>
      {slides}
    </AntCarousel>
  );
}

/** One name slide: "Name (country): meaning" above its image. */
function NameSlide({ name }: { name: TyphoonName }) {
  return (
    <div className="px-2">
      <p className="text-sm mb-3 text-center leading-relaxed">
        <span className={`font-bold ${getNameStatusColorClass(name)}`}>{name.name}</span>
        {name.country && <span className="text-foreground"> ({name.language}): </span>}
        {name.meaning && <span className="text-foreground italic">{name.meaning}</span>}
      </p>
      {name.image && (
        <div className="mx-auto w-full max-w-sm">
          <div className="relative aspect-4/3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <ImageWithLoader
              src={name.image}
              alt={name.name}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <ImageCredit credit={name.imageCredit} />
        </div>
      )}
    </div>
  );
}

function StormGridCard({ storm }: { storm: Storm }) {
  const accent = TEXT_COLOR_WHITE_BACKGROUND[storm.intensity];
  const label = INTENSITY_LABEL[storm.intensity];
  const dateRange = formatStormDateRange(storm.dateStart, storm.dateEnd);
  const hasMap = !!storm.map && storm.map.trim() !== "";

  return (
    <div className="rounded-md bg-slate-50 p-2">
      {hasMap ? (
        <div className="relative aspect-4/3 w-full overflow-hidden rounded bg-white">
          <ImageWithLoader
            src={storm.map}
            alt={`${storm.name} ${storm.year} track`}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex h-20 items-center justify-center gap-1.5 rounded bg-slate-100 text-xs text-slate-400">
          <ImageOff size={14} />
        </div>
      )}
      <div className="mt-2 space-y-1">
        <div className="text-sm leading-tight font-bold" style={{ color: accent }}>
          {label} {storm.name}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-foreground">
          <Calendar size={12} className="shrink-0" />
          {dateRange}
        </div>
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

export default function PositionModal({ detail, position, isError = false }: PositionModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("names");

  const isInternal = position <= 140;
  const positionTitle = getPositionTitle(position);
  const country = detail?.country ?? "";
  const names = detail?.names ?? [];
  const storms = detail?.storms ?? [];

  const isEmpty = !detail || (names.length === 0 && storms.length === 0);

  const titleColor =
    storms.length > 0
      ? TEXT_COLOR_WHITE_BACKGROUND[getIntensityFromNumber(calculateAverage(storms))]
      : "#64748b";

  const title: ReactNode = (
    <div className="flex items-center gap-3">
      {isInternal && country && <CountryFlag country={country} className="h-6 w-9" />}
      <span className="text-2xl font-bold" style={{ color: titleColor }}>
        {positionTitle}
      </span>
    </div>
  );

  const stormsPanel = (
    <div>
      {storms.length > 0 && (
        <div className="mb-4 space-y-3">
          <span className="text-lg font-bold text-foreground">All Storms ({storms.length})</span>
          <StormStats storms={storms} />
        </div>
      )}
      {storms.length === 0 ? (
        <p className="py-4 text-center text-foreground">No storms recorded at this position.</p>
      ) : (
        <div className="space-y-6">
          {sortNamesByFirstYear(Object.entries(getGroupedStorms(storms, "name"))).map(
            ([name, group]) => {
              const sorted = [...group].sort((a, b) => a.year - b.year);
              const average = calculateAverage(sorted);
              const groupIntensity = getIntensityFromNumber(average);
              const recurrence = calculateGapAverage(sorted);
              return (
                <div key={name}>
                  <div
                    className="mb-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-md bg-slate-50 py-2 pr-4 pl-3"
                    style={{
                      borderLeftWidth: 4,
                      borderLeftColor: BACKGROUND_BADGE[groupIntensity],
                    }}
                  >
                    <span className="font-semibold text-foreground">{name}</span>
                    <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground">
                      <span>
                        Count:{" "}
                        <span className="font-semibold text-foreground">{sorted.length}</span>
                      </span>
                      <span title={INTENSITY_LABEL[groupIntensity]}>
                        Avg:{" "}
                        <span
                          className="font-bold"
                          style={{ color: TEXT_COLOR_WHITE_BACKGROUND[groupIntensity] }}
                        >
                          {average.toFixed(2)}
                        </span>
                      </span>
                      {/* A lone storm leaves no gap to measure, so the stat is left off entirely. */}
                      {recurrence >= 0 && (
                        <span>
                          Every:{" "}
                          <span
                            className="font-bold"
                            style={{ color: getDistanceColor(recurrence) }}
                          >
                            {formatDistance(recurrence)}
                          </span>{" "}
                          yrs
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {sorted.map((storm, idx) => (
                      <StormGridCard key={idx} storm={storm} />
                    ))}
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}
    </div>
  );

  let content: ReactNode;

  if (isError) {
    content = <FrownError />;
  } else if (isEmpty) {
    content = <EmptyResults icon={SearchX} description="No data recorded for this position yet." />;
  } else {
    const tabs: Tab<TabType>[] = [
      {
        key: "names",
        label: `Names (${names.length})`,
        content: (
          <div>
            {names.length === 0 ? (
              <p className="py-4 text-center text-foreground">
                No names have been assigned to this slot.
              </p>
            ) : (
              <Carousel
                slides={names.map((name) => (
                  <NameSlide key={name.id} name={name} />
                ))}
              />
            )}
          </div>
        ),
      },
      { key: "storms", label: `Storms (${storms.length})`, content: stormsPanel },
    ];

    content = (
      <div className="pt-4">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          ariaLabel="Position details tabs"
          idPrefix="position-modal-tab"
        />
      </div>
    );
  }

  return (
    <DefModal onClose={() => router.back()} title={title} width={600}>
      {content}
    </DefModal>
  );
}
