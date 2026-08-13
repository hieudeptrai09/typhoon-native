import CountryFlag from "@/lib/components/CountryFlag";
import FrownError from "@/lib/components/FrownError";
import NameDetailsContent from "@/lib/components/NameDetailsContent";
import NameStatusIcon from "@/lib/components/NameStatusIcon";
import StormCard from "@/lib/components/StormCard";
import StormStats from "@/lib/components/StormStats";
import type { RetiredName, RetirementReason, SearchDetail, Storm, TyphoonName } from "@/lib/types";
import { getNameStatusBgClass, getNameStatusColorClass } from "@/lib/utils/colors";
import { isExternalPosition } from "@/lib/utils/position";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface InfoPageContentProps {
  detail: SearchDetail | null;
  name: string;
  isError?: boolean;
  allNames?: string[];
}

function StatusBadge({
  isInPosition,
  isRetired,
  retirementReason,
}: {
  isInPosition: boolean;
  isRetired: boolean;
  retirementReason?: RetirementReason;
}) {
  const status = { isRetired, retirementReason, isExternal: !isInPosition };
  const label = !isInPosition
    ? "External name"
    : retirementReason === "misspell"
      ? "Misspelling"
      : isRetired
        ? "Retired"
        : "Active";
  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-semibold ${getNameStatusBgClass(status)} ${getNameStatusColorClass(status)}`}
    >
      {label}
    </span>
  );
}

function NameDetailsSection({
  name,
  correctSpelling,
}: {
  name: TyphoonName | RetiredName;
  correctSpelling?: string;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-foreground">Name Details</h2>
      {/* The page header already carries the status badge. */}
      <NameDetailsContent name={name} correctSpelling={correctSpelling} hideStatus />
    </section>
  );
}

function InfoPagination({ names, currentIndex }: { names: string[]; currentIndex: number }) {
  if (names.length === 0 || currentIndex === -1) return null;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === names.length - 1;
  const prevName = names[isFirst ? names.length - 1 : currentIndex - 1];
  const nextName = names[isLast ? 0 : currentIndex + 1];

  const linkClass =
    "flex items-center gap-1 rounded-lg border border-sky-700 bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-sky-800 hover:bg-sky-800";

  return (
    <nav
      className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6"
      aria-label="Name pagination"
    >
      <a href={`/info/${prevName.toLowerCase()}`} className={linkClass}>
        <ChevronLeft className="h-4 w-4" />
        <span className="capitalize">{prevName.toLowerCase()}</span>
      </a>
      <span className="text-sm text-foreground">{names[currentIndex]}</span>
      <a href={`/info/${nextName.toLowerCase()}`} className={linkClass}>
        <span className="capitalize">{nextName.toLowerCase()}</span>
        <ChevronRight className="h-4 w-4" />
      </a>
    </nav>
  );
}

function StormsSection({ storms }: { storms: Storm[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-foreground">All Storms ({storms.length})</h2>

      {storms.length === 0 ? (
        <p className="py-4 text-center text-foreground">No storms found for this name.</p>
      ) : (
        <div className="space-y-6">
          <StormStats storms={storms} />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {storms.map((storm, idx) => (
              <StormCard key={idx} storm={storm} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function InfoPageContent({
  detail,
  name,
  isError = false,
  allNames = [],
}: InfoPageContentProps) {
  if (isError) {
    return <FrownError />;
  }

  const nameData = detail?.name ?? null;
  const storms = detail?.storms ?? [];
  const isInPosition = nameData ? !isExternalPosition(nameData.position) : false;
  const displayName = nameData?.name ?? name;

  const titleColorClass = nameData
    ? getNameStatusColorClass({ ...nameData, isExternal: !isInPosition })
    : "text-foreground";
  const isRetired = nameData?.isRetired ?? false;

  const correctSpelling = storms[0]?.correctSpelling;
  const metaCountry = nameData?.country ?? storms[0]?.country;
  const metaPosition = nameData?.position ?? storms[0]?.position;
  const currentIndex = allNames.findIndex((n) => n.toLowerCase() === displayName.toLowerCase());

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <div className="mb-3 flex items-center gap-3">
        <NameStatusIcon
          isRetired={isRetired}
          retirementReason={nameData?.retirementReason}
          position={isInPosition ? nameData?.position : 0}
          size={28}
        />
        <h1 className={`text-3xl font-bold capitalize ${titleColorClass}`}>
          {displayName.toLowerCase()}
        </h1>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        {metaCountry &&
          (isInPosition ? (
            <CountryFlag country={metaCountry} className="h-5 w-8" />
          ) : (
            <span className="text-base font-semibold text-foreground">{metaCountry}</span>
          ))}
        {isInPosition && metaPosition != null && (
          <span className="text-base text-foreground">#{metaPosition}</span>
        )}
        <StatusBadge
          isInPosition={isInPosition}
          isRetired={isRetired}
          retirementReason={nameData?.retirementReason}
        />
      </div>

      <div className="space-y-6">
        {isInPosition && nameData && (
          <NameDetailsSection name={nameData} correctSpelling={correctSpelling} />
        )}
        <StormsSection storms={storms} />
      </div>

      <InfoPagination names={allNames} currentIndex={currentIndex} />
    </div>
  );
}
