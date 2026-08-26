import CountryFlag from "@/lib/components/common/CountryFlag";
import DataList, { DataCard } from "@/lib/components/common/DataList";
import IntensityBadge from "@/lib/components/storm/IntensityBadge";
import { SORTING_RANK } from "@/lib/constants";
import type { IntensityType, Storm } from "@/lib/types";
import { parseStormDate } from "@/lib/utils/date";
import { getPositionTitle } from "@/lib/utils/position";
import type { SortField } from "@/lib/utils/table";
import { useMemo } from "react";

interface StormRow {
  name: string;
  year: number;
  intensity: IntensityType;
  position: number;
  country: string;
  startMonth: number;
  startYear: number;
}

// A storm carried over from the previous season sorts before every January storm.
const monthSortKey = (row: StormRow): number => (row.startYear < row.year ? 0 : row.startMonth);

const BASE_SORT_FIELDS: SortField<StormRow>[] = [
  { key: "name", label: "Name", compare: (a, b) => a.name.localeCompare(b.name) },
  { key: "year", label: "Year", compare: (a, b) => a.year - b.year },
  { key: "month", label: "Month", compare: (a, b) => monthSortKey(a) - monthSortKey(b) },
];

const INTENSITY_SORT_FIELD: SortField<StormRow> = {
  key: "intensity",
  label: "Intensity",
  compare: (a, b) => SORTING_RANK[a.intensity] - SORTING_RANK[b.intensity],
};

const TAIL_SORT_FIELDS: SortField<StormRow>[] = [
  {
    key: "country",
    label: "Contributed by",
    compare: (a, b) => a.country.localeCompare(b.country),
  },
  { key: "position", label: "Position", compare: (a, b) => a.position - b.position },
];

const toRow = (storm: Storm): StormRow => {
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
};

interface StormRowsListProps {
  storms: Storm[];
  sortKey: string;
  /** Off where every row shares one intensity — the badge would repeat what the view already states. */
  showIntensity?: boolean;
}

const StormRowsList = ({ storms, sortKey, showIntensity = true }: StormRowsListProps) => {
  const data = useMemo(() => storms.map(toRow), [storms]);
  const sortFields = useMemo(
    () =>
      showIntensity
        ? [...BASE_SORT_FIELDS, INTENSITY_SORT_FIELD, ...TAIL_SORT_FIELDS]
        : [...BASE_SORT_FIELDS, ...TAIL_SORT_FIELDS],
    [showIntensity],
  );

  return (
    <DataList<StormRow>
      data={data}
      keyExtractor={(row) => `${row.name}-${row.year}`}
      sortFields={sortFields}
      sortKey={sortKey}
      countLabel={(count) => `${count} storm${count === 1 ? "" : "s"}`}
      renderCard={(row, index) => (
        <DataCard
          ordinal={index + 1}
          title={row.name}
          subtitle={`${row.startMonth}/${row.startYear}`}
          fields={[
            ...(showIntensity
              ? [
                  {
                    label: "Intensity",
                    value: <IntensityBadge intensity={row.intensity} size={28} />,
                  },
                ]
              : []),
            { label: "Year", value: String(row.year) },
            { label: "Position", value: getPositionTitle(row.position) },
            {
              label: "Contributed by",
              value: <CountryFlag country={row.country} size={16} showName />,
            },
          ]}
        />
      )}
    />
  );
};

export default StormRowsList;
