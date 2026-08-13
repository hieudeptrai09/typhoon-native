import CountryFlag from "@/lib/components/common/CountryFlag";
import DataList, { DataCard } from "@/lib/components/common/DataList";
import HighlightsGrid from "@/lib/components/dashboard/grids/HighlightsGrid";
import IntensityBadge from "@/lib/components/storm/IntensityBadge";
import { SORTING_RANK } from "@/lib/constants";
import type { DashboardParams, IntensityType, Storm } from "@/lib/types";
import { parseStormDate } from "@/lib/utils/date";
import { getPositionTitle } from "@/lib/utils/position";
import { getHighlights } from "@/lib/utils/storm/highlights";
import type { SortField } from "@/lib/utils/table";

interface HighlightsViewProps {
  params: DashboardParams;
  stormsData: Storm[];
}

interface HighlightRow {
  name: string;
  year: number;
  intensity: IntensityType;
  position: number;
  country: string;
  startMonth: number;
  startYear: number;
}

// A storm carried over from the previous season sorts before every January storm.
const monthSortKey = (row: HighlightRow): number => (row.startYear < row.year ? 0 : row.startMonth);

const sortFields: SortField<HighlightRow>[] = [
  { key: "name", label: "Name", compare: (a, b) => a.name.localeCompare(b.name) },
  { key: "year", label: "Year", compare: (a, b) => a.year - b.year },
  { key: "month", label: "Month", compare: (a, b) => monthSortKey(a) - monthSortKey(b) },
  {
    key: "intensity",
    label: "Intensity",
    compare: (a, b) => SORTING_RANK[a.intensity] - SORTING_RANK[b.intensity],
  },
  {
    key: "country",
    label: "Contributed by",
    compare: (a, b) => a.country.localeCompare(b.country),
  },
  { key: "position", label: "Position", compare: (a, b) => a.position - b.position },
];

const HighlightsView = ({ params, stormsData }: HighlightsViewProps) => {
  const highlights = getHighlights(stormsData, params.filter);

  if (params.mode === "table") {
    return (
      <HighlightsGrid
        stormsData={stormsData}
        highlightedStorms={highlights}
        highlightType={params.filter}
      />
    );
  }

  const highlightData: HighlightRow[] = highlights.map((storm) => {
    const start = parseStormDate(storm.dateStart);
    return {
      name: storm.name,
      year: storm.year,
      intensity: storm.intensity,
      position: storm.position,
      country: storm.country,
      startMonth: start.month,
      startYear: start.year,
    };
  });

  return (
    <DataList<HighlightRow>
      data={highlightData}
      keyExtractor={(row) => `${row.name}-${row.year}`}
      sortFields={sortFields}
      countLabel={(count) => `${count} storm${count === 1 ? "" : "s"}`}
      renderCard={(row, index) => (
        <DataCard
          ordinal={index + 1}
          title={row.name}
          subtitle={`${row.startMonth}/${row.startYear}`}
          trailing={<IntensityBadge intensity={row.intensity} />}
          fields={[
            { label: "Year", value: String(row.year) },
            { label: "Position", value: getPositionTitle(row.position) },
            {
              label: "Contributed by",
              value: <CountryFlag country={row.country} size={16} showName />,
              wide: true,
            },
          ]}
        />
      )}
    />
  );
};

export default HighlightsView;
