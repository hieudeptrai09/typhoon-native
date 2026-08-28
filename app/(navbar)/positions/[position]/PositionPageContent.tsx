import CountryFlag from "@/lib/components/CountryFlag";
import EmptyResults from "@/lib/components/EmptyResults";
import FrownError from "@/lib/components/FrownError";
import ImageCredit from "@/lib/components/ImageCredit";
import ImageWithLoader from "@/lib/components/ImageWithLoader";
import StormCard from "@/lib/components/StormCard";
import StormStats from "@/lib/components/StormStats";
import type { PositionDetail, RetiredName, Storm, TyphoonName } from "@/lib/types";
import {
  BACKGROUND_BADGE,
  getDistanceColor,
  getNameStatusColor,
  getNameStatusColorClass,
  TEXT_COLOR_WHITE_BACKGROUND,
} from "@/lib/utils/colors";
import { getPositionSlug, getPositionTitle } from "@/lib/utils/position";
import {
  calculateAverage,
  calculateGapAverage,
  formatDistance,
  getGroupedStorms,
  getIntensityFromNumber,
  sortNamesByFirstYear,
} from "@/lib/utils/storms";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";

interface PositionPageContentProps {
  detail: PositionDetail | null;
  position: number;
  isError?: boolean;
}

const TOTAL_POSITIONS = 143;

function PositionPagination({ position }: { position: number }) {
  const isFirst = position === 1;
  const isLast = position === TOTAL_POSITIONS;
  const prevPosition = isFirst ? TOTAL_POSITIONS : position - 1;
  const nextPosition = isLast ? 1 : position + 1;

  const linkClass = (isWrap: boolean) =>
    `flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-semibold text-white transition-colors ${
      isWrap
        ? "border-gray-500 bg-gray-500 hover:border-slate-600 hover:bg-slate-600"
        : "border-sky-700 bg-sky-700 hover:border-sky-800 hover:bg-sky-800"
    }`;

  return (
    <nav
      className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6"
      aria-label="Position pagination"
    >
      <a href={`/positions/${getPositionSlug(prevPosition)}`} className={linkClass(isFirst)}>
        <ChevronLeft className="h-4 w-4" />
        {getPositionTitle(prevPosition)}
      </a>
      <span className="text-sm text-foreground">
        {position} / {TOTAL_POSITIONS}
      </span>
      <a href={`/positions/${getPositionSlug(nextPosition)}`} className={linkClass(isLast)}>
        {getPositionTitle(nextPosition)}
        <ChevronRight className="h-4 w-4" />
      </a>
    </nav>
  );
}

function NameTimelineItem({ name, storms }: { name: TyphoonName | RetiredName; storms: Storm[] }) {
  const years = storms.map((s) => s.year);
  const firstYear = years.length > 0 ? Math.min(...years) : undefined;
  const lastStormYear = years.length > 0 ? Math.max(...years) : undefined;
  const retiredYear = "lastYear" in name && name.lastYear ? name.lastYear : lastStormYear;
  const replacementName =
    "replacementName" in name && name.replacementName ? name.replacementName : undefined;
  const note = "note" in name && name.note ? name.note : undefined;
  const isSucceeded = name.isRetired || !!replacementName;

  let era: string;
  if (firstYear === undefined) {
    era = isSucceeded ? "Never used" : "Awaiting first storm";
  } else if (isSucceeded) {
    era = firstYear === retiredYear ? `${firstYear}` : `${firstYear} – ${retiredYear}`;
  } else {
    era = `${firstYear} – present`;
  }

  return (
    <li className="relative pb-8 pl-8 last:pb-0">
      <span
        className="absolute top-0.5 left-0 h-4 w-4 rounded-full border-2 border-white shadow"
        style={{ backgroundColor: getNameStatusColor(name) }}
        aria-hidden="true"
      />
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{era}</div>
          <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <a
              href={`/info/${name.name.toLowerCase()}`}
              className={`text-lg font-bold hover:underline ${getNameStatusColorClass(name)}`}
            >
              {name.name}
            </a>
            {name.originalText && (
              <span className="text-base text-foreground">{name.originalText}</span>
            )}
            {name.language && <span className="text-xs text-slate-500">· {name.language}</span>}
          </div>
          {name.meaning && <p className="mt-0.5 text-sm text-teal-600 italic">{name.meaning}</p>}

          {/* The era above already ends at the retirement year, so it isn't repeated here. */}
          {isSucceeded && (
            <p className={`mt-2 text-xs ${getNameStatusColorClass(name)}`}>
              {name.isRetired ? "Retired" : "Replaced"}
            </p>
          )}
          {note && <p className="mt-0.5 text-xs text-slate-500 italic">{note}</p>}
        </div>

        {name.image && (
          <div className="w-32 shrink-0 sm:w-40">
            <div
              className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
              style={{ aspectRatio: "4/3" }}
            >
              <ImageWithLoader
                src={name.image}
                alt={name.name}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        )}
      </div>
      {name.image && <ImageCredit credit={name.imageCredit} align="end" />}
    </li>
  );
}

function NamesSection({ names, storms }: { names: TyphoonName[]; storms: Storm[] }) {
  const stormsByName: Record<string, Storm[]> = {};
  storms.forEach((storm) => {
    if (!stormsByName[storm.name]) stormsByName[storm.name] = [];
    stormsByName[storm.name].push(storm);
  });

  const sortKey = (name: TyphoonName | RetiredName) => {
    const years = (stormsByName[name.name] || []).map((s) => s.year);
    if (years.length > 0) return Math.min(...years);
    if ("lastYear" in name && name.lastYear) return name.lastYear;
    return Infinity;
  };
  const sortedNames = [...names].sort((a, b) => sortKey(a) - sortKey(b));

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-foreground">Name Timeline ({names.length})</h2>
      {names.length === 0 ? (
        <p className="py-4 text-center text-foreground">
          No names have been assigned to this slot.
        </p>
      ) : (
        <ol className="ml-2 border-l-2 border-slate-200 [&>li]:-ml-[9px]">
          {sortedNames.map((name) => (
            <NameTimelineItem key={name.id} name={name} storms={stormsByName[name.name] || []} />
          ))}
        </ol>
      )}
    </section>
  );
}

function StormsSection({ storms }: { storms: Storm[] }) {
  if (storms.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-foreground">All Storms (0)</h2>
        <p className="py-4 text-center text-foreground">No storms recorded at this position.</p>
      </section>
    );
  }

  const nameGroups = sortNamesByFirstYear(Object.entries(getGroupedStorms(storms, "name"))).map(
    ([name, group]) => {
      const sorted = [...group].sort((a, b) => a.year - b.year);
      return {
        name,
        storms: sorted,
        average: calculateAverage(sorted),
        count: sorted.length,
        recurrence: calculateGapAverage(sorted),
      };
    },
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-foreground">All Storms ({storms.length})</h2>
      <div className="space-y-6">
        <StormStats storms={storms} />

        {nameGroups.map((group) => {
          const intensityLabel = getIntensityFromNumber(group.average);
          return (
            <div key={group.name}>
              <div
                className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md bg-slate-50 px-3 py-2"
                style={{ borderLeft: `4px solid ${BACKGROUND_BADGE[intensityLabel]}` }}
              >
                <span className="font-semibold text-foreground">{group.name}</span>
                <div className="flex flex-wrap gap-3 text-sm text-foreground">
                  <span>
                    Count: <span className="font-semibold text-foreground">{group.count}</span>
                  </span>
                  <span>
                    Avg:{" "}
                    <span
                      className="font-semibold"
                      style={{ color: TEXT_COLOR_WHITE_BACKGROUND[intensityLabel] }}
                    >
                      {group.average.toFixed(2)}
                    </span>
                  </span>
                  {/* A lone storm leaves no gap to measure, so the stat is left off entirely. */}
                  {group.recurrence >= 0 && (
                    <span>
                      Every:{" "}
                      <span
                        className="font-semibold"
                        style={{ color: getDistanceColor(group.recurrence) }}
                      >
                        {formatDistance(group.recurrence)}
                      </span>{" "}
                      yrs
                    </span>
                  )}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.storms.map((storm, idx) => (
                  <StormCard key={idx} storm={storm} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function PositionPageContent({
  detail,
  position,
  isError = false,
}: PositionPageContentProps) {
  if (isError) {
    return <FrownError />;
  }
  if (!detail || (detail.names.length === 0 && detail.storms.length === 0)) {
    return <EmptyResults icon={SearchX} description="No data recorded for this position yet." />;
  }

  const { country, names, storms } = detail;
  const positionTitle = getPositionTitle(position);
  const titleColor =
    storms.length > 0
      ? TEXT_COLOR_WHITE_BACKGROUND[getIntensityFromNumber(calculateAverage(storms))]
      : "#64748b";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <div className="mb-8 flex items-baseline gap-3">
        {position <= 140 && <CountryFlag country={country} className="h-6 w-9" />}
        <h1 className="text-3xl font-bold" style={{ color: titleColor }}>
          {positionTitle}
        </h1>
        {position <= 140 && <span className="text-base text-foreground">{country}</span>}
      </div>

      <div className="space-y-6">
        {position <= 140 && <NamesSection names={names} storms={storms} />}
        <StormsSection storms={storms} />
      </div>

      <PositionPagination position={position} />
    </div>
  );
}
